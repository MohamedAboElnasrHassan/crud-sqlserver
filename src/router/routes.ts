import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  // مسار Splash منفصل بدون Layout
  {
    path: '/splash',
    component: () => import('pages/SplashPage.vue'),
  },

  // مسار اختبار الاتصال منفصل بدون Layout
  {
    path: '/connection',
    component: () => import('pages/DatabaseConnectionPage.vue'),
  },

  // مسار قاعدة البيانات منفصل بدون Layout
  {
    path: '/database',
    component: () => import('pages/DatabasePage.vue'),
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      { path: '/logs', component: () => import('pages/LogsPage.vue') },
      { path: '/settings', component: () => import('pages/SettingsPage.vue') },
      { path: '/zatca-settings', component: () => import('pages/ZATCASettingsPage.vue') },
      { path: '/invoices', component: () => import('pages/InvoicesPage.vue') },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
