import { GoogleGenAI } from "@google/genai";

// Safely attempt to retrieve the API key
const getApiKey = () => {
  try {
    // Check if process is defined (to avoid ReferenceError in some browser environments)
    if (typeof process !== 'undefined' && process.env && process.env.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("Could not access process.env");
  }
  return '';
};

const apiKey = getApiKey();
// Initialize the client only if we have a key, otherwise we handle it in the function
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy_key_to_init' });

export const translateText = async (text: string): Promise<string> => {
  if (!text.trim()) return "";

  if (!apiKey) {
    throw new Error("API Key is missing. Please set API_KEY in your environment variables.");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Translate the following English text to Thai. 
      Ensure the tone is natural, polite, and grammatically correct. 
      Return ONLY the translated Thai text without any explanations or quotation marks.
      
      Text: "${text}"`,
    });

    return response.text || "";
  } catch (error: any) {
    console.error("Translation error:", error);
    
    // Check for common error patterns
    const errorMessage = error.message || "";
    if (errorMessage.includes("API key") || errorMessage.includes("403")) {
        throw new Error("Invalid API Key or permission denied.");
    }
    if (errorMessage.includes("fetch")) {
        throw new Error("Connection failed. Please check your internet.");
    }
    
    throw new Error("Translation failed. Please try again.");
  }
};