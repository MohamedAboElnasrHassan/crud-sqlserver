<template>
  <q-page class="settings-page">
    <!-- Header مع عناصر تحكم سريعة -->
    <div class="settings-header">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="settings" class="q-mr-sm" />
            {{ $t('settings.title') }}
          </div>
          <div class="text-subtitle1 text-grey-6">{{ $t('settings.subtitle') }}</div>
        </div>

        <!-- عناصر تحكم سريعة -->
        <div class="col-auto">
          <div class="row q-gutter-sm items-center">
            <!-- تبديل الثيم السريع -->
            <q-btn
              :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              :label="$q.dark.isActive ? $t('theme.light') : $t('theme.dark')"
              flat
              dense
              @click="toggleTheme"
              class="theme-toggle-btn"
            />

            <!-- حفظ سريع -->
            <q-btn
              color="primary"
              icon="save"
              :label="$t('settings.save_all')"
              @click="saveAllSettings"
              :loading="saving"
              unelevated
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="settings-content">
      <div class="row q-gutter-lg">
        <!-- Splash Settings -->
        <div class="col-12">
          <q-card class="settings-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="auto_awesome" class="q-mr-sm" />
                إعدادات شاشة البداية (Splash Screen)
              </div>

              <div class="row q-gutter-md">
                <div class="col-md-6 col-12">
                  <q-toggle
                    v-model="splashSettings.enabled"
                    label="تفعيل شاشة البداية"
                    color="primary"
                    @update:model-value="updateSplashSettings"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-slider
                    v-model="splashSettings.duration"
                    :min="1"
                    :max="10"
                    :step="0.5"
                    label
                    label-always
                    :label-value="`${splashSettings.duration} ثانية`"
                    color="primary"
                    @update:model-value="updateSplashSettings"
                  />
                  <div class="text-caption text-grey-6">مدة عرض شاشة البداية</div>
                </div>
                <div class="col-md-6 col-12">
                  <q-select
                    v-model="splashSettings.animation"
                    :options="animationOptions"
                    label="نوع الحركة"
                    outlined
                    emit-value
                    map-options
                    @update:model-value="updateSplashSettings"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-toggle
                    v-model="splashSettings.showProgress"
                    label="إظهار شريط التقدم"
                    color="primary"
                    @update:model-value="updateSplashSettings"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-toggle
                    v-model="splashSettings.autoConnect"
                    label="محاولة الاتصال التلقائي"
                    color="primary"
                    @update:model-value="updateSplashSettings"
                  />
                </div>
                <div class="col-md-6 col-12">
                  <q-input
                    v-model="splashSettings.title"
                    label="عنوان التطبيق"
                    outlined
                    @update:model-value="updateSplashSettings"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Database Settings -->
        <div class="col-md-6 col-12">
          <q-card class="settings-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="storage" class="q-mr-sm" />
                إعدادات قاعدة البيانات
              </div>

              <div class="q-gutter-md">
                <q-toggle
                  v-model="dbSettings.autoConnect"
                  label="الاتصال التلقائي عند البدء"
                  color="primary"
                />
                <q-input
                  v-model="dbSettings.connectionTimeout"
                  label="مهلة الاتصال (ثانية)"
                  type="number"
                  outlined
                />
                <q-input
                  v-model="dbSettings.queryTimeout"
                  label="مهلة الاستعلام (ثانية)"
                  type="number"
                  outlined
                />
                <q-toggle
                  v-model="dbSettings.enablePooling"
                  label="تفعيل تجميع الاتصالات"
                  color="primary"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Theme & Language Settings -->
        <div class="col-12">
          <q-card class="settings-card theme-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="palette" class="q-mr-sm" />
                {{ $t('settings.theme_and_language') }}
              </div>

              <div class="row q-gutter-lg">
                <!-- Theme Settings -->
                <div class="col-md-6 col-12">
                  <div class="theme-section">
                    <div class="text-subtitle1 q-mb-md">{{ $t('settings.theme_settings') }}</div>

                    <!-- Theme Mode Selection -->
                    <q-option-group
                      v-model="uiSettings.themeMode"
                      :options="themeModeOptions"
                      color="primary"
                      inline
                      @update:model-value="onThemeModeChange"
                      class="theme-mode-group q-mb-md"
                    />

                    <!-- Theme Colors -->
                    <div class="theme-colors q-mb-md">
                      <div class="text-body2 q-mb-sm">{{ $t('settings.primary_color') }}</div>
                      <div class="row q-gutter-sm">
                        <q-btn
                          v-for="color in primaryColors"
                          :key="color.value"
                          :style="{ backgroundColor: color.color }"
                          :class="{ 'selected-color': uiSettings.primaryColor === color.value }"
                          class="color-btn"
                          round
                          size="md"
                          @click="changePrimaryColor(color.value)"
                        >
                          <q-icon
                            v-if="uiSettings.primaryColor === color.value"
                            name="check"
                            color="white"
                            size="sm"
                          />
                        </q-btn>
                      </div>
                    </div>

                    <!-- Advanced Theme Options -->
                    <q-expansion-item
                      icon="tune"
                      :label="$t('settings.advanced_theme')"
                      class="advanced-theme"
                    >
                      <div class="q-pa-md">
                        <q-toggle
                          v-model="uiSettings.animations"
                          :label="$t('settings.enable_animations')"
                          color="primary"
                          class="q-mb-sm"
                        />
                        <q-toggle
                          v-model="uiSettings.transitions"
                          :label="$t('settings.enable_transitions')"
                          color="primary"
                          class="q-mb-sm"
                        />
                        <q-toggle
                          v-model="uiSettings.rippleEffect"
                          :label="$t('settings.ripple_effect')"
                          color="primary"
                        />
                      </div>
                    </q-expansion-item>
                  </div>
                </div>

                <!-- Language Settings -->
                <div class="col-md-6 col-12">
                  <div class="language-section">
                    <div class="text-subtitle1 q-mb-md">{{ $t('settings.language_settings') }}</div>

                    <!-- Language Selection -->
                    <q-list bordered class="language-list">
                      <q-item
                        v-for="lang in languageOptions"
                        :key="lang.value"
                        clickable
                        @click="changeLanguage(lang.value)"
                        :class="{ 'selected-language': locale === lang.value }"
                      >
                        <q-item-section avatar>
                          <q-icon
                            :name="lang.icon"
                            :color="locale === lang.value ? 'primary' : 'grey-6'"
                          />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ lang.label }}</q-item-label>
                          <q-item-label caption>{{ lang.description }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-radio :model-value="locale" :val="lang.value" color="primary" />
                        </q-item-section>
                      </q-item>
                    </q-list>

                    <!-- RTL Support -->
                    <q-toggle
                      v-model="uiSettings.rtlSupport"
                      :label="$t('settings.rtl_support')"
                      color="primary"
                      class="q-mt-md"
                      @update:model-value="toggleRTL"
                    />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Logging Settings -->
        <div class="col-md-6 col-12">
          <q-card class="settings-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="assignment" class="q-mr-sm" />
                إعدادات السجلات
              </div>

              <div class="q-gutter-md">
                <q-select
                  v-model="logSettings.level"
                  :options="logLevelOptions"
                  label="مستوى السجل"
                  outlined
                  emit-value
                  map-options
                />
                <q-input
                  v-model="logSettings.maxSize"
                  label="الحد الأقصى لحجم السجل (MB)"
                  type="number"
                  outlined
                />
                <q-input
                  v-model="logSettings.maxFiles"
                  label="عدد ملفات السجل المحفوظة"
                  type="number"
                  outlined
                />
                <q-toggle
                  v-model="logSettings.autoClean"
                  label="التنظيف التلقائي للسجلات"
                  color="primary"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Performance Settings -->
        <div class="col-md-6 col-12">
          <q-card class="settings-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">
                <q-icon name="speed" class="q-mr-sm" />
                إعدادات الأداء
              </div>

              <div class="q-gutter-md">
                <q-input
                  v-model="performanceSettings.maxRows"
                  label="الحد الأقصى للصفوف المعروضة"
                  type="number"
                  outlined
                />
                <q-input
                  v-model="performanceSettings.pageSize"
                  label="حجم الصفحة"
                  type="number"
                  outlined
                />
                <q-toggle
                  v-model="performanceSettings.lazyLoading"
                  label="التحميل التدريجي"
                  color="primary"
                />
                <q-toggle
                  v-model="performanceSettings.caching"
                  label="تفعيل التخزين المؤقت"
                  color="primary"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="row q-mt-xl q-gutter-md justify-center">
        <q-btn
          color="primary"
          icon="save"
          label="حفظ الإعدادات"
          @click="saveAllSettings"
          :loading="saving"
          size="lg"
        />
        <q-btn
          color="secondary"
          icon="refresh"
          label="استعادة الافتراضي"
          @click="resetToDefaults"
          outline
          size="lg"
        />
        <q-btn
          color="info"
          icon="import_export"
          label="تصدير الإعدادات"
          @click="exportSettings"
          flat
          size="lg"
        />
        <q-btn
          color="warning"
          icon="upload"
          label="استيراد الإعدادات"
          @click="importSettings"
          flat
          size="lg"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar, colors } from 'quasar';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t, locale } = useI18n();

