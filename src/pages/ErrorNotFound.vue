<template>
  <q-page class="error-page">
    <div class="error-container">
      <!-- خلفية متحركة -->
      <div class="background-animation">
        <div class="floating-shapes">
          <div class="shape shape-1"></div>
          <div class="shape shape-2"></div>
          <div class="shape shape-3"></div>
          <div class="shape shape-4"></div>
        </div>
      </div>

      <!-- المحتوى الرئيسي -->
      <div class="error-content">
        <!-- رقم الخطأ مع حركة -->
        <div class="error-number">
          <span class="number-4 animate__animated animate__bounceInLeft">4</span>
          <div class="number-0 animate__animated animate__bounceInDown">
            <q-icon name="sentiment_very_dissatisfied" size="120px" color="primary" />
          </div>
          <span class="number-4 animate__animated animate__bounceInRight">4</span>
        </div>

        <!-- العنوان والوصف -->
        <div class="error-text animate__animated animate__fadeInUp animate__delay-1s">
          <h1 class="error-title">{{ $t('error.page_not_found') }}</h1>
          <p class="error-description">{{ $t('error.page_not_found_desc') }}</p>
        </div>

        <!-- الإجراءات المقترحة -->
        <div class="error-actions animate__animated animate__fadeInUp animate__delay-2s">
          <div class="row q-gutter-md justify-center">
            <!-- العودة للرئيسية -->
            <q-btn
              color="primary"
              size="lg"
              icon="home"
              :label="$t('error.go_home')"
              unelevated
              rounded
              to="/"
              class="action-btn"
              no-caps
            />

            <!-- العودة للخلف -->
            <q-btn
              color="secondary"
              size="lg"
              icon="arrow_back"
              :label="$t('error.go_back')"
              outline
              rounded
              @click="goBack"
              class="action-btn"
              no-caps
            />

            <!-- الإبلاغ عن مشكلة -->
            <q-btn
              color="info"
              size="lg"
              icon="bug_report"
              :label="$t('error.report_issue')"
              flat
              rounded
              @click="reportIssue"
              class="action-btn"
              no-caps
            />
          </div>
        </div>

        <!-- روابط مفيدة -->
        <div class="helpful-links animate__animated animate__fadeInUp animate__delay-3s">
          <div class="text-h6 q-mb-md">{{ $t('error.helpful_links') }}</div>
          <div class="row q-gutter-sm justify-center">
            <q-chip
              clickable
              color="grey-3"
              text-color="grey-8"
              icon="storage"
              :label="$t('modules.database')"
              @click="$router.push('/database')"
            />
            <q-chip
              clickable
              color="grey-3"
              text-color="grey-8"
              icon="assignment"
              :label="$t('modules.logs')"
              @click="$router.push('/logs')"
            />
            <q-chip
              clickable
              color="grey-3"
              text-color="grey-8"
              icon="settings"
              :label="$t('modules.settings')"
              @click="$router.push('/settings')"
            />
          </div>
        </div>

        <!-- معلومات إضافية -->
        <div class="error-info animate__animated animate__fadeInUp animate__delay-4s">
          <q-expansion-item
            icon="info"
            :label="$t('error.technical_details')"
            class="technical-details"
          >
            <q-card flat class="q-mt-md">
              <q-card-section>
                <div class="row q-gutter-md">
                  <div class="col">
                    <div class="text-caption text-grey-6">{{ $t('error.requested_url') }}</div>
                    <div class="text-body2 text-weight-medium">{{ currentUrl }}</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">{{ $t('error.timestamp') }}</div>
                    <div class="text-body2 text-weight-medium">{{ currentTime }}</div>
                  </div>
                  <div class="col">
                    <div class="text-caption text-grey-6">{{ $t('error.user_agent') }}</div>
                    <div class="text-body2 text-weight-medium">{{ userAgent }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n();

// معلومات الخطأ
const currentUrl = ref(window.location.href);
const currentTime = ref(new Date().toLocaleString('ar-EG'));
const userAgent = computed(() => {
  const ua = navigator.userAgent;
  return ua.length > 50 ? ua.substring(0, 50) + '...' : ua;
});

// العودة للخلف
function goBack() {
  if (window.history.length > 1) {
    router.go(-1);
  } else {
    router.push('/');
  }
}

// الإبلاغ عن مشكلة
function reportIssue() {
  const issueData = {
    url: currentUrl.value,
    timestamp: currentTime.value,
    userAgent: navigator.userAgent,
    route: route.fullPath,
  };

  $q.dialog({
    title: t('error.report_issue'),
    message: t('error.report_issue_desc'),
    prompt: {
      model: '',
      type: 'textarea',
      placeholder: t('error.describe_issue'),
    },
    cancel: true,
    persistent: true,
  }).onOk((description) => {
    // هنا يمكن إرسال التقرير لخدمة خارجية
    console.log('Issue Report:', { ...issueData, description });

    $q.notify({
      type: 'positive',
      message: t('error.issue_reported'),
      position: 'top',
      timeout: 3000,
    });
  });
}

// تحديث الوقت كل ثانية
onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date().toLocaleString('ar-EG');
  }, 1000);
});
</script>

