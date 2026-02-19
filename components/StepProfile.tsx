
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Save, Trash2, FileText, Plus, Upload, Lightbulb, Info } from 'lucide-react';

interface StepProfileProps {
  profile: UserProfile;
  onSave: (profile: UserProfile) => void;
}

export const StepProfile: React.FC<StepProfileProps> = ({ profile, onSave }) => {
  const [masterResume, setMasterResume] = useState(profile.masterResume);
  const [newFact, setNewFact] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleSaveResume = () => {
    onSave({ ...profile, masterResume });
    alert('Master Resume Saved!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        setMasterResume(text);
      }
    };
    reader.readAsText(file);
  };

  const handleAddFact = () => {
    if (!newFact.trim()) return;
    const updatedFacts = [...profile.facts, newFact];
    onSave({ ...profile, facts: updatedFacts });
    setNewFact('');
  };

  const handleDeleteFact = (index: number) => {
    const updatedFacts = profile.facts.filter((_, i) => i !== index);
    onSave({ ...profile, facts: updatedFacts });
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
      readFile(file);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="bg-brand-100 dark:bg-brand-900/30 p-3 rounded-2xl">
          <FileText className="w-8 h-8 text-brand-600 dark:text-brand-400" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Profile & Context</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your resume and provide extra details to help the AI tailor your applications.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-250px)] min-h-[600px]">
        {/* LEFT COLUMN: Master Resume */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" /> Master Resume (Markdown)
            </h3>
            
            <div className="flex items-center gap-2">
              <label className="cursor-pointer text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2 shadow-sm">
                <Upload className="w-3 h-3" />
                Upload File
                <input type="file" className="sr-only" accept=".md,.txt" onChange={handleFileUpload} />
              </label>

              <button 
                onClick={handleSaveResume}
                className="text-xs bg-slate-900 dark:bg-slate-700 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors flex items-center gap-2 shadow-sm font-medium"
              >
                <Save className="w-3 h-3" /> Save Changes
              </button>
            </div>
          </div>
          
          <div 
            className={`flex-1 relative rounded-xl transition-all h-full ${isDragging ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-brand-50/90 dark:bg-brand-900/90 backdrop-blur-sm rounded-xl flex items-center justify-center z-10 border-2 border-brand-500 border-dashed animate-in fade-in duration-200">
                 <div className="text-center text-brand-600 dark:text-brand-400">
                    <Upload className="w-10 h-10 mx-auto mb-2" />
                    <p className="font-bold text-lg">Drop markdown file here</p>
                 </div>
              </div>
            )}
            <textarea
              value={masterResume}
              onChange={(e) => setMasterResume(e.target.value)}
              className="w-full h-full p-6 rounded-xl border-slate-300 dark:border-slate-700 border focus:border-brand-500 focus:ring-brand-500 text-sm font-mono leading-relaxed resize-none shadow-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-300"
              placeholder="# John Doe\n\n## Experience..."
            />
          </div>
        </div>

        {/* RIGHT COLUMN: Additional Context (Replacing Learned Facts) */}
        <div className="flex flex-col h-full space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Additional Context
            </h3>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">{profile.facts.length} items</span>
          </div>
          
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden transition-colors">
            {/* Context Input Area */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 space-y-3">
               <div className="flex gap-3 items-start">
                 <Info className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" />
                 <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                   <strong>What goes here?</strong> Add information that isn't explicitly in your resume but is important for job applications.
                   <br/>
                   <span className="text-slate-400 dark:text-slate-500 italic">Examples: "I have a Top Secret clearance", "Willing to relocate to UK", "Preferred stack is React/Node".</span>
                 </p>
               </div>

               <div className="flex gap-2 pt-1">
                 <input
                   type="text"
                   value={newFact}
                   onChange={(e) => setNewFact(e.target.value)}
                   placeholder="Type a detail and press Enter..."
                   onKeyDown={(e) => e.key === 'Enter' && handleAddFact()}
                   className="flex-1 text-sm border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white rounded-lg focus:ring-brand-500 focus:border-brand-500 shadow-sm py-2.5"
                 />
                 <button 
                   onClick={handleAddFact}
                   disabled={!newFact.trim()}
                   className="bg-brand-600 text-white p-2.5 rounded-lg hover:bg-brand-700 transition-colors disabled:opacity-50 shadow-sm"
                 >
                   <Plus className="w-5 h-5" />
                 </button>
               </div>
            </div>
            
            {/* List Area */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
              {profile.facts.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 dark:text-slate-500">
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-3">
                       <Lightbulb className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                    </div>
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No context added yet</p>
                    <p className="text-xs mt-1 max-w-[250px] mx-auto text-slate-400 dark:text-slate-500">Add key details to help the AI generate more accurate cover letters and outreach messages.</p>
                 </div>
              ) : (
                <div className="space-y-2 p-2">
                  {profile.facts.map((fact, i) => (
                    <div key={i} className="group flex items-start justify-between gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:border-brand-300 dark:hover:border-brand-500 hover:shadow-md transition-all">
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{fact}</p>
                      <button 
                        onClick={() => handleDeleteFact(i)}
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-md transition-all shrink-0"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
