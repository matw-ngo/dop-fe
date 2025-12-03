/**
 * Enhanced File Validation Security Module
 * Provides comprehensive file validation with magic number detection,
 * malicious file scanning, and security checks
 */

import { VietnameseDocumentType } from "@/lib/ekyc/document-types";

// Magic numbers for file type validation
export const FILE_MAGIC_NUMBERS = {
  // Image formats
  'image/jpeg': [
    [0xFF, 0xD8, 0xFF, 0xE0], // JPEG SOI with APP0
    [0xFF, 0xD8, 0xFF, 0xE1], // JPEG SOI with APP1
    [0xFF, 0xD8, 0xFF, 0xE8], // JPEG SOI with APP8
  ],
  'image/png': [
    [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A], // PNG signature
  ],
  'image/webp': [
    [0x52, 0x49, 0x46, 0x46], // RIFF
    [0x57, 0x45, 0x42, 0x50], // WEBP
  ],
  'image/bmp': [
    [0x42, 0x4D], // BM
  ],
  'image/tiff': [
    [0x49, 0x49, 0x2A, 0x00], // TIFF little-endian
    [0x4D, 0x4D, 0x00, 0x2A], // TIFF big-endian
  ],

  // Document formats
  'application/pdf': [
    [0x25, 0x50, 0x44, 0x46, 0x2D], // %PDF-
  ],

  // Archive formats (dangerous)
  'application/zip': [
    [0x50, 0x4B, 0x03, 0x04], // ZIP local file header
    [0x50, 0x4B, 0x05, 0x06], // ZIP central directory
    [0x50, 0x4B, 0x07, 0x08], // ZIP data descriptor
  ],
  'application/x-rar-compressed': [
    [0x52, 0x61, 0x72, 0x21, 0x1A, 0x07, 0x00], // RAR signature
  ],
  'application/x-7z-compressed': [
    [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C], // 7z signature
  ],

  // Executable formats (dangerous)
  'application/x-msdownload': [
    [0x4D, 0x5A], // MZ header
  ],
  'application/x-elf': [
    [0x7F, 0x45, 0x4C, 0x46], // ELF header
  ],
  'application/x-mach-binary': [
    [0xFE, 0xED, 0xFA, 0xCE], // Mach-O binary
    [0xFE, 0xED, 0xFA, 0xCF], // Mach-O binary (64-bit)
    [0xCE, 0xFA, 0xED, 0xFE], // Mach-O binary (reverse)
    [0xCF, 0xFA, 0xED, 0xFE], // Mach-O binary (reverse, 64-bit)
  ],
} as const;

// Dangerous file signatures to block
export const DANGEROUS_SIGNATURES = [
  // Windows executables
  [0x4D, 0x5A], // MZ
  // ELF executables
  [0x7F, 0x45, 0x4C, 0x46],
  // Mach-O executables
  [0xFE, 0xED, 0xFA, 0xCE],
  [0xFE, 0xED, 0xFA, 0xCF],
  [0xCE, 0xFA, 0xED, 0xFE],
  [0xCF, 0xFA, 0xED, 0xFE],
  // Scripts
  [0x23, 0x21], // Shebang #!
  // Java class files
  [0xCA, 0xFE, 0xBA, 0xBE],
  // Adobe Flash
  [0x46, 0x57, 0x53], // FWS
  [0x43, 0x57, 0x53], // CWS (compressed)
  [0x5A, 0x57, 0x53], // ZWS (compressed)
] as const;

