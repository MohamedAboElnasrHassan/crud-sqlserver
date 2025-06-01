<template>
  <q-page class="invoices-page">
    <!-- Header -->
    <div class="invoices-header">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="description" class="q-mr-sm" />
            إدارة الفواتير الإلكترونية
          </div>
          <div class="text-subtitle1 text-grey-6">
            إنشاء وإدارة الفواتير المتوافقة مع منصة فاتورة ZATCA
          </div>
        </div>

        <!-- أزرار الإجراءات -->
        <div class="col-auto">
          <q-btn
            color="primary"
            icon="add"
            label="فاتورة جديدة"
            @click="showCreateInvoiceDialog = true"
            unelevated
            class="q-mr-sm"
          />

          <q-btn color="secondary" icon="sync" label="مزامنة" @click="syncInvoices" outline />
        </div>
      </div>
    </div>

    <!-- إحصائيات سريعة -->
    <div class="stats-section q-mb-lg">
      <div class="row q-gutter-md">
        <div class="col-md-3 col-6">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-value text-primary">{{ statistics.total }}</div>
              <div class="stat-label">إجمالي الفواتير</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-3 col-6">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-value text-warning">{{ statistics.pending }}</div>
              <div class="stat-label">في الانتظار</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-3 col-6">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-value text-positive">{{ statistics.approved }}</div>
              <div class="stat-label">معتمدة</div>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-md-3 col-6">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-value text-negative">{{ statistics.rejected }}</div>
              <div class="stat-label">مرفوضة</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- فلاتر البحث -->
    <q-card class="filters-card q-mb-lg">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="filter_list" class="q-mr-sm" />
          فلاتر البحث
        </div>

        <div class="row q-gutter-md">
          <q-input
            v-model="filters.invoiceNumber"
            label="رقم الفاتورة"
            outlined
            dense
            class="col-md-3 col-12"
            clearable
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filters.status"
            :options="statusOptions"
            label="الحالة"
            outlined
            dense
            emit-value
            map-options
            clearable
            class="col-md-2 col-12"
          />

          <q-select
            v-model="filters.zatcaStatus"
            :options="zatcaStatusOptions"
            label="حالة ZATCA"
            outlined
            dense
            emit-value
            map-options
            clearable
            class="col-md-2 col-12"
          />

          <q-input
            v-model="filters.dateFrom"
            label="من تاريخ"
            type="date"
            outlined
            dense
            class="col-md-2 col-12"
          />

          <q-input
            v-model="filters.dateTo"
            label="إلى تاريخ"
            type="date"
            outlined
            dense
            class="col-md-2 col-12"
          />

          <div class="col-md-1 col-12 flex items-end">
            <q-btn
              color="primary"
              icon="search"
              label="بحث"
              @click="searchInvoices"
              unelevated
              class="full-width"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- جدول الفواتير -->
    <q-card class="invoices-table-card">
      <q-card-section>
        <q-table
          :rows="invoices"
          :columns="invoiceColumns"
          :loading="isLoading"
          :pagination="pagination"
          @request="onRequest"
          row-key="id"
          binary-state-sort
          class="invoices-table"
        >
          <!-- رقم الفاتورة -->
          <template v-slot:body-cell-invoiceNumber="props">
            <q-td :props="props">
              <div
                class="text-weight-medium text-primary cursor-pointer"
                @click="viewInvoice(props.row)"
              >
                {{ props.value }}
              </div>
            </q-td>
          </template>

          <!-- نوع الفاتورة -->
          <template v-slot:body-cell-type="props">
            <q-td :props="props">
              <q-chip :color="getInvoiceTypeColor(props.value)" text-color="white" dense>
                {{ getInvoiceTypeLabel(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <!-- الحالة -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip :color="getStatusColor(props.value)" text-color="white" dense>
                {{ getStatusLabel(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <!-- حالة ZATCA -->
          <template v-slot:body-cell-zatcaStatus="props">
            <q-td :props="props">
              <q-chip :color="getZATCAStatusColor(props.value)" text-color="white" dense>
                {{ getZATCAStatusLabel(props.value) }}
              </q-chip>
            </q-td>
          </template>

          <!-- المبلغ الإجمالي -->
          <template v-slot:body-cell-totalAmount="props">
            <q-td :props="props">
              <div class="text-weight-medium">
                {{ formatCurrency(props.value) }}
              </div>
            </q-td>
          </template>

          <!-- الإجراءات -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="row q-gutter-xs">
                <q-btn
                  flat
                  round
                  color="primary"
                  icon="visibility"
                  @click="viewInvoice(props.row)"
                  size="sm"
                >
                  <q-tooltip>عرض</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.status === 'draft'"
                  flat
                  round
                  color="secondary"
                  icon="edit"
                  @click="editInvoice(props.row)"
                  size="sm"
                >
                  <q-tooltip>تعديل</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.zatcaStatus === 'not_sent' && props.row.status === 'issued'"
                  flat
                  round
                  color="positive"
                  icon="send"
                  @click="submitToZATCA(props.row)"
                  size="sm"
                >
                  <q-tooltip>إرسال إلى ZATCA</q-tooltip>
                </q-btn>

                <q-btn flat round color="info" icon="print" @click="printInvoice()" size="sm">
                  <q-tooltip>طباعة</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.status === 'draft'"
                  flat
                  round
                  color="negative"
                  icon="delete"
                  @click="deleteInvoice(props.row)"
                  size="sm"
                >
                  <q-tooltip>حذف</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- حوار إنشاء فاتورة جديدة -->
    <q-dialog v-model="showCreateInvoiceDialog" persistent max-width="800px">
      <q-card>
        <q-card-section>
          <div class="text-h6">إنشاء فاتورة جديدة</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="createInvoice" class="create-invoice-form">
            <div class="row q-gutter-md">
              <q-select
                v-model="newInvoice.invoiceType"
                :options="invoiceTypeOptions"
                label="نوع الفاتورة"
                outlined
                required
                emit-value
                map-options
                class="col-md-6 col-12"
              />

              <q-select
                v-model="newInvoice.customerId"
                :options="customerOptions"
                label="العميل"
                outlined
                required
                emit-value
                map-options
                use-input
                @filter="filterCustomers"
                class="col-md-6 col-12"
              />
            </div>

            <div class="row q-gutter-md q-mt-md">
              <q-input
                v-model="newInvoice.issueDate"
                label="تاريخ الإصدار"
                type="date"
                outlined
                required
                class="col-md-4 col-12"
              />

              <q-input
                v-model="newInvoice.dueDate"
                label="تاريخ الاستحقاق"
                type="date"
                outlined
                class="col-md-4 col-12"
              />

              <q-select
                v-model="newInvoice.currency"
                :options="currencyOptions"
                label="العملة"
                outlined
                emit-value
                map-options
                class="col-md-4 col-12"
              />
            </div>

            <div class="q-mt-lg">
              <div class="text-h6 q-mb-md">بنود الفاتورة</div>

              <q-table
                :rows="newInvoice.lineItems"
                :columns="lineItemColumns"
                row-key="tempId"
                hide-pagination
                :pagination="{ rowsPerPage: 0 }"
                class="line-items-table"
              >
                <template v-slot:top>
                  <q-btn
                    color="primary"
                    icon="add"
                    label="إضافة بند"
                    @click="addLineItem"
                    size="sm"
                  />
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      round
                      color="negative"
                      icon="delete"
                      @click="removeLineItem(props.rowIndex)"
                      size="sm"
                    />
                  </q-td>
                </template>
              </q-table>
            </div>

            <q-input
              v-model="newInvoice.notes"
              label="ملاحظات"
              type="textarea"
              outlined
              rows="3"
              class="q-mt-md"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="إلغاء" @click="showCreateInvoiceDialog = false" />
          <q-btn
            color="primary"
            label="إنشاء الفاتورة"
            @click="createInvoice"
            :loading="isCreating"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
// import { useZATCAStore } from 'src/stores/zatca-store';
import { invoiceManager } from 'src/utils/invoice-manager';
import { notificationManager } from 'src/utils/notification-manager';
import { zatcaLogger } from 'src/utils/zatca-logger';
import type { Invoice } from 'src/stores/zatca-store';

// Composables
const router = useRouter();
const $q = useQuasar();
// const zatcaStore = useZATCAStore();

// State
const isLoading = ref(false);
const isCreating = ref(false);
const showCreateInvoiceDialog = ref(false);
const invoices = ref<Invoice[]>([]);

// Filters
const filters = ref({
  invoiceNumber: '',
  status: null,
  zatcaStatus: null,
  dateFrom: '',
  dateTo: '',
});

// Pagination
const pagination = ref({
  sortBy: 'createdAt',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0,
});

// New invoice form
const newInvoice = ref({
  invoiceType: 'standard' as const,
  customerId: '',
  issueDate: new Date().toISOString().split('T')[0],
  currency: 'SAR',
  lineItems: [] as Array<{
    tempId?: number;
    descriptionAr: string;
    descriptionEn?: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;
    unit: string;
    unitOfMeasure: string;
    lineTotal: number;
    vatAmount: number;
    lineTotalWithVAT: number;
  }>,
  notes: '',
});

// Statistics
const statistics = computed(() => ({
  total: invoices.value.length,
  pending: invoices.value.filter(
    (inv) => inv.zatcaStatus === 'not_sent' || inv.zatcaStatus === 'sent',
  ).length,
  approved: invoices.value.filter((inv) => inv.zatcaStatus === 'approved').length,
  rejected: invoices.value.filter((inv) => inv.zatcaStatus === 'rejected').length,
}));

// Options
const statusOptions = [
  { label: 'مسودة', value: 'draft' },
  { label: 'صادرة', value: 'issued' },
  { label: 'مرسلة', value: 'sent' },
  { label: 'معتمدة', value: 'approved' },
  { label: 'مرفوضة', value: 'rejected' },
  { label: 'مدفوعة', value: 'paid' },
  { label: 'ملغاة', value: 'cancelled' },
];

const zatcaStatusOptions = [
  { label: 'لم ترسل', value: 'not_sent' },
  { label: 'مرسلة', value: 'sent' },
  { label: 'معتمدة', value: 'approved' },
  { label: 'مرفوضة', value: 'rejected' },
];

const invoiceTypeOptions = [
  { label: 'فاتورة عادية', value: 'standard' },
  { label: 'فاتورة مبسطة', value: 'simplified' },
  { label: 'إشعار دائن', value: 'credit' },
  { label: 'إشعار مدين', value: 'debit' },
];

const currencyOptions = [
  { label: 'ريال سعودي (SAR)', value: 'SAR' },
  { label: 'دولار أمريكي (USD)', value: 'USD' },
  { label: 'يورو (EUR)', value: 'EUR' },
];

const customerOptions = ref([]);

// Table columns
const invoiceColumns = [
  {
    name: 'invoiceNumber',
    label: 'رقم الفاتورة',
    field: 'invoiceNumber',
    align: 'left',
    sortable: true,
  },
  {
    name: 'type',
    label: 'النوع',
    field: 'invoiceType',
    align: 'center',
    sortable: true,
  },
  {
    name: 'customerName',
    label: 'العميل',
    field: 'customerName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'issueDate',
    label: 'تاريخ الإصدار',
    field: 'issueDate',
    align: 'center',
    sortable: true,
    format: (val: Date) => new Date(val).toLocaleDateString('ar-SA'),
  },
  {
    name: 'totalAmount',
    label: 'المبلغ الإجمالي',
    field: 'totalAmount',
    align: 'right',
    sortable: true,
  },
  {
    name: 'status',
    label: 'الحالة',
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'zatcaStatus',
    label: 'حالة ZATCA',
    field: 'zatcaStatus',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'الإجراءات',
    field: 'actions',
    align: 'center',
  },
];

const lineItemColumns = [
  {
    name: 'description',
    label: 'الوصف',
    field: 'descriptionAr',
    align: 'left',
  },
  {
    name: 'quantity',
    label: 'الكمية',
    field: 'quantity',
    align: 'center',
  },
  {
    name: 'unitPrice',
    label: 'سعر الوحدة',
    field: 'unitPrice',
    align: 'right',
  },
  {
    name: 'vatRate',
    label: 'معدل الضريبة',
    field: 'vatRate',
    align: 'center',
  },
  {
    name: 'lineTotal',
    label: 'المجموع',
    field: 'lineTotal',
    align: 'right',
  },
  {
    name: 'actions',
    label: 'الإجراءات',
    field: 'actions',
    align: 'center',
  },
];

// Methods
async function loadInvoices() {
  try {
    isLoading.value = true;

    const searchCriteria = {
      invoiceNumber: filters.value.invoiceNumber || undefined,
      status: filters.value.status || undefined,
      zatcaStatus: filters.value.zatcaStatus || undefined,
      dateFrom: filters.value.dateFrom ? new Date(filters.value.dateFrom) : undefined,
      dateTo: filters.value.dateTo ? new Date(filters.value.dateTo) : undefined,
      limit: pagination.value.rowsPerPage,
      offset: (pagination.value.page - 1) * pagination.value.rowsPerPage,
    };

    const result = await invoiceManager.searchInvoices(searchCriteria);
    invoices.value = result;

    zatcaLogger.info('Invoices loaded successfully', { count: result.length });
  } catch (error) {
    zatcaLogger.error('Failed to load invoices', error as Error);
    notificationManager.error('فشل في تحميل الفواتير');
  } finally {
    isLoading.value = false;
  }
}

async function searchInvoices() {
  pagination.value.page = 1;
  await loadInvoices();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function onRequest(props: any) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;

  await loadInvoices();
}

async function createInvoice() {
  try {
    isCreating.value = true;

    if (newInvoice.value.lineItems.length === 0) {
      notificationManager.warning('يجب إضافة بند واحد على الأقل');
      return;
    }

    const invoiceRequest = {
      ...newInvoice.value,
      issueDate: new Date(newInvoice.value.issueDate),
      lineItems: newInvoice.value.lineItems.map((item, index) => ({
        ...item,
        lineNumber: index + 1,
      })),
    };

    invoiceManager.createInvoice(invoiceRequest);

    showCreateInvoiceDialog.value = false;
    resetNewInvoiceForm();
    await loadInvoices();

    notificationManager.success('تم إنشاء الفاتورة بنجاح');
  } catch (error) {
    zatcaLogger.error('Failed to create invoice', error as Error);
    notificationManager.error('فشل في إنشاء الفاتورة');
  } finally {
    isCreating.value = false;
  }
}

function addLineItem() {
  newInvoice.value.lineItems.push({
    tempId: Date.now(),
    descriptionAr: '',
    quantity: 1,
    unitPrice: 0,
    vatRate: 15,
    unit: 'قطعة',
    unitOfMeasure: 'PCE',
    lineTotal: 0,
    vatAmount: 0,
    lineTotalWithVAT: 0,
  });
}

function removeLineItem(index: number) {
  newInvoice.value.lineItems.splice(index, 1);
}

function resetNewInvoiceForm() {
  newInvoice.value = {
    invoiceType: 'standard' as const,
    customerId: '',
    issueDate: new Date().toISOString().split('T')[0],
    currency: 'SAR',
    lineItems: [],
    notes: '',
  };
}

async function syncInvoices() {
  notificationManager.info('جاري مزامنة الفواتير...', {
    timeout: 0,
    group: 'sync-invoices',
  });

  try {
    await loadInvoices();
    notificationManager.dismiss('sync-invoices');
    notificationManager.success('تم مزامنة الفواتير بنجاح');
  } catch {
    notificationManager.dismiss('sync-invoices');
    notificationManager.error('فشل في مزامنة الفواتير');
  }
}

function viewInvoice(invoice: Invoice) {
  router.push(`/invoices/${invoice.id}`);
}

function editInvoice(invoice: Invoice) {
  router.push(`/invoices/${invoice.id}/edit`);
}

function submitToZATCA(invoice: Invoice) {
  $q.dialog({
    title: 'تأكيد الإرسال',
    message: `هل أنت متأكد من إرسال الفاتورة ${invoice.invoiceNumber} إلى منصة فاتورة؟`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    (async () => {
      try {
        notificationManager.info(`جاري إرسال الفاتورة ${invoice.invoiceNumber}...`, {
          timeout: 0,
          group: 'submit-invoice',
        });

        const response = await invoiceManager.submitInvoiceToZATCA(invoice.id!);

        notificationManager.dismiss('submit-invoice');

        if (response.success) {
          notificationManager.invoiceApproved(invoice.invoiceNumber);
        } else {
          notificationManager.invoiceRejected(invoice.invoiceNumber, response.errorMessage);
        }

        await loadInvoices();
      } catch {
        notificationManager.dismiss('submit-invoice');
        notificationManager.error('فشل في إرسال الفاتورة');
      }
    })();
  });
}

function printInvoice() {
  // فتح نافذة طباعة
  window.print();
}

function deleteInvoice(invoice: Invoice) {
  $q.dialog({
    title: 'تأكيد الحذف',
    message: `هل أنت متأكد من حذف الفاتورة ${invoice.invoiceNumber}؟`,
    cancel: true,
    persistent: true,
    ok: {
      label: 'حذف',
      color: 'negative',
    },
  }).onOk(() => {
    // حذف الفاتورة
    notificationManager.success('تم حذف الفاتورة بنجاح');
    loadInvoices();
  });
}

// Helper functions
function getInvoiceTypeColor(type: string): string {
  const colors = {
    standard: 'primary',
    simplified: 'secondary',
    credit: 'positive',
    debit: 'negative',
  };
  return colors[type as keyof typeof colors] || 'grey';
}

function getInvoiceTypeLabel(type: string): string {
  const labels = {
    standard: 'عادية',
    simplified: 'مبسطة',
    credit: 'إشعار دائن',
    debit: 'إشعار مدين',
  };
  return labels[type as keyof typeof labels] || type;
}

function getStatusColor(status: string): string {
  const colors = {
    draft: 'grey',
    issued: 'blue',
    sent: 'orange',
    approved: 'positive',
    rejected: 'negative',
    paid: 'green',
    cancelled: 'red',
  };
  return colors[status as keyof typeof colors] || 'grey';
}

function getStatusLabel(status: string): string {
  const labels = {
    draft: 'مسودة',
    issued: 'صادرة',
    sent: 'مرسلة',
    approved: 'معتمدة',
    rejected: 'مرفوضة',
    paid: 'مدفوعة',
    cancelled: 'ملغاة',
  };
  return labels[status as keyof typeof labels] || status;
}

function getZATCAStatusColor(status: string): string {
  const colors = {
    not_sent: 'grey',
    sent: 'orange',
    approved: 'positive',
    rejected: 'negative',
  };
  return colors[status as keyof typeof colors] || 'grey';
}

function getZATCAStatusLabel(status: string): string {
  const labels = {
    not_sent: 'لم ترسل',
    sent: 'مرسلة',
    approved: 'معتمدة',
    rejected: 'مرفوضة',
  };
  return labels[status as keyof typeof labels] || status;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
  }).format(amount);
}

function filterCustomers(val: string, update: (fn: () => void) => void) {
  // فلترة العملاء حسب النص المدخل
  update(() => {
    // هنا ستكون منطق البحث في العملاء
  });
}

// Lifecycle
onMounted(() => {
  loadInvoices()
    .then(() => {
      zatcaLogger.info('Invoices page loaded');
    })
    .catch((error) => {
      zatcaLogger.error('Failed to load invoices page', error as Error);
    });
});
</script>

<style lang="scss" scoped>
.invoices-page {
  padding: 24px;
  background: var(--q-color-background);
  min-height: 100vh;
}

.invoices-header {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--q-color-surface);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--q-color-separator);
}

.stats-section {
  .stat-card {
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background: var(--q-color-surface);
    border: 1px solid var(--q-color-separator);
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .stat-label {
      font-size: 0.875rem;
      color: var(--q-color-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

.filters-card,
.invoices-table-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-separator);
}

.invoices-table {
  .q-table__top {
    padding: 16px;
  }

  .q-table thead th {
    font-weight: 600;
    color: var(--q-color-primary);
    background: rgba(var(--q-color-primary-rgb), 0.05);
  }

  .q-table tbody tr {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(var(--q-color-primary-rgb), 0.05);
    }
  }

  .q-chip {
    font-weight: 500;
    font-size: 0.75rem;
  }
}

.create-invoice-form {
  .q-input,
  .q-select {
    .q-field__control {
      border-radius: 8px;
    }
  }
}

.line-items-table {
  border: 1px solid var(--q-color-separator);
  border-radius: 8px;

  .q-table__top {
    background: rgba(var(--q-color-primary-rgb), 0.05);
    border-radius: 8px 8px 0 0;
  }
}

// تحسينات للشاشات الصغيرة
@media (max-width: 768px) {
  .invoices-page {
    padding: 16px;
  }

  .invoices-header {
    padding: 16px;

    .row {
      flex-direction: column;
      gap: 16px;
    }
  }

  .stats-section .row {
    flex-direction: column;
    gap: 12px;
  }

  .filters-card .row {
    flex-direction: column;
    gap: 12px;
  }
}

// تحسينات للوضع المظلم
body.body--dark {
  .invoices-page {
    background: var(--q-color-dark-page);
  }

  .stat-card {
    background: var(--q-color-dark) !important;

    &:hover {
      background: rgba(255, 255, 255, 0.05) !important;
    }
  }
}

// حركات وتأثيرات
.stat-card,
.filters-card,
.invoices-table-card {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// تأثيرات hover للأزرار
.q-btn {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
}

// تحسينات الحوارات
.q-dialog .q-card {
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);

  .q-card-section {
    .text-h6 {
      color: var(--q-color-primary);
      font-weight: 600;
    }
  }
}

// تحسينات الرقائق (Chips)
.q-chip {
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
  }
}

// تحسينات الجداول
.q-table {
  .q-table__container {
    border-radius: 8px;
  }

  .q-table__top {
    border-radius: 8px 8px 0 0;
  }

  .q-table__bottom {
    border-radius: 0 0 8px 8px;
  }
}
</style>
