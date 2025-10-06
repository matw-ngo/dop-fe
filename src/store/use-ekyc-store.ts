import { create } from "zustand";

// Define the shape of the eKYC result data based on the provider's documentation
interface EkycResultData {
  // Add fields from the actual result object, e.g.:
  // ocrResult?: any;
  // compareResult?: any;
  // livenessResult?: any;
  [key: string]: any; // Loosely typed for now
}

interface EkycState {
  status: "idle" | "running" | "success" | "error";
  result: EkycResultData | null;
  error: string | null;
  start: () => void;
  setSuccess: (result: EkycResultData) => void;
  setError: (error: string) => void;
  reset: () => void;
}

export const useEkycStore = create<EkycState>()((set) => ({
  status: "idle",
  result: null,
  error: null,
  start: () => set({ status: "running", result: null, error: null }),
  setSuccess: (result) => set({ status: "success", result, error: null }),
  setError: (error) => set({ status: "error", error, result: null }),
  reset: () => set({ status: "idle", result: null, error: null }),
}));
