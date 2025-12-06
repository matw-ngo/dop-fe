// Test setup for loan components
// Mocks and utilities for testing

import "@testing-library/jest-dom";
import { beforeAll, vi } from "vitest";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/loan/application",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Mock date-fns
vi.mock("date-fns", () => ({
  format: (date: Date, formatStr: string) => date.toLocaleDateString(),
  vi: { locale: "vi" },
}));

// Mock API calls
vi.mock("@/lib/api/endpoints/loans", () => ({
  loanApi: {
    getProvinces: vi.fn(() =>
      Promise.resolve([
        {
          code: "01",
          name: "Thành phố Hà Nội",
          nameWithType: "Thành phố Hà Nội",
        },
        {
          code: "79",
          name: "Thành phố Hồ Chí Minh",
          nameWithType: "Thành phố Hồ Chí Minh",
        },
      ]),
    ),
    getDistricts: vi.fn(() =>
      Promise.resolve([
        { code: "001", name: "Quận Ba Đình", nameWithType: "Quận Ba Đình" },
        { code: "002", name: "Quận Hoàn Kiếm", nameWithType: "Quận Hoàn Kiếm" },
      ]),
    ),
    getWards: vi.fn(() =>
      Promise.resolve([
        {
          code: "00001",
          name: "Phường Phúc Xá",
          nameWithType: "Phường Phúc Xá",
        },
        {
          code: "00002",
          name: "Phường Trúc Bạch",
          nameWithType: "Phường Trúc Bạch",
        },
      ]),
    ),
    getBanks: vi.fn(() =>
      Promise.resolve([
        { code: "VCB", name: "Ngân hàng TMCP Ngoại thương Việt Nam" },
        { code: "TCB", name: "Ngân hàng TMCP Kỹ thương Việt Nam" },
      ]),
    ),
    getIncomeSources: vi.fn(() => Promise.resolve([])),
    getEmploymentTypes: vi.fn(() => Promise.resolve([])),
    checkEligibility: vi.fn(() =>
      Promise.resolve({ eligible: true, message: "Đủ điều kiện vay" }),
    ),
    submitFinalApplication: vi.fn(() =>
      Promise.resolve({
        success: true,
        applicationId: "APP123456",
        referenceNumber: "REF123456",
      }),
    ),
    saveDraftApplication: vi.fn(() => Promise.resolve({ success: true })),
    validateApplicationData: vi.fn(() => Promise.resolve({ valid: true })),
  },
}));

// Mock file operations
global.File = class File {
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(chunks: any[], filename: string, options: FilePropertyBag = {}) {
    this.name = filename;
    this.size = chunks.reduce((acc, chunk) => acc + (chunk?.length || 0), 0);
    this.type = options.type || "";
    this.lastModified = Date.now();
  }
} as any;

global.FileReader = class FileReader {
  result: string | ArrayBuffer | null = null;
  error: any = null;
  readyState: number = 0;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;

  readAsDataURL = vi.fn((file: File) => {
    setTimeout(() => {
      this.result = `data:${file.type};base64,mock-base64-data`;
      this.readyState = 2;
      if (this.onload) this.onload({ target: this } as any);
    }, 0);
  });

  readAsText = vi.fn(() => {
    setTimeout(() => {
      this.result = "mock-text-content";
      this.readyState = 2;
      if (this.onload) this.onload({ target: this } as any);
    }, 0);
  });
} as any;

// Mock XMLHttpRequest for file uploads
global.XMLHttpRequest = class XMLHttpRequest {
  status: number = 200;
  readyState: number = 4;
  response: string = "";
  responseText: string = "";
  upload: any = { addEventListener: vi.fn() };
  timeout: number = 0;

  open = vi.fn();
  send = vi.fn();
  setRequestHeader = vi.fn();
  addEventListener = vi.fn();

  constructor() {
    // Mock implementation
  }
} as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn((index: number) => null),
};
global.localStorage = localStorageMock;

// Setup test environment
beforeAll(() => {
  // Suppress console errors in tests
  vi.spyOn(console, "error").mockImplementation(() => {});
});
