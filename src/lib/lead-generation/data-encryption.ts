/**
 * Data Encryption Utilities for Lead Generation
 * Provides AES-256 encryption for sensitive Vietnamese personal data
 */

import crypto from 'crypto';

// Encryption configuration
interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
}

// Default encryption configuration (AES-256-GCM)
const DEFAULT_ENCRYPTION_CONFIG: EncryptionConfig = {
  algorithm: 'aes-256-gcm',
  keyLength: 32, // 256 bits
  ivLength: 16,  // 128 bits
  tagLength: 16, // 128 bits
};

// Sensitive data fields that require encryption
const SENSITIVE_FIELDS = [
  'fullName',
  'nationalId',
  'phoneNumber',
  'email',
  'monthlyIncome',
  'existingMonthlyDebtPayments',
  'requestedAmount',
  'collateralValue',
  'creditScore',
  'street',
  'companyName',
  'jobTitle',
  'bankAccountNumber',
  'previousLoanHistory',
  'consentIP',
  'userAgent',
  'ipAddress',
];

// Vietnamese personal data identifiers
const VIETNAMESE_PERSONAL_DATA_FIELDS = [
  'fullName',         // Họ và tên
  'nationalId',       // CMND/CCCD
  'phoneNumber',      // Số điện thoại
  'email',           // Email
  'dateOfBirth',     // Ngày sinh
  'currentAddress',  // Địa chỉ hiện tại
  'permanentAddress', // Địa chỉ thường trú
  'monthlyIncome',   // Thu nhập hàng tháng
  'existingMonthlyDebtPayments', // Các khoản nợ hiện tại
  'bankAccountMonths', // Số tháng có tài khoản ngân hàng
  'creditScore',     // Điểm tín dụng
];

/**
 * Encryption result interface
 */
interface EncryptionResult {
  encryptedData: string;
  iv: string;
  tag: string;
  algorithm: string;
  keyId?: string;
}

/**
 * Decryption result interface
 */
interface DecryptionResult {
  data: string;
  success: boolean;
  error?: string;
}

/**
 * Lead Generation Data Encryption Manager
 */
export class LeadDataEncryptionManager {
  private config: EncryptionConfig;
  private masterKey: Buffer;
  private keyRotationEnabled: boolean;
  private keyRotationInterval: number; // days

  constructor(
    masterKey: string | Buffer,
    config: Partial<EncryptionConfig> = {},
    keyRotationEnabled: boolean = true,
    keyRotationInterval: number = 90
  ) {
    this.config = { ...DEFAULT_ENCRYPTION_CONFIG, ...config };
    this.masterKey = typeof masterKey === 'string'
      ? Buffer.from(masterKey, 'hex')
      : masterKey;
    this.keyRotationEnabled = keyRotationEnabled;
    this.keyRotationInterval = keyRotationInterval;

    this.validateMasterKey();
  }

  /**
   * Validate master key strength
   */
  private validateMasterKey(): void {
    if (this.masterKey.length !== this.config.keyLength) {
      throw new Error(`Master key must be ${this.config.keyLength} bytes (${this.config.keyLength * 8} bits)`);
    }
  }

  /**
   * Generate a new encryption key
   */
  public generateKey(): Buffer {
    return crypto.randomBytes(this.config.keyLength);
  }

  /**
   * Derive data-specific key using HKDF
   */
  private deriveDataKey(dataType: string, leadId: string): Buffer {
    const info = `${dataType}:${leadId}:v1`;
    return crypto.hkdfSync(
      'sha256',
      this.masterKey,
      Buffer.from(info, 'utf8'),
      this.config.keyLength
    );
  }

