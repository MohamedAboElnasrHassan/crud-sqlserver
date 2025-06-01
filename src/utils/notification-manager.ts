/**
 * 🔔 ZATCA Notification Manager
 *
 * نظام إدارة الإشعارات المتقدم للفوترة الإلكترونية
 * يدعم إشعارات متعددة الأنواع مع تخصيص كامل
 *
 * @author Mohamed Abo Elnasr Hassan
 * @version 1.0.0
 */

import type { QNotifyCreateOptions } from 'quasar';
import { zatcaLogger } from './zatca-logger';

// تعريف أنواع الإشعارات المخصصة
export type NotificationType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'zatca'
  | 'invoice'
  | 'security'
  | 'system';

// تعريف مواضع الإشعارات
export type NotificationPosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'bottom'
  | 'bottom-left'
  | 'bottom-right'
  | 'left'
  | 'right'
  | 'center';

// واجهة إعدادات الإشعار
export interface NotificationConfig {
  type: NotificationType;
  message: string;
  caption?: string;
  timeout?: number;
  position?: NotificationPosition;
  persistent?: boolean;
  showProgress?: boolean;
  actions?: Array<{
    label: string;
    color?: string;
    handler?: () => void;
  }>;
  avatar?: string;
  icon?: string;
  color?: string;
  textColor?: string;
  html?: boolean;
  multiLine?: boolean;
  group?: string;
  badgeColor?: string;
  badgeTextColor?: string;
  badgePosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  onDismiss?: () => void;
}

// إعدادات افتراضية لكل نوع
const defaultConfigs: Record<NotificationType, Partial<QNotifyCreateOptions>> = {
  success: {
    type: 'positive',
    icon: 'check_circle',
    color: 'positive',
    timeout: 3000,
    position: 'top',
  },
  error: {
    type: 'negative',
    icon: 'error',
    color: 'negative',
    timeout: 5000,
    position: 'top',
    actions: [
      {
        label: 'إغلاق',
        color: 'white',
      },
    ],
  },
  warning: {
    type: 'warning',
    icon: 'warning',
    color: 'warning',
    timeout: 4000,
    position: 'top',
  },
  info: {
    type: 'info',
    icon: 'info',
    color: 'info',
    timeout: 3000,
    position: 'top',
  },
  zatca: {
    type: 'ongoing',
    icon: 'receipt_long',
    color: 'primary',
    timeout: 4000,
    position: 'top-right',
    avatar: 'https://www.zatca.gov.sa/ar/Style%20Library/images/zatca-logo.png',
  },
  invoice: {
    type: 'ongoing',
    icon: 'description',
    color: 'secondary',
    timeout: 3000,
    position: 'top-right',
  },
  security: {
    type: 'negative',
    icon: 'security',
    color: 'red-8',
    timeout: 6000,
    position: 'center',
    actions: [
      {
        label: 'تفاصيل',
        color: 'white',
      },
      {
        label: 'إغلاق',
        color: 'white',
      },
    ],
  },
  system: {
    type: 'ongoing',
    icon: 'settings',
    color: 'grey-7',
    timeout: 2000,
    position: 'bottom',
  },
};

/**
 * فئة إدارة الإشعارات
 */
