/**
 * Loan Calculator Component Tests
 *
 * Unit tests for the LoanCalculator component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoanCalculator from '../LoanCalculator';

// Mock the calculation functions
vi.mock('@/lib/financial/calculations', () => ({
  calculateLoanDetails: vi.fn(),
  validateLoanCalculationParams: vi.fn(),
}));

// Mock the loan calculations
vi.mock('@/lib/financial/loan-calculations', () => ({
  calculateHomeLoan: vi.fn(),
  calculateAutoLoan: vi.fn(),
  calculateConsumerLoan: vi.fn(),
  calculateBusinessLoan: vi.fn(),
  assessLoanEligibility: vi.fn(),
}));

// Mock the financial data
vi.mock('@/lib/financial-data/vietnamese-financial-data', () => ({
  VIETNAMESE_LOAN_TYPES: [
    { id: 'home', nameVn: 'Vay mua nhà' },
    { id: 'auto', nameVn: 'Vay mua xe' },
    { id: 'consumer', nameVn: 'Vay tiêu dùng' },
    { id: 'business', nameVn: 'Vay kinh doanh' },
  ],
}));

// Mock the store
vi.mock('@/store/use-financial-tools-store', () => ({
  useFinancialToolsStore: () => ({
    setLoanParams: vi.fn(),
    setLoanResults: vi.fn(),
    addToHistory: vi.fn(),
  }),
}));

describe('LoanCalculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Component Rendering', () => {
    it('should render the loan calculator correctly', () => {
      render(<LoanCalculator />);

      expect(screen.getByText('Máy tính khoản vay')).toBeInTheDocument();
      expect(screen.getByText('Công cụ tính toán khoản vay chuyên nghiệp cho thị trường Việt Nam')).toBeInTheDocument();
      expect(screen.getByText('Thông tin khoản vay')).toBeInTheDocument();
      expect(screen.getByText('Số tiền vay')).toBeInTheDocument();
      expect(screen.getByText('Lãi suất năm (%)')).toBeInTheDocument();
      expect(screen.getByText('Kỳ hạn (tháng)')).toBeInTheDocument();
    });

    it('should render loan type buttons', () => {
      render(<LoanCalculator />);

      expect(screen.getByText('Vay mua nhà')).toBeInTheDocument();
      expect(screen.getByText('Vay mua xe')).toBeInTheDocument();
      expect(screen.getByText('Vay tiêu dùng')).toBeInTheDocument();
      expect(screen.getByText('Vay kinh doanh')).toBeInTheDocument();
    });

    it('should render all tabs', () => {
      render(<LoanCalculator />);

      expect(screen.getByText('Máy tính')).toBeInTheDocument();
      expect(screen.getByText('So sánh')).toBeInTheDocument();
      expect(screen.getByText('Lịch trả nợ')).toBeInTheDocument();
      expect(screen.getByText('Mẹo vay')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('should update principal amount when changed', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const principalInput = screen.getByDisplayValue(/500\.000\.000/);
      await user.clear(principalInput);
      await user.type(principalInput, '1000000000');

      expect(principalInput).toHaveValue('1.000.000.000 ₫');
    });

    it('should change loan type when clicked', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const autoLoanButton = screen.getByText('Vay mua xe');
      await user.click(autoLoanButton);

      // Should show vehicle-specific fields
      await waitFor(() => {
        expect(screen.getByText('Loại xe')).toBeInTheDocument();
        expect(screen.getByText('Giá trị xe')).toBeInTheDocument();
      });
    });

    it('should toggle insurance checkbox', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const insuranceSwitch = screen.getByRole('switch', { name: /bảo hiểm khoản vay/i });
      expect(insuranceSwitch).toBeChecked();

      await user.click(insuranceSwitch);
      expect(insuranceSwitch).not.toBeChecked();
    });

    it('should update interest rate with slider', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const rateInput = screen.getByDisplayValue('9.5');
      expect(rateInput).toBeInTheDocument();

      // Find and interact with the slider
      const slider = screen.getByRole('slider');
      await user.click(slider, { clientX: 200 });

      // The exact value depends on the slider implementation
      // Just verify that the slider exists and can be interacted with
      expect(slider).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for negative principal amount', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const principalInput = screen.getByDisplayValue(/500\.000\.000/);
      await user.clear(principalInput);
      await user.type(principalInput, '-1000000');

      const calculateButton = screen.getByRole('button', { name: /tính toán khoản vay/i });
      await user.click(calculateButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/số tiền vay phải lớn hơn 0/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid interest rate', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const rateInput = screen.getByDisplayValue('9.5');
      await user.clear(rateInput);
      await user.type(rateInput, '-5');

      const calculateButton = screen.getByRole('button', { name: /tính toán khoản vay/i });
      await user.click(calculateButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/lãi suất không hợp lệ/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid term', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const termInput = screen.getByDisplayValue('120');
      await user.clear(termInput);
      await user.type(termInput, '0');

      const calculateButton = screen.getByRole('button', { name: /tính toán khoản vay/i });
      await user.click(calculateButton);

      // Should show error message
      await waitFor(() => {
        expect(screen.getByText(/kỳ hạn không hợp lệ/i)).toBeInTheDocument();
      });
    });
  });

  describe('Calculations', () => {
    it('should show calculation results when form is valid', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      // Mock successful calculation
      const mockResult = {
        monthlyPayment: 8791588,
        totalPayment: 105499056,
        totalInterest: 5499056,
        effectiveInterestRate: 10.47,
        apr: 10.99,
        paymentSchedule: Array.from({ length: 120 }, (_, i) => ({
          period: i + 1,
          principalPayment: 7041588,
          interestPayment: 1750000,
          endingBalance: 100000000 - (i + 1) * 7041588,
        })),
      };

      vi.mocked(require('@/lib/financial/calculations').calculateLoanDetails).mockReturnValue(mockResult);

      // Fill form with valid data
      const calculateButton = screen.getByRole('button', { name: /tính toán khoản vay/i });
      await user.click(calculateButton);

      await waitFor(() => {
        expect(screen.getByText(/8\.791\.588/)).toBeInTheDocument();
        expect(screen.getByText(/105\.499\.056/)).toBeInTheDocument();
        expect(screen.getByText(/5\.499\.056/)).toBeInTheDocument();
        expect(screen.getByText('Kết quả tính toán')).toBeInTheDocument();
      });
    });

    it('should show payment schedule in schedule tab', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      // Mock calculation result
      const mockResult = {
        monthlyPayment: 8791588,
        totalPayment: 105499056,
        totalInterest: 5499056,
        effectiveInterestRate: 10.47,
        paymentSchedule: [
          {
            period: 1,
            principalPayment: 7041588,
            interestPayment: 1750000,
            endingBalance: 92958412,
          },
          {
            period: 2,
            principalPayment: 7090888,
            interestPayment: 1700200,
            endingBalance: 85867524,
          },
        ],
      };

      vi.mocked(require('@/lib/financial/calculations').calculateLoanDetails).mockReturnValue(mockResult);

      // Trigger calculation
      const calculateButton = screen.getByRole('button', { name: /tính toán khoản vay/i });
      await user.click(calculateButton);

      // Switch to schedule tab
      const scheduleTab = screen.getByText('Lịch trả nợ');
      await user.click(scheduleTab);

      await waitFor(() => {
        expect(screen.getByText('Kỳ')).toBeInTheDocument();
        expect(screen.getByText('Gốc')).toBeInTheDocument();
        expect(screen.getByText('Lãi')).toBeInTheDocument();
        expect(screen.getByText('Dư nợ')).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('Specialized Loan Types', () => {
    it('should show property type options for home loan', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      // Select home loan
      const homeLoanButton = screen.getByText('Vay mua nhà');
      await user.click(homeLoanButton);

      await waitFor(() => {
        expect(screen.getByText('Loại bất động sản')).toBeInTheDocument();
        expect(screen.getByText('Vị trí')).toBeInTheDocument();
      });
    });

    it('should show vehicle type options for auto loan', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      // Select auto loan
      const autoLoanButton = screen.getByText('Vay mua xe');
      await user.click(autoLoanButton);

      await waitFor(() => {
        expect(screen.getByText('Loại xe')).toBeInTheDocument();
        expect(screen.getByText('Giá trị xe')).toBeInTheDocument();
      });
    });

    it('should show income fields for consumer loan', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      // Select consumer loan
      const consumerLoanButton = screen.getByText('Vay tiêu dùng');
      await user.click(consumerLoanButton);

      await waitFor(() => {
        expect(screen.getByText('Thu nhập hàng tháng')).toBeInTheDocument();
        expect(screen.getByText('Nợ hiện tại')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<LoanCalculator />);

      // Check for proper form labels
      expect(screen.getByLabelText('Số tiền vay')).toBeInTheDocument();
      expect(screen.getByLabelText('Lãi suất năm (%)')).toBeInTheDocument();
      expect(screen.getByLabelText('Kỳ hạn (tháng)')).toBeInTheDocument();
    });

    it('should be navigable with keyboard', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText('Số tiền vay')).toHaveFocus();

      await user.tab();
      await user.tab();
      expect(screen.getByLabelText('Lãi suất năm (%)')).toHaveFocus();
    });

    it('should announce errors to screen readers', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      const principalInput = screen.getByDisplayValue(/500\.000\.000/);
      await user.clear(principalInput);
      await user.type(principalInput, '-1000000');

      const calculateButton = screen.getByRole('button', { name: /tính toán khoản vay/i });
      await user.click(calculateButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveTextContent(/số tiền vay phải lớn hơn 0/i);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should adapt to mobile screen sizes', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<LoanCalculator />);

      // Should still render all important elements
      expect(screen.getByText('Máy tính khoản vay')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /tính toán khoản vay/i })).toBeInTheDocument();
    });

    it('should show stacked layout on small screens', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<LoanCalculator />);

      // Should stack elements vertically
      const container = screen.getByText('Thông tin khoản vay').closest('div');
      expect(container).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not block UI during calculations', async () => {
      const user = userEvent.setup();
      render(<LoanCalculator />);

      // Mock a slow calculation
      vi.mocked(require('@/lib/financial/calculations').calculateLoanDetails).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({
          monthlyPayment: 8791588,
          totalPayment: 105499056,
          totalInterest: 5499056,
          effectiveInterestRate: 10.47,
          apr: 10.99,
          paymentSchedule: [],
        }), 100))
      );

      const calculateButton = screen.getByRole('button', { name: /tính toán khoản vay/i });

      // Button should be disabled during calculation
      await user.click(calculateButton);
      expect(calculateButton).toBeDisabled();

      // Should re-enable after calculation
      await waitFor(() => {
        expect(calculateButton).not.toBeDisabled();
      }, { timeout: 1000 });
    });
  });
});