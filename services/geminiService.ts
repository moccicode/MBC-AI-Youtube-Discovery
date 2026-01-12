
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, CommentData, YouTubeVideo, ScriptOutline } from "../types";

export const analyzeContent = async (video: YouTubeVideo, comments: CommentData[]): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const commentsPrompt = comments.map(c => `- ${c.text}`).join('\n');
  
  const prompt = `
    You are a YouTube Audience Analyst and Content Strategist. 
    Analyze the following video data and comments to answer these specific user needs:
    1. How are people reacting? (Overall sentiment and specific vibes)
    2. What are the most frequent keywords/topics mentioned in the comments?
    3. What specific video topics should be created next to satisfy this audience?

    Video Title: ${video.title}
    Description: ${video.description}
    
    Comments to Analyze:
    ${commentsPrompt.substring(0, 6000)}

    Output EXACTLY in JSON format with these fields:
    - summary: A detailed summary of audience reactions (what they liked, what they complained about).
    - commonQuestions: Top 3 actual questions from the comments.
    - audienceSentiment: A specific phrase describing the audience mood.
    - topKeywords: Exactly 5 "Strong Recommendation" keywords that represent high-demand topics.
    - suggestedTopics: 3 specific video ideas based on the analysis (title, reasoning, and a hook).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          commonQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          audienceSentiment: { type: Type.STRING },
          topKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestedTopics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                reasoning: { type: Type.STRING },
                hookIdea: { type: Type.STRING }
              },
              required: ["title", "reasoning", "hookIdea"]
            }
          }
        },
        required: ["summary", "commonQuestions", "audienceSentiment", "topKeywords", "suggestedTopics"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateScriptOutline = async (keyword: string, context: string): Promise<ScriptOutline> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Create a highly engaging YouTube Script Outline (Table of Contents) based on the keyword: "${keyword}".
    Context: The audience of a video titled "${context}" is specifically interested in this keyword.
    
    The outline should be practical and ready for filming. 
    Provide a Title and 4-5 Sections (e.g., Intro, Core Problem, Solution, Advanced Tip, Conclusion/CTA).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          sections: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                heading: { type: Type.STRING },
                content: { type: Type.STRING }
              },
              required: ["heading", "content"]
            }
          }
        },
        required: ["title", "sections"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};
