import { pipeline, env } from "@xenova/transformers";
import { initializeONNX } from './onnxSetup';

class OfflineAIService {
  private generator: any = null;
  private isInitializing = false;

  async initialize() {
    if (this.generator) return true;
    if (this.isInitializing) return false;
    
    this.isInitializing = true;
    try {
      // Initialize ONNX first
      const onnxInitialized = await initializeONNX();
      if (!onnxInitialized) {
        throw new Error('Failed to initialize ONNX Runtime');
      }

      // Configure env
      env.allowLocalModels = true;
      env.useBrowserCache = true;
      env.backends.onnx.wasm.numThreads = 4;

      this.generator = await pipeline(
        'text-generation',
        'Xenova/distilgpt2',
        {
          quantized: true,
          cache: true,
          load_in_8bit: true,
          progress_callback: (progress: any) => {
            console.log('Loading model:', Math.round(progress.progress * 100), '%');
          }
        }
      );
      return true;
    } catch (error) {
      console.error('Failed to initialize offline AI:', error);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  async generate(prompt: string) {
    if (!this.generator) {
      await this.initialize();
    }

    try {
      const result = await this.generator(prompt, {
        max_length: 100,
        temperature: 0.7
      });
      return result[0].generated_text;
    } catch (error) {
      console.error('Offline AI generation error:', error);
      throw new Error('Failed to generate response in offline mode');
    }
  }
}

export const offlineAI = new OfflineAIService();