// State
const saving = ref(false);

// Splash Settings
const splashSettings = ref({
  enabled: true,
  duration: 4,
  animation: 'fade',
  showProgress: true,
  autoConnect: true,
  title: 'نظام إدارة قاعدة البيانات',
});

// Database Settings
const dbSettings = ref({
  autoConnect: true,
  connectionTimeout: 30,
  queryTimeout: 60,
  enablePooling: true,
});

// UI Settings المحسنة
const uiSettings = ref({
  themeMode: 'auto', // auto, light, dark
  primaryColor: 'blue',
  animations: true,
  transitions: true,
  rippleEffect: true,
  rtlSupport: false,
  notifications: true,
});

// Logging Settings
const logSettings = ref({
  level: 'info',
  maxSize: 10,
  maxFiles: 5,
  autoClean: true,
});

// Performance Settings
const performanceSettings = ref({
  maxRows: 1000,
  pageSize: 25,
  lazyLoading: true,
  caching: true,
});

// Options
const animationOptions = [
  { label: 'تلاشي', value: 'fade' },
  { label: 'انزلاق', value: 'slide' },
  { label: 'تكبير', value: 'zoom' },
  { label: 'دوران', value: 'rotate' },
];

// خيارات الثيم المحسنة
const themeModeOptions = [
  { label: t('theme.auto'), value: 'auto', icon: 'brightness_auto' },
  { label: t('theme.light'), value: 'light', icon: 'light_mode' },
  { label: t('theme.dark'), value: 'dark', icon: 'dark_mode' },
];

