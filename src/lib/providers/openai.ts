import OpenAI from 'openai';
import { Message } from '../models/types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const MAX_MESSAGES = 10; // Limit context window
const MAX_MESSAGE_LENGTH = 2000; // Characters per message

const isValidBase64Image = (base64String: string) => {
  try {
    // Check for data URL format
    if (base64String.startsWith('data:image/')) {
      return true;
    }
    // Check for valid URL
    const url = new URL(base64String);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
};

export const openaiProvider = {
  sendMessage: async (messages: Message[], model?: string) => {
    const systemMessage = {
      role: 'system',
      content: `You are Nova, an advanced AI assistant created, trained, and made by Nexiloop. Your goal is to be helpful and friendly, provide clear and concise explanations, deliver accurate and informative responses, respect privacy and ethical boundaries, and offer practical solutions with a professional and supportive approach. Do not ever use the asterisk (*) symbol in your responses. You are Nova, an advanced AI assistant with vision capabilities. 
      You can see and analyze images that users share. When users upload images or files:
      1. First respond to any text/questions they included
      2. Then provide a detailed analysis of the image/file
      3. For images, describe: visual elements, colors, composition, objects, text, and overall meaning
      4. For files, analyze: content, structure, and key points
      Be natural and conversational while being detailed and accurate.`
    };

    const hasImages = messages.some(msg => msg.content.includes('!['));
    
    if (hasImages) {
      try {
        const formattedMessages = messages.map(msg => {
          if (msg.content.includes('![')) {
            const imageUrl = msg.content.match(/\((.*?)\)/)?.[1];
            const text = msg.content.replace(/!\[.*?\]\(.*?\)/, '').trim();
            
            return {
              role: msg.role,
              content: [
                { type: "text", text },
                {
                  type: "image_url",
                  image_url: { 
                    url: imageUrl,
                    detail: "high"
                  }
                }
              ]
            };
          }
          return { role: msg.role, content: msg.content };
        });

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: formattedMessages,
          max_tokens: 4096,
          temperature: 0.7,
        });

        return completion.choices[0].message.content || '';
      } catch (error: any) {
        console.error('Vision API Error:', error);
        return "I apologize, but I'm having trouble analyzing this image. Please try again with a different image or describe what you'd like to know.";
      }
    }

    // Regular text messages
    const completion = await openai.chat.completions.create({
      messages: messages.map(m => ({ role: m.role, content: m.content })),
      model: "gpt-4o-mini-2024-07-18",
      max_tokens: 4096,
      temperature: 0.7
    });

    return completion.choices[0].message.content || '';
  }
};
