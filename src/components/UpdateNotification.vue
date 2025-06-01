<template>
  <q-dialog v-model="showDialog" persistent>
    <q-card class="update-card" style="min-width: 400px">
      <!-- رأس البطاقة -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">
          <q-icon name="system_update" class="q-mr-sm" />
          {{ getTitle() }}
        </div>
        <q-space />
        <q-btn
          v-if="updateState !== 'downloading'"
          icon="close"
          flat
          round
          dense
          @click="closeDialog"
        />
      </q-card-section>

      <!-- محتوى البطاقة -->
      <q-card-section>
        <!-- حالة الفحص -->
        <div v-if="updateState === 'checking'" class="text-center">
          <q-spinner-dots size="40px" color="primary" />
          <div class="q-mt-md">{{ $t('updater.checking') }}</div>
        </div>

        <!-- تحديث متاح -->
        <div v-else-if="updateState === 'available'">
          <div class="q-mb-md">
            {{ $t('updater.updateAvailable') }}
            <strong v-if="updateInfo?.version">{{ updateInfo.version }}</strong>
          </div>
          <div v-if="updateInfo?.releaseNotes" class="release-notes">
            <q-expansion-item
              icon="description"
              :label="$t('updater.releaseNotes')"
              class="q-mb-md"
            >
              <div class="q-pa-md" v-html="updateInfo.releaseNotes"></div>
            </q-expansion-item>
          </div>
        </div>

        <!-- جاري التحميل -->
        <div v-else-if="updateState === 'downloading'">
          <div class="q-mb-md">{{ $t('updater.downloadProgress') }}</div>
          <q-linear-progress
            :value="downloadProgress / 100"
            color="primary"
            size="20px"
            class="q-mb-md"
          >
            <div class="absolute-full flex flex-center">
              <q-badge color="white" text-color="primary" :label="`${Math.round(downloadProgress)}%`" />
            </div>
          </q-linear-progress>
          <div class="text-caption text-center">
            {{ formatBytes(downloadedBytes) }} / {{ formatBytes(totalBytes) }}
          </div>
        </div>

        <!-- تم التحميل -->
        <div v-else-if="updateState === 'downloaded'">
          <div class="q-mb-md">
            <q-icon name="check_circle" color="positive" size="24px" class="q-mr-sm" />
            {{ $t('updater.updateDownloaded') }}
          </div>
          <div class="text-body2 text-grey-7">
            {{ $t('updater.restartRequired') }}
          </div>
        </div>

        <!-- خطأ -->
        <div v-else-if="updateState === 'error'">
          <div class="q-mb-md text-negative">
            <q-icon name="error" size="24px" class="q-mr-sm" />
            {{ $t('updater.error') }}
          </div>
          <div class="text-body2" v-if="errorMessage">
            {{ errorMessage }}
          </div>
        </div>

        <!-- لا توجد تحديثات -->
        <div v-else-if="updateState === 'not-available'">
          <div class="text-center">
            <q-icon name="check_circle" color="positive" size="48px" />
            <div class="q-mt-md">{{ $t('updater.updateNotAvailable') }}</div>
          </div>
        </div>
      </q-card-section>

      <!-- أزرار الإجراءات -->
      <q-card-actions align="right" class="q-pt-none">
        <q-btn
          v-if="updateState === 'available'"
          flat
          :label="$t('updater.skipVersion')"
          @click="skipVersion"
        />
        <q-btn
          v-if="updateState === 'available'"
          flat
          :label="$t('updater.installLater')"
          @click="remindLater"
        />
        <q-btn
          v-if="updateState === 'available'"
          color="primary"
          :label="$t('updater.downloadNow')"
          @click="downloadUpdate"
        />
        
        <q-btn
          v-if="updateState === 'downloaded'"
          flat
          :label="$t('updater.installLater')"
          @click="installLater"
        />
        <q-btn
          v-if="updateState === 'downloaded'"
          color="primary"
          :label="$t('updater.installNow')"
          @click="installUpdate"
        />
        
        <q-btn
          v-if="updateState === 'error'"
          flat
          :label="$t('updater.retry')"
          @click="retryUpdate"
        />
        
        <q-btn
          v-if="['not-available', 'error'].includes(updateState)"
          color="primary"
          :label="$t('common.close')"
          @click="closeDialog"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';

