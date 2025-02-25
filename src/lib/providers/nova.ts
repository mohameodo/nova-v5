import OpenAI from 'openai';
import { Message } from '../models/types';

const openai = new OpenAI({
  baseURL: 'https://api.deepseek.com/v1',
  apiKey: import.meta.env.VITE_DEEP_API_KEY,
  dangerouslyAllowBrowser: true
});

export const novaProvider = {
  sendMessage: async (messages: Message[]) => {
    const systemMessage = {
      role: 'system' as const,
      content: `You are Nova, an advanced AI assistant created, trained, and made by Nexiloop. 
Your responses should be:
1. Clear and direct - no asterisks or action descriptions
2. Professional yet friendly
3. Informative and accurate
4. Respectful of privacy and ethics
5. Focused on practical solutions

Format your responses as plain text without any special formatting or symbols.`
    };

    const formattedMessages = messages.map(msg => ({
      role: msg.role as 'system' | 'user' | 'assistant',
      content: msg.content
    }));

    const completion = await openai.chat.completions.create({
      messages: [systemMessage, ...formattedMessages],
      model: "deepseek-chat",
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0].message.content || '';
    return response.trim();
  }
};
