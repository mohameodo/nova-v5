import { novaProvider } from './nova';
import { ollamaProvider } from './ollama';
import { geminiProvider } from './gemini';
import { openaiProvider } from './openai';
import { ModelType, Message } from '../models/types';
import { generateImage } from '../services/imageService';  // Update this import

export const getProvider = (type: ModelType) => {
  switch (type) {
    case 'nova':
      return openaiProvider;  // Change this to use OpenAI as default
    case 'ollama':
      return ollamaProvider;
    case 'gemini':
      return geminiProvider;
    case 'openai':
      return openaiProvider;
    default:
      throw new Error(`Provider not implemented: ${type}`);
  }
};

export type Provider = {
  sendMessage: (messages: Message[], model?: string) => Promise<string>;
};

export { generateImage };
