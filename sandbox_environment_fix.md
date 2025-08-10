# حل مشاكل بيئة Sandbox - التعامل مع npm dependencies

## فهم المشكلة

بيئة Sandbox تتجاهل الحزم المحلية، مما يسبب فشل أوامر lint وbuild رغم صحة التكوين.

## الحل السريع الأول: استخدام npx بشكل مباشر

### تشغيل ESLint مباشرة
```bash
# بدلاً من npm run lint، استخدم:
npx eslint . --report-unused-disable-directives --max-warnings 0

# للإصلاح التلقائي:
npx eslint . --fix

# لملف محدد:
npx eslint src/main.tsx
```

### تشغيل TypeScript مباشرة
```bash
# بدلاً من npm run build، استخدم:
npx tsc
npx vite build

# للتطوير:
npx vite dev
```

## الحل الثاني: تحديث scripts في package.json

```json
{
  "scripts": {
    "dev": "npx vite",
    "build": "npx tsc && npx vite build",
    "lint": "npx eslint . --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "npx eslint . --fix",
    "preview": "npx vite preview",
    "type-check": "npx tsc --noEmit"
  }
}
```

## الحل الثالث: إعادة تعيين بيئة npm

### خطوة 1: تنظيف كامل
```bash
# حذف جميع الملفات المؤقتة
rm -rf node_modules
rm -f package-lock.json
rm -rf .npm

# تنظيف npm cache
npm cache clean --force
```

### خطوة 2: إعادة تثبيت بطريقة مختلفة
```bash
# تثبيت بـ --no-optional و --no-shrinkwrap
npm install --no-optional --no-shrinkwrap

# أو استخدام yarn بدلاً من npm
npm install -g yarn
yarn install
```

### خطوة 3: إعداد PATH للـ sandbox
```bash
# إضافة node_modules/.bin للـ PATH
export PATH="./node_modules/.bin:$PATH"

# أو في Windows:
set PATH=.\node_modules\.bin;%PATH%
```

## الحل الرابع: تكوين بديل للـ ESLint

إنشاء ملف `lint.js` مخصص:

```javascript
// lint.js
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// تحقق من وجود ESLint
const eslintPath = path.join(__dirname, 'node_modules', '.bin', 'eslint');
const eslintExists = fs.existsSync(eslintPath);

if (!eslintExists) {
  console.log('ESLint not found in node_modules, installing...');
  execSync('npm install eslint --save-dev', { stdio: 'inherit' });
}

try {
  // تشغيل ESLint
  execSync(`node ${eslintPath} . --report-unused-disable-directives --max-warnings 0`, {
    stdio: 'inherit'
  });
  console.log('✅ ESLint passed!');
} catch (error) {
  console.error('❌ ESLint failed:', error.message);
  process.exit(1);
}
```

ثم في package.json:
```json
{
  "scripts": {
    "lint": "node lint.js"
  }
}
```

## الحل الخامس: استخدام Docker للتطوير

إنشاء `Dockerfile.dev`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# نسخ package files
COPY package*.json ./

# تثبيت الحزم
RUN npm ci

# نسخ باقي الملفات
COPY . .

# تعيين PATH
ENV PATH /app/node_modules/.bin:$PATH

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

و `docker-compose.dev.yml`:
```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
```

## الحل السادس: تكوين VS Code للـ Sandbox

إنشاء `.vscode/settings.json`:

```json
{
  "eslint.workingDirectories": ["."],
  "eslint.nodePath": "./node_modules",
  "typescript.preferences.includePackageJsonAutoImports": "on",
  "typescript.suggest.autoImports": true,
  "terminal.integrated.env.linux": {
    "PATH": "${workspaceFolder}/node_modules/.bin:${env:PATH}"
  },
  "terminal.integrated.env.osx": {
    "PATH": "${workspaceFolder}/node_modules/.bin:${env:PATH}"
  },
  "terminal.integrated.env.windows": {
    "PATH": "${workspaceFolder}/node_modules/.bin;${env:PATH}"
  }
}
```

## الحل السابع: إنشاء wrapper scripts

إنشاء ملف `scripts/run-lint.sh`:

```bash
#!/bin/bash

# تحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# تشغيل ESLint
if [ -f "node_modules/.bin/eslint" ]; then
    ./node_modules/.bin/eslint . --report-unused-disable-directives --max-warnings 0
else
    echo "ESLint not found, installing..."
    npm install eslint --save-dev
    ./node_modules/.bin/eslint . --report-unused-disable-directives --max-warnings 0
fi
```

إعطاء الصلاحيات:
```bash
chmod +x scripts/run-lint.sh
```

استخدامه في package.json:
```json
{
  "scripts": {
    "lint": "./scripts/run-lint.sh"
  }
}
```

## الحل الثامن: استخدام Global ESLint

```bash
# تثبيت ESLint عالمياً
npm install -g eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react-hooks eslint-plugin-react-refresh

# إنشاء ملف تكوين عالمي
echo 'module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": ["warn", { allowConstantExport: true }]
  }
};' > .eslintrc.js

# تشغيل ESLint عالمياً
eslint . --report-unused-disable-directives --max-warnings 0
```

## الحل الموصى به للـ Sandbox

للحصول على أفضل النتائج في بيئة sandbox:

### 1. استخدم npx مباشرة:
```bash
npx eslint . --report-unused-disable-directives --max-warnings 0
npx tsc --noEmit
npx vite build
```

### 2. إنشاء alias في الـ terminal:
```bash
# إضافة للـ .bashrc أو .zshrc
alias lint='npx eslint . --report-unused-disable-directives --max-warnings 0'
alias build='npx tsc && npx vite build'
alias dev='npx vite'
```

### 3. استخدام Makefile:
```makefile
# Makefile
.PHONY: install lint build dev

install:
	npm install

lint:
	npx eslint . --report-unused-disable-directives --max-warnings 0

build:
	npx tsc && npx vite build

dev:
	npx vite

clean:
	rm -rf node_modules package-lock.json
	npm cache clean --force
```

## التحقق من النجاح

```bash
# تحقق من تثبيت الحزم
npm ls | grep eslint
npm ls | grep typescript
npm ls | grep vite

# اختبار الأوامر
npx eslint --version
npx tsc --version
npx vite --version

# اختبار التشغيل
npx eslint src/ --format=table
npx tsc --listFiles | head -5
```

## نصائح إضافية للـ Sandbox

1. **استخدم npx دائماً** بدلاً من الاعتماد على npm scripts
2. **تجنب Global installations** في البيئات المشتركة  
3. **استخدم Docker** للبيئات المعقدة
4. **احتفظ بـ backup** من node_modules الذي يعمل
5. **استخدم .nvmrc** لتثبيت إصدار Node.js
6. **تحقق من permissions** للمجلدات والملفات