// أنواع البيانات
interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
}

interface ProgressInfo {
  bytesPerSecond: number;
  percent: number;
  transferred: number;
  total: number;
}

// المتغيرات التفاعلية
const { t } = useI18n();
const showDialog = ref(false);
const updateState = ref<'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'not-available'>('checking');
const updateInfo = ref<UpdateInfo | null>(null);
const downloadProgress = ref(0);
const downloadedBytes = ref(0);
const totalBytes = ref(0);
const errorMessage = ref('');

// الدوال المحسوبة
const getTitle = computed(() => {
  switch (updateState.value) {
    case 'checking': return t('updater.checking');
    case 'available': return t('updater.updateAvailable');
    case 'downloading': return t('updater.downloadProgress');
    case 'downloaded': return t('updater.updateDownloaded');
    case 'error': return t('updater.error');
    case 'not-available': return t('updater.updateNotAvailable');
    default: return t('updater.checking');
  }
});

// الدوال
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const closeDialog = () => {
  showDialog.value = false;
};

const downloadUpdate = () => {
  updateState.value = 'downloading';
  // إرسال طلب تحميل إلى العملية الرئيسية
  window.electronAPI?.downloadUpdate();
};

const installUpdate = () => {
  // إرسال طلب تثبيت إلى العملية الرئيسية
  window.electronAPI?.installUpdate();
};

const installLater = () => {
  closeDialog();
};

const skipVersion = () => {
  // حفظ الإصدار المتخطى
  localStorage.setItem('skippedVersion', updateInfo.value?.version || '');
  closeDialog();
};

const remindLater = () => {
  // تذكير لاحقاً
  const remindTime = Date.now() + (24 * 60 * 60 * 1000); // 24 ساعة
  localStorage.setItem('remindLaterTime', remindTime.toString());
  closeDialog();
};

const retryUpdate = () => {
  updateState.value = 'checking';
  window.electronAPI?.checkForUpdates();
};

// معالج أحداث التحديث
const handleUpdateEvent = (event: any) => {
  const { type, data } = event;
  
  switch (type) {
    case 'update-checking':
      updateState.value = 'checking';
      showDialog.value = true;
      break;
      
    case 'update-available':
      updateInfo.value = data;
      updateState.value = 'available';
      showDialog.value = true;
      break;
      
    case 'update-not-available':
      updateState.value = 'not-available';
      showDialog.value = true;
      break;
      
    case 'download-progress':
      const progress = data as ProgressInfo;
      downloadProgress.value = progress.percent;
      downloadedBytes.value = progress.transferred;
      totalBytes.value = progress.total;
      break;
      
    case 'update-downloaded':
      updateState.value = 'downloaded';
      break;
      
    case 'update-error':
      updateState.value = 'error';
      errorMessage.value = data;
      showDialog.value = true;
      break;
  }
};

// دورة الحياة
onMounted(() => {
  // الاستماع لأحداث التحديث
  window.electronAPI?.onUpdateEvent(handleUpdateEvent);
});

onUnmounted(() => {
  // إزالة المستمعين
  window.electronAPI?.removeUpdateListeners();
});

// تصدير الدوال للاستخدام الخارجي
defineExpose({
  checkForUpdates: () => {
    updateState.value = 'checking';
    showDialog.value = true;
    window.electronAPI?.checkForUpdates();
  }
});
</script>

<style scoped lang="scss">
.update-card {
  border-radius: 12px;
}

.release-notes {
  max-height: 200px;
  overflow-y: auto;
}
</style>
