<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 q-mb-lg text-center">
      <q-icon name="storage" class="q-mr-sm" />
      إدارة قاعدة البيانات
    </div>

    <!-- حالة الاتصال -->
    <q-card class="q-mb-lg">
      <q-card-section>
        <div class="row items-center justify-between">
          <div class="col">
            <div class="text-h6">
              <q-icon name="link" class="q-mr-sm" />
              حالة الاتصال
            </div>
            <div class="text-caption text-grey-6">معلومات الاتصال بقاعدة البيانات</div>
          </div>
          <div class="col-auto">
            <q-chip
              :color="connectionStatus.connected ? 'positive' : 'negative'"
              text-color="white"
              :icon="connectionStatus.connected ? 'check_circle' : 'error'"
            >
              {{ connectionStatus.connected ? 'متصل' : 'غير متصل' }}
            </q-chip>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="row q-gutter-md">
          <div class="col-md-6 col-12">
            <q-input
              v-model="connectionConfig.server"
              label="خادم قاعدة البيانات"
              outlined
              :readonly="connectionStatus.connected"
            />
          </div>
          <div class="col-md-6 col-12">
            <q-input
              v-model="connectionConfig.database"
              label="اسم قاعدة البيانات"
              outlined
              :readonly="connectionStatus.connected"
            />
          </div>
          <div class="col-md-6 col-12">
            <q-input
              v-model="connectionConfig.username"
              label="اسم المستخدم"
              outlined
              :readonly="connectionStatus.connected"
            />
          </div>
          <div class="col-md-6 col-12">
            <q-input
              v-model="connectionConfig.password"
              label="كلمة المرور"
              type="password"
              outlined
              :readonly="connectionStatus.connected"
            />
          </div>
        </div>

        <div class="row q-mt-md">
          <q-btn
            v-if="!connectionStatus.connected"
            color="primary"
            icon="link"
            label="اتصال"
            @click="connectToDatabase"
            :loading="connecting"
          />
          <q-btn
            v-else
            color="negative"
            icon="link_off"
            label="قطع الاتصال"
            @click="disconnectFromDatabase"
          />
        </div>
      </q-card-section>
    </q-card>

    <!-- الجداول -->
    <q-card v-if="connectionStatus.connected">
      <q-card-section>
        <div class="text-h6 q-mb-md">
          <q-icon name="table_view" class="q-mr-sm" />
          الجداول المتاحة
        </div>

        <div class="row q-gutter-md">
          <div class="col-md-4 col-12">
            <q-list bordered>
              <q-item-label header>قائمة الجداول</q-item-label>

              <q-item
                v-for="table in tables"
                :key="table.name"
                clickable
                v-ripple
                :active="selectedTable === table.name"
                @click="selectTable(table.name)"
              >
                <q-item-section avatar>
                  <q-icon name="table_chart" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ table.name }}</q-item-label>
                  <q-item-label caption>{{ table.rowCount }} صف</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-ripple @click="refreshTables">
                <q-item-section avatar>
                  <q-icon name="refresh" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>تحديث القائمة</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>

          <div class="col-md-8 col-12">
            <q-card v-if="selectedTable" flat bordered>
              <q-card-section>
                <div class="text-h6 q-mb-md">جدول: {{ selectedTable }}</div>

                <q-table
                  :rows="tableData"
                  :columns="tableColumns"
                  row-key="id"
                  :pagination="pagination"
                  :loading="loadingTableData"
                  binary-state-sort
                  :rows-per-page-options="[10, 25, 50]"
                >
                  <template v-slot:top>
                    <div class="row q-gutter-sm">
                      <q-btn
                        color="primary"
                        icon="add"
                        label="إضافة صف"
                        size="sm"
                        @click="addRow"
                      />
                      <q-btn
                        color="secondary"
                        icon="refresh"
                        label="تحديث"
                        size="sm"
                        @click="loadTableData"
                      />
                      <q-btn
                        color="info"
                        icon="info"
                        label="معلومات الجدول"
                        size="sm"
                        @click="showTableInfo"
                      />
                    </div>
                  </template>

                  <template v-slot:body-cell-actions="props">
                    <q-td :props="props">
                      <q-btn
                        flat
                        round
                        color="primary"
                        icon="edit"
                        size="sm"
                        @click="editRow(props.row)"
                      >
                        <q-tooltip>تعديل</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="deleteRow(props.row)"
                      >
                        <q-tooltip>حذف</q-tooltip>
                      </q-btn>
                    </q-td>
                  </template>
                </q-table>
              </q-card-section>
            </q-card>

            <div v-else class="text-center q-pa-xl text-grey-6">
              <q-icon name="table_view" size="64px" />
              <div class="text-h6 q-mt-md">اختر جدولاً لعرض البيانات</div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- رسالة عدم الاتصال -->
    <q-card v-else class="text-center q-pa-xl">
      <q-icon name="cloud_off" size="64px" color="grey-6" />
      <div class="text-h6 q-mt-md text-grey-6">يرجى الاتصال بقاعدة البيانات أولاً</div>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { logger } from 'src/utils/logger.js';

const $q = useQuasar();

// State
const connecting = ref(false);
const loadingTableData = ref(false);
const selectedTable = ref('');

// إعدادات الاتصال
const connectionConfig = ref({
  server: 'localhost',
  database: 'TestDB',
  username: 'sa',
  password: '',
});

// حالة الاتصال
const connectionStatus = ref({
  connected: false,
  lastConnected: null,
});