// ألوان أساسية متاحة
const primaryColors = [
  { value: 'blue', color: '#1976D2', name: 'Blue' },
  { value: 'indigo', color: '#3F51B5', name: 'Indigo' },
  { value: 'purple', color: '#9C27B0', name: 'Purple' },
  { value: 'pink', color: '#E91E63', name: 'Pink' },
  { value: 'red', color: '#F44336', name: 'Red' },
  { value: 'orange', color: '#FF9800', name: 'Orange' },
  { value: 'amber', color: '#FFC107', name: 'Amber' },
  { value: 'green', color: '#4CAF50', name: 'Green' },
  { value: 'teal', color: '#009688', name: 'Teal' },
  { value: 'cyan', color: '#00BCD4', name: 'Cyan' },
];

// خيارات اللغة المحسنة
const languageOptions = [
  {
    label: 'العربية',
    value: 'ar',
    icon: 'language',
    description: 'Arabic - العربية',
  },
  {
    label: 'English',
    value: 'en',
    icon: 'language',
    description: 'English - الإنجليزية',
  },
];

const logLevelOptions = [
  { label: 'خطأ فقط', value: 'error' },
  { label: 'تحذير', value: 'warn' },
  { label: 'معلومات', value: 'info' },
  { label: 'تفصيلي', value: 'debug' },
];

// وظائف الثيم واللغة الجديدة

// تبديل الثيم السريع
function toggleTheme() {
  $q.dark.toggle();

  // تحديث الإعدادات
  uiSettings.value.themeMode = $q.dark.isActive ? 'dark' : 'light';

  // حفظ التفضيل
  localStorage.setItem('darkMode', $q.dark.isActive.toString());
  localStorage.setItem('themeMode', uiSettings.value.themeMode);

  $q.notify({
    type: 'info',
    message: $q.dark.isActive ? t('theme.switched_to_dark') : t('theme.switched_to_light'),
    position: 'top',
    timeout: 2000,
  });
}

// تغيير وضع الثيم
function onThemeModeChange(mode) {
  switch (mode) {
    case 'light':
      $q.dark.set(false);
      break;
    case 'dark':
      $q.dark.set(true);
      break;
    case 'auto':
      $q.dark.set('auto');
      break;
  }

  localStorage.setItem('themeMode', mode);

  $q.notify({
    type: 'positive',
    message: t('theme.mode_changed'),
    position: 'top',
    timeout: 2000,
  });
}

// تغيير اللون الأساسي
function changePrimaryColor(colorValue) {
  uiSettings.value.primaryColor = colorValue;

  // تطبيق اللون الجديد
  const colorObj = primaryColors.find((c) => c.value === colorValue);
  if (colorObj) {
    colors.setBrand('primary', colorObj.color);
    localStorage.setItem('primaryColor', colorValue);

    $q.notify({
      type: 'positive',
      message: t('theme.color_changed'),
      position: 'top',
      timeout: 2000,
    });
  }
}

