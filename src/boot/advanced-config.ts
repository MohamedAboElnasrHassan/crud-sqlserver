import { boot } from 'quasar/wrappers';
import { Dark, LocalStorage, Notify, Loading } from 'quasar';

// Advanced Configuration Boot File
export default boot(({ app, router }) => {
  // 🎨 Theme Configuration
  const initializeTheme = () => {
    const savedTheme = LocalStorage.getItem('app-theme') as string;

    if (savedTheme) {
      if (savedTheme === 'dark') {
        Dark.set(true);
      } else if (savedTheme === 'light') {
        Dark.set(false);
      } else if (savedTheme === 'auto') {
        Dark.set('auto');
      } else if (savedTheme === 'windows-classic') {
        Dark.set(false);
        document.body.classList.add('windows-classic-theme');
      }
    } else {
      // Default to Windows Classic theme
      Dark.set(false);
      document.body.classList.add('windows-classic-theme');
      LocalStorage.set('app-theme', 'windows-classic');
    }
  };

  // 🌐 Language Configuration
  const initializeLanguage = () => {
    const savedLang = LocalStorage.getItem('app-language') as string;
    const defaultLang = 'ar'; // Arabic as default

    if (savedLang) {
      document.documentElement.lang = savedLang;
      document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
    } else {
      document.documentElement.lang = defaultLang;
      document.documentElement.dir = 'rtl';
      LocalStorage.set('app-language', defaultLang);
    }
  };

  // 🔔 Notification Configuration
  const configureNotifications = () => {
    Notify.setDefaults({
      position: 'top-right',
      timeout: 4000,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }],
      classes: 'windows-classic-notify',
    });
  };

  // ⏳ Loading Configuration
  const configureLoading = () => {
    Loading.setDefaults({
      delay: 200,
      message: 'جاري التحميل...',
      spinnerSize: 80,
      spinnerColor: 'primary',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      messageColor: 'black',
      customClass: 'windows-classic-loading',
    });
  };

  // 🎯 Performance Optimizations
  const optimizePerformance = () => {
    // Preload critical resources
    const criticalResources = ['/fonts/ms-sans-serif.woff2', '/icons/favicon.ico'];

    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.includes('font') ? 'font' : 'image';
      if (resource.includes('font')) {
        link.crossOrigin = 'anonymous';
      }
      document.head.appendChild(link);
    });

    // Enable passive event listeners for better performance
    const passiveEvents = ['touchstart', 'touchmove', 'wheel'];
    passiveEvents.forEach((event) => {
      document.addEventListener(event, () => {}, { passive: true });
    });
  };

  // 🔧 Development Tools
  const setupDevTools = () => {
    if (process.env.DEV) {
      // Add development helpers
      (window as unknown as Record<string, unknown>).__APP_VERSION__ = process.env.APP_VERSION;
      (window as unknown as Record<string, unknown>).__BUILD_DATE__ = process.env.BUILD_DATE;

      // Console styling for development
      console.log(
        '%c🚀 CRUD SQL Server App %c' + process.env.APP_VERSION,
        'background: #0054e3; color: white; padding: 2px 5px; border-radius: 3px;',
        'background: #c0c0c0; color: black; padding: 2px 5px; border-radius: 3px;',
      );
    }
  };

  // 📱 Responsive Configuration
  const configureResponsive = () => {
    // Add viewport meta tag if not exists
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    }

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 500);
    });
  };

  // 🔐 Security Configuration
  const configureSecurity = () => {
    // Disable right-click in production
    if (process.env.PROD) {
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
      });

      // Disable F12, Ctrl+Shift+I, Ctrl+U
      document.addEventListener('keydown', (e: KeyboardEvent) => {
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.key === 'u')
        ) {
          e.preventDefault();
        }
      });
    }
  };

  // 🎨 Custom CSS Properties
  const setupCSSProperties = () => {
    const root = document.documentElement;

    // Windows Classic color scheme
    root.style.setProperty('--windows-classic-bg', '#c0c0c0');
    root.style.setProperty('--windows-classic-border', '#808080');
    root.style.setProperty('--windows-classic-dark-border', '#404040');
    root.style.setProperty('--windows-classic-light-border', '#dfdfdf');
    root.style.setProperty('--windows-classic-button-face', '#c0c0c0');
    root.style.setProperty('--windows-classic-text', '#000000');
    root.style.setProperty('--windows-classic-disabled-text', '#808080');

    // Typography
    root.style.setProperty('--windows-classic-font', '"MS Sans Serif", "Tahoma", sans-serif');
    root.style.setProperty('--windows-classic-font-size', '11px');
  };

  // 🚀 Router Configuration
  const configureRouter = () => {
    // Add route guards
    router.beforeEach((to, from, next) => {
      // Show loading for route changes
      Loading.show();
      next();
    });

    router.afterEach(() => {
      // Hide loading after route change
      Loading.hide();
    });

    // Handle router errors
    router.onError((error) => {
      console.error('Router error:', error);
      Notify.create({
        type: 'negative',
        message: 'خطأ في التنقل',
        caption: error.message,
      });
    });
  };

  // 🎯 Initialize all configurations
  const initialize = () => {
    try {
      initializeTheme();
      initializeLanguage();
      configureNotifications();
      configureLoading();
      optimizePerformance();
      setupDevTools();
      configureResponsive();
      configureSecurity();
      setupCSSProperties();
      configureRouter();

      console.log('✅ Advanced configuration initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing advanced configuration:', error);
    }
  };

  // Run initialization
  initialize();

  // Export utility functions for use in components
  app.config.globalProperties.$advancedConfig = {
    setTheme: (theme: string) => {
      LocalStorage.set('app-theme', theme);

      if (theme === 'dark') {
        Dark.set(true);
        document.body.classList.remove('windows-classic-theme');
      } else if (theme === 'light') {
        Dark.set(false);
        document.body.classList.remove('windows-classic-theme');
      } else if (theme === 'auto') {
        Dark.set('auto');
        document.body.classList.remove('windows-classic-theme');
      } else if (theme === 'windows-classic') {
        Dark.set(false);
        document.body.classList.add('windows-classic-theme');
      }
    },

    setLanguage: (lang: string) => {
      LocalStorage.set('app-language', lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';

      // Reload page to apply language changes
      window.location.reload();
    },

    getTheme: () => LocalStorage.getItem('app-theme') || 'windows-classic',
    getLanguage: () => LocalStorage.getItem('app-language') || 'ar',
  };
});
