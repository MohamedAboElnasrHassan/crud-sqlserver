<template>
  <div class="auto-updater">
    <!-- إشعار التحديث -->
    <q-banner v-if="updateStatus.visible" :class="bannerClass" :icon="bannerIcon" dense rounded>
      <template v-slot:avatar>
        <q-icon :name="bannerIcon" :color="bannerColor" />
      </template>

      <div class="row items-center">
        <div class="col">
          <div class="text-subtitle2">{{ updateStatus.title }}</div>
          <div class="text-caption">{{ updateStatus.message }}</div>

          <!-- شريط التقدم للتحميل -->
          <q-linear-progress
            v-if="updateStatus.type === 'downloading'"
            :value="downloadProgress.percent / 100"
            color="primary"
            size="8px"
            class="q-mt-sm"
          />
          <div v-if="updateStatus.type === 'downloading'" class="text-caption q-mt-xs">
            {{ Math.round(downloadProgress.percent) }}% -
            {{ formatBytes(downloadProgress.transferred) }} /
            {{ formatBytes(downloadProgress.total) }} ({{
              formatBytes(downloadProgress.bytesPerSecond)
            }}/s)
          </div>
        </div>

        <div class="col-auto q-ml-md">
          <q-btn
            v-if="updateStatus.type === 'available'"
            color="primary"
            size="sm"
            @click="downloadUpdate"
            :loading="isDownloading"
          >
            تحميل
          </q-btn>

          <q-btn
            v-if="updateStatus.type === 'downloaded'"
            color="positive"
            size="sm"
            @click="installUpdate"
          >
            إعادة التشغيل
          </q-btn>

          <q-btn flat size="sm" icon="close" @click="hideUpdate" class="q-ml-xs" />
        </div>
      </div>
    </q-banner>

    <!-- حوار تفاصيل التحديث -->
    <q-dialog v-model="showUpdateDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <q-icon name="system_update" color="primary" size="2em" class="q-mr-md" />
          <div>
            <div class="text-h6">تحديث متاح</div>
            <div class="text-subtitle2 text-grey-7">
              الإصدار {{ updateInfo?.version }} متاح للتحميل
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="updateInfo?.releaseNotes">
          <div class="text-subtitle2 q-mb-sm">ملاحظات الإصدار:</div>
          <div class="text-body2 bg-grey-1 q-pa-md rounded-borders">
            {{ updateInfo.releaseNotes }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="لاحقاً" @click="showUpdateDialog = false" />
          <q-btn
            color="primary"
            label="تحميل الآن"
            @click="downloadUpdateFromDialog"
            :loading="isDownloading"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Types
interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
  files: unknown[];
}

interface DownloadProgress {
  bytesPerSecond: number;
  percent: number;
  total: number;
  transferred: number;
}

interface UpdateStatus {
  visible: boolean;
  type: 'checking' | 'available' | 'downloading' | 'downloaded' | 'error' | 'not-available';
  title: string;
  message: string;
}

// Composables - reserved for future use

// State
const updateStatus = ref<UpdateStatus>({
  visible: false,
  type: 'checking',
  title: '',
  message: '',
});

const updateInfo = ref<UpdateInfo | null>(null);
const downloadProgress = ref<DownloadProgress>({
  bytesPerSecond: 0,
  percent: 0,
  total: 0,
  transferred: 0,
});

const showUpdateDialog = ref(false);
const isDownloading = ref(false);
const currentVersion = ref('');

// Computed
const bannerClass = computed(() => {
  const baseClass = 'q-ma-md';
  switch (updateStatus.value.type) {
    case 'available':
      return `${baseClass} bg-info text-white`;
    case 'downloading':
      return `${baseClass} bg-primary text-white`;
    case 'downloaded':
      return `${baseClass} bg-positive text-white`;
    case 'error':
      return `${baseClass} bg-negative text-white`;
    default:
      return `${baseClass} bg-grey-3`;
  }
});

const bannerIcon = computed(() => {
  switch (updateStatus.value.type) {
    case 'checking':
      return 'search';
    case 'available':
      return 'system_update';
    case 'downloading':
      return 'download';
    case 'downloaded':
      return 'check_circle';
    case 'error':
      return 'error';
    default:
      return 'info';
  }
});

const bannerColor = computed(() => {
  switch (updateStatus.value.type) {
    case 'available':
      return 'info';
    case 'downloading':
      return 'primary';
    case 'downloaded':
      return 'positive';
    case 'error':
      return 'negative';
    default:
      return 'grey';
  }
});

