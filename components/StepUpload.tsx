
import React, { useState, useEffect } from 'react';
import { Upload, FileText, ArrowRight, CheckCircle, RefreshCw, X, AlertCircle, Info, UserCircle } from 'lucide-react';

interface StepUploadProps {
  currentResume: string; // The active resume from App state (could be custom or empty)
  masterResume: string;  // The profile's master resume
  initialJd: string;
  onNext: (resume: string, jd: string) => void;
  onNavigateToProfile: () => void;
}

export const StepUpload: React.FC<StepUploadProps> = ({ currentResume, masterResume, initialJd, onNext, onNavigateToProfile }) => {
  // Initialize content: Prefer current active resume (if set), otherwise fallback to master
  const [resumeContent, setResumeContent] = useState<string>(currentResume || masterResume);
  const [jdContent, setJdContent] = useState<string>(initialJd);
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  // Sync with props if they change externally (and no local file overrides)
  useEffect(() => {
    if (!fileName) {
      setResumeContent(currentResume || masterResume);
    }
  }, [currentResume, masterResume, fileName]);

  useEffect(() => {
    setJdContent(initialJd);
  }, [initialJd]);

  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setResumeContent(text);
      }
    };
    reader.readAsText(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const clearFile = () => {
    setFileName('');
    setResumeContent(masterResume); // Revert to master resume if available
  };

  // Determine State
  const hasMaster = masterResume.length > 50;
  const isLocalUpload = !!fileName;
  const isPersistedCustom = !isLocalUpload && resumeContent.length > 50 && resumeContent !== masterResume;
  const isUsingMaster = !isLocalUpload && !isPersistedCustom && hasMaster;
  
  const isReady = resumeContent.length > 50 && jdContent.length > 50;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Instructions */}
      <div className="text-center space-y-6">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Let's get you hired.</h2>
        
        {/* Concise Guide */}
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-left max-w-2xl mx-auto relative overflow-hidden transition-colors">
          <div className="absolute top-0 left-0 w-1 h-full bg-brand-500"></div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-500" /> How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-600 dark:text-slate-400">
             <div className="flex items-start gap-2.5">
               <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</div>
               <p className="leading-snug">Upload a resume below <span className="text-slate-400 dark:text-slate-500">OR</span> use your Master Resume.</p>
             </div>
             <div className="flex items-start gap-2.5">
               <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</div>
               <p className="leading-snug">Paste the Job Description you want to apply for.</p>
             </div>
             <div className="flex items-start gap-2.5">
               <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</div>
               <p className="leading-snug">Get a tailored resume & cover letter instantly.</p>
             </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 border border-slate-200 dark:border-slate-700 space-y-8 transition-colors">
        
        {/* Resume Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-end border-b border-slate-100 dark:border-slate-700 pb-2">
             <label className="block text-lg font-bold text-slate-800 dark:text-slate-100">1. Your Resume</label>
          </div>
          
          <div className="space-y-3">
             {/* Master Resume Tip for new users */}
             {!hasMaster && !isLocalUpload && !isPersistedCustom && (
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  <div className="bg-white dark:bg-slate-800 p-1 rounded shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
                    <UserCircle className="w-3.5 h-3.5 text-brand-500" />
                  </div>
                  <span className="leading-relaxed">
                    <strong>Tip:</strong> Upload a resume here for a one-time use, or save a 
                    <button onClick={onNavigateToProfile} className="text-brand-600 dark:text-brand-400 hover:underline font-medium mx-1">Master Resume</button> 
                    in your profile to auto-load it next time.
                  </span>
                </div>
             )}

            {/* STATE: MASTER RESUME ACTIVE */}
            {isUsingMaster ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">Using Master Resume</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{resumeContent.length} characters • From Profile</p>
                  </div>
                </div>
                <label htmlFor="file-upload-replace" className="cursor-pointer text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
                  Upload Different File
                  <input id="file-upload-replace" type="file" className="sr-only" accept=".md,.txt" onChange={handleFileUpload} />
                </label>
              </div>
            ) : 
            
            /* STATE: LOCAL FILE UPLOADED */
            isLocalUpload ? (
               <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 dark:bg-emerald-900/50 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100">{fileName}</p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Uploaded successfully</p>
                  </div>
                </div>
                <button onClick={clearFile} className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg transition-colors" title="Remove file">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : 
            
            /* STATE: PREVIOUSLY UPLOADED / CUSTOM RESUME (Persisted) */
            isPersistedCustom ? (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-200">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Custom Resume Loaded</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{resumeContent.length} characters • <span className="italic">Different from Master</span></p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <label htmlFor="file-upload-replace-custom" className="cursor-pointer text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-700 px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                    Replace
                    <input id="file-upload-replace-custom" type="file" className="sr-only" accept=".md,.txt" onChange={handleFileUpload} />
                  </label>
                   <button onClick={clearFile} className="p-1.5 text-blue-400 dark:text-blue-300 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors" title="Revert to Master">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) :

            /* STATE: EMPTY / UPLOAD PROMPT */
            (
              <label 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                htmlFor="file-upload"
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-all bg-slate-50 dark:bg-slate-900 group cursor-pointer relative
                  ${isDragging ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500'}
                `}
              >
                <div className="space-y-1 text-center pointer-events-none">
                  <Upload className={`mx-auto h-12 w-12 transition-colors ${isDragging ? 'text-brand-600' : 'text-slate-400 dark:text-slate-500 group-hover:text-brand-500'}`} />
                  <div className="flex text-sm text-slate-600 dark:text-slate-400 justify-center">
                    <span className="relative rounded-md font-medium text-brand-600 dark:text-brand-400 hover:text-brand-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-500 pointer-events-auto">
                      <span>Upload Markdown Resume</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Drag & drop or click to select (.md or .txt)</p>
                </div>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".md,.txt" onChange={handleFileUpload} />
              </label>
            )}
          </div>
        </div>

        {/* Job Description Section */}
        <div className="space-y-4">
          <label className="block text-lg font-bold text-slate-800 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2">2. Job Description</label>
          <div className="relative">
            <textarea
              rows={8}
              className="block w-full rounded-xl border-slate-300 dark:border-slate-600 border shadow-sm focus:border-brand-500 focus:ring-brand-500 sm:text-sm p-4 font-mono text-slate-600 dark:text-slate-300 resize-none bg-slate-50/30 dark:bg-slate-900/50"
              placeholder="Paste the full job description here..."
              value={jdContent}
              onChange={(e) => setJdContent(e.target.value)}
            />
            <div className="absolute bottom-3 right-3 text-xs text-slate-400 pointer-events-none bg-white/80 dark:bg-slate-800/80 px-2 rounded">
               {jdContent.length > 0 ? `${jdContent.length} chars` : 'Paste text'}
            </div>
          </div>
        </div>

        <button
          onClick={() => onNext(resumeContent, jdContent)}
          disabled={!isReady}
          className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl text-white font-bold text-lg transition-all ${
            isReady 
              ? 'bg-brand-600 hover:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 shadow-xl shadow-brand-200 dark:shadow-brand-900/30 transform hover:-translate-y-0.5' 
              : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
          }`}
        >
          {isReady ? (
            <>Analyze Fit & Tailor <ArrowRight className="w-5 h-5" /></>
          ) : (
            <span className="text-slate-500 dark:text-slate-400">Complete steps to continue</span>
          )}
        </button>
      </div>
    </div>
  );
};
