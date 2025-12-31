import { GoogleGenerativeAI } from '@google/generative-ai';
if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not defined');
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export const processUserQuery = async (prompt: string): Promise<string> => {
  try {
    const result = await model.generateContent(prompt);
    const aiResponseText = await result.response.text();
    console.log('AI Response Text:', aiResponseText);

    // Sanitize the AI response by removing backticks and code block delimiters
    const sanitizedResponseText = aiResponseText.replace(/```json|```/g, '');
    console.log('Sanitized AI Response Text:', sanitizedResponseText);

    return sanitizedResponseText;
  } catch (error) {
    console.error('Error with Gemini API:', error);
    throw new Error('Failed to process query');
  }
};
