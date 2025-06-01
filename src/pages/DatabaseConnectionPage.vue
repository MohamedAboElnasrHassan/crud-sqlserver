<template>
  <div class="connection-container windows-classic-theme">
    <!-- حالة اختبار الاتصال -->
    <div v-if="testingConnection" class="testing-section">
      <div class="logo-container">
        <q-icon name="storage" size="80px" color="primary" class="logo-icon" />
        <div class="app-title">اختبار الاتصال بقاعدة البيانات</div>
      </div>

      <div class="progress-container">
        <q-linear-progress
          :value="testProgress"
          color="primary"
          track-color="rgba(25,118,210,0.3)"
          size="6px"
          class="progress-bar"
        />
        <div class="progress-text">
          {{ currentTestMessage }}
        </div>
      </div>

      <div class="status-container">
        <q-spinner-dots color="primary" size="40px" />
      </div>
    </div>

    <!-- نموذج إعدادات الاتصال -->
    <div v-else class="settings-section">
      <div class="sql-server-window">
        <!-- Window Header -->
        <div class="window-header">
          <div class="window-icon">
            <q-icon name="storage" size="16px" color="primary" />
          </div>
          <div class="window-title">Connect to Server</div>
          <div class="window-controls">
            <q-btn flat dense icon="minimize" size="xs" class="control-btn" />
            <q-btn flat dense icon="crop_square" size="xs" class="control-btn" />
            <q-btn
              flat
              dense
              icon="close"
              size="xs"
              class="control-btn close-btn"
              @click="closeWindow"
            />
          </div>
        </div>

        <!-- SQL Server Logo and Title -->
        <div class="sql-server-header">
          <div class="sql-logo">
            <q-icon name="storage" size="32px" color="red" />
          </div>
          <div class="sql-title">
            <div class="microsoft-text">Microsoft</div>
            <div class="sql-server-text">SQL Server 2008 R2</div>
          </div>
        </div>

        <!-- Orange Separator -->
        <div class="orange-separator"></div>

        <!-- Connection Form -->
        <div class="connection-form">
          <!-- Server Type -->
          <div class="form-row">
            <label class="form-label">Server type:</label>
            <q-select
              v-model="connectionConfig.serverType"
              :options="serverTypeOptions"
              outlined
              dense
              class="form-input classic-select"
              behavior="menu"
              readonly
            />
          </div>

          <!-- Server Name -->
          <div class="form-row">
            <label class="form-label">Server name:</label>
            <div class="server-input-group">
              <q-select
                v-model="connectionConfig.server"
                :options="serverOptions"
                outlined
                dense
                use-input
                input-debounce="0"
                @new-value="createServer"
                class="form-input server-select classic-select"
                behavior="menu"
                placeholder="."
              />
              <q-btn
                icon="refresh"
                flat
                dense
                size="sm"
                class="refresh-btn classic-btn"
                @click="refreshServers"
              />
            </div>
          </div>

          <!-- Authentication -->
          <div class="form-row">
            <label class="form-label">Authentication:</label>
            <q-select
              v-model="connectionConfig.authType"
              :options="authTypeOptions"
              outlined
              dense
              class="form-input classic-select"
              behavior="menu"
              @update:model-value="onAuthTypeChange"
            />
          </div>

          <!-- Login (for SQL Server Authentication) -->
          <div v-if="connectionConfig.authType === 'SQL Server Authentication'" class="form-row">
            <label class="form-label login-label">Login:</label>
            <q-select
              v-model="connectionConfig.username"
              :options="loginOptions"
              outlined
              dense
              use-input
              input-debounce="0"
              @new-value="createLogin"
              class="form-input"
              behavior="menu"
              placeholder="sa"
            />
          </div>

          <!-- User name (for Windows Authentication) -->
          <div v-if="connectionConfig.authType === 'Windows Authentication'" class="form-row">
            <label class="form-label username-label">User name:</label>
            <q-input
              v-model="connectionConfig.username"
              outlined
              dense
              readonly
              class="form-input"
              placeholder="DESKTOP-QNBM8F1\Mohamed"
            />
          </div>

          <!-- Password -->
          <div v-if="connectionConfig.authType === 'SQL Server Authentication'" class="form-row">
            <label class="form-label">Password:</label>
            <q-input
              v-model="connectionConfig.password"
              type="password"
              outlined
              dense
              class="form-input"
            />
          </div>

          <!-- Remember Password -->
          <div
            v-if="connectionConfig.authType === 'SQL Server Authentication'"
            class="form-row checkbox-row"
          >
            <q-checkbox
              v-model="connectionConfig.rememberPassword"
              label="Remember password"
              class="remember-checkbox"
            />
          </div>
        </div>

        <!-- Connection Status -->
        <div v-if="connecting && currentTestMessage" class="connection-status">
          <div class="status-message">{{ currentTestMessage }}</div>
          <q-linear-progress indeterminate color="primary" class="q-mt-sm" />
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <q-btn
            label="CONNECT"
            unelevated
            class="connect-btn classic-btn"
            @click="testConnection"
            :loading="connecting"
            :disable="!connectionConfig.server || !connectionConfig.serverType"
          />
          <q-btn label="OPTIONS >>" flat class="options-btn classic-btn" @click="showAdvanced" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { logger } from 'src/utils/logger.js';

