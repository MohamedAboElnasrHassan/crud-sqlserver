import { boot } from 'quasar/wrappers';
import { setupGlobalErrorHandler } from 'src/utils/logger.js';

export default boot(({ app }) => {
  // إعداد معالج الأخطاء العام
  setupGlobalErrorHandler(app);
});
