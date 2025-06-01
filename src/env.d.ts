declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>;
  export default component;
}

// إضافة تصريح للـ logger في Vue Global Properties
declare module '@vue/runtime-core' {
  import type { Logger } from 'src/utils/logger';
  interface ComponentCustomProperties {
    $logger: Logger;
  }
}
