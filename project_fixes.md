# حلول مشاكل المشروع

## الحل الأول: إزالة Grunt (الحل المُوصى به)

نظراً لأن المشروع يستخدم Vite كأداة بناء حديثة، لا نحتاج إلى Grunt. قم بالخطوات التالية:

### 1. تنظيف المشروع
```bash
# احذف مجلد node_modules والملفات المؤقتة
rm -rf node_modules
rm -rf package-lock.json
rm -f Gruntfile.js
```

### 2. تحديث package.json
تأكد من أن ملف `package.json` يحتوي فقط على السكربتات المطلوبة لـ Vite:

```json
{
  "name": "ai-code-processor",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^7.2.0",
    "@typescript-eslint/parser": "^7.2.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "typescript": "^5.2.2",
    "vite": "^5.2.0"
  }
}
```

### 3. إعادة التثبيت
```bash
npm install
```

## الحل الثاني: إذا كنت تريد الاحتفاظ بـ Grunt

إذا كان لديك أسباب خاصة للاحتفاظ بـ Grunt:

### 1. تثبيت Grunt محلياً
```bash
npm install grunt --save-dev
npm install grunt-cli --save-dev
```

### 2. التأكد من وجود Gruntfile.js
تأكد من وجود ملف `Gruntfile.js` في جذر المشروع.

## حل مشاكل الحزم القديمة والثغرات الأمنية

### 1. تحديث الحزم إلى أحدث الإصدارات
```bash
# تحديث ESLint إلى الإصدار 9
npm install eslint@^9.0.0 --save-dev

# تحديث باقي الحزم
npm update
```

### 2. إصلاح الثغرات الأمنية
```bash
npm audit fix
```

### 3. إذا لم تنجح الطريقة السابقة
```bash
npm audit fix --force
```

**تحذير:** استخدم `--force` بحذر لأنه قد يغير إصدارات الحزم بطريقة قد تكسر التوافق.

## إعداد ESLint الجديد للإصدار 9

إذا قمت بتحديث ESLint، ستحتاج إلى ملف إعداد جديد. احذف `eslint.config.js` القديم وأنشئ واحداً جديداً:

```javascript
// eslint.config.js
import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from '@typescript-eslint/eslint-plugin'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      '@typescript-eslint': tseslint,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
]
```

## التحقق من نجاح الإصلاحات

بعد تطبيق الحلول، تأكد من أن كل شيء يعمل:

```bash
# تشغيل التدقيق
npm run lint

# بناء المشروع
npm run build

# تشغيل خادم التطوير
npm run dev
```

## نصائح إضافية

1. **استخدم Node.js حديث**: تأكد من أن لديك Node.js الإصدار 18 أو أحدث
2. **نظف الكاش**: إذا استمرت المشاكل، امسح كاش npm:
   ```bash
   npm cache clean --force
   ```
3. **تحقق من GitHub Actions**: إذا كانت المشكلة في GitHub Actions، تأكد من أن ملف workflow يحتوي على الخطوات الصحيحة

## الخطوة التالية

بعد حل هذه المشاكل، ستكون قادراً على:
- تشغيل `npm run dev` بنجاح
- بناء المشروع باستخدام `npm run build`
- تطوير التطبيق دون مشاكل تقنية