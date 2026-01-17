import { GoogleGenAI, Type } from "@google/genai";

// Initialization follows strict guidelines; polyfill in index.html ensures this doesn't crash browser
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const generateRecipeSuggestions = async (jamType: string) => {
  try {
    // If API_KEY is missing, we fail gracefully rather than crashing the module
    if (!process.env.API_KEY) {
      console.warn("API_KEY is not defined. Skipping AI recipe generation.");
      return null;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest 3 unique, premium healthy recipes or serving ideas using Vanphal Farms' handcrafted ${jamType}. 
      Focus on natural ingredients and mountain vibes.
      Format the output as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              pairingSuggestion: { type: Type.STRING }
            },
            required: ["title", "description", "steps"]
          }
        }
      }
    });

    if (!response.text) return null;
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};