/**
 * 🚀 ZATCA Initialization Boot File
 *
 * ملف التهيئة الأولية لنظام الفوترة الإلكترونية ZATCA
 * يتم تشغيله عند بدء التطبيق لإعداد النظام
 *
 * @author Mohamed Abo Elnasr Hassan
 * @version 1.0.0
 */

import { defineBoot } from '#q-app/wrappers';
import { useZATCAStore } from 'src/stores/zatca-store';
import { zatcaLogger } from 'src/utils/zatca-logger';
import { notificationManager } from 'src/utils/notification-manager';
import { databaseManager } from 'src/utils/database-manager';
import { useQuasar } from 'quasar';

export default defineBoot(async ({ router }) => {
  try {
    // تهيئة Quasar instances للمكونات
    const $q = useQuasar();
    zatcaLogger.setQuasarInstance($q);
    notificationManager.setQuasarInstance($q);

    zatcaLogger.info('🚀 Starting ZATCA system initialization...');

    // تهيئة ZATCA Store
    const zatcaStore = useZATCAStore();

    // التحقق من وجود إعدادات محفوظة
    const hasExistingConfig = checkExistingConfiguration();

    if (hasExistingConfig) {
      zatcaLogger.info('📋 Found existing ZATCA configuration, initializing...');

      try {
        // تهيئة المتجر مع الإعدادات الموجودة
        await zatcaStore.initialize();

        // اختبار الاتصال مع قاعدة البيانات إذا كانت الإعدادات موجودة
        await initializeDatabaseConnection();

        zatcaLogger.info('✅ ZATCA system initialized successfully');

        // إشعار نجاح التهيئة (بدون إزعاج المستخدم)
        setTimeout(() => {
          notificationManager.system('تم تهيئة نظام الفوترة الإلكترونية بنجاح', {
            timeout: 2000,
            position: 'bottom',
          });
        }, 3000);
      } catch (error) {
        zatcaLogger.error('❌ Failed to initialize ZATCA system', error as Error);

        // إشعار بالفشل مع خيار الإعداد
        notificationManager.warning('فشل في تهيئة نظام الفوترة الإلكترونية', {
          timeout: 5000,
          actions: [
            {
              label: 'إعداد النظام',
              color: 'white',
              handler: () => {
                router.push('/zatca-settings');
              },
            },
            {
              label: 'إغلاق',
              color: 'white',
            },
          ],
        });
      }
    } else {
      zatcaLogger.info('⚙️ No existing ZATCA configuration found');

      // إشعار بالحاجة للإعداد الأولي
      setTimeout(() => {
        notificationManager.info('مرحباً بك في نظام الفوترة الإلكترونية', {
          caption: 'يرجى إعداد النظام للبدء',
          timeout: 6000,
          actions: [
            {
              label: 'إعداد النظام',
              color: 'white',
              handler: () => {
                router.push('/zatca-settings');
              },
            },
            {
              label: 'لاحقاً',
              color: 'white',
            },
          ],
        });
      }, 2000);
    }

    // إعداد مراقبة الأخطاء العامة
    setupGlobalErrorHandling();

    // إعداد مراقبة حالة الشبكة
    setupNetworkMonitoring();

    zatcaLogger.info('🎯 ZATCA boot process completed');
  } catch (error) {
    zatcaLogger.error('💥 Critical error during ZATCA initialization', error as Error);

    // إشعار بخطأ حرج
    notificationManager.error('خطأ حرج في تهيئة نظام الفوترة الإلكترونية', {
      persistent: true,
      actions: [
        {
          label: 'إعادة المحاولة',
          color: 'white',
          handler: () => {
            window.location.reload();
          },
        },
        {
          label: 'الدعم التقني',
          color: 'white',
          handler: () => {
            // فتح نافذة الدعم التقني
            window.open('mailto:support@example.com?subject=ZATCA System Error');
          },
        },
      ],
    });
  }
});

/**
 * التحقق من وجود إعدادات محفوظة
 */
function checkExistingConfiguration(): boolean {
  try {
    // فحص localStorage للإعدادات الأساسية
    const zatcaConfig = localStorage.getItem('zatca-config');
    const companyInfo = localStorage.getItem('company-info');

    if (zatcaConfig && companyInfo) {
      const config = JSON.parse(zatcaConfig);
      const company = JSON.parse(companyInfo);

      // التحقق من وجود البيانات الأساسية المطلوبة
      return !!(config.environment && company.vatNumber && company.nameAr);
    }

    return false;
  } catch (error) {
    zatcaLogger.error('Error checking existing configuration', error as Error);
    return false;
  }
}

/**
 * تهيئة الاتصال بقاعدة البيانات
 */
async function initializeDatabaseConnection(): Promise<void> {
  try {
    // فحص إعدادات قاعدة البيانات المحفوظة
    const dbConfig = localStorage.getItem('database-config');

    if (dbConfig) {
      const config = JSON.parse(dbConfig);

      // محاولة الاتصال بقاعدة البيانات
      const isConnected = await databaseManager.connect(config);

      if (isConnected) {
        zatcaLogger.database('Database connection established successfully');
      } else {
        zatcaLogger.warn('Database connection failed, will retry later');
      }
    } else {
      zatcaLogger.info('No database configuration found, skipping connection');
    }
  } catch (error) {
    zatcaLogger.error('Failed to initialize database connection', error as Error);
  }
}

/**
 * إعداد مراقبة الأخطاء العامة
 */
function setupGlobalErrorHandling(): void {
  // مراقبة الأخطاء غير المعالجة
  window.addEventListener('error', (event) => {
    zatcaLogger.error('Unhandled error', new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // مراقبة Promise rejections غير المعالجة
  window.addEventListener('unhandledrejection', (event) => {
    zatcaLogger.error('Unhandled promise rejection', new Error(event.reason), {
      reason: event.reason,
    });
  });

  zatcaLogger.info('Global error handling setup completed');
}

/**
 * إعداد مراقبة حالة الشبكة
 */
function setupNetworkMonitoring(): void {
  // مراقبة حالة الاتصال بالإنترنت
  window.addEventListener('online', () => {
    zatcaLogger.info('Network connection restored');
    notificationManager.connectionRestored();
  });

  window.addEventListener('offline', () => {
    zatcaLogger.warn('Network connection lost');
    notificationManager.connectionLost();
  });

  // فحص دوري لحالة الشبكة (كل 5 دقائق)
  setInterval(() => {
    if (!navigator.onLine) {
      zatcaLogger.warn('Network still offline');
    }
  }, 300000);

  zatcaLogger.info('Network monitoring setup completed');
}

/**
 * تنظيف الموارد عند إغلاق التطبيق
 */
function setupCleanupHandlers(): void {
  window.addEventListener('beforeunload', () => {
    try {
      zatcaLogger.info('Application shutting down, cleaning up...');

      // قطع الاتصال بقاعدة البيانات
      if (databaseManager.isConnected()) {
        // Note: synchronous cleanup only in beforeunload
        zatcaLogger.info('Database cleanup scheduled');
      }

      zatcaLogger.info('Cleanup completed successfully');
    } catch (error) {
      zatcaLogger.error('Error during cleanup', error as Error);
    }
  });
}

// إعداد معالجات التنظيف
setupCleanupHandlers();
