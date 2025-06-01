/**
 * 🚀 Smart Auto Updater Manager
 * مدير التحديث التلقائي الذكي
 * 
 * يدير التحديثات التلقائية باستخدام إعدادات ذكية ومرنة
 */

import { autoUpdater, UpdateInfo } from 'electron-updater';
import { app, BrowserWindow, dialog, shell } from 'electron';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import log from 'electron-log';

// أنواع البيانات
interface AutoUpdaterConfig {
  version: string;
  description: string;
  updater: {
    enabled: boolean;
    autoDownload: boolean;
    autoInstallOnAppQuit: boolean;
    allowPrerelease: boolean;
    allowDowngrade: boolean;
    fullChangelog: boolean;
  };
  checking: {
    checkForUpdatesOnStart: boolean;
    checkInterval: number;
    checkIntervalInactive: number;
    retryInterval: number;
    maxRetries: number;
  };
  notifications: {
    showUpdateAvailable: boolean;
    showUpdateDownloaded: boolean;
    showUpdateError: boolean;
    showProgress: boolean;
    autoShowInstallPrompt: boolean;
    notificationTimeout: number;
  };
  ui: {
    theme: 'light' | 'dark' | 'auto';
    language: 'ar' | 'en';
    rtl: boolean;
    showChangelog: boolean;
    showReleaseNotes: boolean;
    allowSkipVersion: boolean;
    remindLater: boolean;
    remindLaterInterval: number;
  };
  security: {
    verifySignature: boolean;
    allowInsecureUpdates: boolean;
    trustedHosts: string[];
  };
  logging: {
    enabled: boolean;
    level: 'error' | 'warn' | 'info' | 'debug';
    logFile: string;
    maxLogSize: number;
    maxLogFiles: number;
  };
  advanced: {
    requestHeaders: Record<string, string>;
    timeout: number;
    userAgent: string;
    disableWebSecurity: boolean;
    enableLogging: boolean;
  };
  messages: {
    [key: string]: {
      checking: string;
      updateAvailable: string;
      updateNotAvailable: string;
      downloadProgress: string;
      updateDownloaded: string;
      installNow: string;
      installLater: string;
      skipVersion: string;
      releaseNotes: string;
      error: string;
      retry: string;
      cancel: string;
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
  author?: {
    name: string;
    email: string;
  };
}

class SmartAutoUpdater {
  private config: AutoUpdaterConfig;
  private packageInfo: PackageInfo;
  private mainWindow: BrowserWindow | null = null;
  private updateCheckTimer: NodeJS.Timeout | null = null;
  private retryCount = 0;
  private isChecking = false;
  private lastCheckTime = 0;

  constructor() {
    this.loadConfiguration();
    this.loadPackageInfo();
    this.setupAutoUpdater();
    this.setupLogging();
  }

  /**
   * تحميل إعدادات التحديث التلقائي
   */
  private loadConfiguration(): void {
    try {
      const configPath = join(process.cwd(), 'auto-updater.config.json');
      
      if (!existsSync(configPath)) {
        throw new Error('ملف إعدادات التحديث التلقائي غير موجود');
      }

      const configData = readFileSync(configPath, 'utf-8');
      this.config = JSON.parse(configData);
      
      log.info('تم تحميل إعدادات التحديث التلقائي بنجاح');
    } catch (error) {
      log.error('خطأ في تحميل إعدادات التحديث التلقائي:', error);
      this.useDefaultConfig();
    }
  }

  /**
   * تحميل معلومات المشروع من package.json
   */
  private loadPackageInfo(): void {
    try {
      const packagePath = join(process.cwd(), 'package.json');
      const packageData = readFileSync(packagePath, 'utf-8');
      this.packageInfo = JSON.parse(packageData);
      
      log.info('تم تحميل معلومات المشروع بنجاح');
    } catch (error) {
      log.error('خطأ في تحميل معلومات المشروع:', error);
      throw new Error('لا يمكن تحميل معلومات المشروع');
    }
  }

  /**
   * استخدام الإعدادات الافتراضية
   */
  private useDefaultConfig(): void {
    this.config = {
      version: '1.0.0',
      description: 'إعدادات افتراضية للتحديث التلقائي',
      updater: {
        enabled: true,
        autoDownload: true,
        autoInstallOnAppQuit: true,
        allowPrerelease: false,
        allowDowngrade: false,
        fullChangelog: true
      },
      checking: {
        checkForUpdatesOnStart: true,
        checkInterval: 3600000, // ساعة واحدة
        checkIntervalInactive: 86400000, // 24 ساعة
        retryInterval: 300000, // 5 دقائق
        maxRetries: 3
      },
      notifications: {
        showUpdateAvailable: true,
        showUpdateDownloaded: true,
        showUpdateError: true,
        showProgress: true,
        autoShowInstallPrompt: true,
        notificationTimeout: 10000
      },
      ui: {
        theme: 'auto',
        language: 'ar',
        rtl: true,
        showChangelog: true,
        showReleaseNotes: true,
        allowSkipVersion: true,
        remindLater: true,
        remindLaterInterval: 86400000
      },
      security: {
        verifySignature: true,
        allowInsecureUpdates: false,
        trustedHosts: ['github.com', 'api.github.com']
      },
      logging: {
        enabled: true,
        level: 'info',
        logFile: 'auto-updater.log',
        maxLogSize: 10485760,
        maxLogFiles: 5
      },
      advanced: {
        requestHeaders: {},
        timeout: 60000,
        userAgent: 'auto-updater',
        disableWebSecurity: false,
        enableLogging: true
      },
      messages: {
        ar: {
          checking: 'جاري البحث عن تحديثات...',
          updateAvailable: 'يتوفر تحديث جديد',
          updateNotAvailable: 'التطبيق محدث',
          downloadProgress: 'جاري تحميل التحديث...',
          updateDownloaded: 'تم تحميل التحديث',
          installNow: 'تثبيت الآن',
          installLater: 'تثبيت لاحقاً',
          skipVersion: 'تخطي هذا الإصدار',
          releaseNotes: 'ملاحظات الإصدار',
          error: 'خطأ في التحديث',
          retry: 'إعادة المحاولة',
          cancel: 'إلغاء'
        }
      }
    };
  }

  /**
   * إعداد نظام التحديث التلقائي
   */
  private setupAutoUpdater(): void {
    if (!this.config.updater.enabled) {
      log.info('التحديث التلقائي معطل');
      return;
    }

    // إعداد الخادم التلقائي من معلومات المشروع
    this.configureUpdateServer();

    // إعداد خيارات التحديث
    autoUpdater.autoDownload = this.config.updater.autoDownload;
    autoUpdater.autoInstallOnAppQuit = this.config.updater.autoInstallOnAppQuit;
    autoUpdater.allowPrerelease = this.config.updater.allowPrerelease;
    autoUpdater.allowDowngrade = this.config.updater.allowDowngrade;
    autoUpdater.fullChangelog = this.config.updater.fullChangelog;

    // إعداد الأحداث
    this.setupUpdateEvents();

    log.info('تم إعداد نظام التحديث التلقائي بنجاح');
  }

  /**
   * إعداد خادم التحديث تلقائياً
   */
  private configureUpdateServer(): void {
    if (this.packageInfo.repository?.url) {
      const repoUrl = this.packageInfo.repository.url;
      const githubMatch = repoUrl.match(/github\.com[/:]([\w-]+)\/([\w-]+)/);
      
      if (githubMatch) {
        const [, owner, repo] = githubMatch;
        autoUpdater.setFeedURL({
          provider: 'github',
          owner,
          repo,
          private: false // يمكن تحديد هذا تلقائياً لاحقاً
        });
        
        log.info(`تم إعداد خادم التحديث: ${owner}/${repo}`);
      }
    }
  }
}
