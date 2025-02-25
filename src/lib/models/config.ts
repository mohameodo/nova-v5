import { ModelConfig } from './types';

export const modelConfigs: ModelConfig[] = [
  {
    name: "nova turbo",
    value: "gpt-4o-mini-2024-07-18",
    type: "openai",  // Changed to use OpenAI
    maxTokens: 16384
  },
  {
    name: "nova Turbo",
    value: "gpt-4-turbo-preview",
    type: "openai",
    maxTokens: 4096
  },
  { name: "Nova", value: "nova", type: "nova" },
  { name: "Nova Local", value: "nlp/nova", type: "ollama" },
  { name: "Llama2", value: "llama2", type: "ollama" },
  { name: "CodeLlama", value: "codellama", type: "ollama" },
  { name: "Mistral", value: "mistral", type: "ollama" },
  { name: "Gemini Pro", value: "gemini-pro", type: "gemini" },
  { name: "Grok", value: "grok-1", type: "grok" },
  { name: "Cloudflare AI", value: "cloudflare-ai", type: "cloudflare" },
  {
    name: "Nova (Offline)",
    value: "offline-nova",
    type: "offline",
    description: "Local AI model for offline use",
    maxTokens: 100,
    temperature: 0.7,
  },
];
