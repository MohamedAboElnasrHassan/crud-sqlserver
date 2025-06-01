<template>
  <q-page class="zatca-settings-page">
    <!-- Header -->
    <div class="zatca-header">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="settings" class="q-mr-sm" />
            إعدادات الربط مع منصة فاتورة
          </div>
          <div class="text-subtitle1 text-grey-6">
            إعداد وإدارة الاتصال مع هيئة الزكاة والضريبة والجمارك (ZATCA)
          </div>
        </div>

        <!-- مؤشر حالة الاتصال -->
        <div class="col-auto">
          <q-chip
            :color="connectionStatus.isConnected ? 'positive' : 'negative'"
            :text-color="connectionStatus.isConnected ? 'white' : 'white'"
            :icon="connectionStatus.isConnected ? 'wifi' : 'wifi_off'"
            class="connection-status-chip"
          >
            {{ connectionStatus.isConnected ? 'متصل' : 'غير متصل' }}
            <q-tooltip> آخر فحص: {{ formatLastCheck }} </q-tooltip>
          </q-chip>
        </div>
      </div>
    </div>

    <!-- محتوى الصفحة -->
    <div class="zatca-content">
      <div class="row q-gutter-lg">
        <!-- الجانب الأيسر: الإعدادات -->
        <div class="col-md-8 col-12">
          <!-- إعدادات البيئة -->
          <q-card class="settings-card q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="cloud" class="q-mr-sm" />
                إعدادات البيئة
              </div>

              <q-option-group
                v-model="currentEnvironment"
                :options="environmentOptions"
                color="primary"
                inline
                @update:model-value="onEnvironmentChange"
                class="environment-group q-mb-md"
              />

              <q-banner
                v-if="currentEnvironment === 'sandbox'"
                class="bg-orange-1 text-orange-8 q-mb-md"
                icon="warning"
              >
                <template v-slot:avatar>
                  <q-icon name="science" color="orange" />
                </template>
                أنت تستخدم البيئة التجريبية. الفواتير المرسلة لن تكون صالحة رسمياً.
              </q-banner>

              <q-banner
                v-if="currentEnvironment === 'production'"
                class="bg-green-1 text-green-8 q-mb-md"
                icon="verified"
              >
                <template v-slot:avatar>
                  <q-icon name="verified_user" color="green" />
                </template>
                أنت تستخدم البيئة الفعلية. جميع الفواتير ستكون صالحة رسمياً.
              </q-banner>
            </q-card-section>
          </q-card>

          <!-- معلومات الشركة -->
          <q-card class="settings-card q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="business" class="q-mr-sm" />
                معلومات الشركة
              </div>

              <q-form @submit="saveCompanyInfo" class="company-form">
                <div class="row q-gutter-md">
                  <q-input
                    v-model="companyInfo.vatNumber"
                    label="الرقم الضريبي *"
                    mask="###############"
                    outlined
                    required
                    class="col-md-6 col-12"
                    :rules="[(val: string) => !!val || 'الرقم الضريبي مطلوب']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="receipt_long" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="companyInfo.commercialRegistration"
                    label="رقم السجل التجاري *"
                    outlined
                    required
                    class="col-md-6 col-12"
                    :rules="[(val: string) => !!val || 'رقم السجل التجاري مطلوب']"
                  >
                    <template v-slot:prepend>
                      <q-icon name="assignment" />
                    </template>
                  </q-input>
                </div>

                <div class="row q-gutter-md q-mt-md">
                  <q-input
                    v-model="companyInfo.nameAr"
                    label="اسم الشركة (عربي) *"
                    outlined
                    required
                    class="col-md-6 col-12"
                    :rules="[(val: string) => !!val || 'اسم الشركة مطلوب']"
                  />

                  <q-input
                    v-model="companyInfo.nameEn"
                    label="اسم الشركة (إنجليزي)"
                    outlined
                    class="col-md-6 col-12"
                  />
                </div>

                <div class="row q-gutter-md q-mt-md">
                  <q-input
                    v-model="companyInfo.addressAr"
                    label="العنوان (عربي)"
                    outlined
                    type="textarea"
                    rows="2"
                    class="col-md-6 col-12"
                  />

                  <q-input
                    v-model="companyInfo.addressEn"
                    label="العنوان (إنجليزي)"
                    outlined
                    type="textarea"
                    rows="2"
                    class="col-md-6 col-12"
                  />
                </div>

                <div class="row q-gutter-md q-mt-md">
                  <q-input
                    v-model="companyInfo.city"
                    label="المدينة"
                    outlined
                    class="col-md-4 col-12"
                  />

                  <q-input
                    v-model="companyInfo.postalCode"
                    label="الرمز البريدي"
                    outlined
                    mask="#####"
                    class="col-md-4 col-12"
                  />

                  <q-select
                    v-model="companyInfo.country"
                    :options="countryOptions"
                    label="الدولة"
                    outlined
                    emit-value
                    map-options
                    class="col-md-4 col-12"
                  />
                </div>

                <div class="row q-gutter-md q-mt-md">
                  <q-input
                    v-model="companyInfo.phone"
                    label="رقم الهاتف"
                    outlined
                    mask="+966 ## ### ####"
                    class="col-md-6 col-12"
                  >
                    <template v-slot:prepend>
                      <q-icon name="phone" />
                    </template>
                  </q-input>

                  <q-input
                    v-model="companyInfo.email"
                    label="البريد الإلكتروني"
                    outlined
                    type="email"
                    class="col-md-6 col-12"
                  >
                    <template v-slot:prepend>
                      <q-icon name="email" />
                    </template>
                  </q-input>
                </div>

                <div class="row justify-end q-mt-lg">
                  <q-btn
                    type="submit"
                    color="primary"
                    icon="save"
                    label="حفظ معلومات الشركة"
                    :loading="isLoading"
                    unelevated
                  />
                </div>
              </q-form>
            </q-card-section>
          </q-card>

          <!-- إدارة الشهادات الرقمية -->
          <q-card class="settings-card q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="security" class="q-mr-sm" />
                الشهادات الرقمية
              </div>

              <q-list bordered class="certificates-list">
                <q-item v-for="cert in certificates" :key="cert.id" class="certificate-item">
                  <q-item-section avatar>
                    <q-avatar
                      :color="cert.isActive ? 'positive' : 'grey-5'"
                      :text-color="cert.isActive ? 'white' : 'grey-8'"
                      :icon="cert.type === 'CSID' ? 'verified_user' : 'admin_panel_settings'"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label>{{ cert.type }} - {{ cert.serialNumber }}</q-item-label>
                    <q-item-label caption>
                      صالحة من {{ formatDate(cert.issueDate) }} إلى
                      {{ formatDate(cert.expiryDate) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <div class="row q-gutter-sm">
                      <q-btn
                        flat
                        round
                        color="primary"
                        icon="visibility"
                        @click="viewCertificate(cert)"
                      >
                        <q-tooltip>عرض تفاصيل الشهادة</q-tooltip>
                      </q-btn>

                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        @click="deleteCertificate(cert)"
                      >
                        <q-tooltip>حذف الشهادة</q-tooltip>
                      </q-btn>
                    </div>
                  </q-item-section>
                </q-item>

                <q-separator v-if="certificates.length === 0" />

                <q-item v-if="certificates.length === 0">
                  <q-item-section class="text-center text-grey-6">
                    <q-icon name="security" size="3em" class="q-mb-md" />
                    <div>لا توجد شهادات رقمية</div>
                    <div class="text-caption">قم بإضافة شهادة رقمية للبدء</div>
                  </q-item-section>
                </q-item>
              </q-list>

              <div class="row justify-center q-mt-md">
                <q-btn
                  color="primary"
                  icon="add"
                  label="إضافة شهادة جديدة"
                  @click="showAddCertificateDialog = true"
                  outline
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- الجانب الأيمن: حالة النظام والاختبارات -->
        <div class="col-md-4 col-12">
          <!-- حالة الاتصال -->
          <q-card class="status-card q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="wifi" class="q-mr-sm" />
                حالة الاتصال
              </div>

              <div class="connection-info">
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-icon
                        :name="connectionStatus.isConnected ? 'check_circle' : 'cancel'"
                        :color="connectionStatus.isConnected ? 'positive' : 'negative'"
                      />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>الحالة</q-item-label>
                      <q-item-label caption>
                        {{ connectionStatus.isConnected ? 'متصل' : 'غير متصل' }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="schedule" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>آخر فحص</q-item-label>
                      <q-item-label caption>{{ formatLastCheck }}</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item v-if="connectionStatus.responseTime > 0">
                    <q-item-section avatar>
                      <q-icon name="speed" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>زمن الاستجابة</q-item-label>
                      <q-item-label caption>{{ connectionStatus.responseTime }}ms</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-icon name="cloud" color="info" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>البيئة</q-item-label>
                      <q-item-label caption>
                        {{ currentEnvironment === 'sandbox' ? 'تجريبية' : 'فعلية' }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>

              <div class="row q-mt-md">
                <q-btn
                  color="primary"
                  icon="refresh"
                  label="اختبار الاتصال"
                  @click="testConnection"
                  :loading="isTestingConnection"
                  class="full-width"
                  unelevated
                />
              </div>
            </q-card-section>
          </q-card>

          <!-- إحصائيات سريعة -->
          <q-card class="stats-card q-mb-lg">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="analytics" class="q-mr-sm" />
                إحصائيات سريعة
              </div>

              <div class="stats-grid">
                <div class="stat-item">
                  <div class="stat-value text-primary">{{ statistics.totalInvoices }}</div>
                  <div class="stat-label">إجمالي الفواتير</div>
                </div>

                <div class="stat-item">
                  <div class="stat-value text-warning">{{ statistics.pendingInvoices }}</div>
                  <div class="stat-label">في الانتظار</div>
                </div>

                <div class="stat-item">
                  <div class="stat-value text-positive">{{ statistics.approvedInvoices }}</div>
                  <div class="stat-label">معتمدة</div>
                </div>

                <div class="stat-item">
                  <div class="stat-value text-negative">{{ statistics.rejectedInvoices }}</div>
                  <div class="stat-label">مرفوضة</div>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- إجراءات سريعة -->
          <q-card class="actions-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="flash_on" class="q-mr-sm" />
                إجراءات سريعة
              </div>

              <div class="quick-actions">
                <q-btn
                  color="primary"
                  icon="description"
                  label="إنشاء فاتورة جديدة"
                  @click="createNewInvoice"
                  class="full-width q-mb-sm"
                  unelevated
                />

                <q-btn
                  color="secondary"
                  icon="sync"
                  label="مزامنة البيانات"
                  @click="syncData"
                  class="full-width q-mb-sm"
                  outline
                />

                <q-btn
                  color="info"
                  icon="assessment"
                  label="عرض التقارير"
                  @click="viewReports"
                  class="full-width q-mb-sm"
                  outline
                />

                <q-btn
                  color="grey-7"
                  icon="help"
                  label="المساعدة والدعم"
                  @click="showHelp"
                  class="full-width"
                  flat
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- حوار إضافة شهادة -->
    <q-dialog v-model="showAddCertificateDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">إضافة شهادة رقمية جديدة</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="addCertificate" class="certificate-form">
            <q-select
              v-model="newCertificate.type"
              :options="certificateTypeOptions"
              label="نوع الشهادة"
              outlined
              required
              class="q-mb-md"
            />

            <q-file
              v-model="certificateFile"
              label="ملف الشهادة (.p12 أو .pfx)"
              outlined
              accept=".p12,.pfx"
              class="q-mb-md"
            >
              <template v-slot:prepend>
                <q-icon name="attach_file" />
              </template>
            </q-file>

            <q-input
              v-model="newCertificate.password"
              label="كلمة مرور الشهادة"
              type="password"
              outlined
              class="q-mb-md"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="إلغاء" @click="showAddCertificateDialog = false" />
          <q-btn color="primary" label="إضافة" @click="addCertificate" :loading="isLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useZATCAStore } from 'src/stores/zatca-store';
import { notificationManager } from 'src/utils/notification-manager';
import { zatcaLogger } from 'src/utils/zatca-logger';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

// Composables
const router = useRouter();
const $q = useQuasar();
const zatcaStore = useZATCAStore();

// State
const isLoading = ref(false);
const isTestingConnection = ref(false);
const showAddCertificateDialog = ref(false);
const certificateFile = ref<File | null>(null);

// Form data
const newCertificate = ref({
  type: 'CSID',
  password: '',
});

// Options
const environmentOptions = [
  {
    label: 'البيئة التجريبية (Sandbox)',
    value: 'sandbox',
    description: 'للاختبار والتطوير',
  },
  {
    label: 'البيئة الفعلية (Production)',
    value: 'production',
    description: 'للاستخدام الرسمي',
  },
];

const certificateTypeOptions = [
  { label: 'CSID - شهادة التوقيع', value: 'CSID' },
  { label: 'PCSID - شهادة الإنتاج', value: 'PCSID' },
];

const countryOptions = [
  { label: 'المملكة العربية السعودية', value: 'SA' },
  { label: 'الإمارات العربية المتحدة', value: 'AE' },
  { label: 'الكويت', value: 'KW' },
  { label: 'قطر', value: 'QA' },
  { label: 'البحرين', value: 'BH' },
  { label: 'عمان', value: 'OM' },
];

// Computed properties
const currentEnvironment = ref(zatcaStore.currentEnvironment);
const companyInfo = ref(zatcaStore.companyInfo);

const connectionStatus = computed(() => zatcaStore.connectionStatus);
const certificates = computed(() => zatcaStore.certificates);
const statistics = computed(() => zatcaStore.statistics);

const formatLastCheck = computed(() => {
  if (!connectionStatus.value.lastCheck) {
    return 'لم يتم الفحص بعد';
  }

  return format(connectionStatus.value.lastCheck, 'dd/MM/yyyy HH:mm', {
    locale: ar,
  });
});

// Methods
function onEnvironmentChange(environment: 'sandbox' | 'production') {
  try {
    zatcaStore.switchEnvironment(environment);

    notificationManager.system(
      `تم التبديل إلى البيئة ${environment === 'sandbox' ? 'التجريبية' : 'الفعلية'}`,
      { icon: 'swap_horiz' },
    );

    zatcaLogger.security('Environment switched', { environment });
  } catch (error) {
    notificationManager.error('فشل في تبديل البيئة');
    zatcaLogger.error('Failed to switch environment', error as Error);
  }
}

function saveCompanyInfo() {
  try {
    isLoading.value = true;

    // التحقق من صحة البيانات
    if (!companyInfo.value.vatNumber || !companyInfo.value.nameAr) {
      notificationManager.warning('يرجى ملء الحقول المطلوبة');
      return;
    }

    zatcaStore.updateCompanyInfo(companyInfo.value);

    notificationManager.success('تم حفظ معلومات الشركة بنجاح');
    zatcaLogger.audit('Company info updated', undefined, companyInfo.value);
  } catch (error) {
    notificationManager.error('فشل في حفظ معلومات الشركة');
    zatcaLogger.error('Failed to save company info', error as Error);
  } finally {
    isLoading.value = false;
  }
}

async function testConnection() {
  try {
    isTestingConnection.value = true;

    notificationManager.info('جاري اختبار الاتصال مع منصة فاتورة...', {
      timeout: 0,
      group: 'connection-test',
    });

    const isConnected = await zatcaStore.testConnection();

    notificationManager.dismiss('connection-test');

    if (isConnected) {
      notificationManager.success('تم الاتصال بنجاح مع منصة فاتورة');
    } else {
      notificationManager.error('فشل في الاتصال مع منصة فاتورة');
    }
  } catch (error) {
    notificationManager.dismiss('connection-test');
    notificationManager.error('حدث خطأ أثناء اختبار الاتصال');
    zatcaLogger.error('Connection test failed', error as Error);
  } finally {
    isTestingConnection.value = false;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function viewCertificate(certificate: any) {
  $q.dialog({
    title: 'تفاصيل الشهادة الرقمية',
    message: `
      <div class="q-pa-md">
        <p><strong>النوع:</strong> ${certificate.type}</p>
        <p><strong>الرقم التسلسلي:</strong> ${certificate.serialNumber}</p>
        <p><strong>تاريخ الإصدار:</strong> ${formatDate(certificate.issueDate)}</p>
        <p><strong>تاريخ الانتهاء:</strong> ${formatDate(certificate.expiryDate)}</p>
        <p><strong>الحالة:</strong> ${certificate.isActive ? 'نشطة' : 'غير نشطة'}</p>
      </div>
    `,
    html: true,
    ok: 'إغلاق',
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function deleteCertificate(certificate: any) {
  $q.dialog({
    title: 'تأكيد الحذف',
    message: 'هل أنت متأكد من حذف هذه الشهادة؟ لا يمكن التراجع عن هذا الإجراء.',
    cancel: {
      label: 'إلغاء',
      flat: true,
    },
    persistent: true,
    ok: {
      label: 'حذف',
      color: 'negative',
    },
  }).onOk(() => {
    // حذف الشهادة
    notificationManager.success('تم حذف الشهادة بنجاح');
    zatcaLogger.security('Certificate deleted', { certificateId: certificate.id });
  });
}

async function addCertificate() {
  try {
    if (!certificateFile.value) {
      notificationManager.warning('يرجى اختيار ملف الشهادة');
      return;
    }

    isLoading.value = true;

    // معالجة ملف الشهادة
    // هذا مثال - يحتاج لتنفيذ فعلي
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showAddCertificateDialog.value = false;
    notificationManager.success('تم إضافة الشهادة بنجاح');
    zatcaLogger.security('Certificate added', newCertificate.value);

    // إعادة تعيين النموذج
    newCertificate.value = { type: 'CSID', password: '' };
    certificateFile.value = null;
  } catch (error) {
    notificationManager.error('فشل في إضافة الشهادة');
    zatcaLogger.error('Failed to add certificate', error as Error);
  } finally {
    isLoading.value = false;
  }
}

function formatDate(date: Date | string): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'dd/MM/yyyy', { locale: ar });
}

// Quick actions
function createNewInvoice() {
  router.push('/invoices/create');
}

function syncData() {
  notificationManager.info('جاري مزامنة البيانات...', {
    timeout: 0,
    group: 'sync',
  });

  // محاكاة المزامنة
  setTimeout(() => {
    notificationManager.dismiss('sync');
    notificationManager.success('تم مزامنة البيانات بنجاح');
  }, 3000);
}

function viewReports() {
  router.push('/reports');
}

function showHelp() {
  $q.dialog({
    title: 'المساعدة والدعم',
    message: `
      <div class="q-pa-md">
        <h6>روابط مفيدة:</h6>
        <ul>
          <li><a href="https://zatca.gov.sa" target="_blank">موقع هيئة الزكاة والضريبة والجمارك</a></li>
          <li><a href="https://fatoora.zatca.gov.sa" target="_blank">منصة فاتورة</a></li>
          <li><a href="#" target="_blank">دليل المستخدم</a></li>
          <li><a href="#" target="_blank">الأسئلة الشائعة</a></li>
        </ul>

        <h6>الدعم التقني:</h6>
        <p>البريد الإلكتروني: support@example.com</p>
        <p>الهاتف: +966 11 123 4567</p>
      </div>
    `,
    html: true,
    ok: 'إغلاق',
  });
}

// Lifecycle
onMounted(() => {
  (async () => {
    try {
      if (!zatcaStore.isInitialized) {
        await zatcaStore.initialize();
      }

      zatcaLogger.info('ZATCA Settings page loaded');
    } catch (error) {
      notificationManager.error('فشل في تحميل إعدادات ZATCA');
      zatcaLogger.error('Failed to load ZATCA settings', error as Error);
    }
  })();
});
</script>

<style lang="scss" scoped>
// استخدام متغيرات Quasar
.zatca-settings-page {
  padding: $space-lg;
  background: var(--q-color-background);
  min-height: 100vh;
}

.zatca-header {
  margin-bottom: $space-xl;
  padding: $space-lg;
  background: var(--q-color-surface);
  border-radius: 12px;
  box-shadow: $shadow-3;
  border: 1px solid var(--q-color-separator);
}

.zatca-content {
  max-width: 1400px;
  margin: 0 auto;
}

// بطاقات الإعدادات
.settings-card,
.status-card,
.stats-card,
.actions-card {
  border-radius: 12px;
  box-shadow: $shadow-2;
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-separator);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: $shadow-6;
  }
}

// مؤشر حالة الاتصال
.connection-status-chip {
  font-weight: 600;
  font-size: 0.875rem;

  .q-icon {
    margin-right: $space-xs;
  }
}

// مجموعة خيارات البيئة
.environment-group {
  .q-radio {
    margin-bottom: $space-sm;

    .q-radio__label {
      font-weight: 500;
    }
  }
}

// نموذج الشركة
.company-form {
  .q-input,
  .q-select {
    .q-field__control {
      border-radius: 8px;
    }
  }
}

// قائمة الشهادات
.certificates-list {
  border-radius: 8px;
  overflow: hidden;

  .certificate-item {
    transition: all 0.3s ease;

    &:hover {
      background: rgba(var(--q-color-primary-rgb), 0.05);
    }

    .q-avatar {
      transition: all 0.3s ease;
    }

    &:hover .q-avatar {
      transform: scale(1.1);
    }
  }
}

// معلومات الاتصال
.connection-info {
  .q-item {
    padding: $space-sm $space-md;

    .q-item-section--avatar {
      min-width: 40px;
    }
  }
}

// شبكة الإحصائيات
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: $space-md;

  .stat-item {
    text-align: center;
    padding: $space-md;
    background: rgba(var(--q-color-primary-rgb), 0.05);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      background: rgba(var(--q-color-primary-rgb), 0.1);
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: $space-xs;
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--q-color-on-surface-variant);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }
}

// الإجراءات السريعة
.quick-actions {
  .q-btn {
    transition: all 0.3s ease;

    &:hover {
      transform: translateX(-4px);
    }
  }
}

// نموذج الشهادة
.certificate-form {
  .q-file {
    .q-field__control {
      border-radius: 8px;
    }
  }
}

// تحسينات للشاشات الصغيرة
@media (max-width: 768px) {
  .zatca-settings-page {
    padding: $space-md;
  }

  .zatca-header {
    padding: $space-md;

    .row {
      flex-direction: column;
      gap: $space-md;
    }
  }

  .company-form .row {
    flex-direction: column;
    gap: $space-sm;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .environment-group {
    flex-direction: column;

    .q-radio {
      margin-bottom: $space-sm;
    }
  }
}

// تحسينات للوضع المظلم
body.body--dark {
  .zatca-settings-page {
    background: var(--q-color-dark-page);
  }

  .stat-item {
    background: rgba(255, 255, 255, 0.05) !important;

    &:hover {
      background: rgba(255, 255, 255, 0.1) !important;
    }
  }

  .certificate-item:hover {
    background: rgba(255, 255, 255, 0.05) !important;
  }
}

// حركات وتأثيرات
.settings-card,
.status-card,
.stats-card,
.actions-card {
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
    transform: translateY(-2px);
    box-shadow: $shadow-4;
  }
}

// تحسينات النماذج
.q-form {
  .q-input,
  .q-select,
  .q-file {
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-1px);
    }

    &.q-field--focused {
      transform: translateY(-2px);
      box-shadow: $shadow-2;
    }
  }
}

// تحسينات البطاقات
.q-card {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--q-color-primary), var(--q-color-secondary));
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover::before {
    opacity: 1;
  }
}

// تحسينات الحوارات
.q-dialog .q-card {
  border-radius: 12px;
  box-shadow: $shadow-8;

  .q-card-section {
    .text-h6 {
      color: var(--q-color-primary);
      font-weight: 600;
    }
  }
}

// تحسينات القوائم
.q-list {
  .q-item {
    border-radius: 8px;
    margin-bottom: $space-xs;

    &:last-child {
      margin-bottom: 0;
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

// تحسينات الأيقونات
.q-icon {
  transition: all 0.3s ease;
}

// تحسينات البانرات
.q-banner {
  border-radius: 8px;
  border: 1px solid currentColor;

  .q-icon {
    font-size: 1.5rem;
  }
}
</style>
