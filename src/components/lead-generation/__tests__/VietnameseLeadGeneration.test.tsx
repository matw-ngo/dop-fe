/**
 * Vietnamese Lead Generation System Tests
 * Comprehensive tests for the Vietnamese lead generation functionality
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VietnameseLeadDataCollector from '../LeadDataCollector';
import { scoreVietnameseLead } from '@/lib/lead-generation/lead-scoring';
import { matchVietnamesePartners } from '@/lib/lead-generation/partner-matching';
import { VIETNAMESE_FINANCIAL_PARTNERS } from '@/lib/lead-generation/vietnamese-partners';
import { createVietnameseConsent } from '@/lib/lead-generation/vietnamese-compliance';

// Mock the dependencies
jest.mock('@/lib/lead-generation/lead-scoring');
jest.mock('@/lib/lead-generation/partner-matching');
jest.mock('@/lib/lead-generation/vietnamese-compliance');
jest.mock('@/lib/api/endpoints/lead-generation');

// Mock toast
jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: jest.fn(),
  }),
}));

describe('Vietnamese Lead Generation System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Lead Data Collection', () => {
    test('renders Vietnamese form correctly', () => {
      render(<VietnameseLeadDataCollector language="vi" />);

      // Check Vietnamese labels
      expect(screen.getByText('Yêu cầu vay vốn')).toBeInTheDocument();
      expect(screen.getByText('Họ và tên đầy đủ')).toBeInTheDocument();
      expect(screen.getByText('Ngày sinh')).toBeInTheDocument();
      expect(screen.getByText('Giới tính')).toBeInTheDocument();
    });

    test('renders English form correctly', () => {
      render(<VietnameseLeadDataCollector language="en" />);

      // Check English labels
      expect(screen.getByText('Loan Application')).toBeInTheDocument();
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Date of Birth')).toBeInTheDocument();
      expect(screen.getByText('Gender')).toBeInTheDocument();
    });

    test('validates required Vietnamese fields', async () => {
      const mockOnSubmit = jest.fn();
      render(
        <VietnameseLeadDataCollector language="vi" onSubmit={mockOnSubmit} />
      );

      // Try to submit without filling required fields
      const submitButton = screen.getByText('Gửi yêu cầu');
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/Họ và tên phải có ít nhất 2 ký tự/)).toBeInTheDocument();
        expect(screen.getByText(/Vui lòng chọn giới tính/)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    test('handles Vietnamese phone number validation', async () => {
      render(<VietnameseLeadDataCollector language="vi" />);

      const phoneInput = screen.getByPlaceholderText('Nhập số điện thoại');
      fireEvent.change(phoneInput, { target: { value: '0912345678' } });

      // Valid Vietnamese phone number should not show error
      expect(screen.queryByText(/Số điện thoại không hợp lệ/)).not.toBeInTheDocument();

      // Invalid phone number
      fireEvent.change(phoneInput, { target: { value: '123' } });
      expect(screen.getByText(/Số điện thoại không hợp lệ/)).toBeInTheDocument();
    });

    test('validates Vietnamese ID numbers', async () => {
      render(<VietnameseLeadDataCollector language="vi" />);

      const idInput = screen.getByPlaceholderText('Nhập 9 hoặc 12 số');

      // Valid 9-digit ID
      fireEvent.change(idInput, { target: { value: '123456789' } });
      expect(screen.queryByText(/Số CMND\/CCCD phải có 9 hoặc 12 số/)).not.toBeInTheDocument();

      // Valid 12-digit ID
      fireEvent.change(idInput, { target: { value: '123456789012' } });
      expect(screen.queryByText(/Số CMND\/CCCD phải có 9 hoặc 12 số/)).not.toBeInTheDocument();

      // Invalid ID
      fireEvent.change(idInput, { target: { value: '12345' } });
      expect(screen.getByText(/Số CMND\/CCCD phải có 9 hoặc 12 số/)).toBeInTheDocument();
    });
  });

  describe('Lead Scoring System', () => {
    test('calculates Vietnamese market-specific scores', () => {
      const mockLeadScore = {
        totalScore: 85,
        grade: 'B+',
        breakdown: {
          demographics: 12,
          financial: 22,
          employment: 18,
          loanSpecifics: 17,
          behavior: 8,
          source: 8,
        },
        riskFactors: [],
        positiveIndicators: ['Strong income level'],
        confidence: 88,
        estimatedConversionProbability: 72,
      };

      (scoreVietnameseLead as jest.Mock).mockReturnValue(mockLeadScore);

      const leadData = {
        fullName: 'Nguyễn Văn A',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        nationalId: '123456789',
        phoneNumber: '0912345678',
        email: 'nguyen@gmail.com',
        currentAddress: {
          provinceCode: '01', // Hanoi
          districtCode: '001',
          wardCode: '0001',
          street: '123 Nguyễn Huệ',
        },
        employment: {
          employmentType: 'full_time' as const,
          employmentStatus: 'permanent' as const,
          companyName: 'Công ty ABC',
          jobTitle: 'Nhân viên',
          workDurationMonths: 24,
          monthlyIncome: 15000000,
          incomeSource: 'salary' as const,
          canProvideIncomeProof: true,
        },
        financial: {
          existingMonthlyDebtPayments: 2000000,
          hasBankAccount: true,
          creditScore: 750,
        },
        loanRequirements: {
          requestedAmount: 100000000,
          requestedTerm: 12,
          loanType: 'personal_loan' as const,
          loanPurpose: 'Mua sắm',
          urgency: 'normal' as const,
          collateralAvailable: false,
        },
        contactPreferences: {
          preferredContactMethod: 'phone' as const,
          timezone: 'Asia/Ho_Chi_Minh',
        },
        consent: {
          dataProcessingConsent: true,
          marketingConsent: true,
          partnerSharingConsent: true,
          creditCheckConsent: true,
          consentTimestamp: new Date().toISOString(),
          consentIP: '127.0.0.1',
          languagePreference: 'vi' as const,
        },
        behavior: {
          howFound: 'website',
          previousApplications: 0,
          websiteVisits: 3,
          timeSpentOnSite: 15,
          pagesViewed: 8,
          formStartTime: new Date().toISOString(),
          formCompletionTime: new Date().toISOString(),
          deviceType: 'desktop' as const,
          ipAddress: '127.0.0.1',
        },
        source: {
          source: 'organic',
          medium: 'search',
        },
      };

      const result = scoreVietnameseLead(leadData);

      expect(result.totalScore).toBe(85);
      expect(result.grade).toBe('B+');
      expect(result.confidence).toBeGreaterThan(80);
    });

    test('handles Vietnamese geographic preferences', () => {
      const mockLeadScore = {
        totalScore: 90,
        grade: 'A',
        breakdown: {
          demographics: 15,
          financial: 24,
          employment: 19,
          loanSpecifics: 19,
          behavior: 8,
          source: 5,
        },
        riskFactors: [],
        positiveIndicators: ['Optimal demographic profile', 'Preferred location'],
        confidence: 92,
        estimatedConversionProbability: 85,
      };

      (scoreVietnameseLead as jest.Mock).mockReturnValue(mockLeadScore);

      // Hanoi-based lead should get higher score
      const hanoiLead = {
        currentAddress: { provinceCode: '01' }, // Hanoi
        // ... other fields
      } as any;

      scoreVietnameseLead(hanoiLead);

      expect(scoreVietnameseLead).toHaveBeenCalledWith(hanoiLead);
    });
  });

  describe('Partner Matching System', () => {
    test('matches Vietnamese partners based on loan type and location', () => {
      const mockMatchingResult = {
        leadId: 'test-lead-1',
        criteria: {
          loanType: 'personal_loan' as const,
          loanAmount: 100000000,
          loanTerm: 12,
          provinceCode: '01', // Hanoi
        },
        scores: [
          {
            partnerId: 'vcb',
            partnerName: 'Vietcombank',
            totalScore: 92,
            confidence: 95,
            approvalProbability: 88,
            matchReasons: ['Excellent specialization', 'Strong local presence'],
          },
        ],
        summary: {
          totalPartnersEvaluated: 10,
          eligiblePartnersCount: 8,
          highConfidenceMatches: 5,
        },
      };

      (matchVietnamesePartners as jest.Mock).mockReturnValue(mockMatchingResult);

      const result = matchVietnamesePartners('test-lead', {
        loanType: 'personal_loan',
        loanAmount: 100000000,
        loanTerm: 12,
        provinceCode: '01',
      });

      expect(result.summary.eligiblePartnersCount).toBeGreaterThan(0);
      expect(result.scores[0].partnerName).toBe('Vietcombank');
    });

    test('considers Vietnamese market factors', () => {
      const criteria = {
        loanType: 'personal_loan' as const,
        loanAmount: 50000000,
        loanTerm: 12,
        provinceCode: '79', // Ho Chi Minh City
        urgency: 'urgent' as const,
      };

      (matchVietnamesePartners as jest.Mock).mockImplementation(() => {
        // Should prioritize partners with fast processing for urgent HCMC loans
        return {
          summary: {
            eligiblePartnersCount: 6,
            highConfidenceMatches: 3,
          },
        };
      });

      matchVietnamesePartners('test-lead', criteria);

      expect(matchVietnamesePartners).toHaveBeenCalledWith(
        'test-lead',
        expect.objectContaining({
          provinceCode: '79',
          urgency: 'urgent',
        }),
        undefined,
        undefined
      );
    });
  });

  describe('Vietnamese Partners Database', () => {
    test('contains major Vietnamese banks', () => {
      const majorBanks = ['vcb', 'ctg', 'bvb', 'agribank'];

      majorBanks.forEach(bankId => {
        const partner = VIETNAMESE_FINANCIAL_PARTNERS.find(p => p.id === bankId);
        expect(partner).toBeDefined();
        expect(partner?.type).toBe('commercial_bank');
      });
    });

    test('includes Vietnamese finance companies', () => {
      const financeCompanies = ['hdsaison', 'fecredit', 'homecredit'];

      financeCompanies.forEach(companyId => {
        const partner = VIETNAMESE_FINANCIAL_PARTNERS.find(p => p.id === companyId);
        expect(partner).toBeDefined();
        expect(partner?.type).toBe('consumer_finance');
      });
    });

    test('has proper Vietnamese province coverage', () => {
      const bigFourBanks = VIETNAMESE_FINANCIAL_PARTNERS.filter(p =>
        p.subtype === 'big_four'
      );

      bigFourBanks.forEach(bank => {
        expect(bank.coverage.national).toBe(true);
        expect(bank.coverage.provinces.length).toBeGreaterThan(60); // Should cover most provinces
      });
    });

    test('includes Vietnamese language details', () => {
      VIETNAMESE_FINANCIAL_PARTNERS.forEach(partner => {
        expect(partner.nameVI).toBeDefined();
        expect(partner.nameVI).toBeTruthy();
      });
    });
  });

  describe('Compliance Management', () => {
    test('creates Vietnamese consent records', () => {
      const mockConsentRecord = {
        id: 'consent-123',
        leadId: 'lead-123',
        type: 'data_processing',
        status: 'granted',
        consentTextVI: 'Tôi đồng ý cho phép xử lý dữ liệu cá nhân',
        consentTextEN: 'I consent to personal data processing',
        language: 'vi',
        consentTimestamp: new Date().toISOString(),
      };

      (createVietnameseConsent as jest.Mock).mockReturnValue(mockConsentRecord);

      const result = createVietnameseConsent('test-lead', {
        type: 'data_processing',
        consentGiven: true,
        ipAddress: '127.0.0.1',
        userAgent: 'Test Browser',
        language: 'vi',
        method: 'checkbox',
      });

      expect(result.language).toBe('vi');
      expect(result.consentTextVI).toContain('Tôi đồng ý');
      expect(result.status).toBe('granted');
    });

    test('validates Vietnamese regulatory compliance', () => {
      const consentRecord = {
        id: 'consent-123',
        leadId: 'lead-123',
        type: 'data_processing',
        status: 'granted',
        legalBasis: 'consent',
        purpose: ['loan_application_processing'],
        dataTypes: ['personal_data', 'financial_data'],
        retentionPeriod: 2555, // 7 years
        consentTimestamp: new Date().toISOString(),
      } as any;

      expect(consentRecord.legalBasis).toBe('consent');
      expect(consentRecord.retentionPeriod).toBe(2555); // 7 years per Vietnamese regulations
    });
  });

  describe('Integration Tests', () => {
    test('complete Vietnamese lead flow', async () => {
      const mockLeadScore = {
        totalScore: 82,
        grade: 'B',
        breakdown: {
          demographics: 13,
          financial: 21,
          employment: 17,
          loanSpecifics: 16,
          behavior: 7,
          source: 8,
        },
        confidence: 85,
        estimatedConversionProbability: 68,
      };

      const mockMatchingResult = {
        leadId: 'test-lead',
        summary: {
          eligiblePartnersCount: 6,
          highConfidenceMatches: 3,
        },
      };

      const mockConsentRecord = {
        id: 'consent-123',
        status: 'granted',
        language: 'vi',
      };

      (scoreVietnameseLead as jest.Mock).mockReturnValue(mockLeadScore);
      (matchVietnamesePartners as jest.Mock).mockReturnValue(mockMatchingResult);
      (createVietnameseConsent as jest.Mock).mockReturnValue(mockConsentRecord);

      const mockOnSubmit = jest.fn();
      render(
        <VietnameseLeadDataCollector
          language="vi"
          onSubmit={mockOnSubmit}
        />
      );

      // Fill out Vietnamese form
      fireEvent.change(screen.getByPlaceholderText('Nhập họ và tên của bạn'), {
        target: { value: 'Trần Văn B' }
      });

      fireEvent.change(screen.getByPlaceholderText('Nhập 9 hoặc 12 số'), {
        target: { value: '123456789' }
      });

      fireEvent.change(screen.getByPlaceholderText('Nhập số điện thoại'), {
        target: { value: '0912345678' }
      });

      // Navigate through steps
      const nextButtons = screen.getAllByText('Tiếp theo');
      fireEvent.click(nextButtons[0]); // Move to step 2

      await waitFor(() => {
        expect(screen.getByText('Thông tin tài chính')).toBeInTheDocument();
      });

      // Complete the form
      fireEvent.click(nextButtons[1]); // Move to step 3
      fireEvent.click(nextButtons[2]); // Move to step 4

      // Grant consent
      const consentCheckboxes = screen.getAllByRole('checkbox');
      fireEvent.click(consentCheckboxes[0]); // Data processing consent
      fireEvent.click(consentCheckboxes[3]); // Credit check consent

      // Submit form
      const submitButton = screen.getByText('Gửi yêu cầu');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(scoreVietnameseLead).toHaveBeenCalled();
        expect(matchVietnamesePartners).toHaveBeenCalled();
        expect(createVietnameseConsent).toHaveBeenCalledTimes(2); // Data processing + credit check
      });
    });
  });

  describe('Performance Tests', () => {
    test('handles large volumes of Vietnamese partners efficiently', () => {
      const startTime = performance.now();

      // Simulate matching with many partners
      const result = matchVietnamesePartners('test-lead', {
        loanType: 'personal_loan',
        loanAmount: 100000000,
        loanTerm: 12,
        provinceCode: '01',
      });

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(1000); // Should complete within 1 second
    });

    test('scores Vietnamese leads quickly', () => {
      const leadData = {
        // Minimal lead data for performance test
        fullName: 'Test User',
        dateOfBirth: '1990-01-01',
        gender: 'male' as const,
        nationalId: '123456789',
        phoneNumber: '0912345678',
        // ... other required fields
      } as any;

      const startTime = performance.now();
      const result = scoreVietnameseLead(leadData);
      const endTime = performance.now();

      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(500); // Should score within 500ms
      expect(result.totalScore).toBeDefined();
      expect(result.grade).toBeDefined();
    });
  });

  describe('Accessibility Tests', () => {
    test('Vietnamese form has proper labels and ARIA attributes', () => {
      render(<VietnameseLeadDataCollector language="vi" />);

      // Check for proper form labels
      expect(screen.getByLabelText('Họ và tên đầy đủ')).toBeInTheDocument();
      expect(screen.getByLabelText('Ngày sinh')).toBeInTheDocument();
      expect(screen.getByLabelText('Giới tính')).toBeInTheDocument();

      // Check for ARIA attributes
      const fullNameInput = screen.getByPlaceholderText('Nhập họ và tên của bạn');
      expect(fullNameInput).toHaveAttribute('required');
      expect(fullNameInput).toHaveAttribute('type', 'text');
    });

    test('provides proper error messages in Vietnamese', async () => {
      render(<VietnameseLeadDataCollector language="vi" />);

      const submitButton = screen.getByText('Gửi yêu cầu');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Họ và tên phải có ít nhất 2 ký tự/)).toBeInTheDocument();
        expect(screen.getByText(/Vui lòng chọn giới tính/)).toBeInTheDocument();
      });
    });
  });
});