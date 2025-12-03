/**
 * Vietnamese Lead Data Collection System
 * Comprehensive lead qualification forms with Vietnamese compliance
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useForm, useWatch, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, AlertCircle, Shield, FileText, Users, Calculator, MapPin } from 'lucide-react';

// Form Components
import LeadQualificationForm from './LeadQualificationForm';
import FinancialNeedsAssessment from './FinancialNeedsAssessment';
import ContactInformationForm from './ContactInformationForm';
import ConsentManagementForm from './ConsentManagementForm';
import LeadSourceTracking from './LeadSourceTracking';
import CustomFieldsForm from './CustomFieldsForm';

// Types and schemas
import type { LeadData, ConsentType } from '@/lib/lead-generation/lead-scoring';
import type { VietnameseProvince } from '@/lib/lead-generation/vietnamese-partners';
import { createVietnameseConsent, checkVietnameseConsent, withdrawVietnameseConsent } from '@/lib/lead-generation/vietnamese-compliance';
import { scoreVietnameseLead } from '@/lib/lead-generation/lead-scoring';
import { matchVietnamesePartners } from '@/lib/lead-generation/partner-matching';

// Vietnamese form validation schema
const vietnameseLeadSchema = z.object({
  // Personal Information
  fullName: z.string().min(2, 'Họ và tên phải có ít nhất 2 ký tự').max(100, 'Họ và tên không quá 100 ký tự'),
  dateOfBirth: z.string().refine((date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    return age >= 18 && age <= 70;
  }, 'Tuổi phải từ 18 đến 70 tuổi'),
  gender: z.enum(['male', 'female', 'other'], { required_error: 'Vui lòng chọn giới tính' }),
  nationalId: z.string().regex(/^[0-9]{9}$|^[0-9]{12}$/, 'Số CMND/CCCD phải có 9 hoặc 12 số'),
  phoneNumber: z.string().regex(/^(0|\+84)[3-9][0-9]{8}$/, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Email không hợp lệ').optional().or(z.literal('')),

  // Address Information
  currentAddress: z.object({
    provinceCode: z.string().min(1, 'Vui lòng chọn tỉnh/thành phố'),
    districtCode: z.string().min(1, 'Vui lòng chọn quận/huyện'),
    wardCode: z.string().min(1, 'Vui lòng chọn phường/xã'),
    street: z.string().min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  }),
  permanentAddress: z.object({
    provinceCode: z.string().optional(),
    districtCode: z.string().optional(),
    wardCode: z.string().optional(),
    street: z.string().optional(),
  }).optional(),

  // Contact Preferences
  contactPreferences: z.object({
    preferredContactMethod: z.enum(['phone', 'email', 'sms', 'whatsapp'], { required_error: 'Vui lòng chọn phương thức liên hệ' }),
    contactTime: z.enum(['morning', 'afternoon', 'evening']).optional(),
    timezone: z.string().default('Asia/Ho_Chi_Minh'),
  }),

  // Employment Information
  employment: z.object({
    employmentType: z.enum(['full_time', 'part_time', 'self_employed', 'business_owner', 'freelancer', 'student', 'retired', 'unemployed'], { required_error: 'Vui lòng chọn loại hình công việc' }),
    employmentStatus: z.enum(['permanent', 'contract', 'probation', 'temporary', 'seasonal'], { required_error: 'Vui lòng chọn tình trạng công việc' }),
    companyName: z.string().min(2, 'Tên công ty phải có ít nhất 2 ký tự').optional(),
    jobTitle: z.string().min(2, 'Chức danh phải có ít nhất 2 ký tự').optional(),
    industry: z.string().optional(),
    workDurationMonths: z.number().min(0, 'Thời gian làm việc không thể âm').max(600, 'Thời gian làm việc không hợp lệ'),
    monthlyIncome: z.number().min(3000000, 'Thu nhập hàng tháng tối thiểu là 3 triệu VNĐ').max(500000000, 'Thu nhập không hợp lệ'),
    incomeSource: z.enum(['salary', 'business_income', 'freelance', 'investments', 'rental', 'pension', 'family_support', 'other'], { required_error: 'Vui lòng chọn nguồn thu nhập' }),
    canProvideIncomeProof: z.boolean(),
  }),

  // Financial Information
  financial: z.object({
    existingMonthlyDebtPayments: z.number().min(0, 'Khoản nợ không thể âm'),
    hasBankAccount: z.boolean(),
    creditScore: z.number().min(300).max(900).optional(),
    bankAccountMonths: z.number().min(0).optional(),
    previousLoanHistory: z.object({
      hasPreviousLoans: z.boolean(),
      onTimePaymentsPercentage: z.number().min(0).max(100).optional(),
      defaultHistory: z.boolean().optional(),
      totalRepaidAmount: z.number().min(0).optional(),
    }).optional(),
    assets: z.object({
      hasRealEstate: z.boolean(),
      hasVehicle: z.boolean(),
      hasSavings: z.boolean(),
      hasInvestments: z.boolean(),
    }).optional(),
  }),

  // Loan Requirements
  loanRequirements: z.object({
    requestedAmount: z.number().min(5000000, 'Số tiền vay tối thiểu là 5 triệu VNĐ').max(50000000000, 'Số tiền vay tối đa là 50 tỷ VNĐ'),
    requestedTerm: z.number().min(1, 'Thời gian vay tối thiểu là 1 tháng').max(360, 'Thời gian vay tối đa là 360 tháng'),
    loanType: z.enum(['personal_loan', 'business_loan', 'mortgage_loan', 'auto_loan', 'credit_card', 'agricultural_loan', 'student_loan', 'home_equity', 'debt_consolidation', 'working_capital', 'equipment_financing', 'invoice_financing', 'trade_finance', 'construction_loan', 'sme_loan', 'startup_loan'], { required_error: 'Vui lòng chọn loại vay' }),
    loanPurpose: z.string().min(5, 'Mục đích vay phải có ít nhất 5 ký tự'),
    urgency: z.enum(['urgent', 'normal', 'flexible'], { required_error: 'Vui lòng chọn mức độ khẩn cấp' }),
    collateralAvailable: z.boolean(),
    collateralType: z.string().optional(),
    collateralValue: z.number().min(0).optional(),
    preferredInterestRate: z.number().min(0).max(50).optional(),
  }),

  // Consent
  consent: z.object({
    dataProcessingConsent: z.boolean().refine(val => val === true, 'Bạn phải đồng ý với việc xử lý dữ liệu'),
    marketingConsent: z.boolean(),
    partnerSharingConsent: z.boolean(),
    creditCheckConsent: z.boolean().refine(val => val === true, 'Bạn phải đồng ý với việc kiểm tra tín dụng'),
    consentTimestamp: z.string(),
    consentIP: z.string(),
    languagePreference: z.enum(['vi', 'en']).default('vi'),
  }),
});

type VietnameseLeadFormData = z.infer<typeof vietnameseLeadSchema>;

interface LeadDataCollectorProps {
  loanType?: string;
  initialData?: Partial<VietnameseLeadFormData>;
  onSubmit?: (leadData: LeadData) => void;
  onScoreCalculated?: (score: any) => void;
  onPartnersMatched?: (matches: any) => void;
  showProgress?: boolean;
  language?: 'vi' | 'en';
  customFields?: Array<{
    name: string;
    type: 'text' | 'number' | 'select' | 'checkbox' | 'date';
    label: string;
    required?: boolean;
    options?: string[];
    validation?: z.ZodSchema;
  }>;
  source?: {
    source: string;
    medium?: string;
    campaign?: string;
  };
}

const VietnameseLeadDataCollector: React.FC<LeadDataCollectorProps> = ({
  loanType: initialLoanType,
  initialData,
  onSubmit,
  onScoreCalculated,
  onPartnersMatched,
  showProgress = true,
  language = 'vi',
  customFields = [],
  source,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadScore, setLeadScore] = useState<any>(null);
  const [partnerMatches, setPartnerMatches] = useState<any>(null);
  const [consentRecords, setConsentRecords] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const totalSteps = 6; // Qualification, Financial, Contact, Consent, Custom, Review

  const form = useForm<VietnameseLeadFormData>({
    resolver: zodResolver(vietnameseLeadSchema),
    defaultValues: {
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
      permanentAddress: {
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
        loanType: initialLoanType as any || 'personal_loan',
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
        languagePreference: language,
      },
      ...initialData,
    },
  });

  const watchedValues = useWatch({
    control: form.control,
  });

  // Initialize IP address and timestamp
  useEffect(() => {
    const initializeConsentDefaults = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        form.setValue('consent.consentIP', data.ip);
      } catch (error) {
        console.error('Failed to get IP address:', error);
        form.setValue('consent.consentIP', '0.0.0.0');
      }
      form.setValue('consent.consentTimestamp', new Date().toISOString());
    };

    initializeConsentDefaults();
  }, [form]);

  // Track source information
  useEffect(() => {
    if (source) {
      // Store source information in form data or state
      console.log('Lead source:', source);
    }
  }, [source]);

  const steps = [
    {
      id: 'qualification',
      title: language === 'vi' ? 'Bắt đầu' : 'Qualification',
      description: language === 'vi' ? 'Thông tin cơ bản' : 'Basic Information',
      icon: Users,
    },
    {
      id: 'financial',
      title: language === 'vi' ? 'Thông tin tài chính' : 'Financial Information',
      description: language === 'vi' ? 'Thu nhập và nhu cầu vay' : 'Income and Loan Needs',
      icon: Calculator,
    },
    {
      id: 'contact',
      title: language === 'vi' ? 'Thông tin liên hệ' : 'Contact Information',
      description: language === 'vi' ? 'Địa chỉ và liên hệ' : 'Address and Contact',
      icon: MapPin,
    },
    {
      id: 'consent',
      title: language === 'vi' ? 'Đồng ý' : 'Consent',
      description: language === 'vi' ? 'Đồng ý và bảo mật' : 'Privacy and Consent',
      icon: Shield,
    },
    {
      id: 'custom',
      title: language === 'vi' ? 'Thông tin thêm' : 'Additional Information',
      description: language === 'vi' ? 'Thông tin cụ thể' : 'Specific Details',
      icon: FileText,
    },
    {
      id: 'review',
      title: language === 'vi' ? 'Xem lại' : 'Review',
      description: language === 'vi' ? 'Kiểm tra thông tin' : 'Review Information',
      icon: CheckCircle,
    },
  ];

  const nextStep = useCallback(async () => {
    const currentStepFields = getFieldsForStep(currentStep);
    const isValid = await validateStep(currentStepFields);

    if (!isValid) {
      return;
    }

    // Create consent records for relevant steps
    if (currentStep === 3) { // Consent step
      await createConsentRecords();
    }

    // Calculate lead score when financial information is complete
    if (currentStep === 1 && onScoreCalculated) {
      await calculateLeadScore();
    }

    // Match partners when all information is complete
    if (currentStep === 4 && onPartnersMatched) {
      await findMatchingPartners();
    }

    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, onScoreCalculated, onPartnersMatched, form]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const getFieldsForStep = (step: number): string[] => {
    const fieldMap: { [key: number]: string[] } = {
      0: ['fullName', 'dateOfBirth', 'gender', 'nationalId'],
      1: ['employment', 'financial', 'loanRequirements'],
      2: ['currentAddress', 'permanentAddress', 'contactPreferences', 'phoneNumber', 'email'],
      3: ['consent'],
      4: customFields.map(field => field.name),
      5: [], // Review step
    };
    return fieldMap[step] || [];
  };

  const validateStep = async (fieldNames: string[]): Promise<boolean> => {
    const errors: string[] = [];

    for (const fieldName of fieldNames) {
      try {
        if (fieldName.includes('.')) {
          const parts = fieldName.split('.');
          const field = form.getValues(parts[0] as any)?.[parts[1]];
          if (field) {
            await form.trigger(fieldName as any);
          }
        } else {
          const field = form.getValues(fieldName as any);
          if (field !== undefined && field !== null) {
            await form.trigger(fieldName as any);
          }
        }
      } catch (error) {
        errors.push(`${fieldName}: ${error}`);
      }
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const createConsentRecords = async () => {
    const consentData = form.getValues('consent');
    const ipAddress = consentData.consentIP;
    const userAgent = navigator.userAgent;

    const consentTypes: Array<{ type: ConsentType; given: boolean }> = [
      { type: 'data_processing', given: consentData.dataProcessingConsent },
      { type: 'marketing', given: consentData.marketingConsent },
      { type: 'partner_sharing', given: consentData.partnerSharingConsent },
      { type: 'credit_check', given: consentData.creditCheckConsent },
    ];

    const records = [];
    for (const { type, given } of consentTypes) {
      if (given) {
        const record = createVietnameseConsent('temp_lead_id', {
          type,
          consentGiven: given,
          ipAddress,
          userAgent,
          language,
          method: 'checkbox',
        });
        records.push(record);
      }
    }

    setConsentRecords(records);
  };

  const calculateLeadScore = async () => {
    try {
      const formData = form.getValues();
      const leadData: LeadData = {
        ...formData,
        behavior: {
          howFound: source?.source || 'website',
          previousApplications: 0,
          websiteVisits: 1,
          timeSpentOnSite: Math.floor((Date.now() - new Date(formData.consent.consentTimestamp).getTime()) / 60000),
          pagesViewed: currentStep + 1,
          formStartTime: formData.consent.consentTimestamp,
          formCompletionTime: new Date().toISOString(),
          deviceType: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent,
          ipAddress: formData.consent.consentIP,
        },
        source: {
          source: source?.source || 'direct',
          medium: source?.medium || 'organic',
          campaign: source?.campaign,
        },
      };

      const score = scoreVietnameseLead(leadData);
      setLeadScore(score);
      onScoreCalculated?.(score);

      return score;
    } catch (error) {
      console.error('Error calculating lead score:', error);
      return null;
    }
  };

  const findMatchingPartners = async () => {
    try {
      const formData = form.getValues();
      const criteria = {
        loanType: formData.loanRequirements.loanType,
        loanAmount: formData.loanRequirements.requestedAmount,
        loanTerm: formData.loanRequirements.requestedTerm,
        provinceCode: formData.currentAddress.provinceCode,
        creditScore: formData.financial.creditScore,
        monthlyIncome: formData.employment.monthlyIncome,
        employmentType: formData.employment.employmentType,
        urgency: formData.loanRequirements.urgency,
        requiresOnlineApplication: true,
        requiresFastApproval: formData.loanRequirements.urgency === 'urgent',
        collateralAvailable: formData.loanRequirements.collateralAvailable,
        collateralValue: formData.loanRequirements.collateralValue,
      };

      const matches = matchVietnamesePartners('temp_lead_id', criteria);
      setPartnerMatches(matches);
      onPartnersMatched?.(matches);

      return matches;
    } catch (error) {
      console.error('Error finding matching partners:', error);
      return null;
    }
  };

  const handleSubmit = async (data: VietnameseLeadFormData) => {
    setIsSubmitting(true);

    try {
      // Final validation
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
          title: language === 'vi' ? 'Lỗi xác thực' : 'Validation Error',
          description: language === 'vi' ? 'Vui lòng kiểm tra lại thông tin' : 'Please check the form fields',
          variant: 'destructive',
        });
        return;
      }

      // Create final lead data
      const leadData: LeadData = {
        ...data,
        behavior: {
          howFound: source?.source || 'website',
          previousApplications: 0,
          websiteVisits: 1,
          timeSpentOnSite: Math.floor((Date.now() - new Date(data.consent.consentTimestamp).getTime()) / 60000),
          pagesViewed: totalSteps,
          formStartTime: data.consent.consentTimestamp,
          formCompletionTime: new Date().toISOString(),
          deviceType: /Mobile|Android|iPhone/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          browser: navigator.userAgent,
          ipAddress: data.consent.consentIP,
        },
        source: {
          source: source?.source || 'direct',
          medium: source?.medium || 'organic',
          campaign: source?.campaign,
        },
      };

      // Calculate final score if not already done
      if (!leadScore) {
        await calculateLeadScore();
      }

      // Find final partners if not already done
      if (!partnerMatches) {
        await findMatchingPartners();
      }

      onSubmit?.(leadData);

      toast({
        title: language === 'vi' ? 'Gửi thành công' : 'Success',
        description: language === 'vi' ? 'Thông tin của bạn đã được ghi nhận' : 'Your information has been submitted successfully',
      });

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: language === 'vi' ? 'Lỗi' : 'Error',
        description: language === 'vi' ? 'Đã có lỗi xảy ra, vui lòng thử lại' : 'An error occurred, please try again',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = ((currentStep + 1) / totalSteps) * 100;

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <LeadQualificationForm
            form={form}
            language={language}
          />
        );
      case 1:
        return (
          <FinancialNeedsAssessment
            form={form}
            language={language}
          />
        );
      case 2:
        return (
          <ContactInformationForm
            form={form}
            language={language}
          />
        );
      case 3:
        return (
          <ConsentManagementForm
            form={form}
            language={language}
            consentRecords={consentRecords}
          />
        );
      case 4:
        return (
          <CustomFieldsForm
            form={form}
            customFields={customFields}
            language={language}
          />
        );
      case 5:
        return (
          <ReviewStep
            form={form}
            leadScore={leadScore}
            partnerMatches={partnerMatches}
            language={language}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {language === 'vi' ? 'Yêu cầu vay vốn' : 'Loan Application'}
        </h1>
        <p className="text-gray-600">
          {language === 'vi' ? 'Tìm kiếm giải pháp tài chính phù hợp nhất' : 'Find the best financial solution for your needs'}
        </p>
      </div>

      {/* Progress Bar */}
      {showProgress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Bước {currentStep + 1} / {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex justify-center">
        <div className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => index <= currentStep && setCurrentStep(index)}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${index === currentStep
                    ? 'bg-white text-blue-600 shadow-sm'
                    : index < currentStep
                      ? 'text-green-600 hover:bg-green-50'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                  ${index > currentStep ? 'cursor-not-allowed' : ''}
                `}
                disabled={index > currentStep}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden md:inline">{step.title}</span>
                {index === currentStep && (
                  <Badge variant="secondary" className="ml-1">
                    {index + 1}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(steps[currentStep].icon, { className: "w-5 h-5" })}
            <span>{steps[currentStep].title}</span>
          </CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {renderStepContent()}

              {/* Validation Errors */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={previousStep}
                  disabled={currentStep === 0}
                >
                  {language === 'vi' ? 'Quay lại' : 'Previous'}
                </Button>

                <div className="space-x-2">
                  {currentStep === totalSteps - 1 ? (
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="min-w-[120px]"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          {language === 'vi' ? 'Đang gửi...' : 'Submitting...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {language === 'vi' ? 'Gửi yêu cầu' : 'Submit Application'}
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="min-w-[120px]"
                    >
                      {language === 'vi' ? 'Tiếp theo' : 'Next'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>

      {/* Score and Matches Display */}
      {(leadScore || partnerMatches) && currentStep === totalSteps - 1 && (
        <div className="grid md:grid-cols-2 gap-6">
          {leadScore && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'vi' ? 'Điểm hồ sơ' : 'Lead Score'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {leadScore.totalScore}/100
                  </div>
                  <Badge variant={leadScore.grade === 'A' ? 'default' : 'secondary'}>
                    Grade: {leadScore.grade}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    {language === 'vi' ? 'Xác suất chuyển đổi:' : 'Conversion Probability:'} {leadScore.estimatedConversionProbability}%
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {partnerMatches && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {language === 'vi' ? 'Đối tác phù hợp' : 'Matching Partners'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-green-600">
                    {partnerMatches.summary.eligiblePartnersCount}
                  </p>
                  <p className="text-sm text-gray-600">
                    {language === 'vi' ? 'Đối tác đủ điều kiện' : 'Eligible Partners'}
                  </p>
                  {partnerMatches.bestMatch && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">
                        {language === 'vi' ? 'Đối tác phù hợp nhất:' : 'Best Match:'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {partnerMatches.bestMatch.partnerName}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

// Review Step Component
const ReviewStep: React.FC<{
  form: any;
  leadScore: any;
  partnerMatches: any;
  language: 'vi' | 'en';
}> = ({ form, leadScore, partnerMatches, language }) => {
  const watchedValues = useWatch({
    control: form.control,
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          {language === 'vi' ? 'Kiểm tra lại thông tin' : 'Review Your Information'}
        </h3>
        <p className="text-gray-600">
          {language === 'vi' ? 'Vui lòng kiểm tra lại thông tin trước khi gửi' : 'Please review your information before submitting'}
        </p>
      </div>

      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personal">
            {language === 'vi' ? 'Cá nhân' : 'Personal'}
          </TabsTrigger>
          <TabsTrigger value="financial">
            {language === 'vi' ? 'Tài chính' : 'Financial'}
          </TabsTrigger>
          <TabsTrigger value="loan">
            {language === 'vi' ? 'Vay vốn' : 'Loan'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Họ và tên' : 'Full Name'}
              </label>
              <p className="text-sm">{watchedValues.fullName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Ngày sinh' : 'Date of Birth'}
              </label>
              <p className="text-sm">{watchedValues.dateOfBirth}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Giới tính' : 'Gender'}
              </label>
              <p className="text-sm">{watchedValues.gender}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'CMND/CCCD' : 'ID Card'}
              </label>
              <p className="text-sm">{watchedValues.nationalId}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Điện thoại' : 'Phone'}
              </label>
              <p className="text-sm">{watchedValues.phoneNumber}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Email' : 'Email'}
              </label>
              <p className="text-sm">{watchedValues.email || '-'}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Loại hình công việc' : 'Employment Type'}
              </label>
              <p className="text-sm">{watchedValues.employment?.employmentType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Thu nhập hàng tháng' : 'Monthly Income'}
              </label>
              <p className="text-sm">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(watchedValues.employment?.monthlyIncome || 0)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Khoản nợ hiện tại' : 'Existing Debt'}
              </label>
              <p className="text-sm">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(watchedValues.financial?.existingMonthlyDebtPayments || 0)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Có tài khoản ngân hàng' : 'Has Bank Account'}
              </label>
              <p className="text-sm">{watchedValues.financial?.hasBankAccount ? (language === 'vi' ? 'Có' : 'Yes') : (language === 'vi' ? 'Không' : 'No')}</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="loan" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Số tiền vay' : 'Loan Amount'}
              </label>
              <p className="text-sm">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(watchedValues.loanRequirements?.requestedAmount || 0)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Thời gian vay' : 'Loan Term'}
              </label>
              <p className="text-sm">{watchedValues.loanRequirements?.requestedTerm} {language === 'vi' ? 'tháng' : 'months'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Loại vay' : 'Loan Type'}
              </label>
              <p className="text-sm">{watchedValues.loanRequirements?.loanType}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">
                {language === 'vi' ? 'Mục đích vay' : 'Loan Purpose'}
              </label>
              <p className="text-sm">{watchedValues.loanRequirements?.loanPurpose}</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="text-center">
        <p className="text-sm text-gray-600">
          {language === 'vi'
            ? 'Bằng việc nhấn nút "Gửi yêu cầu", bạn xác nhận rằng tất cả thông tin trên là chính xác và bạn đồng ý với các điều khoản và điều kiện.'
            : 'By clicking "Submit Application", you confirm that all information above is accurate and you agree to the terms and conditions.'
          }
        </p>
      </div>
    </div>
  );
};

export default VietnameseLeadDataCollector;