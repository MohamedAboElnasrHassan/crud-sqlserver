// نظام تسجيل الأخطاء البسيط
class SimpleLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  // إضافة سجل جديد
  addLog(level, message, data = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      id: Date.now() + Math.random(),
    };

    this.logs.unshift(logEntry);

    // الحفاظ على حد أقصى من السجلات
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // طباعة في وضع التطوير
    if (process.env.DEV) {
      const timestamp = new Date().toLocaleString('ar-EG');
      const logMessage = `[${timestamp}] [${level}] ${message}`;

      switch (level) {
        case 'ERROR':
          console.error(logMessage, data);
          break;
        case 'WARN':
          console.warn(logMessage, data);
          break;
        case 'INFO':
          console.info(logMessage, data);
          break;
        case 'DEBUG':
          console.debug(logMessage, data);
          break;
        default:
          console.log(logMessage, data);
      }
    }

    return logEntry;
  }

  // طرق التسجيل
  error(message, data = null) {
    return this.addLog('ERROR', message, data);
  }

  warn(message, data = null) {
    return this.addLog('WARN', message, data);
  }

  info(message, data = null) {
    return this.addLog('INFO', message, data);
  }

  debug(message, data = null) {
    if (process.env.DEV) {
      return this.addLog('DEBUG', message, data);
    }
  }

  // الحصول على جميع السجلات
  getAllLogs() {
    return [...this.logs];
  }

  // الحصول على السجلات حسب المستوى
  getLogsByLevel(level) {
    return this.logs.filter((log) => log.level === level);
  }

  // مسح جميع السجلات
  clearLogs() {
    this.logs = [];
  }

  // تصدير السجلات كـ JSON
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  // إحصائيات السجلات
  getStats() {
    const stats = {
      total: this.logs.length,
      error: 0,
      warn: 0,
      info: 0,
      debug: 0,
    };

    this.logs.forEach((log) => {
      switch (log.level) {
        case 'ERROR':
          stats.error++;
          break;
        case 'WARN':
          stats.warn++;
          break;
        case 'INFO':
          stats.info++;
          break;
        case 'DEBUG':
          stats.debug++;
          break;
      }
    });

    return stats;
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
export const logger = new SimpleLogger();

// معالج الأخطاء العام
export function setupGlobalErrorHandler(app) {
  // معالج أخطاء Vue
  app.config.errorHandler = (error, instance, info) => {
    logger.error('خطأ Vue.js', {
      error: error.message,
      stack: error.stack,
      info,
      component: instance?.$options.name || 'Unknown',
    });
  };

  // معالج الأخطاء العام للنافذة
  if (typeof window !== 'undefined') {
    window.addEventListener('error', (event) => {
      logger.error('خطأ JavaScript', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      logger.error('Promise مرفوض', {
        reason: event.reason,
        stack: event.reason?.stack,
      });
    });
  }
}

export default logger;
