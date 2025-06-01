/**
 * إعداد ترميز UTF-8 للـ Electron في Windows
 *
 * هذا الملف يحل مشكلة عرض النصوص العربية في console
 * بناءً على الوثائق الرسمية لـ Electron وNode.js
 */

import { spawn } from 'child_process';

/**
 * إعداد ترميز UTF-8 للـ console في Windows
 */
export function setupUTF8Encoding(): void {
  // التحقق من نظام التشغيل
  if (process.platform !== 'win32') {
    return; // هذا الإعداد خاص بـ Windows فقط
  }

  try {
    // 1. تعيين ترميز UTF-8 للـ stdout و stderr
    if (process.stdout && typeof process.stdout.setEncoding === 'function') {
      process.stdout.setEncoding('utf8');
    }

    if (process.stderr && typeof process.stderr.setEncoding === 'function') {
      process.stderr.setEncoding('utf8');
    }

    // 2. تعيين متغيرات البيئة للترميز
    process.env.LANG = 'en_US.UTF-8';
    process.env.LC_ALL = 'en_US.UTF-8';
    process.env.PYTHONIOENCODING = 'utf-8';
    process.env.NODE_OPTIONS = '--input-type=module --experimental-modules';

    // 3. تشغيل أمر chcp لتعيين code page إلى UTF-8
    setWindowsCodePage();

    console.log('✅ تم إعداد ترميز UTF-8 بنجاح');
  } catch (error) {
    console.error('❌ فشل في إعداد ترميز UTF-8:', error);
  }
}

/**
 * تعيين code page في Windows إلى UTF-8
 */
function setWindowsCodePage(): void {
  try {
    // تشغيل أمر chcp 65001 لتعيين UTF-8
    const chcp = spawn('chcp', ['65001'], {
      stdio: 'ignore',
      shell: true,
      windowsHide: true,
    });

    chcp.on('error', () => {
      // تجاهل الأخطاء - قد لا يكون chcp متوفراً
    });

    chcp.on('close', (code) => {
      if (code === 0) {
        console.log('✅ تم تعيين Windows Code Page إلى UTF-8');
      }
    });
  } catch {
    // تجاهل الأخطاء
  }
}

/**
 * إعداد console.log ليدعم UTF-8 بشكل أفضل
 */
export function setupConsoleUTF8(): void {
  // حفظ الوظائف الأصلية
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  // إعادة تعريف console.log لدعم UTF-8
  console.log = (...args: unknown[]) => {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    try {
      // محاولة كتابة النص بترميز UTF-8
      if (process.stdout && process.stdout.write) {
        process.stdout.write(message + '\n', 'utf8');
      } else {
        originalLog(...args);
      }
    } catch {
      // في حالة الفشل، استخدم الطريقة الأصلية
      originalLog(...args);
    }
  };

  // إعادة تعريف console.error
  console.error = (...args: unknown[]) => {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    try {
      if (process.stderr && process.stderr.write) {
        process.stderr.write('ERROR: ' + message + '\n', 'utf8');
      } else {
        originalError(...args);
      }
    } catch {
      originalError(...args);
    }
  };

  // إعادة تعريف console.warn
  console.warn = (...args: unknown[]) => {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    try {
      if (process.stderr && process.stderr.write) {
        process.stderr.write('WARN: ' + message + '\n', 'utf8');
      } else {
        originalWarn(...args);
      }
    } catch {
      originalWarn(...args);
    }
  };

  // إعادة تعريف console.info
  console.info = (...args: unknown[]) => {
    const message = args
      .map((arg) => (typeof arg === 'string' ? arg : JSON.stringify(arg)))
      .join(' ');

    try {
      if (process.stdout && process.stdout.write) {
        process.stdout.write('INFO: ' + message + '\n', 'utf8');
      } else {
        originalInfo(...args);
      }
    } catch {
      originalInfo(...args);
    }
  };

  console.log('✅ تم إعداد console لدعم UTF-8');
}

/**
 * اختبار عرض النصوص العربية
 */
export function testArabicDisplay(): void {
  console.log('🧪 اختبار عرض النصوص العربية:');
  console.log('مرحباً بك في تطبيق إدارة قواعد البيانات');
  console.log('نظام الفواتير الإلكترونية المتوافق مع ZATCA');
  console.log('تم تحميل التطبيق بنجاح ✅');
  console.info('معلومات: النظام يعمل بشكل صحيح');
  console.warn('تحذير: هذا مجرد اختبار');
  console.error('خطأ تجريبي: لا تقلق، هذا مجرد اختبار');
}
