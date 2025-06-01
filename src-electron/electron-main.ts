import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import path from 'path';
import os from 'os';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { AutoUpdater, updaterAPI } from './auto-updater';
import { setupUTF8Encoding, setupConsoleUTF8, testArabicDisplay } from './encoding-setup';

// إعداد ترميز UTF-8 للـ console في Windows
setupUTF8Encoding();
setupConsoleUTF8();

// needed in case process is undefined under Linux
const platform = process.platform || os.platform();

const currentDir = fileURLToPath(new URL('.', import.meta.url));

let mainWindow: BrowserWindow | undefined;
let splashWindow: BrowserWindow | undefined;
let databaseWindow: BrowserWindow | undefined;
let connectionWindow: BrowserWindow | undefined;
let autoUpdater: AutoUpdater | undefined;

// نوع البيانات المسموح بها في سجلات Electron
type ElectronLogData = Record<string, unknown> | string | number | boolean | null | undefined;

// إعداد نظام تسجيل الأخطاء للـ Main Process
class ElectronLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    this.logDir = path.join(os.homedir(), 'AppData', 'Local', 'CRUD-SQL-Server', 'logs');
    this.logFile = path.join(this.logDir, `main-${new Date().toISOString().split('T')[0]}.log`);
    this.ensureLogDirectory();
    this.setupErrorHandlers();
  }

  private ensureLogDirectory() {
    try {
      if (!fs.existsSync(this.logDir)) {
        fs.mkdirSync(this.logDir, { recursive: true });
      }
    } catch (error) {
      console.error('فشل في إنشاء مجلد السجلات:', error);
    }
  }

  private formatMessage(level: string, message: string, data?: ElectronLogData): string {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` | البيانات: ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level}] [MAIN] ${message}${dataStr}\n`;
  }

  private writeToFile(message: string) {
    try {
      fs.appendFileSync(this.logFile, message, { encoding: 'utf8' });
    } catch (error) {
      console.error('فشل في كتابة السجل:', error);
    }
  }

  error(message: string, data?: ElectronLogData) {
    const logMessage = this.formatMessage('ERROR', message, data);
    console.error(logMessage.trim());
    this.writeToFile(logMessage);
  }

  warn(message: string, data?: ElectronLogData) {
    const logMessage = this.formatMessage('WARN', message, data);
    console.warn(logMessage.trim());
    this.writeToFile(logMessage);
  }

  info(message: string, data?: ElectronLogData) {
    const logMessage = this.formatMessage('INFO', message, data);
    console.info(logMessage.trim());
    this.writeToFile(logMessage);
  }

  debug(message: string, data?: ElectronLogData) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatMessage('DEBUG', message, data);
      console.debug(logMessage.trim());
      this.writeToFile(logMessage);
    }
  }

  private setupErrorHandlers() {
    // التعامل مع الأخطاء غير المعالجة
    process.on('uncaughtException', (error) => {
      this.error('خطأ غير معالج في Main Process', {
        message: error.message,
        stack: error.stack,
      });
    });

    process.on('unhandledRejection', (reason, promise) => {
      this.error('Promise مرفوض غير معالج في Main Process', {
        reason: reason,
        promise: promise,
      });
    });
  }
}

const electronLogger = new ElectronLogger();

/**
 * إعداد معالجات IPC للتواصل بين النوافذ
 */
