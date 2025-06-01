<template>
  <div class="splash-screen" v-if="showSplash">
    <div class="splash-container">
      <!-- شعار التطبيق -->
      <div class="logo-container">
        <q-icon name="storage" size="80px" color="white" />
      </div>

      <!-- عنوان التطبيق -->
      <div class="app-info">
        <h1 class="app-title">{{ splashSettings.title || 'إدارة قاعدة البيانات' }}</h1>
        <p class="app-subtitle">نظام CRUD لـ SQL Server</p>
      </div>

      <!-- شريط التقدم -->
      <div v-if="splashSettings.showProgress" class="progress-container">
        <q-linear-progress
          :value="progress / 100"
          color="white"
          track-color="rgba(255,255,255,0.3)"
          size="4px"
          rounded
          class="progress-bar"
        />
        <div class="progress-text">{{ progressText }}</div>
      </div>

      <!-- معلومات الإصدار -->
      <div class="version-info">
        <span>الإصدار 1.0.0</span>
        <span class="separator">•</span>
        <span>Quasar Framework</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, onMounted } from 'vue';

// Props
const props = defineProps({
  duration: {
    type: Number,
    default: 3000,
  },
});

// إعدادات Splash
const splashSettings = ref({
  enabled: true,
  showProgress: true,
  title: 'إدارة قاعدة البيانات',
});

// Emits
const emit = defineEmits(['complete']);

// State
const showSplash = ref(true);
const progress = ref(0);
const progressText = ref('جاري تهيئة التطبيق...');

// رسائل التقدم
const progressMessages = [
  'جاري تهيئة التطبيق...',
  'جاري تحميل المكونات...',
  'جاري الاتصال بقاعدة البيانات...',
  'جاري تحضير الواجهة...',
  'تم التحميل بنجاح!',
];

// تحميل إعدادات Splash
function loadSplashSettings() {
  try {
    const saved = localStorage.getItem('splashSettings');
    if (saved) {
      const parsedSettings = JSON.parse(saved);
      splashSettings.value = { ...splashSettings.value, ...parsedSettings };
    }
  } catch (error) {
    console.error('فشل في تحميل إعدادات شاشة البداية', error);
  }
}

// تشغيل الـ splash screen
onMounted(() => {
  // تحميل الإعدادات أولاً
  loadSplashSettings();

  // التحقق من تفعيل Splash
  if (!splashSettings.value.enabled) {
    showSplash.value = false;
    emit('complete');
    return;
  }

  let currentProgress = 0;
  const actualDuration = splashSettings.value.duration
    ? splashSettings.value.duration * 1000
    : props.duration;
  const increment = 100 / (actualDuration / 100);

  const interval = setInterval(() => {
    currentProgress += increment;
    progress.value = Math.min(currentProgress, 100);

    // تحديث رسالة التقدم
    if (splashSettings.value.showProgress) {
      const messageIndex = Math.floor((progress.value / 100) * (progressMessages.length - 1));
      const currentMessage = progressMessages[messageIndex];
      if (currentMessage) {
        progressText.value = currentMessage;
      }
    }

    if (progress.value >= 100) {
      clearInterval(interval);

      // انتظار قصير قبل الإخفاء
      setTimeout(() => {
        showSplash.value = false;
        emit('complete');
      }, 500);
    }
  }, 100);
});
</script>

<style lang="scss" scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

.splash-container {
  text-align: center;
  color: white;
  position: relative;
  z-index: 2;
  animation: fadeInUp 1s ease-out;
}

.logo-container {
  margin-bottom: 40px;
  animation: pulse 2s infinite;
}

.app-info {
  margin-bottom: 50px;
}

.app-title {
  font-size: 32px;
  font-weight: 300;
  margin-bottom: 10px;
  letter-spacing: 2px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.app-subtitle {
  font-size: 16px;
  opacity: 0.9;
  font-weight: 300;
}

.progress-container {
  width: 300px;
  margin: 0 auto 30px;
}

.progress-bar {
  margin-bottom: 15px;
  border-radius: 2px;
  overflow: hidden;
}

.progress-text {
  font-size: 14px;
  opacity: 0.8;
  animation: blink 2s infinite;
}

.version-info {
  font-size: 12px;
  opacity: 0.6;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.separator {
  opacity: 0.4;
}

// الحركات
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

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

@keyframes blink {
  0%,
  50% {
    opacity: 0.8;
  }
  51%,
  100% {
    opacity: 0.4;
  }
}

// تحسينات للشاشات الصغيرة
@media (max-width: 600px) {
  .app-title {
    font-size: 24px;
  }

  .app-subtitle {
    font-size: 14px;
  }

  .progress-container {
    width: 250px;
  }
}
</style>
