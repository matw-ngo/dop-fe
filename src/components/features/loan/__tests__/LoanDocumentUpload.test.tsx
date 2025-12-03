import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoanDocumentUpload } from '../LoanDocumentUpload';
import type { DocumentUploadData } from '@/types/forms/loan-form';

// Mock the store
vi.mock('@/store/use-loan-store', () => ({
  useLoanApplicationStore: () => ({
    updateDocuments: vi.fn(),
    setDocumentUploadStatus: vi.fn(),
    documentUploadStatus: {},
  }),
}));

// Mock EkycSdkWrapper
vi.mock('@/components/features/ekyc/ekyc-sdk-wrapper', () => ({
  default: () => <div>eKYC Component</div>,
}));

describe('LoanDocumentUpload', () => {
  const mockOnSubmit = vi.fn();
  const defaultProps = {
    applicationId: 'APP123456',
    onSubmit: mockOnSubmit,
    isLoading: false,
    readOnly: false,
    enableEkyc: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders document upload form correctly', () => {
    render(<LoanDocumentUpload {...defaultProps} />);

    expect(screen.getByText(/Tải lên giấy tờ/i)).toBeInTheDocument();
    expect(screen.getByText(/Căn cước công dân/i)).toBeInTheDocument();
    expect(screen.getByText(/Xác minh khuôn mặt/i)).toBeInTheDocument();
    expect(screen.getByText(/Giấy tờ chứng minh địa chỉ/i)).toBeInTheDocument();
    expect(screen.getByText(/Giấy tờ chứng minh thu nhập/i)).toBeInTheDocument();
  });

  it('shows required document badges', () => {
    render(<LoanDocumentUpload {...defaultProps} />);

    expect(screen.getByText('Bắt buộc')).toBeInTheDocument();
  });

  it('shows eKYC integration section when enabled', () => {
    render(<LoanDocumentUpload {...defaultProps} enableEkyc={true} />);

    expect(screen.getByText(/Xác minh điện tử \(eKYC\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Bắt đầu eKYC/i })).toBeInTheDocument();
  });

  it('hides eKYC integration section when disabled', () => {
    render(<LoanDocumentUpload {...defaultProps} enableEkyc={false} />);

    expect(screen.queryByText(/Xác minh điện tử \(eKYC\)/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bắt đầu eKYC/i })).not.toBeInTheDocument();
  });

  it('validates file size limits', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create a mock file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large-file.jpg', {
      type: 'image/jpeg',
    });

    const fileInput = screen.getByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInput, [largeFile]);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/Kích thước file không được vượt quá 5MB/i)).toBeInTheDocument();
    });
  });

  it('validates file type restrictions', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create a mock file with invalid type for national ID (should be image only)
    const invalidFile = new File(['content'], 'document.pdf', {
      type: 'application/pdf',
    });

    // Find the first file input (for national ID)
    const fileInputs = screen.getAllByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInputs[0], [invalidFile]);

    // Should show validation error for invalid file type
    await waitFor(() => {
      expect(screen.getByText(/Chỉ chấp nhận file định dạng/i)).toBeInTheDocument();
    });
  });

  it('handles file selection and preview', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create a mock image file
    const imageFile = new File(['content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    const fileInput = screen.getByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInput, [imageFile]);

    // Should show file preview and info
    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
      expect(screen.getByText('0.0MB')).toBeInTheDocument();
    });
  });

  it('removes uploaded files correctly', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create and upload a file
    const imageFile = new File(['content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    const fileInput = screen.getByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInput, [imageFile]);

    // Wait for file to appear
    await waitFor(() => {
      expect(screen.getByText('test-image.jpg')).toBeInTheDocument();
    });

    // Remove the file
    const removeButton = screen.getByRole('button', { name: '' }); // Trash button
    await user.click(removeButton);

    // File should be removed
    expect(screen.queryByText('test-image.jpg')).not.toBeInTheDocument();
  });

  it('handles document type selection for address proof', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Should show address proof document types
    expect(screen.getByText(/Hóa đơn điện\/nước\/tháng/)).toBeInTheDocument();
    expect(screen.getByText(/Hợp đồng thuê nhà/)).toBeInTheDocument();
    expect(screen.getByText(/Sổ hộ khẩu/)).toBeInTheDocument();

    // Click on a document type
    const rentalOption = screen.getByText(/Hợp đồng thuê nhà/);
    await user.click(rentalOption);

    // Should be selected
    expect(rentalOption.closest('[class*="border-blue-200"]')).toBeInTheDocument();
  });

  it('handles document type selection for income proof', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Find income proof section
    const incomeProofSelect = screen.getByRole('combobox', { name: '' });
    await user.click(incomeProofSelect);
    await user.click(screen.getByText(/Sao kê tài khoản ngân hàng/));

    expect(incomeProofSelect).toHaveValue('bank_statement');
  });

  it('handles document type selection for employment proof', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Find employment proof section
    const employmentSelect = screen.getAllByRole('combobox')[2]; // Third select
    await user.click(employmentSelect);
    await user.click(screen.getByText(/Giấy phép kinh doanh/));

    expect(employmentSelect).toHaveValue('business_license');
  });

  it('respects file limits per document type', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create multiple mock files
    const files = Array.from({ length: 10 }, (_, i) =>
      new File(['content'], `test-file-${i}.jpg`, { type: 'image/jpeg' })
    );

    const fileInput = screen.getByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInput, files);

    // Should show validation error for exceeding limit
    await waitFor(() => {
      expect(screen.getByText(/Chỉ được tải lên tối đa 2 file/i)).toBeInTheDocument();
    });
  });

  it('shows upload progress during file upload', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create a mock file
    const imageFile = new File(['content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    const fileInput = screen.getByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInput, [imageFile]);

    // Should show upload progress (mocked)
    await waitFor(() => {
      expect(screen.getByText(/100% đã tải lên/i)).toBeInTheDocument();
    });
  });

  it('displays upload completion status', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create and upload a file
    const imageFile = new File(['content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    const fileInput = screen.getByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInput, [imageFile]);

    // Should show completion status
    await waitFor(() => {
      expect(screen.getByText('Hoàn thành')).toBeInTheDocument();
    });
  });

  it('handles upload errors gracefully', async () => {
    // Mock upload failure
    vi.mocked(require('@/lib/api/endpoints/loans').loanApi.uploadDocument).mockRejectedValue(
      new Error('Upload failed')
    );

    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create and upload a file
    const imageFile = new File(['content'], 'test-image.jpg', {
      type: 'image/jpeg',
    });

    const fileInput = screen.getByLabelText(/Chọn file để tải lên/i);
    await user.upload(fileInput, [imageFile]);

    // Should show upload error
    await waitFor(() => {
      expect(screen.getByText(/Tải lên thất bại/i)).toBeInTheDocument();
    });
  });

  it('validates all required documents before submission', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Try to submit without uploading required documents
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    await user.click(submitButton);

    // Button should be disabled if required documents are missing
    expect(submitButton).toBeDisabled();
  });

  it('enables submission when all required documents are uploaded', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Upload files for required document types
    const files = Array.from({ length: 5 }, (_, i) =>
      new File(['content'], `required-file-${i}.jpg`, { type: 'image/jpeg' })
    );

    const fileInputs = screen.getAllByLabelText(/Chọn file để tải lên/i);

    // Upload to all required sections (first 4 sections)
    for (let i = 0; i < 4; i++) {
      await user.upload(fileInputs[i], [files[i]]);
    }

    // Wait for uploads to complete
    await waitFor(() => {
      expect(screen.getByText('Đã tải lên đầy đủ giấy tờ')).toBeInTheDocument();
    });

    // Submit button should be enabled
    const submitButton = screen.getByRole('button', { name: /Tiếp tục/i });
    expect(submitButton).not.toBeDisabled();
  });

  it('shows completion percentage', () => {
    render(<LoanDocumentUpload {...defaultProps} />);

    expect(screen.getByText('0% hoàn thành')).toBeInTheDocument();
  });

  it('disables all functionality in read-only mode', () => {
    render(<LoanDocumentUpload {...defaultProps} readOnly={true} />);

    // File inputs should be disabled
    expect(screen.queryByLabelText(/Chọn file để tải lên/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Bắt đầu eKYC/i })).not.toBeInTheDocument();
  });

  it('shows loading state during submission', () => {
    render(<LoanDocumentUpload {...defaultProps} isLoading={true} />);

    const submitButton = screen.getByRole('button', { name: /Đang tải lên/i });
    expect(submitButton).toBeDisabled();
  });

  it('opens eKYC dialog when eKYC button is clicked', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    const ekycButton = screen.getByRole('button', { name: /Bắt đầu eKYC/i });
    await user.click(ekycButton);

    // Should show eKYC dialog (mocked)
    await waitFor(() => {
      expect(screen.getByText('eKYC Component')).toBeInTheDocument();
    });
  });

  it('shows information cards', () => {
    render(<LoanDocumentUpload {...defaultProps} />);

    expect(screen.getByText(/Chất lượng ảnh/i)).toBeInTheDocument();
    expect(screen.getByText(/Bảo mật thông tin/i)).toBeInTheDocument();
    expect(screen.getByText(/Thời gian xử lý/i)).toBeInTheDocument();
  });

  it('handles drag and drop file upload', async () => {
    const user = userEvent.setup();
    render(<LoanDocumentUpload {...defaultProps} />);

    // Create a mock file
    const imageFile = new File(['content'], 'dragged-file.jpg', {
      type: 'image/jpeg',
    });

    // Find the drop zone
    const dropZone = screen.getByText(/hoặc kéo thả file vào đây/i).closest('div');

    if (dropZone) {
      // Simulate drag and drop
      fireEvent.dragEnter(dropZone);
      fireEvent.dragOver(dropZone);
      fireEvent.drop(dropZone, {
        dataTransfer: {
          files: [imageFile],
        },
      });

      // Should show the uploaded file
      await waitFor(() => {
        expect(screen.getByText('dragged-file.jpg')).toBeInTheDocument();
      });
    }
  });
});