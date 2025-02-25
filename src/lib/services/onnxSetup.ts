import * as ort from 'onnxruntime-web';
import * as tf from '@tensorflow/tfjs-core';

export async function initializeONNX() {
  try {
    // Initialize TensorFlow first
    await tf.ready();
    
    // Configure ONNX
    ort.env.wasm.wasmPaths = {
      'ort-wasm.wasm': '/onnx/ort-wasm.wasm',
      'ort-wasm-threaded.wasm': '/onnx/ort-wasm-threaded.wasm',
      'ort-wasm-simd.wasm': '/onnx/ort-wasm-simd.wasm',
      'ort-wasm-simd-threaded.wasm': '/onnx/ort-wasm-simd-threaded.wasm',
    };

    // Set threading and SIMD options
    ort.env.wasm.numThreads = navigator.hardwareConcurrency || 4;
    ort.env.wasm.simd = true;
    
    // Initialize WebAssembly
    await ort.initializeWebAssembly();
    
    // Initialize backend
    await ort.InferenceSession.create('/models/model.onnx', {
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all'
    });

    return true;
  } catch (error) {
    console.error('ONNX initialization failed:', error);
    return false;
  }
}
