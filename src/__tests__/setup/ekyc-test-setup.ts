/**
 * eKYC Test Setup
 *
 * This file sets up the testing environment for eKYC tests:
 * - Mock implementations
 * - Test utilities
 * - Global configuration
 */

import { TextDecoder, TextEncoder } from "node:util";
import { afterEach, beforeEach, vi } from "vitest";

// Setup global mocks
(global as any).TextEncoder = TextEncoder;
(global as any).TextDecoder = TextDecoder;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock fetch API
global.fetch = vi.fn();

// Mock File API
global.File = class File {
  name: string;
  size: number;
  type: string;
  lastModified: number;

  constructor(chunks: any[], name: string, options: { type?: string } = {}) {
    this.name = name;
    this.size = chunks[0]?.length || 0;
    this.type = options.type || "application/octet-stream";
    this.lastModified = Date.now();
  }
} as any;

global.FileReader = class FileReader {
  result: string | ArrayBuffer | null = null;
  error: any = null;
  readyState: number = 0;
  onload: ((event: any) => void) | null = null;
  onerror: ((event: any) => void) | null = null;
  onloadend: ((event: any) => void) | null = null;

  EMPTY = 0;
  LOADING = 1;
  DONE = 2;

  readAsDataURL = vi.fn((_file: File) => {
    this.readyState = this.LOADING;
    setTimeout(() => {
      this.result = "data:image/png;base64,mock-image-data";
      this.readyState = this.DONE;
      this.onload?.({ target: this } as any);
      this.onloadend?.({ target: this } as any);
    }, 100);
  });

  readAsText = vi.fn((_file: File) => {
    this.readyState = this.LOADING;
    setTimeout(() => {
      this.result = "mock file content";
      this.readyState = this.DONE;
      this.onload?.({ target: this } as any);
      this.onloadend?.({ target: this } as any);
    }, 100);
  });
} as any;

// Mock Canvas API
global.HTMLCanvasElement.prototype.getContext = vi.fn().mockReturnValue({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Array(4),
    width: 1,
    height: 1,
  })),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => ({
    data: new Array(4),
    width: 1,
    height: 1,
  })),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
});

global.HTMLCanvasElement.prototype.toDataURL = vi.fn(
  () => "data:image/png;base64,mock-canvas-data",
);

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-object-url");
global.URL.revokeObjectURL = vi.fn();

// Mock Notification API
global.Notification = {
  requestPermission: vi.fn(() => Promise.resolve("granted")),
  permission: "granted" as NotificationPermission,
} as any;

// Mock Geolocation API
Object.defineProperty(global.navigator, "geolocation", {
  value: {
    getCurrentPosition: vi.fn((success) => {
      success({
        coords: {
          latitude: 10.7769,
          longitude: 106.7009,
        },
        timestamp: Date.now(),
      } as GeolocationPosition);
    }),
    watchPosition: vi.fn(),
  },
  writable: true,
});

// Mock MediaDevices API
Object.defineProperty(global.navigator, "mediaDevices", {
  value: {
    getUserMedia: vi.fn(() =>
      Promise.resolve({
        getTracks: () => [
          {
            stop: vi.fn(),
          },
        ],
      }),
    ),
    enumerateDevices: vi.fn(() => Promise.resolve([])),
  },
  writable: true,
});

// Mock Performance API
global.performance.mark = vi.fn();
global.performance.measure = vi.fn();
global.performance.getEntriesByName = vi.fn(() => []);

// Mock Crypto API
global.crypto = {
  getRandomValues: vi.fn((arr) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  }),
  subtle: {
    digest: vi.fn(() => Promise.resolve(new ArrayBuffer(0))),
  },
} as any;

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
beforeEach(() => {
  console.log = vi.fn();
  console.warn = vi.fn();
  console.error = vi.fn();
});

afterEach(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});

// Reset all mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Mock environment variables
process.env = {
  ...process.env,
  NODE_ENV: "test",
  NEXT_PUBLIC_EKYC_ENVIRONMENT: "test",
  NEXT_PUBLIC_EKYC_API_URL: "https://test-api.ekyc.com",
  NEXT_PUBLIC_EKYC_AUTH_TOKEN: "test-token",
};
