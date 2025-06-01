/**
 * 🏪 ZATCA E-Invoicing Store
 *
 * نظام إدارة الحالة للفوترة الإلكترونية المتوافق مع ZATCA
 * يدير البيانات، الإعدادات، والحالة العامة للنظام
 *
 * @author Mohamed Abo Elnasr Hassan
 * @version 1.0.0
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { zatcaLogger } from 'src/utils/zatca-logger';

// تعريف الأنواع والواجهات
export interface ZATCAConfig {
  environment: 'sandbox' | 'production';
  baseUrl: string;
  apiVersion: string;
  timeout: number;
  retryAttempts: number;
}

export interface CompanyInfo {
  id?: string;
  vatNumber: string;
  commercialRegistration: string;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  isActive: boolean;
}

export interface Certificate {
  id?: string;
  companyId: string;
  type: 'CSID' | 'PCSID';
  certificateData: string;
  privateKey: string;
  serialNumber: string;
  issueDate: Date;
  expiryDate: Date;
  isActive: boolean;
}

export interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date | null;
  environment: 'sandbox' | 'production';
  responseTime: number;
  errorMessage?: string;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  invoiceType: 'standard' | 'simplified' | 'credit' | 'debit';
  companyId: string;
  customerId: string;
  issueDate: Date;
  dueDate?: Date;
  supplyDate?: Date;
  currency: string;
  exchangeRate: number;
  subTotal: number;
  vatAmount: number;
  totalAmount: number;
  status: 'draft' | 'issued' | 'sent' | 'approved' | 'rejected' | 'paid' | 'cancelled';
  zatcaStatus: 'not_sent' | 'sent' | 'approved' | 'rejected';
  zatcaUUID?: string;
  zatcaHash?: string;
  qrCode?: string;
  xmlContent?: string;
  notes?: string;
  lineItems: InvoiceLineItem[];
}

export interface InvoiceLineItem {
  id?: string;
  invoiceId: string;
  lineNumber: number;
  productCode?: string;
  descriptionAr: string;
  descriptionEn?: string;
  unitOfMeasure: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  vatRate: number;
  vatAmount: number;
  lineTotalWithVAT: number;
}

export interface Customer {
  id?: string;
  customerCode: string;
  customerType: 'individual' | 'business';
  vatNumber?: string;
  commercialRegistration?: string;
  nameAr: string;
  nameEn?: string;
  addressAr?: string;
  addressEn?: string;
  city?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

/**
 * ZATCA Store الرئيسي
 */
export const useZATCAStore = defineStore('zatca', () => {
  // ===== الحالة الأساسية =====
  const isInitialized = ref(false);
  const isLoading = ref(false);
  const currentEnvironment = ref<'sandbox' | 'production'>('sandbox');

  // ===== إعدادات ZATCA =====
  const zatcaConfig = ref<ZATCAConfig>({
    environment: 'sandbox',
    baseUrl: 'https://gw-fatoora.zatca.gov.sa',
    apiVersion: 'v1',
    timeout: 30000,
    retryAttempts: 3,
  });

  // ===== معلومات الشركة =====
  const companyInfo = ref<CompanyInfo>({
    vatNumber: '',
    commercialRegistration: '',
    nameAr: '',
    nameEn: '',
    addressAr: '',
    addressEn: '',
    city: '',
    postalCode: '',
    country: 'SA',
    phone: '',
    email: '',
    isActive: true,
  });

  // ===== الشهادات الرقمية =====
  const certificates = ref<Certificate[]>([]);
  const activeCertificate = ref<Certificate | null>(null);

  // ===== حالة الاتصال =====
  const connectionStatus = ref<ConnectionStatus>({
    isConnected: false,
    lastCheck: null,
    environment: 'sandbox',
    responseTime: 0,
  });

  // ===== الفواتير =====
  const invoices = ref<Invoice[]>([]);
  const currentInvoice = ref<Invoice | null>(null);

  // ===== العملاء =====
  const customers = ref<Customer[]>([]);

  // ===== الإحصائيات =====
  const statistics = ref({
    totalInvoices: 0,
    pendingInvoices: 0,
    approvedInvoices: 0,
    rejectedInvoices: 0,
    totalRevenue: 0,
    totalVAT: 0,
  });

  // ===== Computed Properties =====
  const isConfigured = computed(() => {
    return (
      companyInfo.value.vatNumber && companyInfo.value.nameAr && activeCertificate.value !== null
    );
  });

  const sandboxConfig = computed(() => ({
    ...zatcaConfig.value,
    environment: 'sandbox' as const,
    baseUrl: 'https://gw-fatoora.zatca.gov.sa/e-invoicing/developer-portal',
  }));

  const productionConfig = computed(() => ({
    ...zatcaConfig.value,
    environment: 'production' as const,
    baseUrl: 'https://gw-fatoora.zatca.gov.sa/e-invoicing/core',
  }));

  const currentConfig = computed(() => {
    return currentEnvironment.value === 'sandbox' ? sandboxConfig.value : productionConfig.value;
  });

  const pendingInvoices = computed(() => {
    return invoices.value.filter(
      (invoice) => invoice.zatcaStatus === 'not_sent' || invoice.zatcaStatus === 'sent',
    );
  });

  const approvedInvoices = computed(() => {
    return invoices.value.filter((invoice) => invoice.zatcaStatus === 'approved');
  });

  const rejectedInvoices = computed(() => {
    return invoices.value.filter((invoice) => invoice.zatcaStatus === 'rejected');
  });

  // ===== Actions =====

  /**
   * تهيئة المتجر
   */
  async function initialize(): Promise<void> {
    try {
      isLoading.value = true;
      zatcaLogger.info('بدء تهيئة ZATCA Store');

      // تحميل الإعدادات المحفوظة
      loadSettings();

      // تحميل معلومات الشركة
      loadCompanyInfo();

      // تحميل الشهادات
      await loadCertificates();

      // تحميل العملاء
      await loadCustomers();

      // تحميل الفواتير
      await loadInvoices();

      // حساب الإحصائيات
      calculateStatistics();

      isInitialized.value = true;
      zatcaLogger.info('تم تهيئة ZATCA Store بنجاح');
    } catch (error) {
      zatcaLogger.error('فشل في تهيئة ZATCA Store', error as Error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * تحديث إعدادات ZATCA
   */
  function updateZATCAConfig(config: Partial<ZATCAConfig>): void {
    try {
      zatcaConfig.value = { ...zatcaConfig.value, ...config };
      saveSettings();
      zatcaLogger.zatca('تحديث إعدادات ZATCA', config);
    } catch (error) {
      zatcaLogger.error('فشل في تحديث إعدادات ZATCA', error as Error);
      throw error;
    }
  }

  /**
   * تحديث معلومات الشركة
   */
  function updateCompanyInfo(info: Partial<CompanyInfo>): void {
    try {
      companyInfo.value = { ...companyInfo.value, ...info };
      saveCompanyInfo();
      zatcaLogger.audit('تحديث معلومات الشركة', undefined, info);
    } catch (error) {
      zatcaLogger.error('فشل في تحديث معلومات الشركة', error as Error);
      throw error;
    }
  }

  /**
   * تبديل البيئة
   */
  function switchEnvironment(environment: 'sandbox' | 'production'): void {
    try {
      const oldEnvironment = currentEnvironment.value;
      currentEnvironment.value = environment;

      // إعادة تعيين حالة الاتصال
      connectionStatus.value.isConnected = false;
      connectionStatus.value.lastCheck = null;
      connectionStatus.value.environment = environment;

      saveSettings();
      zatcaLogger.security('تبديل البيئة', { from: oldEnvironment, to: environment });
    } catch (error) {
      zatcaLogger.error('فشل في تبديل البيئة', error as Error);
      throw error;
    }
  }

  /**
   * اختبار الاتصال مع ZATCA
   */
  async function testConnection(): Promise<boolean> {
    try {
      isLoading.value = true;
      const startTime = Date.now();

      zatcaLogger.info(`اختبار الاتصال مع ZATCA - البيئة: ${currentEnvironment.value}`);

      // محاكاة اختبار الاتصال
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const responseTime = Date.now() - startTime;

      connectionStatus.value = {
        isConnected: true,
        lastCheck: new Date(),
        environment: currentEnvironment.value,
        responseTime,
      };

      zatcaLogger.zatca('نجح اختبار الاتصال', {
        responseTime,
        environment: currentEnvironment.value,
      });
      return true;
    } catch (error) {
      connectionStatus.value = {
        isConnected: false,
        lastCheck: new Date(),
        environment: currentEnvironment.value,
        responseTime: 0,
        errorMessage: (error as Error).message,
      };

      zatcaLogger.error('فشل اختبار الاتصال مع ZATCA', error as Error);
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  // ===== وظائف مساعدة =====

  function loadSettings(): void {
    // تحميل الإعدادات من localStorage أو قاعدة البيانات
    const savedConfig = localStorage.getItem('zatca-config');
    if (savedConfig) {
      zatcaConfig.value = { ...zatcaConfig.value, ...JSON.parse(savedConfig) };
    }

    const savedEnvironment = localStorage.getItem('zatca-environment');
    if (savedEnvironment) {
      currentEnvironment.value = savedEnvironment as 'sandbox' | 'production';
    }
  }

  function saveSettings(): void {
    localStorage.setItem('zatca-config', JSON.stringify(zatcaConfig.value));
    localStorage.setItem('zatca-environment', currentEnvironment.value);
  }

  function loadCompanyInfo(): void {
    // تحميل معلومات الشركة من قاعدة البيانات
    const savedCompany = localStorage.getItem('company-info');
    if (savedCompany) {
      companyInfo.value = { ...companyInfo.value, ...JSON.parse(savedCompany) };
    }
  }

  function saveCompanyInfo(): void {
    localStorage.setItem('company-info', JSON.stringify(companyInfo.value));
  }

  async function loadCertificates(): Promise<void> {
    // تحميل الشهادات من قاعدة البيانات
    // هذه وظيفة مؤقتة - ستحتاج لتنفيذ فعلي مع قاعدة البيانات
  }

  async function loadCustomers(): Promise<void> {
    // تحميل العملاء من قاعدة البيانات
  }

  async function loadInvoices(): Promise<void> {
    // تحميل الفواتير من قاعدة البيانات
  }

  function calculateStatistics(): void {
    statistics.value = {
      totalInvoices: invoices.value.length,
      pendingInvoices: pendingInvoices.value.length,
      approvedInvoices: approvedInvoices.value.length,
      rejectedInvoices: rejectedInvoices.value.length,
      totalRevenue: invoices.value.reduce((sum, inv) => sum + inv.totalAmount, 0),
      totalVAT: invoices.value.reduce((sum, inv) => sum + inv.vatAmount, 0),
    };
  }

  // ===== Return =====
  return {
    // State
    isInitialized,
    isLoading,
    currentEnvironment,
    zatcaConfig,
    companyInfo,
    certificates,
    activeCertificate,
    connectionStatus,
    invoices,
    currentInvoice,
    customers,
    statistics,

    // Computed
    isConfigured,
    currentConfig,
    sandboxConfig,
    productionConfig,
    pendingInvoices,
    approvedInvoices,
    rejectedInvoices,

    // Actions
    initialize,
    updateZATCAConfig,
    updateCompanyInfo,
    switchEnvironment,
    testConnection,
  };
});
