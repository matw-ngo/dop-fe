/**
 * Telco Detector Tests
 */

import {
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
} from '../telco-detector';

describe('Telco Detector', () => {
  describe('detectTelco', () => {
    test('should detect Viettel numbers correctly', () => {
      const result = detectTelco('0961234567');
      expect(result.telco?.code).toBe('VIETTEL');
      expect(result.detectionMethod).toBe('prefix');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should detect Mobifone numbers correctly', () => {
      const result = detectTelco('0901234567');
      expect(result.telco?.code).toBe('MOBIFONE');
      expect(result.detectionMethod).toBe('prefix');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should handle international format', () => {
      const result = detectTelco('+84961234567');
      expect(result.telco?.code).toBe('VIETTEL');
      expect(result.confidence).toBeGreaterThan(0.9);
    });

    test('should return null for invalid numbers', () => {
      const result = detectTelco('123456789');
      expect(result.telco).toBeNull();
      expect(result.confidence).toBe(0);
      expect(result.detectionMethod).toBe('unknown');
    });

    test('should handle empty input', () => {
      const result = detectTelco('');
      expect(result.telco).toBeNull();
      expect(result.phoneNumber).toBe('');
      expect(result.detectionMethod).toBe('unknown');
    });
  });

  describe('detectByPrefix', () => {
    test('should detect telco by prefix with high confidence', () => {
      const result = detectByPrefix('0961234567');
      expect(result.telco?.code).toBe('VIETTEL');
      expect(result.confidence).toBe(0.98);
      expect(result.detectionMethod).toBe('prefix');
      expect(result.metadata?.prefixMatched).toBe('096');
    });

    test('should convert international format to local', () => {
      const result = detectByPrefix('+84901234567');
      expect(result.telco?.code).toBe('MOBIFONE');
    });
  });

  describe('detectByPattern', () => {
    test('should detect telco using regex patterns', () => {
      const result = detectByPattern('0961234567');
      expect(result.telco?.code).toBe('VIETTEL');
      expect(result.detectionMethod).toBe('pattern');
      expect(result.confidence).toBe(0.95);
    });

    test('should fall back to prefix detection if pattern fails', () => {
      const result = detectByPattern('1234567890');
      expect(result.telco).toBeNull();
    });
  });

  describe('checkPortingDatabase', () => {
    test('should return ported telco information', () => {
      // Test with known ported number from the mock database
      const result = checkPortingDatabase('0971234567');
      expect(result?.telco?.code).toBe('MOBIFONE');
      expect(result?.detectionMethod).toBe('database');
      expect(result?.confidence).toBe(0.99);
    });

    test('should return null for non-ported numbers', () => {
      const result = checkPortingDatabase('0961234567');
      expect(result).toBeNull();
    });
  });

  describe('applyMLHints', () => {
    test('should adjust confidence based on historical data', () => {
      const baseResult = {
        telco: { code: 'VIETTEL', name: 'Viettel' },
        confidence: 0.95,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      const enhancedResult = applyMLHints('0961234567', baseResult);
      expect(enhancedResult.detectionMethod).toBe('ml_hints');
      expect(enhancedResult.alternativeTelcos).toBeDefined();
      expect(enhancedResult.alternativeTelcos.length).toBeGreaterThan(0);
    });

    test('should provide alternative telcos', () => {
      const baseResult = {
        telco: { code: 'VIETTEL', name: 'Viettel' },
        confidence: 0.8,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      const enhancedResult = applyMLHints('0961234567', baseResult);
      expect(enhancedResult.alternativeTelcos).toBeDefined();
      expect(enhancedResult.alternativeTelcos.length).toBe(2);
    });
  });

  describe('recordUserCorrection', () => {
    test('should record user corrections for learning', () => {
      recordUserCorrection('0961234567', 'MOBIFONE', 'VIETTEL');

      const stats = getDetectionStats();
      expect(stats.correctionsByPattern).toBeDefined();
    });
  });

  describe('recordSuccessfulDetection', () => {
    test('should record successful detections', () => {
      recordSuccessfulDetection('0961234567', 'VIETTEL');

      const stats = getDetectionStats();
      expect(stats.successRatesByPrefix).toBeDefined();
      expect(stats.totalDetections).toBeGreaterThan(0);
    });
  });

  describe('getDetectionStats', () => {
    test('should return detection statistics', () => {
      const stats = getDetectionStats();
      expect(stats).toHaveProperty('accuracy');
      expect(stats).toHaveProperty('totalDetections');
      expect(stats).toHaveProperty('correctionsByPattern');
      expect(stats).toHaveProperty('successRatesByPrefix');
    });
  });

  describe('batchDetectTelcos', () => {
    test('should detect telcos for multiple phone numbers', () => {
      const phoneNumbers = ['0961234567', '0901234567', '0911234567'];
      const results = batchDetectTelcos(phoneNumbers);

      expect(results).toHaveLength(3);
      expect(results[0].telco?.code).toBe('VIETTEL');
      expect(results[1].telco?.code).toBe('MOBIFONE');
      expect(results[2].telco?.code).toBe('VINAPHONE');
    });

    test('should handle empty array', () => {
      const results = batchDetectTelcos([]);
      expect(results).toHaveLength(0);
    });
  });

  describe('getTelcoDistribution', () => {
    test('should calculate telco distribution', () => {
      const phoneNumbers = [
        '0961234567', '0962345678', // 2 Viettel
        '0901234567', // 1 Mobifone
        '0911234567'  // 1 Vinaphone
      ];

      const distribution = getTelcoDistribution(phoneNumbers);
      expect(distribution.VIETTEL).toBe(2);
      expect(distribution.MOBIFONE).toBe(1);
      expect(distribution.VINAPHONE).toBe(1);
    });

    test('should handle unknown telcos', () => {
      const phoneNumbers = ['1234567890'];
      const distribution = getTelcoDistribution(phoneNumbers);
      expect(distribution.UNKNOWN).toBe(1);
    });
  });

  describe('isDetectionReliable', () => {
    test('should determine reliability based on confidence threshold', () => {
      const reliableResult = {
        telco: { code: 'VIETTEL' },
        confidence: 0.9,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      const unreliableResult = {
        telco: { code: 'VIETTEL' },
        confidence: 0.5,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      expect(isDetectionReliable(reliableResult)).toBe(true);
      expect(isDetectionReliable(unreliableResult)).toBe(false);
      expect(isDetectionReliable(unreliableResult, 0.4)).toBe(true); // Lower threshold
    });
  });

  describe('getRecommendation', () => {
    test('should provide confident recommendations', () => {
      const confidentResult = {
        telco: { code: 'VIETTEL', name: 'Viettel' },
        confidence: 0.98,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      const recommendation = getRecommendation(confidentResult);
      expect(recommendation).toBe('Rất chắc chắn: Viettel');
    });

    test('should provide moderate confidence recommendations', () => {
      const moderateResult = {
        telco: { code: 'VIETTEL', name: 'Viettel' },
        confidence: 0.85,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      const recommendation = getRecommendation(moderateResult);
      expect(recommendation).toBe('Chắc chắn: Viettel');
    });

    test('should provide uncertain recommendations', () => {
      const uncertainResult = {
        telco: { code: 'VIETTEL', name: 'Viettel' },
        confidence: 0.65,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      const recommendation = getRecommendation(uncertainResult);
      expect(recommendation).toBe('Có thể là: Viettel (cần xác nhận)');
    });

    test('should provide low confidence recommendations', () => {
      const lowConfidenceResult = {
        telco: { code: 'VIETTEL', name: 'Viettel' },
        confidence: 0.4,
        phoneNumber: '0961234567',
        detectionMethod: 'prefix' as const
      };

      const recommendation = getRecommendation(lowConfidenceResult);
      expect(recommendation).toBe('Ít khả năng: Viettel (khuyên xác nhận thủ công)');
    });

    test('should handle undetermined telcos', () => {
      const undeterminedResult = {
        telco: null,
        confidence: 0,
        phoneNumber: '123456789',
        detectionMethod: 'unknown' as const
      };

      const recommendation = getRecommendation(undeterminedResult);
      expect(recommendation).toBe('Không xác định được nhà mạng');
    });
  });
});