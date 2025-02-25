import { Message } from '../models/types';

export const ollamaProvider = {
  sendMessage: async (messages: Message[], model: string) => {
    const response = await fetch(`${import.meta.env.VITE_OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.message?.content || data.response;
  }
};
