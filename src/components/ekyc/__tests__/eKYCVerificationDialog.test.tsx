/**
 * eKYC Verification Dialog Tests
 * Unit tests for the enhanced eKYC verification dialog component
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { eKYCVerificationDialog } from '../eKYCVerificationDialog';
import { VIETNAMESE_DOCUMENT_TYPES } from '@/lib/ekyc/document-types';

// Mock the hooks and stores
vi.mock('@/hooks/use-ekyc-verification', () => ({
  useEkycVerification: vi.fn(() => ({
    isInitialized: true,
    isProcessing: false,
    isCompleted: false,
    progress: 50,
    error: undefined,
    errors: [],
    warnings: [],
    initializeSession: vi.fn(),
    startVerification: vi.fn(),
    captureDocument: vi.fn(),
    captureFace: vi.fn(),
    completeVerification: vi.fn(),
    reset: vi.fn(),
    validateImage: vi.fn(() => Promise.resolve(true)),
  })),
}));

vi.mock('@/store/use-ekyc-store', () => ({
  useEkycStore: vi.fn(() => ({
    status: 'running',
    steps: [
      { id: 'document_front', status: 'completed', progress: 100 },
      { id: 'document_back', status: 'in_progress', progress: 50 },
      { id: 'face_capture', status: 'pending', progress: 0 },
    ],
    currentStep: 'document_back',
    progress: 50,
    error: undefined,
    errors: [],
    warnings: [],
    formData: {
      fullName: 'Nguyễn Văn A',
      dateOfBirth: '1990-01-01',
      gender: 'male',
      address: 'Hà Nội',
    },
    isValid: vi.fn(() => false),
  })),
}));

// Mock the components
vi.mock('../DocumentScanner', () => ({
  default: vi.fn(() => <div data-testid="document-scanner">Document Scanner</div>),
}));

vi.mock('../FaceVerification', () => ({
  default: vi.fn(() => <div data-testid="face-verification">Face Verification</div>),
}));

describe('eKYCVerificationDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onCancel: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dialog when open', () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      expect(screen.getByText('Xác thực eKYC')).toBeInTheDocument();
      expect(screen.getByText('Vui lòng làm theo hướng dẫn để hoàn tất xác thực danh tính')).toBeInTheDocument();
    });

    it('should display progress indicator when not on welcome step', () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should show welcome step initially', () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      expect(screen.getByText('Chào mừng đến với eKYC')).toBeInTheDocument();
      expect(screen.getByText('Hệ thống xác thực danh tính điện tử an toàn và nhanh chóng')).toBeInTheDocument();
    });

    it('should render document selection step when on document_selection', async () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      // Simulate moving to document selection
      const startButton = screen.getByText('Bắt đầu xác thực');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Chọn loại giấy tờ')).toBeInTheDocument();
      });
    });
  });

  describe('Document Type Selection', () => {
    it('should display available document types', async () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const startButton = screen.getByText('Bắt đầu xác thực');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Chọn loại giấy tờ')).toBeInTheDocument();
        expect(screen.getByText('Căn cước công dân gắn chip')).toBeInTheDocument();
        expect(screen.getByText('Hộ chiếu Việt Nam')).toBeInTheDocument();
        expect(screen.getByText('Bằng lái xe Việt Nam')).toBeInTheDocument();
      });
    });

    it('should allow selecting a document type', async () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const startButton = screen.getByText('Bắt đầu xác thực');
      fireEvent.click(startButton);

      await waitFor(() => {
        const cccdOption = screen.getByText('Căn cước công dân gắn chip');
        fireEvent.click(cccd);
      });

      expect(screen.getByText('Căn cước công dân gắn chip được chọn')).toBeInTheDocument();
    });

    it('should prevent proceeding without document type selection', async () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const startButton = screen.getByText('Bắt đầu xác thực');
      fireEvent.click(startButton);

      await waitFor(() => {
        const nextButton = screen.getByText('Tiếp tục');
        fireEvent.click(nextButton);
      });

      expect(screen.getByText('Please select a document type')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should allow going back to previous step', async () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const startButton = screen.getByText('Bắt đầu xác thực');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Chọn loại giấy tờ')).toBeInTheDocument();
        const backButton = screen.getByText('Quay lại');
        fireEvent.click(backButton);
      });

      expect(screen.getByText('Chào mừng đến với eKYC')).toBeInTheDocument();
    });

    it('should close dialog when cancel is clicked', () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const closeButton = screen.getByRole('button', { name: '' });
      fireEvent.click(closeButton);

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('Error Handling', () => {
    it('should display error state when verification fails', async () => {
      const mockUseEkycVerification = vi.fn(() => ({
        isInitialized: true,
        isProcessing: false,
        isCompleted: false,
        progress: 0,
        error: 'Network error',
        errors: ['Failed to connect to server'],
        warnings: ['Low image quality'],
        initializeSession: vi.fn(),
        startVerification: vi.fn(),
        captureDocument: vi.fn(),
        captureFace: vi.fn(),
        completeVerification: vi.fn(),
        reset: vi.fn(),
        validateImage: vi.fn(() => Promise.resolve(false)),
      }));

      vi.doMock('@/hooks/use-ekyc-verification', () => ({
        useEkycVerification: mockUseEkycVerification,
      }));

      render(<eKYCVerificationDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Xác thực thất bại')).toBeInTheDocument();
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should allow retry when verification fails and retry is allowed', async () => {
      vi.doMock('@/hooks/use-ekyc-verification', () => ({
        useEkycVerification: vi.fn(() => ({
          isInitialized: true,
          isProcessing: false,
          isCompleted: false,
          progress: 0,
          error: 'Verification failed',
          errors: ['Invalid document'],
          warnings: [],
          initializeSession: vi.fn(),
          startVerification: vi.fn(),
          captureDocument: vi.fn(),
          captureFace: vi.fn(),
          completeVerification: vi.fn(),
          reset: vi.fn(),
          validateImage: vi.fn(() => Promise.resolve(false)),
        })),
      }));

      render(<eKYCVerificationDialog {...defaultProps} allowRetry />);

      await waitFor(() => {
        expect(screen.getByText('Thử lại')).toBeInTheDocument();
      });
    });
  });

  describe('Success State', () => {
    it('should display success message when verification completes', async () => {
      vi.doMock('@/hooks/use-ekyc-verification', () => ({
        useEkycVerification: vi.fn(() => ({
          isInitialized: true,
          isProcessing: false,
          isCompleted: true,
          progress: 100,
          error: undefined,
          errors: [],
          warnings: [],
          initializeSession: vi.fn(),
          startVerification: vi.fn(),
          captureDocument: vi.fn(),
          captureFace: vi.fn(),
          completeVerification: vi.fn(),
          reset: vi.fn(),
          validateImage: vi.fn(() => Promise.resolve(true)),
        })),
      }));

      vi.doMock('@/store/use-ekyc-store', () => ({
        useEkycStore: vi.fn(() => ({
          status: 'success',
          steps: [
            { id: 'document_front', status: 'completed', progress: 100 },
            { id: 'document_back', status: 'completed', progress: 100 },
            { id: 'face_capture', status: 'completed', progress: 100 },
          ],
          currentStep: 'results',
          progress: 100,
          error: undefined,
          errors: [],
          warnings: [],
          formData: {
            fullName: 'Nguyễn Văn A',
            dateOfBirth: '1990-01-01',
            gender: 'male',
            address: 'Hà Nội',
          },
          comparison: {
            isMatch: true,
            similarity: 95,
          },
          isValid: vi.fn(() => true),
        })),
      }));

      render(<eKYCVerificationDialog {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Xác thực thành công!')).toBeInTheDocument();
        expect(screen.getByText('Danh tính của bạn đã được xác thực thành công')).toBeInTheDocument();
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
        expect(screen.getByText('01/01/1990')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('should support keyboard navigation', async () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const startButton = screen.getByText('Bắt đầu xác thực');
      startButton.focus();
      fireEvent.keyDown(startButton, { key: 'Enter' });

      await waitFor(() => {
        expect(defaultProps.onOpenChange).toHaveBeenCalled();
      });
    });
  });

  describe('Props and Configuration', () => {
    it('should use custom document type when provided', async () => {
      render(
        <eKYCVerificationDialog
          {...defaultProps}
          documentType={VIETNAMESE_DOCUMENT_TYPES.CCCD_CHIP}
        />
      );

      const startButton = screen.getByText('Bắt đầu xác thực');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Căn cước công dân gắn chip được chọn')).toBeInTheDocument();
      });
    });

    it('should auto-start verification when autoStart is true', () => {
      render(<eKYCVerificationDialog {...defaultProps} autoStart />);

      expect(screen.getByText('Đang xử lý xác thực')).toBeInTheDocument();
    });

    it('should call onSuccess callback when verification completes', async () => {
      const onSuccess = vi.fn();

      vi.doMock('@/hooks/use-ekyc-verification', () => ({
        useEkycVerification: vi.fn(() => ({
          isInitialized: true,
          isProcessing: false,
          isCompleted: true,
          progress: 100,
          error: undefined,
          errors: [],
          warnings: [],
          initializeSession: vi.fn(),
          startVerification: vi.fn(),
          captureDocument: vi.fn(),
          captureFace: vi.fn(),
          completeVerification: vi.fn(),
          reset: vi.fn(),
          validateImage: vi.fn(() => Promise.resolve(true)),
        })),
      }));

      render(<eKYCVerificationDialog {...defaultProps} onSuccess={onSuccess} />);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should call onError callback when verification fails', async () => {
      const onError = vi.fn();

      vi.doMock('@/hooks/use-ekyc-verification', () => ({
        useEkycVerification: vi.fn(() => ({
          isInitialized: true,
          isProcessing: false,
          isCompleted: false,
          progress: 0,
          error: 'Verification failed',
          errors: ['Invalid document'],
          warnings: [],
          initializeSession: vi.fn(),
          startVerification: vi.fn(),
          captureDocument: vi.fn(),
          captureFace: vi.fn(),
          completeVerification: vi.fn(),
          reset: vi.fn(),
          validateImage: vi.fn(() => Promise.resolve(false)),
        })),
      }));

      render(<eKYCVerificationDialog {...defaultProps} onError={onError} />);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Verification failed');
      });
    });
  });

  describe('Vietnamese Localization', () => {
    it('should display all text in Vietnamese', () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      expect(screen.getByText('Xác thực eKYC')).toBeInTheDocument();
      expect(screen.getByText('Nhanh chóng')).toBeInTheDocument();
      expect(screen.getByText('An toàn')).toBeInTheDocument();
      expect(screen.getByText('Chính xác')).toBeInTheDocument();
      expect(screen.getByText('Đa dạng')).toBeInTheDocument();
    });

    it('should use Vietnamese document type names', async () => {
      render(<eKYCVerificationDialog {...defaultProps} />);

      const startButton = screen.getByText('Bắt đầu xác thực');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(screen.getByText('Căn cước công dân gắn chip')).toBeInTheDocument();
        expect(screen.getByText('Hộ chiếu Việt Nam')).toBeInTheDocument();
        expect(screen.getByText('Chứng minh thư nhân dân (9 số)')).toBeInTheDocument();
      });
    });
  });
});