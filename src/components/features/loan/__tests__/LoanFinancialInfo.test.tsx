import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoanFinancialInfo } from '../LoanFinancialInfo';
import type { FinancialInfoData } from '@/types/forms/loan-form';

// Mock the store
vi.mock('@/store/use-loan-store', () => ({
  useLoanApplicationStore: () => ({
    updateFinancialInfo: vi.fn(),
    getFieldValue: vi.fn(() => null),
  }),
}));

describe('LoanFinancialInfo', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    readOnly: false,
    loanAmount: 100000000, // 100 million VND
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders financial information form correctly', () => {
    render(<LoanFinancialInfo {...defaultProps} />);

    expect(screen.getByText(/Thông tin tài chính/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Khoảng thu nhập hàng tháng/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nguồn thu nhập chính/i)).toBeInTheDocument();
    expect(screen.getByText(/Thông tin ngân hàng/i)).toBeInTheDocument();
  });

  it('validates required fields correctly', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    // Should show validation errors for required fields
    await waitFor(() => {
      expect(screen.getByText(/Vui lòng chọn khoảng thu nhập/i)).toBeInTheDocument();
      expect(screen.getByText(/Vui lòng chọn nguồn thu nhập/i)).toBeInTheDocument();
      expect(screen.getByText(/Vui lòng chọn ngân hàng/i)).toBeInTheDocument();
    });
  });

  it('handles income range selection', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    const incomeRangeSelect = screen.getByLabelText(/Khoảng thu nhập hàng tháng/i);
    await user.click(incomeRangeSelect);
    await user.click(screen.getByText('30 - 50 triệu'));

    expect(incomeRangeSelect).toHaveValue('30000000-50000000');
  });

  it('shows exact income input for high income range', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    const incomeRangeSelect = screen.getByLabelText(/Khoảng thu nhập hàng tháng/i);
    await user.click(incomeRangeSelect);
    await user.click(screen.getByText('Trên 100 triệu'));

    // Should show exact income input
    expect(screen.getByLabelText(/Thu nhập chính xác \(VNĐ\)/)).toBeInTheDocument();
  });

  it('validates bank account number format', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    const accountNumberInput = screen.getByLabelText(/Số tài khoản/i);
    await user.type(accountNumberInput, 'abc123');

    // Should show validation error for non-numeric account number
    await waitFor(() => {
      expect(screen.getByText(/Số tài khoản chỉ được chứa số/i)).toBeInTheDocument();
    });
  });

  it('validates account holder name format', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    const accountHolderInput = screen.getByLabelText(/Tên chủ tài khoản/i);
    await user.type(accountHolderInput, 'John Doe123');

    // Should show validation error for invalid name format
    await waitFor(() => {
      expect(screen.getByText(/Tên chỉ được chứa chữ cái và khoảng trắng/i)).toBeInTheDocument();
    });
  });

  it('handles existing loans section', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    const hasExistingLoansCheckbox = screen.getByLabelText(/Có khoản vay đang hoạt động/i);
    await user.click(hasExistingLoansCheckbox);

    // Should show loan details section
    expect(screen.getByText(/Khoản vay #1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Đơn vị cho vay/i)).toBeInTheDocument();

    // Add another loan
    const addLoanButton = screen.getByText(/\+ Thêm khoản vay/i);
    await user.click(addLoanButton);

    expect(screen.getByText(/Khoản vay #2/i)).toBeInTheDocument();
  });

  it('removes existing loan correctly', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    const hasExistingLoansCheckbox = screen.getByLabelText(/Có khoản vay đang hoạt động/i);
    await user.click(hasExistingLoansCheckbox);

    const removeButton = screen.getByText('Xóa');
    await user.click(removeButton);

    // Should remove the loan form
    expect(screen.queryByText(/Khoạn vay #1/i)).not.toBeInTheDocument();
  });

  it('handles credit card information', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    const hasCreditCardsCheckbox = screen.getByLabelText(/Có thẻ tín dụng/i);
    await user.click(hasCreditCardsCheckbox);

    // Should show credit card details
    expect(screen.getByLabelText(/Số lượng thẻ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Hạn mức tổng \(VNĐ\)/i)).toBeInTheDocument();
  });

  it('calculates total monthly expenses correctly', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    await user.type(screen.getByLabelText(/Chi phí nhà ở \(VNĐ\)/), '5000000');
    await user.type(screen.getByLabelText(/Chi phí đi lại \(VNĐ\)/), '1500000');
    await user.type(screen.getByLabelText(/Ăn uống & Điện nước \(VNĐ\)/), '7000000');
    await user.type(screen.getByLabelText(/Chi phí khác \(VNĐ\)/), '2000000');

    // Should show total expenses
    expect(screen.getByText(/15.500.000 VNĐ/)).toBeInTheDocument();
  });

  it('handles assets information', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    // Check real estate asset
    const hasRealEstateCheckbox = screen.getByLabelText(/Có bất động sản/i);
    await user.click(hasRealEstateCheckbox);

    // Should show real estate details input
    expect(screen.getByLabelText(/Chi tiết bất động sản/i)).toBeInTheDocument();

    // Check vehicle asset
    const hasVehicleCheckbox = screen.getByLabelText(/Có phương tiện giao thông/i);
    await user.click(hasVehicleCheckbox);

    expect(screen.getByLabelText(/Chi tiết phương tiện/i)).toBeInTheDocument();
  });

  it('checks loan eligibility when loan amount is provided', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} loanAmount={200000000} />);

    // Select income range
    const incomeRangeSelect = screen.getByLabelText(/Khoảng thu nhập hàng tháng/i);
    await user.click(incomeRangeSelect);
    await user.click(screen.getByText('30 - 50 triệu'));

    // Check eligibility button should be visible
    const checkButton = screen.getByRole('button', { name: /Kiểm tra điều kiện vay/i });
    await user.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Đủ điều kiện/)).toBeInTheDocument();
    });
  });

  it('displays debt-to-income ratio', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    // Add existing loan
    const hasExistingLoansCheckbox = screen.getByLabelText(/Có khoản vay đang hoạt động/i);
    await user.click(hasExistingLoansCheckbox);

    await user.type(screen.getByLabelText(/Trả hàng tháng \(VNĐ\)/), '5000000');

    // Should show debt-to-income ratio badge
    expect(screen.getByText(/Tỷ lệ nợ\/thu nhập/)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoanFinancialInfo {...defaultProps} />);

    // Fill in valid form data
    await user.click(screen.getByLabelText(/Khoảng thu nhập hàng tháng/i));
    await user.click(screen.getByText('20 - 30 triệu'));

    await user.click(screen.getByText(/Lương tháng/));

    // Fill bank info
    const bankNameSelect = screen.getByLabelText(/Ngân hàng/i);
    await user.click(bankNameSelect);
    await user.click(screen.getByText('Ngân hàng TMCP Ngoại thương Việt Nam'));

    await user.type(screen.getByLabelText(/Chi nhánh/i), 'Chi nhánh Hà Nội');
    await user.type(screen.getByLabelText(/Số tài khoản/i), '1234567890');
    await user.type(screen.getByLabelText(/Tên chủ tài khoản/i), 'NGUYEN VAN A');

    // Fill monthly expenses
    await user.type(screen.getByLabelText(/Chi phí nhà ở \(VNĐ\)/), '5000000');
    await user.type(screen.getByLabelText(/Chi phí đi lại \(VNĐ\)/), '1500000');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        monthlyIncomeRange: '20000000-30000000',
        incomeSource: 'salary',
        bankInfo: expect.objectContaining({
          bankName: 'VCB',
          bankBranch: 'Chi nhánh Hà Nội',
          accountNumber: '1234567890',
          accountHolderName: 'NGUYEN VAN A',
        }),
        monthlyExpenses: expect.objectContaining({
          housing: 5000000,
          transportation: 1500000,
        }),
      }));
    });
  });

  it('displays loading state correctly', () => {
    render(<LoanFinancialInfo {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /Đang lưu/i });
    expect(submitButton).toBeDisabled();
  });

  it('disables inputs in read-only mode', () => {
    render(<LoanFinancialInfo {...defaultProps} readOnly={true} />);

    expect(screen.getByLabelText(/Khoảng thu nhập hàng tháng/i)).toBeDisabled();
    expect(screen.getByLabelText(/Ngân hàng/i)).toBeDisabled();
    expect(screen.getByLabelText(/Số tài khoản/i)).toBeDisabled();
  });

  it('shows initial data when provided', () => {
    const initialData: Partial<FinancialInfoData> = {
      monthlyIncomeRange: '30000000-50000000',
      incomeSource: 'business',
      bankInfo: {
        bankName: 'TCB',
        bankBranch: 'Chi nhánh TP.HCM',
        accountNumber: '9876543210',
        accountHolderName: 'TRAN THI B',
      },
    };

    render(<LoanFinancialInfo {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue('30 - 50 triệu')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Kinh doanh tự do')).toBeInTheDocument();
  });

  it('shows information cards', () => {
    render(<LoanFinancialInfo {...defaultProps} />);

    expect(screen.getByText(/Thông tin thu nhập/i)).toBeInTheDocument();
    expect(screen.getByText(/Tài khoản ngân hàng/i)).toBeInTheDocument();
    expect(screen.getByText(/Tính toán khả năng vay/i)).toBeInTheDocument();
  });
});