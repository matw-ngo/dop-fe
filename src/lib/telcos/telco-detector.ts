/**
 * Vietnamese telecommunications carrier detection utilities
 * Advanced detection with pattern matching and machine learning hints
 */

import {
  VietnameseTelco,
  VIETNAMESE_TELCOS,
  ALL_VIETNAMESE_PREFIXES
} from './vietnamese-telcos';

export interface TelcoDetectionResult {
  telco: VietnameseTelco | null;
  confidence: number; // 0-1
  phoneNumber: string;
  detectionMethod: 'prefix' | 'pattern' | 'database' | 'ml_hints' | 'unknown';
  alternativeTelcos?: VietnameseTelco[];
  metadata?: {
    prefixMatched?: string;
    confidenceScore?: number;
    userCorrections?: number;
    successRate?: number;
  };
}

export interface TelcoPattern {
  regex: RegExp;
  telco: string;
  confidence: number;
  description: string;
}

/**
 * Advanced telco detection patterns
 */
const TELCO_PATTERNS: TelcoPattern[] = [
  // Viettel patterns
  {
    regex: /^(03[2-9]|09[6-8]|086|081)/,
    telco: 'VIETTEL',
    confidence: 0.95,
    description: 'Viettel standard prefixes'
  },
  // Mobifone patterns
  {
    regex: /^(090|093|070|079|089)/,
    telco: 'MOBIFONE',
    confidence: 0.95,
    description: 'Mobifone standard prefixes'
  },
  // Vinaphone patterns
  {
    regex: /^(091|094|08[3-5]|088)/,
    telco: 'VINAPHONE',
    confidence: 0.95,
    description: 'Vinaphone standard prefixes'
  },
  // Vietnamobile patterns
  {
    regex: /^(092|05[6-8])/,
    telco: 'VIETNAMOBILE',
    confidence: 0.90,
    description: 'Vietnamobile standard prefixes'
  },
  // Gmobile patterns
  {
    regex: /^(099|059)/,
    telco: 'GTEL',
    confidence: 0.90,
    description: 'Gmobile standard prefixes'
  }
];

/**
 * Historical porting data (simplified example)
 * In production, this would come from a database
 */
const PORTING_DATABASE: Record<string, string> = {
  // Example: Some Viettel numbers ported to Mobifone
  '0971234567': 'MOBIFONE',
  '0977654321': 'MOBIFONE',
  // Example: Some Mobifone numbers ported to Viettel
  '0901234567': 'VIETTEL',
  // Add more porting data as needed
};

/**
 * Detection statistics for ML hints
 */
interface DetectionStats {
  totalDetections: number;
  correctDetections: number;
  userCorrections: Map<string, number>;
  successRates: Map<string, number>;
}

const detectionStats: DetectionStats = {
  totalDetections: 0,
  correctDetections: 0,
  userCorrections: new Map(),
  successRates: new Map()
};

/**
 * Detect telco using prefix matching
 */
export const detectByPrefix = (phoneNumber: string): TelcoDetectionResult => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  // Direct prefix matching
  for (const prefix of ALL_VIETNAMESE_PREFIXES) {
    if (cleanPhone.startsWith(prefix)) {
      const telco = Object.values(VIETNAMESE_TELCOS).find(t =>
        t.prefixes.includes(prefix)
      );

      if (telco) {
        return {
          telco,
          confidence: 0.98,
          phoneNumber: cleanPhone,
          detectionMethod: 'prefix',
          metadata: {
            prefixMatched: prefix,
            confidenceScore: 0.98
          }
        };
      }
    }
  }

  // Try with international format
  if (cleanPhone.startsWith('84')) {
    const localPhone = '0' + cleanPhone.slice(2);
    return detectByPrefix(localPhone);
  }

  return {
    telco: null,
    confidence: 0,
    phoneNumber: cleanPhone,
    detectionMethod: 'unknown'
  };
};

/**
 * Detect telco using advanced pattern matching
 */
export const detectByPattern = (phoneNumber: string): TelcoDetectionResult => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  for (const pattern of TELCO_PATTERNS) {
    if (pattern.regex.test(cleanPhone)) {
      const telco = VIETNAMESE_TELCOS[pattern.telco];
      if (telco) {
        return {
          telco,
          confidence: pattern.confidence,
          phoneNumber: cleanPhone,
          detectionMethod: 'pattern',
          metadata: {
            confidenceScore: pattern.confidence
          }
        };
      }
    }
  }

  // Fallback to prefix detection
  return detectByPrefix(phoneNumber);
};

/**
 * Check porting database for number porting
 */
export const checkPortingDatabase = (phoneNumber: string): TelcoDetectionResult | null => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  // Check if number exists in porting database
  const portedTo = PORTING_DATABASE[cleanPhone];
  if (portedTo) {
    const telco = VIETNAMESE_TELCOS[portedTo];
    if (telco) {
      return {
        telco,
        confidence: 0.99, // High confidence for ported numbers
        phoneNumber: cleanPhone,
        detectionMethod: 'database',
        metadata: {
          confidenceScore: 0.99,
          successRate: 1.0 // Ported numbers are 100% accurate in database
        }
      };
    }
  }

  return null;
};

/**
 * Apply ML hints based on historical data
 */
