/**
 * Calculation Results Display Component
 *
 * A reusable component for displaying financial calculation results
 * with various visualization options and export functionality.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Download,
  Share2,
  Printer,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  BarChart3,
  PieChart,
} from 'lucide-react';

// Types
interface CalculationResultProps {
  title: string;
  description?: string;
  data: {
    summary?: {
      primary?: { label: string; value: string; trend?: 'up' | 'down'; trendValue?: string };
      secondary?: Array<{ label: string; value: string }>;
    };
    breakdown?: Array<{
      category: string;
      amount: number;
      percentage?: number;
      color?: string;
    }>;
    projections?: Array<{
      period: string;
      amount: number;
      change?: number;
    }>;
    recommendations?: string[];
    riskLevel?: 'low' | 'medium' | 'high';
    score?: number;
    status?: 'success' | 'warning' | 'error';
  };
  type: 'loan' | 'savings' | 'tax' | 'investment' | 'comparison';
  onExport?: (format: 'pdf' | 'excel' | 'csv') => void;
  onShare?: () => void;
  onPrint?: () => void;
}

const CalculationResults: React.FC<CalculationResultProps> = ({
  title,
  description,
  data,
  type,
  onExport,
  onShare,
  onPrint,
}) => {
  const [viewMode, setViewMode] = useState<'summary' | 'detailed' | 'chart'>('summary');

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getRiskColor = (risk?: string) => {
    switch (risk) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'bg-gray-100 text-gray-800';
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {data.summary?.primary?.trend === 'up' && <TrendingUp className="w-5 h-5 text-green-600" />}
              {data.summary?.primary?.trend === 'down' && <TrendingDown className="w-5 h-5 text-red-600" />}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'summary' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('summary')}
              >
                Tóm tắt
              </Button>
              <Button
                variant={viewMode === 'detailed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('detailed')}
              >
                Chi tiết
              </Button>
              <Button
                variant={viewMode === 'chart' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('chart')}
              >
                Biểu đồ
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {onShare && (
                <Button variant="outline" size="sm" onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
              )}
              {onPrint && (
                <Button variant="outline" size="sm" onClick={onPrint}>
                  <Printer className="w-4 h-4" />
                </Button>
              )}
              {onExport && (
                <div className="relative group">
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                  <div className="absolute right-0 mt-2 w-32 bg-white border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onExport('pdf')}
                    >
                      PDF
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onExport('excel')}
                    >
                      Excel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => onExport('csv')}
                    >
                      CSV
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status and Score */}
        <div className="flex items-center gap-4">
          {data.status && (
            <Badge variant={data.status === 'success' ? 'default' : 'secondary'}>
              {data.status === 'success' ? 'Thành công' :
               data.status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
            </Badge>
          )}
          {data.riskLevel && (
            <Badge className={getRiskColor(data.riskLevel)}>
              Rủi ro: {data.riskLevel === 'low' ? 'Thấp' :
                     data.riskLevel === 'medium' ? 'Trung bình' : 'Cao'}
            </Badge>
          )}
          {data.score !== undefined && (
            <Badge className={getScoreColor(data.score)}>
              Điểm: {data.score}/100
            </Badge>
          )}
        </div>

        {/* Summary View */}
        {viewMode === 'summary' && data.summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Primary Value */}
            {data.summary.primary && (
              <div className="col-span-1">
                <div className={`text-3xl font-bold ${getStatusColor(data.status)}`}>
                  {data.summary.primary.value}
                </div>
                <div className="text-sm text-gray-600 mt-1">{data.summary.primary.label}</div>
                {data.summary.primary.trendValue && (
                  <div className="flex items-center gap-1 mt-2">
                    {data.summary.primary.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      data.summary.primary.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {data.summary.primary.trendValue}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Secondary Values */}
            {data.summary.secondary && (
              <div className="col-span-1 lg:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  {data.summary.secondary.map((item, index) => (
                    <div key={index}>
                      <div className="text-lg font-medium">{item.value}</div>
                      <div className="text-sm text-gray-600">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Detailed View */}
        {viewMode === 'detailed' && (
          <div className="space-y-6">
            {/* Breakdown */}
            {data.breakdown && data.breakdown.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Chi tiết phân bổ</h3>
                <div className="space-y-3">
                  {data.breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: item.color || '#3b82f6' }}
                        />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(item.amount)}</div>
                        {item.percentage && (
                          <div className="text-sm text-gray-600">{item.percentage.toFixed(1)}%</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Progress Bars */}
                {data.breakdown.some(item => item.percentage) && (
                  <div className="mt-4 space-y-2">
                    {data.breakdown
                      .filter(item => item.percentage)
                      .map((item, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span>{item.category}</span>
                            <span>{item.percentage?.toFixed(1)}%</span>
                          </div>
                          <Progress value={item.percentage} className="h-2" />
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Projections Table */}
            {data.projections && data.projections.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Dự kiến theo thời gian</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kỳ</TableHead>
                      <TableHead className="text-right">Số tiền</TableHead>
                      {data.projections.some(p => p.change !== undefined) && (
                        <TableHead className="text-right">Thay đổi</TableHead>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.projections.map((projection, index) => (
                      <TableRow key={index}>
                        <TableCell>{projection.period}</TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(projection.amount)}
                        </TableCell>
                        {projection.change !== undefined && (
                          <TableCell className="text-right">
                            <div className={`flex items-center justify-end gap-1 ${
                              projection.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {projection.change >= 0 ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              {projection.change.toFixed(1)}%
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}

        {/* Chart View */}
        {viewMode === 'chart' && (
          <div className="space-y-6">
            {/* Breakdown Chart */}
            {data.breakdown && data.breakdown.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Biểu đồ phân bổ</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pie Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <PieChart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Biểu đồ tròn</p>
                    <p className="text-sm text-gray-500">Hiển thị phân bổ tỷ lệ phần trăm</p>
                  </div>

                  {/* Bar Chart Placeholder */}
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <BarChart3 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">Biểu đồ cột</p>
                    <p className="text-sm text-gray-500">Hiển thị so sánh giá trị tuyệt đối</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trend Chart Placeholder */}
            {data.projections && data.projections.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Xu hướng theo thời gian</h3>
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Biểu đồ đường</p>
                  <p className="text-sm text-gray-500">Hiển thị xu hướng thay đổi theo thời gian</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {data.recommendations && data.recommendations.length > 0 && (
          <>
            <Separator />
            <div>
              <h3 className="text-lg font-semibold mb-4">Khuyến nghị</h3>
              <div className="space-y-2">
                {data.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <p className="text-gray-700">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Footer with Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            <Calendar className="w-4 h-4 inline mr-1" />
            Cập nhật: {new Date().toLocaleDateString('vi-VN')}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" />
              In
            </Button>
            {onExport && (
              <Button variant="outline" size="sm" onClick={() => onExport('pdf')}>
                <Download className="w-4 h-4 mr-2" />
                Xuất PDF
              </Button>
            )}
            {onShare && (
              <Button size="sm" onClick={onShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Chia sẻ
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CalculationResults;