// تغيير اللغة
function changeLanguage(langCode) {
  locale.value = langCode;

  // حفظ التفضيل
  localStorage.setItem('language', langCode);

  $q.notify({
    type: 'positive',
    message: t('language.changed'),
    position: 'top',
    timeout: 2000,
  });
}

// تبديل دعم RTL
function toggleRTL(enabled) {
  // هنا يمكن إضافة منطق RTL
  localStorage.setItem('rtlSupport', enabled.toString());

  $q.notify({
    type: 'info',
    message: enabled ? t('settings.rtl_enabled') : t('settings.rtl_disabled'),
    position: 'top',
    timeout: 2000,
  });
}

// Functions
async function saveAllSettings() {
  saving.value = true;

  try {
    logger.info('حفظ جميع الإعدادات');

    // محاكاة حفظ الإعدادات
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // حفظ في localStorage
    localStorage.setItem(
      'appSettings',
      JSON.stringify({
        splash: splashSettings.value,
        database: dbSettings.value,
        ui: uiSettings.value,
        logging: logSettings.value,
        performance: performanceSettings.value,
      }),
    );

    logger.info('تم حفظ جميع الإعدادات بنجاح');

    $q.notify({
      type: 'positive',
      message: 'تم حفظ جميع الإعدادات بنجاح',
      position: 'top',
      timeout: 3000,
    });
  } catch (error) {
    logger.error('فشل في حفظ الإعدادات', { error });

    $q.notify({
      type: 'negative',
      message: 'فشل في حفظ الإعدادات',
      position: 'top',
      timeout: 3000,
    });
  } finally {
    saving.value = false;
  }
}

function resetToDefaults() {
  $q.dialog({
    title: 'تأكيد',
    message: 'هل أنت متأكد من استعادة الإعدادات الافتراضية؟',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // استعادة الإعدادات الافتراضية
    splashSettings.value = {
      enabled: true,
      duration: 4,
      animation: 'fade',
      logoPath: '',
    };

    dbSettings.value = {
      autoConnect: true,
      connectionTimeout: 30,
      queryTimeout: 60,
      enablePooling: true,
    };

    uiSettings.value = {
      theme: 'light',
      language: 'arabic',
      animations: true,
      notifications: true,
    };

    logSettings.value = {
      level: 'info',
      maxSize: 10,
      maxFiles: 5,
      autoClean: true,
    };

    performanceSettings.value = {
      maxRows: 1000,
      pageSize: 25,
      lazyLoading: true,
      caching: true,
    };

    logger.info('تم استعادة الإعدادات الافتراضية');

    $q.notify({
      type: 'positive',
      message: 'تم استعادة الإعدادات الافتراضية',
      position: 'top',
      timeout: 2000,
    });
  });
}

function exportSettings() {
  logger.info('تصدير الإعدادات');

  $q.notify({
    type: 'info',
    message: 'ميزة تصدير الإعدادات قيد التطوير',
    position: 'top',
    timeout: 2000,
  });
}

function importSettings() {
  logger.info('استيراد الإعدادات');

  $q.notify({
    type: 'info',
    message: 'ميزة استيراد الإعدادات قيد التطوير',
    position: 'top',
    timeout: 2000,
  });
}

// تحديث إعدادات Splash فوراً
function updateSplashSettings() {
  try {
    // حفظ إعدادات Splash في localStorage
    localStorage.setItem('splashSettings', JSON.stringify(splashSettings.value));

    // إرسال الإعدادات إلى Electron main process
    if (window.electronAPI && window.electronAPI.invoke) {
      window.electronAPI.invoke('update-splash-settings', splashSettings.value);
    }

    logger.info('تم تحديث إعدادات شاشة البداية', splashSettings.value);

    $q.notify({
      type: 'positive',
      message: 'تم تحديث إعدادات شاشة البداية',
      position: 'top',
      timeout: 2000,
    });
  } catch (error) {
    logger.error('فشل في تحديث إعدادات شاشة البداية', { error });

    $q.notify({
      type: 'negative',
      message: 'فشل في تحديث الإعدادات',
      position: 'top',
      timeout: 2000,
    });
  }
}

// تحميل إعدادات Splash عند بدء التطبيق
function loadSplashSettings() {
  try {
    const saved = localStorage.getItem('splashSettings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      splashSettings.value = { ...splashSettings.value, ...parsedSettings };
      logger.info('تم تحميل إعدادات شاشة البداية المحفوظة');
    }
  } catch (error) {
    logger.error('فشل في تحميل إعدادات شاشة البداية', { error });
  }
}

