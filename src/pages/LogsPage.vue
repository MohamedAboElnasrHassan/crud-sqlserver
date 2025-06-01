<template>
  <q-page class="logs-page">
    <!-- Header مع عنوان وإحصائيات سريعة -->
    <div class="logs-header">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="assignment" class="q-mr-sm" />
            {{ $t('logs.title') }}
          </div>
          <div class="text-subtitle1 text-grey-6">{{ $t('logs.subtitle') }}</div>
        </div>

        <!-- إحصائيات سريعة -->
        <div class="col-auto">
          <div class="row q-gutter-sm">
            <q-chip
              :color="stats.error > 0 ? 'negative' : 'grey-4'"
              :text-color="stats.error > 0 ? 'white' : 'grey-8'"
              icon="error"
              :label="`${stats.error} ${$t('logs.errors')}`"
            />
            <q-chip
              :color="stats.warn > 0 ? 'warning' : 'grey-4'"
              :text-color="stats.warn > 0 ? 'white' : 'grey-8'"
              icon="warning"
              :label="`${stats.warn} ${$t('logs.warnings')}`"
            />
            <q-chip
              color="info"
              text-color="white"
              icon="info"
              :label="`${stats.total} ${$t('logs.total')}`"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- أدوات التحكم والفلترة -->
    <q-card class="filters-card">
      <q-card-section>
        <div class="row q-gutter-md items-end">
          <!-- فلتر المستوى -->
          <div class="col-md-2 col-sm-6 col-12">
            <q-select
              v-model="filters.level"
              :options="levelOptions"
              :label="$t('logs.filter_by_level')"
              outlined
              dense
              emit-value
              map-options
              clearable
              @update:model-value="applyFilters"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar v-if="scope.opt.value !== 'all'">
                    <q-icon
                      :name="getLevelIcon(scope.opt.value)"
                      :color="getLevelColor(scope.opt.value)"
                    />
                  </q-item-section>
                  <q-item-section>{{ scope.opt.label }}</q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>

          <!-- بحث في الرسائل -->
          <div class="col-md-3 col-sm-6 col-12">
            <q-input
              v-model="filters.search"
              :label="$t('logs.search_messages')"
              outlined
              dense
              clearable
              @update:model-value="applyFilters"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- فلتر التاريخ -->
          <div class="col-md-2 col-sm-6 col-12">
            <q-input
              v-model="filters.date"
              :label="$t('logs.filter_by_date')"
              outlined
              dense
              clearable
              @update:model-value="applyFilters"
            >
              <template v-slot:prepend>
                <q-icon name="event" />
              </template>
              <template v-slot:append>
                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                  <q-date v-model="filters.date" @update:model-value="applyFilters">
                    <div class="row items-center justify-end">
                      <q-btn v-close-popup :label="$t('common.close')" color="primary" flat />
                    </div>
                  </q-date>
                </q-popup-proxy>
              </template>
            </q-input>
          </div>

          <!-- أزرار الإجراءات -->
          <div class="col-md-5 col-12">
            <div class="row q-gutter-sm">
              <q-btn
                color="primary"
                icon="refresh"
                :label="$t('logs.refresh')"
                @click="refreshLogs"
                :loading="loading"
                no-caps
              />
              <q-btn
                color="secondary"
                icon="download"
                :label="$t('logs.export')"
                @click="exportLogs"
                no-caps
              />
              <q-btn
                color="negative"
                icon="clear_all"
                :label="$t('logs.clear_all')"
                @click="clearLogs"
                no-caps
              />
              <q-btn
                flat
                color="grey-7"
                icon="settings"
                :label="$t('logs.settings')"
                @click="showSettings = true"
                no-caps
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- جدول السجلات المحسن -->
    <q-card class="logs-table-card">
      <q-table
        :title="$t('logs.table_title')"
        :rows="filteredLogs"
        :columns="columns"
        row-key="id"
        v-model:pagination="pagination"
        :loading="loading"
        :filter="tableFilter"
        binary-state-sort
        :rows-per-page-options="[10, 25, 50, 100, 0]"
        :no-data-label="$t('logs.no_data')"
        :loading-label="$t('logs.loading')"
        :rows-per-page-label="$t('logs.rows_per_page')"
        class="logs-table"
        separator="cell"
        @request="onRequest"
      >
        <!-- Header مخصص -->
        <template v-slot:top>
          <div class="row full-width items-center">
            <div class="col">
              <div class="text-h6">
                <q-icon name="assignment" class="q-mr-sm" />
                {{ $t('logs.table_title') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ $t('logs.showing_logs', { count: filteredLogs.length, total: allLogs.length }) }}
              </div>
            </div>

            <!-- أزرار سريعة -->
            <div class="col-auto">
              <q-btn-group flat>
                <q-btn
                  flat
                  icon="refresh"
                  :tooltip="$t('logs.refresh')"
                  @click="refreshLogs"
                  :loading="loading"
                />
                <q-btn
                  flat
                  icon="filter_list"
                  :tooltip="$t('logs.toggle_filters')"
                  @click="showFilters = !showFilters"
                  :color="showFilters ? 'primary' : 'grey-7'"
                />
                <q-btn flat icon="more_vert" :tooltip="$t('logs.more_options')">
                  <q-menu>
                    <q-list>
                      <q-item clickable @click="exportLogs">
                        <q-item-section avatar>
                          <q-icon name="download" />
                        </q-item-section>
                        <q-item-section>{{ $t('logs.export') }}</q-item-section>
                      </q-item>
                      <q-item clickable @click="clearLogs">
                        <q-item-section avatar>
                          <q-icon name="clear_all" />
                        </q-item-section>
                        <q-item-section>{{ $t('logs.clear_all') }}</q-item-section>
                      </q-item>
                      <q-separator />
                      <q-item clickable @click="showSettings = true">
                        <q-item-section avatar>
                          <q-icon name="settings" />
                        </q-item-section>
                        <q-item-section>{{ $t('logs.settings') }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </q-btn-group>
            </div>
          </div>
        </template>

        <!-- عمود المستوى مع تحسينات -->
        <template v-slot:body-cell-level="props">
          <q-td :props="props">
            <q-chip
              :color="getLevelColor(props.value)"
              text-color="white"
              :icon="getLevelIcon(props.value)"
              size="sm"
              class="level-chip"
            >
              {{ props.value }}
            </q-chip>
          </q-td>
        </template>

        <!-- عمود الوقت مع تحسينات -->
        <template v-slot:body-cell-timestamp="props">
          <q-td :props="props">
            <div class="timestamp-cell">
              <div class="text-body2">{{ formatDate(props.value) }}</div>
              <div class="text-caption text-grey-6">{{ formatTime(props.value) }}</div>
            </div>
          </q-td>
        </template>

        <!-- عمود الرسالة مع اختصار -->
        <template v-slot:body-cell-message="props">
          <q-td :props="props">
            <div class="message-cell">
              <div class="message-text">{{ truncateMessage(props.value) }}</div>
              <q-tooltip v-if="props.value.length > 100" class="bg-dark">
                {{ props.value }}
              </q-tooltip>
            </div>
          </q-td>
        </template>

        <!-- عمود الإجراءات -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="row q-gutter-xs no-wrap">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                size="sm"
                @click="showLogDetails(props.row)"
              >
                <q-tooltip>{{ $t('logs.view_details') }}</q-tooltip>
              </q-btn>

              <q-btn
                v-if="props.row.data"
                flat
                round
                dense
                color="info"
                icon="code"
                size="sm"
                @click="showLogData(props.row)"
              >
                <q-tooltip>{{ $t('logs.view_data') }}</q-tooltip>
              </q-btn>

              <q-btn
                flat
                round
                dense
                color="secondary"
                icon="content_copy"
                size="sm"
                @click="copyLogMessage(props.row)"
              >
                <q-tooltip>{{ $t('logs.copy_message') }}</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>

        <!-- حالة عدم وجود بيانات -->
        <template v-slot:no-data="{ message }">
          <div class="full-width row flex-center text-grey-6 q-gutter-sm">
            <q-icon size="2em" name="assignment" />
            <span class="text-subtitle1">{{ message }}</span>
          </div>
        </template>
      </q-table>
    </q-card>

    <!-- Dialog تفاصيل السجل -->
    <q-dialog v-model="showDetails" persistent>
      <q-card style="min-width: 500px; max-width: 800px">
        <q-card-section>
          <div class="text-h6">تفاصيل السجل</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            <strong>المستوى:</strong>
            <q-chip
              :color="getLevelColor(selectedLog?.level)"
              text-color="white"
              :icon="getLevelIcon(selectedLog?.level)"
              size="sm"
              class="q-ml-sm"
            >
              {{ selectedLog?.level }}
            </q-chip>
          </div>

          <div class="q-mb-md">
            <strong>الوقت:</strong> {{ formatTimestamp(selectedLog?.timestamp) }}
          </div>

          <div class="q-mb-md"><strong>الرسالة:</strong> {{ selectedLog?.message }}</div>

          <div v-if="selectedLog?.data" class="q-mb-md">
            <strong>البيانات:</strong>
            <pre class="bg-grey-2 q-pa-md q-mt-sm" style="white-space: pre-wrap; font-size: 12px">{{
              JSON.stringify(selectedLog.data, null, 2)
            }}</pre>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="إغلاق" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { copyToClipboard } from 'quasar';

const $q = useQuasar();
const { t } = useI18n();

// State
const loading = ref(false);
const showDetails = ref(false);
const showSettings = ref(false);
const showFilters = ref(true);
const selectedLog = ref(null);
const allLogs = ref([]);
const tableFilter = ref('');

// فلاتر متقدمة
const filters = ref({
  level: null,
  search: '',
  date: null,
});

// إعدادات الجدول
const pagination = ref({
  sortBy: 'timestamp',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0,
});

// خيارات التصفية
const levelOptions = [
  { label: t('logs.all_levels'), value: 'all' },
  { label: 'ERROR', value: 'ERROR' },
  { label: 'WARN', value: 'WARN' },
  { label: 'INFO', value: 'INFO' },
  { label: 'DEBUG', value: 'DEBUG' },
];

// أعمدة الجدول المحسنة
const columns = [
  {
    name: 'timestamp',
    required: true,
    label: t('logs.timestamp'),
    align: 'left',
    field: 'timestamp',
    sortable: true,
    style: 'width: 180px',
    headerStyle: 'font-weight: bold',
  },
  {
    name: 'level',
    required: true,
    label: t('logs.level'),
    align: 'center',
    field: 'level',
    sortable: true,
    style: 'width: 120px',
    headerStyle: 'font-weight: bold',
  },
  {
    name: 'message',
    required: true,
    label: t('logs.message'),
    align: 'left',
    field: 'message',
    sortable: true,
    headerStyle: 'font-weight: bold',
  },
  {
    name: 'actions',
    label: t('logs.actions'),
    align: 'center',
    field: 'actions',
    style: 'width: 120px',
    headerStyle: 'font-weight: bold',
  },
];

// السجلات المفلترة المحسنة
const filteredLogs = computed(() => {
  let logs = [...allLogs.value];

  // فلتر حسب المستوى
  if (filters.value.level && filters.value.level !== 'all') {
    logs = logs.filter((log) => log.level === filters.value.level);
  }

  // فلتر حسب البحث في الرسالة
  if (filters.value.search) {
    const searchTerm = filters.value.search.toLowerCase();
    logs = logs.filter(
      (log) =>
        log.message.toLowerCase().includes(searchTerm) ||
        log.level.toLowerCase().includes(searchTerm),
    );
  }

  // فلتر حسب التاريخ
  if (filters.value.date) {
    const filterDate = new Date(filters.value.date);
    logs = logs.filter((log) => {
      const logDate = new Date(log.timestamp);
      return logDate.toDateString() === filterDate.toDateString();
    });
  }

  return logs;
});

// إحصائيات السجلات المحسنة
const stats = computed(() => {
  const allStats = {
    total: allLogs.value.length,
    error: allLogs.value.filter((log) => log.level === 'ERROR').length,
    warn: allLogs.value.filter((log) => log.level === 'WARN').length,
    info: allLogs.value.filter((log) => log.level === 'INFO').length,
    debug: allLogs.value.filter((log) => log.level === 'DEBUG').length,
  };

  return allStats;
});

// الحصول على لون المستوى
function getLevelColor(level) {
  switch (level) {
    case 'ERROR':
      return 'negative';
    case 'WARN':
      return 'warning';
    case 'INFO':
      return 'info';
    case 'DEBUG':
      return 'secondary';
    default:
      return 'grey';
  }
}

// الحصول على أيقونة المستوى
function getLevelIcon(level) {
  switch (level) {
    case 'ERROR':
      return 'error';
    case 'WARN':
      return 'warning';
    case 'INFO':
      return 'info';
    case 'DEBUG':
      return 'bug_report';
    default:
      return 'help';
  }
}

// تنسيق التاريخ والوقت المحسن
function formatDate(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleDateString('ar-EG');
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('ar-EG');
}

function formatTimestamp(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('ar-EG');
}

// اختصار الرسالة
function truncateMessage(message, maxLength = 100) {
  if (!message) return '';
  return message.length > maxLength ? message.substring(0, maxLength) + '...' : message;
}

// تطبيق الفلاتر
function applyFilters() {
  // تحديث pagination عند تغيير الفلاتر
  pagination.value.page = 1;
  pagination.value.rowsNumber = filteredLogs.value.length;
}

// معالج طلب الجدول
function onRequest(props) {
  const { page, rowsPerPage, sortBy, descending } = props.pagination;

  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  pagination.value.sortBy = sortBy;
  pagination.value.descending = descending;
}

// نسخ رسالة السجل
async function copyLogMessage(log) {
  try {
    await copyToClipboard(log.message);
    $q.notify({
      type: 'positive',
      message: t('logs.message_copied'),
      position: 'top',
      timeout: 2000,
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: t('logs.copy_failed'),
      position: 'top',
    });
  }
}

// عرض بيانات السجل
function showLogData(log) {
  $q.dialog({
    title: t('logs.log_data'),
    message: JSON.stringify(log.data, null, 2),
    html: true,
    ok: t('common.close'),
  });
}

// تحديث السجلات
function refreshLogs() {
  loading.value = true;

  try {
    allLogs.value = logger.getAllLogs();
    logger.info('تم تحديث السجلات', { count: allLogs.value.length });

    $q.notify({
      type: 'positive',
      message: `تم تحديث ${allLogs.value.length} سجل`,
      position: 'top',
    });
  } catch (error) {
    console.error('خطأ في تحديث السجلات:', error);
    $q.notify({
      type: 'negative',
      message: 'فشل في تحديث السجلات',
    });
  } finally {
    loading.value = false;
  }
}

// تصفية السجلات
// function filterLogs() {
//   logger.debug('تصفية السجلات', { level: selectedLevel.value });
// }

// تصدير السجلات
function exportLogs() {
  try {
    const logsData = logger.exportLogs();
    const blob = new Blob([logsData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    logger.info('تم تصدير السجلات');

    $q.notify({
      type: 'positive',
      message: 'تم تصدير السجلات بنجاح',
      position: 'top',
    });
  } catch (error) {
    console.error('خطأ في تصدير السجلات:', error);
    $q.notify({
      type: 'negative',
      message: 'فشل في تصدير السجلات',
    });
  }
}

// مسح السجلات
function clearLogs() {
  $q.dialog({
    title: 'تأكيد المسح',
    message: 'هل أنت متأكد من مسح جميع السجلات؟',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    logger.clearLogs();
    allLogs.value = [];

    logger.info('تم مسح جميع السجلات');

    $q.notify({
      type: 'positive',
      message: 'تم مسح جميع السجلات',
      position: 'top',
    });
  });
}

// عرض تفاصيل السجل
function showLogDetails(log) {
  selectedLog.value = log;
  showDetails.value = true;
}

// تهيئة الصفحة
onMounted(() => {
  logger.info('تم فتح صفحة السجلات');
  refreshLogs();
});
</script>

<style lang="scss" scoped>
// استخدام متغيرات Quasar
.logs-page {
  padding: 24px;
  background: var(--q-color-background);
  min-height: 100vh;
}

.logs-header {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--q-color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--q-color-separator);
}

.filters-card {
  margin-bottom: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-separator);
}

.logs-table-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-separator);
  overflow: hidden;
}

// تحسينات الجدول
.logs-table {
  .q-table__top {
    padding: 16px 24px;
    border-bottom: 1px solid var(--q-color-separator);
  }

  .q-table__bottom {
    border-top: 1px solid var(--q-color-separator);
  }
}

// تحسينات الخلايا
.level-chip {
  font-weight: 600;
  font-size: 0.75rem;
  min-width: 70px;
}

.timestamp-cell {
  min-width: 140px;

  .text-body2 {
    font-weight: 500;
  }
}

.message-cell {
  .message-text {
    line-height: 1.4;
    word-break: break-word;
  }
}

// تحسينات الحوارات
.q-dialog .q-card {
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

pre {
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  background: var(--q-color-dark-page);
  color: var(--q-color-on-dark);
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.4;
}

// تحسينات للشاشات الصغيرة
@media (max-width: 600px) {
  .logs-page {
    padding: 16px;
  }

  .logs-header {
    padding: 16px;

    .row {
      flex-direction: column;
      gap: 16px;
    }
  }

  .filters-card .row {
    flex-direction: column;
    gap: 12px;
  }

  .timestamp-cell {
    min-width: 120px;
  }

  .level-chip {
    min-width: 60px;
    font-size: 0.7rem;
  }
}

// تحسينات للوضع المظلم
body.body--dark {
  .logs-page {
    background: var(--q-color-dark-page);
  }

  pre {
    background: lighten(var(--q-color-dark), 5%);
    border: 1px solid var(--q-color-separator);
  }
}

// حركات وتأثيرات
.filters-card,
.logs-table-card {
  transition: all 0.3s ease;

  &:hover {
    box-shadow: $shadow-4;
  }
}

.level-chip {
  transition: all 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
}

// تحسينات الأزرار
.q-btn-group .q-btn {
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}
</style>
