
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, GeneratedContent, JobOpportunity, UserProfile, JobSearchPreferences } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// "Pro" for high-quality writing, reasoning, and document generation
const MODEL_WRITER = 'gemini-3-pro-preview';
// "Flash" for fast, high-volume search tasks (Job Sweep)
const MODEL_SEARCH_FAST = 'gemini-3-flash-preview'; 

/**
 * Analyzes the gap between the resume and the Job Description.
 * Uses Pro for deep reasoning.
 */
export const analyzeGap = async (resume: string, jobDescription: string, knownFacts: string[]): Promise<AnalysisResult> => {
  const prompt = `
    You are an expert career coach. Analyze the Resume and Job Description.
    
    CONTEXT - KNOWN FACTS ABOUT CANDIDATE:
    ${knownFacts.join('\n')}

    RESUME:
    ${resume.substring(0, 15000)}

    JOB DESCRIPTION:
    ${jobDescription.substring(0, 15000)}
    
    TASK:
    1. Check if the resume + known facts cover the critical requirements of the job description.
    2. If critical info is still missing (e.g., specific metric, skill usage context), set 'needsInfo' to true and ask up to 3 probing questions.
    3. If the known facts fill the gap, set 'needsInfo' to false (the generation step will use them).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_WRITER,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            needsInfo: { type: Type.BOOLEAN },
            questions: { type: Type.ARRAY, items: { type: Type.STRING } },
            rationale: { type: Type.STRING }
          },
          required: ["needsInfo", "rationale"]
        }
      }
    });

    return JSON.parse(response.text || "{}") as AnalysisResult;
  } catch (error) {
    console.error("Gap Analysis Failed", error);
    return { needsInfo: false, rationale: "Analysis failed, proceeding." };
  }
};

/**
 * Extracts new facts about the user from the chat conversation.
 * Uses Pro for accurate extraction.
 */
export const extractLearnedFacts = async (conversation: string): Promise<string[]> => {
  const prompt = `
    Analyze the following conversation between a Career Coach AI and a Candidate.
    Extract distinct, useful facts about the Candidate's experience, skills, or preferences that were revealed in their answers.
    
    Output a JSON array of strings. Each string should be a standalone fact (e.g., "Led a team of 5 engineers using React").
    Ignore trivial conversation.
    
    CONVERSATION:
    ${conversation}
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_WRITER,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Fact extraction failed", e);
    return [];
  }
};

/**
 * Searches for jobs based on dynamic user preferences.
 * Uses FLASH for speed and stability with tools.
 */
