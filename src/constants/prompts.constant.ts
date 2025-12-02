export const TYPO_CORRECTION_PROMPT = (query: string): string => {
  return `Check if this search query has a typo. If yes, return the corrected version. If no typo, return the original query unchanged.

Query: "${query}"

Return only the corrected query or original if no typo. No explanations.

Example:
Input: "von hoch"
Output: van gogh

Input: "paris"
Output: paris`;
};

export const TYPO_CORRECTION_SYSTEM_MESSAGE =
  'You are a typo correction assistant. Return only the corrected query, nothing else.';

export const QUERY_EXPANSION_PROMPT = (query: string): string => {
  return `List 3-5 synonyms or related terms for: "${query}"

Format: word1, word2, word3, word4, word5

Example:
Input: "paris"
Output: paris, france, eiffel tower, louvre, french capital`;
};

export const QUERY_EXPANSION_SYSTEM_MESSAGE =
  'You are a search assistant. Return only comma-separated keywords, no explanations.';
