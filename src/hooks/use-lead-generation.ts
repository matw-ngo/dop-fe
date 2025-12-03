/**
 * Lead Generation Hooks
 * Custom hooks for lead generation functionality with Vietnamese market support
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLeadStore, useLeadData, useLeadScore, usePartnerMatches } from '@/store/use-lead-store';
import { scoreVietnameseLead } from '@/lib/lead-generation/lead-scoring';
import { matchVietnamesePartners } from '@/lib/lead-generation/partner-matching';
import { createVietnameseConsent, withdrawVietnameseConsent } from '@/lib/lead-generation/vietnamese-compliance';
import { leadGenerationApi } from '@/lib/api/endpoints/lead-generation';
import type { LeadData, LeadScore } from '@/lib/lead-generation/lead-scoring';
import type { MatchingResult } from '@/lib/lead-generation/partner-matching';
import type { ConsentRecord, ConsentType } from '@/lib/lead-generation/vietnamese-compliance';
import type { VietnameseFinancialPartner } from '@/lib/lead-generation/vietnamese-partners';

// Hook for lead creation and management
export const useLeadCreation = () => {
  const { toast } = useToast();
  const {
    leadData,
    setLeadData,
    setSubmitting,
    setLeadScore,
    setPartnerMatches,
    addToHistory,
    setValidationErrors,
  } = useLeadStore();

  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);

  const createLead = useCallback(async (
    options: {
      autoScore?: boolean;
      autoMatch?: boolean;
      onSuccess?: (leadId: string) => void;
      onError?: (error: string) => void;
    } = {}
  ) => {
    setIsCreating(true);
    setCreationError(null);
    setSubmitting(true);

    try {
      // Validate lead data
      const validationResponse = await leadGenerationApi.validateLeadData(leadData);
      if (!validationResponse.valid) {
        const errors: Record<string, string> = {};
        validationResponse.errors.forEach(error => {
          errors[error.field] = error.message;
        });
        setValidationErrors(errors);
        throw new Error('Validation failed');
      }

      // Auto-calculate score if enabled
      let finalScore: LeadScore | undefined;
      if (options.autoScore !== false) {
        const leadDataForScoring: LeadData = {
          ...leadData,
          behavior: {
            ...leadData.behavior,
            formCompletionTime: new Date().toISOString(),
          },
        };
        finalScore = scoreVietnameseLead(leadDataForScoring);
        setLeadScore(finalScore);
      }

      // Auto-match partners if enabled
      let finalMatches: MatchingResult | undefined;
      if (options.autoMatch !== false) {
        const criteria = {
          loanType: leadData.loanRequirements.loanType as any,
          loanAmount: leadData.loanRequirements.requestedAmount,
          loanTerm: leadData.loanRequirements.requestedTerm,
          provinceCode: leadData.currentAddress.provinceCode,
          creditScore: leadData.financial.creditScore,
          monthlyIncome: leadData.employment.monthlyIncome,
          urgency: leadData.loanRequirements.urgency,
          requiresOnlineApplication: true,
        };
        finalMatches = matchVietnamesePartners('temp', criteria, leadData, finalScore);
        setPartnerMatches(finalMatches);
      }

      // Create lead via API
      const creationRequest = {
        leadData: {
          ...leadData,
          behavior: {
            ...leadData.behavior,
            formCompletionTime: new Date().toISOString(),
          },
        },
        leadScore: finalScore,
        partnerMatching: finalMatches,
        consentRecords: [], // These should be handled separately
        source: leadData.source,
      };

      const response = await leadGenerationApi.createLead(creationRequest);

      // Update history
      addToHistory({
        leadData,
        leadScore: finalScore,
        partnerMatches: finalMatches,
        success: true,
        message: response.message,
      });

      // Show success message
      toast({
        title: 'Lead Created Successfully',
        description: `Lead ID: ${response.leadId}`,
      });

      // Call success callback
      options.onSuccess?.(response.leadId);

      return response;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create lead';
      setCreationError(errorMessage);

      addToHistory({
        leadData,
        success: false,
        message: errorMessage,
      });

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });

      options.onError?.(errorMessage);
      throw error;
    } finally {
      setIsCreating(false);
      setSubmitting(false);
    }
  }, [leadData, setLeadData, setSubmitting, setLeadScore, setPartnerMatches, addToHistory, setValidationErrors, toast]);

  return {
    createLead,
    isCreating,
    creationError,
  };
};

// Hook for lead scoring
export const useLeadScoring = () => {
  const { toast } = useToast();
  const { setLeadScore, setCalculatingScore, leadData } = useLeadStore();
  const leadScore = useLeadScore();

  const [isScoring, setIsScoring] = useState(false);
  const [scoringError, setScoringError] = useState<string | null>(null);

  const calculateScore = useCallback(async (customLeadData?: Partial<LeadData>) => {
    setIsScoring(true);
    setScoringError(null);
    setCalculatingScore(true);

    try {
      const dataToScore = customLeadData ? { ...leadData, ...customLeadData } : leadData;

      const score = scoreVietnameseLead(dataToScore);
      setLeadScore(score);

      toast({
        title: 'Score Calculated',
        description: `Score: ${score.totalScore}/100 (Grade: ${score.grade})`,
      });

      return score;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate score';
      setScoringError(errorMessage);

      toast({
        title: 'Scoring Error',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsScoring(false);
      setCalculatingScore(false);
    }
  }, [leadData, setLeadScore, setCalculatingScore, toast]);

  return {
    calculateScore,
    isScoring,
    scoringError,
    currentScore: leadScore,
  };
};

// Hook for partner matching
export const usePartnerMatching = () => {
  const { toast } = useToast();
  const { setPartnerMatches, setMatchingPartners, leadData, leadScore } = useLeadStore();
  const partnerMatches = usePartnerMatches();

  const [isMatching, setIsMatching] = useState(false);
  const [matchingError, setMatchingError] = useState<string | null>(null);

  const findPartners = useCallback(async (customCriteria?: any) => {
    setIsMatching(true);
    setMatchingError(null);
    setMatchingPartners(true);

    try {
      const criteria = customCriteria || {
        loanType: leadData.loanRequirements.loanType,
        loanAmount: leadData.loanRequirements.requestedAmount,
        loanTerm: leadData.loanRequirements.requestedTerm,
        provinceCode: leadData.currentAddress.provinceCode,
        creditScore: leadData.financial.creditScore,
        monthlyIncome: leadData.employment.monthlyIncome,
        employmentType: leadData.employment.employmentType,
        urgency: leadData.loanRequirements.urgency,
        requiresOnlineApplication: true,
      };

      const matches = matchVietnamesePartners('temp', criteria, leadData, leadScore || undefined);
      setPartnerMatches(matches);

      toast({
        title: 'Partners Matched',
        description: `Found ${matches.summary.eligiblePartnersCount} eligible partners`,
      });

      return matches;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to match partners';
      setMatchingError(errorMessage);

      toast({
        title: 'Matching Error',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsMatching(false);
      setMatchingPartners(false);
    }
  }, [leadData, leadScore, setPartnerMatches, setMatchingPartners, toast]);

  return {
    findPartners,
    isMatching,
    matchingError,
    currentMatches: partnerMatches,
  };
};

// Hook for consent management
export const useConsentManagement = () => {
  const { toast } = useToast();
  const { addConsentRecord, removeConsentRecord, consentRecords, leadData } = useLeadStore();

  const [isManaging, setIsManaging] = useState(false);

  const createConsent = useCallback(async (type: ConsentType, consentGiven: boolean) => {
    setIsManaging(true);

    try {
      const record = createVietnameseConsent('temp', {
        type,
        consentGiven,
        ipAddress: leadData.behavior.ipAddress,
        userAgent: leadData.behavior.browser || '',
        language: leadData.consent.languagePreference,
        method: 'checkbox',
      });

      addConsentRecord(record);

      toast({
        title: 'Consent Recorded',
        description: `${type} consent has been ${consentGiven ? 'granted' : 'denied'}`,
      });

      return record;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to record consent';

      toast({
        title: 'Consent Error',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsManaging(false);
    }
  }, [leadData, addConsentRecord, toast]);

  const withdrawConsent = useCallback(async (consentId: string) => {
    setIsManaging(true);

    try {
      const success = withdrawVietnameseConsent(consentId);

      if (success) {
        removeConsentRecord(consentId);

        toast({
          title: 'Consent Withdrawn',
          description: 'Your consent has been successfully withdrawn',
        });
      }

      return success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to withdraw consent';

      toast({
        title: 'Withdrawal Error',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    } finally {
      setIsManaging(false);
    }
  }, [removeConsentRecord, toast]);

  const hasConsent = useCallback((type: ConsentType) => {
    return consentRecords.some(record => record.type === type && record.consentGiven && !record.consentWithdrawn);
  }, [consentRecords]);

  return {
    createConsent,
    withdrawConsent,
    hasConsent,
    isManaging,
    consentRecords,
  };
};

// Hook for lead analytics
export const useLeadAnalytics = (leadId?: string) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leadId) {
      fetchAnalytics();
    }
  }, [leadId]);

  const fetchAnalytics = useCallback(async (period?: 'week' | 'month' | 'quarter' | 'year') => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await leadGenerationApi.getLeadAnalytics(leadId!, period);
      setAnalytics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);

      toast({
        title: 'Analytics Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [leadId, toast]);

  return {
    analytics,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
};

// Hook for lead status tracking
export const useLeadStatus = (leadId?: string) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (leadId) {
      fetchStatus();
      // Set up polling for real-time updates
      const interval = setInterval(fetchStatus, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [leadId]);

  const fetchStatus = useCallback(async () => {
    if (!leadId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await leadGenerationApi.getLeadStatus(leadId);
      setStatus(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch lead status';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  const updateStatus = useCallback(async (
    newStatus: string,
    reason?: string,
    notes?: string
  ) => {
    if (!leadId) return;

    try {
      await leadGenerationApi.updateLeadStatus(leadId, newStatus, reason, notes);
      await fetchStatus(); // Refresh status

      toast({
        title: 'Status Updated',
        description: `Lead status has been updated to ${newStatus}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update status';

      toast({
        title: 'Update Error',
        description: errorMessage,
        variant: 'destructive',
      });

      throw err;
    }
  }, [leadId, fetchStatus, toast]);

  return {
    status,
    isLoading,
    error,
    refetch: fetchStatus,
    updateStatus,
  };
};

// Hook for real-time lead validation
export const useLeadValidation = () => {
  const { leadData, setValidationErrors } = useLeadStore();
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(async (field: string, value: any) => {
    setIsValidating(true);

    try {
      const fieldData = { [field]: value };
      const validationResponse = await leadGenerationApi.validateLeadData(fieldData);

      if (validationResponse.errors.length > 0) {
        const fieldErrors = validationResponse.errors.filter(error => error.field === field);
        if (fieldErrors.length > 0) {
          setValidationErrors((prev) => ({
            ...prev,
            [field]: fieldErrors[0].message,
          }));
        }
      } else {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }

      return validationResponse.valid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [setValidationErrors]);

  const validateAll = useCallback(async () => {
    setIsValidating(true);

    try {
      const validationResponse = await leadGenerationApi.validateLeadData(leadData);

      const errors: Record<string, string> = {};
      validationResponse.errors.forEach(error => {
        errors[error.field] = error.message;
      });

      setValidationErrors(errors);
      return validationResponse.valid;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [leadData, setValidationErrors]);

  return {
    validateField,
    validateAll,
    isValidating,
  };
};

// Hook for lead export functionality
export const useLeadExport = () => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  const exportLeads = useCallback(async (
    format: 'csv' | 'excel' | 'pdf',
    options: {
      filters?: any;
      fields?: string[];
      dateFrom?: string;
      dateTo?: string;
    } = {}
  ) => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      const exportRequest = await leadGenerationApi.exportLeads({
        format,
        ...options,
      });

      // Simulate progress (in real implementation, you'd poll the status)
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Wait for export to complete
      setTimeout(() => {
        clearInterval(progressInterval);
        setExportProgress(100);
        setIsExporting(false);

        // Trigger download
        const link = document.createElement('a');
        link.href = exportRequest.downloadUrl;
        link.download = `leads_export.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast({
          title: 'Export Completed',
          description: `Exported ${exportRequest.recordCount} leads`,
        });
      }, 2000);

      return exportRequest;
    } catch (error) {
      setIsExporting(false);
      setExportProgress(0);

      const errorMessage = error instanceof Error ? error.message : 'Export failed';

      toast({
        title: 'Export Error',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    }
  }, [toast]);

  return {
    exportLeads,
    isExporting,
    exportProgress,
  };
};

// Hook for Vietnamese market insights
export const useVietnameseMarketInsights = () => {
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = useCallback(async () => {
    setIsLoading(true);

    try {
      const stats = await leadGenerationApi.getLeadStatistics('month');

      // Process Vietnamese-specific insights
      const processedInsights = {
        ...stats,
        vietnameseMarketData: {
          topProvinces: [
            { province: '01', count: 450, percentage: 35.2 }, // Hanoi
            { province: '79', count: 380, percentage: 29.7 }, // HCMC
            { province: '30', count: 120, percentage: 9.4 },  // Haiphong
            { province: '48', count: 95, percentage: 7.4 },   // Da Nang
          ],
          popularLoanTypes: {
            personal_loan: 45.3,
            business_loan: 28.7,
            mortgage_loan: 15.2,
            auto_loan: 10.8,
          },
          averageLoanAmounts: {
            personal_loan: 85000000,
            business_loan: 250000000,
            mortgage_loan: 1200000000,
            auto_loan: 450000000,
          },
          seasonalTrends: {
            holiday_season: {
              months: [11, 12, 1],
              increase_percentage: 32.5,
            },
            back_to_school: {
              months: [8, 9],
              increase_percentage: 18.7,
            },
          },
        },
      };

      setInsights(processedInsights);
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  return {
    insights,
    isLoading,
    refetch: fetchInsights,
  };
};

export default {
  useLeadCreation,
  useLeadScoring,
  usePartnerMatching,
  useConsentManagement,
  useLeadAnalytics,
  useLeadStatus,
  useLeadValidation,
  useLeadExport,
  useVietnameseMarketInsights,
};