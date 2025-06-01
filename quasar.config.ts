/**
 * 🔧 Quasar Configuration File
 *
 * Configuration for CRUD SQL Server Management System
 * Built with Quasar Framework v2 + Vite + TypeScript
 *
 * @see https://v2.quasar.dev/quasar-cli-vite/quasar-config-file
 */

import { defineConfig } from '#q-app/wrappers';
import { fileURLToPath } from 'node:url';

export default defineConfig((ctx) => {
  return {
    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['i18n', 'axios', 'error-handler', 'advanced-config', 'zatca-init'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // Icon libraries
      'material-icons', // Google Material Icons
      'material-icons-outlined', // Material Icons Outlined
      'material-icons-round', // Material Icons Round
      'material-icons-sharp', // Material Icons Sharp
      // 'fontawesome-v6', // Font Awesome 6
      // 'ionicons-v4', // Ionicons v4
      // 'eva-icons', // Eva Icons
      // 'themify', // Themify Icons
      // 'line-awesome', // Line Awesome
      // 'bootstrap-icons', // Bootstrap Icons
      // 'mdi-v7', // Material Design Icons v7

      // Fonts
      'roboto-font', // Roboto font
      // 'roboto-font-latin-ext', // Extended Latin support (don't use both)
      // 'noto-sans-font', // Noto Sans font

      // Additional icon sets for Windows Classic theme
      'material-symbols-outlined',
      'material-symbols-rounded',
      'material-symbols-sharp',
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      // Build targets for different environments
      target: {
        browser: ['es2022', 'firefox115', 'chrome115', 'safari14'],
        node: 'node20',
      },

      // TypeScript configuration
      typescript: {
        strict: true, // Enable strict TypeScript checking
        vueShim: true, // Generate Vue component type shims
        extendTsConfig(tsConfig) {
          // Extend TypeScript configuration
          tsConfig.compilerOptions = {
            ...tsConfig.compilerOptions,
            experimentalDecorators: true,
            emitDecoratorMetadata: true,
            skipLibCheck: true,
            allowSyntheticDefaultImports: true,
            esModuleInterop: true,
            resolveJsonModule: true,
            isolatedModules: true,
            noEmit: true,
            jsx: 'preserve',
          };
        },
      },

      // Vue Router configuration
      vueRouterMode: 'hash', // 'hash' or 'history'
      vueRouterBase: undefined, // Base URL for router

      // Development tools
      vueDevtools: ctx.dev, // Enable Vue DevTools in development
      vueOptionsAPI: true, // Enable Vue Options API

      // Performance and optimization
      rebuildCache: false, // Rebuild cache on startup
      useFilenameHashes: true, // Add hash to filenames for caching
      polyfillModulePreload: true, // Polyfill for module preload

      // Build paths and analysis
      publicPath: '/', // Public path for assets
      analyze: false, // Bundle analyzer
      distDir: undefined, // Custom dist directory
      ignorePublicFolder: false, // Ignore public folder

      // Minification
      minify: 'esbuild', // 'terser', 'esbuild', or false
      htmlMinifyOptions: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        collapseBooleanAttributes: true,
        removeScriptTypeAttributes: true,
      },

      // Source maps
      sourcemap: ctx.dev, // Generate source maps in development

      // Environment variables
      env: {
        // Add custom environment variables
        APP_NAME: 'CRUD SQL Server',
        APP_VERSION: '1.0.0',
        BUILD_DATE: new Date().toISOString(),
        NODE_ENV: ctx.dev ? 'development' : 'production',
      },

      // Raw defines (replaced at build time)
      rawDefine: {
        __APP_VERSION__: JSON.stringify('1.0.0'),
        __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
        __DEV__: ctx.dev,
      },

      // Extend Vite configuration
      extendViteConf(viteConf) {
        // Add custom Vite configuration for better performance
        viteConf.optimizeDeps = {
          ...viteConf.optimizeDeps,
          include: ['vue', 'vue-router', 'pinia', 'vue-i18n', 'axios', 'quasar'],
        };
      },

      // Vite plugins
      vitePlugins: [
        [
          '@intlify/unplugin-vue-i18n/vite',
          {
            compositionOnly: false,
            runtimeOnly: false,
            ssr: ctx.modeName === 'ssr',
            include: [fileURLToPath(new URL('./src/i18n', import.meta.url))],
          },
        ],

        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand: 'eslint -c ./eslint.config.js "./src*/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
      ],
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
    devServer: {
      // HTTPS configuration
      https: false, // Set to true for HTTPS development

      // Server configuration
      host: 'localhost',
      port: 9000,
      open: true, // Opens browser window automatically

      // Proxy configuration for API calls
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          pathRewrite: {
            '^/api': '',
          },
        },
      },

      // Headers for development
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },

      // Watch options
      watchOptions: {
        ignored: /node_modules/,
        poll: false,
      },

      // Client overlay for errors
      client: {
        overlay: {
          errors: true,
          warnings: false,
        },
        progress: true,
        reconnect: true,
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
    framework: {
      config: {
        // Loading configuration
        loading: {
          delay: 200,
          message: 'جاري التحميل...',
          spinnerSize: 80,
          spinnerColor: 'primary',
          backgroundColor: 'white',
          messageColor: 'black',
          customClass: 'windows-classic-loading',
        },

        // Notify configuration
        notify: {
          position: 'top-right',
          timeout: 4000,
          textColor: 'white',
          actions: [{ icon: 'close', color: 'white' }],
        },

        // Dialog configuration
        dialog: {
          dark: false,
          persistent: false,
          noEscDismiss: false,
          noBackdropDismiss: false,
        },

        // Dark mode configuration
        dark: 'auto', // or true/false/'auto'

        // Brand colors (can be overridden by CSS variables)
        brand: {
          primary: '#0054e3',
          secondary: '#c0c0c0',
          accent: '#808080',
          dark: '#1d1d1d',
          'dark-page': '#121212',
          positive: '#21BA45',
          negative: '#C10015',
          info: '#31CCEC',
          warning: '#F2C037',
        },
      },

      // Icon set - choose from available icon sets
      iconSet: 'material-icons', // material-icons, fontawesome-v6, eva-icons, etc.

      // Language pack - for Quasar components
      lang: 'ar', // Arabic language pack

      // CSS Addons - enable responsive flex and spacing classes
      cssAddon: true,

      // Auto import configuration
      autoImportComponentCase: 'kebab', // 'kebab', 'pascal', 'combined'
      autoImportVueExtensions: ['vue'],
      autoImportScriptExtensions: ['js', 'jsx', 'ts', 'tsx'],

      // Development tree-shaking (keep false for performance)
      devTreeshaking: false,

      // Manually specify only actually used components
      components: [
        // Basic Components (actually used)
        'QBtn',
        'QInput',
        'QSelect',
        'QField',
        'QIcon',
        'QSpinner',
        'QLinearProgress',
        'QCircularProgress',
        'QCheckbox',
        'QRadio',
        'QToggle',

        // Navigation & Layout (actually used)
        'QMenu',
        'QList',
        'QItem',
        'QItemSection',
        'QItemLabel',
        'QSeparator',
        'QLayout',
        'QHeader',
        'QFooter',
        'QDrawer',
        'QPageContainer',
        'QPage',
        'QToolbar',
        'QToolbarTitle',
        'QSpace',

        // Content Display (actually used)
        'QCard',
        'QCardSection',
        'QCardActions',
        'QDialog',
        'QTabs',
        'QTab',
        'QTabPanels',
        'QTabPanel',
        'QTable',

        // E-Invoicing Specific Components (actually used)
        'QForm',
        'QDate',
        'QTime',
        'QFile',
        'QExpansionItem',
        'QChip',
        'QBadge',
        'QTooltip',
        'QBanner',
        'QScrollArea',
      ],

      // Manually specify directives
      directives: [
        'Ripple',
        'ClosePopup',
        'Scroll',
        'ScrollFire',
        'TouchHold',
        'TouchPan',
        'TouchSwipe',
        'TouchRepeat',
      ],

      // Quasar plugins
      plugins: [
        'Loading',
        'Notify',
        'Dialog',
        'Dark',
        'LocalStorage',
        'SessionStorage',
        'Cookies',
        'Meta',
        'AppFullscreen',
        'AppVisibility',
        'Platform',
        'Screen',
        'LoadingBar',
        'BottomSheet',
        'AddressbarColor',
      ],
    },

    // CSS Animations - choose specific animations for better performance
    // https://v2.quasar.dev/options/animations
    animations: [
      // Attention seekers
      'bounce',
      'flash',
      'pulse',
      'shake',
      'headShake',
      'swing',
      'tada',
      'wobble',
      'jello',

      // Bouncing entrances
      'bounceIn',
      'bounceInDown',
      'bounceInLeft',
      'bounceInRight',
      'bounceInUp',

      // Bouncing exits
      'bounceOut',
      'bounceOutDown',
      'bounceOutLeft',
      'bounceOutRight',
      'bounceOutUp',

      // Fading entrances
      'fadeIn',
      'fadeInDown',
      'fadeInDownBig',
      'fadeInLeft',
      'fadeInLeftBig',
      'fadeInRight',
      'fadeInRightBig',
      'fadeInUp',
      'fadeInUpBig',

      // Fading exits
      'fadeOut',
      'fadeOutDown',
      'fadeOutDownBig',
      'fadeOutLeft',
      'fadeOutLeftBig',
      'fadeOutRight',
      'fadeOutRightBig',
      'fadeOutUp',
      'fadeOutUpBig',

      // Sliding entrances
      'slideInDown',
      'slideInLeft',
      'slideInRight',
      'slideInUp',

      // Sliding exits
      'slideOutDown',
      'slideOutLeft',
      'slideOutRight',
      'slideOutUp',

      // Zoom entrances
      'zoomIn',
      'zoomInDown',
      'zoomInLeft',
      'zoomInRight',
      'zoomInUp',

      // Zoom exits
      'zoomOut',
      'zoomOutDown',
      'zoomOutLeft',
      'zoomOutRight',
      'zoomOutUp',
    ],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
    // sourceFiles: {
    //   rootComponent: 'src/App.vue',
    //   router: 'src/router/index',
    //   store: 'src/store/index',
    //   pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
    //   pwaServiceWorker: 'src-pwa/custom-service-worker',
    //   pwaManifestFile: 'src-pwa/manifest.json',
    //   electronMain: 'src-electron/electron-main',
    //   electronPreload: 'src-electron/electron-preload'
    //   bexManifestFile: 'src-bex/manifest.json
    // },

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],

      // extendPackageJson (json) {},
      // extendSSRWebserverConf (esbuildConf) {},

      // manualStoreSerialization: true,
      // manualStoreSsrContextInjection: true,
      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      pwa: false,
      // pwaOfflineHtmlFilename: 'offline.html', // do NOT use index.html as name!

      // pwaExtendGenerateSWOptions (cfg) {},
      // pwaExtendInjectManifestOptions (cfg) {}
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW', // 'GenerateSW' or 'InjectManifest'
      // swFilename: 'sw.js',
      // manifestFilename: 'manifest.json',
      // extendManifestJson (json) {},
      // useCredentialsForManifestTag: true,
      // injectPwaMetaTags: false,
      // extendPWACustomSWConf (esbuildConf) {},
      // extendGenerateSWOptions (cfg) {},
      // extendInjectManifestOptions (cfg) {}
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // Extend Electron main process configuration
      extendElectronMainConf(esbuildConf) {
        // Add external dependencies that shouldn't be bundled
        esbuildConf.external = esbuildConf.external || [];
        esbuildConf.external.push('better-sqlite3', 'mssql', 'tedious', 'node-gyp', 'electron');

        // Add build options
        esbuildConf.minify = ctx.prod;
        esbuildConf.sourcemap = ctx.dev;

        // إعدادات ترميز UTF-8 تتم في encoding-setup.ts
      },

      // Extend Electron preload configuration
      extendElectronPreloadConf(esbuildConf) {
        esbuildConf.external = esbuildConf.external || [];
        esbuildConf.minify = ctx.prod;
        esbuildConf.sourcemap = ctx.dev;
      },

      // Extend package.json for Electron
      extendPackageJson(json) {
        json.main = './electron-main.js';
        json.homepage = './';
        // Remove problematic dependencies for now
        // json.dependencies = {
        //   ...json.dependencies,
        //   'better-sqlite3': '^8.7.0',
        //   'mssql': '^9.1.1',
        //   'tedious': '^15.1.3',
        // };
      },

      // Electron preload scripts (if any) from /src-electron, WITHOUT file extension
      preloadScripts: ['electron-preload'],

      // Specify the debugging port to use for the Electron app when running in development mode
      inspectPort: 5858,

      // Bundler configuration - 'packager' or 'builder'
      // استخدم 'builder' للنشر التلقائي على GitHub
      bundler: 'builder',

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options

        // Application name
        name: 'CRUD SQL Server',

        // Application version
        // version: '1.0.0',

        // Platform to build for
        platform: 'win32', // 'win32', 'darwin', 'linux'

        // Architecture to build for
        arch: 'x64', // 'x64', 'ia32', 'arm64'

        // Application icon
        icon: 'src-electron/icons/icon',

        // Output directory
        out: 'dist/electron',

        // Overwrite existing builds
        overwrite: true,

        // Prune node_modules
        prune: true,

        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',

        // Ignore patterns for better performance
        ignore: [
          /\.git/,
          /\.vscode/,
          /\.idea/,
          /src/,
          /\.env/,
          /\.eslintrc/,
          /\.gitignore/,
          /README\.md/,
          /\.editorconfig/,
          /quasar\.config\./,
          /tsconfig\./,
          /postcss\.config\./,
          /tailwind\.config\./,
        ],

        // Windows only
        win32metadata: {
          CompanyName: 'Mohamed Software Solutions',
          FileDescription: 'CRUD SQL Server Management System - نظام إدارة قواعد البيانات',
          ProductName: 'CRUD SQL Server',
          InternalName: 'crud_sqlserver',
          OriginalFilename: 'crud-sqlserver.exe',
          FileVersion: '1.0.0',
          ProductVersion: '1.0.0',
          LegalCopyright: 'Copyright © 2024 Mohamed. All rights reserved.',
          LegalTrademarks: 'CRUD SQL Server™',
        },

        // Additional options
        asar: true, // Package app into asar archive
        asarUnpack: ['**/node_modules/better-sqlite3/**/*'], // Unpack native modules

        // Executable name
        executableName: 'crud-sqlserver',

        // Build version
        buildVersion: '1.0.0',

        // App version
        appVersion: '1.0.0',

        // Download options
        download: {
          cacheRoot: '.electron-cache',
        },
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        // Application ID
        appId: 'com.mohamed.crud-sqlserver',

        // Product information
        productName: 'CRUD SQL Server',
        copyright: 'Copyright © 2024 Mohamed Software Solutions',

        // Build directories
        directories: {
          output: 'dist/electron-builder',
          buildResources: 'build-resources',
        },

        // Files to include in the build
        files: [
          'dist/**/*',
          'node_modules/**/*',
          'package.json',
          '!**/node_modules/*/{CHANGELOG.md,README.md,README,readme.md,readme}',
          '!**/node_modules/*/{test,__tests__,tests,powered-test,example,examples}',
          '!**/node_modules/*.d.ts',
          '!**/node_modules/.bin',
          '!**/*.{iml,o,hprof,orig,pyc,pyo,rbc,swp,csproj,sln,xproj}',
          '!.editorconfig',
          '!**/._*',
          '!**/{.DS_Store,.git,.hg,.svn,CVS,RCS,SCCS,.gitignore,.gitattributes}',
          '!**/{__pycache__,thumbs.db,.flowconfig,.idea,.vs,.nyc_output}',
          '!**/{appveyor.yml,.travis.yml,circle.yml}',
          '!**/{npm-debug.log,yarn.lock,.yarn-integrity,.yarn-metadata.json}',
        ],

        // Extra resources
        extraResources: [
          {
            from: 'src-electron/icons',
            to: 'icons',
          },
        ],

        // Windows configuration
        win: {
          target: [
            {
              target: 'nsis',
              arch: ['x64', 'ia32'],
            },
            {
              target: 'portable',
              arch: ['x64'],
            },
            {
              target: 'zip',
              arch: ['x64'],
            },
          ],
          icon: 'src-electron/icons/icon.ico',
          publisherName: 'Mohamed Software Solutions',
          verifyUpdateCodeSignature: false,
          requestedExecutionLevel: 'asInvoker',
        },

        // macOS configuration
        mac: {
          target: [
            {
              target: 'dmg',
              arch: ['x64', 'arm64'],
            },
            {
              target: 'zip',
              arch: ['x64', 'arm64'],
            },
          ],
          icon: 'src-electron/icons/icon.icns',
          category: 'public.app-category.developer-tools',
          hardenedRuntime: true,
          gatekeeperAssess: false,
          entitlements: 'build-resources/entitlements.mac.plist',
          entitlementsInherit: 'build-resources/entitlements.mac.plist',
        },

        // Linux configuration
        linux: {
          target: [
            {
              target: 'AppImage',
              arch: ['x64'],
            },
            {
              target: 'deb',
              arch: ['x64'],
            },
            {
              target: 'rpm',
              arch: ['x64'],
            },
            {
              target: 'tar.gz',
              arch: ['x64'],
            },
          ],
          icon: 'src-electron/icons/icon.png',
          category: 'Development',
          synopsis: 'CRUD SQL Server Management System',
          description:
            'A comprehensive database management system for SQL Server with CRUD operations, built with Electron and Quasar Framework.',
        },

        // NSIS installer configuration (Windows)
        nsis: {
          oneClick: false,
          allowToChangeInstallationDirectory: true,
          allowElevation: true,
          createDesktopShortcut: true,
          createStartMenuShortcut: true,
          shortcutName: 'CRUD SQL Server',
          uninstallDisplayName: 'CRUD SQL Server Management System',
          license: 'LICENSE.txt',
          installerIcon: 'src-electron/icons/icon.ico',
          uninstallerIcon: 'src-electron/icons/icon.ico',
          installerHeaderIcon: 'src-electron/icons/icon.ico',
          deleteAppDataOnUninstall: false,
          runAfterFinish: true,
          menuCategory: 'Development Tools',
          include: 'build-resources/installer.nsh',
        },

        // DMG configuration (macOS)
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: 'link',
              path: '/Applications',
            },
            {
              x: 130,
              y: 150,
              type: 'file',
            },
          ],
          icon: 'src-electron/icons/icon.icns',
          iconSize: 80,
          window: {
            width: 540,
            height: 380,
          },
        },

        // Snap configuration (Linux)
        snap: {
          summary: 'CRUD SQL Server Management System',
          description:
            'A comprehensive database management system for SQL Server with CRUD operations.',
          category: 'development',
          grade: 'stable',
          confinement: 'strict',
        },

        // Auto-updater configuration
        publish: [
          {
            provider: 'github',
            owner: 'mohamed-hassan', // اسم المستخدم على GitHub
            repo: 'crud-sqlserver', // اسم المستودع
            private: false, // true إذا كان المستودع خاص
            releaseType: 'release', // 'release' أو 'draft' أو 'prerelease'
            publishAutoUpdate: true, // تفعيل النشر التلقائي
          },
          // يمكن إضافة موفرين آخرين
          // {
          //   provider: 'generic',
          //   url: 'https://your-server.com/updates/'
          // }
        ],

        // Compression
        compression: 'maximum',

        // Artifact name template
        artifactName: '${productName}-${version}-${os}-${arch}.${ext}',

        // Build metadata
        buildDependenciesFromSource: false,
        nodeGypRebuild: false,
        npmRebuild: true,
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      // extendBexScriptsConf (esbuildConf) {},
      // extendBexManifestJson (json) {},

      /**
       * The list of extra scripts (js/ts) not in your bex manifest that you want to
       * compile and use in your browser extension. Maybe dynamic use them?
       *
       * Each entry in the list should be a relative filename to /src-bex/
       *
       * @example [ 'my-script.ts', 'sub-folder/my-other-script.js' ]
       */
      extraScripts: [],
    },
  };
});
