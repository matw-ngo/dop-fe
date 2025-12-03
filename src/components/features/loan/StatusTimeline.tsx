/**
 * Status Timeline Component
 * Visual timeline of loan application progress with Vietnamese localization
 */

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  MessageSquare,
  FileText,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import type {
  LoanApplicationStatus,
  StatusConfig
} from "@/lib/loan-status/vietnamese-status-config";

import {
  getStatusConfig,
  calculateEstimatedCompletionTime
} from "@/lib/loan-status/vietnamese-status-config";

/**
 * Timeline milestone interface
 */
interface TimelineMilestone {
  id: string;
  status: LoanApplicationStatus;
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
  estimatedDate?: string;
  officer?: {
    name: string;
    position: string;
  };
  notes?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
  }>;
}

/**
 * Timeline category configuration
 */
interface TimelineCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Component props
 */
interface StatusTimelineProps {
  applicationId: string;
  currentStatus: LoanApplicationStatus;
  applicationDate: string;
  loanType?: string;
  compact?: boolean;
  showEstimatedDates?: boolean;
  onMilestoneClick?: (milestone: TimelineMilestone) => void;
  className?: string;
}

/**
 * Timeline categories
 */
const TIMELINE_CATEGORIES: TimelineCategory[] = [
  {
    id: "initial",
    name: "Tiếp nhận",
    description: "Hồ sơ được tiếp nhận và kiểm tra ban đầu",
    color: "#3B82F6",
    icon: Circle
  },
  {
    id: "processing",
    name: "Xử lý",
    description: "Hồ sơ đang được xử lý bởi chuyên viên",
    color: "#F59E0B",
    icon: Clock
  },
  {
    id: "review",
    name: "Thẩm định",
    description: "Hồ sơ được thẩm định chuyên sâu",
    color: "#8B5CF6",
    icon: AlertCircle
  },
  {
    id: "decision",
    name: "Quyết định",
    description: "Hồ sơ được xét duyệt và ra quyết định",
    color: "#10B981",
    icon: CheckCircle2
  },
  {
    id: "completion",
    name: "Hoàn tất",
    description: "Hồ sơ đã hoàn tất và giải ngân",
    color: "#06B6D4",
    icon: CheckCircle2
  }
];

/**
 * StatusTimeline Component
 */
