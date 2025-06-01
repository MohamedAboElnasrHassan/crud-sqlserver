/**
 * 📄 ZATCA Invoice Manager
 *
 * نظام إدارة الفواتير الإلكترونية المتوافق مع ZATCA
 * يدعم إنشاء، تعديل، وإرسال الفواتير لمنصة فاتورة
 *
 * @author Mohamed Abo Elnasr Hassan
 * @version 1.0.0
 */

import { zatcaLogger } from './zatca-logger';
import { notificationManager } from './notification-manager';
import { databaseManager } from './database-manager';
import type { Invoice, InvoiceLineItem } from 'src/stores/zatca-store';

// تعريف أنواع الفواتير
export type InvoiceType = 'standard' | 'simplified' | 'credit' | 'debit';
export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'sent'
  | 'approved'
  | 'rejected'
  | 'paid'
  | 'cancelled';
export type ZATCAStatus = 'not_sent' | 'sent' | 'approved' | 'rejected';

// واجهة إنشاء فاتورة جديدة
export interface CreateInvoiceRequest {
  invoiceType: InvoiceType;
  customerId: string;
  issueDate: Date;
  dueDate?: Date;
  supplyDate?: Date;
  currency: string;
  lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId'>[];
  notes?: string;
}

// واجهة استجابة ZATCA
export interface ZATCAResponse {
  success: boolean;
  uuid?: string;
  hash?: string;
  qrCode?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationResults?: any[];
  errorMessage?: string;
  timestamp: Date;
}

/**
 * فئة إدارة الفواتير
 */
export class InvoiceManager {
  private static instance: InvoiceManager;

  private constructor() {}

  public static getInstance(): InvoiceManager {
    if (!InvoiceManager.instance) {
      InvoiceManager.instance = new InvoiceManager();
    }
    return InvoiceManager.instance;
  }

  /**
   * إنشاء فاتورة جديدة
   */
  createInvoice(request: CreateInvoiceRequest): Invoice {
    try {
      zatcaLogger.invoice('Creating new invoice', undefined, request);

      // التحقق من صحة البيانات
      this.validateInvoiceRequest(request);

      // إنشاء رقم فاتورة تلقائي
      const invoiceNumber = this.generateInvoiceNumber(request.invoiceType);

      // حساب المبالغ
      const calculations = this.calculateInvoiceAmounts(request.lineItems);

      // إنشاء كائن الفاتورة
      const invoice: Invoice = {
        id: this.generateUUID(),
        invoiceNumber,
        invoiceType: request.invoiceType,
        companyId: this.getCurrentCompanyId(),
        customerId: request.customerId,
        issueDate: request.issueDate,
        dueDate: request.dueDate,
        supplyDate: request.supplyDate || request.issueDate,
        currency: request.currency,
        exchangeRate: 1, // افتراضي للريال السعودي
        subTotal: calculations.subTotal,
        vatAmount: calculations.vatAmount,
        totalAmount: calculations.totalAmount,
        status: 'draft',
        zatcaStatus: 'not_sent',
        notes: request.notes,
        lineItems: request.lineItems.map((item, index) => ({
          ...item,
          id: this.generateUUID(),
          invoiceId: '',
          lineNumber: index + 1,
        })),
      };

      // تعيين معرف الفاتورة لبنود الفاتورة
      invoice.lineItems.forEach((item) => {
        item.invoiceId = invoice.id!;
      });

      // حفظ في قاعدة البيانات
      this.saveInvoiceToDatabase(invoice);

      zatcaLogger.invoice('Invoice created successfully', invoice.invoiceNumber, {
        invoiceId: invoice.id,
        totalAmount: invoice.totalAmount,
      });

      notificationManager.invoiceCreated(invoice.invoiceNumber);

      return invoice;
    } catch (error) {
      zatcaLogger.error('Failed to create invoice', error as Error, request);
      notificationManager.error('فشل في إنشاء الفاتورة');
      throw error;
    }
  }

