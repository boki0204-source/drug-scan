
import { GoogleGenAI, Type } from "@google/genai";
import { IdentificationResult, GroundingSource } from "../types";

const API_KEY = process.env.API_KEY || "";

export const identifyMedications = async (base64Image: string): Promise<{ data: IdentificationResult, sources: GroundingSource[] }> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Use gemini-3-flash-preview as it is the recommended model for multimodal text/vision tasks 
  // and represents the latest capabilities in the Flash series (equivalent to the user's request for 2.5/latest)
  const model = "gemini-3-flash-preview";

  const prompt = `Analyze the provided image containing one or more medications.
Identify each medication and provide:
1. Korean Name (약품명)
2. English Ingredients (영문 성분명)
3. Dosage/Capacity (용량/함량)
4. Manufacturer (제약회사)
5. A brief identification description (외형 설명 등)
6. A reliable source URL.

Return the response in JSON format. Use Google Search grounding to ensure information accuracy for Korean pharmaceuticals.`;

  const response = await ai.models.generateContent({
    model: model,
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          medications: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                koreanName: { type: Type.STRING },
                englishIngredients: { type: Type.STRING },
                dosage: { type: Type.STRING },
                company: { type: Type.STRING },
                description: { type: Type.STRING },
                sourceUrl: { type: Type.STRING }
              },
              required: ["koreanName", "englishIngredients", "dosage", "company", "description", "sourceUrl"]
            }
          },
          summary: { type: Type.STRING }
        },
        required: ["medications", "summary"]
      }
    }
  });

  const result = JSON.parse(response.text || "{}") as IdentificationResult;
  
  // Extract grounding sources
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: GroundingSource[] = groundingChunks
    .filter((chunk: any) => chunk.web)
    .map((chunk: any) => ({
      title: chunk.web.title,
      uri: chunk.web.uri
    }));

  return { data: result, sources };
};
