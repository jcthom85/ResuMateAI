
import { UserProfile } from "../types";

// Incremented to v3 to force a refresh of defaults for the user (adding workModes)
const STORAGE_KEY = 'resumate_profile_v3';

const DEFAULT_PROFILE: UserProfile = {
  masterResume: '',
  facts: [],
  searchPreferences: {
    // Specific roles requested by user
    roles: 'Solutions Architect, Staff Engineer, AI Architect, Principal Mobile Engineer',
    // Default locations (kept existing + emphasized Remote from user prompt)
    locations: 'Remote, Williamsburg, VA',
    // User specified $140k floor
    salaryMin: '140,000',
    // derived from "-Clearance" and "-Game" and seniority note
    exclusions: 'Clearance, Game, Junior, Associate', 
    radius: 50,
    // Defaulting to Remote + Hybrid as requested
    workModes: ['Remote', 'Hybrid'],
    // Specific combinations and seniority rules
    searchContext: 'Target specific combinations: 1. Solutions Architect (Python or Kotlin). 2. Staff Engineer (Infrastructure + SaaS). 3. AI Architect (Cost Optimization). 4. Principal Mobile Engineer (Kotlin). Strictly target Senior, Staff, or Principal levels. Avoid early-career roles.'
  }
};

export const loadProfile = (): UserProfile => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_PROFILE;
    
    const parsed = JSON.parse(stored);
    
    // Deep merge for searchPreferences to ensure new fields (like workModes) are picked up from DEFAULT
    // if the user has an old profile saved.
    const safePrefs = {
      ...DEFAULT_PROFILE.searchPreferences,
      ...(parsed.searchPreferences || {})
    };

    return { 
      ...DEFAULT_PROFILE, 
      ...parsed,
      searchPreferences: safePrefs 
    };
  } catch (e) {
    console.error("Failed to load profile", e);
    return DEFAULT_PROFILE;
  }
};

export const saveProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error("Failed to save profile", e);
  }
};

export const addFactToProfile = (fact: string): UserProfile => {
  const profile = loadProfile();
  if (!profile.facts.includes(fact)) {
    profile.facts.push(fact);
    saveProfile(profile);
  }
  return profile;
};
