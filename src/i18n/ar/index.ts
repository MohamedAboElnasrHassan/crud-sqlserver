// Arabic Language Pack
export default {
  // Application
  app: {
    name: 'نظام إدارة قاعدة البيانات',
    version: 'الإصدار 1.0.0',
    loading: 'جاري التحميل...',
    error: 'حدث خطأ',
    success: 'تم بنجاح',
    warning: 'تحذير',
    info: 'معلومات',
  },

  // Database Connection
  database: {
    connection: {
      title: 'الاتصال بالخادم',
      serverType: 'نوع الخادم:',
      serverName: 'اسم الخادم:',
      authentication: 'المصادقة:',
      username: 'اسم المستخدم:',
      password: 'كلمة المرور:',
      rememberPassword: 'تذكر كلمة المرور',
      connect: 'اتصال',
      cancel: 'إلغاء',
      options: 'خيارات >>',
      help: 'مساعدة',
      connecting: 'جاري الاتصال...',
      connectionSuccess: 'تم الاتصال بنجاح',
      connectionFailed: 'فشل في الاتصال',
      testConnection: 'اختبار الاتصال',
      refresh: 'تحديث',
    },

    types: {
      databaseEngine: 'محرك قاعدة البيانات',
      analysisServices: 'خدمات التحليل',
      reportingServices: 'خدمات التقارير',
      integrationServices: 'خدمات التكامل',
    },

    auth: {
      windowsAuth: 'مصادقة Windows',
      sqlServerAuth: 'مصادقة SQL Server',
      azureActiveDirectory: 'Azure Active Directory',
    },
  },

  // Main Application
  main: {
    title: 'لوحة التحكم الرئيسية',
    welcome: 'مرحباً بك في نظام إدارة قاعدة البيانات',
    menu: {
      dashboard: 'لوحة التحكم',
      tables: 'الجداول',
      queries: 'الاستعلامات',
      reports: 'التقارير',
      settings: 'الإعدادات',
      help: 'المساعدة',
      logout: 'تسجيل الخروج',
    },
  },

  // Settings
  settings: {
    title: 'الإعدادات',
    general: 'عام',
    appearance: 'المظهر',
    language: 'اللغة',
    theme: 'السمة',
    notifications: 'الإشعارات',
    advanced: 'متقدم',
    save: 'حفظ',
    reset: 'إعادة تعيين',
    apply: 'تطبيق',

    themes: {
      light: 'فاتح',
      dark: 'داكن',
      auto: 'تلقائي',
      windowsClassic: 'Windows كلاسيكي',
    },

    languages: {
      arabic: 'العربية',
      english: 'English',
    },
  },

  // Common UI Elements
  ui: {
    buttons: {
      ok: 'موافق',
      cancel: 'إلغاء',
      yes: 'نعم',
      no: 'لا',
      save: 'حفظ',
      delete: 'حذف',
      edit: 'تعديل',
      add: 'إضافة',
      remove: 'إزالة',
      close: 'إغلاق',
      back: 'رجوع',
      next: 'التالي',
      previous: 'السابق',
      finish: 'إنهاء',
      retry: 'إعادة المحاولة',
      refresh: 'تحديث',
      search: 'بحث',
      filter: 'تصفية',
      sort: 'ترتيب',
      export: 'تصدير',
      import: 'استيراد',
      print: 'طباعة',
    },

    messages: {
      confirmDelete: 'هل أنت متأكد من الحذف؟',
      unsavedChanges: 'لديك تغييرات غير محفوظة',
      operationSuccess: 'تمت العملية بنجاح',
      operationFailed: 'فشلت العملية',
      noDataFound: 'لا توجد بيانات',
      loading: 'جاري التحميل...',
      processing: 'جاري المعالجة...',
      pleaseWait: 'يرجى الانتظار...',
    },

    validation: {
      required: 'هذا الحقل مطلوب',
      invalidEmail: 'البريد الإلكتروني غير صحيح',
      invalidPassword: 'كلمة المرور غير صحيحة',
      passwordMismatch: 'كلمات المرور غير متطابقة',
      minLength: 'الحد الأدنى {min} أحرف',
      maxLength: 'الحد الأقصى {max} حرف',
      invalidFormat: 'التنسيق غير صحيح',
    },
  },

  // Error Messages
  errors: {
    network: 'خطأ في الشبكة',
    server: 'خطأ في الخادم',
    database: 'خطأ في قاعدة البيانات',
    authentication: 'خطأ في المصادقة',
    authorization: 'غير مخول للوصول',
    notFound: 'غير موجود',
    timeout: 'انتهت مهلة الاتصال',
    unknown: 'خطأ غير معروف',
  },

  // Date and Time
  datetime: {
    now: 'الآن',
    today: 'اليوم',
    yesterday: 'أمس',
    tomorrow: 'غداً',
    thisWeek: 'هذا الأسبوع',
    lastWeek: 'الأسبوع الماضي',
    thisMonth: 'هذا الشهر',
    lastMonth: 'الشهر الماضي',
    thisYear: 'هذا العام',
    lastYear: 'العام الماضي',
  },

  // Auto Updater
  updater: {
    checking: 'جاري البحث عن تحديثات...',
    updateAvailable: 'يتوفر تحديث جديد',
    updateNotAvailable: 'التطبيق محدث',
    downloadProgress: 'جاري تحميل التحديث...',
    updateDownloaded: 'تم تحميل التحديث',
    installNow: 'تثبيت الآن',
    installLater: 'تثبيت لاحقاً',
    downloadNow: 'تحميل الآن',
    skipVersion: 'تخطي هذا الإصدار',
    releaseNotes: 'ملاحظات الإصدار',
    error: 'خطأ في التحديث',
    retry: 'إعادة المحاولة',
    restartRequired: 'يتطلب إعادة تشغيل التطبيق لتطبيق التحديث',
    newVersionAvailable: 'إصدار جديد متاح: {version}',
    downloadComplete: 'اكتمل تحميل التحديث',
    installationReady: 'التحديث جاهز للتثبيت',
  },

  // Common
  common: {
    ok: 'موافق',
    cancel: 'إلغاء',
    close: 'إغلاق',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    add: 'إضافة',
    remove: 'إزالة',
    search: 'بحث',
    refresh: 'تحديث',
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجح',
    warning: 'تحذير',
    info: 'معلومات',
    yes: 'نعم',
    no: 'لا',
  },
};
