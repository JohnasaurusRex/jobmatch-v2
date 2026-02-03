import { GoogleGenerativeAI, GenerateContentRequest, Part, SingleRequestOptions } from '@google/generative-ai';

const apiKey = process.env.GENAI_API_KEY;

if (!apiKey) {
  throw new Error('GENAI_API_KEY not found in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash-exp',
  generationConfig: {
    temperature: 0.3, // Lower temperature for more consistent JSON output
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 4096, // Increased for complex JSON responses
  },
});

// Add request logging for debugging
const originalGenerateContent = geminiModel.generateContent.bind(geminiModel);
geminiModel.generateContent = async function(
  request: string | GenerateContentRequest | (string | Part)[],
  requestOptions?: SingleRequestOptions
) {
  console.log('Sending request to Gemini AI...');
  const start = Date.now();
  
  try {
    const response = await originalGenerateContent(request, requestOptions);
    const duration = Date.now() - start;
    console.log(`Gemini AI responded in ${duration}ms`);
    return response;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`Gemini AI failed after ${duration}ms:`, error);
    throw error;
  }
};