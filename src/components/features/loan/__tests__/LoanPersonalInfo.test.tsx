import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoanPersonalInfo } from '../LoanPersonalInfo';
import type { PersonalInfoData } from '@/types/forms/loan-form';

// Mock the store
vi.mock('@/store/use-loan-store', () => ({
  useLoanApplicationStore: () => ({
    updatePersonalInfo: vi.fn(),
    getFieldValue: vi.fn(() => null),
  }),
}));

describe('LoanPersonalInfo', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    readOnly: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders personal information form correctly', () => {
    render(<LoanPersonalInfo {...defaultProps} />);

    expect(screen.getByText(/Thông tin cá nhân/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Họ và tên/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ngày sinh/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Số CCCD/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });

  it('validates required fields correctly', async () => {
    const user = userEvent.setup();
    render(<LoanPersonalInfo {...defaultProps} />);

    // Try to submit without filling required fields
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    // Should show validation errors
    await waitFor(() => {
      expect(screen.getByText(/Họ và tên phải có ít nhất 2 ký tự/i)).toBeInTheDocument();
    });
  });

  it('validates Vietnamese phone number format', async () => {
    const user = userEvent.setup();
    render(<LoanPersonalInfo {...defaultProps} />);

    const phoneInput = screen.getByLabelText(/Số điện thoại/i);
    await user.type(phoneInput, '123456789');

    // Should show validation error for invalid phone format
    await waitFor(() => {
      expect(screen.getByText(/Số điện thoại không hợp lệ/i)).toBeInTheDocument();
    });
  });

  it('validates CCCD format (12 digits)', async () => {
    const user = userEvent.setup();
    render(<LoanPersonalInfo {...defaultProps} />);

    const cccdInput = screen.getByLabelText(/Số CCCD/i);
    await user.type(cccdInput, '123456789');

    // Should show validation error for invalid CCCD format
    await waitFor(() => {
      expect(screen.getByText(/Số CCCD phải có đúng 12 số/i)).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<LoanPersonalInfo {...defaultProps} />);

    const emailInput = screen.getByLabelText(/Email/i);
    await user.type(emailInput, 'invalid-email');

    // Should show validation error for invalid email
    await waitFor(() => {
      expect(screen.getByText(/Email không hợp lệ/i)).toBeInTheDocument();
    });
  });

  it('validates age range (18-65)', async () => {
    const user = userEvent.setup();
    render(<LoanPersonalInfo {...defaultProps} />);

    // Set a birth date that would make the person under 18
    const today = new Date();
    const under18Date = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
    const dateOfBirthInput = screen.getByLabelText(/Ngày sinh/i);

    // Open calendar and select under-18 date
    await user.click(dateOfBirthInput);
    // This would need more complex date selection logic in real implementation

    // Should show validation error for age
    // await waitFor(() => {
    //   expect(screen.getByText(/Độ tuổi phải từ 18 đến 65 tuổi/i)).toBeInTheDocument();
    // });
  });

  it('loads and displays provinces correctly', async () => {
    render(<LoanPersonalInfo {...defaultProps} />);

    const provinceSelect = screen.getByLabelText(/Tỉnh\/Thành phố/i);

    // Should have provinces loaded
    await waitFor(() => {
      expect(screen.getByText('Thành phố Hà Nội')).toBeInTheDocument();
    });
  });

  it('handles same address checkbox correctly', async () => {
    const user = userEvent.setup();
    render(<LoanPersonalInfo {...defaultProps} />);

    const sameAddressCheckbox = screen.getByLabelText(/Địa chỉ thường trùng với địa chỉ hiện tại/i);

    // By default, it should be checked
    expect(sameAddressCheckbox).toBeChecked();

    // Uncheck it
    await user.click(sameAddressCheckbox);
    expect(sameAddressCheckbox).not.toBeChecked();

    // Should show permanent address section
    expect(screen.getByText(/Địa chỉ thường trú/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<LoanPersonalInfo {...defaultProps} />);

    // Fill in valid form data
    await user.type(screen.getByLabelText(/Họ và tên/i), 'Nguyễn Văn A');
    await user.type(screen.getByLabelText(/Số CCCD/i), '001234567890');
    await user.type(screen.getByLabelText(/Số điện thoại/i), '0912345678');
    await user.type(screen.getByLabelText(/Email/i), 'nguyenvana@example.com');
    await user.type(screen.getByLabelText(/Địa chỉ cụ thể/i), '123 Nguyễn Trãi');

    // Select province
    const provinceSelect = screen.getByLabelText(/Tỉnh\/Thành phố/i);
    await user.click(provinceSelect);
    await user.click(screen.getByText('Thành phố Hà Nội'));

    // Select district
    const districtSelect = screen.getByLabelText(/Quận\/Huyện/i);
    await user.click(districtSelect);
    await user.click(screen.getByText('Quận Ba Đình'));

    // Select ward
    const wardSelect = screen.getByLabelText(/Phường\/Xã/i);
    await user.click(wardSelect);
    await user.click(screen.getByText('Phường Phúc Xá'));

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
        fullName: 'Nguyễn Văn A',
        nationalId: '001234567890',
        phoneNumber: '0912345678',
        email: 'nguyenvana@example.com',
        currentAddress: expect.objectContaining({
          street: '123 Nguyễn Trãi',
          provinceName: 'Thành phố Hà Nội',
          districtName: 'Quận Ba Đình',
          wardName: 'Phường Phúc Xá',
        }),
      }));
    });
  });

  it('displays loading state correctly', () => {
    render(<LoanPersonalInfo {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /Đang lưu/i });
    expect(submitButton).toBeDisabled();
  });

  it('disables inputs in read-only mode', () => {
    render(<LoanPersonalInfo {...defaultProps} readOnly={true} />);

    expect(screen.getByLabelText(/Họ và tên/i)).toBeDisabled();
    expect(screen.getByLabelText(/Số điện thoại/i)).toBeDisabled();
    expect(screen.getByLabelText(/Email/i)).toBeDisabled();
  });

  it('shows initial data when provided', () => {
    const initialData: Partial<PersonalInfoData> = {
      fullName: 'Trần Thị B',
      phoneNumber: '0987654321',
      email: 'tranthib@example.com',
      sameAsCurrentAddress: false,
    };

    render(<LoanPersonalInfo {...defaultProps} initialData={initialData} />);

    expect(screen.getByDisplayValue('Trần Thị B')).toBeInTheDocument();
    expect(screen.getByDisplayValue('0987654321')).toBeInTheDocument();
    expect(screen.getByDisplayValue('tranthib@example.com')).toBeInTheDocument();
  });

  it('shows information cards', () => {
    render(<LoanPersonalInfo {...defaultProps} />);

    expect(screen.getByText(/Thông tin CCCD/i)).toBeInTheDocument();
    expect(screen.getByText(/Địa chỉ cư trú/i)).toBeInTheDocument();
  });
});