/**
 * Estimates the number of syllables in a word using heuristic rules.
 * Based on standard English syllable counting algorithms.
 */
function countSyllables(word: string): number {
  word = word.toLowerCase().trim();
  
  if (word.length === 0) return 0;
  if (word.length <= 3) return 1;
  
  // Remove silent 'e' and other common endings
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  
  // Treat 'y' at the beginning as consonant
  word = word.replace(/^y/, '');
  
  // Count vowel groups
  const syllables = word.match(/[aeiouy]{1,2}/g);
  const count = syllables ? syllables.length : 1;
  
  // Ensure at least 1 syllable
  return Math.max(1, count);
}

export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  complexWordCount: number;
}

/**
 * Calculates Flesch-Kincaid Grade Level and Reading Ease scores.
 * Note: These metrics are designed for English text only.
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  const trimmedText = text.trim();
  
  if (!trimmedText) {
    return {
      fleschKincaidGrade: 0,
      fleschReadingEase: 0,
      wordCount: 0,
      sentenceCount: 0,
      avgSentenceLength: 0,
      complexWordCount: 0,
    };
  }

  // Improved sentence detection
  const sentences = trimmedText.match(/[^.!?]+[.!?]+/g) || [trimmedText];
  const sentenceCount = sentences.length;
  
  // Improved word extraction
  const words = trimmedText.match(/\b[a-zA-Z]+(?:[''][a-zA-Z]+)?\b/g) || [];
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      fleschKincaidGrade: 0,
      fleschReadingEase: 0,
      wordCount: 0,
      sentenceCount,
      avgSentenceLength: 0,
      complexWordCount: 0,
    };
  }

  let syllableCount = 0;
  let complexWordCount = 0;

  words.forEach(word => {
    const syllables = countSyllables(word);
    syllableCount += syllables;
    if (syllables >= 3) {
      complexWordCount++;
    }
  });

  const avgSentenceLength = wordCount / sentenceCount;
  const avgSyllablesPerWord = syllableCount / wordCount;

  // Flesch-Kincaid Grade Level Formula
  // 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59
  const fleschKincaidGrade = 
    (0.39 * avgSentenceLength) + 
    (11.8 * avgSyllablesPerWord) - 
    15.59;

  // Flesch Reading Ease Formula
  // 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words)
  let fleschReadingEase = 
    206.835 - 
    (1.015 * avgSentenceLength) - 
    (84.6 * avgSyllablesPerWord);
  
  // Clamp between 0 and 100
  fleschReadingEase = Math.max(0, Math.min(100, fleschReadingEase));

  return {
    fleschKincaidGrade: Math.max(0, parseFloat(fleschKincaidGrade.toFixed(1))),
    fleschReadingEase: parseFloat(fleschReadingEase.toFixed(1)),
    wordCount,
    sentenceCount,
    avgSentenceLength: parseFloat(avgSentenceLength.toFixed(1)),
    complexWordCount,
  };
}

export function getGradeLabel(score: number): string {
  if (score <= 0) return 'N/A';
  if (score <= 5) return 'Easy (Grades 1-5)';
  if (score <= 8) return 'Standard (Grades 6-8)';
  if (score <= 12) return 'Complex (High School)';
  return 'Very Complex (College+)';
}