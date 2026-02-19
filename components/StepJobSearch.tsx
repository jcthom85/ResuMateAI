
import React, { useState, useEffect } from 'react';
import { JobOpportunity, UserProfile, JobSearchPreferences } from '../types';
import { saveProfile } from '../services/storage';
import { Search, Briefcase, MapPin, DollarSign, ExternalLink, ArrowRight, Loader2, Star, Zap, AlertCircle, Settings2, Save, FileEdit, Building2 } from 'lucide-react';

interface StepJobSearchProps {
  userProfile: UserProfile;
  onSearch: (profile: UserProfile, prefs: JobSearchPreferences) => Promise<JobOpportunity[]>;
  onSelectJob: (job: JobOpportunity) => void;
}

export const StepJobSearch: React.FC<StepJobSearchProps> = ({ userProfile, onSearch, onSelectJob }) => {
  const [results, setResults] = useState<JobOpportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Local state for preferences form
  const [prefs, setPrefs] = useState<JobSearchPreferences>(userProfile.searchPreferences);

  // Sync state if profile prop updates
  useEffect(() => {
    setPrefs(userProfile.searchPreferences);
  }, [userProfile.searchPreferences]);

  const handleSavePreferences = () => {
    const updatedProfile = { ...userProfile, searchPreferences: prefs };
    saveProfile(updatedProfile);
    setShowSettings(false);
  };

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    setResults([]);
    setError(null);
    setShowSettings(false); // Auto-collapse settings on search start

    // Create a timeout promise that rejects after 45 seconds
    const timeoutPromise = new Promise<JobOpportunity[]>((_, reject) => 
      setTimeout(() => reject(new Error("Search timed out. The network might be slow.")), 45000)
    );

    try {
      // Race the actual search against the timeout
      const jobs = await Promise.race([
        onSearch(userProfile, prefs),
        timeoutPromise
      ]);
      setResults(jobs);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An error occurred while searching.");
    } finally {
      setLoading(false);
    }
  };

  const toggleWorkMode = (mode: string) => {
    const currentModes = prefs.workModes || [];
    const newModes = currentModes.includes(mode)
      ? currentModes.filter(m => m !== mode)
      : [...currentModes, mode];
    setPrefs({ ...prefs, workModes: newModes });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Search Header & Configuration */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 transition-colors">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-brand-500" />
              AI Job Sweep
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Find roles that match your profile and criteria.</p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 flex items-center gap-2 transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            {showSettings ? 'Hide Criteria' : 'Configure Criteria'}
          </button>
        </div>

        {/* Collapsible Settings Panel */}
        <div className={`space-y-4 overflow-hidden transition-all duration-300 ease-in-out ${showSettings ? 'max-h-[800px] opacity-100 pt-4 border-t border-slate-100 dark:border-slate-700' : 'max-h-0 opacity-0'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Target Roles</label>
                <input 
                  type="text" 
                  value={prefs.roles} 
                  onChange={(e) => setPrefs({...prefs, roles: e.target.value})}
                  placeholder="e.g. Software Engineer, Product Manager"
                  className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Min. Salary / Rate</label>
                <input 
                  type="text" 
                  value={prefs.salaryMin} 
                  onChange={(e) => setPrefs({...prefs, salaryMin: e.target.value})}
                  placeholder="e.g. $120,000 or $80/hr"
                  className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Locations</label>
                <input 
                  type="text" 
                  value={prefs.locations} 
                  onChange={(e) => setPrefs({...prefs, locations: e.target.value})}
                  placeholder="e.g. NYC, London (Leave blank if fully remote)"
                  className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Search Radius</label>
                  <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-0.5 rounded">{prefs.radius || 0} miles</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  step="10" 
                  value={prefs.radius || 0} 
                  onChange={(e) => setPrefs({...prefs, radius: parseInt(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-brand-600"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> Work Mode
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Remote', 'Hybrid', 'On-site'].map(mode => (
                    <button
                      key={mode}
                      onClick={() => toggleWorkMode(mode)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        (prefs.workModes || []).includes(mode)
                          ? 'bg-brand-100 text-brand-700 border-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-800'
                          : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-red-700 dark:text-red-400 uppercase">Exclusions (Negative Keywords)</label>
              <input 
                type="text" 
                value={prefs.exclusions} 
                onChange={(e) => setPrefs({...prefs, exclusions: e.target.value})}
                placeholder="e.g. Clearance, Java, Gambling"
                className="w-full text-sm rounded-lg border-red-200 dark:border-red-900/50 focus:ring-red-500 focus:border-red-500 bg-red-50/50 dark:bg-red-900/10 dark:text-red-100"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase flex items-center gap-1">
                <FileEdit className="w-3 h-3" /> Special Instructions
              </label>
              <textarea
                rows={2}
                value={prefs.searchContext || ''} 
                onChange={(e) => setPrefs({...prefs, searchContext: e.target.value})}
                placeholder="e.g. I prefer Series A/B startups, need visa sponsorship, or want to work in HealthTech."
                className="w-full text-sm rounded-lg border-slate-300 dark:border-slate-600 dark:bg-slate-900 dark:text-white focus:ring-brand-500 focus:border-brand-500"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button 
              onClick={handleSavePreferences}
              className="text-xs font-bold flex items-center gap-1 text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
            >
              <Save className="w-3 h-3" /> Save to Profile
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col items-center justify-center pt-2">
          {!showSettings && (
             <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 mb-4 flex-wrap justify-center">
                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{prefs.roles}</span>
                <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">{prefs.locations}</span>
                {prefs.radius > 0 && <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded border border-slate-200 dark:border-slate-600">+{prefs.radius}mi</span>}
                <span className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded border border-green-100 dark:border-green-800">{prefs.salaryMin}</span>
                {(prefs.workModes || []).length > 0 && (
                   <div className="flex gap-1">
                      {(prefs.workModes || []).map(m => (
                        <span key={m} className="bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-2 py-1 rounded border border-purple-100 dark:border-purple-800">{m}</span>
                      ))}
                   </div>
                )}
             </div>
          )}
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full md:w-auto bg-brand-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-xl shadow-brand-200 dark:shadow-brand-900/30 disabled:opacity-70 flex items-center justify-center gap-3 transform active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            {loading ? 'Scanning Job Board...' : 'Find Matches'}
          </button>
        </div>
      </div>

      {/* Results Area */}
      <div className="space-y-4">
        {loading && (
           <div className="space-y-4 animate-pulse">
             {[1,2,3].map(i => (
               <div key={i} className="h-48 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"></div>
             ))}
           </div>
        )}

        {error && (
          <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-100 dark:border-red-900 animate-in fade-in">
             <AlertCircle className="w-10 h-10 text-red-500 dark:text-red-400 mx-auto mb-2" />
             <p className="text-red-800 dark:text-red-200 font-medium">{error}</p>
             <button onClick={handleSearch} className="mt-4 text-sm text-red-600 dark:text-red-400 hover:underline">Try Again</button>
          </div>
        )}

        {!loading && !error && searched && results.length === 0 && (
          <div className="text-center p-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-lg">No matches found with these strict criteria.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Try relaxing your exclusions or broadening location settings.</p>
          </div>
        )}

        {results.map((job, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
            
            {/* Match Score Badge */}
            <div className={`absolute top-0 right-0 px-4 py-1.5 rounded-bl-xl border-b border-l text-sm font-bold flex items-center gap-1
              ${job.matchScore >= 90 
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'}
            `}>
              {job.matchScore >= 90 && <Star className="w-3 h-3 fill-emerald-800 dark:fill-emerald-300" />}
              {job.matchScore}% Fit
            </div>

            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
              <div className="space-y-3 flex-1">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{job.title}</h3>
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium text-lg">
                    {job.company}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-700 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-600"><MapPin className="w-3 h-3" /> {job.location}</span>
                  {job.salary && <span className="flex items-center gap-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-md border border-green-100 dark:border-green-800 font-semibold"><DollarSign className="w-3 h-3" /> {job.salary}</span>}
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border-l-4 border-brand-400 text-sm text-slate-600 dark:text-slate-400 italic">
                  "{job.reasoning}"
                </div>
              </div>
              
              <div className="flex items-center gap-3 mt-4 md:mt-0 w-full md:w-auto">
                {job.url && (
                  <a href={job.url} target="_blank" rel="noreferrer" className="p-3 text-slate-400 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors">
                    <ExternalLink className="w-6 h-6" />
                  </a>
                )}
                <button
                  onClick={() => onSelectJob(job)}
                  className="flex-1 md:flex-none bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-slate-200 dark:shadow-slate-900/40 flex items-center justify-center gap-2"
                >
                  Generate Assets <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