<style lang="scss" scoped>
// استخدام متغيرات Quasar
.error-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--q-color-primary) 0%,
    darken(var(--q-color-primary), 20%) 100%
  );
  overflow: hidden;
  position: relative;
}

.error-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  z-index: 2;
}

// خلفية متحركة
.background-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.floating-shapes {
  position: relative;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;

  &.shape-1 {
    width: 80px;
    height: 80px;
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }

  &.shape-2 {
    width: 120px;
    height: 120px;
    top: 60%;
    right: 15%;
    animation-delay: 2s;
  }

  &.shape-3 {
    width: 60px;
    height: 60px;
    bottom: 30%;
    left: 20%;
    animation-delay: 4s;
  }

  &.shape-4 {
    width: 100px;
    height: 100px;
    top: 10%;
    right: 30%;
    animation-delay: 1s;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

// المحتوى الرئيسي
.error-content {
  text-align: center;
  color: white;
  max-width: 800px;
  width: 100%;
  position: relative;
  z-index: 3;
}

// رقم الخطأ
.error-number {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  font-size: 8rem;
  font-weight: 900;
  line-height: 1;

  .number-4 {
    color: rgba(255, 255, 255, 0.9);
    text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }

  .number-0 {
    margin: 0 16px;
    display: flex;
    align-items: center;
    justify-content: center;

    .q-icon {
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
    }
  }
}

// النص
.error-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.error-description {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 32px;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

// الإجراءات
.error-actions {
  margin-bottom: 32px;

  .action-btn {
    min-width: 140px;
    font-weight: 600;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    }
  }
}

// الروابط المفيدة
.helpful-links {
  margin-bottom: 32px;

  .text-h6 {
    opacity: 0.9;
    margin-bottom: 16px;
  }

  .q-chip {
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
  }
}

// المعلومات التقنية
.error-info {
  .technical-details {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    backdrop-filter: blur(10px);

    .q-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
    }
  }
}

// تحسينات للشاشات الصغيرة
@media (max-width: 768px) {
  .error-container {
    padding: 16px;
  }

  .error-number {
    font-size: 4rem;
    flex-direction: column;
    gap: 16px;

    .number-0 {
      margin: 0;

      .q-icon {
        font-size: 80px !important;
      }
    }
  }

  .error-title {
    font-size: 1.75rem;
  }

  .error-description {
    font-size: 1rem;
  }

  .error-actions .row {
    flex-direction: column;
    gap: 12px;
  }

  .helpful-links .row {
    flex-direction: column;
    gap: 8px;
  }

  .error-info .row {
    flex-direction: column;
    gap: 12px;
  }
}

// تحسينات للوضع المظلم
body.body--dark {
  .error-page {
    background: linear-gradient(
      135deg,
      var(--q-color-dark) 0%,
      darken(var(--q-color-dark), 10%) 100%
    );
  }

  .shape {
    background: rgba(255, 255, 255, 0.05);
  }

  .technical-details {
    background: rgba(255, 255, 255, 0.05);

    .q-card {
      background: rgba(255, 255, 255, 0.02);
    }
  }
}

// حركات إضافية
.error-content > div {
  animation-duration: 1s;
  animation-fill-mode: both;
}

// تأثيرات hover للأزرار
.action-btn {
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
}
</style>
