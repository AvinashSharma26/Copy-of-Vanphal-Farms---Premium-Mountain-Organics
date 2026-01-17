
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameter and direct process.env.API_KEY reference for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRecipeSuggestions = async (jamType: string) => {
  try {
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

    // The text property is a getter, not a method
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return null;
  }
};
