<template>
  <div id="q-app">
    <!-- Splash Screen -->
    <SplashScreen v-if="showSplash" :duration="3000" @complete="onSplashComplete" />

    <!-- التطبيق الرئيسي -->
    <router-view v-else />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import SplashScreen from 'src/components/SplashScreen.vue';
import { logger } from 'src/utils/logger.js';

const showSplash = ref(true);

const onSplashComplete = () => {
  showSplash.value = false;
  logger.info('تم إكمال Splash Screen وبدء التطبيق الرئيسي');
};

onMounted(() => {
  logger.info('تم بدء تشغيل التطبيق مع Splash Screen');
});
</script>
