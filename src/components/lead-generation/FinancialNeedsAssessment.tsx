/**
 * Financial Needs Assessment Form Component
 * Employment, income, and loan requirements collection
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calculator, DollarSign, TrendingUp, Briefcase } from 'lucide-react';

interface FinancialNeedsAssessmentProps {
  form: any;
  language: 'vi' | 'en';
}

const FinancialNeedsAssessment: React.FC<FinancialNeedsAssessmentProps> = ({ form, language }) => {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
    trigger,
  } = useFormContext();

  const [monthlyIncome, setMonthlyIncome] = useState(10000000);
  const [loanAmount, setLoanAmount] = useState(50000000);
  const [loanTerm, setLoanTerm] = useState(12);

  const watchedValues = watch();

  // Calculate debt-to-income ratio
  const debtToIncomeRatio = watchedValues.financial?.existingMonthlyDebtPayments
    ? (watchedValues.financial.existingMonthlyDebtPayments / monthlyIncome) * 100
    : 0;

  // Calculate estimated monthly payment (simple interest calculation)
  const interestRate = 0.12; // 12% annual rate
  const monthlyInterestRate = interestRate / 12;
  const estimatedMonthlyPayment = loanAmount > 0 && loanTerm > 0
    ? (loanAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, loanTerm)) /
      (Math.pow(1 + monthlyInterestRate, loanTerm) - 1)
    : 0;

  const totalNewMonthlyDebt = (watchedValues.financial?.existingMonthlyDebtPayments || 0) + estimatedMonthlyPayment;
  const totalDebtToIncomeRatio = monthlyIncome > 0 ? (totalNewMonthlyDebt / monthlyIncome) * 100 : 0;

  const translations = {
    vi: {
      employment: {
        title: 'Thông tin việc làm',
        employmentType: 'Loại hình công việc',
        employmentStatus: 'Tình trạng công việc',
        companyName: 'Tên công ty',
        jobTitle: 'Chức danh',
        industry: 'Ngành nghề',
        workDuration: 'Thời gian làm việc',
        months: 'tháng',
        monthlyIncome: 'Thu nhập hàng tháng',
        incomeSource: 'Nguồn thu nhập',
        canProvideProof: 'Có thể cung cấp giấy tờ chứng minh thu nhập',
      },
      financial: {
        title: 'Tình hình tài chính',
        existingDebt: 'Khoản nợ hàng tháng hiện tại',
        hasBankAccount: 'Có tài khoản ngân hàng',
        creditScore: 'Điểm tín dụng',
        previousLoans: 'Đã từng vay vốn',
        onTimePayment: 'Tỷ lệ trả nợ đúng hạn',
        defaultHistory: 'Lịch sử trả nợ trễ',
        hasAssets: {
          realEstate: 'Có bất động sản',
          vehicle: 'Có phương tiện giao thông',
          savings: 'Có tiền tiết kiệm',
          investments: 'Có đầu tư',
        },
      },
      loan: {
        title: 'Yêu cầu vay vốn',
        requestedAmount: 'Số tiền muốn vay',
        loanTerm: 'Thời gian vay',
        loanType: 'Loại vay',
        loanPurpose: 'Mục đích vay',
        urgency: 'Mức độ khẩn cấp',
        collateral: 'Tài sản đảm bảo',
        collateralType: 'Loại tài sản đảm bảo',
        collateralValue: 'Giá trị tài sản đảm bảo',
        maxInterestRate: 'Lãi suất tối đa mong muốn',
      },
      employmentTypes: {
        full_time: 'Toàn thời gian',
        part_time: 'Bán thời gian',
        self_employed: 'Tự do',
        business_owner: 'Chủ doanh nghiệp',
        freelancer: 'Freelancer',
        student: 'Sinh viên',
        retired: 'Hưu trí',
        unemployed: 'Không có việc làm',
      },
      employmentStatus: {
        permanent: 'Chính thức',
        contract: 'Hợp đồng',
        probation: 'Thử việc',
        temporary: 'Tạm thời',
        seasonal: 'Theo mùa vụ',
      },
      incomeSources: {
        salary: 'Lương',
        business_income: 'Thu nhập kinh doanh',
        freelance: 'Thu nhập tự do',
        investments: 'Đầu tư',
        rental: 'Cho thuê',
        pension: 'Lương hưu',
        family_support: 'Hỗ trợ gia đình',
        other: 'Khác',
      },
      loanTypes: {
        personal_loan: 'Vay cá nhân',
        business_loan: 'Vay kinh doanh',
        mortgage_loan: 'Vay mua nhà',
        auto_loan: 'Vay mua xe',
        credit_card: 'Thẻ tín dụng',
        agricultural_loan: 'Vay nông nghiệp',
        student_loan: 'Vay học tập',
        home_equity: 'Vay thế chấp nhà',
        debt_consolidation: 'Gom nợ',
        working_capital: 'Vốn lưu động',
        equipment_financing: 'Vay mua thiết bị',
        invoice_financing: 'Tài trợ hóa đơn',
        trade_finance: 'Tài trợ thương mại',
        construction_loan: 'Vay xây dựng',
        sme_loan: 'Vay SME',
        startup_loan: 'Vay khởi nghiệp',
      },
      urgency: {
        urgent: 'Khẩn cấp',
        normal: 'Bình thường',
        flexible: 'Linh hoạt',
      },
      calculations: {
        debtToIncome: 'Tỷ lệ nối/thu nhập',
        estimatedMonthlyPayment: 'Phí trả góp dự kiến',
        totalDebtToIncome: 'Tổng tỷ lệ nợ/thu nhập',
        currency: ' VNĐ',
      },
      warnings: {
        highDebtRatio: 'Tỷ lệ nợ/thu nhập cao (>50%), có thể ảnh hưởng đến khả năng được duyệt vay',
        veryHighDebtRatio: 'Tỷ lệ nợ/thu nhập rất cao (>70%), khó được duyệt vay',
        incomeVerification: 'Bạn cần có giấy tờ chứng minh thu nhập để tăng khả năng được duyệt',
      },
    },
    en: {
      employment: {
        title: 'Employment Information',
        employmentType: 'Employment Type',
        employmentStatus: 'Employment Status',
        companyName: 'Company Name',
        jobTitle: 'Job Title',
        industry: 'Industry',
        workDuration: 'Work Duration',
        months: 'months',
        monthlyIncome: 'Monthly Income',
        incomeSource: 'Income Source',
        canProvideProof: 'Can provide income verification documents',
      },
      financial: {
        title: 'Financial Information',
        existingDebt: 'Current Monthly Debt Payments',
        hasBankAccount: 'Have Bank Account',
        creditScore: 'Credit Score',
        previousLoans: 'Previous Loan History',
        onTimePayment: 'On-time Payment Rate',
        defaultHistory: 'Default History',
        hasAssets: {
          realEstate: 'Own Real Estate',
          vehicle: 'Own Vehicle',
          savings: 'Have Savings',
          investments: 'Have Investments',
        },
      },
      loan: {
        title: 'Loan Requirements',
        requestedAmount: 'Requested Loan Amount',
        loanTerm: 'Loan Term',
        loanType: 'Loan Type',
        loanPurpose: 'Loan Purpose',
        urgency: 'Urgency Level',
        collateral: 'Collateral Available',
        collateralType: 'Collateral Type',
        collateralValue: 'Collateral Value',
        maxInterestRate: 'Maximum Preferred Interest Rate',
      },
      employmentTypes: {
        full_time: 'Full-time',
        part_time: 'Part-time',
        self_employed: 'Self-employed',
        business_owner: 'Business Owner',
        freelancer: 'Freelancer',
        student: 'Student',
        retired: 'Retired',
        unemployed: 'Unemployed',
      },
      employmentStatus: {
        permanent: 'Permanent',
        contract: 'Contract',
        probation: 'Probation',
        temporary: 'Temporary',
        seasonal: 'Seasonal',
      },
      incomeSources: {
        salary: 'Salary',
        business_income: 'Business Income',
        freelance: 'Freelance Income',
        investments: 'Investments',
        rental: 'Rental Income',
        pension: 'Pension',
        family_support: 'Family Support',
        other: 'Other',
      },
      loanTypes: {
        personal_loan: 'Personal Loan',
        business_loan: 'Business Loan',
        mortgage_loan: 'Mortgage Loan',
        auto_loan: 'Auto Loan',
        credit_card: 'Credit Card',
        agricultural_loan: 'Agricultural Loan',
        student_loan: 'Student Loan',
        home_equity: 'Home Equity Loan',
        debt_consolidation: 'Debt Consolidation',
        working_capital: 'Working Capital',
        equipment_financing: 'Equipment Financing',
        invoice_financing: 'Invoice Financing',
        trade_finance: 'Trade Finance',
        construction_loan: 'Construction Loan',
        sme_loan: 'SME Loan',
        startup_loan: 'Startup Loan',
      },
      urgency: {
        urgent: 'Urgent',
        normal: 'Normal',
        flexible: 'Flexible',
      },
      calculations: {
        debtToIncome: 'Debt-to-Income Ratio',
        estimatedMonthlyPayment: 'Estimated Monthly Payment',
        totalDebtToIncome: 'Total Debt-to-Income Ratio',
        currency: ' VND',
      },
      warnings: {
        highDebtRatio: 'High debt-to-income ratio (>50%), may affect loan approval',
        veryHighDebtRatio: 'Very high debt-to-income ratio (>70%), loan approval unlikely',
        incomeVerification: 'Income verification documents required to improve approval chances',
      },
    },
  };

  const t = translations[language];

  useEffect(() => {
    setValue('employment.monthlyIncome', monthlyIncome);
    setValue('loanRequirements.requestedAmount', loanAmount);
    setValue('loanRequirements.requestedTerm', loanTerm);
  }, [monthlyIncome, loanAmount, loanTerm, setValue]);

  return (
    <div className="space-y-6">
      {/* Financial Summary Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>{t.calculations.debtToIncome} & {t.calculations.estimatedMonthlyPayment}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">{t.calculations.debtToIncome}</Label>
              <div className="text-2xl font-bold">
                {debtToIncomeRatio.toFixed(1)}%
              </div>
              {debtToIncomeRatio > 50 && (
                <Badge variant="destructive" className="mt-1">
                  {t.warnings.highDebtRatio}
                </Badge>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium">{t.calculations.estimatedMonthlyPayment}</Label>
              <div className="text-2xl font-bold text-green-600">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(estimatedMonthlyPayment)}
              </div>
            </div>
          </div>
          <div>
            <Label className="text-sm font-medium">{t.calculations.totalDebtToIncome}</Label>
            <div className="text-xl font-bold">
              {totalDebtToIncomeRatio.toFixed(1)}%
            </div>
            {totalDebtToIncomeRatio > 70 && (
              <Badge variant="destructive" className="mt-1">
                {t.warnings.veryHighDebtRatio}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Employment Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="w-5 h-5" />
            <span>{t.employment.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.employment.employmentType} *</Label>
              <Select
                onValueChange={(value) => setValue('employment.employmentType', value)}
                defaultValue={watchedValues.employment?.employmentType}
              >
                <SelectTrigger className={errors.employment?.employmentType ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t.employment.employmentType} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.employmentTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employment?.employmentType && (
                <p className="text-sm text-red-600">{errors.employment.employmentType.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.employment.employmentStatus} *</Label>
              <Select
                onValueChange={(value) => setValue('employment.employmentStatus', value)}
                defaultValue={watchedValues.employment?.employmentStatus}
              >
                <SelectTrigger className={errors.employment?.employmentStatus ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t.employment.employmentStatus} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.employmentStatus).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employment?.employmentStatus && (
                <p className="text-sm text-red-600">{errors.employment.employmentStatus.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.employment.companyName}</Label>
              <Input
                type="text"
                placeholder={t.employment.companyName}
                {...register('employment.companyName')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.employment.jobTitle}</Label>
              <Input
                type="text"
                placeholder={t.employment.jobTitle}
                {...register('employment.jobTitle')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.employment.industry}</Label>
              <Input
                type="text"
                placeholder={t.employment.industry}
                {...register('employment.industry')}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.employment.workDuration} ({t.employment.months})</Label>
              <Input
                type="number"
                {...register('employment.workDurationMonths', { valueAsNumber: true })}
                className={errors.employment?.workDurationMonths ? 'border-red-500' : ''}
              />
              {errors.employment?.workDurationMonths && (
                <p className="text-sm text-red-600">{errors.employment.workDurationMonths.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.employment.monthlyIncome} ({t.calculations.currency})</Label>
              <div className="space-y-2">
                <Slider
                  value={[monthlyIncome]}
                  onValueChange={(value) => setMonthlyIncome(value[0])}
                  max={200000000}
                  min={1000000}
                  step={1000000}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                  className={errors.employment?.monthlyIncome ? 'border-red-500' : ''}
                />
              </div>
              {errors.employment?.monthlyIncome && (
                <p className="text-sm text-red-600">{errors.employment.monthlyIncome.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.employment.incomeSource} *</Label>
              <Select
                onValueChange={(value) => setValue('employment.incomeSource', value)}
                defaultValue={watchedValues.employment?.incomeSource}
              >
                <SelectTrigger className={errors.employment?.incomeSource ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t.employment.incomeSource} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.incomeSources).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.employment?.incomeSource && (
                <p className="text-sm text-red-600">{errors.employment.incomeSource.message as string}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="canProvideIncomeProof"
              checked={watchedValues.employment?.canProvideIncomeProof}
              onCheckedChange={(checked) => setValue('employment.canProvideIncomeProof', checked)}
            />
            <Label htmlFor="canProvideIncomeProof">{t.employment.canProvideProof}</Label>
          </div>

          {!watchedValues.employment?.canProvideIncomeProof && (
            <p className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
              {t.warnings.incomeVerification}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5" />
            <span>{t.financial.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.financial.existingDebt} ({t.calculations.currency})</Label>
              <Input
                type="number"
                {...register('financial.existingMonthlyDebtPayments', { valueAsNumber: true })}
                className={errors.financial?.existingMonthlyDebtPayments ? 'border-red-500' : ''}
              />
              {errors.financial?.existingMonthlyDebtPayments && (
                <p className="text-sm text-red-600">{errors.financial.existingMonthlyDebtPayments.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.financial.creditScore} (300-900)</Label>
              <Input
                type="number"
                placeholder="700"
                {...register('financial.creditScore', { valueAsNumber: true })}
                min={300}
                max={900}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasBankAccount"
              checked={watchedValues.financial?.hasBankAccount}
              onCheckedChange={(checked) => setValue('financial.hasBankAccount', checked)}
            />
            <Label htmlFor="hasBankAccount">{t.financial.hasBankAccount}</Label>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-sm font-medium">{t.financial.hasAssets}</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasRealEstate"
                  checked={watchedValues.financial?.assets?.hasRealEstate}
                  onCheckedChange={(checked) => setValue('financial.assets.hasRealEstate', checked)}
                />
                <Label htmlFor="hasRealEstate">{t.financial.hasAssets.realEstate}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasVehicle"
                  checked={watchedValues.financial?.assets?.hasVehicle}
                  onCheckedChange={(checked) => setValue('financial.assets.hasVehicle', checked)}
                />
                <Label htmlFor="hasVehicle">{t.financial.hasAssets.vehicle}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasSavings"
                  checked={watchedValues.financial?.assets?.hasSavings}
                  onCheckedChange={(checked) => setValue('financial.assets.hasSavings', checked)}
                />
                <Label htmlFor="hasSavings">{t.financial.hasAssets.savings}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasInvestments"
                  checked={watchedValues.financial?.assets?.hasInvestments}
                  onCheckedChange={(checked) => setValue('financial.assets.hasInvestments', checked)}
                />
                <Label htmlFor="hasInvestments">{t.financial.hasAssets.investments}</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loan Requirements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>{t.loan.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.loan.requestedAmount} ({t.calculations.currency})</Label>
              <div className="space-y-2">
                <Slider
                  value={[loanAmount]}
                  onValueChange={(value) => setLoanAmount(value[0])}
                  max={1000000000}
                  min={5000000}
                  step={5000000}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)}
                  className={errors.loanRequirements?.requestedAmount ? 'border-red-500' : ''}
                />
              </div>
              {errors.loanRequirements?.requestedAmount && (
                <p className="text-sm text-red-600">{errors.loanRequirements.requestedAmount.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.loan.loanTerm} ({t.employment.months})</Label>
              <div className="space-y-2">
                <Slider
                  value={[loanTerm]}
                  onValueChange={(value) => setLoanTerm(value[0])}
                  max={360}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <Input
                  type="number"
                  value={loanTerm}
                  onChange={(e) => setLoanTerm(parseInt(e.target.value) || 0)}
                  className={errors.loanRequirements?.requestedTerm ? 'border-red-500' : ''}
                />
              </div>
              {errors.loanRequirements?.requestedTerm && (
                <p className="text-sm text-red-600">{errors.loanRequirements.requestedTerm.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.loan.loanType} *</Label>
              <Select
                onValueChange={(value) => setValue('loanRequirements.loanType', value)}
                defaultValue={watchedValues.loanRequirements?.loanType}
              >
                <SelectTrigger className={errors.loanRequirements?.loanType ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t.loan.loanType} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.loanTypes).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.loanRequirements?.loanType && (
                <p className="text-sm text-red-600">{errors.loanRequirements.loanType.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t.loan.urgency} *</Label>
              <Select
                onValueChange={(value) => setValue('loanRequirements.urgency', value)}
                defaultValue={watchedValues.loanRequirements?.urgency}
              >
                <SelectTrigger className={errors.loanRequirements?.urgency ? 'border-red-500' : ''}>
                  <SelectValue placeholder={t.loan.urgency} />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(t.urgency).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.loanRequirements?.urgency && (
                <p className="text-sm text-red-600">{errors.loanRequirements.urgency.message as string}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t.loan.loanPurpose} *</Label>
            <Input
              type="text"
              placeholder={t.loan.loanPurpose}
              {...register('loanRequirements.loanPurpose')}
              className={errors.loanRequirements?.loanPurpose ? 'border-red-500' : ''}
            />
            {errors.loanRequirements?.loanPurpose && (
              <p className="text-sm text-red-600">{errors.loanRequirements.loanPurpose.message as string}</p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="collateralAvailable"
                checked={watchedValues.loanRequirements?.collateralAvailable}
                onCheckedChange={(checked) => setValue('loanRequirements.collateralAvailable', checked)}
              />
              <Label htmlFor="collateralAvailable">{t.loan.collateral}</Label>
            </div>

            {watchedValues.loanRequirements?.collateralAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label>{t.loan.collateralType}</Label>
                  <Input
                    type="text"
                    placeholder={t.loan.collateralType}
                    {...register('loanRequirements.collateralType')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.loan.collateralValue} ({t.calculations.currency})</Label>
                  <Input
                    type="number"
                    placeholder={t.loan.collateralValue}
                    {...register('loanRequirements.collateralValue', { valueAsNumber: true })}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.loan.maxInterestRate} (%)</Label>
            <Input
              type="number"
              step="0.1"
              placeholder="20.0"
              {...register('loanRequirements.preferredInterestRate', { valueAsNumber: true })}
              min={0}
              max={50}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialNeedsAssessment;