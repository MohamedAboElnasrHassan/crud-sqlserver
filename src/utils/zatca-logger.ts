/**
 * 📋 ZATCA E-Invoicing Logger System
 *
 * نظام تسجيل متقدم للفوترة الإلكترونية المتوافق مع ZATCA
 * يدعم تسجيل العمليات، الأخطاء، والأحداث الأمنية
 *
 * @author Mohamed Abo Elnasr Hassan
 * @version 1.0.0
 */

import winston from 'winston';
import { format } from 'winston';

// تعريف مستويات التسجيل المخصصة لـ ZATCA
const zatcaLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
  zatca: 4,
  security: 5,
  audit: 6,
};

// ألوان مخصصة للمستويات
const zatcaColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue',
  zatca: 'magenta',
  security: 'cyan',
  audit: 'white',
};

// إضافة الألوان لـ winston
winston.addColors(zatcaColors);

// تنسيق مخصص للرسائل
const customFormat = format.combine(
  format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  format.errors({ stack: true }),
  format.json(),
  format.printf(({ timestamp, level, message, stack, ...meta }) => {
    const ts = String(timestamp);
    const lvl = String(level).toUpperCase();
    const msg = String(message);
    let logMessage = `[${ts}] ${lvl}: ${msg}`;

    if (stack) {
      logMessage += `\nStack: ${typeof stack === 'string' ? stack : JSON.stringify(stack)}`;
    }

    if (Object.keys(meta).length > 0) {
      logMessage += `\nMeta: ${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  }),
);

// إنشاء Logger الرئيسي
const logger = winston.createLogger({
  levels: zatcaLevels,
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: customFormat,
  defaultMeta: {
    service: 'zatca-e-invoicing',
    version: '1.0.0',
  },
  transports: [
    // Console transport للتطوير
    new winston.transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    }),

    // File transport للأخطاء
    new winston.transports.File({
      filename: 'logs/zatca-errors.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // File transport للعمليات العامة
    new winston.transports.File({
      filename: 'logs/zatca-combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),

    // File transport للأمان والمراجعة
    new winston.transports.File({
      filename: 'logs/zatca-security.log',
      level: 'security',
      maxsize: 5242880, // 5MB
      maxFiles: 20,
    }),
  ],

  // معالج الاستثناءات غير المعالجة
  exceptionHandlers: [new winston.transports.File({ filename: 'logs/zatca-exceptions.log' })],

  // معالج الرفض غير المعالج للـ Promises
  rejectionHandlers: [new winston.transports.File({ filename: 'logs/zatca-rejections.log' })],
});

/**
 * فئة ZATCALogger المتقدمة
 */
export class ZATCALogger {
  private static instance: ZATCALogger;
  private $q: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  private constructor() {
    // سيتم تعيين Quasar instance من خلال setQuasarInstance
    this.$q = null;
  }

  /**
   * تعيين Quasar instance للإشعارات
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public setQuasarInstance($q: any): void {
    this.$q = $q;
  }

  public static getInstance(): ZATCALogger {
    if (!ZATCALogger.instance) {
      ZATCALogger.instance = new ZATCALogger();
    }
    return ZATCALogger.instance;
  }

  /**
   * تسجيل رسالة عامة
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  info(message: string, meta?: any): void {
    logger.info(message, meta);
    this.showNotification('info', message);
  }

  /**
   * تسجيل تحذير
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  warn(message: string, meta?: any): void {
    logger.warn(message, meta);
    this.showNotification('warning', message);
  }

  /**
   * تسجيل خطأ
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error(message: string, error?: Error, meta?: any): void {
    const logData = {
      ...meta,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    logger.error(message, logData);
    this.showNotification('negative', message);
  }

  /**
   * تسجيل عمليات ZATCA
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zatca(operation: string, data?: any): void {
    logger.log('zatca', `ZATCA Operation: ${operation}`, data);
  }

  /**
   * تسجيل أحداث الأمان
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  security(event: string, details?: any): void {
    const securityData = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator?.userAgent,
      ip: 'localhost', // في Electron
    };

    logger.log('security', `Security Event: ${event}`, securityData);
  }

  /**
   * تسجيل أحداث المراجعة
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  audit(action: string, userId?: string, details?: any): void {
    const auditData = {
      timestamp: new Date().toISOString(),
      action,
      userId,
      details,
    };

    logger.log('audit', `Audit: ${action}`, auditData);
  }

  /**
   * تسجيل عمليات الفواتير
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  invoice(operation: string, invoiceId?: string, data?: any): void {
    const invoiceData = {
      operation,
      invoiceId,
      timestamp: new Date().toISOString(),
      ...data,
    };

    logger.info(`Invoice ${operation}`, invoiceData);
  }

  /**
   * تسجيل عمليات قاعدة البيانات
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  database(operation: string, table?: string, data?: any): void {
    const dbData = {
      operation,
      table,
      timestamp: new Date().toISOString(),
      ...data,
    };

    logger.debug(`Database ${operation}`, dbData);
  }

  /**
   * عرض إشعار في واجهة المستخدم
   */
  private showNotification(type: string, message: string): void {
    if (!this.$q?.notify) return;

    // عرض الإشعارات المهمة فقط
    if (type === 'negative' || type === 'warning') {
      this.$q.notify({
        type,
        message: message.length > 100 ? message.substring(0, 100) + '...' : message,
        position: 'top',
        timeout: type === 'negative' ? 5000 : 3000,
        actions: [
          {
            label: 'إغلاق',
            color: 'white',
            handler: () => {},
          },
        ],
      });
    }
  }

  /**
   * الحصول على إحصائيات السجلات
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getStats(): any {
    // هذه الوظيفة ستحتاج لتنفيذ قراءة ملفات السجلات
    return {
      total: 0,
      errors: 0,
      warnings: 0,
      zatcaOperations: 0,
      securityEvents: 0,
    };
  }
}

// تصدير instance واحد
export const zatcaLogger = ZATCALogger.getInstance();

// تصدير logger الأساسي أيضاً
export { logger };

// تصدير الأنواع
export interface LogMeta {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface InvoiceLogData {
  invoiceId?: string;
  customerId?: string;
  amount?: number;
  vatAmount?: number;
  status?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  zatcaResponse?: any;
}

export interface SecurityLogData {
  userId?: string;
  action?: string;
  resource?: string;
  success?: boolean;
  reason?: string;
}
