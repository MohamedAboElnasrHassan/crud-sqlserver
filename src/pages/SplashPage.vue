<template>
  <q-page class="splash-page">
    <div class="splash-container">
      <!-- Logo والعنوان مع حركات Quasar -->
      <div class="splash-logo" :class="animationClass">
        <q-avatar size="140px" class="splash-avatar q-mb-lg">
          <q-icon name="storage" size="100px" :color="settings.logoColor" />
        </q-avatar>

        <div class="splash-title">{{ settings.title }}</div>
        <div class="splash-subtitle">{{ settings.subtitle }}</div>
        <div class="splash-version">{{ $t('splash.version') }} {{ appVersion }}</div>
      </div>

      <!-- شريط التقدم مع تحسينات Quasar -->
      <div class="splash-progress" v-if="settings.showProgress">
        <q-linear-progress
          :value="progress / 100"
          :color="settings.progressColor"
          :track-color="settings.trackColor"
          size="12px"
          rounded
          :animation-speed="settings.animationSpeed"
          stripe
          class="q-mb-md progress-bar"
        />
        <div class="progress-info">
          <div class="progress-text">{{ progressText }}</div>
          <div class="progress-percentage">{{ Math.round(progress) }}%</div>
        </div>
      </div>

      <!-- رسالة الحالة مع Chip -->
      <div class="splash-status">
        <q-chip
          :icon="statusIcon"
          :color="statusColor"
          text-color="white"
          size="md"
          class="status-chip"
          :class="statusClass"
        >
          {{ statusMessage }}
        </q-chip>
      </div>

      <!-- معلومات إضافية قابلة للتخصيص -->
      <div class="splash-info" v-if="settings.showInfo">
        <q-separator class="q-my-md" color="white" />
        <div class="info-grid">
          <div class="info-item">
            <q-icon name="schedule" size="16px" />
            <span>{{ $t('splash.loading_time') }}: {{ loadingTime }}s</span>
          </div>
          <div class="info-item">
            <q-icon name="memory" size="16px" />
            <span>{{ $t('splash.memory_usage') }}: {{ memoryUsage }}MB</span>
          </div>
        </div>
      </div>

      <!-- معلومات الحقوق -->
      <div class="splash-footer">
        <div class="copyright">{{ settings.copyright }}</div>
        <div class="company">{{ settings.company }}</div>
      </div>
    </div>

    <!-- Loading overlay للحالات الطارئة -->
    <q-inner-loading
      :showing="isEmergencyLoading"
      :label="$t('splash.emergency_loading')"
      label-class="text-white"
      label-style="font-size: 1.1em"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
// import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

// const $q = useQuasar();
const { t } = useI18n();

// State
const progress = ref(0);
const progressText = ref('');
const statusMessage = ref('');
const statusIcon = ref('hourglass_empty');
const statusColor = ref('primary');
const statusClass = ref('');
const loadingTime = ref(0);
const memoryUsage = ref(0);
const isEmergencyLoading = ref(false);
const appVersion = ref('1.0.0');

// إعدادات قابلة للتخصيص من localStorage أو الإعدادات
const settings = ref({
  enabled: true,
  duration: 4,
  animation: 'fade',
  showProgress: true,
  showInfo: true,
  title: 'نظام إدارة قواعد البيانات',
  subtitle: 'CRUD SQL Server Management System',
  logoColor: 'primary',
  progressColor: 'primary',
  trackColor: 'rgba(255,255,255,0.3)',
  animationSpeed: 300,
  copyright: '© 2025 جميع الحقوق محفوظة',
  company: 'Mohamed Abo Elnasr Hassan',
});

// رسائل التحميل المحسنة
const loadingMessages = [
  { text: 'splash.initializing', icon: 'settings', color: 'primary' },
  { text: 'splash.loading_components', icon: 'widgets', color: 'secondary' },
  { text: 'splash.setting_up_system', icon: 'build', color: 'accent' },
  { text: 'splash.preparing_interface', icon: 'palette', color: 'positive' },
  { text: 'splash.connecting_database', icon: 'storage', color: 'info' },
  { text: 'splash.finalizing', icon: 'check_circle', color: 'positive' },
];

// Animation class computed
const animationClass = computed(() => {
  const animations = {
    fade: 'animate__animated animate__fadeInDown',
    slide: 'animate__animated animate__slideInUp',
    zoom: 'animate__animated animate__zoomIn',
    rotate: 'animate__animated animate__rotateIn',
  };
  return animations[settings.value.animation] || animations.fade;
});

let loadingInterval = null;
let timeInterval = null;

// تحميل الإعدادات من localStorage
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem('splashSettings');
    if (savedSettings) {
      settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
    }
  } catch (error) {
    console.warn('Failed to load splash settings:', error);
  }
}

// محاكاة استخدام الذاكرة
function simulateMemoryUsage() {
  memoryUsage.value = Math.floor(Math.random() * 50) + 30; // 30-80 MB
}

// محاكاة عملية التحميل المحسنة
function simulateLoading() {
  let currentStep = 0;
  const totalSteps = loadingMessages.length;
  const stepDuration = (settings.value.duration * 1000) / totalSteps;

  loadingInterval = setInterval(() => {
    if (currentStep < totalSteps) {
      const message = loadingMessages[currentStep];
      progress.value = ((currentStep + 1) / totalSteps) * 100;
      progressText.value = t(message.text);
      statusMessage.value = t(message.text);
      statusIcon.value = message.icon;
      statusColor.value = message.color;
      statusClass.value = `animate__animated animate__pulse`;

      currentStep++;
    } else {
      clearInterval(loadingInterval);
      onLoadingComplete();
    }
  }, stepDuration);
}

// عند اكتمال التحميل
function onLoadingComplete() {
  statusMessage.value = t('splash.completed');
  statusIcon.value = 'check_circle';
  statusColor.value = 'positive';
  statusClass.value = 'animate__animated animate__bounceIn';

  // الانتقال للصفحة التالية بعد تأخير قصير
  setTimeout(() => {
    // هنا يمكن إضافة منطق الانتقال للصفحة التالية
    console.log('Splash completed, ready to navigate');
  }, 1000);
}

// تتبع وقت التحميل
function startTimeTracking() {
  const startTime = Date.now();
  timeInterval = setInterval(() => {
    loadingTime.value = ((Date.now() - startTime) / 1000).toFixed(1);
  }, 100);
}

// تهيئة الصفحة
onMounted(() => {
  loadSettings();
  simulateMemoryUsage();
  startTimeTracking();

  // بدء التحميل بعد تأخير قصير للسماح بالحركات
  setTimeout(() => {
    simulateLoading();
  }, 500);
});

// تنظيف عند إلغاء التحميل
onUnmounted(() => {
  if (loadingInterval) clearInterval(loadingInterval);
  if (timeInterval) clearInterval(timeInterval);
});
</script>

<style lang="scss" scoped>
// استخدام متغيرات Quasar
.splash-page {
  background: linear-gradient(135deg, var(--q-color-primary) 0%, #1565c0 100%);
  color: white;
  overflow: hidden;
}

.splash-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 24px;
}

// تأثيرات خلفية متقدمة
.splash-container::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  animation: rotate 20s linear infinite;
  z-index: 0;
}

.splash-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// Logo والعنوان
.splash-logo {
  text-align: center;
  margin-bottom: 32px;
  z-index: 1;
  position: relative;
}

.splash-avatar {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.3));
}

.splash-title {
  font-size: 2rem;
  font-weight: 700;
  margin-top: 16px;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease-out 0.5s both;
}

.splash-subtitle {
  font-size: 1rem;
  font-weight: 400;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease-out 0.7s both;
  margin-bottom: 8px;
}

.splash-version {
  font-size: 0.875rem;
  opacity: 0.7;
  font-weight: 500;
  animation: fadeInUp 1s ease-out 0.9s both;
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

// شريط التقدم
.splash-progress {
  width: 100%;
  max-width: 400px;
  z-index: 1;
  margin-bottom: 24px;
  position: relative;
  animation: fadeInUp 1s ease-out 0.9s both;
}

.progress-bar {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(5px);
  background: rgba(255, 255, 255, 0.1);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.progress-text {
  font-size: 0.875rem;
  font-weight: 500;
  opacity: 0.9;
  animation: fadeIn 0.5s ease-in-out;
}

.progress-percentage {
  font-size: 0.875rem;
  font-weight: 600;
  opacity: 0.8;
}

// رسالة الحالة
.splash-status {
  z-index: 1;
  margin-bottom: 24px;
}

.status-chip {
  font-size: 0.875rem;
  font-weight: 500;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

// معلومات إضافية
.splash-info {
  width: 100%;
  max-width: 400px;
  z-index: 1;
  margin-bottom: 24px;
}

.info-grid {
  display: flex;
  justify-content: space-around;
  gap: 16px;
  margin-top: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  opacity: 0.8;
}

// معلومات الحقوق
.splash-footer {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 1;
  animation: fadeInUp 1s ease-out 1.1s both;
}

.copyright {
  font-size: 0.75rem;
  opacity: 0.7;
  margin-bottom: 8px;
}

.company {
  font-size: 0.75rem;
  opacity: 0.6;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* تأثيرات إضافية */
.splash-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

// تحسينات للشاشات الصغيرة
@media (max-width: 600px) {
  .splash-title {
    font-size: 1.5rem;
  }

  .splash-subtitle {
    font-size: 0.875rem;
  }

  .splash-progress {
    max-width: 300px;
  }

  .splash-avatar {
    width: 100px !important;
    height: 100px !important;
  }

  .info-grid {
    flex-direction: column;
    gap: 8px;
  }

  .splash-container {
    padding: 16px;
  }
}

// تحسينات للشاشات الكبيرة
@media (min-width: 1200px) {
  .splash-title {
    font-size: 2.5rem;
  }

  .splash-subtitle {
    font-size: 1.25rem;
  }

  .splash-progress {
    max-width: 500px;
  }

  .splash-avatar {
    width: 160px !important;
    height: 160px !important;
  }
}
</style>