export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  applicationId,
  currentStatus,
  applicationDate,
  loanType = "vay_tieu_dung",
  compact = false,
  showEstimatedDates = true,
  onMilestoneClick,
  className = ""
}) => {
  const [milestones, setMilestones] = useState<TimelineMilestone[]>([]);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Fetch timeline milestones
  const fetchTimelineMilestones = useCallback(async () => {
    if (!applicationId) return;

    setIsLoading(true);

    try {
      // In a real implementation, this would call the API
      // const response = await loanApi.getApplicationTimeline(applicationId);
      // setMilestones(response.data.milestones);

      // Mock milestones based on current status
      const mockMilestones: TimelineMilestone[] = generateMockMilestones(
        currentStatus,
        applicationDate,
        loanType
      );

      setMilestones(mockMilestones);
      calculateOverallProgress(mockMilestones);

    } catch (err) {
      console.error("Failed to fetch timeline:", err);
      // Generate mock data even if API fails
      const mockMilestones = generateMockMilestones(currentStatus, applicationDate, loanType);
      setMilestones(mockMilestones);
      calculateOverallProgress(mockMilestones);
    } finally {
      setIsLoading(false);
    }
  }, [applicationId, currentStatus, applicationDate, loanType]);

  // Generate mock milestones based on current status
  const generateMockMilestones = (
    status: LoanApplicationStatus,
    appDate: string,
    lType: string
  ): TimelineMilestone[] => {
    const milestones: TimelineMilestone[] = [];
    const appDateObj = new Date(appDate);

    // Application received
    milestones.push({
      id: "received",
      status: "da_tiep_nhan",
      title: "Hồ sơ được tiếp nhận",
      description: "Hồ sơ vay vốn đã được hệ thống tiếp nhận thành công.",
      timestamp: appDateObj.toISOString(),
      completed: true,
      current: status === "da_tiep_nhan",
      officer: {
        name: "Hệ thống tự động",
        position: "Quản lý hồ sơ"
      }
    });

    // Initial processing
    if (["dang_xu_ly", "cho_bo_sung_giay_to", "dang_tham_dinh", "da_duyet", "cho_giai_ngan", "da_giai_ngan"].includes(status)) {
      const processingDate = new Date(appDateObj.getTime() + 4 * 60 * 60 * 1000); // +4 hours
      milestones.push({
        id: "processing",
        status: "dang_xu_ly",
        title: "Đang xử lý hồ sơ",
        description: "Chuyên viên tín dụng đang xem xét và kiểm tra thông tin hồ sơ.",
        timestamp: processingDate.toISOString(),
        completed: true,
        current: status === "dang_xu_ly",
        officer: {
          name: "Nguyễn Văn A",
          position: "Chuyên viên tín dụng"
        },
        notes: "Hồ sơ đầy đủ giấy tờ cơ bản, đang chờ thẩm định chuyên sâu."
      });
    }

    // Document request (conditional)
    if (status === "cho_bo_sung_giay_to" || ["dang_tham_dinh", "da_duyet", "cho_giai_ngan", "da_giai_ngan"].includes(status)) {
      const documentRequestDate = new Date(appDateObj.getTime() + 24 * 60 * 60 * 1000); // +1 day
      milestones.push({
        id: "document_request",
        status: "cho_bo_sung_giay_to",
        title: "Yêu cầu bổ sung giấy tờ",
        description: "Cần bổ sung bảng lương 3 tháng gần nhất để hoàn tất hồ sơ.",
        timestamp: documentRequestDate.toISOString(),
        completed: status !== "cho_bo_sung_giay_to",
        current: status === "cho_bo_sung_giay_to",
        officer: {
          name: "Nguyễn Văn A",
          position: "Chuyên viên tín dụng"
        },
        notes: "Bảng lương cần có dấu công ty và xác thực thu nhập."
      });
    }

    // Assessment
    if (["dang_tham_dinh", "da_duyet", "cho_giai_ngan", "da_giai_ngan"].includes(status)) {
      const assessmentDate = new Date(appDateObj.getTime() + 48 * 60 * 60 * 1000); // +2 days
      milestones.push({
        id: "assessment",
        status: "dang_tham_dinh",
        title: "Đang thẩm định chuyên sâu",
        description: "Hồ sơ đang được thẩm định về khả năng trả nợ và uy tín tín dụng.",
        timestamp: assessmentDate.toISOString(),
        completed: !["dang_tham_dinh", "cho_bo_sung_giay_to"].includes(status),
        current: status === "dang_tham_dinh",
        officer: {
          name: "Trần Thị B",
          position: "Chuyên viên thẩm định"
        },
        attachments: status !== "dang_tham_dinh" ? [{
          id: "1",
          name: "Báo cáo thẩm định.pdf",
          url: "/documents/tham-dinh.pdf"
        }] : undefined
      });
    }

    // Approval
    if (["da_duyet", "cho_giai_ngan", "da_giai_ngan"].includes(status)) {
      const approvalDate = new Date(appDateObj.getTime() + 72 * 60 * 60 * 1000); // +3 days
      milestones.push({
        id: "approval",
        status: "da_duyet",
        title: "Hồ sơ được phê duyệt",
        description: "Hồ sơ đã được cấp trên phê duyệt với hạn mức vay như đề xuất.",
        timestamp: approvalDate.toISOString(),
        completed: true,
        current: status === "da_duyet",
        officer: {
          name: "Lê Văn C",
          position: "Trưởng phòng tín dụng"
        },
        notes: "Hạn mức được duyệt: 200,000,000 VNĐ. Lãi suất ưu đãi: 1.5%/tháng."
      });
    }

    // Disbursement preparation
    if (["cho_giai_ngan", "da_giai_ngan"].includes(status)) {
      const disbursementPrepDate = new Date(appDateObj.getTime() + 96 * 60 * 60 * 1000); // +4 days
      milestones.push({
        id: "disbursement_prep",
        status: "cho_giai_ngan",
        title: "Chuẩn bị giải ngân",
        description: "Hoàn tất thủ tục hợp đồng và chuẩn bị giải ngân.",
        timestamp: disbursementPrepDate.toISOString(),
        completed: status === "da_giai_ngan",
        current: status === "cho_giai_ngan",
        officer: {
          name: "Nguyễn Văn A",
          position: "Chuyên viên tín dụng"
        }
      });
    }

    // Disbursement
    if (status === "da_giai_ngan") {
      const disbursementDate = new Date(appDateObj.getTime() + 120 * 60 * 60 * 1000); // +5 days
      milestones.push({
        id: "disbursement",
        status: "da_giai_ngan",
        title: "Giải ngân thành công",
        description: "Khoản vay đã được giải ngân vào tài khoản của khách hàng.",
        timestamp: disbursementDate.toISOString(),
        completed: true,
        current: false,
        officer: {
          name: "Hệ thống tự động",
          position: "Quản lý giải ngân"
        },
        notes: "Số tiền giải ngân: 200,000,000 VNĐ. Tài khoản nhận: ************1234"
      });
    }

    return milestones;
  };

  // Calculate overall progress
  const calculateOverallProgress = (milestoneList: TimelineMilestone[]) => {
    const completedCount = milestoneList.filter(m => m.completed).length;
    const totalCount = milestoneList.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    setOverallProgress(Math.round(progress));
  };

  // Format date for Vietnamese locale
  const formatVietnameseDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Hôm nay, " + date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else if (diffDays === 1) {
      return "Hôm qua, " + date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước, ` + date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    }
  };

  // Toggle milestone expansion
  const toggleMilestoneExpansion = (milestoneId: string) => {
    const newExpanded = new Set(expandedMilestones);
    if (newExpanded.has(milestoneId)) {
      newExpanded.delete(milestoneId);
    } else {
      newExpanded.add(milestoneId);
    }
    setExpandedMilestones(newExpanded);
  };

  // Get status configuration
  const getStatusConfig = (status: LoanApplicationStatus): StatusConfig | null => {
    // Import and use the status config function
    return null; // Placeholder
  };

  // Get milestone icon based on status
  const getMilestoneIcon = (milestone: TimelineMilestone) => {
    if (milestone.completed) {
      return <CheckCircle2 className="h-6 w-6 text-green-600" />;
    } else if (milestone.current) {
      return <Clock className="h-6 w-6 text-blue-600 animate-pulse" />;
    } else {
      return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  // Group milestones by category
  const getMilestonesByCategory = () => {
    const grouped: Record<string, TimelineMilestone[]> = {};

    milestones.forEach(milestone => {
      const statusConfig = getStatusConfig(milestone.status);
      const category = statusConfig?.category || "processing";

      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(milestone);
    });

    return grouped;
  };

  // Initial data fetch
  useEffect(() => {
    fetchTimelineMilestones();
  }, [fetchTimelineMilestones]);

  const milestonesByCategory = getMilestonesByCategory();

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900">
            Lịch sử xử lý hồ sơ
          </CardTitle>
          <Badge variant="outline" className="ml-2">
            {milestones.filter(m => m.completed).length}/{milestones.length} hoàn tất
          </Badge>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Tiến độ tổng thể
            </span>
            <span className="text-sm text-gray-500">
              {overallProgress}%
            </span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent>
        {isLoading && milestones.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-gray-600">Đang tải lịch sử xử lý...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(milestonesByCategory).map(([categoryKey, categoryMilestones]) => {
              const category = TIMELINE_CATEGORIES.find(c => c.id === categoryKey);
              if (!category) return null;

              const CategoryIcon = category.icon;

              return (
                <div key={categoryKey}>
                  {/* Category header */}
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <div
                        className="p-2 rounded-lg mr-3"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        <CategoryIcon
                          className="h-5 w-5"
                          style={{ color: category.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Milestones in this category */}
                  <div className="space-y-4 ml-10">
                    {categoryMilestones.map((milestone, index) => {
                      const isExpanded = expandedMilestones.has(milestone.id);
                      const statusConfig = getStatusConfig(milestone.status);

                      return (
                        <div key={milestone.id}>
                          <div className="flex items-start">
                            {/* Timeline line */}
                            {index < categoryMilestones.length - 1 && (
                              <div
                                className="absolute ml-3 mt-6 w-0.5 h-20"
                                style={{ backgroundColor: category.color + "40" }}
                              />
                            )}

                            {/* Milestone icon */}
                            <div className="relative mr-4">
                              {getMilestoneIcon(milestone)}
                            </div>

                            {/* Milestone content */}
                            <div className="flex-1 min-w-0">
                              <div
                                className={`p-4 rounded-lg border transition-colors ${
                                  milestone.current
                                    ? "border-blue-200 bg-blue-50"
                                    : milestone.completed
                                    ? "border-green-200 bg-green-50"
                                    : "border-gray-200 bg-white"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                      <h4 className="font-semibold text-gray-900 mr-2">
                                        {milestone.title}
                                      </h4>
                                      {milestone.current && (
                                        <Badge className="bg-blue-600 text-white text-xs">
                                          Đang xử lý
                                        </Badge>
                                      )}
                                      {statusConfig && (
                                        <Badge
                                          variant="outline"
                                          style={{
                                            borderColor: statusConfig.color,
                                            color: statusConfig.color
                                          }}
                                          className="text-xs"
                                        >
                                          {statusConfig.label}
                                        </Badge>
                                      )}
                                    </div>

                                    <p className="text-gray-700 text-sm mb-2">
                                      {milestone.description}
                                    </p>

                                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                                      <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        {formatVietnameseDateTime(milestone.timestamp)}
                                      </div>
                                      {milestone.officer && (
                                        <div className="flex items-center">
                                          <User className="h-3 w-3 mr-1" />
                                          {milestone.officer.name} - {milestone.officer.position}
                                        </div>
                                      )}
                                    </div>

                                    {/* Expanded content */}
                                    {(isExpanded || compact) && (
                                      <div className="mt-3 space-y-2">
                                        {milestone.notes && (
                                          <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                                            <strong>Ghi chú:</strong> {milestone.notes}
                                          </div>
                                        )}

                                        {milestone.attachments && milestone.attachments.length > 0 && (
                                          <div className="space-y-2">
                                            <div className="flex items-center text-sm text-gray-600">
                                              <FileText className="h-3 w-3 mr-1" />
                                              Tài liệu đính kèm:
                                            </div>
                                            {milestone.attachments.map(attachment => (
                                              <a
                                                key={attachment.id}
                                                href={attachment.url}
                                                className="flex items-center text-sm text-blue-600 hover:text-blue-800 ml-4"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                              >
                                                <FileText className="h-3 w-3 mr-1" />
                                                {attachment.name}
                                              </a>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Action buttons */}
                                  <div className="ml-4 flex items-center space-x-2">
                                    {!compact && (milestone.notes || (milestone.attachments && milestone.attachments.length > 0)) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => toggleMilestoneExpansion(milestone.id)}
                                      >
                                        {isExpanded ? (
                                          <ChevronUp className="h-4 w-4" />
                                        ) : (
                                          <ChevronDown className="h-4 w-4" />
                                        )}
                                      </Button>
                                    )}

                                    {onMilestoneClick && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onMilestoneClick(milestone)}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Separator between categories */}
                  {Object.keys(milestonesByCategory).indexOf(categoryKey) < Object.keys(milestonesByCategory).length - 1 && (
                    <Separator className="my-6" />
                  )}
                </div>
              );
            })}

            {/* No milestones state */}
            {milestones.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Chưa có lịch sử xử lý nào được ghi nhận.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusTimeline;