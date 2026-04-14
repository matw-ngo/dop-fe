/**
 * MSW Test Scenario Utility
 *
 * Provides functions to set/get test scenarios for MSW mocking
 * Used for manual testing in development mode
 */

// Storage keys
const SCENARIO_KEY = "msw_test_scenario";
const SCENARIO_LEAD_ID_KEY = "msw_test_lead_id";

/**
 * Get current test scenario from localStorage
 * Falls back to 'success' if not set
 */
export function getMswScenario(): string {
  if (typeof window === "undefined") return "success";
  return localStorage.getItem(SCENARIO_KEY) || "success";
}

/**
 * Set test scenario for MSW handlers
 * @param scenario - Test scenario: pending, distributed, failed, no_match, success
 */
export function setMswScenario(scenario: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCENARIO_KEY, scenario);
  console.log(`🎯 MSW scenario set to: ${scenario}`);
}

/**
 * Get test lead ID (for simulating specific lead)
 */
export function getMswLeadId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(SCENARIO_LEAD_ID_KEY);
}

/**
 * Set test lead ID
 */
export function setMswLeadId(leadId: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(SCENARIO_LEAD_ID_KEY, leadId);
  console.log(`📋 MSW lead ID set to: ${leadId}`);
}

/**
 * Clear test scenario
 */
export function clearMswScenario(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SCENARIO_KEY);
  localStorage.removeItem(SCENARIO_LEAD_ID_KEY);
  console.log("🧹 MSW test scenario cleared");
}

/**
 * Get available scenarios
 */
export function getAvailableScenarios(): {
  key: string;
  label: string;
  description: string;
}[] {
  return [
    {
      key: "success",
      label: "Thành công",
      description: "Distributed - có sản phẩm phù hợp",
    },
    { key: "pending", label: "Đang xử lý", description: "Tiếp tục polling" },
    {
      key: "distributed",
      label: "Đã phân phối",
      description: "Thành công, đã forward",
    },
    { key: "failed", label: "Thất bại", description: "Distribution thất bại" },
    {
      key: "no_match",
      label: "Không khớp",
      description: "Không có sản phẩm phù hợp",
    },
  ];
}

// Expose to window for easy console access
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).mswTest = {
    setScenario: setMswScenario,
    getScenario: getMswScenario,
    setLeadId: setMswLeadId,
    getLeadId: getMswLeadId,
    clear: clearMswScenario,
    scenarios: getAvailableScenarios,
  };
  console.log("💡 MSW Test utilities available at window.mswTest");
  console.log("   - window.mswTest.setScenario('pending')");
  console.log("   - window.mswTest.getScenario()");
  console.log("   - window.mswTest.clear()");
  console.log("   - window.mswTest.scenarios");
}
