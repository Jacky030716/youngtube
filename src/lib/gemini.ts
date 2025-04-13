import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-exp-image-generation",
  generationConfig: {
    // @ts-ignore
    responseModalities: ["Text", "Image"],
    temperature: 1,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

export { model, imageModel };
