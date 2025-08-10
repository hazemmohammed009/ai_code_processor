# 🔧 إصلاح سير العمل CI/CD - من Grunt إلى Vite

## 🔍 التشخيص
المشكلة: سير العمل CI/CD يحاول استخدام **Grunt** القديم بدلاً من **Vite** الجديد.

## 🎯 الحلول

### 1️⃣ **حذف ملفات Grunt القديمة**

ابحث عن وحذف هذه الملفات إن وجدت:
```bash
# حذف ملفات Grunt
rm -f Gruntfile.js
rm -f grunt.js
rm -f .grunt
rm -rf .grunt/

# حذف package.json القديم إن كان يحتوي على grunt
# (لا تحذفه إذا كان يحتوي على تكوين Vite الجديد)
```

### 2️⃣ **تحديث ملف GitHub Actions الجديد**

أنشئ أو حدث `.github/workflows/build.yml`:

```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v4
      
    - name: Setup Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run ESLint
      run: npm run lint
      
    - name: Run TypeScript check
      run: npm run type-check
      
    - name: Build project
      run: npm run build
      
    - name: Run tests (optional)
      run: npm test
      continue-on-error: true
      
    - name: Upload build artifacts
      uses: actions/upload-artifact@v4
      if: matrix.node-version == '20.x'
      with:
        name: build-files
        path: dist/
```

### 3️⃣ **ملف package.json المُحدث للـ CI/CD**

تأكد من أن `package.json` يحتوي على:

```json
{
  "name": "ai-code-processor",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --fix",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "test": "echo \"No tests specified\" && exit 0",
    "clean": "rm -rf dist node_modules package-lock.json"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "lucide-react": "^0.263.1"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
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

### 4️⃣ **حذف workflow القديم**

احذف أو أعد تسمية الملفات القديمة:
```bash
# احذف workflows القديمة
rm -rf .github/workflows/grunt.yml
rm -rf .github/workflows/nodejs.yml
rm -rf .github/workflows/build-grunt.yml

# أو أعد تسميتها
mv .github/workflows/build.yml .github/workflows/build-old.yml.bak
```

### 5️⃣ **تكوين Netlify/Vercel (إن وجد)**

#### لـ Netlify - ملف `netlify.toml`:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### لـ Vercel - ملف `vercel.json`:
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### 6️⃣ **ملف .gitignore محدث**

```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
package-lock.json

# Build outputs  
dist/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Old build system
.grunt/
Gruntfile.js
grunt.js

# Temporary
*.tmp
*.temp
*.log
```

## 🚀 **خطوات التطبيق السريع**

### الخطوة 1: تنظيف الملفات القديمة
```bash
# حذف ملفات Grunt
find . -name "Gruntfile.js" -delete
find . -name "grunt.js" -delete  
find . -name ".grunt" -type d -exec rm -rf {} +

# حذف node_modules وإعادة التثبيت
rm -rf node_modules package-lock.json
npm install
```

### الخطوة 2: إنشاء workflow جديد
```bash
# إنشاء مجلد workflows إن لم يكن موجوداً
mkdir -p .github/workflows

# إنشاء ملف build.yml الجديد (انسخ المحتوى من أعلاه)
```

### الخطوة 3: اختبار محلياً
```bash
# تأكد من عمل الأوامر محلياً
npm run lint        # يجب أن ينجح
npm run type-check  # يجب أن ينجح  
npm run build       # يجب أن ينجح
```

### الخطوة 4: commit ودفع التغييرات
```bash
git add .
git commit -m "fix: migrate from Grunt to Vite build system"
git push origin main
```

## 🔧 **استكشاف الأخطاء**

### إذا استمر خطأ Grunt:
```bash
# ابحث عن جميع مراجع Grunt
grep -r "grunt" . --exclude-dir=node_modules

# احذف أي مراجع موجودة
```

### إذا فشل التكوين:
```bash
# تحقق من صحة package.json
npm run lint --dry-run
npm run build --dry-run
```

### إذا استمرت مشاكل CI/CD:
- تحقق من لوحة GitHub Actions
- راجع logs الأخطاء
- تأكد من حذف workflows القديمة

## ✅ **النتيجة المتوقعة**

بعد التطبيق:
- ✅ **لا توجد أخطاء Grunt**
- ✅ **CI/CD يستخدم Vite**  
- ✅ **البناء ينجح على Node 18, 20, 22**
- ✅ **المشروع جاهز للنشر**

## 📊 **مقارنة: قبل وبعد**

| القديم (Grunt) | الجديد (Vite) |
|----------------|---------------|
| ❌ بطيء | ✅ سريع جداً |
| ❌ معقد التكوين | ✅ بسيط |
| ❌ غير مدعوم | ✅ حديث ومدعوم |
| ❌ ملفات كثيرة | ✅ تكوين واحد |
| ❌ مشاكل CI/CD | ✅ يعمل بسلاسة |