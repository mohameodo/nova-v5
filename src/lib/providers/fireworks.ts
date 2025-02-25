import OpenAI from 'openai';

const fireworks = new OpenAI({
  baseURL: 'https://api.fireworks.ai/inference/v1',
  apiKey: import.meta.env.VITE_FIREWORKS_API_KEY,
  dangerouslyAllowBrowser: true  // Add this line
});

export const generateImage = async (prompt: string) => {
  try {
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt: `${prompt}, high quality, detailed, 4k` })
    });

    if (!response.ok) {
      throw new Error('Failed to generate image');
    }

    const data = await response.json();
    return data.imageUrl;
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
};
