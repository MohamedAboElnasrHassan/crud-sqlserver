// Vue 3 shims for TypeScript
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<object, object, any>;
  export default component;
}

// Ensure Vue composition API is available
declare module 'vue' {
  export function ref<T>(value: T): { value: T };
  export function computed<T>(getter: () => T): { value: T };
  export function onMounted(callback: () => void): void;
  export function onUnmounted(callback: () => void): void;
  export function defineExpose(exposed: Record<string, unknown>): void;
}
