import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Eye,
  ChevronRight,
  Loader,
  Info
} from 'lucide-react';

// A single, unified component for the entire application
const AICodeProcessor = () => {
  // Main state management
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
  const [analysisConfig, setAnalysisConfig] = useState({
    type: 'analyze',
    requirements: ''
  });

  const fileInputRef = useRef(null);

  // Initialize models and load saved settings from localStorage
  useEffect(() => {
    const defaultModels = [
      { id: 1, type: 'claude', name: 'Claude Sonnet 4', role: 'analyzer', status: 'idle', apiKey: '' },
      { id: 2, type: 'gpt4', name: 'GPT-4 Turbo', role: 'generator', status: 'idle', apiKey: '' },
      { id: 3, type: 'gemini', name: 'Gemini Pro', role: 'reviewer', status: 'idle', apiKey: '' },
      { id: 4, type: 'deepseek', name: 'DeepSeek Coder', role: 'optimizer', status: 'idle', apiKey: '' }
    ];
    
    const saved = localStorage.getItem('aiCodeProcessorConfig');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setModels(config.models || defaultModels);
        if (config.projectConfig) setProjectConfig(config.projectConfig);
        if (config.analysisConfig) setAnalysisConfig(config.analysisConfig);
      } catch (error) {
        addLog('warning', 'فشل في تحميل الإعدادات المحفوظة');
        setModels(defaultModels);
      }
    } else {
      setModels(defaultModels);
    }
  }, []);

  // Helper functions
  const addLog = useCallback((type, message) => {
    const newLog = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date().toLocaleTimeString('ar-EG')
    };
    setProcessingState(prev => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 20) // Keep last 20 logs
    }));
  }, []);

  const updateModelStatus = useCallback((modelId, status) => {
    setModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, status } : model
    ));
  }, []);

  const updateProgress = useCallback((progress) => {
    setProcessingState(prev => ({ ...prev, progress }));
  }, []);

  // The core function to call the AI model API
  const callAIModel = useCallback(async (model, prompt, context = {}) => {
    if (!model.apiKey.trim()) {
      throw new Error(`مفتاح API مفقود للنموذج ${model.name}`);
    }

    updateModelStatus(model.id, 'working');
    
    // This is a placeholder for a real API call.
    // The user should replace 'YOUR_API_ENDPOINT' and the headers/body structure
    // with their actual AI provider's details (e.g., OpenAI, Anthropic, Google AI).
    try {
      // SIMULATED API CALL - REPLACE WITH REAL ONE
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

      const simulatedResponse = `// نتيجة محاكاة من ${model.name}
// المهمة: ${model.role}
// المشروع: ${context.type || 'غير محدد'}
// اللغة: ${context.language || 'غير محدد'}

function main() {
  console.log('تم إنشاء الكود بواسطة ${model.name}');
  // Prompt: ${prompt.substring(0, 100)}...
}

main();
`;
      updateModelStatus(model.id, 'success');
      return simulatedResponse;
      
    } catch (error) {
      updateModelStatus(model.id, 'error');
      addLog('error', `خطأ في ${model.name}: ${error.message}`);
      throw error;
    }
  }, [addLog, updateModelStatus]);

  // Business logic for different operations
  const startProjectGeneration = async () => {
    if (!projectConfig.description.trim()) {
      addLog('error', 'يرجى إدخال وصف المشروع');
      return;
    }
    const activeModels = models.filter(m => m.apiKey.trim());
    if (activeModels.length === 0) {
      addLog('error', 'يرجى إعداد نموذج واحد على الأقل وتوفير مفتاح API');
      setActiveTab('settings');
      return;
    }

    setProcessingState({ isRunning: true, progress: 0, logs: [], results: [] });
    setActiveTab('monitor');
    addLog('info', `بدء إنشاء المشروع باستخدام ${activeModels.length} نماذج`);

    try {
        // Simplified processing logic
        const generator = activeModels.find(m => m.role === 'generator') || activeModels[0];
        updateProgress(25);
        const prompt = `أنشئ مشروع ${projectConfig.type} باللغة ${projectConfig.language} بناءً على الوصف التالي: ${projectConfig.description}`;
        const result = await callAIModel(generator, prompt, projectConfig);
        updateProgress(100);
        setProcessingState(prev => ({
            ...prev,
            results: [{ type: 'generated_code', content: result, model: generator.name, timestamp: new Date() }]
        }));
        addLog('success', 'تم إنشاء المشروع بنجاح!');
    } catch (error) {
        addLog('error', `خطأ في إنشاء المشروع: ${error.message}`);
    } finally {
        setProcessingState(prev => ({ ...prev, isRunning: false }));
    }
  };

  const analyzeExistingCode = async () => {
    if (uploadedFiles.length === 0) {
      addLog('error', 'يرجى رفع ملفات الكود أولاً');
      return;
    }
    const activeModels = models.filter(m => m.apiKey.trim());
    if (activeModels.length === 0) {
      addLog('error', 'يرجى إعداد نموذج واحد على الأقل وتوفير مفتاح API');
      setActiveTab('settings');
      return;
    }

    setProcessingState({ isRunning: true, progress: 0, logs: [], results: [] });
    setActiveTab('monitor');
    addLog('info', `بدء تحليل ${uploadedFiles.length} ملف`);

    try {
        const analyzer = activeModels.find(m => m.role === 'analyzer') || activeModels[0];
        const results = [];
        for (const fileData of uploadedFiles) {
            updateProgress((results.length / uploadedFiles.length) * 100);
            addLog('info', `تحليل ${fileData.file.name}...`);
            const content = await fileData.file.text();
            const prompt = `حلل الكود التالي من ملف ${fileData.file.name} بناءً على المتطلبات: ${analysisConfig.type}. المتطلبات الإضافية: ${analysisConfig.requirements}\n\n${content}`;
            const analysis = await callAIModel(analyzer, prompt, { fileName: fileData.file.name });
            results.push({ type: 'code_analysis', fileName: fileData.file.name, content: analysis, model: analyzer.name, timestamp: new Date() });
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

  const handleFileUpload = (files) => {
    const newFiles = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      status: 'uploaded'
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
    addLog('success', `تم رفع ${newFiles.length} ملف بنجاح`);
  };

  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (e) => {
    e.preventDefault();
    handleFileUpload(e.dataTransfer.files);
  };

  const saveSettings = () => {
    const config = { models, projectConfig, analysisConfig };
    localStorage.setItem('aiCodeProcessorConfig', JSON.stringify(config));
    addLog('success', 'تم حفظ الإعدادات بنجاح');
  };

  const downloadResults = () => {
    if (processingState.results.length === 0) {
      addLog('warning', 'لا توجد نتائج للتحميل');
      return;
    }
    const codeContent = processingState.results
      .map(result => `/*--- ${result.type} from ${result.model} at ${result.timestamp.toLocaleString()} ---*/\n\n${result.content}`)
      .join('\n\n');
    const blob = new Blob([codeContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai_results_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addLog('success', 'تم تحميل النتائج');
  };

  const testModels = async () => {
    addLog('info', 'بدء اختبار النماذج...');
    for (const model of models) {
        if(model.apiKey) {
            try {
                await callAIModel(model, "Test prompt");
                addLog('success', `نموذج ${model.name} يعمل.`);
            } catch (e) {
                // error logged in callAIModel
            }
        }
    }
  };

  // UI Rendering
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans" dir="rtl">
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Brain className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-2xl font-bold">نظام معالجة الأكواد بالذكاء الاصطناعي</h1>
            <p className="text-sm text-slate-400">إنشاء وتحليل الأكواد باستخدام نماذج متعددة</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        <div className="flex bg-slate-800 rounded-lg p-1 mb-4 border border-slate-700">
          {[
            { id: 'create', label: 'إنشاء مشروع', icon: Code },
            { id: 'analyze', label: 'تحليل كود', icon: Upload },
            { id: 'settings', label: 'الإعدادات', icon: Settings },
            { id: 'monitor', label: 'المراقبة', icon: Activity }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md transition-all text-sm font-medium ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tabs Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 rounded-lg p-4">
            {activeTab === 'create' && (
              <div>
                <h2 className="text-xl font-bold mb-4">إنشاء مشروع جديد</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <select value={projectConfig.type} onChange={(e) => setProjectConfig(p => ({ ...p, type: e.target.value }))} className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2">
                        <option value="web">تطبيق ويب</option>
                        <option value="mobile">تطبيق موبايل</option>
                        <option value="api">API</option>
                        <option value="script">سكريبت</option>
                    </select>
                    <select value={projectConfig.language} onChange={(e) => setProjectConfig(p => ({ ...p, language: e.target.value }))} className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2">
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                    </select>
                     <select value={projectConfig.complexity} onChange={(e) => setProjectConfig(p => ({ ...p, complexity: e.target.value }))} className="bg-slate-700 border border-slate-600 rounded-md px-3 py-2">
                        <option value="simple">بسيط</option>
                        <option value="medium">متوسط</option>
                        <option value="complex">معقد</option>
                    </select>
                  </div>
                  <textarea value={projectConfig.description} onChange={(e) => setProjectConfig(p => ({ ...p, description: e.target.value }))} placeholder="اكتب وصفاً مفصلاً للمشروع..." rows="8" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 font-mono text-sm"></textarea>
                  <button onClick={startProjectGeneration} disabled={processingState.isRunning} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:bg-slate-600">
                    <Play className="w-5 h-5"/>
                    <span>بدء إنشاء المشروع</span>
                  </button>
                </div>
              </div>
            )}
            {activeTab === 'analyze' && (
              <div>
                <h2 className="text-xl font-bold mb-4">تحليل كود موجود</h2>
                <div className="space-y-4">
                    <select value={analysisConfig.type} onChange={e => setAnalysisConfig(c => ({...c, type: e.target.value}))} className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2">
                        <option value="analyze">تحليل شامل</option>
                        <option value="fix">إصلاح الأخطاء</option>
                        <option value="optimize">تحسين الأداء</option>
                        <option value="document">توثيق الكود</option>
                    </select>
                    <textarea value={analysisConfig.requirements} onChange={e => setAnalysisConfig(c => ({...c, requirements: e.target.value}))} placeholder="متطلبات إضافية..." rows="3" className="w-full bg-slate-700 border border-slate-600 rounded-md px-3 py-2 font-mono text-sm"></textarea>
                    <div onDrop={handleDrop} onDragOver={handleDragOver} onClick={() => fileInputRef.current.click()} className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500">
                        <input type="file" ref={fileInputRef} onChange={e => handleFileUpload(e.target.files)} multiple className="hidden" />
                        <Upload className="mx-auto w-10 h-10 text-slate-400 mb-2"/>
                        <p>اسحب وأفلت الملفات هنا، أو انقر للرفع</p>
                    </div>
                    <div>{uploadedFiles.map(f => <div key={f.id} className="text-xs text-slate-300">{f.file.name}</div>)}</div>
                    <button onClick={analyzeExistingCode} disabled={processingState.isRunning || uploadedFiles.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:bg-slate-600">
                        <Zap className="w-5 h-5"/>
                        <span>بدء تحليل الكود</span>
                    </button>
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
              <div>
                <h2 className="text-xl font-bold mb-4">إعدادات النماذج</h2>
                <div className="space-y-4">
                  {models.map(model => (
                    <div key={model.id} className="bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                      <h3 className="font-bold mb-2">{model.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <input type="password" value={model.apiKey} onChange={e => setModels(m => m.map(m => m.id === model.id ? {...m, apiKey: e.target.value} : m))} placeholder="مفتاح API" className="bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-sm" />
                        <select value={model.role} onChange={e => setModels(m => m.map(m => m.id === model.id ? {...m, role: e.target.value} : m))} className="bg-slate-600 border border-slate-500 rounded-md px-3 py-2 text-sm">
                            <option value="analyzer">محلل</option>
                            <option value="generator">مولد</option>
                            <option value="reviewer">مراجع</option>
                            <option value="optimizer">محسن</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <div className="flex gap-4">
                    <button onClick={saveSettings} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                        <Save className="w-5 h-5"/>
                        <span>حفظ الإعدادات</span>
                    </button>
                     <button onClick={testModels} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2">
                        <Zap className="w-5 h-5"/>
                        <span>اختبار النماذج</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'monitor' && (
                <div>
                    <h2 className="text-xl font-bold mb-4">معاينة النتائج</h2>
                    <div className="bg-black/50 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm border border-slate-700">
                        <pre className="whitespace-pre-wrap">
                            {processingState.results.length > 0
                                ? processingState.results.map(r => r.content).join('\n\n')
                                : "// سيتم عرض الكود المُنتج هنا..."
                            }
                        </pre>
                    </div>
                </div>
            )}
          </div>

          {/* Side Panel for Monitoring */}
          <div className="md:col-span-1 bg-slate-800/50 border border-slate-700 rounded-lg p-4 flex flex-col">
            <h2 className="text-xl font-bold mb-4">المراقبة والتحكم</h2>
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">التقدم الإجمالي</label>
              <div className="w-full bg-slate-700 rounded-full h-4">
                <div className="bg-green-500 h-4 rounded-full transition-all" style={{width: `${processingState.progress}%`}}></div>
              </div>
            </div>

            <div className="mb-4">
                <h3 className="text-lg font-bold mb-2">حالة النماذج</h3>
                <div className="space-y-2">
                    {models.map(model => (
                        <div key={model.id} className="flex items-center justify-between text-sm p-2 bg-slate-700/50 rounded-md">
                            <span className="font-medium">{model.name}</span>
                            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs ${
                                {idle: 'bg-slate-500', working: 'bg-yellow-500 animate-pulse', success: 'bg-green-500', error: 'bg-red-500'}[model.status]
                            }`}>
                                {model.status === 'working' && <Loader className="w-3 h-3 animate-spin"/>}
                                {model.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex-grow flex flex-col">
              <h3 className="text-lg font-bold mb-2">سجل العمليات</h3>
              <div className="bg-black/30 rounded-lg p-2 flex-grow overflow-y-auto h-48 border border-slate-700">
                {processingState.logs.map(log => (
                  <div key={log.id} className={`flex items-start gap-2 text-xs p-1.5 rounded ${
                      {'info': 'text-blue-300', 'success': 'text-green-300', 'warning': 'text-yellow-300', 'error': 'text-red-300'}[log.type]
                  }`}>
                    <div className="w-4 h-4 mt-0.5">
                        {log.type === 'info' && <Info className="w-full h-full"/>}
                        {log.type === 'success' && <CheckCircle className="w-full h-full"/>}
                        {log.type === 'warning' && <AlertCircle className="w-full h-full"/>}
                        {log.type === 'error' && <AlertCircle className="w-full h-full"/>}
                    </div>
                    <div className="flex-1">
                        <p className="font-medium">{log.message}</p>
                        <p className="text-slate-400">{log.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
             <div className="mt-4">
                <button onClick={downloadResults} disabled={processingState.results.length === 0} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center gap-2 disabled:bg-slate-600">
                    <Download className="w-5 h-5"/>
                    <span>تحميل النتائج</span>
                </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AICodeProcessor;