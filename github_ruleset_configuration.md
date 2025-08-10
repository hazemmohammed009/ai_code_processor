# ⚙️ تكوين GitHub Repository Ruleset للمشروع

## 🔍 فهم المشكلة
المشروع موجود على GitHub وتحتاج لتكوين **Repository Ruleset** لحماية الفرع الرئيسي وضمان جودة الكود.

## 🎯 التكوين الموصى به للمشروع

### 1️⃣ **Ruleset Name**
```
AI Code Processor - Main Protection
```

### 2️⃣ **Enforcement Status**
- ✅ **Active** (مفعل)
- لا تختر "Evaluate" إلا للاختبار

### 3️⃣ **Target Branches**
```
Include by name: main
```
أو إذا كان الفرع الرئيسي `master`:
```
Include by name: master
```

### 4️⃣ **Branch Rules (الموصى بها)**

#### ✅ **القواعد المطلوبة:**
- **Restrict deletions** ✅
  - `Only allow users with bypass permission to delete matching refs`
- **Block force pushes** ✅
  - `Prevent users with push access from force pushing to refs`
- **Require a pull request before merging** ✅
  - `Require all commits be made to a non-target branch`
  - **Settings:**
    - Required approving reviews: `1`
    - Dismiss stale reviews: ✅
    - Require review from code owners: ✅ (إذا كان لديك CODEOWNERS file)

#### ✅ **القواعد المفيدة (اختيارية):**
- **Require status checks to pass** ✅
  - إذا كان لديك GitHub Actions workflows
  - Status checks: `build`, `lint`, `type-check`
- **Require signed commits** ⚠️
  - فقط إذا كنت تستخدم GPG signing
- **Require linear history** ⚠️
  - يمنع merge commits (اختياري)

#### ❌ **القواعد غير الضرورية للمشروع الحالي:**
- **Restrict creations** - غير ضروري
- **Restrict updates** - قد يعطل العمل
- **Require deployments to succeed** - فقط للمشاريع مع deployment environments
- **Require code scanning results** - فقط للمشاريع الحساسة

## 🔧 **الخطوات التفصيلية للتكوين**

### الخطوة 1: Basic Settings
```
Ruleset Name: AI Code Processor - Main Protection
Enforcement Status: Active
```

### الخطوة 2: Target Branches
```
Branch targeting criteria: Include by name
Branch name: main (أو master)
```

### الخطوة 3: Essential Rules
```
✅ Restrict deletions
✅ Block force pushes  
✅ Require a pull request before merging
   └─ Required approving reviews: 1
   └─ Dismiss stale reviews when new commits are pushed
```

### الخطوة 4: CI/CD Integration (إذا كان لديك GitHub Actions)
```
✅ Require status checks to pass
   └─ Status checks required:
       - build (18.x) 
       - build (20.x)
       - build (22.x)
       - lint
       - type-check
```

## 📁 **إنشاء GitHub Actions Workflow**

أولاً، أنشئ الملف `.github/workflows/ci.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  lint:
    name: ESLint Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  type-check:
    name: TypeScript Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check

  build:
    name: Build
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        if: matrix.node-version == '20.x'
        with:
          name: build-artifacts
          path: dist/
```

## 🔐 **إنشاء CODEOWNERS file (اختياري)**

أنشئ الملف `.github/CODEOWNERS`:

```
# Global code owners
* @your-username

# Frontend specific
/src/ @your-username
/public/ @your-username

# Configuration files  
package.json @your-username
vite.config.ts @your-username
tsconfig.json @your-username
.eslintrc.cjs @your-username

# GitHub workflows
/.github/ @your-username
```

## 🚀 **سير العمل الموصى به**

### للتطوير اليومي:
```bash
# 1. إنشاء فرع جديد
git checkout -b feature/new-feature

# 2. العمل والتطوير
# ... coding ...

# 3. اختبار محلي
npm run lint
npm run type-check  
npm run build

# 4. commit ودفع
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature

# 5. إنشاء Pull Request على GitHub
# 6. انتظار مراجعة الكود و CI checks
# 7. دمج PR بعد الموافقة
```

## ⚠️ **تحذيرات مهمة**

### 1. لا تفعل هذه القواعد إذا كنت تعمل لوحدك:
- **Require a pull request before merging** - ستحتاج PR لكل تغيير
- **Required approving reviews** - ستحتاج موافقة من شخص آخر

### 2. للعمل الفردي، استخدم:
```
✅ Restrict deletions
✅ Block force pushes
❌ Require a pull request before merging
❌ Required approving reviews
```

### 3. للفرق، استخدم التكوين الكامل أعلاه

## 🔧 **إعدادات بديلة للعمل الفردي**

### Basic Protection (للعمل لوحدك):
```
Ruleset Name: Basic Protection
Target: main branch
Rules:
  ✅ Restrict deletions
  ✅ Block force pushes
  ✅ Require status checks to pass (CI only)
```

### Team Protection (للفرق):
```  
Ruleset Name: Team Protection
Target: main branch  
Rules:
  ✅ Restrict deletions
  ✅ Block force pushes
  ✅ Require a pull request before merging
  ✅ Required approving reviews: 1
  ✅ Require status checks to pass
```

## 📊 **مراقبة الحالة**

بعد التكوين، ستظهر في:
- **Repository → Settings → Rules**
- **Repository → Insights → Network** (للـ branch protection)
- **Actions tab** (للـ CI/CD status)

## ✅ **التحقق من النجاح**

1. **Ruleset يظهر "Active"**
2. **Target branches يظهر "Applies to X targets"**  
3. **GitHub Actions تعمل عند push/PR**
4. **لا يمكن push مباشرة للـ main branch** (إذا فعلت PR requirement)

## 🎯 **الخطوة التالية**

بعد تكوين الـ Ruleset:
1. أنشئ الـ GitHub Actions workflow
2. اختبر بإنشاء branch جديد
3. اختبر CI/CD pipeline
4. تأكد من عمل جميع القواعد

هل تريد تكوين **Basic Protection** (للعمل لوحدك) أم **Team Protection** (للعمل مع فريق)؟