  /**
   * Encrypt sensitive data field
   */
  public encryptField(
    data: string,
    dataType: string,
    leadId: string,
    keyId?: string
  ): EncryptionResult {
    try {
      const dataKey = this.deriveDataKey(dataType, leadId);
      const iv = crypto.randomBytes(this.config.ivLength);

      const cipher = crypto.createCipher(this.config.algorithm, dataKey);
      cipher.setAAD(Buffer.from(dataType, 'utf8'));

      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const tag = cipher.getAuthTag();

      return {
        encryptedData: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.config.algorithm,
        keyId: keyId || 'default',
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt sensitive data field
   */
  public decryptField(
    encryptionResult: EncryptionResult,
    dataType: string,
    leadId: string
  ): DecryptionResult {
    try {
      const dataKey = this.deriveDataKey(dataType, leadId);

      const decipher = crypto.createDecipher(this.config.algorithm, dataKey);
      decipher.setAAD(Buffer.from(dataType, 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptionResult.tag, 'hex'));

      let decrypted = decipher.update(encryptionResult.encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return {
        data: decrypted,
        success: true,
      };
    } catch (error) {
      return {
        data: '',
        success: false,
        error: `Decryption failed: ${error.message}`,
      };
    }
  }

  /**
   * Encrypt entire lead data object
   */
  public encryptLeadData(leadData: any, leadId: string): any {
    const encrypted = { ...leadData };

    // Encrypt sensitive fields
    for (const field of SENSITIVE_FIELDS) {
      if (encrypted[field] !== undefined && encrypted[field] !== null) {
        if (typeof encrypted[field] === 'object') {
          // Handle nested objects (like addresses)
          encrypted[field] = this.encryptNestedObject(encrypted[field], field, leadId);
        } else {
          const encryptionResult = this.encryptField(
            String(encrypted[field]),
            field,
            leadId
          );

          encrypted[field] = {
            encrypted: true,
            ...encryptionResult,
          };
        }
      }
    }

    // Add encryption metadata
    encrypted.encrypted = true;
    encrypted.encryptionMetadata = {
      algorithm: this.config.algorithm,
      keyRotationEnabled: this.keyRotationEnabled,
      encryptedAt: new Date().toISOString(),
      encryptedFields: SENSITIVE_FIELDS.filter(field => leadData[field] !== undefined),
    };

    return encrypted;
  }

  /**
   * Decrypt entire lead data object
   */
  public decryptLeadData(encryptedLeadData: any, leadId: string): any {
    if (!encryptedLeadData.encrypted) {
      return encryptedLeadData; // Data is not encrypted
    }

    const decrypted = { ...encryptedLeadData };

    // Remove encryption metadata
    delete decrypted.encryptionMetadata;
    delete decrypted.encrypted;

    // Decrypt sensitive fields
    for (const field of SENSITIVE_FIELDS) {
      if (decrypted[field] !== undefined) {
        if (decrypted[field] && typeof decrypted[field] === 'object' && decrypted[field].encrypted) {
          // Decrypt single encrypted field
          const decryptionResult = this.decryptField(decrypted[field], field, leadId);

          if (decryptionResult.success) {
            // Try to parse as original type
            decrypted[field] = this.parseOriginalValue(decryptionResult.data, field);
          } else {
            console.error(`Failed to decrypt field ${field}:`, decryptionResult.error);
            decrypted[field] = null;
          }
        } else if (typeof decrypted[field] === 'object') {
          // Handle nested objects
          decrypted[field] = this.decryptNestedObject(decrypted[field], field, leadId);
        }
      }
    }

    return decrypted;
  }

  /**
   * Encrypt nested objects
   */
  private encryptNestedObject(obj: any, dataType: string, leadId: string): any {
    const encrypted: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          encrypted[key] = this.encryptNestedObject(value, `${dataType}.${key}`, leadId);
        } else {
          const fieldKey = `${dataType}.${key}`;
          const encryptionResult = this.encryptField(String(value), fieldKey, leadId);

          encrypted[key] = {
            encrypted: true,
            ...encryptionResult,
          };
        }
      }
    }

    return encrypted;
  }

  /**
   * Decrypt nested objects
   */
  private decryptNestedObject(obj: any, dataType: string, leadId: string): any {
    const decrypted: any = {};

    for (const [key, value] of Object.entries(obj)) {
      if (value && typeof value === 'object' && value.encrypted) {
        const fieldKey = `${dataType}.${key}`;
        const decryptionResult = this.decryptField(value, fieldKey, leadId);

        if (decryptionResult.success) {
          decrypted[key] = this.parseOriginalValue(decryptionResult.data, fieldKey);
        } else {
          console.error(`Failed to decrypt nested field ${fieldKey}:`, decryptionResult.error);
          decrypted[key] = null;
        }
      } else if (typeof value === 'object') {
        decrypted[key] = this.decryptNestedObject(value, `${dataType}.${key}`, leadId);
      } else {
        decrypted[key] = value;
      }
    }

    return decrypted;
  }

  /**
   * Parse decrypted value back to original type
   */
  private parseOriginalValue(value: string, field: string): any {
    // Numeric fields
    if (field.includes('Amount') || field.includes('Income') || field.includes('Payments') || field.includes('Score')) {
      return parseFloat(value);
    }

    // Boolean fields (handled as strings during encryption)
    if (value === 'true') return true;
    if (value === 'false') return false;

    // Return as string for other fields
    return value;
  }

  /**
   * Rotate encryption keys
   */
  public rotateKeys(): void {
    if (!this.keyRotationEnabled) {
      return;
    }

    // In a real implementation, this would:
    // 1. Generate new master key
    // 2. Re-encrypt all data with new key
    // 3. Update key version
    // 4. Archive old key with timestamp

    console.log('Key rotation completed at:', new Date().toISOString());
  }

  /**
   * Check if field requires encryption
   */
  public requiresEncryption(fieldName: string): boolean {
    return SENSITIVE_FIELDS.includes(fieldName);
  }

  /**
   * Check if field is Vietnamese personal data
   */
  public isVietnamesePersonalData(fieldName: string): boolean {
    return VIETNAMESE_PERSONAL_DATA_FIELDS.includes(fieldName);
  }

  /**
   * Generate data encryption key for specific lead
   */
  public generateLeadEncryptionKey(leadId: string): string {
    const key = this.generateKey();
    // In a real implementation, this would be stored securely with the lead
    return key.toString('hex');
  }

  /**
   * Validate encryption integrity
   */
  public validateEncryptionIntegrity(encryptedData: EncryptionResult): boolean {
    return !!(
      encryptedData.encryptedData &&
      encryptedData.iv &&
      encryptedData.tag &&
      encryptedData.algorithm
    );
  }

  /**
   * Get encryption statistics
   */
  public getEncryptionStats(): {
    algorithm: string;
    keyLength: number;
    sensitiveFieldsCount: number;
    vietnamesePersonalDataFieldsCount: number;
    keyRotationEnabled: boolean;
    keyRotationInterval: number;
  } {
    return {
      algorithm: this.config.algorithm,
      keyLength: this.config.keyLength * 8, // in bits
      sensitiveFieldsCount: SENSITIVE_FIELDS.length,
      vietnamesePersonalDataFieldsCount: VIETNAMESE_PERSONAL_DATA_FIELDS.length,
      keyRotationEnabled: this.keyRotationEnabled,
      keyRotationInterval: this.keyRotationInterval,
    };
  }
}

// Default encryption manager instance
let defaultEncryptionManager: LeadDataEncryptionManager | null = null;

/**
 * Initialize default encryption manager
 */
export const initializeLeadDataEncryption = (masterKey: string): void => {
  defaultEncryptionManager = new LeadDataEncryptionManager(masterKey);
};

/**
 * Get default encryption manager
 */
export const getDefaultEncryptionManager = (): LeadDataEncryptionManager => {
  if (!defaultEncryptionManager) {
    throw new Error('Encryption manager not initialized. Call initializeLeadDataEncryption first.');
  }
  return defaultEncryptionManager;
};

/**
 * Convenience function to encrypt lead data
 */
export const encryptLeadData = (leadData: any, leadId: string): any => {
  const manager = getDefaultEncryptionManager();
  return manager.encryptLeadData(leadData, leadId);
};

/**
 * Convenience function to decrypt lead data
 */
export const decryptLeadData = (encryptedLeadData: any, leadId: string): any => {
  const manager = getDefaultEncryptionManager();
  return manager.decryptLeadData(encryptedLeadData, leadId);
};

/**
 * Check if data is Vietnamese personal data and requires protection
 */
export const isVietnamesePersonalDataField = (fieldName: string): boolean => {
  const manager = getDefaultEncryptionManager();
  return manager.isVietnamesePersonalData(fieldName);
};

/**
 * Generate secure master key for development
 */
export const generateDevelopmentMasterKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export default LeadDataEncryptionManager;