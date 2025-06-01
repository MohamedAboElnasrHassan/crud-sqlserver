<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title> CRUD SQL Server </q-toolbar-title>

        <div>Quasar v{{ $q.version }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> القائمة الرئيسية </q-item-label>

        <q-item clickable v-ripple to="/">
          <q-item-section avatar>
            <q-icon name="home" />
          </q-item-section>
          <q-item-section>
            <q-item-label>الصفحة الرئيسية</q-item-label>
            <q-item-label caption>إدارة قاعدة البيانات</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section avatar>
            <q-icon name="storage" />
          </q-item-section>
          <q-item-section>
            <q-item-label>قاعدة البيانات</q-item-label>
            <q-item-label caption>إدارة الجداول والبيانات</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/logs">
          <q-item-section avatar>
            <q-icon name="bug_report" />
          </q-item-section>
          <q-item-section>
            <q-item-label>سجلات التطبيق</q-item-label>
            <q-item-label caption>عرض وإدارة السجلات</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/zatca-settings">
          <q-item-section avatar>
            <q-icon name="receipt_long" />
          </q-item-section>
          <q-item-section>
            <q-item-label>إعدادات ZATCA</q-item-label>
            <q-item-label caption>منصة فاتورة</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/invoices">
          <q-item-section avatar>
            <q-icon name="description" />
          </q-item-section>
          <q-item-section>
            <q-item-label>الفواتير الإلكترونية</q-item-label>
            <q-item-label caption>إدارة الفواتير</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/settings">
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>
          <q-item-section>
            <q-item-label>الإعدادات</q-item-label>
            <q-item-label caption>إعدادات التطبيق</q-item-label>
          </q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable v-ripple @click="checkForUpdates">
          <q-item-section avatar>
            <q-icon name="system_update" />
          </q-item-section>
          <q-item-section>
            <q-item-label>فحص التحديثات</q-item-label>
            <q-item-label caption>البحث عن إصدارات جديدة</q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/updater-test">
          <q-item-section avatar>
            <q-icon name="bug_report" />
          </q-item-section>
          <q-item-section>
            <q-item-label>اختبار التحديث التلقائي</q-item-label>
            <q-item-label caption>صفحة تجربة شاملة</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <!-- مكون التحديث التلقائي -->
      <AutoUpdater ref="autoUpdaterRef" />

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AutoUpdater from 'src/components/AutoUpdater.vue';

const leftDrawerOpen = ref(false);
const autoUpdaterRef = ref<InstanceType<typeof AutoUpdater>>(null);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

function checkForUpdates() {
  if (autoUpdaterRef.value) {
    autoUpdaterRef.value.checkForUpdates();
  }
}

// فحص التحديثات عند تحميل التطبيق
// onMounted(() => {
//   // تأخير قصير للسماح بتحميل المكونات
//   setTimeout(() => {
//     if (autoUpdaterRef.value) {
//       autoUpdaterRef.value.checkForUpdates();
//     }
//   }, 2000);
// });
</script>
