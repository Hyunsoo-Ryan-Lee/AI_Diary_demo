import { GoogleGenAI, Type } from '@google/genai';
import { Entry, AnalysisResult } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const suggestTags = async (content: string): Promise<string[]> => {
  if (!content.trim()) return [];

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `다음 일기/업무 기록을 분석하고 관련성이 높은 한국어 태그를 최대 5개까지 제안해주세요. 태그는 한두 단어의 키워드나 주요 주제여야 합니다. 내용: "${content}"`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    tags: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING
                        }
                    }
                }
            }
        }
    });

    const jsonText = response.text;
    const result = JSON.parse(jsonText);
    return result.tags || [];
  } catch (error) {
    console.error("Error suggesting tags:", error);
    return [];
  }
};


export const analyzeEntries = async (entries: Entry[], startDate: string, endDate: string): Promise<AnalysisResult | null> => {
  if (entries.length === 0) return null;

  const combinedContent = entries
    .map(e => `Date: ${e.date}\nContent: ${e.content}\nTags: ${e.tags.join(', ')}`)
    .join('\n\n---\n\n');

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: `You are an AI assistant analyzing a user's work logs and diary entries. Based on the following entries from ${startDate} to ${endDate}, provide a detailed analysis.
        
        Entries:
        ${combinedContent}
        
        Your analysis should include:
        1. "summary": A concise paragraph summarizing the main activities, themes, and potential insights.
        2. "topics": An array of objects for the top 5-7 topics, each with a "topic" (a key theme or subject) and its "frequency" (how many entries it was mentioned or alluded to).
        3. "trend": A brief sentence describing any noticeable trend or shift in focus over the period.`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    summary: { type: Type.STRING },
                    topics: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                topic: { type: Type.STRING },
                                frequency: { type: Type.INTEGER }
                            },
                            required: ['topic', 'frequency']
                        }
                    },
                    trend: { type: Type.STRING }
                },
                required: ['summary', 'topics', 'trend']
            }
        }
    });
    
    const jsonText = response.text;
    const result: AnalysisResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error analyzing entries:", error);
    return null;
  }
};