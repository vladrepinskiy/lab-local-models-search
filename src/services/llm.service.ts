import { CreateMLCEngine, type MLCEngineInterface } from '@mlc-ai/web-llm';

// Progress callback type
export type ProgressCallback = (progress: {
  progress: number;
  timeElapsed: number;
  text: string;
}) => void;

// Singleton engine instance
let llmEngine: MLCEngineInterface | null = null;
let isInitializing = false;
let initializationError: Error | null = null;
let progressCallback: ProgressCallback | null = null;

const MODEL_ID = 'Llama-3.2-3B-Instruct-q4f32_1-MLC';

const initializeLLMEngine = async (
  onProgress?: ProgressCallback
): Promise<MLCEngineInterface> => {
  if (llmEngine) {
    return llmEngine;
  }

  if (isInitializing) {
    // Wait for ongoing initialization
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    if (llmEngine) {
      return llmEngine;
    }
    if (initializationError) {
      throw initializationError;
    }
  }

  isInitializing = true;
  progressCallback = onProgress || null;

  try {
    console.log(`Loading LLM model (${MODEL_ID})...`);
    console.log('This may take a moment on first load...');

    const startTime = performance.now();

    // Set up progress reporting
    const reportProgress = (progress: number, text: string) => {
      const timeElapsed = performance.now() - startTime;
      if (progressCallback) {
        progressCallback({
          progress,
          timeElapsed,
          text,
        });
      }
    };

    // Create engine with progress callback
    // Using a model from prebuiltAppConfig, so no custom appConfig needed
    llmEngine = await CreateMLCEngine(
      MODEL_ID,
      {
        initProgressCallback: (report) => {
          const progress = report.progress;
          const text = report.text || 'Loading model...';
          reportProgress(progress, text);
        },
      },
      {
        temperature: 0.7,
        top_p: 0.95,
      }
    );

    const endTime = performance.now();
    console.log(
      `LLM model loaded successfully in ${((endTime - startTime) / 1000).toFixed(1)}s`
    );

    isInitializing = false;
    return llmEngine;
  } catch (error) {
    isInitializing = false;
    initializationError = error as Error;
    console.error('Failed to initialize LLM model:', error);
    console.error(
      'This might be due to network issues or model loading problems.'
    );
    console.error('Please check your internet connection and try again.');
    throw error;
  }
};

export const initializeLLM = async (
  onProgress?: ProgressCallback
): Promise<void> => {
  await initializeLLMEngine(onProgress);
};

// Helper: Create prompt for query expansion
const createExpansionPrompt = (query: string): string => {
  return `List 3-5 synonyms or related terms for: "${query}"

Format: word1, word2, word3, word4, word5

Example:
Input: "paris"
Output: paris, france, eiffel tower, louvre, french capital`;
};

// Helper: Generate response from LLM
const generateLLMResponse = async (
  engine: MLCEngineInterface,
  prompt: string
): Promise<string> => {
  console.log('[LLM Service] Sending prompt to LLM...');
  console.log('[LLM Service] Prompt:', prompt);

  const generationStartTime = performance.now();
  const response = await engine.chat.completions.create({
    messages: [
      {
        role: 'system',
        content:
          'You are a search assistant. Return only comma-separated keywords, no explanations.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.1, // Lower temperature for more focused output
    max_tokens: 50, // Shorter limit to prevent drift
  });
  const generationTime = performance.now() - generationStartTime;
  console.log(
    `[LLM Service] LLM generation completed in ${generationTime.toFixed(2)}ms`
  );

  const rawResponse = response.choices[0]?.message?.content?.trim() || '';
  console.log('[LLM Service] Raw LLM response:', rawResponse);
  return rawResponse;
};

// Helper: Try to parse JSON array from response
const tryParseJSONArray = (response: string): string[] | null => {
  const jsonArrayMatch = response.match(/\[[\s\S]*?\]/);
  if (!jsonArrayMatch) {
    return null;
  }

  try {
    const parsed = JSON.parse(jsonArrayMatch[0]);
    if (Array.isArray(parsed) && parsed.every((k) => typeof k === 'string')) {
      const keywords = parsed.map((k) => k.trim()).filter((k) => k.length > 0);
      console.log('[LLM Service] Parsed JSON array:', keywords);
      return keywords;
    }
  } catch (e) {
    console.warn('[LLM Service] JSON array found but invalid, using fallback');
  }

  return null;
};

// Helper: Clean response text for parsing
const cleanResponseText = (response: string): string => {
  return response
    .replace(/```json\s*/gi, '')
    .replace(/```\s*/g, '')
    .replace(/^Keywords?:\s*/i, '')
    .replace(/^Output:\s*/i, '')
    .replace(/^Expanded query:\s*/i, '')
    .replace(/^Original query:.*$/im, '') // Remove "Original query: ..." lines
    .replace(/\[|\]/g, '')
    .split('\n')[0] // Take only first line to avoid drift
    .trim();
};

// Helper: Extract quoted strings from response
const extractQuotedStrings = (text: string): string[] => {
  const quotedMatches = text.match(/"([^"]+)"/g);
  if (!quotedMatches || quotedMatches.length === 0) {
    return [];
  }

  const keywords = quotedMatches
    .map((m) => m.replace(/"/g, '').trim())
    .filter((k) => k.length > 0);
  console.log('[LLM Service] Extracted quoted strings:', keywords);
  return keywords;
};

// Helper: Parse comma-separated list
const parseCommaSeparatedList = (text: string): string[] => {
  const keywords = text
    .split(',')
    .map((k) => k.trim().replace(/^["']|["']$/g, ''))
    .filter((k) => k.length > 0 && !k.match(/^[\[\]{}]+$/));
  console.log('[LLM Service] Parsed comma-separated list:', keywords);
  return keywords;
};

// Helper: Parse response into keywords array
const parseResponseToKeywords = (response: string): string[] => {
  // Try JSON array first
  const jsonKeywords = tryParseJSONArray(response);
  if (jsonKeywords && jsonKeywords.length > 0) {
    return jsonKeywords;
  }

  // Clean the response for other parsing methods
  const cleaned = cleanResponseText(response);

  // Try extracting quoted strings
  const quotedKeywords = extractQuotedStrings(cleaned);
  if (quotedKeywords.length > 0) {
    return quotedKeywords;
  }

  // Fallback to comma-separated parsing
  return parseCommaSeparatedList(cleaned);
};

// Helper: Clean and normalize individual keyword
const normalizeKeyword = (keyword: string): string => {
  let cleaned = keyword.trim();
  // Remove leading/trailing broken quotes
  cleaned = cleaned.replace(/^["']+/, '').replace(/["']+$/, '');
  // Remove broken quote patterns like '"ven hoch'
  cleaned = cleaned.replace(/^"([^"]+)$/, '$1');
  return cleaned.trim();
};

// Helper: Filter out malformed keywords
const isValidKeyword = (keyword: string): boolean => {
  if (keyword.length === 0) return false;
  if (keyword.match(/^[\[\]{}",\s]+$/)) return false;

  // Filter entries with mismatched quotes
  if (
    (keyword.startsWith('"') && !keyword.endsWith('"')) ||
    (!keyword.startsWith('"') && keyword.endsWith('"'))
  ) {
    const cleaned = keyword.replace(/^["']+|["']+$/g, '');
    if (cleaned.length === 0) return false;
  }

  return true;
};

// Helper: Clean and filter keywords array
const cleanKeywords = (keywords: string[]): string[] => {
  return keywords
    .map(normalizeKeyword)
    .filter(isValidKeyword)
    .map((k) => k.replace(/^["']+|["']+$/g, ''))
    .filter((k) => k.length > 0);
};

// Helper: Remove duplicate keywords (case-insensitive)
const removeDuplicates = (keywords: string[]): string[] => {
  const seen = new Set<string>();
  return keywords.filter((k) => {
    const lower = k.toLowerCase();
    if (seen.has(lower)) {
      return false;
    }
    seen.add(lower);
    return true;
  });
};

// Helper: Ensure original query is included
const ensureOriginalQuery = (
  keywords: string[],
  originalQuery: string
): string[] => {
  const hasOriginal = keywords.some(
    (k) => k.toLowerCase() === originalQuery.toLowerCase()
  );

  if (!hasOriginal) {
    return [originalQuery, ...keywords];
  }

  return keywords;
};

// Helper: Format keywords for search query
const formatKeywordsForSearch = (keywords: string[]): string => {
  return keywords.join('|');
};

// Main function: Expand query using LLM
export const expandQuery = async (query: string): Promise<string> => {
  if (!query.trim()) {
    throw new Error('Cannot expand empty query');
  }

  console.log('[LLM Service] Expanding query:', query);

  try {
    // Get LLM engine
    const engineStartTime = performance.now();
    console.log('[LLM Service] Getting LLM engine...');
    const engine = await initializeLLMEngine();
    const engineTime = performance.now() - engineStartTime;
    console.log(`[LLM Service] Engine ready in ${engineTime.toFixed(2)}ms`);

    // Generate response
    const prompt = createExpansionPrompt(query);
    const rawResponse = await generateLLMResponse(engine, prompt);

    let keywords = parseResponseToKeywords(rawResponse);
    keywords = cleanKeywords(keywords);
    keywords = removeDuplicates(keywords);

    // Validate we have keywords
    if (keywords.length === 0) {
      console.warn(
        '[LLM Service] No valid keywords extracted, using original query'
      );
      return query;
    }

    keywords = ensureOriginalQuery(keywords, query);
    const uniqueKeywords = removeDuplicates(keywords);

    console.log('[LLM Service] Final keywords:', uniqueKeywords);
    console.log(
      `[LLM Service] Query expansion successful: "${query}" -> ${uniqueKeywords.length} keywords`
    );

    // Format and return
    return formatKeywordsForSearch(uniqueKeywords);
  } catch (error) {
    console.error('[LLM Service] Failed to expand query with LLM:', error);
    console.error('[LLM Service] Error details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.log('[LLM Service] Falling back to original query');
    return query;
  }
};