// Methods
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const checkForUpdates = async () => {
  if (!window.electronAPI?.updater) return;

  try {
    updateStatus.value = {
      visible: true,
      type: 'checking',
      title: 'فحص التحديثات',
      message: 'جاري البحث عن تحديثات...',
    };

    await window.electronAPI.updater.checkForUpdates();
  } catch (error) {
    console.error('خطأ في فحص التحديثات:', error);
    showError('فشل في فحص التحديثات');
  }
};

const downloadUpdate = async () => {
  if (!window.electronAPI?.updater) return;

  try {
    isDownloading.value = true;
    await window.electronAPI.updater.downloadUpdate();
  } catch (error) {
    console.error('خطأ في تحميل التحديث:', error);
    showError('فشل في تحميل التحديث');
    isDownloading.value = false;
  }
};

const downloadUpdateFromDialog = async () => {
  showUpdateDialog.value = false;
  await downloadUpdate();
};

const installUpdate = async () => {
  if (!window.electronAPI?.updater) return;

  try {
    await window.electronAPI.updater.installUpdate();
  } catch (error) {
    console.error('خطأ في تثبيت التحديث:', error);
    showError('فشل في تثبيت التحديث');
  }
};

const hideUpdate = () => {
  updateStatus.value.visible = false;
};

const showError = (message: string) => {
  updateStatus.value = {
    visible: true,
    type: 'error',
    title: 'خطأ في التحديث',
    message,
  };

  setTimeout(() => {
    updateStatus.value.visible = false;
  }, 5000);
};

const getCurrentVersion = async () => {
  if (!window.electronAPI?.updater) return;

  try {
    const result = await window.electronAPI.updater.getVersion();
    if (result.success && result.version) {
      currentVersion.value = result.version;
    }
  } catch (error) {
    console.error('خطأ في الحصول على الإصدار:', error);
  }
};

// Event handlers (commented out for now)
// const handleUpdateEvent = (event: unknown, data: { type: string; data: unknown }) => {
//   const { type, data: eventData } = data;

//   switch (type) {
//     case 'update-checking':
//       updateStatus.value = {
//         visible: true,
//         type: 'checking',
//         title: 'فحص التحديثات',
//         message: 'جاري البحث عن تحديثات...',
//       };
//       break;

//     case 'update-available':
//       updateInfo.value = eventData as UpdateInfo;
//       updateStatus.value = {
//         visible: true,
//         type: 'available',
//         title: 'تحديث متاح',
//         message: `الإصدار ${(eventData as UpdateInfo).version} متاح للتحميل`,
//       };
//       showUpdateDialog.value = true;
//       break;

//     case 'update-not-available':
//       updateStatus.value = {
//         visible: true,
//         type: 'not-available',
//         title: 'لا توجد تحديثات',
//         message: 'أنت تستخدم أحدث إصدار',
//       };
//       setTimeout(() => {
//         updateStatus.value.visible = false;
//       }, 3000);
//       break;

//     case 'download-progress':
//       downloadProgress.value = eventData as DownloadProgress;
//       updateStatus.value = {
//         visible: true,
//         type: 'downloading',
//         title: 'تحميل التحديث',
//         message: 'جاري تحميل التحديث...',
//       };
//       break;

//     case 'update-downloaded':
//       isDownloading.value = false;
//       updateStatus.value = {
//         visible: true,
//         type: 'downloaded',
//         title: 'التحديث جاهز',
//         message: 'تم تحميل التحديث. اضغط لإعادة التشغيل',
//       };
//       break;

//     case 'update-error':
//       isDownloading.value = false;
//       showError((eventData as string) || 'حدث خطأ غير معروف');
//       break;
//   }
// };

// Lifecycle (commented out for now)
// const removeEventListener: (() => void) | null = null;

// onMounted(async () => {
//   await getCurrentVersion();

//   if (window.electronAPI?.updater) {
//     removeEventListener = window.electronAPI.updater.onUpdateEvent(
//       handleUpdateEvent as (event: unknown, data: unknown) => void,
//     );
//   }
// });

// onUnmounted(() => {
//   if (removeEventListener) {
//     removeEventListener();
//   }
// });

// Expose methods
defineExpose({
  checkForUpdates,
  downloadUpdate,
  installUpdate,
  getCurrentVersion,
});
</script>

<style lang="scss" scoped>
.auto-updater {
  position: relative;
}
</style>
