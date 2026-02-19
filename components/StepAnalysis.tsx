
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, CheckCircle2 } from 'lucide-react';
import { AnalysisResult, ChatMessage } from '../types';

interface StepAnalysisProps {
  initialAnalysis: AnalysisResult;
  onComplete: (context: string, chatHistory: string) => void;
}

export const StepAnalysis: React.FC<StepAnalysisProps> = ({ initialAnalysis, onComplete }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0 && initialAnalysis.questions) {
      const intro = "I've analyzed your resume and known facts against the job description. To bridge the remaining gap, I have a few questions:";
      const questionText = initialAnalysis.questions.map((q, i) => `${i + 1}. ${q}`).join('\n\n');
      
      setMessages([
        { role: 'model', content: `${intro}\n\n${questionText}` }
      ]);
    }
  }, [initialAnalysis, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessages = [...messages, { role: 'user', content: inputValue } as ChatMessage];
    setMessages(newMessages);
    setInputValue('');
    
    // Simulate thinking/response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: "Got it. Anything else relevant to add?" 
      }]);
    }, 600);
  };

  const handleDone = () => {
    const userContext = messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join('\n\n');

    const fullHistory = messages
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    onComplete(userContext, fullHistory);
  };

  return (
    <div className="max-w-2xl mx-auto h-[600px] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-500">
      <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">Career Coach AI</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Refining your profile (Gemini 3 Pro)</p>
          </div>
        </div>
        <button 
          onClick={handleDone}
          className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800 transition-colors"
        >
          <CheckCircle2 className="w-4 h-4" />
          I'm Done
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'user' ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400'
            }`}>
              {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`rounded-2xl p-4 max-w-[80%] whitespace-pre-wrap text-sm leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-slate-800 dark:bg-slate-700 text-white rounded-tr-none' 
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your answer here..."
            className="flex-1 rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-brand-500 shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-xl disabled:opacity-50 transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