const $q = useQuasar();

// State
const testingConnection = ref(true);
const connecting = ref(false);
const testProgress = ref(0);
const currentTestMessage = ref('جاري تهيئة الاختبار...');

// إعدادات الاتصال
const connectionConfig = ref({
  serverType: 'Database Engine',
  server: '.',
  authType: 'Windows Authentication',
  username: 'DESKTOP-QNBM8F1\\Mohamed',
  password: '',
  rememberPassword: false,
});

// إعدادات إضافية (غير مستخدمة حالياً)
// const connectionType = ref('remote');
// const saveCredentials = ref(true);
// const interfaceLanguage = ref('arabic');

// خيارات نوع الخادم
const serverTypeOptions = ['Database Engine'];

// خيارات الخوادم
const serverOptions = ['.', 'localhost', '192.168.1.100', 'DESKTOP-PC\\SQLEXPRESS', 'SERVER-01'];

// خيارات المصادقة
const authTypeOptions = ['Windows Authentication', 'SQL Server Authentication'];

// خيارات تسجيل الدخول
const loginOptions = ['sa', 'admin', 'user1', 'dbuser'];

// إعدادات التحكم في السلوك
const shouldAutoConnect = ref(true);
const splashSettings = ref({
  autoConnect: true,
});

// رسائل اختبار الاتصال
const testMessages = [
  'جاري تهيئة الاختبار...',
  'جاري التحقق من إعدادات الاتصال...',
  'جاري محاولة الاتصال بالخادم...',
  'جاري التحقق من قاعدة البيانات...',
  'جاري اختبار الصلاحيات...',
];

// محاكاة اختبار الاتصال التلقائي
async function performAutoConnectionTest() {
  try {
    logger.info('بدء اختبار الاتصال التلقائي بقاعدة البيانات');

    // تحميل الإعدادات المحفوظة
    loadSavedSettings();

    // التحقق من وجود بيانات اتصال محفوظة
    const hasValidConnection =
      connectionConfig.value.server &&
      connectionConfig.value.server !== '.' &&
      connectionConfig.value.authType;

    if (!hasValidConnection) {
      logger.info('لا توجد بيانات اتصال محفوظة - إظهار نموذج الإعدادات');
      currentTestMessage.value = 'لا توجد بيانات اتصال محفوظة';
      setTimeout(() => {
        testingConnection.value = false;
      }, 2000);
      return;
    }

    let currentStep = 0;
    const totalSteps = testMessages.length;

    const interval = setInterval(() => {
      if (currentStep < totalSteps) {
        testProgress.value = (currentStep + 1) / totalSteps;
        currentTestMessage.value = testMessages[currentStep];
        currentStep++;
      } else {
        clearInterval(interval);
        // محاكاة نتيجة الاختبار
        setTimeout(async () => {
          await finishConnectionTest();
        }, 500);
      }
    }, 800);
  } catch (error) {
    logger.error('خطأ في اختبار الاتصال التلقائي', { error });
    await finishConnectionTest(false);
  }
}

