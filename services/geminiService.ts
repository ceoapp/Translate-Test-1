import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

export const translateText = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following English text to Thai. 
      Ensure the tone is natural, polite, and grammatically correct. 
      Return ONLY the translated Thai text without any explanations or quotation marks.
      
      Text: "${text}"`,
    });

    return response.text || "";
  } catch (error) {
    console.error("Translation error:", error);
    throw new Error("Failed to translate text. Please check your connection or try again.");
  }
};