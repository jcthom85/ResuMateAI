
import React, { useState, useEffect } from 'react';
import { StepUpload } from './components/StepUpload';
import { StepAnalysis } from './components/StepAnalysis';
import { StepResults } from './components/StepResults';
import { StepProfile } from './components/StepProfile';
import { StepJobSearch } from './components/StepJobSearch';
import { analyzeGap, generateTailoredResume, generateCoverLetter, findHiringManagerAndDraftMessage, extractLearnedFacts, searchJobs } from './services/gemini';
import { loadProfile, saveProfile, addFactToProfile } from './services/storage';
import { AppStep, AnalysisResult, GeneratedContent, JobContext, UserProfile } from './types';
import { Sparkles, Loader2, UserCircle, Briefcase, Home } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<AppStep>(AppStep.UPLOAD);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  const [userProfile, setUserProfile] = useState<UserProfile>({ 
    masterResume: '', 
    facts: [],
    searchPreferences: {
      roles: '',
      locations: '',
      salaryMin: '',
      exclusions: ''
    }
  });

  const [jobContext, setJobContext] = useState<JobContext>({
    resume: '',
    jobDescription: '',
    additionalContext: ''
  });

  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [finalContent, setFinalContent] = useState<GeneratedContent | null>(null);

  // Load profile on mount
  useEffect(() => {
    setUserProfile(loadProfile());
  }, []);

  const handleSaveProfile = (newProfile: UserProfile) => {
    saveProfile(newProfile);
    setUserProfile(newProfile);
  };

  // STEP 1: Handle Upload & Initial Analysis
  const handleUploadComplete = async (resume: string, jd: string) => {
    setJobContext(prev => ({ ...prev, resume, jobDescription: jd }));
    setLoading(true);
    setLoadingText('Checking your Knowledge Base & analyzing gap...');
    
    try {
      // Pass known facts to analysis
      const result = await analyzeGap(resume, jd, userProfile.facts);
      setAnalysisResult(result);
      
      if (result.needsInfo && result.questions && result.questions.length > 0) {
        setStep(AppStep.ANALYSIS);
      } else {
        await performGeneration(resume, jd, '');
      }
    } catch (error) {
      console.error(error);
      alert('Analysis error. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Handle Chat Completion & LEARNING
  const handleAnalysisComplete = async (additionalContext: string, chatHistory: string) => {
    // 1. Generate Docs
    await performGeneration(jobContext.resume, jobContext.jobDescription, additionalContext);
    
    // 2. Background Learning: Extract facts and save to profile
    try {
      const newFacts = await extractLearnedFacts(chatHistory);
      if (newFacts.length > 0) {
        const updatedProfile = loadProfile(); // reload to get latest
        const mergedFacts = [...new Set([...updatedProfile.facts, ...newFacts])];
        handleSaveProfile({ ...updatedProfile, facts: mergedFacts });
        console.log("Learned new facts:", newFacts);
      }
    } catch (e) {
      console.error("Learning failed", e);
    }
  };

  // STEP 3: Generate All Content
  const performGeneration = async (resume: string, jd: string, context: string) => {
    setStep(AppStep.GENERATION);
    setLoading(true);

    try {
      // Combine user typed context + known facts for the generator
      const combinedContext = `${context}\n\nKNOWN FACTS:\n${userProfile.facts.join('\n')}`;

      setLoadingText('Drafting tailored resume...');
      const newResume = await generateTailoredResume(resume, jd, combinedContext);

      setLoadingText('Writing cover letter...');
      const coverLetter = await generateCoverLetter(newResume, jd);

      setLoadingText('Finding hiring manager...');
      const outreach = await findHiringManagerAndDraftMessage(jd, newResume);

      setFinalContent({
        resume: newResume,
        coverLetter: coverLetter,
        outreachMessage: outreach.message,
        hiringManagerInfo: outreach.managerInfo
      });

      setStep(AppStep.RESULTS);
    } catch (error) {
      console.error(error);
      alert('Generation failed.');
      setStep(AppStep.UPLOAD);
    } finally {
      setLoading(false);
    }
  };

  // Job Search Selection Handler
  const handleJobSelect = (job: any) => {
    // When selecting a job, we default to Master Resume for the new context
    setJobContext({
      resume: userProfile.masterResume,
      jobDescription: `${job.title} at ${job.company}\n${job.descriptionSnippet || ''}\nURL: ${job.url}`,
      additionalContext: ''
    });
    setStep(AppStep.UPLOAD);
  };

  const NavButton = ({ target, icon: Icon, label }: any) => (
    <button
      onClick={() => setStep(target)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
        step === target 
          ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300' 
          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep(AppStep.UPLOAD)}>
            <div className="bg-brand-600 p-1.5 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">ResuMate<span className="text-brand-600 dark:text-brand-400">AI</span></h1>
          </div>
          
          <nav className="flex items-center gap-2">
            <NavButton target={AppStep.UPLOAD} icon={Home} label="Home" />
            <NavButton target={AppStep.FIND_JOBS} icon={Briefcase} label="Find Jobs" />
            <NavButton target={AppStep.PROFILE} icon={UserCircle} label="My Profile" />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading && (
          <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <Loader2 className="w-12 h-12 text-brand-600 dark:text-brand-400 animate-spin mb-4" />
            <p className="text-lg font-medium text-slate-700 dark:text-slate-200 animate-pulse">{loadingText}</p>
          </div>
        )}

        {!loading && (
          <>
            {step === AppStep.UPLOAD && (
              <StepUpload 
                currentResume={jobContext.resume} // Pass the active resume from state
                masterResume={userProfile.masterResume} // Pass the master resume from profile
                initialJd={jobContext.jobDescription}
                onNext={handleUploadComplete} 
                onNavigateToProfile={() => setStep(AppStep.PROFILE)}
              />
            )}

            {step === AppStep.PROFILE && (
              <StepProfile profile={userProfile} onSave={handleSaveProfile} />
            )}

            {step === AppStep.FIND_JOBS && (
              <StepJobSearch 
                userProfile={userProfile} 
                onSearch={searchJobs} 
                onSelectJob={handleJobSelect}
              />
            )}

            {step === AppStep.ANALYSIS && analysisResult && (
              <StepAnalysis 
                initialAnalysis={analysisResult} 
                onComplete={handleAnalysisComplete} 
              />
            )}

            {step === AppStep.RESULTS && finalContent && (
              <StepResults 
                content={finalContent} 
                onRestart={() => setStep(AppStep.UPLOAD)} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