function setupIpcHandlers(): void {
  // فتح نافذة قاعدة البيانات
  ipcMain.handle('open-database-window', async () => {
    try {
      electronLogger.info('طلب فتح نافذة قاعدة البيانات');

      if (databaseWindow && !databaseWindow.isDestroyed()) {
        // إذا كانت النافذة موجودة، اجعلها في المقدمة
        databaseWindow.focus();
        databaseWindow.show();
        electronLogger.info('تم التركيز على نافذة قاعدة البيانات الموجودة');
        return { success: true, message: 'تم التركيز على النافذة الموجودة' };
      } else {
        // إنشاء نافذة جديدة
        await createDatabaseWindow();
        electronLogger.info('تم إنشاء نافذة قاعدة البيانات جديدة');
        return { success: true, message: 'تم إنشاء نافذة جديدة' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في فتح نافذة قاعدة البيانات', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });

  // إغلاق نافذة قاعدة البيانات
  ipcMain.handle('close-database-window', () => {
    try {
      electronLogger.info('طلب إغلاق نافذة قاعدة البيانات');

      if (databaseWindow && !databaseWindow.isDestroyed()) {
        databaseWindow.close();
        electronLogger.info('تم إغلاق نافذة قاعدة البيانات');
        return { success: true, message: 'تم إغلاق النافذة' };
      }

      return { success: false, message: 'النافذة غير موجودة' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في إغلاق نافذة قاعدة البيانات', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });

  // التحقق من حالة نافذة قاعدة البيانات
  ipcMain.handle('is-database-window-open', () => {
    try {
      const isOpen = databaseWindow !== undefined && !databaseWindow.isDestroyed();
      electronLogger.debug('التحقق من حالة نافذة قاعدة البيانات', { isOpen });
      return { success: true, isOpen };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في التحقق من حالة نافذة قاعدة البيانات', { error: errorMessage });
      return { success: false, isOpen: false, message: errorMessage };
    }
  });

  // فتح النافذة الرئيسية
  ipcMain.handle('open-main-window', async () => {
    try {
      electronLogger.info('طلب فتح النافذة الرئيسية');

      if (mainWindow && !mainWindow.isDestroyed()) {
        // إذا كانت النافذة موجودة، اجعلها في المقدمة
        mainWindow.focus();
        mainWindow.show();
        electronLogger.info('تم التركيز على النافذة الرئيسية الموجودة');
        return { success: true, message: 'تم التركيز على النافذة الموجودة' };
      } else {
        // إنشاء نافذة جديدة
        await createMainWindow();
        electronLogger.info('تم إنشاء النافذة الرئيسية جديدة');
        return { success: true, message: 'تم إنشاء النافذة الرئيسية' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في فتح النافذة الرئيسية', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });

  // إغلاق نافذة اختبار الاتصال
  ipcMain.handle('close-connection-window', () => {
    try {
      electronLogger.info('طلب إغلاق نافذة اختبار الاتصال');

      if (connectionWindow && !connectionWindow.isDestroyed()) {
        connectionWindow.close();
        electronLogger.info('تم إغلاق نافذة اختبار الاتصال');
        return { success: true, message: 'تم إغلاق النافذة' };
      }

      return { success: false, message: 'النافذة غير موجودة' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في إغلاق نافذة اختبار الاتصال', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });

  // معالجات التحديث التلقائي
  ipcMain.handle('updater-check-for-updates', () => {
    try {
      electronLogger.info('طلب فحص التحديثات');
      updaterAPI.checkForUpdates();
      return { success: true, message: 'تم بدء فحص التحديثات' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في فحص التحديثات', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });

  ipcMain.handle('updater-download-update', () => {
    try {
      electronLogger.info('طلب تحميل التحديث');
      updaterAPI.downloadUpdate();
      return { success: true, message: 'تم بدء تحميل التحديث' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في تحميل التحديث', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });

  ipcMain.handle('updater-install-update', () => {
    try {
      electronLogger.info('طلب تثبيت التحديث');
      updaterAPI.installUpdate();
      return { success: true, message: 'تم بدء تثبيت التحديث' };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في تثبيت التحديث', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });

  ipcMain.handle('updater-get-version', () => {
    try {
      const version = updaterAPI.getVersion();
      electronLogger.info('طلب إصدار التطبيق', { version });
      return { success: true, version };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
      electronLogger.error('فشل في الحصول على إصدار التطبيق', { error: errorMessage });
      return { success: false, message: errorMessage };
    }
  });
}

/**
 * إنشاء نافذة Splash منفصلة
 */
function createSplashWindow(): void {
  try {
    splashWindow = new BrowserWindow({
      width: 400,
      height: 300,
      frame: false, // بدون إطار
      alwaysOnTop: true, // دائماً في المقدمة
      center: true, // توسيط النافذة
      resizable: false, // غير قابلة لتغيير الحجم
      show: false, // لا تظهر فوراً
      backgroundColor: '#1976d2', // لون Quasar الرسمي
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        preload: path.resolve(
          currentDir,
          path.join(
            process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
            'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
          ),
        ),
      },
    });

    electronLogger.info('تم إنشاء نافذة Splash بنجاح');

    // تحميل صفحة Splash منفصلة
    if (process.env.DEV) {
      splashWindow.loadURL(`${process.env.APP_URL}#/splash`);
    } else {
      splashWindow.loadFile('index.html', { hash: '/splash' });
    }

    // إظهار النافذة عند الجاهزية
    splashWindow.once('ready-to-show', () => {
      electronLogger.info('نافذة Splash جاهزة للعرض');
      splashWindow?.show();

      // إخفاء نافذة Splash بعد 4 ثوانٍ وبدء اختبار الاتصال
      setTimeout(() => {
        electronLogger.info('انتهاء Splash - بدء اختبار الاتصال بقاعدة البيانات');
        createConnectionWindow()
          .then(() => {
            electronLogger.info('سيتم إغلاق نافذة Splash');
            splashWindow?.close();
          })
          .catch((error) => {
            electronLogger.error('فشل في إنشاء نافذة اختبار الاتصال', { error });
            // في حالة الفشل، فتح النافذة الرئيسية مباشرة
            createMainWindow()
              .then(() => {
                splashWindow?.close();
              })
              .catch((mainError) => {
                electronLogger.error('فشل في إنشاء النافذة الرئيسية كبديل', { error: mainError });
              });
          });
      }, 4000);
    });

    // معالجة إغلاق نافذة Splash
    splashWindow.on('closed', () => {
      electronLogger.info('تم إغلاق نافذة Splash');
      splashWindow = undefined;
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    electronLogger.error('فشل في إنشاء نافذة Splash', { error: errorMessage });
  }
}

/**
 * إنشاء نافذة قاعدة البيانات منفصلة
 */
async function createDatabaseWindow(): Promise<void> {
  try {
    // التحقق من وجود النافذة الرئيسية
    if (!mainWindow) {
      throw new Error('النافذة الرئيسية غير موجودة');
    }

    // إنشاء نافذة قاعدة البيانات
    databaseWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 650,
      show: false,
      backgroundColor: '#1976d2',
      icon: path.resolve(currentDir, 'icons/icon.png'),
      title: 'إدارة قاعدة البيانات - CRUD SQL Server',
      parent: mainWindow, // نافذة فرعية من النافذة الرئيسية
      modal: false, // ليست modal لتسمح بالتفاعل مع النافذة الرئيسية
      center: true, // توسيط النافذة
      resizable: true, // قابلة لتغيير الحجم
      maximizable: true, // قابلة للتكبير
      minimizable: true, // قابلة للتصغير
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        preload: path.resolve(
          currentDir,
          path.join(
            process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
            'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
          ),
        ),
      },
    });

    electronLogger.info('تم إنشاء نافذة قاعدة البيانات بنجاح');

    // تحميل صفحة قاعدة البيانات
    if (process.env.DEV) {
      await databaseWindow.loadURL(`${process.env.APP_URL}#/database`);
    } else {
      await databaseWindow.loadFile('index.html', { hash: '/database' });
    }

    electronLogger.info('تم تحميل محتوى نافذة قاعدة البيانات');

    // إظهار النافذة عند الجاهزية
    databaseWindow.once('ready-to-show', () => {
      electronLogger.info('نافذة قاعدة البيانات جاهزة للعرض');
      databaseWindow?.show();
      databaseWindow?.focus();

      // فتح أدوات المطور في وضع التطوير فقط
      if (process.env.DEV) {
        databaseWindow?.webContents.openDevTools();
      }

      electronLogger.info('تم عرض نافذة قاعدة البيانات بنجاح');
    });

    // معالجة أحداث النافذة
    databaseWindow.on('closed', () => {
      electronLogger.info('تم إغلاق نافذة قاعدة البيانات');
      databaseWindow = undefined;
    });

    databaseWindow.webContents.on('did-finish-load', () => {
      electronLogger.info('تم تحميل محتوى نافذة قاعدة البيانات بنجاح');
    });

    databaseWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      electronLogger.error('فشل في تحميل محتوى نافذة قاعدة البيانات', {
        errorCode,
        errorDescription,
      });
    });

    // إظهار النافذة فوراً للتأكد من ظهورها
    databaseWindow.show();
    databaseWindow.focus();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    electronLogger.error('فشل في إنشاء نافذة قاعدة البيانات', { error: errorMessage });
    throw error;
  }
}

/**
 * إنشاء نافذة اختبار الاتصال بقاعدة البيانات
 */
async function createConnectionWindow(): Promise<void> {
  try {
    // إنشاء نافذة اختبار الاتصال
    connectionWindow = new BrowserWindow({
      width: 480,
      height: 420,
      minWidth: 480,
      minHeight: 420,
      maxWidth: 480,
      maxHeight: 420,
      show: false,
      backgroundColor: '#c0c0c0',
      icon: path.resolve(currentDir, 'icons/icon.png'),
      title: 'Connect to Server',
      center: true,
      resizable: false,
      maximizable: false,
      minimizable: true,
      frame: false,
      titleBarStyle: 'hidden',
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        preload: path.resolve(
          currentDir,
          path.join(
            process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
            'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
          ),
        ),
      },
    });

    electronLogger.info('تم إنشاء نافذة اختبار الاتصال بنجاح');

    // تحميل صفحة اختبار الاتصال
    if (process.env.DEV) {
      await connectionWindow.loadURL(`${process.env.APP_URL}#/connection`);
    } else {
      await connectionWindow.loadFile('index.html', { hash: '/connection' });
    }

    electronLogger.info('تم تحميل محتوى نافذة اختبار الاتصال');

    // إظهار النافذة عند الجاهزية
    connectionWindow.once('ready-to-show', () => {
      electronLogger.info('نافذة اختبار الاتصال جاهزة للعرض');
      connectionWindow?.show();
      connectionWindow?.focus();

      // فتح أدوات المطور في وضع التطوير فقط
      if (process.env.DEV) {
        connectionWindow?.webContents.openDevTools();
      }

      electronLogger.info('تم عرض نافذة اختبار الاتصال بنجاح');
    });

    // معالجة أحداث النافذة
    connectionWindow.on('closed', () => {
      electronLogger.info('تم إغلاق نافذة اختبار الاتصال');
      connectionWindow = undefined;
    });

    connectionWindow.webContents.on('did-finish-load', () => {
      electronLogger.info('تم تحميل محتوى نافذة اختبار الاتصال بنجاح');
    });

    connectionWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
      electronLogger.error('فشل في تحميل محتوى نافذة اختبار الاتصال', {
        errorCode,
        errorDescription,
      });
    });

    // إظهار النافذة فوراً للتأكد من ظهورها
    connectionWindow.show();
    connectionWindow.focus();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    electronLogger.error('فشل في إنشاء نافذة اختبار الاتصال', { error: errorMessage });
    throw error;
  }
}

/**
 * إنشاء النافذة الرئيسية للتطبيق
 */
async function createMainWindow() {
  electronLogger.info('بدء إنشاء النافذة الرئيسية');

  try {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: true, // إظهار النافذة فوراً
      backgroundColor: '#1976d2', // لون Quasar الرسمي أثناء التحميل
      icon: path.resolve(currentDir, 'icons/icon.png'),
      titleBarStyle: 'default',
      center: true, // توسيط النافذة
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        webSecurity: true,
        preload: path.resolve(
          currentDir,
          path.join(
            process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
            'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
          ),
        ),
      },
    });

    electronLogger.info('تم إنشاء النافذة الرئيسية بنجاح');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    electronLogger.error('فشل في إنشاء النافذة الرئيسية', { error: errorMessage });
    throw error;
  }

  // Load the app
  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL);
  } else {
    await mainWindow.loadFile('index.html');
  }

  // إظهار النافذة فوراً للتأكد من ظهورها
  electronLogger.info('إظهار النافذة الرئيسية فوراً');
  mainWindow.show();
  mainWindow.focus();

  // فتح أدوات المطور في وضع التطوير فقط
  if (process.env.DEV) {
    mainWindow.webContents.openDevTools();
  }

  // إظهار النافذة الرئيسية عند الجاهزية أيضاً
  mainWindow.once('ready-to-show', () => {
    electronLogger.info('النافذة الرئيسية جاهزة للعرض - ready-to-show event');
    mainWindow?.show();
    mainWindow?.focus();
    electronLogger.info('تم عرض النافذة الرئيسية بنجاح');

    // تهيئة نظام التحديث التلقائي
    if (mainWindow) {
      autoUpdater = new AutoUpdater(mainWindow);
      electronLogger.info('تم تهيئة نظام التحديث التلقائي');
    }
  });

  // معالجة أحداث النافذة الإضافية
  mainWindow.on('closed', () => {
    electronLogger.info('تم إغلاق النافذة الرئيسية');
    // تنظيف نظام التحديث التلقائي
    if (autoUpdater) {
      autoUpdater.destroy();
      autoUpdater = undefined;
    }
    mainWindow = undefined;
  });

  mainWindow.webContents.on('did-finish-load', () => {
    electronLogger.info('تم تحميل محتوى النافذة بنجاح');
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    electronLogger.error('فشل في تحميل محتوى النافذة', {
      errorCode,
      errorDescription,
    });
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools();
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow?.webContents.closeDevTools();
    });
  }

  mainWindow.on('closed', () => {
    mainWindow = undefined;
  });

  // التأكد من ظهور النافذة
  mainWindow.on('show', () => {
    console.log('النافذة ظهرت بنجاح');
  });

  // معالجة حالة إخفاء النافذة
  mainWindow.on('hide', () => {
    console.log('النافذة مخفية');
  });

  // Create application menu
  createMenu();
}

function createMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Handle new file
            mainWindow?.webContents.send('menu-new');
          },
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // Handle open file
            mainWindow?.webContents.send('menu-open');
          },
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'close' }],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Check for Updates',
          click: () => {
            electronLogger.info('طلب فحص التحديثات من القائمة');
            updaterAPI.checkForUpdates();
          },
        },
        {
          label: 'About',
          click: () => {
            mainWindow?.webContents.send('menu-about');
          },
        },
      ],
    },
  ];

  if (platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// إعدادات Electron لحل مشاكل cache والأداء
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');
app.commandLine.appendSwitch('--disable-gpu-sandbox');
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('--disable-dev-shm-usage');

void app.whenReady().then(() => {
  // اختبار عرض النصوص العربية
  testArabicDisplay();

  setupIpcHandlers();
  createSplashWindow();
});

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === undefined && splashWindow === undefined) {
    createSplashWindow();
  }
});
