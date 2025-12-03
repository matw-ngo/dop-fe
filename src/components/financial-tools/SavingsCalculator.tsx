/**
 * Vietnamese Savings Calculator Component
 *
 * A comprehensive savings calculator for Vietnamese bank products with
 * interest rate comparison, compound interest calculations, and goal planning.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Calculator,
  TrendingUp,
  PiggyBank,
  Target,
  Building,
  Info,
  AlertCircle,
  CheckCircle,
  Star,
  ArrowRight,
  Calendar,
  DollarSign,
  BarChart3,
} from 'lucide-react';

// Import calculation functions
import {
  calculateCompoundInterest,
  calculateSimpleInterest,
  formatVND,
} from '@/lib/financial-data/vietnamese-financial-data';
import {
  getAllSavingsProducts,
  getBestSavingsRates,
  compareSavingsProducts,
  VietnameseBank,
} from '@/lib/financial-data/bank-rates';
import { calculateRealReturns, calculatePurchasingPowerImpact } from '@/lib/financial-data/market-indicators';

// Types
interface SavingsFormData {
  principal: number;
  monthlyContribution: number;
  annualRate: number;
  termInMonths: number;
  compoundingFrequency: 'monthly' | 'quarterly' | 'annual';
  hasMonthlyContribution: boolean;
  bankId?: string;
  term?: number;
  isInflationAdjusted: boolean;
}

interface SavingsResults {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  effectiveRate: number;
  realReturns: number;
  purchasingPowerImpact: {
    futureValue: number;
    purchasingPower: number;
    loss: number;
    lossPercentage: number;
  };
  monthlyProjections?: Array<{
    month: number;
    amount: number;
    contribution?: number;
    interest: number;
  }>;
}

interface BankComparison {
  bank: VietnameseBank;
  rate: number;
  effectiveRate: number;
  finalAmount: number;
  features: string[];
  score: number;
}

interface SavingsGoal {
  targetAmount: number;
  currentSavings: number;
  monthlyContribution: number;
  timeToGoal: number;
  requiredRate: number;
  feasibility: 'easy' | 'moderate' | 'challenging' | 'impossible';
  recommendations: string[];
}

const SavingsCalculator: React.FC = () => {
  // Form state
  const [formData, setFormData] = useState<SavingsFormData>({
    principal: 100000000, // 100 triệu VND default
    monthlyContribution: 5000000, // 5 triệu VND default
    annualRate: 6.0,
    termInMonths: 12,
    compoundingFrequency: 'monthly',
    hasMonthlyContribution: false,
    isInflationAdjusted: false,
  });

  // Results state
  const [results, setResults] = useState<SavingsResults | null>(null);
  const [bankComparisons, setBankComparisons] = useState<BankComparison[]>([]);
  const [savingsGoal, setSavingsGoal] = useState<SavingsGoal | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('calculator');

  // Available banks
  const [banks, setBanks] = useState<VietnameseBank[]>([]);
  const [bestRates, setBestRates] = useState<any[]>([]);

  // Input change handler
  const handleInputChange = useCallback((field: keyof SavingsFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Load bank data
  useEffect(() => {
    const bankData = [
      {
        id: 'vcb',
        name: 'Vietcombank',
        nameVn: 'Ngân hàng TMCP Ngoại thương Việt Nam',
        savingsRates: {
          1: { rate: 0.5, minimumAmount: 100000 },
          3: { rate: 1.5, minimumAmount: 100000 },
          6: { rate: 2.8, minimumAmount: 100000 },
          12: { rate: 4.7, minimumAmount: 100000 },
          24: { rate: 5.2, minimumAmount: 100000 },
          36: { rate: 5.5, minimumAmount: 100000 },
        },
        loanRates: {},
      },
      {
        id: 'tcb',
        name: 'Techcombank',
        nameVn: 'Ngân hàng TMCP Kỹ thương Việt Nam',
        savingsRates: {
          1: { rate: 0.8, minimumAmount: 100000 },
          3: { rate: 2.0, minimumAmount: 100000 },
          6: { rate: 3.5, minimumAmount: 100000 },
          12: { rate: 5.5, minimumAmount: 100000 },
          24: { rate: 6.0, minimumAmount: 100000 },
          36: { rate: 6.3, minimumAmount: 100000 },
        },
        loanRates: {},
      },
      {
        id: 'acb',
        name: 'ACB',
        nameVn: 'Ngân hàng TMCP Á Châu',
        savingsRates: {
          1: { rate: 0.6, minimumAmount: 100000 },
          3: { rate: 1.8, minimumAmount: 100000 },
          6: { rate: 3.2, minimumAmount: 100000 },
          12: { rate: 5.0, minimumAmount: 100000 },
          24: { rate: 5.5, minimumAmount: 100000 },
          36: { rate: 5.8, minimumAmount: 100000 },
        },
        loanRates: {},
      },
    ];
    setBanks(bankData);

    // Get best rates for the selected term
    const rates = bankData
      .filter(bank => bank.savingsRates[formData.termInMonths])
      .map(bank => ({
        id: bank.id,
        name: bank.name,
        rate: bank.savingsRates[formData.termInMonths].rate,
        effectiveRate: calculateEffectiveRate(bank.savingsRates[formData.termInMonths].rate),
      }))
      .sort((a, b) => b.effectiveRate - a.effectiveRate);
    setBestRates(rates);
  }, [formData.termInMonths]);

  // Calculate effective rate
  const calculateEffectiveRate = (nominalRate: number, frequency: number = 12): number => {
    return (Math.pow(1 + nominalRate / 100 / frequency, frequency) - 1) * 100;
  };

  // Calculate savings
  const calculateSavings = useCallback(async () => {
    setLoading(true);
    setErrors([]);

    try {
      // Validate inputs
      if (formData.principal < 1000000) {
        setErrors(['Số tiền gửi tối thiểu là 1 triệu VND']);
        setLoading(false);
        return;
      }

      if (formData.annualRate < 0 || formData.annualRate > 20) {
        setErrors(['Lãi suất không hợp lệ (0-20%)']);
        setLoading(false);
        return;
      }

      if (formData.termInMonths < 1 || formData.termInMonths > 360) {
        setErrors(['Kỳ hạn không hợp lệ (1-360 tháng)']);
        setLoading(false);
        return;
      }

      // Calculate compounding frequency
      const frequency = formData.compoundingFrequency === 'monthly' ? 12 :
                       formData.compoundingFrequency === 'quarterly' ? 4 : 1;

      // Calculate base interest
      const baseCalculation = calculateCompoundInterest(
        formData.principal,
        formData.annualRate,
        formData.termInMonths,
        frequency
      );

      let totalInterest = baseCalculation.totalInterest;
      let finalAmount = baseCalculation.finalAmount;
      let totalContributions = formData.principal;

      // Calculate with monthly contributions if enabled
      const monthlyProjections = [];
      if (formData.hasMonthlyContribution && formData.monthlyContribution > 0) {
        let currentBalance = formData.principal;
        const monthlyRate = formData.annualRate / 100 / 12;

        for (let month = 1; month <= formData.termInMonths; month++) {
          const monthInterest = currentBalance * monthlyRate;
          currentBalance += monthInterest + formData.monthlyContribution;
          totalContributions += formData.monthlyContribution;

          if (month <= 12 || month % 12 === 0) { // Show first 12 months and yearly after
            monthlyProjections.push({
              month,
              amount: currentBalance,
              contribution: formData.monthlyContribution,
              interest: monthInterest,
            });
          }
        }

        finalAmount = currentBalance;
        totalInterest = finalAmount - totalContributions;
      }

      // Calculate effective rate
      const effectiveRate = ((finalAmount - totalContributions) / totalContributions) * (12 / formData.termInMonths) * 100;

      // Calculate real returns (adjusted for inflation)
      const realReturns = formData.isInflationAdjusted
        ? calculateRealReturns(effectiveRate, 3.89) // Current inflation rate
        : effectiveRate;

      // Calculate purchasing power impact
      const purchasingPowerImpact = calculatePurchasingPowerImpact(
        finalAmount,
        3.89, // Current inflation rate
        formData.termInMonths / 12
      );

      setResults({
        finalAmount,
        totalContributions,
        totalInterest,
        effectiveRate,
        realReturns,
        purchasingPowerImpact,
        monthlyProjections,
      });

      // Calculate bank comparisons
      if (banks.length > 0) {
        const comparisons = banks
          .filter(bank => bank.savingsRates[formData.termInMonths])
          .map(bank => {
            const bankRate = bank.savingsRates[formData.termInMonths].rate;
            const bankCalculation = calculateCompoundInterest(
              formData.principal,
              bankRate,
              formData.termInMonths,
              frequency
            );

            return {
              bank,
              rate: bankRate,
              effectiveRate: calculateEffectiveRate(bankRate),
              finalAmount: bankCalculation.finalAmount,
              features: [
                `Lãi suất ${bankRate}%`,
                bank.savingsRates[formData.termInMonths].minimumAmount <= formData.principal ? 'Đạt yêu cầu tối thiểu' : `Cần tối thiểu ${formatVND(bank.savingsRates[formData.termInMonths].minimumAmount)}`,
              ],
              score: bankRate * 10 + (bank.name === 'Vietcombank' ? 5 : 0),
            };
          })
          .sort((a, b) => b.effectiveRate - a.effectiveRate);

        setBankComparisons(comparisons);
      }

    } catch (error) {
      console.error('Calculation error:', error);
      setErrors(['Đã xảy ra lỗi khi tính toán. Vui lòng thử lại.']);
    } finally {
      setLoading(false);
    }
  }, [formData, banks]);

  // Auto-calculate when form data changes
  useEffect(() => {
    if (formData.principal > 0 && formData.annualRate >= 0 && formData.termInMonths > 0) {
      calculateSavings();
    }
  }, [formData, calculateSavings]);

  // Format currency
  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d]/g, '')) : amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculate savings goal
  const calculateSavingsGoal = (targetAmount: number, currentSavings: number, monthlyContribution: number, desiredMonths: number) => {
    const remainingAmount = targetAmount - currentSavings;
    if (remainingAmount <= 0) {
      return {
        targetAmount,
        currentSavings,
        monthlyContribution,
        timeToGoal: 0,
        requiredRate: 0,
        feasibility: 'easy' as const,
        recommendations: ['Bạn đã đạt được mục tiêu tiết kiệm!'],
      };
    }

    // Calculate required rate using formula for future value of annuity
    const monthlyRate = 0.006; // Assume 7.2% annual rate
    let requiredRate = 0.06; // Default 6%

    // Time calculation with compound interest
    const timeWithInterest = Math.log((remainingAmount * monthlyRate / monthlyContribution) + 1) / Math.log(1 + monthlyRate);
    const timeToGoal = Math.ceil(timeWithInterest);

    // Feasibility assessment
    let feasibility: 'easy' | 'moderate' | 'challenging' | 'impossible';
    let recommendations: string[] = [];

    if (timeToGoal <= desiredMonths) {
      feasibility = 'easy';
      recommendations.push('Mục tiêu khả quan - có thể đạt được sớm hơn dự kiến');
    } else if (timeToGoal <= desiredMonths * 1.5) {
      feasibility = 'moderate';
      recommendations.push('Mục tiêu có thể đạt được - cần tăng tiết kiệm hoặc thời gian');
    } else if (timeToGoal <= desiredMonths * 2) {
      feasibility = 'challenging';
      recommendations.push('Mục tiêu thử thách - cần tăng đáng kể tiết kiệm');
      recommendations.push('Cân nhắc các khoản đầu tư có lãi suất cao hơn');
    } else {
      feasibility = 'impossible';
      recommendations.push('Mục tiêu hiện không khả thi với điều kiện hiện tại');
      recommendations.push('Cần tăng thu nhập hoặc giảm mục tiêu');
    }

    return {
      targetAmount,
      currentSavings,
      monthlyContribution,
      timeToGoal,
      requiredRate,
      feasibility,
      recommendations,
    };
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Máy tính tiết kiệm</h1>
        <p className="text-gray-600">Công cụ tính toán và so sánh sản phẩm tiết kiệm tại Việt Nam</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Máy tính
          </TabsTrigger>
          <TabsTrigger value="comparison" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            So sánh ngân hàng
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Mục tiêu
          </TabsTrigger>
          <TabsTrigger value="tips" className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4" />
            Mẹo tiết kiệm
          </TabsTrigger>
        </TabsList>

        {/* Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Thông tin tiết kiệm
                  </CardTitle>
                  <CardDescription>Nhập thông tin chi tiết về khoản tiết kiệm của bạn</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Principal Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="principal">Số tiền gửi ban đầu</Label>
                    <Input
                      id="principal"
                      type="text"
                      value={formatCurrency(formData.principal)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value.replace(/[^\d]/g, '')) || 0;
                        handleInputChange('principal', value);
                      }}
                      className="text-lg"
                    />
                    <Slider
                      value={[formData.principal]}
                      onValueChange={([value]) => handleInputChange('principal', value)}
                      max={2000000000}
                      min={1000000}
                      step={100000000}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 triệu</span>
                      <span>2 tỷ</span>
                    </div>
                  </div>

                  {/* Monthly Contribution */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hasMonthlyContribution">Gửi thêm hàng tháng</Label>
                      <Switch
                        id="hasMonthlyContribution"
                        checked={formData.hasMonthlyContribution}
                        onCheckedChange={(checked) => handleInputChange('hasMonthlyContribution', checked)}
                      />
                    </div>

                    {formData.hasMonthlyContribution && (
                      <div className="space-y-2">
                        <Label htmlFor="monthlyContribution">Số tiền hàng tháng</Label>
                        <Input
                          id="monthlyContribution"
                          type="text"
                          value={formatCurrency(formData.monthlyContribution)}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value.replace(/[^\d]/g, '')) || 0;
                            handleInputChange('monthlyContribution', value);
                          }}
                        />
                        <Slider
                          value={[formData.monthlyContribution]}
                          onValueChange={([value]) => handleInputChange('monthlyContribution', value)}
                          max={100000000}
                          min={1000000}
                          step={5000000}
                          className="mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>1 triệu</span>
                          <span>100 triệu</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interest Rate */}
                  <div className="space-y-2">
                    <Label htmlFor="annualRate">Lãi suất năm (%)</Label>
                    <Input
                      id="annualRate"
                      type="number"
                      value={formData.annualRate}
                      onChange={(e) => handleInputChange('annualRate', parseFloat(e.target.value) || 0)}
                      step="0.1"
                      min="0"
                      max="20"
                    />
                    <Slider
                      value={[formData.annualRate]}
                      onValueChange={([value]) => handleInputChange('annualRate', value)}
                      max={15}
                      min={0.5}
                      step={0.1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>0.5%</span>
                      <span>15%</span>
                    </div>
                  </div>

                  {/* Term */}
                  <div className="space-y-2">
                    <Label htmlFor="termInMonths">Kỳ hạn (tháng)</Label>
                    <Input
                      id="termInMonths"
                      type="number"
                      value={formData.termInMonths}
                      onChange={(e) => handleInputChange('termInMonths', parseInt(e.target.value) || 0)}
                      min="1"
                      max="360"
                    />
                    <Slider
                      value={[formData.termInMonths]}
                      onValueChange={([value]) => handleInputChange('termInMonths', value)}
                      max={60}
                      min={1}
                      step={1}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>1 tháng</span>
                      <span>60 tháng</span>
                    </div>
                  </div>

                  {/* Compounding Frequency */}
                  <div className="space-y-2">
                    <Label>Tần suất nhập gốc</Label>
                    <Select
                      value={formData.compoundingFrequency}
                      onValueChange={(value: 'monthly' | 'quarterly' | 'annual') => handleInputChange('compoundingFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Hàng tháng</SelectItem>
                        <SelectItem value="quarterly">Hàng quý</SelectItem>
                        <SelectItem value="annual">Hàng năm</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Inflation Adjustment */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="isInflationAdjusted">Điều chỉnh theo lạm phát</Label>
                    <Switch
                      id="isInflationAdjusted"
                      checked={formData.isInflationAdjusted}
                      onCheckedChange={(checked) => handleInputChange('isInflationAdjusted', checked)}
                    />
                  </div>

                  {/* Calculate Button */}
                  <Button
                    onClick={calculateSavings}
                    disabled={loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? 'Đang tính toán...' : 'Tính toán tiết kiệm'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {results && (
                <>
                  {/* Summary Results */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Kết quả tiết kiệm
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-sm text-green-600 mb-1">Số tiền cuối kỳ</div>
                          <div className="text-2xl font-bold text-green-900">{formatCurrency(results.finalAmount)}</div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tổng tiền gửi:</span>
                            <span className="font-medium">{formatCurrency(results.totalContributions)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tổng lãi suất:</span>
                            <span className="font-medium text-green-600">{formatCurrency(results.totalInterest)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Lãi suất hiệu quả:</span>
                            <span className="font-medium">{results.effectiveRate.toFixed(2)}%</span>
                          </div>
                          {formData.isInflationAdjusted && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Lãi suất thực:</span>
                                <span className="font-medium">{results.realReturns.toFixed(2)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Mất sức mua:</span>
                                <span className="font-medium text-red-600">{formatCurrency(results.purchasingPowerImpact.loss)}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interest Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tóm tắt lãi suất</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Tỷ lệ lãi/lời:</span>
                          <span className="font-medium">{((results.totalInterest / results.totalContributions) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Lợi nhuận hàng tháng (TB):</span>
                          <span className="font-medium">{formatCurrency(results.totalInterest / formData.termInMonths)}</span>
                        </div>
                      </div>

                      {formData.isInflationAdjusted && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            Sau khi điều chỉnh lạm phát, sức mua thực tế của bạn sẽ giảm {results.purchasingPowerImpact.lossPercentage.toFixed(1)}%.
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>

                  {/* Best Rates */}
                  {bestRates.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Lãi suất tốt nhất ({formData.termInMonths} tháng)</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {bestRates.slice(0, 3).map((rate, index) => (
                          <div key={rate.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {index === 0 && <Star className="w-4 h-4 text-yellow-500" />}
                              <span className="font-medium">{rate.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{rate.rate}%</div>
                              <div className="text-xs text-gray-500">Hiệu quả: {rate.effectiveRate.toFixed(2)}%</div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Errors */}
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          {/* Monthly Projections */}
          {results && results.monthlyProjections && results.monthlyProjections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Dự kiến hàng tháng</CardTitle>
                <CardDescription>Chi tiết số dư và lãi suất theo từng tháng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tháng</TableHead>
                        <TableHead className="text-right">Gửi thêm</TableHead>
                        <TableHead className="text-right">Lãi tháng</TableHead>
                        <TableHead className="text-right">Số dư</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.monthlyProjections.slice(0, 12).map((projection) => (
                        <TableRow key={projection.month}>
                          <TableCell>{projection.month}</TableCell>
                          <TableCell className="text-right">
                            {projection.contribution ? formatCurrency(projection.contribution) : '-'}
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(projection.interest)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(projection.amount)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Bank Comparison Tab */}
        <TabsContent value="comparison">
          <Card>
            <CardHeader>
              <CardTitle>So sánh lãi suất ngân hàng</CardTitle>
              <CardDescription>So sánh lãi suất tiết kiệm giữa các ngân hàng Việt Nam</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bankComparisons.map((comparison, index) => (
                  <Card key={comparison.bank.id} className={index === 0 ? 'ring-2 ring-green-500' : ''}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{comparison.bank.name}</h3>
                        {index === 0 && <Badge variant="default">Tốt nhất</Badge>}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Lãi suất:</span>
                          <span className="font-medium">{comparison.rate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Hiệu quả:</span>
                          <span className="font-medium">{comparison.effectiveRate.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Số tiền cuối kỳ:</span>
                          <span className="font-medium">{formatCurrency(comparison.finalAmount)}</span>
                        </div>
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-1">
                        {comparison.features.map((feature, idx) => (
                          <div key={idx} className="text-xs text-gray-600">• {feature}</div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Goals Tab */}
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Lập kế hoạch tiết kiệm
              </CardTitle>
              <CardDescription>Tính toán kế hoạch tiết kiệm để đạt được mục tiêu tài chính của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalTarget">Mục tiêu (VND)</Label>
                  <Input
                    id="goalTarget"
                    type="text"
                    placeholder="500,000,000"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/[^\d]/g, '')) || 0;
                      // This would update goal calculation in a real implementation
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalCurrent">Tiết kiệm hiện tại</Label>
                  <Input
                    id="goalCurrent"
                    type="text"
                    placeholder="100,000,000"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/[^\d]/g, '')) || 0;
                      // This would update goal calculation in a real implementation
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalMonthly">Gửi hàng tháng</Label>
                  <Input
                    id="goalMonthly"
                    type="text"
                    placeholder="10,000,000"
                    onChange={(e) => {
                      const value = parseFloat(e.target.value.replace(/[^\d]/g, '')) || 0;
                      // This would update goal calculation in a real implementation
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goalTime">Thời gian (tháng)</Label>
                  <Input
                    id="goalTime"
                    type="number"
                    placeholder="24"
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      // This would update goal calculation in a real implementation
                    }}
                  />
                </div>
              </div>

              <Button className="w-full">Tính toán mục tiêu</Button>

              {/* Goal Results would go here */}
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nhập thông tin mục tiêu và tính toán để xem kết quả</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Lời khuyên tiết kiệm hiệu quả</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Chọn kỳ hạn phù hợp</h4>
                  <p className="text-sm text-gray-600">
                    Kỳ hạn dài thường có lãi suất cao hơn nhưng kém linh hoạt
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. So sánh nhiều ngân hàng</h4>
                  <p className="text-sm text-gray-600">
                    Lãi suất có thể khác nhau đáng kể giữa các ngân hàng
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. Cân nhắc lạm phát</h4>
                  <p className="text-sm text-gray-600">
                    Lãi suất thực tế sau khi trừ lạm phát mới là lợi nhuận thật
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">4. Đa dạng hóa</h4>
                  <p className="text-sm text-gray-600">
                    Chia nhỏ khoản tiết kiệm vào nhiều kỳ hạn khác nhau
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chiến lược tiết kiệm thông minh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Quỹ khẩn cấp</h4>
                  <p className="text-sm text-gray-600">
                    Dành 3-6 tháng chi phí sinh hoạt vào tài khoản thanh toán
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">2. Tiết kiệm tự động</h4>
                  <p className="text-sm text-gray-600">
                    Thiết lập chuyển tiền tự động vào tài khoản tiết kiệm
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">3. Lãi kép</h4>
                  <p className="text-sm text-gray-600">
                    Bắt đầu sớm và tái đầu tư lãi suất để tối đa hóa lợi nhuận
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">4. Đánh giá định kỳ</h4>
                  <p className="text-sm text-gray-600">
                    Kiểm tra và điều chỉnh kế hoạch tiết kiệm 3-6 tháng/lần
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SavingsCalculator;