export const applyMLHints = (phoneNumber: string, baseResult: TelcoDetectionResult): TelcoDetectionResult => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');

  // Get success rates for similar number patterns
  const numberPrefix = cleanPhone.substring(0, 6);
  const successRate = detectionStats.successRates.get(numberPrefix) || baseResult.confidence;

  // Adjust confidence based on historical success
  const adjustedConfidence = Math.min(0.99, baseResult.confidence * (0.8 + successRate * 0.2));

  // Get alternative telcos with lower confidence
  const alternatives = Object.values(VIETNAMESE_TELCOS)
    .filter(t => t.code !== baseResult.telco?.code)
    .slice(0, 2);

  return {
    ...baseResult,
    confidence: adjustedConfidence,
    detectionMethod: 'ml_hints',
    alternativeTelcos: alternatives,
    metadata: {
      ...baseResult.metadata,
      confidenceScore: adjustedConfidence,
      successRate
    }
  };
};

/**
 * Record user correction for learning
 */
export const recordUserCorrection = (
  phoneNumber: string,
  correctedTelco: string,
  originalDetection: string
): void => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const correctionKey = `${cleanPhone}:${originalDetection}`;

  // Increment correction count
  const currentCorrections = detectionStats.userCorrections.get(correctionKey) || 0;
  detectionStats.userCorrections.set(correctionKey, currentCorrections + 1);

  // Update success rates
  if (correctedTelco !== originalDetection) {
    const numberPrefix = cleanPhone.substring(0, 6);
    const currentRate = detectionStats.successRates.get(numberPrefix) || 0.9;
    detectionStats.successRates.set(numberPrefix, currentRate * 0.9); // Reduce confidence for this pattern
  }

  detectionStats.totalDetections++;
};

/**
 * Record successful detection
 */
export const recordSuccessfulDetection = (phoneNumber: string, telcoCode: string): void => {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const numberPrefix = cleanPhone.substring(0, 6);

  const currentRate = detectionStats.successRates.get(numberPrefix) || 0.9;
  const newRate = Math.min(0.99, currentRate * 1.01); // Slightly increase confidence
  detectionStats.successRates.set(numberPrefix, newRate);

  detectionStats.correctDetections++;
  detectionStats.totalDetections++;
};

/**
 * Get detection accuracy statistics
 */
export const getDetectionStats = () => {
  return {
    accuracy: detectionStats.totalDetections > 0
      ? detectionStats.correctDetections / detectionStats.totalDetections
      : 0,
    totalDetections: detectionStats.totalDetections,
    correctionsByPattern: Object.fromEntries(detectionStats.userCorrections),
    successRatesByPrefix: Object.fromEntries(detectionStats.successRates)
  };
};

/**
 * Comprehensive telco detection with fallback methods
 */
export const detectTelco = (phoneNumber: string): TelcoDetectionResult => {
  if (!phoneNumber || phoneNumber.length < 3) {
    return {
      telco: null,
      confidence: 0,
      phoneNumber: phoneNumber,
      detectionMethod: 'unknown'
    };
  }

  // Method 1: Check porting database first (highest accuracy)
  const portingResult = checkPortingDatabase(phoneNumber);
  if (portingResult) {
    return applyMLHints(phoneNumber, portingResult);
  }

  // Method 2: Pattern matching
  const patternResult = detectByPattern(phoneNumber);
  if (patternResult.telco) {
    return applyMLHints(phoneNumber, patternResult);
  }

  // Method 3: Prefix matching (fallback)
  const prefixResult = detectByPrefix(phoneNumber);
  if (prefixResult.telco) {
    return applyMLHints(phoneNumber, prefixResult);
  }

  // No detection possible
  return {
    telco: null,
    confidence: 0,
    phoneNumber: phoneNumber.replace(/\D/g, ''),
    detectionMethod: 'unknown'
  };
};

/**
 * Batch detect telcos for multiple phone numbers
 */
export const batchDetectTelcos = (phoneNumbers: string[]): TelcoDetectionResult[] => {
  return phoneNumbers.map(detectTelco);
};

/**
 * Get telco distribution statistics
 */
export const getTelcoDistribution = (phoneNumbers: string[]): Record<string, number> => {
  const distribution: Record<string, number> = {};

  phoneNumbers.forEach(phone => {
    const result = detectTelco(phone);
    if (result.telco) {
      distribution[result.telco.code] = (distribution[result.telco.code] || 0) + 1;
    } else {
      distribution['UNKNOWN'] = (distribution['UNKNOWN'] || 0) + 1;
    }
  });

  return distribution;
};

/**
 * Validate telco detection confidence
 */
export const isDetectionReliable = (result: TelcoDetectionResult, threshold: number = 0.8): boolean => {
  return result.confidence >= threshold && result.telco !== null;
};

/**
 * Get recommended action based on detection confidence
 */
export const getRecommendation = (result: TelcoDetectionResult): string => {
  if (result.confidence >= 0.95) {
    return `Rất chắc chắn: ${result.telco?.name}`;
  } else if (result.confidence >= 0.80) {
    return `Chắc chắn: ${result.telco?.name}`;
  } else if (result.confidence >= 0.60) {
    return `Có thể là: ${result.telco?.name} (cần xác nhận)`;
  } else if (result.telco) {
    return `Ít khả năng: ${result.telco?.name} (khuyên xác nhận thủ công)`;
  } else {
    return 'Không xác định được nhà mạng';
  }
};

export default {
  detectTelco,
  detectByPrefix,
  detectByPattern,
  checkPortingDatabase,
  applyMLHints,
  recordUserCorrection,
  recordSuccessfulDetection,
  getDetectionStats,
  batchDetectTelcos,
  getTelcoDistribution,
  isDetectionReliable,
  getRecommendation
};