// إنهاء اختبار الاتصال
async function finishConnectionTest(success = null) {
  try {
    // محاكاة نتيجة الاختبار
    const connectionSuccess = success !== null ? success : Math.random() > 0.3; // 70% نجاح

    if (connectionSuccess) {
      currentTestMessage.value = 'تم الاتصال بنجاح!';
      testProgress.value = 1;

      logger.info('نجح اختبار الاتصال بقاعدة البيانات');

      $q.notify({
        type: 'positive',
        message: 'تم الاتصال بقاعدة البيانات بنجاح',
        position: 'top',
        timeout: 2000,
      });

      // انتظار قليل ثم فتح النافذة الرئيسية
      setTimeout(() => {
        openMainWindow();
      }, 1500);
    } else {
      currentTestMessage.value = 'فشل في الاتصال';

      logger.warn('فشل اختبار الاتصال بقاعدة البيانات');

      $q.notify({
        type: 'negative',
        message: 'فشل في الاتصال بقاعدة البيانات',
        position: 'top',
        timeout: 3000,
      });

      // انتظار قليل ثم إظهار نموذج الإعدادات
      setTimeout(() => {
        testingConnection.value = false;
      }, 1500);
    }
  } catch (error) {
    logger.error('خطأ في إنهاء اختبار الاتصال', { error });
    testingConnection.value = false;
  }
}

// اختبار الاتصال يدوياً
async function testConnection() {
  connecting.value = true;

  try {
    logger.info('بدء اختبار الاتصال اليدوي', connectionConfig.value);

    // التحقق من صحة البيانات الأساسية
    if (!connectionConfig.value.server) {
      throw new Error('يرجى إدخال اسم الخادم');
    }

    if (!connectionConfig.value.serverType) {
      throw new Error('يرجى اختيار نوع الخادم');
    }

    if (
      connectionConfig.value.authType === 'SQL Server Authentication' &&
      !connectionConfig.value.username
    ) {
      throw new Error('يرجى إدخال اسم المستخدم');
    }

    // المرحلة الأولى: اختبار الاتصال بالخادم
    currentTestMessage.value = 'جاري الاتصال بالخادم...';
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // محاكاة نجاح الاتصال بالخادم
    const serverConnected = Math.random() > 0.2; // 80% نجاح
    if (!serverConnected) {
      throw new Error('فشل في الاتصال بالخادم - تحقق من اسم الخادم والشبكة');
    }

    currentTestMessage.value = 'تم الاتصال بالخادم بنجاح';
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // المرحلة الثانية: عرض قواعد البيانات المتاحة
    currentTestMessage.value = 'جاري جلب قواعد البيانات المتاحة...';
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // محاكاة قواعد البيانات المتاحة
    const availableDatabases = [
      'master',
      'tempdb',
      'model',
      'msdb',
      'MyDatabase',
      'TestDB',
      'ProductionDB',
    ];

    // إظهار حوار اختيار قاعدة البيانات
    const selectedDatabase = await showDatabaseSelectionDialog(availableDatabases);

    if (!selectedDatabase) {
      throw new Error('يجب اختيار قاعدة بيانات للمتابعة');
    }

    connectionConfig.value.database = selectedDatabase;

    // المرحلة الثالثة: اختبار الاتصال بقاعدة البيانات المحددة
    currentTestMessage.value = `جاري الاتصال بقاعدة البيانات: ${selectedDatabase}`;
    await new Promise((resolve) => setTimeout(resolve, 1500));

    logger.info('نجح اختبار الاتصال اليدوي');

    $q.notify({
      type: 'positive',
      message: `تم الاتصال بقاعدة البيانات "${selectedDatabase}" بنجاح`,
      position: 'top',
      timeout: 3000,
    });

    // حفظ الإعدادات وفتح النافذة الرئيسية
    saveSettings();
    setTimeout(() => {
      openMainWindow();
    }, 1000);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'خطأ غير معروف';
    logger.error('فشل في اختبار الاتصال اليدوي', { error: errorMessage });

    $q.notify({
      type: 'negative',
      message: `فشل في الاتصال: ${errorMessage}`,
      position: 'top',
      timeout: 5000,
    });
  } finally {
    connecting.value = false;
    currentTestMessage.value = '';
  }
}

