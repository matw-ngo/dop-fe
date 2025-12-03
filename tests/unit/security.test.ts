/**
 * Security Tests
 * Tests for security fixes and validation
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { sanitizeApplicationData, sanitizeVietnameseName, sanitizeEmail, sanitizeVietnamesePhone, sanitizeVietnameseID, validateFileUpload } from '@/lib/utils/sanitization';
import { tokenValidation, securityUtils } from '@/lib/auth/secure-tokens';
import { createAccessibleFieldProps, formAccessibility } from '@/lib/utils/accessibility';

describe('Input Sanitization', () => {
  describe('sanitizeApplicationData', () => {
    it('should sanitize malicious HTML scripts', () => {
      const maliciousData = {
        fullName: '<script>alert("xss")</script>John Doe',
        email: 'test@example.com',
        phoneNumber: '0912345678',
      };

      const sanitized = sanitizeApplicationData(maliciousData);

      expect(sanitized.fullName).toBe('John Doe');
      expect(sanitized.email).toBe('test@example.com');
      expect(sanitized.phoneNumber).toBe('0912345678');
    });

    it('should sanitize JavaScript injection attempts', () => {
      const maliciousData = {
        fullName: 'javascript:alert("xss")John Doe',
        description: 'onclick="alert(\'xss\')"Click me',
      };

      const sanitized = sanitizeApplicationData(maliciousData);

      expect(sanitized.fullName).toBe('John Doe');
      expect(sanitized.description).toBe('Click me');
    });

    it('should preserve valid Vietnamese characters', () => {
      const validData = {
        fullName: 'Nguyễn Văn An',
        address: 'Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh',
      };

      const sanitized = sanitizeApplicationData(validData);

      expect(sanitized.fullName).toBe('Nguyễn Văn An');
      expect(sanitized.address).toBe('Đường Trần Hưng Đạo, Quận 1, TP. Hồ Chí Minh');
    });
  });

  describe('sanitizeVietnameseName', () => {
    it('should accept valid Vietnamese names', () => {
      const validNames = [
        'Nguyễn Văn An',
        'Trần Thị Bình',
        'Lê Hoàng Long',
        'Phạm Thị Mai',
      ];

      validNames.forEach(name => {
        expect(() => sanitizeVietnameseName(name)).not.toThrow();
        expect(sanitizeVietnameseName(name)).toBe(name);
      });
    });

    it('should reject names with special characters', () => {
      const invalidNames = [
        'John<script>alert("xss")</script>',
        'Admin@123',
        'User#123',
        'Test123!',
      ];

      invalidNames.forEach(name => {
        expect(() => sanitizeVietnameseName(name)).toThrow();
      });
    });

    it('should enforce length constraints', () => {
      expect(() => sanitizeVietnameseName('')).toThrow();
      expect(() => sanitizeVietnameseName('A')).toThrow();

      const longName = 'A'.repeat(101);
      expect(() => sanitizeVietnameseName(longName)).toThrow();
    });
  });

  describe('sanitizeEmail', () => {
    it('should accept valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.email@domain.co.uk',
        'user+tag@example.org',
        'user123@domain.vn',
      ];

      validEmails.forEach(email => {
        expect(() => sanitizeEmail(email)).not.toThrow();
        const result = sanitizeEmail(email);
        expect(result).toBe(email.toLowerCase().trim());
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        'user@.com',
        'javascript:alert("xss")@example.com',
      ];

      invalidEmails.forEach(email => {
        expect(() => sanitizeEmail(email)).toThrow();
      });
    });
  });

  describe('sanitizeVietnamesePhone', () => {
    it('should accept valid Vietnamese phone numbers', () => {
      const validPhones = [
        '0912345678',
        '0987654321',
        '0321234567',
        '0567890123',
        '0701234567',
        '0891234567',
      ];

      validPhones.forEach(phone => {
        expect(() => sanitizeVietnamesePhone(phone)).not.toThrow();
        const result = sanitizeVietnamesePhone(phone);
        expect(result).toBe(phone);
      });
    });

    it('should reject invalid phone numbers', () => {
      const invalidPhones = [
        '12345678',
        '0112345678',
        '091234567',
        '09123456789',
        'abcdefghij',
        '0912-345-678',
      ];

      invalidPhones.forEach(phone => {
        expect(() => sanitizeVietnamesePhone(phone)).toThrow();
      });
    });
  });

  describe('sanitizeVietnameseID', () => {
    it('should accept valid 12-digit ID numbers', () => {
      const validIds = [
        '001234567890',
        '098765432101',
        '123456789012',
      ];

      validIds.forEach(id => {
        expect(() => sanitizeVietnameseID(id)).not.toThrow();
        const result = sanitizeVietnameseID(id);
        expect(result).toBe(id);
      });
    });

    it('should reject invalid ID numbers', () => {
      const invalidIds = [
        '12345678901', // 11 digits
        '1234567890123', // 13 digits
        'abcdefghijk',
        '123-456-789-012',
        '',
      ];

      invalidIds.forEach(id => {
        expect(() => sanitizeVietnameseID(id)).toThrow();
      });
    });
  });
});

describe('File Upload Validation', () => {
  it('should accept valid file types and sizes', () => {
    const validFile = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
      size: 1024 * 1024, // 1MB
    });

    const result = validateFileUpload(validFile);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject files with invalid types', () => {
    const invalidFile = new File(['content'], 'script.exe', {
      type: 'application/x-executable',
      size: 1024,
    });

    const result = validateFileUpload(invalidFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid file type');
  });

  it('should reject files that are too large', () => {
    const largeFile = new File(['content'], 'large.pdf', {
      type: 'application/pdf',
      size: 15 * 1024 * 1024, // 15MB
    });

    const result = validateFileUpload(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('File size exceeds');
  });
});

describe('Token Validation', () => {
  it('should validate JWT token format', () => {
    const validJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

    expect(tokenValidation.validateTokenFormat(validJWT)).toBe(true);

    const invalidJWT = 'invalid.token.format';
    expect(tokenValidation.validateTokenFormat(invalidJWT)).toBe(false);
  });

  it('should extract and validate token payload', () => {
    const tokenWithPayload = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDM2MDAsInJvbGVzIjpbInVzZXIiXX0.signature';

    const payload = tokenValidation.getTokenPayload(tokenWithPayload);
    expect(payload).toHaveProperty('sub', 'user123');
    expect(payload).toHaveProperty('iat');
    expect(payload).toHaveProperty('exp');

    expect(tokenValidation.validateTokenClaims(tokenWithPayload)).toBe(true);
  });
});

describe('Security Utilities', () => {
  it('should generate valid CSRF tokens', () => {
    const token1 = securityUtils.generateCSRFToken();
    const token2 = securityUtils.generateCSRFToken();

    expect(token1).not.toBe(token2);
    expect(token1).toMatch(/^[a-f0-9]{64}$/i); // 32 bytes = 64 hex chars
  });

  it('should sanitize user input properly', () => {
    const maliciousInput = '<script>alert("xss")</script>javascript:void(0)onclick="alert(\'xss\')"';
    const sanitized = securityUtils.sanitizeInput(maliciousInput);

    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).not.toContain('onclick=');
  });

  it('should validate Vietnamese phone numbers', () => {
    expect(securityUtils.validateVietnamesePhone('0912345678')).toBe(true);
    expect(securityUtils.validateVietnamesePhone('0321234567')).toBe(true);
    expect(securityUtils.validateVietnamesePhone('12345678')).toBe(false);
    expect(securityUtils.validateVietnamesePhone('091234567')).toBe(false);
  });
});

describe('Accessibility Functions', () => {
  it('should create accessible field props', () => {
    const props = createAccessibleFieldProps(
      'test-field',
      'Test Field Label',
      'This field is required',
      'This is a helpful description',
      true
    );

    expect(props.id).toBe('test-field');
    expect(props['aria-label']).toBe('Test Field Label');
    expect(props['aria-required']).toBe(true);
    expect(props['aria-invalid']).toBe(true);
    expect(props['aria-describedby']).toBeDefined();
  });

  it('should create form validation props', () => {
    const validProps = formAccessibility.createValidationProps(true);
    const invalidProps = formAccessibility.createValidationProps(false, 'Field is required');

    expect(validProps['aria-invalid']).toBe(false);
    expect(invalidProps['aria-invalid']).toBe(true);
    expect(invalidProps['aria-errormessage']).toBeDefined();
  });

  it('should create progress indicator props', () => {
    const props = formAccessibility.createProgressProps(3, 10, 'Application Progress');

    expect(props.role).toBe('progressbar');
    expect(props['aria-valuenow']).toBe(3);
    expect(props['aria-valuemin']).toBe(0);
    expect(props['aria-valuemax']).toBe(10);
    expect(props['aria-valuetext']).toBe('30% complete');
    expect(props['aria-label']).toBe('Application Progress');
  });
});

describe('Security Integration Tests', () => {
  it('should handle complete form data sanitization', () => {
    const maliciousFormData = {
      personalInfo: {
        fullName: '<script>alert("xss")</script>Nguyễn Văn A',
        email: 'test+javascript@example.com',
        phoneNumber: '0912345678',
        nationalId: '001234567890',
      },
      loanDetails: {
        requestedAmount: 10000000,
        loanTerm: 12,
        loanPurpose: 'javascript:void(0)Personal loan',
      },
      address: {
        street: '<img src=x onerror=alert(1)>123 Main St',
        city: 'Hồ Chí Minh',
      },
      documents: [
        {
          type: 'identity-proof',
          filename: 'document.exe',
        },
      ],
    };

    const sanitized = sanitizeApplicationData(maliciousFormData);

    // Check that HTML/JS is removed
    expect(sanitized.personalInfo.fullName).toBe('Nguyễn Văn A');
    expect(sanitized.loanDetails.loanPurpose).toBe('Personal loan');
    expect(sanitized.address.street).toBe('123 Main St');

    // Check that valid data is preserved
    expect(sanitized.personalInfo.email).toBe('test+javascript@example.com');
    expect(sanitized.personalInfo.phoneNumber).toBe('0912345678');
    expect(sanitized.personalInfo.nationalId).toBe('001234567890');
    expect(sanitized.loanDetails.requestedAmount).toBe(10000000);
    expect(sanitized.loanDetails.loanTerm).toBe(12);
    expect(sanitized.address.city).toBe('Hồ Chí Minh');
  });

  it('should prevent XSS through multiple attack vectors', () => {
    const xssPayloads = [
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      '<svg onload=alert("xss")>',
      '"><script>alert("xss")</script>',
      '"><img src=x onerror=alert("xss")>',
      '<iframe src="javascript:alert(\'xss\')"></iframe>',
      '<link rel="import" href="javascript:alert(\'xss\')">',
    ];

    xssPayloads.forEach(payload => {
      const testData = { name: payload };
      const sanitized = sanitizeApplicationData(testData);

      // Ensure no script tags or javascript protocols remain
      expect(sanitized.name).not.toContain('<script>');
      expect(sanitized.name).not.toContain('javascript:');
      expect(sanitized.name).not.toContain('onerror=');
      expect(sanitized.name).not.toContain('onload=');
    });
  });
});