export const searchJobs = async (userProfile: UserProfile, prefs: JobSearchPreferences): Promise<JobOpportunity[]> => {
  const prompt = `
    You are "Starborn", an elite AI Headhunter. 
    
    CLIENT PROFILE SUMMARY:
    ${userProfile.masterResume.substring(0, 1000)}... (truncated)
    
    SEARCH PARAMETERS:
    - TARGET ROLES: ${prefs.roles}
    - TARGET LOCATIONS: ${prefs.locations} (Look within a ${prefs.radius} mile radius)
    - WORK MODES: ${(prefs.workModes || []).join(', ')}
    - MINIMUM SALARY: ${prefs.salaryMin}
    
    STRICT EXCLUSIONS (THE "KILL LIST"):
    - Ignore any jobs containing these terms: ${prefs.exclusions}

    ADDITIONAL CLIENT INSTRUCTIONS (SPECIAL CONTEXT):
    ${prefs.searchContext || "None provided."}

    LOCATION RULES (CRITICAL):
    1. If "Remote" is in WORK MODES, prioritize fully remote roles.
    2. If "Hybrid" is in WORK MODES, look for roles in TARGET LOCATIONS that allow hybrid work.
    3. If "On-site" is in WORK MODES, look for on-site roles in TARGET LOCATIONS.
    4. If a specific city is listed in TARGET LOCATIONS, include nearby cities within the ${prefs.radius} mile radius.
    
    TASK:
    Use Google Search to find 5 active, high-quality job openings that match the parameters above.
    
    VETTING CRITERIA:
    - Boost: Matches client's resume skills, reputable companies.
    - Boost: Adheres to "ADDITIONAL CLIENT INSTRUCTIONS" if provided.
    - Downrank: Low salary, mismatching location, or presence of exclusion terms.
    
    Strictly vet each result. Return the top 5 distinct opportunities in JSON format. 
    Provide a punchy 'reasoning' for why it fits the user's specific criteria.

    Output Schema: Array of JobOpportunity objects.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_SEARCH_FAST,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              company: { type: Type.STRING },
              location: { type: Type.STRING },
              salary: { type: Type.STRING },
              url: { type: Type.STRING },
              matchScore: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Job Search Failed", error);
    return [];
  }
};

export const generateTailoredResume = async (
  originalResume: string, 
  jobDescription: string, 
  additionalContext: string
): Promise<string> => {
  const prompt = `
    You are a professional resume writer using the Gemini 3 Pro model.
    Rewrite the resume to target the Job Description, STRICTLY maintaining Markdown format.

    INSTRUCTIONS:
    1. Title: Frame candidate appropriately for the target role.
    2. Hook: Write a compelling summary that bridges the candidate's actual experience with the job requirements.
    
    CRITICAL FORMATTING RULES:
    1. Keep the exact same Markdown structure (headers, spacing, bullet style).
    2. Keep the same section order (e.g., Experience, Education, Skills).
    3. Keep the same contact info header format.
    4. Do not drastically change the length.

    CONTENT OPTIMIZATION RULES:
    1. Do NOT lie or fabricate. Use the "Additional Context" (Learned Facts + Chat Answers) to fill gaps truthfully.
    2. Swap out generic keywords for specific keywords found in the Job Description.
    3. Rephrase bullet points to highlight achievements relevant to the job description.
    4. Use active voice and strong action verbs.
    5. Quantify results where possible.

    ORIGINAL RESUME:
    ${originalResume}

    ADDITIONAL CONTEXT (Known Facts & Answers):
    ${additionalContext}

    TARGET JOB DESCRIPTION:
    ${jobDescription}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_WRITER,
    contents: prompt,
  });

  return response.text || "Failed to generate resume.";
};

export const generateCoverLetter = async (
  tailoredResume: string,
  jobDescription: string
): Promise<string> => {
  const prompt = `
    Write a High-Quality "Asset" (Cover Letter) for this Candidate.
    
    TONE: 
    - Confident, "Headhunter-approved". 
    - Professional but human.
    
    STRATEGY:
    - Focus on the intersection of the candidate's skills and the company's pain points.
    - Directly address the requirements in the JD.
    - Keep it under 400 words.
    
    FORMAT:
    Markdown.

    RESUME:
    ${tailoredResume}

    JOB DESCRIPTION:
    ${jobDescription}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_WRITER,
    contents: prompt,
  });

  return response.text || "Failed to generate cover letter.";
};

export const findHiringManagerAndDraftMessage = async (
  jobDescription: string,
  tailoredResume: string
): Promise<{ message: string; managerInfo: string }> => {
  const prompt = `
    Extract role/company from the job description.
    Step 1: Use Google Search to identify the Hiring Manager, Talent Acquisition Lead, or Engineering Director for this role.
    Step 2: Draft a LinkedIn connection message (max 300 chars) highlighting the candidate's value.
    
    Output JSON: { "managerInfo": string, "draftMessage": string }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_WRITER, // Use Pro for writing the message
      contents: `${prompt}\n\nJob Description: ${jobDescription.substring(0, 3000)}\nResume Summary: ${tailoredResume.substring(0, 2000)}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json" 
      }
    });

    const result = JSON.parse(response.text || "{}");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    let sources = "";
    if (chunks) {
      const urls = chunks.map(c => c.web?.uri).filter(u => u).slice(0, 2).join(', ');
      if (urls) sources = ` (Source: ${urls})`;
    }

    return {
      message: result.draftMessage || "Hi, I just applied...",
      managerInfo: (result.managerInfo || "Hiring Team") + sources
    };

  } catch (error) {
    return {
      message: "Hi, I recently applied for the position...",
      managerInfo: "Could not identify manager."
    };
  }
};