  /**
   * تحديث فاتورة موجودة
   */
  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice> {
    try {
      zatcaLogger.invoice('Updating invoice', invoiceId, updates);

      // التحقق من وجود الفاتورة
      const existingInvoice = await this.getInvoiceById(invoiceId);
      if (!existingInvoice) {
        throw new Error('Invoice not found');
      }

      // التحقق من إمكانية التعديل
      if (existingInvoice.zatcaStatus === 'approved') {
        throw new Error('Cannot update approved invoice');
      }

      // دمج التحديثات
      const updatedInvoice: Invoice = {
        ...existingInvoice,
        ...updates,
        id: invoiceId,
      };

      // إعادة حساب المبالغ إذا تم تعديل البنود
      if (updates.lineItems) {
        const calculations = this.calculateInvoiceAmounts(updates.lineItems);
        updatedInvoice.subTotal = calculations.subTotal;
        updatedInvoice.vatAmount = calculations.vatAmount;
        updatedInvoice.totalAmount = calculations.totalAmount;
      }

      // حفظ التحديثات
      this.updateInvoiceInDatabase(updatedInvoice);

      zatcaLogger.invoice('Invoice updated successfully', updatedInvoice.invoiceNumber);
      notificationManager.success('تم تحديث الفاتورة بنجاح');

      return updatedInvoice;
    } catch (error) {
      zatcaLogger.error('Failed to update invoice', error as Error, { invoiceId, updates });
      notificationManager.error('فشل في تحديث الفاتورة');
      throw error;
    }
  }

  /**
   * إرسال فاتورة إلى ZATCA
   */
  async submitInvoiceToZATCA(invoiceId: string): Promise<ZATCAResponse> {
    try {
      zatcaLogger.zatca('Submitting invoice to ZATCA', { invoiceId });

      // الحصول على الفاتورة
      const invoice = await this.getInvoiceById(invoiceId);
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // التحقق من حالة الفاتورة
      if (invoice.status !== 'issued') {
        throw new Error('Invoice must be issued before submission');
      }

      // تحويل الفاتورة إلى XML
      this.generateInvoiceXML();

      // توقيع الفاتورة رقمياً
      this.signInvoiceXML();

      // إنشاء QR Code
      this.generateQRCode();

      // إرسال إلى ZATCA
      const zatcaResponse = this.sendToZATCAAPI();

      // تحديث حالة الفاتورة
      this.updateInvoiceZATCAStatus(invoiceId, zatcaResponse);

      if (zatcaResponse.success) {
        zatcaLogger.zatca('Invoice submitted successfully', {
          invoiceId,
          uuid: zatcaResponse.uuid,
        });
        notificationManager.invoiceSent(invoice.invoiceNumber);
      } else {
        zatcaLogger.error('ZATCA submission failed', new Error(zatcaResponse.errorMessage), {
          invoiceId,
          response: zatcaResponse,
        });
        notificationManager.invoiceRejected(invoice.invoiceNumber, zatcaResponse.errorMessage);
      }

      return zatcaResponse;
    } catch (error) {
      zatcaLogger.error('Failed to submit invoice to ZATCA', error as Error, { invoiceId });
      notificationManager.error('فشل في إرسال الفاتورة إلى منصة فاتورة');
      throw error;
    }
  }

