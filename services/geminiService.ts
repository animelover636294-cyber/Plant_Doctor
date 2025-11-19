import { GoogleGenAI, Type } from "@google/genai";
import { PlantAnalysisResult } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

export const analyzePlantImage = async (base64Image: string): Promise<PlantAnalysisResult> => {
  // Initialize AI Client
  // The API key must be obtained exclusively from the environment variable process.env.API_KEY.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // 3. Prepare image data
  // Strip the data URL prefix if present to get raw base64
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Data,
            },
          },
          {
            text: `Analyze this plant image for diseases. Identify the disease name, whether it is healthy, a confidence score (0-100), a brief description of the condition, a list of visible symptoms, and a list of recommended solutions or treatments. 
            
            If the image is not a plant, set isHealthy to false, diseaseName to "Unknown", and description to "This does not appear to be a plant."`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            diseaseName: { type: Type.STRING },
            isHealthy: { type: Type.BOOLEAN },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            symptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            solutions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["diseaseName", "isHealthy", "confidence", "description", "symptoms", "solutions"],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("No response from AI");
    }

    return JSON.parse(text) as PlantAnalysisResult;
  } catch (error) {
    console.error("Error analyzing plant:", error);
    throw error;
  }
};