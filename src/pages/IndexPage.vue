<template>
  <q-page class="admin-page">
    <!-- Header مع عناصر التحكم الأساسية -->
    <div class="admin-header">
      <div class="row items-center justify-between">
        <div class="col">
          <div class="text-h4 text-weight-bold text-primary">
            <q-icon name="admin_panel_settings" class="q-mr-sm" />
            {{ $t('admin.title') }}
          </div>
          <div class="text-subtitle1 text-grey-6">{{ $t('admin.subtitle') }}</div>
        </div>

        <!-- عناصر التحكم السريعة -->
        <div class="col-auto">
          <div class="row q-gutter-sm items-center">
            <!-- تبديل الثيم -->
            <q-btn
              :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
              :label="$q.dark.isActive ? $t('theme.light') : $t('theme.dark')"
              flat
              dense
              @click="toggleTheme"
              class="theme-toggle"
            />

            <!-- تبديل اللغة -->
            <q-btn-dropdown
              :label="currentLanguage.label"
              :icon="currentLanguage.icon"
              flat
              dense
              class="language-toggle"
            >
              <q-list>
                <q-item
                  v-for="lang in languages"
                  :key="lang.code"
                  clickable
                  v-close-popup
                  @click="changeLanguage(lang.code)"
                  :class="{ 'bg-primary text-white': locale === lang.code }"
                >
                  <q-item-section avatar>
                    <q-icon :name="lang.icon" />
                  </q-item-section>
                  <q-item-section>{{ lang.label }}</q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>

            <!-- حالة النظام -->
            <q-chip color="positive" text-color="white" icon="check_circle" size="md">
              {{ $t('admin.system_status') }}
            </q-chip>
          </div>
        </div>
      </div>
    </div>

    <!-- لوحة التحكم البسيطة -->
    <div class="admin-content">
      <!-- رسالة ترحيب -->
      <div class="welcome-section">
        <q-card class="welcome-card">
          <q-card-section class="text-center">
            <q-icon name="dashboard" size="80px" color="primary" class="q-mb-md" />
            <div class="text-h5 text-weight-bold q-mb-sm">{{ $t('admin.welcome') }}</div>
            <div class="text-body1 text-grey-6">{{ $t('admin.welcome_message') }}</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- الوحدات الأساسية -->
      <div class="modules-section q-mt-xl">
        <div class="text-h6 q-mb-lg text-center">{{ $t('admin.main_modules') }}</div>
        <div class="row q-gutter-lg justify-center">
          <!-- قاعدة البيانات -->
          <div class="col-md-3 col-sm-6 col-12">
            <q-card class="module-card" clickable @click="openDatabaseWindow">
              <q-card-section class="text-center">
                <q-icon name="storage" size="48px" color="primary" />
                <div class="text-h6 q-mt-md">{{ $t('modules.database') }}</div>
                <div class="text-caption text-grey-6">{{ $t('modules.database_desc') }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- السجلات -->
          <div class="col-md-3 col-sm-6 col-12">
            <q-card class="module-card" clickable @click="openLogsPage">
              <q-card-section class="text-center">
                <q-icon name="assignment" size="48px" color="info" />
                <div class="text-h6 q-mt-md">{{ $t('modules.logs') }}</div>
                <div class="text-caption text-grey-6">{{ $t('modules.logs_desc') }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- الإعدادات -->
          <div class="col-md-3 col-sm-6 col-12">
            <q-card class="module-card" clickable @click="openSettingsPage">
              <q-card-section class="text-center">
                <q-icon name="settings" size="48px" color="secondary" />
                <div class="text-h6 q-mt-md">{{ $t('modules.settings') }}</div>
                <div class="text-caption text-grey-6">{{ $t('modules.settings_desc') }}</div>
              </q-card-section>
            </q-card>
          </div>

          <!-- الفوترة الإلكترونية ZATCA -->
          <div class="col-md-3 col-sm-6 col-12">
            <q-card class="module-card zatca-card" clickable @click="openZATCASettings">
              <q-card-section class="text-center">
                <q-icon name="receipt_long" size="48px" color="primary" />
                <div class="text-h6 q-mt-md">الفوترة الإلكترونية</div>
                <div class="text-caption text-grey-6">إعدادات منصة فاتورة ZATCA</div>
                <q-badge color="positive" floating>جديد</q-badge>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const router = useRouter();
const { t, locale } = useI18n();

// اللغات المتاحة
const languages = ref([
  { code: 'ar', label: 'العربية', icon: 'language' },
  { code: 'en', label: 'English', icon: 'language' },
]);

// اللغة الحالية
const currentLanguage = computed(() => {
  return languages.value.find((lang) => lang.code === locale.value) || languages.value[0];
});

// تبديل الثيم
function toggleTheme() {
  $q.dark.toggle();

  // حفظ التفضيل
  localStorage.setItem('darkMode', $q.dark.isActive.toString());

  $q.notify({
    type: 'info',
    message: $q.dark.isActive ? t('theme.switched_to_dark') : t('theme.switched_to_light'),
    position: 'top',
    timeout: 2000,
  });
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

// فتح نافذة قاعدة البيانات
function openDatabaseWindow() {
  // التحقق من وجود Electron API
  if (window.electronAPI && window.electronAPI.openDatabaseWindow) {
    // فتح نافذة منفصلة في Electron
    window.electronAPI.openDatabaseWindow();

    $q.notify({
      type: 'info',
      message: t('modules.opening_database_window'),
      position: 'top',
      timeout: 2000,
    });
  } else {
    // التوجه للصفحة في المتصفح
    router.push('/database');
  }
}

// فتح صفحة السجلات
function openLogsPage() {
  router.push('/logs');
}

// فتح صفحة الإعدادات
function openSettingsPage() {
  router.push('/settings');
}

function openZATCASettings() {
  router.push('/zatca-settings');
}
</script>

<style lang="scss" scoped>
// استخدام متغيرات Quasar
.admin-page {
  padding: 24px;
  min-height: 100vh;
  background: var(--q-color-background);
}

.admin-header {
  margin-bottom: 32px;
  padding: 24px;
  background: var(--q-color-surface);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--q-color-separator);
}

.admin-content {
  max-width: 1200px;
  margin: 0 auto;
}

// عناصر التحكم السريعة
.theme-toggle,
.language-toggle {
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--q-color-primary);
    color: white;
  }
}

// رسالة الترحيب
.welcome-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-separator);

  .q-icon {
    opacity: 0.8;
  }
}

// بطاقات الوحدات
.module-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  background: var(--q-color-surface);
  border: 1px solid var(--q-color-separator);
  min-height: 160px;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
    border-color: var(--q-color-primary);
  }

  .q-icon {
    transition: all 0.3s ease;
  }

  &:hover .q-icon {
    transform: scale(1.1);
  }
}

// بطاقة ZATCA خاصة
.zatca-card {
  position: relative;
  background: var(--q-color-surface);
  border: 2px solid var(--q-color-primary);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--q-color-primary), var(--q-color-secondary));
  }

  &:hover {
    background: rgba(var(--q-color-primary-rgb), 0.05);
  }

  .q-badge {
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// تحسينات للشاشات الصغيرة
@media (max-width: 600px) {
  .admin-page {
    padding: 16px;
  }

  .admin-header {
    padding: 16px;

    .row {
      flex-direction: column;
      gap: 16px;
    }
  }

  .theme-toggle,
  .language-toggle {
    font-size: 0.875rem;
  }
}

// تحسينات للوضع المظلم
body.body--dark {
  .admin-page {
    background: var(--q-color-dark);
  }
}
</style>