// إظهار حوار اختيار قاعدة البيانات
function showDatabaseSelectionDialog(databases) {
  return new Promise((resolve) => {
    $q.dialog({
      title: 'اختيار قاعدة البيانات',
      message: 'اختر قاعدة البيانات التي تريد الاتصال بها:',
      options: {
        type: 'radio',
        model: databases[0],
        items: databases.map((db) => ({ label: db, value: db })),
      },
      cancel: true,
      persistent: true,
    })
      .onOk((selectedDb) => {
        resolve(selectedDb);
      })
      .onCancel(() => {
        resolve(null);
      });
  });
}

// فتح النافذة الرئيسية
function openMainWindow() {
  logger.info('طلب فتح النافذة الرئيسية');

  if (window.electronAPI && window.electronAPI.invoke) {
    window.electronAPI
      .invoke('open-main-window')
      .then(() => {
        logger.info('تم فتح النافذة الرئيسية بنجاح');
        // إغلاق نافذة الاتصال
        window.electronAPI.invoke('close-connection-window');
      })
      .catch((error) => {
        logger.error('فشل في فتح النافذة الرئيسية', { error });
      });
  }
}

// حفظ الإعدادات
function saveSettings() {
  try {
    localStorage.setItem('dbConnectionConfig', JSON.stringify(connectionConfig.value));
    logger.info('تم حفظ إعدادات الاتصال');

    $q.notify({
      type: 'positive',
      message: 'تم حفظ الإعدادات بنجاح',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    logger.error('فشل في حفظ الإعدادات', { error });
  }
}

// تحميل الإعدادات المحفوظة
function loadSavedSettings() {
  try {
    const saved = localStorage.getItem('dbConnectionConfig');
    if (saved) {
      connectionConfig.value = { ...connectionConfig.value, ...JSON.parse(saved) };
      logger.info('تم تحميل الإعدادات المحفوظة');
    }
  } catch (error) {
    logger.error('فشل في تحميل الإعدادات المحفوظة', { error });
  }
}

// استعادة الإعدادات الافتراضية (غير مستخدمة حالياً)
// function resetToDefaults() {
//   connectionConfig.value = {
//     server: 'localhost',
//     port: 1433,
//     database: 'TestDB',
//     authType: 'windows',
//     username: 'sa',
//     password: '',
//   };

//   logger.info('تم استعادة الإعدادات الافتراضية');

//   $q.notify({
//     type: 'info',
//     message: 'تم استعادة الإعدادات الافتراضية',
//     position: 'top',
//     timeout: 2000,
//   });
// }

// تحديث قائمة الخوادم
function refreshServers() {
  logger.info('تحديث قائمة الخوادم');

  $q.notify({
    type: 'info',
    message: 'تم تحديث قائمة الخوادم',
    position: 'top',
    timeout: 2000,
  });
}

// إنشاء قاعدة بيانات جديدة (غير مستخدمة حالياً)
// function createDatabase() {
//   logger.info('طلب إنشاء قاعدة بيانات جديدة');

//   $q.notify({
//     type: 'info',
//     message: 'ميزة إنشاء قاعدة البيانات قيد التطوير',
//     position: 'top',
//     timeout: 2000,
//   });
// }

// إظهار الإعدادات المتقدمة
function showAdvanced() {
  logger.info('إظهار الإعدادات المتقدمة');

  $q.notify({
    type: 'info',
    message: 'الإعدادات المتقدمة قيد التطوير',
    position: 'top',
    timeout: 2000,
  });
}

// إغلاق النافذة
function closeWindow() {
  logger.info('طلب إغلاق نافذة الاتصال');

  if (window.electronAPI && window.electronAPI.invoke) {
    window.electronAPI.invoke('close-connection-window');
  }
}

// إظهار المساعدة
const showHelp = () => {
  logger.info('إظهار المساعدة');

  $q.notify({
    type: 'info',
    message: 'المساعدة قيد التطوير',
    position: 'top',
    timeout: 2000,
  });
};

// تصدير الدوال للاستخدام في template
defineExpose({
  showHelp,
});

// تغيير نوع المصادقة
function onAuthTypeChange(newType) {
  logger.info('تغيير نوع المصادقة إلى:', newType);

  if (newType === 'Windows Authentication') {
    connectionConfig.value.username = 'DESKTOP-QNBM8F1\\Mohamed';
    connectionConfig.value.password = '';
  } else if (newType === 'SQL Server Authentication') {
    connectionConfig.value.username = 'sa';
    connectionConfig.value.password = '';
  }
}

// إنشاء خادم جديد
function createServer(val, done) {
  if (val.length > 0) {
    if (!serverOptions.includes(val)) {
      serverOptions.push(val);
    }
    done(val, 'add-unique');
  }
}

// إنشاء تسجيل دخول جديد
function createLogin(val, done) {
  if (val.length > 0) {
    if (!loginOptions.includes(val)) {
      loginOptions.push(val);
    }
    done(val, 'add-unique');
  }
}

// تحميل إعدادات Splash
function loadSplashSettings() {
  try {
    const saved = localStorage.getItem('splashSettings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      splashSettings.value = { ...splashSettings.value, ...parsedSettings };
      shouldAutoConnect.value = parsedSettings.autoConnect !== false;
      logger.info('تم تحميل إعدادات شاشة البداية', parsedSettings);
    }
  } catch (error) {
    logger.error('فشل في تحميل إعدادات شاشة البداية', { error });
  }
}

// تهيئة الصفحة
onMounted(() => {
  logger.info('تم فتح صفحة اختبار الاتصال بقاعدة البيانات');

  // تحميل الإعدادات المحفوظة
  loadSavedSettings();

  // تحميل إعدادات Splash للتحقق من الاتصال التلقائي
  loadSplashSettings();

  // إذا كان الاتصال التلقائي مفعل، قم بالاختبار
  if (shouldAutoConnect.value) {
    setTimeout(() => {
      performAutoConnectionTest();
    }, 1000); // تأخير قصير للسماح بتحميل الواجهة
  } else {
    // إظهار نموذج الإعدادات مباشرة
    testingConnection.value = false;
  }
});
</script>

<style lang="scss" scoped>
.connection-container {
  width: 100vw;
  height: 100vh;
  background: $windows-classic-bg;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-family: $typography-font-family;
  font-size: $body-font-size;

  // Apply Windows Classic theme
  &.windows-classic-theme {
    .classic-select {
      :deep(.q-field__control) {
        background: white;
        border: 1px inset $windows-classic-bg;
        border-radius: 0;
        min-height: 21px;
        height: 21px;
        font-size: $input-font-size;
      }

      :deep(.q-field__native) {
        font-size: $input-font-size;
        font-family: $typography-font-family;
        padding: 2px 4px;
      }

      :deep(.q-field__append) {
        .q-icon {
          font-size: 12px;
          color: $windows-classic-text;
        }
      }
    }

    .classic-btn {
      background: $windows-classic-button-face;
      border: 1px outset $windows-classic-bg;
      border-radius: 0;
      color: $windows-classic-text;
      font-size: $button-font-size;
      font-family: $typography-font-family;
      font-weight: normal;
      box-shadow: none;
      text-transform: none;

      &:hover {
        background: #d4d0c8; // Lighter version of $windows-classic-button-face
      }

      &:active {
        border: 1px inset $windows-classic-bg;
      }
    }
  }
}

.testing-section {
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.settings-section {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
}

.sql-server-window {
  background: $windows-classic-bg;
  border: 2px outset $windows-classic-bg;
  border-radius: 0;
  box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  width: 460px;
  height: 400px;
  font-family: $typography-font-family;
  font-size: $body-font-size;
  display: flex;
  flex-direction: column;
}

.window-header {
  background: linear-gradient(to bottom, #0054e3, #0054e3);
  border-bottom: 1px solid #000080;
  padding: 2px 4px;
  display: flex;
  align-items: center;
  height: 20px;

  .window-icon {
    margin-right: 4px;
  }

  .window-title {
    font-size: 11px;
    font-weight: bold;
    color: white;
    flex: 1;
  }

  .window-controls {
    display: flex;
    gap: 2px;
  }

  .control-btn {
    width: 16px;
    height: 14px;
    min-height: 14px;
    border-radius: 0;
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    font-size: 8px;

    &:hover {
      background: #d4d0c8;
    }

    &.close-btn:hover {
      background: #ff6b6b;
    }
  }
}

.sql-server-header {
  padding: 8px 12px;
  background: $windows-classic-bg;
  display: flex;
  align-items: center;
  gap: 8px;

  .sql-logo {
    display: flex;
    align-items: center;
  }

  .sql-title {
    .microsoft-text {
      font-size: $body-font-size;
      color: $windows-classic-text;
      font-weight: normal;
    }

    .sql-server-text {
      font-size: 14px;
      font-weight: bold;
      color: $windows-classic-text;
      margin-top: -1px;
    }
  }
}

.orange-separator {
  height: 3px;
  background: linear-gradient(to right, #ff8c00, #ffa500);
  border-bottom: 1px solid #e67e00;
}

.connection-form {
  padding: 12px;
  background: #c0c0c0;
  flex: 1;

  .form-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 6px;

    &.checkbox-row {
      margin-top: 6px;
      margin-left: 80px;
    }

    .form-label {
      width: 80px;
      font-size: 11px;
      color: #000;
      text-align: left;
      font-weight: normal;

      &.login-label,
      &.username-label {
        text-indent: 16px;
      }
    }

    .form-input {
      flex: 1;
      font-size: 11px;

      :deep(.q-field__control) {
        height: 21px;
        min-height: 21px;
        padding: 0 4px;
        background: white;
        border: 1px inset #c0c0c0;
        border-radius: 0;
      }

      :deep(.q-field__native) {
        font-size: 11px;
        padding: 2px;
        min-height: 17px;
      }

      :deep(.q-field__append) {
        padding: 0 2px;
      }
    }

    .server-input-group {
      display: flex;
      flex: 1;
      gap: 4px;

      .server-select {
        flex: 1;
      }

      .refresh-btn {
        width: 20px;
        height: 20px;
        min-height: 20px;
        border: 1px solid #8b8b8b;
        border-radius: 0;
        background: linear-gradient(to bottom, #f0f0f0, #d8d8d8);

        &:hover {
          background: linear-gradient(to bottom, #e8e8e8, #d0d0d0);
        }
      }
    }

    .remember-checkbox {
      font-size: 11px;

      :deep(.q-checkbox__label) {
        font-size: 11px;
        color: #000;
      }
    }
  }
}

.connection-status {
  padding: 12px 16px;
  background: #f8f9fa;
  border-top: 1px solid #e0e0e0;
  border-bottom: 1px solid #e0e0e0;

  .status-message {
    font-size: 11px;
    color: #333;
    text-align: center;
    margin-bottom: 8px;
  }
}

.action-buttons {
  padding: 8px 12px;
  display: flex;
  justify-content: flex-start;
  gap: 6px;
  background: #c0c0c0;
  border-top: 1px solid #808080;

  .connect-btn {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    border-radius: 0;
    color: #000;
    font-size: 11px;
    font-weight: bold;
    padding: 2px 12px;
    height: 21px;
    min-height: 21px;

    &:hover {
      background: #d4d0c8;
    }

    &:active {
      border: 1px inset #c0c0c0;
    }
  }

  .options-btn {
    background: #c0c0c0;
    border: 1px outset #c0c0c0;
    border-radius: 0;
    color: #000;
    font-size: 11px;
    padding: 2px 8px;
    height: 21px;
    min-height: 21px;

    &:hover {
      background: #d4d0c8;
    }

    &:active {
      border: 1px inset #c0c0c0;
    }
  }
}

.logo-container {
  margin-bottom: 40px;
}

.logo-icon {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.app-title {
  font-size: 24px;
  font-weight: 600;
  margin-top: 16px;
  color: #1976d2;
}

.progress-container {
  margin-bottom: 30px;
}

.progress-bar {
  border-radius: 3px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-text {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  font-weight: 500;
  color: #666;
  min-height: 20px;
}

.status-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.connection-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.q-card {
  border-radius: 12px;
}
</style>