// Malicious patterns to detect
export const MALICIOUS_PATTERNS = [
  // Base64 encoded shell patterns
  /base64_decode\s*\(/i,
  /eval\s*\(/i,
  /exec\s*\(/i,
  /system\s*\(/i,
  /passthru\s*\(/i,
  /shell_exec\s*\(/i,

  // JavaScript dangerous functions
  /eval\s*\(/gi,
  /Function\s*\(/gi,
  /setTimeout\s*\(/gi,
  /setInterval\s*\(/gi,
  /document\.write\s*\(/gi,
  /innerHTML\s*\s*=/gi,
  /outerHTML\s*\s*=/gi,

  // PHP dangerous functions
  /<\?php/i,
  /\$_POST\s*\[/i,
  /\$_GET\s*\[/i,
  /\$_REQUEST\s*\[/i,
  /file_get_contents\s*\(/i,
  /file_put_contents\s*\(/i,
  /fopen\s*\(/i,

  // SQL injection patterns
  /union\s+select/i,
  /drop\s+table/i,
  /delete\s+from/i,
  /insert\s+into/i,
  /update\s+.+\s+set/i,

  // XSS patterns
  /javascript:/i,
  /onload\s*=/i,
  /onerror\s*=/i,
  /onclick\s*=/i,

  // Path traversal
  /\.\.\//,
  /\.\.\\/,

  // Command injection
  /;\s*rm\s+/i,
  /;\s*cat\s+/i,
  /;\s*ls\s+/i,
  /;\s*dir\s+/i,
] as const;

// Configuration
export const FILE_VALIDATION_CONFIG = {
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_DIMENSION: 8192, // 8K pixels
  MIN_IMAGE_DIMENSION: 100, // 100 pixels
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/tiff',
  ],
  BLOCKED_EXTENSIONS: [
    '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
    '.app', '.deb', '.rpm', '.dmg', '.pkg', '.msi', '.msm', '.msp',
    '.php', '.php3', '.php4', '.php5', '.phtml', '.phps', '.php-fpm',
    '.asp', '.aspx', '.asa', '.asax', '.ascx', '.ashx', '.asmx', '.axd',
    '.jsp', '.jspx', '.jsw', '.jsv', '.jspf', '.wss', '.do', '.action',
    '.pl', '.py', '.rb', '.cgi', '.sh', '.ps1', '.psm1', '.psd1',
    '.reg', '.vb', '.vbscript', '.ws', '.wsf', '.wsc', '.manifest',
    '.scf', '.lnk', '.url', '.drv', '.sys', '.cpl', '.msc',
  ],
  SCAN_BUFFER_SIZE: 8192, // 8KB for malicious content scanning
  EXIF_TAGS_TO_STRIP: [
    // GPS and location data
    'GPSLatitude', 'GPSLongitude', 'GPSAltitude', 'GPSLatitudeRef', 'GPSLongitudeRef',
    'GPSAltitudeRef', 'GPSTimeStamp', 'GPSDateStamp', 'GPSPosition',
    // Camera and device information
    'Make', 'Model', 'Software', 'DateTimeOriginal', 'DateTimeDigitized',
    'SerialNumber', 'LensModel', 'LensSerialNumber',
    // User comments
    'UserComment', 'ImageDescription', 'Copyright',
  ],
} as const;

// Types for file validation
export interface FileValidationResult {
  isValid: boolean;
  securityScore: number; // 0-100
  confidence: number; // 0-1
  fileType: string | null;
  detectedMime: string | null;
  actualExtension: string | null;
  warnings: string[];
  errors: string[];
  securityFlags: string[];
  metadata: {
    size: number;
    dimensions?: { width: number; height: number };
    hasExif: boolean;
    exifTags: string[];
    suspiciousContent: boolean;
    maliciousPatterns: string[];
  };
  vietnameseCompliance: {
    personalDataDetected: boolean;
    locationDataStripped: boolean;
    metadataSanitized: boolean;
  };
}

export interface SecurityMetrics {
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendedActions: string[];
  complianceScore: number; // 0-100
}

/**
 * Enhanced File Validator Class
 */
export class SecureFileValidator {
  private validationCache = new Map<string, FileValidationResult>();

  /**
   * Comprehensive file validation with security scanning
   */
  async validateFile(
    file: File,
    documentType?: VietnameseDocumentType
  ): Promise<FileValidationResult> {
    // Generate cache key
    const cacheKey = `${file.name}_${file.size}_${file.lastModified}`;

    // Check cache first
    if (this.validationCache.has(cacheKey)) {
      const cached = this.validationCache.get(cacheKey)!;
      // Only return cached if recent (< 1 minute)
      if (Date.now() - file.lastModified < 60000) {
        return cached;
      }
    }

    const result: FileValidationResult = {
      isValid: false,
      securityScore: 0,
      confidence: 0,
      fileType: null,
      detectedMime: null,
      actualExtension: null,
      warnings: [],
      errors: [],
      securityFlags: [],
      metadata: {
        size: file.size,
        hasExif: false,
        exifTags: [],
        suspiciousContent: false,
        maliciousPatterns: [],
      },
      vietnameseCompliance: {
        personalDataDetected: false,
        locationDataStripped: false,
        metadataSanitized: false,
      },
    };

    try {
      // Step 1: Basic file validation
      await this.validateBasicFileProperties(file, result);

      // Step 2: Magic number validation
      await this.validateFileSignature(file, result);

      // Step 3: Malicious content scanning
      await this.scanForMaliciousContent(file, result);

      // Step 4: Image-specific validation
      if (file.type.startsWith('image/')) {
        await this.validateImageFile(file, result);
      }

      // Step 5: Document type specific validation
      if (documentType) {
        await this.validateForDocumentType(file, documentType, result);
      }

      // Step 6: Vietnamese compliance checks
      await this.checkVietnameseCompliance(file, result);

      // Step 7: Calculate security score and final validation
      this.calculateSecurityScore(result);

      // Cache the result
      this.validationCache.set(cacheKey, result);

      return result;

    } catch (error) {
      result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.isValid = false;
      result.securityScore = 0;
      return result;
    }
  }

  /**
   * Basic file property validation
   */
  private async validateBasicFileProperties(file: File, result: FileValidationResult): Promise<void> {
    // File size validation
    if (file.size > FILE_VALIDATION_CONFIG.MAX_FILE_SIZE_BYTES) {
      result.errors.push(
        `File size ${this.formatFileSize(file.size)} exceeds maximum allowed size of ${this.formatFileSize(FILE_VALIDATION_CONFIG.MAX_FILE_SIZE_BYTES)}`
      );
    } else if (file.size === 0) {
      result.errors.push('File is empty');
    }

    // File name validation
    const fileName = file.name.toLowerCase();

    // Check for dangerous extensions
    const hasBlockedExtension = FILE_VALIDATION_CONFIG.BLOCKED_EXTENSIONS.some(ext =>
      fileName.endsWith(ext)
    );

    if (hasBlockedExtension) {
      result.errors.push('File extension is not allowed for security reasons');
      result.securityFlags.push('dangerous_extension');
    }

    // Check for suspicious characters in filename
    const suspiciousChars = /[<>:"|?*\x00-\x1f]/;
    if (suspiciousChars.test(file.name)) {
      result.warnings.push('Filename contains suspicious characters');
      result.securityFlags.push('suspicious_filename');
    }

    // Check for double extensions (e.g., image.jpg.exe)
    const parts = fileName.split('.');
    if (parts.length > 2) {
      const lastTwo = parts.slice(-2).join('.');
      if (FILE_VALIDATION_CONFIG.BLOCKED_EXTENSIONS.some(ext => lastTwo.endsWith(ext))) {
        result.errors.push('File appears to have a double extension to hide its true type');
        result.securityFlags.push('double_extension');
      }
    }

    // MIME type validation
    if (!FILE_VALIDATION_CONFIG.ALLOWED_MIME_TYPES.includes(file.type)) {
      result.errors.push(`MIME type ${file.type} is not allowed`);
      result.securityFlags.push('blocked_mime_type');
    }

    result.detectedMime = file.type;
  }

  /**
   * Magic number / file signature validation
   */
  private async validateFileSignature(file: File, result: FileValidationResult): Promise<void> {
    const buffer = await this.readFileHeader(file, 16);
    const bytes = new Uint8Array(buffer);

    // Check for dangerous signatures first
    for (const signature of DANGEROUS_SIGNATURES) {
      if (this.matchesSignature(bytes, signature)) {
        result.errors.push('File contains dangerous executable signature');
        result.securityFlags.push('dangerous_signature');
        return;
      }
    }

    // Detect actual file type
    let detectedType = null;
    for (const [mimeType, signatures] of Object.entries(FILE_MAGIC_NUMBERS)) {
      for (const signature of signatures) {
        if (this.matchesSignature(bytes, signature)) {
          detectedType = mimeType;
          break;
        }
      }
      if (detectedType) break;
    }

    result.fileType = detectedType;

    // Check if detected type matches declared type
    if (detectedType && file.type && detectedType !== file.type) {
      result.warnings.push(`Declared file type ${file.type} doesn't match detected type ${detectedType}`);
      result.securityFlags.push('mime_type_mismatch');
    }

    // Extract actual extension from filename
    const extension = file.name.split('.').pop()?.toLowerCase();
    result.actualExtension = extension ? `.${extension}` : null;

    // Check extension vs signature mismatch
    if (detectedType && extension) {
      const expectedMimes = Object.entries(FILE_MAGIC_NUMBERS)
        .filter(([, signatures]) =>
          signatures.some(sig => this.matchesSignature(bytes, sig))
        )
        .map(([mime]) => mime);

      if (expectedMimes.length > 0) {
        const expectedExtensions = expectedMimes.map(mime => {
          switch (mime) {
            case 'image/jpeg': return '.jpg';
            case 'image/png': return '.png';
            case 'image/webp': return '.webp';
            case 'image/bmp': return '.bmp';
            case 'image/tiff': return '.tiff';
            case 'application/pdf': return '.pdf';
            default: return null;
          }
        }).filter(Boolean);

        if (!expectedExtensions.includes(`.${extension}`)) {
          result.warnings.push(`File extension ${extension} doesn't match detected file type`);
          result.securityFlags.push('extension_mismatch');
        }
      }
    }
  }

  /**
   * Scan for malicious content patterns
   */
  private async scanForMaliciousContent(file: File, result: FileValidationResult): Promise<void> {
    const buffer = await this.readFileBuffer(file, FILE_VALIDATION_CONFIG.SCAN_BUFFER_SIZE);
    const content = this.arrayBufferToText(buffer);

    // Check for malicious patterns
    const foundPatterns: string[] = [];

    for (const pattern of MALICIOUS_PATTERNS) {
      if (pattern.test(content)) {
        foundPatterns.push(pattern.source);
        result.securityFlags.push('malicious_pattern');
      }
    }

    if (foundPatterns.length > 0) {
      result.errors.push(`Suspicious content patterns detected: ${foundPatterns.join(', ')}`);
      result.metadata.suspiciousContent = true;
      result.metadata.maliciousPatterns = foundPatterns;
    }

    // Check for encoded content (Base64)
    const base64Pattern = /[A-Za-z0-9+/]{50,}={0,2}/g;
    const base64Matches = content.match(base64Pattern);
    if (base64Matches && base64Matches.length > 5) {
      result.warnings.push('File contains multiple base64 encoded strings');
      result.securityFlags.push('excessive_base64');
    }

    // Check for encrypted/compressed content in non-archive files
    if (file.type.startsWith('image/') && this.looksLikeEncryptedData(buffer)) {
      result.errors.push('Image file appears to contain encrypted or compressed data');
      result.securityFlags.push('encrypted_in_image');
    }
  }

  /**
   * Image-specific validation
   */
  private async validateImageFile(file: File, result: FileValidationResult): Promise<void> {
    try {
      // Create image element to validate
      const img = new Image();
      const url = URL.createObjectURL(file);

      await new Promise((resolve, reject) => {
        img.onload = () => {
          URL.revokeObjectURL(url);
          resolve(img);
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          reject(new Error('Invalid image file'));
        };
        img.src = url;
      });

      // Validate dimensions
      if (img.width < FILE_VALIDATION_CONFIG.MIN_IMAGE_DIMENSION ||
          img.height < FILE_VALIDATION_CONFIG.MIN_IMAGE_DIMENSION) {
        result.errors.push(
          `Image dimensions ${img.width}x${img.height} are too small (minimum ${FILE_VALIDATION_CONFIG.MIN_IMAGE_DIMENSION}x${FILE_VALIDATION_CONFIG.MIN_IMAGE_DIMENSION})`
        );
      }

      if (img.width > FILE_VALIDATION_CONFIG.MAX_IMAGE_DIMENSION ||
          img.height > FILE_VALIDATION_CONFIG.MAX_IMAGE_DIMENSION) {
        result.errors.push(
          `Image dimensions ${img.width}x${img.height} are too large (maximum ${FILE_VALIDATION_CONFIG.MAX_IMAGE_DIMENSION}x${FILE_VALIDATION_CONFIG.MAX_IMAGE_DIMENSION})`
        );
      }

      // Store dimensions
      result.metadata.dimensions = { width: img.width, height: img.height };

      // Check for EXIF data
      await this.checkExifData(file, result);

    } catch (error) {
      result.errors.push(`Image validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.securityFlags.push('invalid_image');
    }
  }

  /**
   * Check and process EXIF data
   */
  private async checkExifData(file: File, result: FileValidationResult): Promise<void> {
    try {
      // In a real implementation, you would use a library like exif-js
      // For now, we'll do basic checks

      const buffer = await this.readFileBuffer(file, 1024);
      const content = this.arrayBufferToText(buffer);

      // Look for EXIF markers
      const hasExif = content.includes('Exif') || content.includes('exif');
      result.metadata.hasExif = hasExif;

      if (hasExif) {
        // Check for GPS data
        const gpsPatterns = ['GPS', 'GPSLatitude', 'GPSLongitude', 'Location'];
        const hasGpsData = gpsPatterns.some(pattern => content.includes(pattern));

        if (hasGpsData) {
          result.warnings.push('Image contains GPS location data that will be stripped for privacy');
          result.vietnameseCompliance.locationDataStripped = false;
          result.securityFlags.push('gps_data_present');
        }

        // Extract some EXIF tags (simplified)
        const exifTags: string[] = [];
        FILE_VALIDATION_CONFIG.EXIF_TAGS_TO_STRIP.forEach(tag => {
          if (content.includes(tag)) {
            exifTags.push(tag);
          }
        });

        result.metadata.exifTags = exifTags;

        if (exifTags.length > 0) {
          result.warnings.push(`Image contains EXIF metadata that will be sanitized: ${exifTags.join(', ')}`);
        }
      }

    } catch (error) {
      // EXIF reading failed, but that's not critical
      result.warnings.push('Could not read EXIF data');
    }
  }

  /**
   * Validate for specific document type requirements
   */
  private async validateForDocumentType(
    file: File,
    documentType: VietnameseDocumentType,
    result: FileValidationResult
  ): Promise<void> {
    // Check if file type is supported for this document
    if (!documentType.ocrConfig.supportedFormats.includes(file.type)) {
      result.errors.push(
        `File type ${file.type} is not supported for ${documentType.nameVi}. Supported formats: ${documentType.ocrConfig.supportedFormats.join(', ')}`
      );
    }

    // Additional validations based on document type
    switch (documentType.code) {
      case 'CCCD_CHIP':
      case 'CCCD':
      case 'CMND12':
      case 'CMND9':
        // ID card specific validations
        if (result.metadata.dimensions) {
          const { width, height } = result.metadata.dimensions;
          const aspectRatio = width / height;

          // ID cards typically have aspect ratios around 1.586 (standard ID-1)
          if (aspectRatio < 1.2 || aspectRatio > 2.0) {
            result.warnings.push('Image aspect ratio is unusual for ID documents');
            result.securityFlags.push('unusual_aspect_ratio');
          }
        }
        break;

      case 'PASSPORT':
        // Passport specific validations
        if (result.metadata.dimensions) {
          const { width, height } = result.metadata.dimensions;
          const aspectRatio = width / height;

          // Passports typically have aspect ratios around 1.429
          if (aspectRatio < 1.2 || aspectRatio > 1.8) {
            result.warnings.push('Image aspect ratio is unusual for passport documents');
            result.securityFlags.push('unusual_aspect_ratio');
          }
        }
        break;
    }
  }

  /**
   * Vietnamese compliance checks
   */
  private async checkVietnameseCompliance(file: File, result: FileValidationResult): Promise<void> {
    // Check for personal data in filename
    const personalDataPatterns = [
      /cccd/i, /cmnd/i, /passport/i, /hochieu/i,
      /giay\stoi/gio/i, /can\scuoc/i,
      /\d{9,12}/, // ID numbers
    ];

    const fileName = file.name.toLowerCase();
    const hasPersonalData = personalDataPatterns.some(pattern => pattern.test(fileName));

    if (hasPersonalData) {
      result.warnings.push('Filename may contain personal identification information');
      result.vietnameseCompliance.personalDataDetected = true;
    }

    // Check if location data needs to be stripped
    if (result.metadata.hasExif && result.metadata.exifTags.some(tag =>
      tag.toLowerCase().includes('gps') || tag.toLowerCase().includes('location')
    )) {
      result.vietnameseCompliance.locationDataStripped = false;
    } else {
      result.vietnameseCompliance.locationDataStripped = true;
    }

    // Check metadata sanitization
    result.vietnameseCompliance.metadataSanitized =
      result.metadata.exifTags.length === 0 ||
      result.metadata.exifTags.every(tag =>
        !FILE_VALIDATION_CONFIG.EXIF_TAGS_TO_STRIP.includes(tag)
      );
  }

  /**
   * Calculate overall security score
   */
  private calculateSecurityScore(result: FileValidationResult): void {
    let score = 100;

    // Deduct points for errors
    result.errors.forEach(() => {
      score -= 25;
    });

    // Deduct points for warnings
    result.warnings.forEach(() => {
      score -= 10;
    });

    // Deduct points for security flags
    const flagPenalties: Record<string, number> = {
      'dangerous_signature': 50,
      'malicious_pattern': 40,
      'dangerous_extension': 35,
      'blocked_mime_type': 30,
      'mime_type_mismatch': 15,
      'extension_mismatch': 15,
      'double_extension': 20,
      'suspicious_filename': 10,
      'invalid_image': 25,
      'encrypted_in_image': 30,
      'excessive_base64': 15,
      'unusual_aspect_ratio': 5,
      'gps_data_present': 5,
    };

    result.securityFlags.forEach(flag => {
      score -= flagPenalties[flag] || 5;
    });

    result.securityScore = Math.max(0, Math.min(100, score));
    result.confidence = result.errors.length === 0 ? 0.9 : 0.5;
    result.isValid = result.errors.length === 0 && result.securityScore >= 70;
  }

  /**
   * Get security metrics for monitoring
   */
  getSecurityMetrics(result: FileValidationResult): SecurityMetrics {
    const riskFactors: string[] = [];
    const recommendedActions: string[] = [];

    // Analyze risk factors
    if (result.securityFlags.includes('dangerous_signature')) {
      riskFactors.push('Executable file detected');
      recommendedActions.push('Block file upload immediately');
    }

    if (result.securityFlags.includes('malicious_pattern')) {
      riskFactors.push('Malicious code patterns detected');
      recommendedActions.push('Quarantine file and run deep scan');
    }

    if (result.metadata.suspiciousContent) {
      riskFactors.push('Suspicious content present');
      recommendedActions.push('Manual review required');
    }

    if (!result.vietnameseCompliance.locationDataStripped) {
      riskFactors.push('Location metadata not stripped');
      recommendedActions.push('Strip GPS and location data');
    }

    if (!result.vietnameseCompliance.metadataSanitized) {
      riskFactors.push('Metadata not sanitized');
      recommendedActions.push('Remove EXIF and personal metadata');
    }

    // Determine threat level
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (result.securityScore < 30 || result.errors.length > 0) {
      threatLevel = 'critical';
    } else if (result.securityScore < 60 || result.securityFlags.length > 3) {
      threatLevel = 'high';
    } else if (result.securityScore < 80 || result.securityFlags.length > 0) {
      threatLevel = 'medium';
    }

    // Calculate compliance score
    let complianceScore = 100;
    if (!result.vietnameseCompliance.locationDataStripped) complianceScore -= 25;
    if (!result.vietnameseCompliance.metadataSanitized) complianceScore -= 25;
    if (result.vietnameseCompliance.personalDataDetected) complianceScore -= 15;

    return {
      threatLevel,
      riskFactors,
      recommendedActions,
      complianceScore: Math.max(0, complianceScore),
    };
  }

  // Utility methods

  private async readFileHeader(file: File, bytes: number): Promise<ArrayBuffer> {
    return file.slice(0, bytes).arrayBuffer();
  }

  private async readFileBuffer(file: File, bytes: number): Promise<ArrayBuffer> {
    return file.slice(0, bytes).arrayBuffer();
  }

  private matchesSignature(bytes: Uint8Array, signature: number[]): boolean {
    if (bytes.length < signature.length) return false;

    return signature.every((byte, index) => bytes[index] === byte);
  }

  private arrayBufferToText(buffer: ArrayBuffer): string {
    return new TextDecoder('utf-8', { fatal: false }).decode(buffer);
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }

  private looksLikeEncryptedData(buffer: ArrayBuffer): boolean {
    const view = new Uint8Array(buffer);
    let entropy = 0;
    const freq = new Array(256).fill(0);

    // Calculate byte frequency
    for (let i = 0; i < view.length; i++) {
      freq[view[i]]++;
    }

    // Calculate entropy
    for (let i = 0; i < 256; i++) {
      if (freq[i] > 0) {
        const p = freq[i] / view.length;
        entropy -= p * Math.log2(p);
      }
    }

    // High entropy suggests encryption or compression
    return entropy > 7.5; // Max entropy is 8 for random data
  }
}

// Singleton instance
const secureFileValidator = new SecureFileValidator();

export default secureFileValidator;