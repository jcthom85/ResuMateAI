
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Copy, Check, FileText, Mail, Linkedin, UserCircle } from 'lucide-react';
import { GeneratedContent } from '../types';

interface StepResultsProps {
  content: GeneratedContent;
  onRestart: () => void;
}

export const StepResults: React.FC<StepResultsProps> = ({ content, onRestart }) => {
  const [activeTab, setActiveTab] = useState<'resume' | 'cover' | 'linkedin'>('resume');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getActiveContent = () => {
    switch (activeTab) {
      case 'resume': return content.resume;
      case 'cover': return content.coverLetter;
      case 'linkedin': return content.outreachMessage;
      default: return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Tailored Application</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Ready to send. Review and export.</p>
        </div>
        <button onClick={onRestart} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 underline">
          Start Over
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
          <TabButton 
            active={activeTab === 'resume'} 
            onClick={() => setActiveTab('resume')} 
            icon={<FileText className="w-4 h-4" />}
            label="Resume"
          />
          <TabButton 
            active={activeTab === 'cover'} 
            onClick={() => setActiveTab('cover')} 
            icon={<Mail className="w-4 h-4" />}
            label="Cover Letter"
          />
          <TabButton 
            active={activeTab === 'linkedin'} 
            onClick={() => setActiveTab('linkedin')} 
            icon={<Linkedin className="w-4 h-4" />}
            label="LinkedIn DM"
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 min-h-[600px] flex flex-col transition-colors">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 rounded-t-2xl">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {activeTab === 'linkedin' ? 'Draft Message' : 'Preview'}
            </span>
            <button 
              onClick={() => handleCopy(getActiveContent())}
              className="flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 shadow-sm px-3 py-1.5 rounded-lg transition-all hover:shadow-md"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 p-8 overflow-y-auto max-h-[700px] custom-scrollbar">
            {activeTab === 'linkedin' && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl text-sm text-blue-800 dark:text-blue-200">
                <div className="flex items-center gap-2 font-semibold mb-2 text-blue-900 dark:text-blue-100">
                  <UserCircle className="w-5 h-5" />
                  <span>Target Contact</span>
                </div>
                {content.hiringManagerInfo}
              </div>
            )}
            
            <article className="prose prose-slate dark:prose-invert prose-sm sm:prose-base max-w-none prose-headings:font-bold prose-a:text-brand-600 dark:prose-a:text-brand-400">
              <ReactMarkdown>{getActiveContent()}</ReactMarkdown>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all w-full whitespace-nowrap
      ${active 
        ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md' 
        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600'
      }`}
  >
    {icon}
    {label}
  </button>
);
