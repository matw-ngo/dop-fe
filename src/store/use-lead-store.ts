/**
 * Lead Generation State Management
 * Zustand store for lead generation state with Vietnamese market support
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { subscribeWithSelector } from 'zustand/middleware';
import type { LeadData, LeadScore } from '@/lib/lead-generation/lead-scoring';
import type { MatchingResult } from '@/lib/lead-generation/partner-matching';
import type { ConsentRecord } from '@/lib/lead-generation/vietnamese-compliance';
import type { VietnameseFinancialPartner } from '@/lib/lead-generation/vietnamese-partners';

// Types
export interface LeadFormData {
  // Personal Information
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  nationalId: string;
  phoneNumber: string;
  email?: string;

  // Address Information
  currentAddress: {
    provinceCode: string;
    districtCode?: string;
    wardCode?: string;
    street?: string;
  };
  permanentAddress?: {
    provinceCode: string;
    districtCode?: string;
    wardCode?: string;
    street?: string;
  };

  // Contact Preferences
  contactPreferences: {
    preferredContactMethod: 'phone' | 'email' | 'sms' | 'whatsapp';
    contactTime?: 'morning' | 'afternoon' | 'evening';
    timezone: string;
  };

  // Employment Information
  employment: {
    employmentType: 'full_time' | 'part_time' | 'self_employed' | 'business_owner' | 'freelancer' | 'student' | 'retired' | 'unemployed';
    employmentStatus: 'permanent' | 'contract' | 'probation' | 'temporary' | 'seasonal';
    companyName?: string;
    jobTitle?: string;
    industry?: string;
    workDurationMonths: number;
    monthlyIncome: number;
    incomeSource: 'salary' | 'business_income' | 'freelance' | 'investments' | 'rental' | 'pension' | 'family_support' | 'other';
    canProvideIncomeProof: boolean;
  };

  // Financial Information
  financial: {
    existingMonthlyDebtPayments: number;
    hasBankAccount: boolean;
    creditScore?: number;
    bankAccountMonths?: number;
    previousLoanHistory?: {
      hasPreviousLoans: boolean;
      onTimePaymentsPercentage?: number;
      defaultHistory?: boolean;
      totalRepaidAmount?: number;
    };
    assets?: {
      hasRealEstate: boolean;
      hasVehicle: boolean;
      hasSavings: boolean;
      hasInvestments: boolean;
    };
  };

  // Loan Requirements
  loanRequirements: {
    requestedAmount: number;
    requestedTerm: number;
    loanType: string;
    loanPurpose: string;
    urgency: 'urgent' | 'normal' | 'flexible';
    collateralAvailable: boolean;
    collateralType?: string;
    collateralValue?: number;
    preferredInterestRate?: number;
  };

  // Consent
  consent: {
    dataProcessingConsent: boolean;
    marketingConsent: boolean;
    partnerSharingConsent: boolean;
    creditCheckConsent: boolean;
    consentTimestamp: string;
    consentIP: string;
    languagePreference: 'vi' | 'en';
  };

  // Source Information
  source: {
    source: string;
    medium?: string;
    campaign?: string;
    content?: string;
    keyword?: string;
  };

  // Behavioral Information
  behavior: {
    howFound: string;
    previousApplications: number;
    websiteVisits: number;
    timeSpentOnSite: number;
    pagesViewed: number;
    formStartTime: string;
    formCompletionTime?: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    browser?: string;
    ipAddress: string;
  };
}

export interface LeadState {
  // Current lead data
  leadData: LeadFormData;
  leadId?: string;

  // Processing state
  isSubmitting: boolean;
  isCalculatingScore: boolean;
  isMatchingPartners: boolean;

  // Results
  leadScore?: LeadScore;
  partnerMatches?: MatchingResult;
  consentRecords: ConsentRecord[];

  // UI State
  currentStep: number;
  totalSteps: number;
  validationErrors: Record<string, string>;
  selectedPartners: string[];

  // History and analytics
  submissionHistory: Array<{
    timestamp: string;
    leadData: LeadFormData;
    leadScore?: LeadScore;
    partnerMatches?: MatchingResult;
    success: boolean;
    message: string;
  }>;

  // Offline support
  offlineQueue: Array<{
    type: 'create_lead' | 'update_consent' | 'submit_score';
    data: any;
    timestamp: string;
    retryCount: number;
  }>;

  // Settings and preferences
  settings: {
    language: 'vi' | 'en';
    autoSave: boolean;
    enableAnalytics: boolean;
    consentReminder: boolean;
    darkMode: boolean;
  };

  // Partner information
  partnerInformation: {
    availablePartners: VietnameseFinancialPartner[];
    partnerPreferences: {
      preferredBanks: string[];
      excludedBanks: string[];
      maxInterestRate?: number;
      requiresOnlineApplication?: boolean;
      requiresFastApproval?: boolean;
    };
  };

  // Actions
  setLeadData: (data: Partial<LeadFormData>) => void;
  updateField: (field: string, value: any) => void;
  setCurrentStep: (step: number) => void;
  setSubmitting: (isSubmitting: boolean) => void;
  setCalculatingScore: (isCalculatingScore: boolean) => void;
  setMatchingPartners: (isMatchingPartners: boolean) => void;

  // Results management
  setLeadScore: (score: LeadScore) => void;
  setPartnerMatches: (matches: MatchingResult) => void;
  addConsentRecord: (record: ConsentRecord) => void;
  removeConsentRecord: (consentId: string) => void;

  // Validation
  setValidationErrors: (errors: Record<string, string>) => void;
  clearValidationErrors: () => void;
  validateCurrentStep: () => boolean;

  // Partner selection
  togglePartnerSelection: (partnerId: string) => void;
  clearPartnerSelection: () => void;
  setPartnerPreferences: (preferences: any) => void;

  // History and analytics
  addToHistory: (entry: any) => void;
  clearHistory: () => void;
  getSubmissionHistory: () => any[];

  // Offline support
  addToOfflineQueue: (item: any) => void;
  processOfflineQueue: () => Promise<void>;
  clearOfflineQueue: () => void;

  // Settings
  updateSettings: (settings: Partial<LeadState['settings']>) => void;
  resetToDefaults: () => void;

  // Utility functions
  exportLeadData: () => LeadFormData;
  importLeadData: (data: Partial<LeadFormData>) => void;
  calculateProgress: () => number;
  getEstimatedCompletionTime: () => number;

  // Reset
  resetLeadData: () => void;
  resetAll: () => void;
}

const initialLeadData: LeadFormData = {
  fullName: '',
  dateOfBirth: '',
  gender: 'male',
  nationalId: '',
  phoneNumber: '',
  email: '',

  currentAddress: {
    provinceCode: '',
    districtCode: '',
    wardCode: '',
    street: '',
  },

  contactPreferences: {
    preferredContactMethod: 'phone',
    contactTime: 'morning',
    timezone: 'Asia/Ho_Chi_Minh',
  },

  employment: {
    employmentType: 'full_time',
    employmentStatus: 'permanent',
    workDurationMonths: 0,
    monthlyIncome: 0,
    incomeSource: 'salary',
    canProvideIncomeProof: false,
  },

  financial: {
    existingMonthlyDebtPayments: 0,
    hasBankAccount: false,
  },

  loanRequirements: {
    requestedAmount: 0,
    requestedTerm: 12,
    loanType: 'personal_loan',
    loanPurpose: '',
    urgency: 'normal',
    collateralAvailable: false,
  },

  consent: {
    dataProcessingConsent: false,
    marketingConsent: false,
    partnerSharingConsent: false,
    creditCheckConsent: false,
    consentTimestamp: new Date().toISOString(),
    consentIP: '',
    languagePreference: 'vi',
  },

  source: {
    source: 'direct',
  },

  behavior: {
    howFound: 'website',
    previousApplications: 0,
    websiteVisits: 0,
    timeSpentOnSite: 0,
    pagesViewed: 0,
    formStartTime: new Date().toISOString(),
    deviceType: 'desktop',
    ipAddress: '',
  },
};

export const useLeadStore = create<LeadState>()(
  devtools(
    persist(
      subscribeWithSelector((set, get) => ({
        // Initial state
        leadData: initialLeadData,
        leadId: undefined,
        isSubmitting: false,
        isCalculatingScore: false,
        isMatchingPartners: false,
        leadScore: undefined,
        partnerMatches: undefined,
        consentRecords: [],
        currentStep: 0,
        totalSteps: 6,
        validationErrors: {},
        selectedPartners: [],
        submissionHistory: [],
        offlineQueue: [],
        settings: {
          language: 'vi',
          autoSave: true,
          enableAnalytics: true,
          consentReminder: true,
          darkMode: false,
        },
        partnerInformation: {
          availablePartners: [],
          partnerPreferences: {
            preferredBanks: [],
            excludedBanks: [],
          },
        },

        // Lead data management
        setLeadData: (data: Partial<LeadFormData>) => {
          set((state) => ({
            leadData: { ...state.leadData, ...data },
          }));
        },

        updateField: (field: string, value: any) => {
          set((state) => {
            const keys = field.split('.');
            const newData = { ...state.leadData };
            let current: any = newData;

            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) {
                current[keys[i]] = {};
              }
              current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;

            return { leadData: newData };
          });
        },

        setCurrentStep: (step: number) => {
          set({ currentStep: step });
        },

        setSubmitting: (isSubmitting: boolean) => {
          set({ isSubmitting });
        },

        setCalculatingScore: (isCalculatingScore: boolean) => {
          set({ isCalculatingScore });
        },

        setMatchingPartners: (isMatchingPartners: boolean) => {
          set({ isMatchingPartners });
        },

        // Results management
        setLeadScore: (score: LeadScore) => {
          set({ leadScore: score });
        },

        setPartnerMatches: (matches: MatchingResult) => {
          set({ partnerMatches: matches });
        },

        addConsentRecord: (record: ConsentRecord) => {
          set((state) => ({
            consentRecords: [...state.consentRecords, record],
          }));
        },

        removeConsentRecord: (consentId: string) => {
          set((state) => ({
            consentRecords: state.consentRecords.filter(r => r.id !== consentId),
          }));
        },

        // Validation
        setValidationErrors: (errors: Record<string, string>) => {
          set({ validationErrors: errors });
        },

        clearValidationErrors: () => {
          set({ validationErrors: {} });
        },

        validateCurrentStep: () => {
          const { currentStep, leadData } = get();
          const errors: Record<string, string> = {};

          // Basic validation for different steps
          switch (currentStep) {
            case 0: // Personal info
              if (!leadData.fullName) errors.fullName = 'Name is required';
              if (!leadData.dateOfBirth) errors.dateOfBirth = 'Date of birth is required';
              if (!leadData.nationalId) errors.nationalId = 'ID is required';
              if (!leadData.phoneNumber) errors.phoneNumber = 'Phone is required';
              break;

            case 1: // Financial info
              if (leadData.employment.monthlyIncome <= 0) {
                errors.income = 'Income must be greater than 0';
              }
              if (leadData.loanRequirements.requestedAmount <= 0) {
                errors.amount = 'Loan amount must be greater than 0';
              }
              break;

            case 2: // Contact info
              if (!leadData.currentAddress.provinceCode) {
                errors.province = 'Province is required';
              }
              break;

            case 3: // Consent
              if (!leadData.consent.dataProcessingConsent) {
                errors.dataProcessing = 'Data processing consent is required';
              }
              if (!leadData.consent.creditCheckConsent) {
                errors.creditCheck = 'Credit check consent is required';
              }
              break;
          }

          set({ validationErrors: errors });
          return Object.keys(errors).length === 0;
        },

        // Partner selection
        togglePartnerSelection: (partnerId: string) => {
          set((state) => ({
            selectedPartners: state.selectedPartners.includes(partnerId)
              ? state.selectedPartners.filter(id => id !== partnerId)
              : [...state.selectedPartners, partnerId],
          }));
        },

        clearPartnerSelection: () => {
          set({ selectedPartners: [] });
        },

        setPartnerPreferences: (preferences: any) => {
          set((state) => ({
            partnerInformation: {
              ...state.partnerInformation,
              partnerPreferences: {
                ...state.partnerInformation.partnerPreferences,
                ...preferences,
              },
            },
          }));
        },

        // History and analytics
        addToHistory: (entry: any) => {
          set((state) => ({
            submissionHistory: [
              ...state.submissionHistory.slice(-9), // Keep last 10 entries
              {
                timestamp: new Date().toISOString(),
                ...entry,
              },
            ],
          }));
        },

        clearHistory: () => {
          set({ submissionHistory: [] });
        },

        getSubmissionHistory: () => {
          return get().submissionHistory;
        },

        // Offline support
        addToOfflineQueue: (item: any) => {
          set((state) => ({
            offlineQueue: [
              ...state.offlineQueue,
              {
                ...item,
                timestamp: new Date().toISOString(),
                retryCount: 0,
              },
            ],
          }));
        },

        processOfflineQueue: async () => {
          const { offlineQueue } = get();
          // Implementation would process offline queue when back online
          console.log('Processing offline queue:', offlineQueue);
          set({ offlineQueue: [] });
        },

        clearOfflineQueue: () => {
          set({ offlineQueue: [] });
        },

        // Settings
        updateSettings: (newSettings: Partial<LeadState['settings']>) => {
          set((state) => ({
            settings: { ...state.settings, ...newSettings },
          }));
        },

        resetToDefaults: () => {
          set({
            leadData: initialLeadData,
            leadScore: undefined,
            partnerMatches: undefined,
            currentStep: 0,
            validationErrors: {},
            selectedPartners: [],
            consentRecords: [],
          });
        },

        // Utility functions
        exportLeadData: () => {
          return get().leadData;
        },

        importLeadData: (data: Partial<LeadFormData>) => {
          set((state) => ({
            leadData: { ...state.leadData, ...data },
          }));
        },

        calculateProgress: () => {
          const { currentStep, totalSteps } = get();
          return Math.round(((currentStep + 1) / totalSteps) * 100);
        },

        getEstimatedCompletionTime: () => {
          const { currentStep, leadData, leadScore, partnerMatches } = get();
          let estimatedMinutes = 0;

          // Base time for remaining steps
          const remainingSteps = get().totalSteps - currentStep - 1;
          estimatedMinutes += remainingSteps * 2; // 2 minutes per step

          // Additional time for processing
          if (!leadScore) estimatedMinutes += 1; // Score calculation
          if (!partnerMatches) estimatedMinutes += 1; // Partner matching

          // Complexity based on loan amount
          if (leadData.loanRequirements.requestedAmount > 500000000) {
            estimatedMinutes += 2; // Additional review time for large amounts
          }

          return estimatedMinutes;
        },

        // Reset functions
        resetLeadData: () => {
          set({
            leadData: initialLeadData,
            leadScore: undefined,
            partnerMatches: undefined,
            currentStep: 0,
            validationErrors: {},
            selectedPartners: [],
            consentRecords: [],
          });
        },

        resetAll: () => {
          set({
            leadData: initialLeadData,
            leadId: undefined,
            isSubmitting: false,
            isCalculatingScore: false,
            isMatchingPartners: false,
            leadScore: undefined,
            partnerMatches: undefined,
            consentRecords: [],
            currentStep: 0,
            validationErrors: {},
            selectedPartners: [],
            submissionHistory: [],
            offlineQueue: [],
          });
        },
      })),
      {
        name: 'lead-generation-storage',
        partialize: (state) => ({
          leadData: state.leadData,
          settings: state.settings,
          partnerInformation: state.partnerInformation,
          submissionHistory: state.submissionHistory.slice(-5), // Keep only last 5
        }),
      },
    ),
    {
      name: 'LeadGenerationStore',
      enabled: process.env.NODE_ENV !== 'production',
    },
  ),
);

// Selectors for easier access
export const useLeadData = () => useLeadStore((state) => state.leadData);
export const useLeadScore = () => useLeadStore((state) => state.leadScore);
export const usePartnerMatches = () => useLeadStore((state) => state.partnerMatches);
export const useLeadLoading = () => useLeadStore((state) => ({
  isSubmitting: state.isSubmitting,
  isCalculatingScore: state.isCalculatingScore,
  isMatchingPartners: state.isMatchingPartners,
}));
export const useLeadProgress = () => useLeadStore((state) => ({
  currentStep: state.currentStep,
  totalSteps: state.totalSteps,
  progress: Math.round(((state.currentStep + 1) / state.totalSteps) * 100),
}));
export const useLeadValidation = () => useLeadStore((state) => ({
  errors: state.validationErrors,
  hasErrors: Object.keys(state.validationErrors).length > 0,
}));
export const useLeadSettings = () => useLeadStore((state) => state.settings);
export const useLeadHistory = () => useLeadStore((state) => state.submissionHistory);
export const useOfflineQueue = () => useLeadStore((state) => state.offlineQueue);

// Hook for auto-save functionality
export const useLeadAutoSave = () => {
  const { leadData, settings } = useLeadStore();

  useEffect(() => {
    if (settings.autoSave) {
      // Save to localStorage periodically
      const timer = setTimeout(() => {
        localStorage.setItem('lead-data-autosave', JSON.stringify(leadData));
      }, 5000); // Save after 5 seconds of inactivity

      return () => clearTimeout(timer);
    }
  }, [leadData, settings.autoSave]);
};

// Hook for online/offline detection
export const useLeadOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const { processOfflineQueue, addToOfflineQueue } = useLeadStore();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      processOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [processOfflineQueue]);

  return isOnline;
};

export default useLeadStore;