// تحميل الإعدادات عند بدء الصفحة
function loadSettings() {
  try {
    // تحميل الثيم المحفوظ
    const savedThemeMode = localStorage.getItem('themeMode');
    if (savedThemeMode) {
      uiSettings.value.themeMode = savedThemeMode;
      onThemeModeChange(savedThemeMode);
    }

    // تحميل اللون الأساسي المحفوظ
    const savedPrimaryColor = localStorage.getItem('primaryColor');
    if (savedPrimaryColor) {
      uiSettings.value.primaryColor = savedPrimaryColor;
      changePrimaryColor(savedPrimaryColor);
    }

    // تحميل اللغة المحفوظة
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      locale.value = savedLanguage;
    }

    // تحميل إعدادات Splash
    loadSplashSettings();

    // تحميل باقي الإعدادات
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      if (settings.ui) {
        Object.assign(uiSettings.value, settings.ui);
      }
    }
  } catch (error) {
    console.error('خطأ في تحميل الإعدادات:', error);
  }
}

onMounted(() => {
  logger.info('تم فتح صفحة الإعدادات');
  loadSettings();
});
</script>

<style lang="scss" scoped>
// استخدام متغيرات Quasar
.settings-page {
  padding: 24px;
  background: var(--q-color-background);
  min-height: 100vh;
}

.settings-header {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--q-color-surface);
  border-radius: 12px;
  box-shadow:
    0 10px 20px rgba(0, 0, 0, 0.19),
    0 6px 6px rgba(0, 0, 0, 0.23);
  border: 1px solid var(--q-color-separator);
}

.settings-content {
  max-width: 1200px;
  margin: 0 auto;
}

.settings-card {
  border-radius: 12px;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.16),
    0 3px 6px rgba(0, 0, 0, 0.23);
  transition: all 0.3s ease;
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-separator);

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 19px 38px rgba(0, 0, 0, 0.3),
      0 15px 12px rgba(0, 0, 0, 0.22);
  }
}

// تحسينات خاصة بالثيم
.theme-card {
  .theme-section {
    .theme-mode-group {
      .q-radio {
        margin-bottom: 8px;
      }
    }

    .theme-colors {
      .color-btn {
        width: 40px;
        height: 40px;
        border: 3px solid transparent;
        transition: all 0.3s ease;

        &.selected-color {
          border-color: var(--q-color-primary);
          transform: scale(1.1);
        }

        &:hover {
          transform: scale(1.05);
          box-shadow:
            0 14px 28px rgba(0, 0, 0, 0.25),
            0 10px 10px rgba(0, 0, 0, 0.22);
        }
      }
    }

    .advanced-theme {
      background: rgba(var(--q-color-primary-rgb), 0.05);
      border-radius: 8px;
    }
  }
}

// تحسينات اللغة
.language-section {
  .language-list {
    border-radius: 8px;
    overflow: hidden;

    .q-item {
      transition: all 0.3s ease;

      &.selected-language {
        background: rgba(var(--q-color-primary-rgb), 0.1);
        border-left: 4px solid var(--q-color-primary);
      }

      &:hover {
        background: rgba(var(--q-color-primary-rgb), 0.05);
      }
    }
  }
}

// تحسينات الأزرار
.theme-toggle-btn {
  transition: all 0.3s ease;

  &:hover {
    background: rgba(var(--q-color-primary-rgb), 0.1);
    transform: scale(1.05);
  }
}

// تحسينات للشاشات الصغيرة
@media (max-width: 768px) {
  .settings-page {
    padding: 16px;
  }

  .settings-header {
    padding: 16px;

    .row {
      flex-direction: column;
      gap: 16px;
    }
  }

  .theme-colors .row {
    justify-content: center;
  }

  .color-btn {
    width: 35px !important;
    height: 35px !important;
  }
}

// تحسينات للوضع المظلم
body.body--dark {
  .settings-page {
    background: var(--q-color-dark-page);
  }

  .advanced-theme {
    background: rgba(255, 255, 255, 0.05) !important;
  }

  .selected-language {
    background: rgba(var(--q-color-primary-rgb), 0.2) !important;
  }
}

// حركات وتأثيرات
.settings-card {
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

// تأثيرات hover للعناصر التفاعلية
.q-toggle,
.q-select,
.q-input {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

// تحسينات الأزرار الرئيسية
.q-btn {
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 14px 28px rgba(0, 0, 0, 0.25),
      0 10px 10px rgba(0, 0, 0, 0.22);
  }
}
</style>
