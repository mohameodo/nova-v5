import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../models/types';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const geminiProvider = {
  sendMessage: async (messages: Message[]) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      // Define Nova's system message
      const novaIdentity = "You are Nova, an advanced AI assistant created, trained, and made by Nexiloop. Your goal is to be helpful and friendly, provide clear and concise explanations, deliver accurate and informative responses, respect privacy and ethical boundaries, and offer practical solutions with a professional and supportive approach. Do not ever use the asterisk (*) symbol in your responses.";

      // Convert messages to chat history format
      const chatHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

      // Start chat
      const chat = model.startChat({
        history: chatHistory,
      });

      // Get user prompt and include Nova's identity
      const userMessage = messages[messages.length - 1].content;
      const prompt = `${novaIdentity}\n\nUser: ${userMessage}`;

      const result = await chat.sendMessage(prompt);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }
};
