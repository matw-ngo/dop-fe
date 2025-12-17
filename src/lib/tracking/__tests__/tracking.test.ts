/**
 * Tests for the tracking module
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  EventType,
  filterSensitiveData,
  getDeviceId,
  getSessionId,
  hasUserConsent,
  initializeSession,
  isDNTEnabled,
  setUserConsent,
  shouldEnableTracking,
  trackEvent,
  trackLoanCalculator,
  trackSalaryCalculator,
  trackSavingsCalculator,
} from "../index";

// Mock localStorage and sessionStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Mock window and navigator
Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

Object.defineProperty(window, "navigator", {
  value: {
    doNotTrack: "0",
    userAgent: "test-user-agent",
  },
});

describe("Tracking Module", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    sessionStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Privacy Functions", () => {
    it("should check DNT status correctly", () => {
      expect(isDNTEnabled()).toBe(false);

      window.navigator.doNotTrack = "1";
      expect(isDNTEnabled()).toBe(true);
    });

    it("should handle user consent", () => {
      expect(hasUserConsent()).toBe(false);

      setUserConsent(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "tracking_user_consent",
        "true",
      );

      localStorageMock.getItem.mockReturnValue("true");
      expect(hasUserConsent()).toBe(true);
    });

    it("should filter sensitive data", () => {
      const data = {
        amount: 1000000,
        period: 12,
        email: "test@example.com",
        password: "secret123",
        fullName: "John Doe",
      };

      const filtered = filterSensitiveData(data);

      expect(filtered.amount).toBe(1000000);
      expect(filtered.period).toBe(12);
      expect(filtered.email).toBeDefined(); // Should be hashed
      expect(typeof filtered.email).toBe("string");
      expect(filtered.password).toBeDefined(); // Should be hashed
      expect(filtered.fullName).toBeDefined(); // Should be hashed
    });

    it("should determine if tracking should be enabled", () => {
      // Respect DNT = true, DNT enabled, no consent
      expect(shouldEnableTracking(true, false)).toBe(false);

      // Respect DNT = false, no consent
      expect(shouldEnableTracking(false, false)).toBe(false);

      // Respect DNT = true, DNT disabled, has consent
      window.navigator.doNotTrack = "0";
      expect(shouldEnableTracking(true, true)).toBe(true);

      // Respect DNT = false, has consent
      expect(shouldEnableTracking(false, true)).toBe(true);
    });
  });

  describe("Session Management", () => {
    it("should generate device ID", () => {
      const deviceId = getDeviceId();
      expect(typeof deviceId).toBe("string");
      expect(deviceId.length).toBeGreaterThan(0);
    });

    it("should handle session initialization", async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "tracking_user_consent") return "true";
        return null;
      });

      const sessionId = await initializeSession();
      expect(sessionStorageMock.setItem).toHaveBeenCalledWith(
        expect.stringContaining("tracking_session_"),
        expect.any(String),
      );
    });

    it("should get session ID", () => {
      sessionStorageMock.getItem.mockReturnValue("test-session-id");
      expect(getSessionId()).toBe("test-session-id");
    });
  });

  describe("Event Tracking", () => {
    beforeEach(() => {
      // Setup session and consent for event tracking
      sessionStorageMock.getItem.mockImplementation((key) => {
        if (key === "tracking_session_id") return "test-session";
        return null;
      });
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "tracking_user_consent") return "true";
        return null;
      });
    });

    it("should track savings calculator events", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await trackSavingsCalculator.pageView();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Tracking event:",
        expect.objectContaining({
          event: "tool_savings_page_view",
        }),
      );

      await trackSavingsCalculator.calculate({
        amount: 10000000,
        period: 12,
        type: "online",
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Tracking event:",
        expect.objectContaining({
          event: "tool_savings_calculate",
          data: expect.objectContaining({
            amountRange: "10m-100m",
            periodRange: "6m-12m",
          }),
        }),
      );

      consoleSpy.mockRestore();
    });

    it("should track loan calculator events", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await trackLoanCalculator.pageView();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Tracking event:",
        expect.objectContaining({
          event: "tool_loan_page_view",
        }),
      );

      await trackLoanCalculator.calculate({
        amount: 50000000,
        period: 24,
        rate: 9.5,
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Tracking event:",
        expect.objectContaining({
          event: "tool_loan_calculate",
          data: expect.objectContaining({
            amountRange: "10m-100m",
            periodRange: "1y-3y",
            rateRange: "5-10%",
          }),
        }),
      );

      consoleSpy.mockRestore();
    });

    it("should track salary calculator events", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await trackSalaryCalculator.grossToNetView();
      expect(consoleSpy).toHaveBeenCalledWith(
        "Tracking event:",
        expect.objectContaining({
          event: "tool_salary_gross_to_net_view",
        }),
      );

      await trackSalaryCalculator.calculate({
        amount: 15000000,
        type: "gross",
        dependents: 2,
        region: "hanoi",
      });
      expect(consoleSpy).toHaveBeenCalledWith(
        "Tracking event:",
        expect.objectContaining({
          event: "tool_salary_calculate",
          data: expect.objectContaining({
            amountRange: "10m-100m",
            type: "gross",
            hasDependents: true,
            hasRegion: true,
          }),
        }),
      );

      consoleSpy.mockRestore();
    });
  });

  describe("Data Categorization", () => {
    it("should categorize amounts correctly", () => {
      const testCases = [
        { amount: 500000, expected: "under-1m" },
        { amount: 5000000, expected: "1m-10m" },
        { amount: 50000000, expected: "10m-100m" },
        { amount: 500000000, expected: "100m-1b" },
        { amount: 2000000000, expected: "over-1b" },
      ];

      testCases.forEach(({ amount, expected }) => {
        // Import the helper function from events module
        const { getAmountRange } = require("../events");
        expect(getAmountRange(amount)).toBe(expected);
      });
    });

    it("should categorize periods correctly", () => {
      const testCases = [
        { period: 3, expected: "under-6m" },
        { period: 9, expected: "6m-12m" },
        { period: 24, expected: "1y-3y" },
        { period: 48, expected: "3y-5y" },
        { period: 72, expected: "over-5y" },
      ];

      testCases.forEach(({ period, expected }) => {
        const { getPeriodRange } = require("../events");
        expect(getPeriodRange(period)).toBe(expected);
      });
    });

    it("should categorize rates correctly", () => {
      const testCases = [
        { rate: 3, expected: "under-5%" },
        { rate: 7, expected: "5-10%" },
        { rate: 12, expected: "10-15%" },
        { rate: 17, expected: "15-20%" },
        { rate: 25, expected: "over-20%" },
      ];

      testCases.forEach(({ rate, expected }) => {
        const { getRateRange } = require("../events");
        expect(getRateRange(rate)).toBe(expected);
      });
    });
  });
});
