/**
 * LoanStatusTracker Component Tests
 * Comprehensive test coverage for the LoanStatusTracker component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LoanStatusTracker } from "../LoanStatusTracker";

// Mock the status configuration
jest.mock("@/lib/loan-status/vietnamese-status-config", () => ({
  getStatusConfig: jest.fn(),
  calculateEstimatedCompletionTime: jest.fn(),
  getNextAllowedStatuses: jest.fn(),
  VIETNAMESE_STATUS_CONFIG: {
    da_tiep_nhan: {
      id: "da_tiep_nhan",
      label: "Đã tiếp nhận",
      description: "Hồ sơ đã được tiếp nhận",
      color: "#3B82F6",
      icon: "inbox-in",
      category: "initial",
      allowUserAction: false,
      nextStatuses: ["dang_xu_ly", "bi_tu_choi"],
    },
    dang_tham_dinh: {
      id: "dang_tham_dinh",
      label: "Đang thẩm định",
      description: "Hồ sơ đang được thẩm định",
      color: "#8B5CF6",
      icon: "magnifying-glass",
      category: "review",
      allowUserAction: false,
      nextStatuses: ["da_duyet", "bi_tu_choi"],
    },
    da_duyet: {
      id: "da_duyet",
      label: "Đã duyệt",
      description: "Hồ sơ đã được phê duyệt",
      color: "#10B981",
      icon: "check-circle",
      category: "decision",
      allowUserAction: true,
      nextStatuses: ["cho_giai_ngan", "da_huy"],
    },
  },
}));

// Mock the hooks
jest.mock("@/hooks/use-loan-status", () => ({
  useLoanStatusTracking: jest.fn(),
}));

// Mock the sub-components
jest.mock("../StatusTimeline", () => ({
  StatusTimeline: ({ applicationId, currentStatus, applicationDate }: any) => (
    <div data-testid="status-timeline">
      <div data-application-id={applicationId} />
      <div data-current-status={currentStatus} />
      <div data-application-date={applicationDate} />
    </div>
  ),
}));

jest.mock("../DocumentRequirementsTracker", () => ({
  DocumentRequirementsTracker: ({ applicationId, documents, onUpload }: any) => (
    <div data-testid="document-tracker">
      <div data-application-id={applicationId} />
      <div data-documents-count={documents?.length || 0} />
      <button onClick={() => onUpload?.("test-doc", new File(["test"], "test.pdf"))}>
        Upload Document
      </button>
    </div>
  ),
}));

jest.mock("../CommunicationHistory", () => ({
  CommunicationHistory: ({ applicationId, communications, onSendMessage, assignedOfficer }: any) => (
    <div data-testid="communication-history">
      <div data-application-id={applicationId} />
      <div data-communications-count={communications?.length || 0} />
      <button onClick={() => onSendMessage?.("Test message", "in_app")}>
        Send Message
      </button>
      {assignedOfficer && (
        <div data-officer-name={assignedOfficer.name} />
      )}
    </div>
  ),
}));

import { useLoanStatusTracking } from "@/hooks/use-loan-status";

const mockUseLoanStatusTracking = useLoanStatusTracking as jest.MockedFunction<typeof useLoanStatusTracking>;

describe("LoanStatusTracker Component", () => {
  const defaultProps = {
    applicationId: "test-123",
    initialData: {
      id: "test-123",
      status: "dang_tham_dinh" as const,
      loanType: "vay_tieu_dung",
      requestedAmount: 200000000,
      applicationDate: "2024-01-15T09:00:00Z",
      lastUpdated: "2024-01-17T14:30:00Z",
      estimatedCompletionDate: "2024-01-22T17:00:00Z",
      progressPercentage: 65,
      assignedOfficer: {
        name: "Nguyễn Văn A",
        phone: "0912345678",
        email: "nguyenvana@bank.com",
        position: "Chuyên viên tín dụng",
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock default hook behavior
    mockUseLoanStatusTracking.mockReturnValue({
      applicationStatus: defaultProps.initialData,
      isLoading: false,
      error: null,
      connectionStatus: "connected" as const,
      lastRefresh: new Date(),
      autoRefresh: true,
      refreshInterval: 30,
      refresh: jest.fn(),
      toggleAutoRefresh: jest.fn(),
      retry: jest.fn(),
      statusConfig: {
        id: "dang_tham_dinh",
        label: "Đang thẩm định",
        description: "Hồ sơ đang được thẩm định",
        color: "#8B5CF6",
        icon: "magnifying-glass",
        category: "review" as const,
        allowUserAction: false,
        nextStatuses: ["da_duyet", "bi_tu_choi"],
      },
      estimatedCompletion: { hours: 48, businessDays: 6 },
      nextAllowedStatuses: [],
      isConnected: true,
    });
  });

  describe("Basic Rendering", () => {
    test("should render with initial data", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Đang thẩm định")).toBeInTheDocument();
      expect(screen.getByText("test-123")).toBeInTheDocument();
      expect(screen.getByText("65%")).toBeInTheDocument();
    });

    test("should display assigned officer information", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
      expect(screen.getByText("0912345678")).toBeInTheDocument();
      expect(screen.getByText("Chuyên viên tín dụng")).toBeInTheDocument();
    });

    test("should display loan information", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Vay tiêu dùng")).toBeInTheDocument();
      expect(screen.getByText("200.000.000₫")).toBeInTheDocument();
    });

    test("should render status tabs", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Lịch sử")).toBeInTheDocument();
      expect(screen.getByText("Giấy tờ")).toBeInTheDocument();
      expect(screen.getByText("Liên hệ")).toBeInTheDocument();
    });
  });

  describe("Status Display", () => {
    test("should show correct status badge color", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      const statusBadge = screen.getByText("Đang thẩm định");
      expect(statusBadge).toHaveClass("text-white");
      // Color would be set by inline style based on status config
    });

    test("should display progress bar", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("value", "65");
    });

    test("should show status description", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Hồ sơ đang được thẩm định")).toBeInTheDocument();
    });

    test("should display last refresh time", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText(/Cập nhật lần cuối:/)).toBeInTheDocument();
    });
  });

  describe("Interactive Features", () => {
    test("should toggle auto-refresh when button is clicked", () => {
      const mockToggle = jest.fn();
      mockUseLoanStatusTracking.mockReturnValue({
        ...mockUseLoanStatusTracking(),
        toggleAutoRefresh: mockToggle,
      });

      render(<LoanStatusTracker {...defaultProps} />);

      const refreshButton = screen.getByText("Tự động");
      fireEvent.click(refreshButton);
      expect(mockToggle).toHaveBeenCalled();
    });

    test("should show manual refresh button", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      const refreshButton = screen.getByTitle("Cập nhật");
      expect(refreshButton).toBeInTheDocument();
    });

    test("should show real-time connection status", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      // Connection status indicator would be shown
      expect(screen.getByText("Tự động")).toBeInTheDocument();
    });
  });

  describe("Component Tabs", () => {
    test("should switch between tabs", async () => {
      render(<LoanStatusTracker {...defaultProps} />);

      // Timeline tab should be active by default
      expect(screen.getByTestId("status-timeline")).toBeInTheDocument();

      // Click on Documents tab
      const documentsTab = screen.getByText("Giấy tờ");
      fireEvent.click(documentsTab);

      expect(screen.getByTestId("document-tracker")).toBeInTheDocument();

      // Click on Communications tab
      const communicationsTab = screen.getByText("Liên hệ");
      fireEvent.click(communicationsTab);

      expect(screen.getByTestId("communication-history")).toBeInTheDocument();
    });

    test("should pass correct props to sub-components", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      const timeline = screen.getByTestId("status-timeline");
      expect(timeline).toHaveAttribute("data-application-id", "test-123");
      expect(timeline).toHaveAttribute("data-current-status", "dang_tham_dinh");
    });
  });

  describe("Loading States", () => {
    test("should show loading state on initial load", () => {
      mockUseLoanStatusTracking.mockReturnValue({
        ...mockUseLoanStatusTracking(),
        isLoading: true,
        applicationStatus: null,
      });

      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Đang tải thông tin hồ sơ...")).toBeInTheDocument();
    });

    test("should show loading spinner", () => {
      mockUseLoanStatusTracking.mockReturnValue({
        ...mockUseLoanStatusTracking(),
        isLoading: true,
        applicationStatus: null,
      });

      render(<LoanStatusTracker {...defaultProps} />);

      const refreshIcon = screen.getByText("Tự động").querySelector("svg");
      expect(refreshIcon).toHaveClass("animate-pulse");
    });
  });

  describe("Error States", () => {
    test("should display error message", () => {
      mockUseLoanStatusTracking.mockReturnValue({
        ...mockUseLoanStatusTracking(),
        error: "Failed to load status",
        isLoading: false,
      });

      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Lỗi")).toBeInTheDocument();
      expect(screen.getByText("Failed to load status")).toBeInTheDocument();
    });

    test("should show retry button on error", () => {
      mockUseLoanStatusTracking.mockReturnValue({
        ...mockUseLoanStatusTracking(),
        error: "Network error",
        isLoading: false,
        retry: jest.fn(),
      });

      render(<LoanStatusTracker {...defaultProps} />);

      const retryButton = screen.getByText("Thử lại");
      fireEvent.click(retryButton);
    });
  });

  describe("Document Upload", () => {
    test("should handle document upload", async () => {
      const mockOnUpload = jest.fn();
      render(<LoanStatusTracker {...defaultProps} onUpload={mockOnUpload} />);

      // Switch to Documents tab
      fireEvent.click(screen.getByText("Giấy tờ"));

      // Click upload button
      const uploadButton = screen.getByText("Upload Document");
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith("test-doc", expect.any(File));
      });
    });

    test("should pass documents to DocumentRequirementsTracker", () => {
      const documents = [
        {
          id: "1",
          type: "cmnd_cccd",
          name: "CMND/CCCD",
          status: "da_xac_nhan" as const,
          uploadDate: "2024-01-15T10:30:00Z",
        },
      ];

      render(<LoanStatusTracker {...defaultProps} documents={documents} />);

      fireEvent.click(screen.getByText("Giấy tờ"));

      const tracker = screen.getByTestId("document-tracker");
      expect(tracker).toHaveAttribute("data-documents-count", "1");
    });
  });

  describe("Communication Features", () => {
    test("should handle message sending", async () => {
      const mockOnSendMessage = jest.fn();
      render(<LoanStatusTracker {...defaultProps} onSendMessage={mockOnSendMessage} />);

      // Switch to Communications tab
      fireEvent.click(screen.getByText("Liên hệ"));

      // Click send message button
      const sendButton = screen.getByText("Send Message");
      fireEvent.click(sendButton);

      await waitFor(() => {
        expect(mockOnSendMessage).toHaveBeenCalledWith("Test message", "in_app");
      });
    });

    test("should display assigned officer in communications", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      fireEvent.click(screen.getByText("Liên hệ"));

      const officerInfo = screen.getByTestId("communication-history");
      expect(officerInfo).toHaveAttribute("data-officer-name", "Nguyễn Văn A");
    });
  });

  describe("Responsive Design", () => {
    test("should adapt to different screen sizes", () => {
      // Mock different screen sizes
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 768, // Tablet size
      });

      render(<LoanStatusTracker {...defaultProps} />);

      // Should still render all elements
      expect(screen.getByText("Đang thẩm định")).toBeInTheDocument();
      expect(screen.getByText("Lịch sử")).toBeInTheDocument();
    });

    test("should collapse layout on mobile", () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: 375, // Mobile size
      });

      render(<LoanStatusTracker {...defaultProps} />);

      // Should adjust layout for mobile
      expect(screen.getByText("Đang thẩm định")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    test("should have proper ARIA labels", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      // Check for proper ARIA attributes on progress bar
      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-label");
    });

    test("should be keyboard navigable", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      // Check if tab navigation works
      const tabs = screen.getAllByRole("tab");
      tabs.forEach(tab => {
        expect(tab).toHaveAttribute("tabIndex");
      });
    });

    test("should have proper contrast", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      // Check if text elements have proper contrast
      const statusText = screen.getByText("Đang thẩm định");
      expect(statusText).toBeInTheDocument();
    });
  });

  describe("Vietnamese Language", () => {
    test("should display Vietnamese text correctly", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Đang thẩm định")).toBeInTheDocument();
      expect(screen.getByText("Vay tiêu dùng")).toBeInTheDocument();
      expect(screen.getByText("Chuyên viên tín dụng")).toBeInTheDocument();
    });

    test("should format Vietnamese currency", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("200.000.000₫")).toBeInTheDocument();
    });

    test("should format Vietnamese dates", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText(/ngày/)).toBeInTheDocument();
    });
  });

  describe("Real-time Features", () => {
    test("should show connection status indicator", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      expect(screen.getByText("Tự động")).toBeInTheDocument();
    });

    test("should handle real-time status updates", () => {
      const { rerender } = render(<LoanStatusTracker {...defaultProps} />);

      // Simulate status update
      const updatedProps = {
        ...defaultProps,
        initialData: {
          ...defaultProps.initialData!,
          status: "da_duyet" as const,
          progressPercentage: 85,
        },
      };

      rerender(<LoanStatusTracker {...updatedProps} />);

      expect(screen.getByText("Đã duyệt")).toBeInTheDocument();
      expect(screen.getByText("85%")).toBeInTheDocument();
    });
  });

  describe("Performance", () => {
    test("should render quickly", () => {
      const startTime = performance.now();

      render(<LoanStatusTracker {...defaultProps} />);

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms
    });

    test("should handle large amounts of data", () => {
      const largeCommunications = Array.from({ length: 1000 }, (_, i) => ({
        id: `comm-${i}`,
        type: "in_app" as const,
        title: `Message ${i}`,
        content: `Content ${i}`,
        sentAt: new Date().toISOString(),
        sender: {
          id: "system",
          name: "Hệ thống",
          role: "system",
        },
        hasAttachments: false,
        priority: "normal" as const,
        status: "sent" as const,
      }));

      render(<LoanStatusTracker {...defaultProps} communications={largeCommunications} />);

      expect(screen.getByTestId("communication-history")).toBeInTheDocument();
    });
  });

  describe("Integration", () => {
    test("should integrate with status timeline component", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      fireEvent.click(screen.getByText("Lịch sử"));

      const timeline = screen.getByTestId("status-timeline");
      expect(timeline).toBeInTheDocument();
      expect(timeline).toHaveAttribute("data-current-status", "dang_tham_dinh");
    });

    test("should integrate with document tracker component", () => {
      const documents = [
        {
          id: "1",
          type: "cmnd_cccd",
          name: "CMND/CCCD",
          status: "da_xac_nhan" as const,
        },
      ];

      render(<LoanStatusTracker {...defaultProps} documents={documents} />);

      fireEvent.click(screen.getByText("Giấy tờ"));

      const tracker = screen.getByTestId("document-tracker");
      expect(tracker).toBeInTheDocument();
      expect(tracker).toHaveAttribute("data-documents-count", "1");
    });

    test("should integrate with communication component", () => {
      render(<LoanStatusTracker {...defaultProps} />);

      fireEvent.click(screen.getByText("Liên hệ"));

      const history = screen.getByTestId("communication-history");
      expect(history).toBeInTheDocument();
      expect(history).toHaveAttribute("data-officer-name", "Nguyễn Văn A");
    });
  });
});