
export enum AppStep {
  UPLOAD = 'UPLOAD',
  ANALYSIS = 'ANALYSIS',
  GENERATION = 'GENERATION',
  RESULTS = 'RESULTS',
  PROFILE = 'PROFILE',
  FIND_JOBS = 'FIND_JOBS'
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export interface AnalysisResult {
  needsInfo: boolean;
  questions?: string[];
  rationale?: string;
}

export interface GeneratedContent {
  resume: string;
  coverLetter: string;
  outreachMessage: string;
  hiringManagerInfo?: string;
}

export interface JobContext {
  resume: string;
  jobDescription: string;
  additionalContext: string;
}

export interface JobSearchPreferences {
  roles: string;
  locations: string;
  salaryMin: string;
  exclusions: string;
  radius: number;
  searchContext: string;
  workModes: string[];
}

export interface UserProfile {
  masterResume: string;
  facts: string[];
  searchPreferences: JobSearchPreferences;
}

export interface JobOpportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  salary?: string;
  url?: string;
  matchScore: number;
  reasoning: string;
}
