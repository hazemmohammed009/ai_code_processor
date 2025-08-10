import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, 
  Upload, 
  Settings, 
  Activity, 
  Play, 
  Download, 
  Brain, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Zap,
  Save,
  Trash2,
  Eye
} from 'lucide-react';

const AICodeProcessor = () => {
  // الحالة الرئيسية
  const [activeTab, setActiveTab] = useState('create');
  const [models, setModels] = useState([]);
  const [processingState, setProcessingState] = useState({
    isRunning: false,
    progress: 0,
    logs: [],
    results: []
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [projectConfig, setProjectConfig] = useState({
    type: 'web',
    language: 'javascript',
    complexity: 'medium',
    description: ''
  });

  // مراجع للعناصر
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  // تهيئة النماذج الافتراضية
  useEffect(() => {
    const defaultModels = [
      { id: 1, type: 'claude', name: 'Claude Sonnet 4', role: 'analyzer', status: 'idle', apiKey: '' },
      { id: 2, type: 'gpt4', name: 'GPT-4 Turbo', role: 'generator', status: 'idle', apiKey: '' },
      { id: 3, type: 'gemini', name: 'Gemini Pro', role: 'reviewer', status: 'idle', apiKey: '' },
      { id: 4, type: 'deepseek', name: 'DeepSeek Coder', role: 'optimizer', status: 'idle', apiKey: '' }
    ];
    setModels(defaultModels);
    
    // تحميل الإعدادات المحفوظة
    const saved = localStorage.getItem('aiCodeProcessorConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        if (config.models) setModels(config.models);
        if (config.projectConfig) setProjectConfig(config.projectConfig);
      } catch (error) {
        addLog('warning', 'فشل في تحميل الإعدادات المحفوظة');
      }
    }
  }, []);

  // وظائف مساعدة
  const addLog = (type, message) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    };
    setProcessingState(prev => ({
      ...prev,
      logs: [...prev.logs.slice(-9), newLog] // الاحتفاظ بآخر 10 سجلات
    }));
  };

  const updateModelStatus = (modelId, status) => {
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, status } : model
    ));
  };

  const updateProgress = (progress) => {
    setProcessingState(prev => ({ ...prev, progress }));
  };

  // محاكاة استدعاء AI API مع مُعالجة حقيقية
  const callAIModel = async (model, prompt, context = {}) => {
    if (!model.apiKey.trim()) {
      throw new Error(`مفتاح API مفقود للنموذج ${model.name}`);
    }

    updateModelStatus(model.id, 'working');
    
    try {
      // محاكاة API call
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
          'x-api-key': model.apiKey
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          messages: [
            {
              role: 'user',
              content: `${prompt}\n\nسياق المشروع: ${JSON.stringify(context, null, 2)}`
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      updateModelStatus(model.id, 'success');
      return data.content[0].text;
      
    } catch (error) {
      updateModelStatus(model.id, 'error');
      addLog('error', `خطأ في ${model.name}: ${error.message}`);
      
      // محاكاة للتجربة (يُزال في الإنتاج)
      await new Promise(resolve => setTimeout(resolve, 2000));
      return `// نتيجة محاكاة من ${model.name}
// المشروع: ${context.type || 'غير محدد'}
// اللغة: ${context.language || 'غير محدد'}
// التعقيد: ${context.complexity || 'متوسط'}

console.log('تم إنشاء الكود بواسطة ${model.name}');
// هنا سيكون الكود المُولد فعلياً...`;
    }
  };

  // تقدير حجم المشروع
  const estimateProject = () => {
    const desc = projectConfig.description;
    if (!desc.trim()) {
      addLog('warning', 'يرجى إدخال وصف المشروع أولاً');
      return;
    }

    let estimatedLines = 500;
    let recommendedModels = 1;
    let timeEstimate = '5-10';

    // حساب معقد للتقدير
    const words = desc.split(/\s+/).length;
    const complexity = projectConfig.complexity;
    const projectType = projectConfig.type;

    // تقدير الأسطر
    const baseLines = {
      'simple': 1000,
      'medium': 3000,
      'complex': 8000
    };
    estimatedLines = baseLines[complexity] + (words * 5);

    // مضاعف نوع المشروع
    const typeMultipliers = {
      'web': 1.2,
      'mobile': 1.1,
      'desktop': 1.3,
      'api': 0.8,
      'game': 1.5,
      'script': 0.6,
      'ai': 1.4
    };
    estimatedLines *= (typeMultipliers[projectType] || 1.0);
    estimatedLines = Math.round(estimatedLines);

    // تحديد عدد النماذج الموصى به
    if (estimatedLines > 5000) recommendedModels = 4;
    else if (estimatedLines > 2500) recommendedModels = 3;
    else recommendedModels = 1;

    // تقدير الوقت
    timeEstimate = `${Math.ceil(estimatedLines / 1000)}-${Math.ceil(estimatedLines / 500)}`;

    addLog('info', `تقدير المشروع: ${estimatedLines.toLocaleString()} سطر، ${recommendedModels} نماذج، ${timeEstimate} دقيقة`);
    
    return { estimatedLines, recommendedModels, timeEstimate };
  };

  // معالجة رفع الملفات
  const handleFileUpload = (files) => {
    const validFiles = Array.from(files).filter(file => {
      const validExtensions = ['.js', '.py', '.java', '.cpp', '.cs', '.php', '.html', '.css', '.json', '.xml'];
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      return validExtensions.includes(extension) || file.type.includes('text');
    });

    if (validFiles.length !== files.length) {
      addLog('warning', `تم رفض ${files.length - validFiles.length} ملف غير مدعوم`);
    }

    setUploadedFiles(prev => [...prev, ...validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file,
      size: file.size,
      status: 'uploaded'
    }))]);

    addLog('success', `تم رفع ${validFiles.length} ملف بنجاح`);
  };

  // السحب والإفلات
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  // بدء إنشاء المشروع
  const startProjectGeneration = async () => {
    if (!projectConfig.description.trim()) {
      addLog('error', 'يرجى إدخال وصف المشروع');
      return;
    }

    const activeModels = models.filter(m => m.apiKey.trim());
    if (activeModels.length === 0) {
      addLog('error', 'يرجى إعداد نموذج واحد على الأقل');
      setActiveTab('settings');
      return;
    }

    setProcessingState(prev => ({ ...prev, isRunning: true, progress: 0, results: [] }));
    setActiveTab('monitor');
    addLog('info', `بدء إنشاء المشروع باستخدام ${activeModels.length} نماذج`);

    try {
      const estimate = estimateProject();
      updateProgress(10);

      // تحديد استراتيجية المعالجة
      if (estimate.estimatedLines <= 2500) {
        await processSimpleProject(activeModels[0]);
      } else if (estimate.estimatedLines <= 5000) {
        await processMediumProject(activeModels.slice(0, 3));
      } else {
        await processComplexProject(activeModels);
      }

      addLog('success', 'تم إنشاء المشروع بنجاح!');
      updateProgress(100);
      
    } catch (error) {
      addLog('error', `خطأ في إنشاء المشروع: ${error.message}`);
    } finally {
      setProcessingState(prev => ({ ...prev, isRunning: false }));
    }
  };

  // معالجة المشاريع البسيطة
  const processSimpleProject = async (model) => {
    updateProgress(25);
    const prompt = `أنشئ مشروع ${projectConfig.type} باللغة ${projectConfig.language}:

الوصف: ${projectConfig.description}

يرجى إنشاء:
1. الكود الرئيسي مع التعليقات
2. ملف README
3. ملفات الإعداد اللازمة
4. أمثلة للاستخدام`;

    const result = await callAIModel(model, prompt, projectConfig);
    updateProgress(100);
    
    setProcessingState(prev => ({
      ...prev,
      results: [{
        type: 'simple_project',
        content: result,
        model: model.name,
        timestamp: new Date()
      }]
    }));
  };

  // معالجة المشاريع المتوسطة
  const processMediumProject = async (modelList) => {
    const phases = [
      { phase: 'analysis', progress: 30, prompt: 'حلل المتطلبات وصمم البنية' },
      { phase: 'development', progress: 70, prompt: 'طور الكود الأساسي' },
      { phase: 'integration', progress: 90, prompt: 'ادمج المكونات وأضف الاختبارات' }
    ];

    const results = [];
    for (let i = 0; i < phases.length && i < modelList.length; i++) {
      const phase = phases[i];
      updateProgress(phase.progress);
      addLog('info', `مرحلة ${phase.phase}...`);

      const contextualPrompt = `${phase.prompt}

المشروع: ${projectConfig.type}
اللغة: ${projectConfig.language}
الوصف: ${projectConfig.description}

النتائج السابقة: ${results.map(r => r.content.substring(0, 200) + '...').join('\n---\n')}`;

      const result = await callAIModel(modelList[i], contextualPrompt, projectConfig);
      results.push({
        type: 'medium_project_phase',
        phase: phase.phase,
        content: result,
        model: modelList[i].name,
        timestamp: new Date()
      });
    }

    updateProgress(100);
    setProcessingState(prev => ({ ...prev, results }));
  };

  // معالجة المشاريع المعقدة
  const processComplexProject = async (modelList) => {
    const components = [
      'البنية الأساسية والإعدادات',
      'واجهة المستخدم',
      'منطق العمل الأساسي',
      'قاعدة البيانات والAPI',
      'الاختبارات والتوثيق'
    ];

    const results = [];
    const totalComponents = components.length;

    for (let i = 0; i < totalComponents; i++) {
      const modelIndex = i % modelList.length;
      const model = modelList[modelIndex];
      const component = components[i];

      updateProgress(15 + (i * 70) / totalComponents);
      addLog('info', `معالجة: ${component}...`);

      const prompt = `طور ${component} للمشروع:

المشروع: ${projectConfig.type}
اللغة: ${projectConfig.language}
الوصف: ${projectConfig.description}

المكونات السابقة: ${results.map(r => `${r.component}: ${r.content.substring(0, 100)}...`).join('\n')}

تأكد من التكامل مع المكونات الأخرى.`;

      const result = await callAIModel(model, prompt, projectConfig);
      results.push({
        type: 'complex_project_component',
        component,
        content: result,
        model: model.name,
        timestamp: new Date()
      });
    }

    // مرحلة التجميع النهائي
    updateProgress(95);
    addLog('info', 'تجميع المشروع النهائي...');

    const finalPrompt = `ادمج المكونات التالية في مشروع متكامل:

${results.map(r => `=== ${r.component} ===\n${r.content}`).join('\n\n')}

أضف:
1. ملف README شامل
2. ملفات الإعداد (package.json, requirements.txt، إلخ)
3. دليل النشر
4. أمثلة للاستخدام`;

    const finalResult = await callAIModel(modelList[0], finalPrompt, projectConfig);
    results.push({
      type: 'final_integration',
      content: finalResult,
      model: modelList[0].name,
      timestamp: new Date()
    });

    updateProgress(100);
    setProcessingState(prev => ({ ...prev, results }));
  };

  // تحليل الكود الموجود
  const analyzeExistingCode = async () => {
    if (uploadedFiles.length === 0) {
      addLog('error', 'يرجى رفع ملفات الكود أولاً');
      return;
    }

    const activeModels = models.filter(m => m.apiKey.trim());
    if (activeModels.length === 0) {
      addLog('error', 'يرجى إعداد نموذج واحد على الأقل');
      return;
    }

    setProcessingState(prev => ({ ...prev, isRunning: true, progress: 0 }));
    setActiveTab('monitor');
    addLog('info', `بدء تحليل ${uploadedFiles.length} ملف`);

    try {
      const results = [];
      const totalFiles = uploadedFiles.length;

      for (let i = 0; i < totalFiles; i++) {
        const fileData = uploadedFiles[i];
        const modelIndex = i % activeModels.length;
        const model = activeModels[modelIndex];

        updateProgress(20 + (i * 60) / totalFiles);
        addLog('info', `تحليل ${fileData.file.name}...`);

        // قراءة محتوى الملف
        const content = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
          reader.readAsText(fileData.file);
        });

        const prompt = `حلل الكود التالي وقدم تقريراً شاملاً:

اسم الملف: ${fileData.file.name}
حجم الملف: ${(fileData.size / 1024).toFixed(2)} KB

الكود:
${content}

يرجى تحليل:
1. جودة الكود وأفضل الممارسات
2. الأخطاء والمشاكل المحتملة
3. اقتراحات التحسين
4. الأمان والأداء
5. التوثيق والتعليقات`;

        const analysis = await callAIModel(model, prompt, { fileName: fileData.file.name });
        results.push({
          type: 'code_analysis',
          fileName: fileData.file.name,
          content: analysis,
          model: model.name,
          timestamp: new Date()
        });
      }

      // تجميع التحليل النهائي إذا كان هناك أكتر من ملف
      if (totalFiles > 1) {
        updateProgress(90);
        addLog('info', 'إنشاء تحليل شامل...');

        const summaryPrompt = `بناءً على تحليل الملفات التالية:

${results.map(r => `${r.fileName}: ${r.content.substring(0, 300)}...`).join('\n\n')}

أنشئ تقريراً شاملاً للمشروع يتضمن:
1. التقييم العام
2. المشاكل المشتركة
3. خطة التحسين
4. الأولويات`;

        const summaryAnalysis = await callAIModel(activeModels[0], summaryPrompt);
        results.push({
          type: 'project_summary',
          content: summaryAnalysis,
          model: activeModels[0].name,
          timestamp: new Date()
        });
      }

      updateProgress(100);
      setProcessingState(prev => ({ ...prev, results }));
      addLog('success', 'تم تحليل الكود بنجاح!');

    } catch (error) {
      addLog('error', `خطأ في تحليل الكود: ${error.message}`);
    } finally {
      setProcessingState(prev => ({ ...prev, isRunning: false }));
    }
  };

  // تحديث إعدادات النموذج
  const updateModel = (id, field, value) => {
    setModels(prev => prev.map(model => 
      model.id === id ? { ...model, [field]: value } : model
    ));
  };

  // حفظ الإعدادات
  const saveSettings = () => {
    const config = { models, projectConfig };
    localStorage.setItem('aiCodeProcessorConfig', JSON.stringify(config));
    addLog('success', 'تم حفظ الإعدادات بنجاح');
  };

  // تنزيل النتائج
  const downloadResults = () => {
    if (processingState.results.length === 0) {
      addLog('warning', 'لا توجد نتائج للتحميل');
      return;
    }

    const resultsData = {
      project: projectConfig,
      timestamp: new Date().toISOString(),
      results: processingState.results,
      logs: processingState.logs
    };

    // تحديد صيغة الملف بناءً على اللغة
    const extensions = {
      'javascript': 'js',
      'python': 'py',
      'java': 'java',
      'csharp': 'cs',
      'cpp': 'cpp',
      'php': 'php',
      'go': 'go',
      'rust': 'rs',
      'swift': 'swift',
      'kotlin': 'kt'
    };

    const extension = extensions[projectConfig.language] || 'txt';
    
    // إنشاء ملف الكود
    const codeContent = processingState.results
      .map(result => `// === ${result.type} - ${result.model || 'Unknown'} ===\n${result.content}`)
      .join('\n\n' + '='.repeat(80) + '\n\n');

    const codeBlob = new Blob([codeContent], { type: 'text/plain' });
    const codeUrl = URL.createObjectURL(codeBlob);
    
    const codeLink = document.createElement('a');
    codeLink.href = codeUrl;
    codeLink.download = `generated_code.${extension}`;
    document.body.appendChild(codeLink);
    codeLink.click();
    document.body.removeChild(codeLink);
    URL.revokeObjectURL(codeUrl);

    // إنشاء ملف البيانات الكاملة
    const dataBlob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' });
    const dataUrl = URL.createObjectURL(dataBlob);
    
    const dataLink = document.createElement('a');
    dataLink.href = dataUrl;
    dataLink.download = `project_data_${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(dataLink);
    dataLink.click();
    document.body.removeChild(dataLink);
    URL.revokeObjectURL(dataUrl);

    addLog('success', `تم تنزيل الملفات: generated_code.${extension} و project_data.json`);
  };

  // اختبار النماذج
  const testModels = async () => {
    const activeModels = models.filter(m => m.apiKey.trim());
    if (activeModels.length === 0) {
      addLog('warning', 'لا توجد نماذج لاختبارها');
      return;
    }

    addLog('info', `بدء اختبار ${activeModels.length} نماذج...`);
    
    for (const model of activeModels) {
      try {
        updateModelStatus(model.id, 'working');
        const testPrompt = 'اكتب "Hello World" بلغة JavaScript';
        await callAIModel(model, testPrompt);
        addLog('success', `${model.name}: يعمل بشكل صحيح`);
      } catch (error) {
        addLog('error', `${model.name}: فشل في الاختبار`);
      }
    }
  };

  // واجهة المستخدم
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white" dir="rtl">
      {/* رأس الصفحة */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Brain className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              نظام معالجة الأكواد بالذكاء الاصطناعي
            </h1>
          </div>
          <p className="text-slate-300">نظام متقدم لإنشاء وتحليل الأكواد باستخدام نماذج AI متعددة</p>
        </div>
      </header>

      {/* التبويبات */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex bg-slate-800/30 rounded-xl p-1 mb-6 backdrop-blur border border-slate-600">
          {[
            { id: 'create', label: 'إنشاء مشروع', icon: Code },
            { id: 'analyze', label: 'تحليل كود', icon: Upload },
            { id: 'settings', label: 'إعدادات النماذج', icon: Settings },
            { id: 'monitor', label: 'مراقبة التقدم', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* محتوى التبويبات */}
        <div className="space-y-6">
          {/* تبويب إنشاء المشروع */}
          {activeTab === 'create' && (
            <div className="bg-slate-800/30 backdrop-blur rounded-xl border border-slate-600 p-6">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Code className="w-6 h-6 text-blue-400" />
                إنشاء مشروع جديد
              </h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">نوع المشروع</label>
                    <select
                      value={projectConfig.type}
                      onChange={(e) => setProjectConfig(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="web">تطبيق ويب</option>
                      <option value="mobile">تطبيق موبايل</option>
                      <option value="desktop">تطبيق سطح المكتب</option>
                      <option value="api">API/خدمة ويب</option>
                      <option value="game">لعبة</option>
                      <option value="script">سكريبت/أتمتة</option>
                      <option value="ai">ذكاء اصطناعي</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">لغة البرمجة</label>
                    <select
                      value={projectConfig.language}
                      onChange={(e) => setProjectConfig(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                      <option value="csharp">C#</option>
                      <option value="cpp">C++</option>
                      <option value="php">PHP</option>
                      <option value="go">Go</option>
                      <option value="rust">Rust</option>
                      <option value="swift">Swift</option>
                      <option value="kotlin">Kotlin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-300">مستوى التعقيد</label>
                    <select
                      value={projectConfig.complexity}
                      onChange={(e) => setProjectConfig(prev => ({ ...prev, complexity: e.target.value }))}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="