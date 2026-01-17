
import { GoogleGenAI, Type } from "@google/genai";

// Initialize with the API key directly from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateVectorPath(prompt: string): Promise<string> {
  try {
    // Using gemini-3-pro-preview as SVG path generation is a complex reasoning/coding task
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a valid SVG path data string (the 'd' attribute) for a simplified icon of: ${prompt}. 
      Only return the path data string, nothing else. For example: "M10 10 H 90 V 90 H 10 Z". 
      Ensure the path is closed and centered roughly within a 100x100 coordinate space.`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      },
    });

    // Access the .text property directly (not as a method)
    return response.text?.trim() || '';
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw error;
  }
}