  /**
   * الحصول على فاتورة بالمعرف
   */
  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    try {
      if (!databaseManager.isConnected()) {
        throw new Error('Database not connected');
      }

      const query = `
        SELECT * FROM Invoices
        WHERE InvoiceID = ?
      `;

      const result = await databaseManager.executeQuery(query, [invoiceId]);

      if (result.recordset.length === 0) {
        return null;
      }

      const invoiceData = result.recordset[0];

      // الحصول على بنود الفاتورة
      const lineItemsQuery = `
        SELECT * FROM InvoiceLineItems
        WHERE InvoiceID = ?
        ORDER BY LineNumber
      `;

      const lineItemsResult = await databaseManager.executeQuery(lineItemsQuery, [invoiceId]);

      return {
        ...invoiceData,
        lineItems: lineItemsResult.recordset,
      };
    } catch (error) {
      zatcaLogger.error('Failed to get invoice by ID', error as Error, { invoiceId });
      throw error;
    }
  }

  /**
   * البحث في الفواتير
   */
  async searchInvoices(criteria: {
    customerId?: string;
    status?: InvoiceStatus;
    zatcaStatus?: ZATCAStatus;
    dateFrom?: Date;
    dateTo?: Date;
    invoiceNumber?: string;
    limit?: number;
    offset?: number;
  }): Promise<Invoice[]> {
    try {
      let query = 'SELECT * FROM Invoices WHERE 1=1';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any[] = [];

      if (criteria.customerId) {
        query += ' AND CustomerID = ?';
        params.push(criteria.customerId);
      }

      if (criteria.status) {
        query += ' AND Status = ?';
        params.push(this.getStatusCode(criteria.status));
      }

      if (criteria.zatcaStatus) {
        query += ' AND ZATCAStatus = ?';
        params.push(this.getZATCAStatusCode(criteria.zatcaStatus));
      }

      if (criteria.dateFrom) {
        query += ' AND IssueDate >= ?';
        params.push(criteria.dateFrom);
      }

      if (criteria.dateTo) {
        query += ' AND IssueDate <= ?';
        params.push(criteria.dateTo);
      }

      if (criteria.invoiceNumber) {
        query += ' AND InvoiceNumber LIKE ?';
        params.push(`%${criteria.invoiceNumber}%`);
      }

      query += ' ORDER BY CreatedAt DESC';

      if (criteria.limit) {
        query += ` OFFSET ${criteria.offset || 0} ROWS FETCH NEXT ${criteria.limit} ROWS ONLY`;
      }

      const result = await databaseManager.executeQuery(query, params);
      return result.recordset;
    } catch (error) {
      zatcaLogger.error('Failed to search invoices', error as Error, criteria);
      throw error;
    }
  }

  // وظائف مساعدة

  private validateInvoiceRequest(request: CreateInvoiceRequest): void {
    if (!request.customerId) {
      throw new Error('Customer ID is required');
    }

    if (!request.lineItems || request.lineItems.length === 0) {
      throw new Error('Invoice must have at least one line item');
    }

    for (const item of request.lineItems) {
      if (!item.descriptionAr) {
        throw new Error('Line item description in Arabic is required');
      }

      if (item.quantity <= 0) {
        throw new Error('Line item quantity must be greater than zero');
      }

      if (item.unitPrice < 0) {
        throw new Error('Line item unit price cannot be negative');
      }
    }
  }

  private calculateInvoiceAmounts(lineItems: Omit<InvoiceLineItem, 'id' | 'invoiceId'>[]): {
    subTotal: number;
    vatAmount: number;
    totalAmount: number;
  } {
    let subTotal = 0;
    let vatAmount = 0;

    for (const item of lineItems) {
      const lineTotal = item.quantity * item.unitPrice;
      const lineVAT = lineTotal * (item.vatRate / 100);

      subTotal += lineTotal;
      vatAmount += lineVAT;
    }

    const totalAmount = subTotal + vatAmount;

    return {
      subTotal: Math.round(subTotal * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  }

  private generateInvoiceNumber(type: InvoiceType): string {
    // منطق إنشاء رقم فاتورة تلقائي
    const prefix = type === 'simplified' ? 'S' : 'I';
    const timestamp = Date.now().toString().slice(-8);
    return `${prefix}${timestamp}`;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  private getCurrentCompanyId(): string {
    // الحصول على معرف الشركة الحالية
    return 'default-company-id';
  }

  private saveInvoiceToDatabase(invoice: Invoice): void {
    // حفظ الفاتورة في قاعدة البيانات
    // هذا مثال - يحتاج لتنفيذ فعلي
    zatcaLogger.database('Saving invoice to database', undefined, { invoiceId: invoice.id });
  }

  private updateInvoiceInDatabase(invoice: Invoice): void {
    // تحديث الفاتورة في قاعدة البيانات
    zatcaLogger.database('Updating invoice in database', undefined, { invoiceId: invoice.id });
  }

  private generateInvoiceXML(): string {
    // إنشاء XML للفاتورة حسب معايير UBL 2.1
    return '<Invoice>...</Invoice>';
  }

  private signInvoiceXML(): string {
    // توقيع XML رقمياً
    return '<SignedInvoice>...</SignedInvoice>';
  }

  private generateQRCode(): string {
    // إنشاء QR Code حسب معايير ZATCA
    return 'qr-code-data';
  }

  private sendToZATCAAPI(): ZATCAResponse {
    // إرسال إلى API منصة فاتورة
    // محاكاة الاستجابة
    return {
      success: true,
      uuid: this.generateUUID(),
      hash: 'sample-hash',
      qrCode: 'sample-qr-code',
      timestamp: new Date(),
    };
  }

  private updateInvoiceZATCAStatus(invoiceId: string, response: ZATCAResponse): void {
    // تحديث حالة ZATCA للفاتورة
    zatcaLogger.database('Updating invoice ZATCA status', undefined, { invoiceId, response });
  }

  private getStatusCode(status: InvoiceStatus): number {
    const statusMap = {
      draft: 1,
      issued: 2,
      sent: 3,
      approved: 4,
      rejected: 5,
      paid: 6,
      cancelled: 7,
    };
    return statusMap[status] || 1;
  }

  private getZATCAStatusCode(status: ZATCAStatus): number {
    const statusMap = {
      not_sent: 0,
      sent: 1,
      approved: 2,
      rejected: 3,
    };
    return statusMap[status] || 0;
  }
}

// تصدير instance واحد
export const invoiceManager = InvoiceManager.getInstance();
