/**
 * MSW Storage Utility
 *
 * Persists MSW mock data and running state in sessionStorage
 * so that state is not lost across page reloads.
 */

// Keys for sessionStorage
const MOCK_DATA_KEY = "msw_mock_data";
const MSW_ENABLED_KEY = "msw_enabled";

// Initial state for mock data
import { mockConsentData } from "./consent-data";

export type MockDataStore = {
  consents: Record<string, any>[];
  leads: Record<string, any>[];
  consentVersions: Record<string, any>[];
  consentLogs: Record<string, any>[];
  consentPurposes: Record<string, any>[];
  dataCategories: Record<string, any>[];
  consentDataCategories: Record<string, any>[];
};

const defaultMockData: MockDataStore = {
  consents: [],
  leads: [],
  consentVersions: mockConsentData.consentVersion.consent_versions,
  consentLogs: [],
  consentPurposes: [
    {
      id: "660e8400-e29b-41d4-a716-446655440006",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      name: "Analytics",
      controller_id: "770e8400-e29b-41d4-a716-446655440007",
      purpose: "Tracking and analytics",
      retention_days: 365,
      latest_version_id: "990e8400-e29b-41d4-a716-446655440004",
      latest_version: 1,
      latest_content: "This is a mock consent version content.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  dataCategories: [
    {
      id: "cat-001",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      name: "Personal Information",
      description: "Name, email, phone number, and other personal identifiers",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cat-002",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      name: "Browsing Behavior",
      description: "Pages visited, click patterns, and time spent on site",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cat-003",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      name: "Device Information",
      description: "Device type, OS, browser, and IP address",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cat-004",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      name: "Financial Information",
      description: "Transaction history and financial preferences",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cat-005",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      name: "Location Data",
      description: "Geographic location and region information",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  consentDataCategories: [
    {
      id: "cdc-001",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      consent_id: "550e8400-e29b-41d4-a716-446655440000",
      data_category_id: "cat-001",
      consent_action: "grant",
      consent_source: "web",
      consent_lead_id: "880e8400-e29b-41d4-a716-446655440003",
      data_category_name: "Personal Information",
      data_category_description:
        "Name, email, phone number, and other personal identifiers",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "cdc-002",
      tenant_id: "00000000-0000-0000-0000-000000000000",
      consent_id: "550e8400-e29b-41d4-a716-446655440000",
      data_category_id: "cat-002",
      consent_action: "grant",
      consent_source: "web",
      consent_lead_id: "880e8400-e29b-41d4-a716-446655440003",
      data_category_name: "Browsing Behavior",
      data_category_description:
        "Pages visited, click patterns, and time spent on site",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
};

const isBrowser = typeof window !== "undefined";

export const mswStore = {
  /**
   * Check if MSW should be enabled on load (default true)
   */
  isMswEnabled(): boolean {
    if (!isBrowser) return false;
    const value = sessionStorage.getItem(MSW_ENABLED_KEY);
    return value === null ? true : value === "true";
  },

  /**
   * Set MSW enabled state
   */
  setMswEnabled(enabled: boolean): void {
    if (!isBrowser) return;
    sessionStorage.setItem(MSW_ENABLED_KEY, String(enabled));
  },

  /**
   * Get all mock data
   */
  getMockData(): MockDataStore {
    if (!isBrowser) return defaultMockData;
    const data = sessionStorage.getItem(MOCK_DATA_KEY);
    if (!data) return defaultMockData;
    try {
      const parsedData = JSON.parse(data);

      // Merge parsed data with default data to ensure new fields like latest_version_id are present via deep-ish spreading
      return {
        ...defaultMockData,
        ...parsedData,
        consentPurposes:
          parsedData.consentPurposes?.map((p: any) => {
            const defaultP = defaultMockData.consentPurposes.find(
              (dp) => dp.id === p.id,
            );
            return defaultP ? { ...defaultP, ...p } : p;
          }) || defaultMockData.consentPurposes,
      };
    } catch {
      return defaultMockData;
    }
  },

  /**
   * Update mock data
   */
  updateMockData(updater: (data: MockDataStore) => MockDataStore): void {
    if (!isBrowser) return;
    const currentData = this.getMockData();
    const newData = updater(currentData);
    sessionStorage.setItem(MOCK_DATA_KEY, JSON.stringify(newData));
  },

  /**
   * Smart reset of mock data (keeps base config, clears generated data)
   */
  resetMockData(): void {
    if (!isBrowser) return;
    sessionStorage.setItem(MOCK_DATA_KEY, JSON.stringify(defaultMockData));
  },
};
