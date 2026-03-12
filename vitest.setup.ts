import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, vi } from "vitest";

// Skip MSW setup for now - can be added back when needed for specific tests
// MSW setup was causing test hangs, so we're using a minimal setup

// Mock ResizeObserver - must be on global object for Node.js environment
const mockResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

Object.defineProperty(global, "ResizeObserver", {
  writable: true,
  value: mockResizeObserver,
});

// Also set it directly in case it's accessed differently
global.ResizeObserver = mockResizeObserver;

// Mock @radix-ui/react-use-size which uses ResizeObserver internally
vi.mock("@radix-ui/react-use-size", () => ({
  useSize: () => ({ width: 100, height: 40 }),
}));

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  useServerInsertedHTML: () => null,
}));

// Mock Next.js Image component
vi.mock("next/image", () => {
  const React = require("react");
  return {
    default: (props: any) => {
      // eslint-disable-next-line jsx-a11y/alt-text
      return React.createElement("img", props);
    },
  };
});

// Mock next-intl
vi.mock("next-intl", () => {
  const createMockT = () => {
    const mockFn = (key: string) => key;
    mockFn.rich = (key: string, _values?: Record<string, unknown>) => key;
    mockFn.raw = (key: string) => key;
    mockFn.n = (key: string, _count: number) => key;
    return mockFn;
  };
  return {
    useTranslations: () => createMockT(),
    useLocale: () => "en",
    useMessages: () => ({}),
    getTranslations: () => createMockT(),
  };
});

// Mock next-themes
vi.mock("next-themes", () => {
  const React = require("react");
  return {
    useTheme: () => ({
      theme: "light",
      setTheme: vi.fn(),
      resolvedTheme: "light",
    }),
    ThemeProvider: ({ children }: { children: React.ReactNode }) =>
      React.createElement("div", null, children),
  };
});

// Mock recharts
vi.mock("recharts", () => {
  const React = require("react");
  const createNullComponent: any = () => () => null;
  const createPassthroughComponent =
    (tag: string = "div") =>
    ({ children, ...props }: any) =>
      React.createElement(tag, props, children);

  return {
    ResponsiveContainer: createPassthroughComponent("div"),
    BarChart: createPassthroughComponent("div"),
    Bar: createNullComponent(),
    XAxis: createNullComponent(),
    YAxis: createNullComponent(),
    CartesianGrid: createNullComponent(),
    Tooltip: createNullComponent(),
    Legend: createNullComponent(),
    LineChart: createPassthroughComponent("div"),
    Line: createNullComponent(),
    PieChart: createPassthroughComponent("div"),
    Pie: createNullComponent(),
    Cell: createNullComponent(),
  };
});

// Mock framer-motion
vi.mock("framer-motion", () => {
  const React = require("react");

  const createMotionComponent = (tag: string) => {
    return ({ children, ...props }: any) => {
      return React.createElement(tag, props, children);
    };
  };

  return {
    motion: {
      div: createMotionComponent("div"),
      span: createMotionComponent("span"),
      button: createMotionComponent("button"),
      form: createMotionComponent("form"),
      ul: createMotionComponent("ul"),
      li: createMotionComponent("li"),
      h1: createMotionComponent("h1"),
      h2: createMotionComponent("h2"),
      h3: createMotionComponent("h3"),
      p: createMotionComponent("p"),
      section: createMotionComponent("section"),
      article: createMotionComponent("article"),
      header: createMotionComponent("header"),
      footer: createMotionComponent("footer"),
      main: createMotionComponent("main"),
      nav: createMotionComponent("nav"),
      aside: createMotionComponent("aside"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// ============================================================================
// Global Test Utilities
// ============================================================================

// Increase timeout for async operations
vi.setConfig({
  testTimeout: 10000,
});

// Mock window.matchMedia
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

// ============================================================================
// Cleanup after each test
// ============================================================================

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});
