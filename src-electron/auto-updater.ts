/**
 * 🚀 Smart Auto Updater
 * نظام التحديث التلقائي الذكي
 *
 * يستخدم إعدادات JSON منفصلة ويكتشف معلومات المشروع تلقائياً
 */

import { autoUpdater } from 'electron-updater';
import type { BrowserWindow } from 'electron';
import { app, dialog } from 'electron';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import log from 'electron-log';

// أنواع البيانات
interface UpdaterConfig {
  enabled: boolean;
  autoDownload: boolean;
  autoInstallOnAppQuit: boolean;
  checkForUpdatesOnStart: boolean;
  checkInterval: number;
  allowPrerelease: boolean;
  showNotifications: boolean;
  language: 'ar' | 'en';
  messages: {
    [key: string]: {
      checking: string;
      updateAvailable: string;
      updateNotAvailable: string;
      downloadProgress: string;
      updateDownloaded: string;
      installNow: string;
      installLater: string;
      error: string;
    };
  };
}

interface PackageInfo {
  name: string;
  version: string;
  productName: string;
  repository?: {
    type: string;
    url: string;
  };
}

export class SmartAutoUpdater {
  private config!: UpdaterConfig;
  private packageInfo!: PackageInfo;
  private mainWindow: BrowserWindow | null = null;
  private updateCheckTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.loadConfig();
    this.loadPackageInfo();
    this.setupAutoUpdater();
  }

  /**
   * تحميل إعدادات التحديث من ملف JSON
   */
  private loadConfig(): void {
    try {
      const configPath = join(process.cwd(), 'updater.config.json');

      if (existsSync(configPath)) {
        const configData = readFileSync(configPath, 'utf-8');
        this.config = JSON.parse(configData);
        log.info('✅ تم تحميل إعدادات التحديث من updater.config.json');
      } else {
        this.useDefaultConfig();
        log.info('⚠️ استخدام الإعدادات الافتراضية للتحديث');
      }
    } catch (error) {
      log.error('❌ خطأ في تحميل إعدادات التحديث:', error);
      this.useDefaultConfig();
    }
  }

  /**
   * تحميل معلومات المشروع تلقائياً من package.json
   */
  private loadPackageInfo(): void {
    try {
      const packagePath = join(process.cwd(), 'package.json');
      const packageData = readFileSync(packagePath, 'utf-8');
      this.packageInfo = JSON.parse(packageData);
      log.info('✅ تم تحميل معلومات المشروع تلقائياً');
    } catch (error) {
      log.error('❌ خطأ في تحميل معلومات المشروع:', error);
    }
  }

  /**
   * الإعدادات الافتراضية
   */
  private useDefaultConfig(): void {
    this.config = {
      enabled: true,
      autoDownload: true,
      autoInstallOnAppQuit: true,
      checkForUpdatesOnStart: true,
      checkInterval: 3600000, // ساعة واحدة
      allowPrerelease: false,
      showNotifications: true,
      language: 'ar',
      messages: {
        ar: {
          checking: 'جاري البحث عن تحديثات...',
          updateAvailable: 'يتوفر تحديث جديد',
          updateNotAvailable: 'التطبيق محدث',
          downloadProgress: 'جاري تحميل التحديث...',
          updateDownloaded: 'تم تحميل التحديث',
          installNow: 'تثبيت الآن',
          installLater: 'تثبيت لاحقاً',
          error: 'خطأ في التحديث',
        },
      },
    };
  }

  /**
   * إعداد نظام التحديث التلقائي
   */
  private setupAutoUpdater(): void {
    if (!this.config.enabled) {
      log.info('🔒 التحديث التلقائي معطل');
      return;
    }

    // إعداد نظام السجلات
    log.transports.file.level = 'info';
    autoUpdater.logger = log;

    // إعداد الخادم تلقائياً من package.json
    this.configureUpdateServer();

    // إعداد خيارات التحديث
    autoUpdater.autoDownload = this.config.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.config.autoInstallOnAppQuit;
    autoUpdater.allowPrerelease = this.config.allowPrerelease;

    // إعداد الأحداث
    this.setupEvents();

    // بدء فحص التحديثات
    if (this.config.checkForUpdatesOnStart) {
      setTimeout(() => this.checkForUpdates(), 5000); // انتظار 5 ثوان
    }

    // إعداد فحص دوري
    if (this.config.checkInterval > 0) {
      this.updateCheckTimer = setInterval(() => {
        this.checkForUpdates();
      }, this.config.checkInterval);
    }

    log.info('🚀 تم إعداد نظام التحديث التلقائي الذكي');
  }

  /**
   * إعداد خادم التحديث تلقائياً من معلومات المشروع
   */
  private configureUpdateServer(): void {
    if (!this.packageInfo?.repository?.url) {
      log.warn('⚠️ لم يتم العثور على معلومات المستودع في package.json');
      return;
    }

    const repoUrl = this.packageInfo.repository.url;
    const githubMatch = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);

    if (githubMatch) {
      const [, owner, repo] = githubMatch;

      autoUpdater.setFeedURL({
        provider: 'github',
        owner,
        repo,
        private: false,
      });

      log.info(`🔗 تم إعداد خادم التحديث تلقائياً: ${owner}/${repo}`);
    } else {
      log.warn('⚠️ تنسيق URL المستودع غير مدعوم (يجب أن يكون GitHub)');
    }
  }

  /**
   * تعيين النافذة الرئيسية
   */
  setMainWindow(window: BrowserWindow): void {
    this.mainWindow = window;
  }

  /**
   * إعداد أحداث التحديث التلقائي
   */
  private setupEvents(): void {
    // عند فحص التحديثات
    autoUpdater.on('checking-for-update', () => {
      const msg = this.getMessage('checking');
      log.info('🔍 ' + msg);
      this.sendToRenderer('update-checking');
    });

    // عند عدم وجود تحديثات
    autoUpdater.on('update-not-available', (info: unknown) => {
      const msg = this.getMessage('updateNotAvailable');
      log.info('✅ ' + msg);
      this.sendToRenderer('update-not-available', info);
    });

    // عند وجود تحديث متاح
    autoUpdater.on('update-available', (info: unknown) => {
      const updateInfo = info as { version: string };
      log.info('🆕 تحديث متاح:', updateInfo.version);
      this.sendToRenderer('update-available', info);

      if (this.config.showNotifications) {
        this.showUpdateAvailableDialog(info);
      }
    });

    // تقدم التحميل
    autoUpdater.on('download-progress', (progressObj: unknown) => {
      const progress = progressObj as {
        bytesPerSecond: number;
        percent: number;
        transferred: number;
        total: number;
      };

      log.info(`📥 تقدم التحميل: ${Math.round(progress.percent)}%`);
      this.sendToRenderer('download-progress', progressObj);
    });

    // عند اكتمال التحميل
    autoUpdater.on('update-downloaded', (info: unknown) => {
      const msg = this.getMessage('updateDownloaded');
      log.info('✅ ' + msg);
      this.sendToRenderer('update-downloaded', info);

      if (this.config.showNotifications) {
        this.showUpdateDownloadedDialog(info);
      }
    });

    // عند حدوث خطأ
    autoUpdater.on('error', (error: unknown) => {
      const errorMsg = (error as Error).message;
      log.error('❌ خطأ في التحديث:', errorMsg);
      this.sendToRenderer('update-error', errorMsg);

      if (this.config.showNotifications) {
        this.showUpdateErrorDialog(error as Error);
      }
    });
  }

  /**
   * الحصول على رسالة بالغة المحددة
   */
  private getMessage(key: string): string {
    const messages = this.config.messages[this.config.language];
    return (messages as Record<string, string>)?.[key] || key;
  }

  /**
   * إرسال رسالة إلى النافذة الرئيسية
   */
  private sendToRenderer(channel: string, data?: unknown): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('auto-updater', { type: channel, data });
    }
  }

  /**
   * حوار التحديث المتاح
   */
  private async showUpdateAvailableDialog(info: unknown): Promise<void> {
    if (!this.mainWindow) return;

    const updateInfo = info as { version: string };
    const response = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: this.getMessage('updateAvailable'),
      message: `${this.getMessage('updateAvailable')}: ${updateInfo.version}`,
      detail: 'هل تريد تحميل التحديث الآن؟',
      buttons: [this.getMessage('installNow'), this.getMessage('installLater')],
      defaultId: 0,
      cancelId: 1,
    });

    if (response.response === 0) {
      this.downloadUpdate();
    }
  }

  /**
   * حوار التحديث المحمل
   */
  private async showUpdateDownloadedDialog(info: unknown): Promise<void> {
    if (!this.mainWindow) return;

    const updateInfo = info as { version: string };
    const response = await dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: this.getMessage('updateDownloaded'),
      message: `${this.getMessage('updateDownloaded')}: ${updateInfo.version}`,
      detail: 'هل تريد إعادة تشغيل التطبيق الآن؟',
      buttons: [this.getMessage('installNow'), this.getMessage('installLater')],
      defaultId: 0,
      cancelId: 1,
    });

    if (response.response === 0) {
      this.installUpdate();
    }
  }

  /**
   * حوار خطأ التحديث
   */
  private async showUpdateErrorDialog(error: Error): Promise<void> {
    if (!this.mainWindow) return;

    await dialog.showMessageBox(this.mainWindow, {
      type: 'error',
      title: this.getMessage('error'),
      message: this.getMessage('error'),
      detail: error.message,
      buttons: ['موافق'],
      defaultId: 0,
    });
  }

  /**
   * فحص التحديثات يدوياً
   */
  public checkForUpdates(): void {
    if (!this.config.enabled) {
      log.info('🔒 التحديث التلقائي معطل');
      return;
    }

    if (app.isPackaged) {
      log.info('🔍 بدء فحص التحديثات...');
      autoUpdater.checkForUpdates();
    } else {
      log.info('🔧 وضع التطوير - تم تخطي فحص التحديثات');
    }
  }

  /**
   * تحميل التحديث يدوياً
   */
  public downloadUpdate(): void {
    autoUpdater.downloadUpdate();
  }

  /**
   * تثبيت التحديث وإعادة التشغيل
   */
  public installUpdate(): void {
    autoUpdater.quitAndInstall();
  }

  /**
   * تنظيف الموارد
   */
  public destroy(): void {
    if (this.updateCheckTimer) {
      clearInterval(this.updateCheckTimer);
      this.updateCheckTimer = null;
    }
  }
}

// إنشاء مثيل واحد للاستخدام العام
export const smartAutoUpdater = new SmartAutoUpdater();

// دوال مساعدة للاستخدام في main process
export const updaterAPI = {
  checkForUpdates: () => {
    autoUpdater.checkForUpdates();
  },

  downloadUpdate: () => {
    autoUpdater.downloadUpdate();
  },

  installUpdate: () => {
    autoUpdater.quitAndInstall();
  },

  getVersion: () => {
    return app.getVersion();
  },
};
