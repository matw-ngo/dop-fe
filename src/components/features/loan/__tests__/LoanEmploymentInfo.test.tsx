import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoanEmploymentInfo } from '../LoanEmploymentInfo';
import type { EmploymentInfoData } from '@/types/forms/loan-form';

// Mock the store
vi.mock('@/store/use-loan-store', () => ({
  useLoanApplicationStore: () => ({
    updateEmploymentInfo: vi.fn(),
    getFieldValue: vi.fn(() => null),
  }),
}));

describe('LoanEmploymentInfo', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    readOnly: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders employment information form correctly', () => {
    render(<LoanEmploymentInfo {...defaultProps} />);

    expect(screen.getByText(/Thông tin việc làm/i)).toBeInTheDocument();
    expect(screen.getByText(/Loại hình việc làm/i)).toBeInTheDocument();
    expect(screen.getByText(/Tình trạng việc làm/i)).toBeInTheDocument();
  });

  it('validates required fields for formal employment', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    const fullTimeOption = screen.getByLabelText(/Toàn thời gian/i);
    await user.click(fullTimeOption);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    // Should show validation error for company name
    await waitFor(() => {
      expect(screen.getByText(/Vui lòng nhập tên công ty\/cơ quan/i)).toBeInTheDocument();
    });
  });

  it('shows company information for formal employment', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    // Should show company info section
    expect(screen.getByText(/Thông tin công ty\/cơ quan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên công ty\/cơ quan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Chức vụ/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ngành nghề/i)).toBeInTheDocument();
  });

  it('shows business information for self-employed', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select self-employment
    const selfEmployedOption = screen.getByLabelText(/Tự kinh doanh/i);
    await user.click(selfEmployedOption);

    // Should show business info section
    expect(screen.getByText(/Thông tin kinh doanh/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tên doanh nghiệp/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Mã số đăng ký kinh doanh/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Loại hình kinh doanh/i)).toBeInTheDocument();
  });

  it('hides company info for non-employment types', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select retired
    const retiredOption = screen.getByLabelText(/Nghỉ hưu/i);
    await user.click(retiredOption);

    // Should not show company or business info
    expect(screen.queryByText(/Thông tin công ty\/cơ quan/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Thông tin kinh doanh/i)).not.toBeInTheDocument();
  });

  it('calculates total work experience correctly', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment first
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    await user.type(screen.getByLabelText(/Số năm/i), '2');
    await user.type(screen.getByLabelText(/Số tháng/i), '6');

    // Should show total work experience
    expect(screen.getByText('2 năm 6 tháng')).toBeInTheDocument();
  });

  it('validates total work experience range', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment first
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    // Enter invalid years
    await user.type(screen.getByLabelText(/Tổng kinh nghiệm làm việc \(năm\)/), '70');

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Tổng số năm không quá 60/i)).toBeInTheDocument();
    });
  });

  it('handles work contact information', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    // Should show work contact section
    expect(screen.getByText(/Thông tin liên hệ công việc/i)).toBeInTheDocument();

    await user.type(screen.getByLabelText(/Số điện thoại công việc/i), '(028) 3827 1234');
    await user.type(screen.getByLabelText(/Email công việc/i), 'work@company.com');

    // Valid email should not show error
    expect(screen.queryByText(/Email không hợp lệ/i)).not.toBeInTheDocument();
  });

  it('validates work email format', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    const workEmailInput = screen.getByLabelText(/Email công việc/i);
    await user.type(workEmailInput, 'invalid-work-email');

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Email không hợp lệ/i)).toBeInTheDocument();
    });
  });

  it('validates work website format', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    const websiteInput = screen.getByLabelText(/Website công ty/i);
    await user.type(websiteInput, 'invalid-website');

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Website không hợp lệ/i)).toBeInTheDocument();
    });
  });

  it('toggles work address section', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    // Initially should not show work address
    expect(screen.queryByText(/Địa chỉ làm việc/i)).not.toBeInTheDocument();

    // Click to add work address
    const addAddressButton = screen.getByRole('button', { name: /Thêm địa chỉ làm việc/i });
    await user.click(addAddressButton);

    // Should show work address section
    expect(screen.getByText(/Địa chỉ làm việc/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Địa chỉ cụ thể/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tỉnh\/Thành phố/i)).toBeInTheDocument();
  });

  it('handles income verification methods', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    expect(screen.getByText(/Xác minh thu nhập/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phương thức xác minh/i)).toBeInTheDocument();

    const methodSelect = screen.getByLabelText(/Phương thức xác minh/i);
    await user.click(methodSelect);
    await user.click(screen.getByText('Phiếu lương'));

    // Should show confirmation checkbox
    const canProvideCheckbox = screen.getByLabelText(/Có thể cung cấp giấy tờ xác minh thu nhập/i);
    await user.click(canProvideCheckbox);

    expect(canProvideCheckbox).toBeChecked();
  });

  it('validates business info for self-employed', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select self-employment
    const selfEmployedOption = screen.getByLabelText(/Tự kinh doanh/i);
    await user.click(selfEmployedOption);

    // Try to submit without filling required business fields
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    // Should show validation error for business name
    await waitFor(() => {
      expect(screen.getByText(/Vui lòng cung cấp thông tin kinh doanh/i)).toBeInTheDocument();
    });
  });

  it('loads provinces for work address', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    const formalOption = screen.getByLabelText(/Ngành nghề chính thức/i);
    await user.click(formalOption);

    // Add work address
    const addAddressButton = screen.getByRole('button', { name: /Thêm địa chỉ làm việc/i });
    await user.click(addAddressButton);

    // Should load provinces
    const provinceSelect = screen.getByLabelText(/Tỉnh\/Thành phố/i);
    await user.click(provinceSelect);

    await waitFor(() => {
      expect(screen.getByText('Thành phố Hà Nội')).toBeInTheDocument();
    });
  });

  it('submits form with valid formal employment data', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select formal employment
    await user.click(screen.getByLabelText(/Ngành nghề chính thức/i));
    await user.click(screen.getByLabelText(/Toàn thời gian/i));

    // Fill company info
    await user.type(screen.getByLabelText(/Tên công ty\/cơ quan/i), 'Công ty ABC');
    await user.type(screen.getByLabelText(/Chức vụ/i), 'Nhân viên kinh doanh');

    const industrySelect = screen.getByLabelText(/Ngành nghề/i);
    await user.click(industrySelect);
    await user.click(screen.getByText('Công nghệ thông tin'));

    // Fill work duration
    await user.type(screen.getByLabelText(/Số năm/i), '3');
    await user.type(screen.getByLabelText(/Số tháng/i), '6');
    await user.type(screen.getByLabelText(/Tổng kinh nghiệm làm việc \(năm\)/), '5');

    // Fill income verification
    const methodSelect = screen.getByLabelText(/Phương thức xác minh/i);
    await user.click(methodSelect);
    await user.click(screen.getByText('Phiếu lương'));

    await user.click(screen.getByLabelText(/Có thể cung cấp giấy tờ xác minh thu nhập/i));

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        employmentType: 'formal',
        employmentStatus: 'full_time',
        companyName: 'Công ty ABC',
        jobTitle: 'Nhân viên kinh doanh',
        industry: 'Công nghệ thông tin',
        workDuration: expect.objectContaining({
          years: 3,
          months: 6,
          totalYears: 5,
        }),
        incomeVerification: expect.objectContaining({
          method: 'payslip',
          canProvideDocuments: true,
        }),
      }));
    });
  });

  it('submits form with valid self-employment data', async () => {
    const user = userEvent.setup();
    render(<LoanEmploymentInfo {...defaultProps} />);

    // Select self-employment
    await user.click(screen.getByLabelText(/Tự kinh doanh/i));

    // Fill business info
    await user.type(screen.getByLabelText(/Tên doanh nghiệp/i), 'Cửa hàng thời trang XYZ');
    await user.type(screen.getByLabelText(/Mã số đăng ký kinh doanh/i), '0123456789');
    await user.type(screen.getByLabelText(/Loại hình kinh doanh/i), 'Bán lẻ thời trang');
    await user.type(screen.getByLabelText(/Số năm hoạt động/i), '5');
    await user.type(screen.getByLabelText(/Doanh thu năm trước \(VNĐ\)/), '1200000000');
    await user.type(screen.getByLabelText(/Số nhân viên/i), '8');

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        employmentType: 'self_employed',
        businessInfo: expect.objectContaining({
          businessName: 'Cửa hàng thời trang XYZ',
          registrationNumber: '0123456789',
          businessType: 'Bán lẻ thời trang',
          yearsInOperation: 5,
          annualRevenue: 1200000000,
          employeeCount: 8,
        }),
      }));
    });
  });

  it('displays loading state correctly', () => {
    render(<LoanEmploymentInfo {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /Đang lưu/i });
    expect(submitButton).toBeDisabled();
  });

  it('disables inputs in read-only mode', () => {
    render(<LoanEmploymentInfo {...defaultProps} readOnly={true} />);

    expect(screen.getByLabelText(/Loại hình việc làm/i)).toBeDisabled();
    expect(screen.getByLabelText(/Tình trạng việc làm/i)).toBeDisabled();
  });

  it('shows initial data when provided', () => {
    const initialData: Partial<EmploymentInfoData> = {
      employmentType: 'formal',
      employmentStatus: 'full_time',
      companyName: 'Công ty DEF',
      jobTitle: 'Trưởng phòng',
      industry: 'Tài chính - Ngân hàng',
    };

    render(<LoanEmploymentInfo {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue('Công ty DEF')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Trưởng phòng')).toBeInTheDocument();
  });

  it('shows information cards', () => {
    render(<LoanEmploymentInfo {...defaultProps} />);

    expect(screen.getByText(/Thông tin việc làm/i)).toBeInTheDocument();
    expect(screen.getByText(/Kinh nghiệm làm việc/i)).toBeInTheDocument();
    expect(screen.getByText(/Xác minh thu nhập/i)).toBeInTheDocument();
  });
});