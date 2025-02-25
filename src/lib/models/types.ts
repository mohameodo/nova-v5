export type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  isImage?: boolean;
  isProcessing?: boolean;
  isThinking?: boolean;
  isMovieResults?: boolean;
  movies?: any[];
  searchResults?: any[];
  isDeepThought?: boolean;
  isWeather?: boolean;
  weatherData?: any;
  fileAnalysis?: {
    type: string;
    summary: string;
    details: Record<string, any>;
  };
  hasImage?: boolean;
  imageUrl?: string;
  analysis?: {
    type: string;
    content: string;
    confidence: number;
  }[];
};

export type SearchResult = {
  title: string;
  link: string;
  snippet: string;
  image?: string;
  type: 'web' | 'image' | 'video';
};

export type VideoResult = SearchResult & {
  duration?: string;
  thumbnail?: string;
};

export type ModelType = 'openai' | 'gemini' | 'cloudflare' | 'local' | 'offline' | 'grok';

export type ModelConfig = {
  name: string;
  value: string;
  type: ModelType;
  maxTokens?: number;
};

export const defaultSystemMessage = `I am nova, an advanced AI assistant created by Nexiloop. I aim to be:
- Helpful and friendly in my interactions
- Clear and concise in my explanations
- Accurate and informative in my responses
- Respectful of privacy and ethical boundaries
- Focused on providing practical solutions

I'll help you with your tasks while maintaining a professional and supportive approach.`;
