import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
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
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
  useMessages: () => ({}),
  getTranslations: () => ({}),
}));

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

// Mock @tanstack/react-query
vi.mock("@tanstack/react-query", () => {
  const React = require("react");
  return {
    useQuery: () => ({
      data: undefined,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }),
    useMutation: () => ({
      mutate: vi.fn(),
      mutateAsync: vi.fn(),
      isLoading: false,
      error: null,
    }),
    QueryClient: vi.fn(),
    QueryClientProvider: ({ children }: { children: React.ReactNode }) =>
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

// Setup MSW
import { server } from "./mocks/server";

// Start MSW server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: "warn" }));

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