export class NotificationManager {
  private static instance: NotificationManager;
  private $q: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  private notificationQueue: NotificationConfig[] = [];
  private activeNotifications: Map<string, () => void> = new Map();
  private isProcessing = false;

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

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  /**
   * عرض إشعار نجاح
   */
  success(message: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'success',
      message,
      ...options,
    });
  }

  /**
   * عرض إشعار خطأ
   */
  error(message: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'error',
      message,
      ...options,
    });

    // تسجيل الخطأ
    zatcaLogger.error(`Notification Error: ${message}`);
  }

  /**
   * عرض إشعار تحذير
   */
  warning(message: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'warning',
      message,
      ...options,
    });
  }

  /**
   * عرض إشعار معلومات
   */
  info(message: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'info',
      message,
      ...options,
    });
  }

  /**
   * عرض إشعار ZATCA
   */
  zatca(message: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'zatca',
      message,
      caption: 'هيئة الزكاة والضريبة والجمارك',
      ...options,
    });

    // تسجيل عملية ZATCA
    zatcaLogger.zatca(`Notification: ${message}`);
  }

  /**
   * عرض إشعار فاتورة
   */
  invoice(message: string, invoiceNumber?: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'invoice',
      message,
      caption: invoiceNumber ? `فاتورة رقم: ${invoiceNumber}` : 'عملية فوترة',
      ...options,
    });

    // تسجيل عملية الفاتورة
    zatcaLogger.invoice('notification', invoiceNumber, { message });
  }

  /**
   * عرض إشعار أمني
   */
  security(message: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'security',
      message,
      caption: 'تنبيه أمني',
      persistent: true,
      ...options,
    });

    // تسجيل الحدث الأمني
    zatcaLogger.security(`Security Notification: ${message}`);
  }

  /**
   * عرض إشعار نظام
   */
  system(message: string, options?: Partial<NotificationConfig>): void {
    this.show({
      type: 'system',
      message,
      ...options,
    });
  }

  /**
   * عرض إشعار مخصص
   */
  show(config: NotificationConfig): void {
    if (!this.$q?.notify) {
      console.warn('Quasar Notify plugin not available');
      return;
    }

    // إضافة للقائمة
    this.notificationQueue.push(config);

    // معالجة القائمة
    this.processQueue();
  }

  /**
   * عرض إشعار تقدم العملية
   */
  progress(message: string, progress: number, options?: Partial<NotificationConfig>): void {
    const progressConfig: NotificationConfig = {
      type: 'info',
      message,
      timeout: 0,
      persistent: true,
      showProgress: true,
      group: 'progress',
      ...options,
    };

    this.show(progressConfig);
  }

  /**
   * إخفاء إشعار محدد
   */
  dismiss(group?: string): void {
    if (group && this.activeNotifications.has(group)) {
      const notification = this.activeNotifications.get(group);
      if (notification && typeof notification === 'function') {
        notification();
        this.activeNotifications.delete(group);
      }
    }
  }

  /**
   * إخفاء جميع الإشعارات
   */
  dismissAll(): void {
    this.activeNotifications.forEach((dismiss) => {
      if (typeof dismiss === 'function') {
        dismiss();
      }
    });
    this.activeNotifications.clear();
  }

  /**
   * معالجة قائمة الإشعارات
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.notificationQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.notificationQueue.length > 0) {
      const config = this.notificationQueue.shift();
      if (config) {
        this.displayNotification(config);

        // تأخير قصير بين الإشعارات
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    this.isProcessing = false;
  }

  /**
   * عرض إشعار واحد
   */
  private displayNotification(config: NotificationConfig): void {
    const defaultConfig = defaultConfigs[config.type];

    const notifyOptions: QNotifyCreateOptions = {
      ...defaultConfig,
      message: config.message,
      caption: config.caption,
      timeout: config.timeout ?? defaultConfig.timeout,
      position: config.position ?? defaultConfig.position,
      actions:
        config.actions?.map((action) => ({
          ...action,
          handler: () => {
            if (action.handler) {
              action.handler();
            }
            if (config.group) {
              this.dismiss(config.group);
            }
          },
        })) ?? defaultConfig.actions,
      avatar: config.avatar ?? defaultConfig.avatar,
      icon: config.icon ?? defaultConfig.icon,
      color: config.color ?? defaultConfig.color,
      textColor: config.textColor ?? defaultConfig.textColor,
      html: config.html ?? false,
      multiLine: config.multiLine ?? true,
      group: config.group,
      badgeColor: config.badgeColor,
      badgeTextColor: config.badgeTextColor,
      badgePosition: config.badgePosition,
      onDismiss: config.onDismiss,
    };

    // عرض الإشعار
    const dismiss = this.$q.notify(notifyOptions);

    // حفظ مرجع للإشعار إذا كان له مجموعة
    if (config.group) {
      this.activeNotifications.set(config.group, dismiss);
    }

    // تسجيل الإشعار
    zatcaLogger.info(`Notification displayed: ${config.type} - ${config.message}`);
  }

  /**
   * إشعارات مخصصة للفوترة الإلكترونية
   */

  invoiceCreated(invoiceNumber: string): void {
    this.invoice(`تم إنشاء الفاتورة بنجاح`, invoiceNumber, {
      icon: 'add_circle',
      color: 'positive',
    });
  }

  invoiceSent(invoiceNumber: string): void {
    this.zatca(`تم إرسال الفاتورة إلى منصة فاتورة`, {
      caption: `فاتورة رقم: ${invoiceNumber}`,
      icon: 'send',
      color: 'primary',
    });
  }

  invoiceApproved(invoiceNumber: string): void {
    this.success(`تم اعتماد الفاتورة من قبل هيئة الزكاة والضريبة والجمارك`, {
      caption: `فاتورة رقم: ${invoiceNumber}`,
      icon: 'verified',
      timeout: 5000,
    });
  }

  invoiceRejected(invoiceNumber: string, reason?: string): void {
    this.error(`تم رفض الفاتورة من قبل هيئة الزكاة والضريبة والجمارك`, {
      caption: reason ? `السبب: ${reason}` : `فاتورة رقم: ${invoiceNumber}`,
      icon: 'cancel',
      timeout: 6000,
      actions: [
        {
          label: 'عرض التفاصيل',
          color: 'white',
          handler: () => {
            // فتح نافذة تفاصيل الخطأ
          },
        },
        {
          label: 'إغلاق',
          color: 'white',
        },
      ],
    });
  }

  connectionLost(): void {
    this.error('فقدان الاتصال مع منصة فاتورة', {
      persistent: true,
      group: 'connection',
      actions: [
        {
          label: 'إعادة المحاولة',
          color: 'white',
          handler: () => {
            // إعادة محاولة الاتصال
          },
        },
      ],
    });
  }

  connectionRestored(): void {
    this.dismiss('connection');
    this.success('تم استعادة الاتصال مع منصة فاتورة', {
      icon: 'wifi',
      timeout: 3000,
    });
  }

  certificateExpiring(daysLeft: number): void {
    this.warning(`ستنتهي صلاحية الشهادة الرقمية خلال ${daysLeft} أيام`, {
      persistent: true,
      group: 'certificate',
      actions: [
        {
          label: 'تجديد الشهادة',
          color: 'white',
          handler: () => {
            // فتح صفحة تجديد الشهادة
          },
        },
        {
          label: 'تذكيرني لاحقاً',
          color: 'white',
        },
      ],
    });
  }
}

// تصدير instance واحد
export const notificationManager = NotificationManager.getInstance();

// تصدير دوال مختصرة للاستخدام السريع
export const notify = {
  success: (message: string, options?: Partial<NotificationConfig>) =>
    notificationManager.success(message, options),

  error: (message: string, options?: Partial<NotificationConfig>) =>
    notificationManager.error(message, options),

  warning: (message: string, options?: Partial<NotificationConfig>) =>
    notificationManager.warning(message, options),

  info: (message: string, options?: Partial<NotificationConfig>) =>
    notificationManager.info(message, options),

  zatca: (message: string, options?: Partial<NotificationConfig>) =>
    notificationManager.zatca(message, options),

  invoice: (message: string, invoiceNumber?: string, options?: Partial<NotificationConfig>) =>
    notificationManager.invoice(message, invoiceNumber, options),

  security: (message: string, options?: Partial<NotificationConfig>) =>
    notificationManager.security(message, options),

  system: (message: string, options?: Partial<NotificationConfig>) =>
    notificationManager.system(message, options),
};
