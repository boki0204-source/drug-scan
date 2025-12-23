
import { GoogleGenAI, Type } from "@google/genai";
import { IdentificationResult, GroundingSource } from "../types";

export const identifyMedications = async (base64Image: string): Promise<{ data: IdentificationResult, sources: GroundingSource[] }> => {
  // Vite의 define 설정을 통해 Netlify 환경 변수가 이 자리에 주입됩니다.
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    throw new Error("API_KEY가 설정되지 않았습니다. Netlify 설정에서 API_KEY 환경 변수를 추가해주세요.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // 텍스트 분석 및 검색 접지에 최적화된 최신 모델 사용
  const model = "gemini-3-flash-preview";

  const prompt = `사진 속의 모든 의약품(알약, 상자, 블리스터 등)을 식별해 주세요. 
각 약품에 대해 다음 정보를 반드시 한글로 제공해야 합니다:
1. koreanName: 약품의 공식 한글 명칭
2. englishIngredients: 주요 성분의 영문 명칭 및 함량
3. dosage: 용량 또는 함량 정보
4. company: 제약회사 이름
5. description: 약의 외형 특징 (색상, 모양, 식별 문자 등)
6. sourceUrl: 해당 약품의 공식 상세 정보 페이지 링크

Google 검색 기능을 사용하여 한국 의약품 시장의 최신 정보를 반영하고, 반드시 JSON 형식으로 응답하세요.`;

  try {
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
    
    // 검색 결과(출처) 추출
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    return { data: result, sources };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
