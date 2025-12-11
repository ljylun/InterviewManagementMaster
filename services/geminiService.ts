
import { GoogleGenAI, Type, Schema } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export interface ParsedResume {
  name: string;
  email: string;
  phone: string;
  education: string;
  experience_years: number;
  skills: string[];
  summary: string;
  work_experience?: {
    company: string;
    role: string;
    start_date: string;
    end_date: string;
    description: string;
  }[];
}

export const parseResumeWithGemini = async (
  base64Data: string,
  mimeType: string
): Promise<ParsedResume> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock data.");
    return {
      name: "John Doe (Mock)",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      education: "B.S. Computer Science, Mock University",
      experience_years: 5,
      skills: ["React", "TypeScript", "Node.js", "Mocking"],
      summary: "This is a mock summary because no API key was provided.",
      work_experience: [
        {
          company: "Mock Corp",
          role: "Senior Engineer",
          start_date: "2020-01",
          end_date: "Present",
          description: "Developed core platform features."
        },
        {
          company: "Startup Inc",
          role: "Junior Developer",
          start_date: "2018-01",
          end_date: "2019-12",
          description: "Built landing pages and APIs."
        }
      ]
    };
  }

  const modelId = "gemini-2.5-flash";

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Candidate full name" },
      email: { type: Type.STRING, description: "Email address" },
      phone: { type: Type.STRING, description: "Phone number" },
      education: { type: Type.STRING, description: "Highest degree and university" },
      experience_years: { type: Type.NUMBER, description: "Total years of professional experience" },
      skills: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of top technical skills"
      },
      summary: { type: Type.STRING, description: "Brief professional summary extracted from resume" },
      work_experience: {
        type: Type.ARRAY,
        description: "List of professional work experiences, ordered by most recent",
        items: {
          type: Type.OBJECT,
          properties: {
            company: { type: Type.STRING, description: "Company Name" },
            role: { type: Type.STRING, description: "Job Title" },
            start_date: { type: Type.STRING, description: "Start Date (YYYY-MM)" },
            end_date: { type: Type.STRING, description: "End Date (YYYY-MM) or 'Present'" },
            description: { type: Type.STRING, description: "Short description of responsibilities" }
          }
        }
      }
    },
    required: ["name", "email", "experience_years", "skills"]
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: "Analyze this resume and extract the following information into a structured JSON format. Be precise with dates and company names."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    
    return JSON.parse(text) as ParsedResume;

  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};