// الجداول
const tables = ref([
  { name: 'Users', rowCount: 150 },
  { name: 'Products', rowCount: 89 },
  { name: 'Orders', rowCount: 234 },
  { name: 'Categories', rowCount: 12 },
]);

// بيانات الجدول المحدد
const tableData = ref([]);
const tableColumns = ref([]);

// إعدادات الجدول
const pagination = ref({
  sortBy: 'id',
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

// الاتصال بقاعدة البيانات
async function connectToDatabase() {
  connecting.value = true;

  try {
    logger.info('محاولة الاتصال بقاعدة البيانات', connectionConfig.value);

    // التحقق من صحة البيانات
    if (!connectionConfig.value.server || !connectionConfig.value.database) {
      throw new Error('يرجى إدخال اسم الخادم وقاعدة البيانات');
    }

    // محاكاة عملية الاتصال
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        // محاكاة نجاح أو فشل الاتصال
        if (connectionConfig.value.server && connectionConfig.value.database) {
          resolve(true);
        } else {
          reject(new Error('بيانات الاتصال غير صحيحة'));
        }
      }, 2000);
    });

    connectionStatus.value.connected = true;
    connectionStatus.value.lastConnected = new Date();

    logger.info('تم الاتصال بقاعدة البيانات بنجاح');

    $q.notify({
      type: 'positive',
      message: 'تم الاتصال بقاعدة البيانات بنجاح',
      position: 'top',
      timeout: 3000,
    });

    // تحديث قائمة الجداول
    await refreshTables();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    logger.error('فشل في الاتصال بقاعدة البيانات', { error: errorMessage });

    $q.notify({
      type: 'negative',
      message: `فشل في الاتصال بقاعدة البيانات: ${errorMessage}`,
      position: 'top',
      timeout: 5000,
    });
  } finally {
    connecting.value = false;
  }
}

// قطع الاتصال
function disconnectFromDatabase() {
  connectionStatus.value.connected = false;
  selectedTable.value = '';
  tableData.value = [];
  tableColumns.value = [];

  logger.info('تم قطع الاتصال بقاعدة البيانات');

  $q.notify({
    type: 'info',
    message: 'تم قطع الاتصال بقاعدة البيانات',
    position: 'top',
  });
}

// تحديث قائمة الجداول
async function refreshTables() {
  try {
    logger.info('تحديث قائمة الجداول');

    // محاكاة تحديث الجداول
    await new Promise((resolve) => setTimeout(resolve, 500));

    $q.notify({
      type: 'positive',
      message: 'تم تحديث قائمة الجداول',
      position: 'top',
    });
  } catch (error) {
    logger.error('فشل في تحديث قائمة الجداول', { error });
  }
}

// اختيار جدول
function selectTable(tableName) {
  selectedTable.value = tableName;
  loadTableData();
  logger.info('تم اختيار الجدول', { tableName });
}

// تحميل بيانات الجدول
async function loadTableData() {
  if (!selectedTable.value) return;

  loadingTableData.value = true;

  try {
    logger.info('تحميل بيانات الجدول', { table: selectedTable.value });

    // محاكاة تحميل البيانات
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // بيانات تجريبية
    tableColumns.value = [
      { name: 'id', label: 'المعرف', field: 'id', sortable: true },
      { name: 'name', label: 'الاسم', field: 'name', sortable: true },
      { name: 'email', label: 'البريد الإلكتروني', field: 'email', sortable: true },
      { name: 'created_at', label: 'تاريخ الإنشاء', field: 'created_at', sortable: true },
      { name: 'actions', label: 'الإجراءات', field: 'actions', align: 'center' },
    ];

    tableData.value = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      name: `مستخدم ${i + 1}`,
      email: `user${i + 1}@example.com`,
      created_at: new Date(Date.now() - Math.random() * 10000000000).toLocaleDateString('ar-EG'),
    }));

    logger.info('تم تحميل بيانات الجدول بنجاح', {
      table: selectedTable.value,
      rowCount: tableData.value.length,
    });
  } catch (error) {
    logger.error('فشل في تحميل بيانات الجدول', { error });

    $q.notify({
      type: 'negative',
      message: 'فشل في تحميل بيانات الجدول',
    });
  } finally {
    loadingTableData.value = false;
  }
}

// إضافة صف جديد
function addRow() {
  logger.info('إضافة صف جديد', { table: selectedTable.value });

  $q.notify({
    type: 'info',
    message: 'ميزة إضافة الصفوف قيد التطوير',
    position: 'top',
  });
}

// تعديل صف
function editRow(row) {
  logger.info('تعديل صف', { table: selectedTable.value, row });

  $q.notify({
    type: 'info',
    message: 'ميزة تعديل الصفوف قيد التطوير',
    position: 'top',
  });
}

// حذف صف
function deleteRow(row) {
  logger.info('حذف صف', { table: selectedTable.value, row });

  $q.dialog({
    title: 'تأكيد الحذف',
    message: `هل أنت متأكد من حذف الصف رقم ${row.id}؟`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: 'ميزة حذف الصفوف قيد التطوير',
      position: 'top',
    });
  });
}

// عرض معلومات الجدول
function showTableInfo() {
  logger.info('عرض معلومات الجدول', { table: selectedTable.value });

  $q.notify({
    type: 'info',
    message: 'ميزة معلومات الجدول قيد التطوير',
    position: 'top',
  });
}

// تهيئة الصفحة
onMounted(() => {
  logger.info('تم فتح صفحة قاعدة البيانات');
});
</script>

<style lang="scss" scoped>
.q-card {
  border-radius: 12px;
}

.q-chip {
  font-weight: 500;
}

.q-table {
  border-radius: 8px;
}
</style>
