import { pipeline, env } from '@xenova/transformers';

// Configure Transformers.js to use HuggingFace CDN
env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';

// Singleton pipeline instance
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let embeddingPipeline: any = null;
let isInitializing = false;
let initializationError: Error | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const initializeEmbeddingModel = async (): Promise<any> => {
  if (embeddingPipeline) {
    return embeddingPipeline;
  }

  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (embeddingPipeline) {
      return embeddingPipeline;
    }
    if (initializationError) {
      throw initializationError;
    }
  }

  isInitializing = true;

  try {
    console.log('Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
    console.log('This may take a moment on first load...');
    const startTime = performance.now();

    // Load model from HuggingFace CDN
    // The model identifier 'Xenova/all-MiniLM-L6-v2' will be resolved to:
    // https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/main/
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );

    const endTime = performance.now();
    console.log(
      `Embedding model loaded successfully in ${(endTime - startTime).toFixed(0)}ms`
    );

    isInitializing = false;
    return embeddingPipeline;
  } catch (error) {
    isInitializing = false;
    initializationError = error as Error;
    console.error('Failed to initialize embedding model:', error);
    console.error(
      'This might be due to network issues or CDN access problems.'
    );
    console.error('Please check your internet connection and try again.');
    throw error;
  }
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
  if (!text.trim()) {
    throw new Error('Cannot generate embedding for empty text');
  }

  try {
    const model = await initializeEmbeddingModel();

    // Generate embedding
    const output = await model(text, {
      pooling: 'mean',
      normalize: true,
    });

    // Extract the embedding array
    const embedding = Array.from(output.data as Float32Array);

    return embedding;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw error;
  }
};
