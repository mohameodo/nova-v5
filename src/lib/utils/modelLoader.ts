import localforage from 'localforage';
import { env } from '@xenova/transformers';

// Configure the base URL for the model files
const MODEL_CONFIG = {
  name: 'distilgpt2',
  repo: 'Xenova/distilgpt2',
  files: {
    tokenizer: 'https://huggingface.co/distilgpt2/resolve/main/tokenizer.json',
    config: 'https://huggingface.co/distilgpt2/resolve/main/config.json',
    model: 'https://huggingface.co/distilgpt2/resolve/main/pytorch_model.bin'
  }
};

export async function ensureModelLoaded(progressCallback?: (progress: number) => void) {
  try {
    // Configure env
    env.allowLocalModels = true;
    env.useBrowserCache = true;
    env.modelCacheDir = 'model-cache';

    // Check if model is already cached
    const modelExists = await localforage.getItem('model-cached');
    if (modelExists) {
      if (progressCallback) progressCallback(100);
      return true;
    }

    // Initialize pipeline with caching
    const { pipeline } = await import('@xenova/transformers');
    
    // Download and cache the model
    await pipeline('text-generation', MODEL_CONFIG.repo, {
      progress_callback: (progress: any) => {
        if (progressCallback) {
          progressCallback(Math.round(progress.progress * 100));
        }
      },
      cache: true,
      quantized: true
    });

    // Mark as cached
    await localforage.setItem('model-cached', true);
    return true;

  } catch (error) {
    console.error('Model loading failed:', error);
    return false;
  }
}

export async function clearModelCache() {
  try {
    await localforage.removeItem('model-cached');
    await localforage.removeItem('model-files');
    const cache = await caches.open('transformers-cache');
    await cache.delete('/');
    return true;
  } catch (error) {
    console.error('Failed to clear model cache:', error);
    return false;
  }
}
