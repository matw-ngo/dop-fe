/**
 * Lead Management Dashboard Interface
 * Comprehensive admin dashboard for lead management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  Download,
  Search,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Send,
  MapPin,
  DollarSign,
  Calendar,
  Activity,
} from 'lucide-react';

import type { LeadStatus, LeadAnalytics, BulkLeadOperation } from '@/lib/api/endpoints/lead-generation';
import { leadGenerationApi } from '@/lib/api/endpoints/lead-generation';

interface LeadManagementInterfaceProps {
  language?: 'vi' | 'en';
}

interface Lead {
  id: string;
  fullName: string;
  email?: string;
  phoneNumber: string;
  status: string;
  score?: number;
  loanType: string;
  loanAmount: number;
  province: string;
  assignedPartners: number;
  createdAt: string;
  lastUpdated: string;
  urgency: 'urgent' | 'normal' | 'flexible';
  source: string;
}

const LeadManagementInterface: React.FC<LeadManagementInterfaceProps> = ({ language = 'vi' }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState('week');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [bulkOperation, setBulkOperation] = useState<BulkLeadOperation | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const translations = {
    vi: {
      title: 'Quản lý Khách hàng Tiềm năng',
      description: 'Hệ thống quản lý khách hàng tiềm năng toàn diện',
      overview: 'Tổng quan',
      leadsList: 'Danh sách khách hàng',
      analytics: 'Phân tích',
      partnerPerformance: 'Hiệu suất đối tác',
      searchPlaceholder: 'Tìm kiếm theo tên, email, SĐT...',
      status: 'Trạng thái',
      loanType: 'Loại vay',
      loanAmount: 'Số tiền',
      score: 'Điểm',
      partners: 'Đối tác',
      actions: 'Thao tác',
      view: 'Xem',
      edit: 'Sửa',
      delete: 'Xóa',
      forward: 'Chuyển tiếp',
      export: 'Xuất file',
      refresh: 'Làm mới',
      totalLeads: 'Tổng khách hàng',
      qualifiedLeads: 'Đủ điều kiện',
      forwardedLeads: 'Đã chuyển tiếp',
      acceptedLeads: 'Được chấp nhận',
      conversionRate: 'Tỷ lệ chuyển đổi',
      averageResponse: 'Thời gian phản ứng TB',
      new: 'Mới',
      inReview: 'Đang xem xét',
      assigned: 'Đã phân công',
      accepted: 'Đã chấp nhận',
      rejected: 'Đã từ chối',
      completed: 'Hoàn thành',
      cancelled: 'Hủy',
      urgent: 'Khẩn cấp',
      normal: 'Bình thường',
      flexible: 'Linh hoạt',
      last30Days: '30 ngày qua',
      last7Days: '7 ngày qua',
      today: 'Hôm nay',
      custom: 'Tùy chỉnh',
      selectLeads: 'Chọn khách hàng',
      bulkForward: 'Chuyển tiếp hàng loạt',
      bulkExport: 'Xuất hàng loạt',
      bulkDelete: 'Xóa hàng loạt',
      confirmAction: 'Xác nhận hành động',
      areYouSure: 'Bạn có chắc chắn?',
      success: 'Thành công',
      error: 'Lỗi',
      processing: 'Đang xử lý...',
      noLeadsFound: 'Không tìm thấy khách hàng',
    },
    en: {
      title: 'Lead Management Dashboard',
      description: 'Comprehensive lead management system',
      overview: 'Overview',
      leadsList: 'Leads List',
      analytics: 'Analytics',
      partnerPerformance: 'Partner Performance',
      searchPlaceholder: 'Search by name, email, phone...',
      status: 'Status',
      loanType: 'Loan Type',
      loanAmount: 'Amount',
      score: 'Score',
      partners: 'Partners',
      actions: 'Actions',
      view: 'View',
      edit: 'Edit',
      delete: 'Delete',
      forward: 'Forward',
      export: 'Export',
      refresh: 'Refresh',
      totalLeads: 'Total Leads',
      qualifiedLeads: 'Qualified Leads',
      forwardedLeads: 'Forwarded Leads',
      acceptedLeads: 'Accepted Leads',
      conversionRate: 'Conversion Rate',
      averageResponse: 'Avg Response Time',
      new: 'New',
      inReview: 'In Review',
      assigned: 'Assigned',
      accepted: 'Accepted',
      rejected: 'Rejected',
      completed: 'Completed',
      cancelled: 'Cancelled',
      urgent: 'Urgent',
      normal: 'Normal',
      flexible: 'Flexible',
      last30Days: 'Last 30 Days',
      last7Days: 'Last 7 Days',
      today: 'Today',
      custom: 'Custom',
      selectLeads: 'Select Leads',
      bulkForward: 'Bulk Forward',
      bulkExport: 'Bulk Export',
      bulkDelete: 'Bulk Delete',
      confirmAction: 'Confirm Action',
      areYouSure: 'Are you sure?',
      success: 'Success',
      error: 'Error',
      processing: 'Processing...',
      noLeadsFound: 'No leads found',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
  }, [currentPage, statusFilter, dateFilter, searchTerm]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await leadGenerationApi.getLeads({
        page: currentPage,
        limit: 20,
        status: statusFilter ? [statusFilter] : undefined,
        searchTerm: searchTerm || undefined,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      setLeads(response.leads);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const stats = await leadGenerationApi.getLeadStatistics(dateFilter as any);
      setAnalytics(stats);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const handleBulkOperation = async (type: 'forward' | 'export' | 'delete') => {
    if (selectedLeads.length === 0) return;

    try {
      const operation = await leadGenerationApi.bulkOperation({
        type,
        leadIds: selectedLeads,
      });

      setBulkOperation(operation);
      setSelectedLeads([]);
      fetchLeads();
    } catch (error) {
      console.error('Bulk operation failed:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      in_review: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-purple-100 text-purple-800',
      accepted: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getUrgencyColor = (urgency: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      normal: 'bg-yellow-100 text-yellow-800',
      flexible: 'bg-green-100 text-green-800',
    };
    return colors[urgency] || 'bg-gray-100 text-gray-800';
  };

  const statusChartData = analytics ? [
    { name: t.new, value: analytics.totalLeads - analytics.qualifiedLeads },
    { name: t.qualifiedLeads, value: analytics.qualifiedLeads - analytics.forwardedLeads },
    { name: t.forwardedLeads, value: analytics.forwardedLeads - analytics.acceptedLeads },
    { name: t.acceptedLeads, value: analytics.acceptedLeads },
  ] : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600">{t.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => fetchLeads()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t.refresh}
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.totalLeads}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{Math.round((analytics.totalLeads / 100) * 12)}% {language === 'vi' ? 'so với tháng trước' : 'from last month'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.qualifiedLeads}</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.qualifiedLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((analytics.qualifiedLeads / analytics.totalLeads) * 100)}% {language === 'vi' ? 'đủ điều kiện' : 'qualified'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.acceptedLeads}</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.acceptedLeads.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.conversionRate}% {language === 'vi' ? 'tỷ lệ chuyển đổi' : 'conversion rate'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.averageResponse}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageResponseTime}h</div>
              <p className="text-xs text-muted-foreground">
                -{Math.round((analytics.averageResponseTime / 24) * 100)}% {language === 'vi' ? 'nhanh hơn' : 'faster than average'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="leads" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads">{t.leadsList}</TabsTrigger>
          <TabsTrigger value="analytics">{t.analytics}</TabsTrigger>
          <TabsTrigger value="partners">{t.partnerPerformance}</TabsTrigger>
          <TabsTrigger value="overview">{t.overview}</TabsTrigger>
        </TabsList>

        {/* Leads List Tab */}
        <TabsContent value="leads" className="space-y-4">
          {/* Filters and Search */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={t.status} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{language === 'vi' ? 'Tất cả' : 'All'}</SelectItem>
                    <SelectItem value="new">{t.new}</SelectItem>
                    <SelectItem value="in_review">{t.inReview}</SelectItem>
                    <SelectItem value="assigned">{t.assigned}</SelectItem>
                    <SelectItem value="accepted">{t.accepted}</SelectItem>
                    <SelectItem value="rejected">{t.rejected}</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">{t.today}</SelectItem>
                    <SelectItem value="week">{t.last7Days}</SelectItem>
                    <SelectItem value="month">{t.last30Days}</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex space-x-2">
                  {selectedLeads.length > 0 && (
                    <>
                      <Button variant="outline" size="sm" onClick={() => handleBulkOperation('forward')}>
                        {t.bulkForward} ({selectedLeads.length})
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleBulkOperation('export')}>
                        {t.bulkExport} ({selectedLeads.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leads Table */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : leads.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t.noLeadsFound}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedLeads(leads.map(lead => lead.id));
                            } else {
                              setSelectedLeads([]);
                            }
                          }}
                        />
                      </TableHead>
                      <TableHead>{language === 'vi' ? 'Họ tên' : 'Name'}</TableHead>
                      <TableHead>{language === 'vi' ? 'Liên hệ' : 'Contact'}</TableHead>
                      <TableHead>{t.status}</TableHead>
                      <TableHead>{t.loanType}</TableHead>
                      <TableHead>{t.loanAmount}</TableHead>
                      <TableHead>{t.score}</TableHead>
                      <TableHead>{language === 'vi' ? 'Khẩn cấp' : 'Urgency'}</TableHead>
                      <TableHead>{t.partners}</TableHead>
                      <TableHead>{t.actions}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedLeads.includes(lead.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLeads([...selectedLeads, lead.id]);
                              } else {
                                setSelectedLeads(selectedLeads.filter(id => id !== lead.id));
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{lead.fullName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{lead.phoneNumber}</div>
                            {lead.email && <div className="text-gray-500">{lead.email}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(lead.status)}>
                            {t[lead.status as keyof typeof t] || lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.loanType}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lead.loanAmount)}
                        </TableCell>
                        <TableCell>
                          {lead.score ? (
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{lead.score}</span>
                              <Progress value={lead.score} className="w-16 h-2" />
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getUrgencyColor(lead.urgency)}>
                            {t[lead.urgency as keyof typeof t] || lead.urgency}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.assignedPartners}</TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedLead(lead)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {language === 'vi' ? `Trang ${currentPage} / ${totalPages}` : `Page ${currentPage} of ${totalPages}`}
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                {language === 'vi' ? 'Trước' : 'Previous'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                {language === 'vi' ? 'Tiếp' : 'Next'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'vi' ? 'Phân bố trạng thái' : 'Status Distribution'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Trends */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'vi' ? 'Xu hướng theo thời gian' : 'Trends Over Time'}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.trends?.daily || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="applications" stroke="#8884d8" name={language === 'vi' ? 'Hồ sơ' : 'Applications'} />
                    <Line type="monotone" dataKey="approvals" stroke="#82ca9d" name={language === 'vi' ? 'Duyệt' : 'Approvals'} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Geographic Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{language === 'vi' ? 'Phân bố địa lý' : 'Geographic Distribution'}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics?.geographicDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="province" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name={language === 'vi' ? 'Số lượng' : 'Count'} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Partner Performance Tab */}
        <TabsContent value="partners" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.partnerPerformance}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'vi' ? 'Đối tác' : 'Partner'}</TableHead>
                    <TableHead>{language === 'vi' ? 'Hồ sơ được phân công' : 'Leads Assigned'}</TableHead>
                    <TableHead>{language === 'vi' ? 'Tỷ lệ chuyển đổi' : 'Conversion Rate'}</TableHead>
                    <TableHead>{language === 'vi' ? 'Thời gian phản ứng' : 'Response Time'}</TableHead>
                    <TableHead>{language === 'vi' ? 'Đánh giá' : 'Rating'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analytics?.topPartners?.map((partner: any) => (
                    <TableRow key={partner.partnerId}>
                      <TableCell className="font-medium">{partner.partnerName}</TableCell>
                      <TableCell>{partner.leadsAssigned}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{partner.conversionRate}%</span>
                          <Progress value={partner.conversionRate} className="w-16 h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{partner.averageResponseTime}h</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {'⭐'.repeat(Math.round(partner.rating || 4))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>{language === 'vi' ? 'Hoạt động gần đây' : 'Recent Activity'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leads.slice(0, 5).map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{lead.fullName}</p>
                        <p className="text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Badge className={getStatusColor(lead.status)}>
                        {t[lead.status as keyof typeof t] || lead.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bulk Operations */}
            {bulkOperation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RefreshCw className="w-5 h-5" />
                    <span>{language === 'vi' ? 'Thao tác hàng loạt' : 'Bulk Operations'}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>{language === 'vi' ? 'Trạng thái:' : 'Status:'}</span>
                      <Badge>{t[bulkOperation.status as keyof typeof t] || bulkOperation.status}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>{language === 'vi' ? 'Tiến độ:' : 'Progress:'}</span>
                      <span>{bulkOperation.progress}%</span>
                    </div>
                    <Progress value={bulkOperation.progress} className="w-full h-2" />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Lead Details Dialog */}
      {selectedLead && (
        <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{language === 'vi' ? 'Chi tiết khách hàng' : 'Lead Details'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{language === 'vi' ? 'Họ tên' : 'Full Name'}</Label>
                  <p className="font-medium">{selectedLead.fullName}</p>
                </div>
                <div>
                  <Label>{language === 'vi' ? 'Số điện thoại' : 'Phone'}</Label>
                  <p className="font-medium">{selectedLead.phoneNumber}</p>
                </div>
                <div>
                  <Label>{language === 'vi' ? 'Email' : 'Email'}</Label>
                  <p className="font-medium">{selectedLead.email || '-'}</p>
                </div>
                <div>
                  <Label>{t.status}</Label>
                  <Badge className={getStatusColor(selectedLead.status)}>
                    {t[selectedLead.status as keyof typeof t] || selectedLead.status}
                  </Badge>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t.loanType}</Label>
                  <p className="font-medium">{selectedLead.loanType}</p>
                </div>
                <div>
                  <Label>{t.loanAmount}</Label>
                  <p className="font-medium">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedLead.loanAmount)}
                  </p>
                </div>
                {selectedLead.score && (
                  <div>
                    <Label>{t.score}</Label>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{selectedLead.score}</span>
                      <Progress value={selectedLead.score} className="w-16 h-2" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default LeadManagementInterface;