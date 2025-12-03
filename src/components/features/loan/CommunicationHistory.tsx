/**
 * Communication History Component
 * Comprehensive communication tracking with Vietnamese message templates and multi-channel support
 */

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Phone,
  Mail,
  Send,
  Clock,
  CheckCircle2,
  Eye,
  Paperclip,
  Search,
  Filter,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";

/**
 * Communication entry interface
 */
interface CommunicationEntry {
  id: string;
  type: "sms" | "email" | "in_app" | "zalo" | "phone_call";
  title: string;
  content: string;
  sentAt: string;
  readAt?: string;
  sender: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
    name: string;
    phone?: string;
    email?: string;
  };
  hasAttachments: boolean;
  attachments?: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
  priority: "low" | "normal" | "high" | "urgent";
  status: "sent" | "delivered" | "read" | "failed";
  metadata?: Record<string, any>;
}

/**
 * Message template interface
 */
interface MessageTemplate {
  id: string;
  type: "inquiry" | "status_update" | "document_request" | "approval" | "rejection";
  title: string;
  content: string;
  variables: string[];
  category: string;
}

/**
 * Assigned officer interface
 */
interface AssignedOfficer {
  name: string;
  phone: string;
  email: string;
  avatar?: string;
  position?: string;
}

/**
 * Component props
 */
interface CommunicationHistoryProps {
  applicationId: string;
  communications: CommunicationEntry[];
  onSendMessage?: (message: string, type: string, priority?: string) => Promise<void>;
  onMarkAsRead?: (communicationId: string) => Promise<void>;
  assignedOfficer?: AssignedOfficer;
  className?: string;
  readOnly?: boolean;
}

/**
 * Vietnamese communication channel configurations
 */
const COMMUNICATION_CHANNELS = {
  in_app: {
    name: "Tin nhắn hệ thống",
    icon: MessageSquare,
    color: "#3B82F6",
    description: "Gửi tin nhắn trực tiếp qua hệ thống"
  },
  sms: {
    name: "SMS",
    icon: MessageSquare,
    color: "#10B981",
    description: "Gửi tin nhắn văn bản đến điện thoại"
  },
  email: {
    name: "Email",
    icon: Mail,
    color: "#F59E0B",
    description: "Gửi email thông báo"
  },
  zalo: {
    name: "Zalo",
    icon: MessageSquare,
    color: "#0084FF",
    description: "Gửi tin nhắn qua Zalo"
  },
  phone_call: {
    name: "Cuộc gọi",
    icon: Phone,
    color: "#EF4444",
    description: "Ghi chú cuộc gọi điện thoại"
  }
} as const;

/**
 * Vietnamese message templates
 */
const VIETNAMESE_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: "status_inquiry",
    type: "inquiry",
    title: "Hỏi về trạng thái hồ sơ",
    content: "Chào anh/chị, tôi muốn hỏi về trạng thái hiện tại của hồ sơ vay vốn mã {{applicationId}}. Cảm ơn anh/chị.",
    variables: ["applicationId"],
    category: "general"
  },
  {
    id: "document_inquiry",
    type: "inquiry",
    title: "Hỏi về giấy tờ cần bổ sung",
    content: "Chào anh/chị, tôi muốn hỏi thêm về các giấy tờ cần bổ sung cho hồ sơ của mình. Hiện tại tôi đã tải lên {{uploadedCount}}/{{totalCount}} giấy tờ. Cảm ơn anh/chị.",
    variables: ["uploadedCount", "totalCount"],
    category: "documents"
  },
  {
    id: "timeline_inquiry",
    type: "inquiry",
    title: "Hỏi về thời gian xử lý",
    content: "Chào anh/chị, tôi muốn hỏi về thời gian dự kiến hoàn thành hồ sơ. Hồ sơ của tôi đang ở trạng thái {{currentStatus}} từ {{lastUpdateDate}}. Cảm ơn anh/chị.",
    variables: ["currentStatus", "lastUpdateDate"],
    category: "timeline"
  },
  {
    id: "urgent_assistance",
    type: "inquiry",
    title: "Yêu cầu hỗ trợ khẩn cấp",
    content: "Chào anh/chị, tôi cần hỗ trợ khẩn cấp về hồ sơ vay vốn {{applicationId}}. Vấn đề của tôi là: {{issue}}. Mong nhận được phản hồi sớm. Cảm ơn anh/chị.",
    variables: ["applicationId", "issue"],
    category: "urgent"
  }
];

/**
 * CommunicationHistory Component
 */
export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  applicationId,
  communications,
  onSendMessage,
  onMarkAsRead,
  assignedOfficer,
  className = "",
  readOnly = false
}) => {
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [messageForm, setMessageForm] = useState({
    type: "in_app" as CommunicationEntry["type"],
    title: "",
    content: "",
    priority: "normal" as CommunicationEntry["priority"]
  });
  const [isSending, setIsSending] = useState(false);
  const [selectedCommunication, setSelectedCommunication] = useState<CommunicationEntry | null>(null);

  // Filter communications
  const getFilteredCommunications = useCallback(() => {
    let filtered = [...communications];

    // Filter by type
    if (selectedTab !== "all") {
      filtered = filtered.filter(comm => comm.type === selectedTab);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(comm =>
        comm.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comm.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (selectedFilter !== "all") {
      filtered = filtered.filter(comm => comm.status === selectedFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return filtered;
  }, [communications, selectedTab, searchQuery, selectedFilter]);

  // Get communication count by type
  const getCommunicationCount = (type: string) => {
    return communications.filter(comm => comm.type === type).length;
  };

  // Get unread count
  const getUnreadCount = useCallback(() => {
    return communications.filter(comm => !comm.readAt).length;
  }, [communications]);

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageForm.title.trim() || !messageForm.content.trim()) return;

    setIsSending(true);

    try {
      await onSendMessage?.(messageForm.content, messageForm.type, messageForm.priority);

      // Reset form
      setMessageForm({
        type: "in_app",
        title: "",
        content: "",
        priority: "normal"
      });
      setSelectedTemplate(null);
      setIsComposeOpen(false);

    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle template selection
  const handleTemplateSelect = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setMessageForm(prev => ({
      ...prev,
      title: template.title,
      content: template.content
        .replace(/{{applicationId}}/g, applicationId)
        .replace(/{{uploadedCount}}/g, "2")
        .replace(/{{totalCount}}/g, "5")
        .replace(/{{currentStatus}}/g, "Đang thẩm định")
        .replace(/{{lastUpdateDate}}/g, new Date().toLocaleDateString("vi-VN"))
    }));
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
      return `${diffDays} ngày trước`;
    } else {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    }
  };

  // Get channel config
  const getChannelConfig = (type: CommunicationEntry["type"]) => {
    return COMMUNICATION_CHANNELS[type];
  };

  // Get priority color
  const getPriorityColor = (priority: CommunicationEntry["priority"]) => {
    switch (priority) {
      case "urgent": return "text-red-600 bg-red-50";
      case "high": return "text-orange-600 bg-orange-50";
      case "normal": return "text-blue-600 bg-blue-50";
      case "low": return "text-gray-600 bg-gray-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  // Get status icon
  const getStatusIcon = (status: CommunicationEntry["status"]) => {
    switch (status) {
      case "sent": return <Clock className="h-4 w-4 text-blue-500" />;
      case "delivered": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "read": return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "failed": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  // Mark communication as read
  const handleMarkAsRead = async (communicationId: string) => {
    try {
      await onMarkAsRead?.(communicationId);
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const filteredCommunications = getFilteredCommunications();
  const unreadCount = getUnreadCount();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-gray-900">
              Lịch sử liên hệ
            </CardTitle>
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="animate-pulse">
                  {unreadCount} chưa đọc
                </Badge>
              )}
              {!readOnly && (
                <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Send className="h-4 w-4 mr-2" />
                      Gửi tin nhắn
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Gửi tin nhắn mới</DialogTitle>
                      <DialogDescription>
                        Gửi tin nhắn đến chuyên viên phụ trách hồ sơ
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      {/* Template selection */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Sử dụng mẫu tin nhắn
                        </Label>
                        <Select onValueChange={(value) => {
                          const template = VIETNAMESE_MESSAGE_TEMPLATES.find(t => t.id === value);
                          if (template) handleTemplateSelect(template);
                        }}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Chọn mẫu tin nhắn..." />
                          </SelectTrigger>
                          <SelectContent>
                            {VIETNAMESE_MESSAGE_TEMPLATES.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Communication type */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Kênh liên hệ
                        </Label>
                        <Select
                          value={messageForm.type}
                          onValueChange={(value: any) => setMessageForm(prev => ({
                            ...prev,
                            type: value
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(COMMUNICATION_CHANNELS).map(([key, config]) => (
                              <SelectItem key={key} value={key}>
                                <div className="flex items-center">
                                  {React.createElement(config.icon, { className: "h-4 w-4 mr-2" })}
                                  {config.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Title */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Tiêu đề
                        </Label>
                        <Input
                          value={messageForm.title}
                          onChange={(e) => setMessageForm(prev => ({
                            ...prev,
                            title: e.target.value
                          }))}
                          placeholder="Nhập tiêu đề tin nhắn..."
                          className="mt-1"
                        />
                      </div>

                      {/* Content */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Nội dung
                        </Label>
                        <Textarea
                          value={messageForm.content}
                          onChange={(e) => setMessageForm(prev => ({
                            ...prev,
                            content: e.target.value
                          }))}
                          placeholder="Nhập nội dung tin nhắn..."
                          rows={4}
                          className="mt-1"
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Mức độ ưu tiên
                        </Label>
                        <Select
                          value={messageForm.priority}
                          onValueChange={(value: any) => setMessageForm(prev => ({
                            ...prev,
                            priority: value
                          }))}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Thấp</SelectItem>
                            <SelectItem value="normal">Bình thường</SelectItem>
                            <SelectItem value="high">Cao</SelectItem>
                            <SelectItem value="urgent">Khẩn cấp</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setIsComposeOpen(false)}
                        >
                          Hủy
                        </Button>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!messageForm.title.trim() || !messageForm.content.trim() || isSending}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {isSending ? "Đang gửi..." : "Gửi tin nhắn"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          {/* Assigned officer info */}
          {assignedOfficer && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={assignedOfficer.avatar} />
                    <AvatarFallback>
                      {assignedOfficer.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {assignedOfficer.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {assignedOfficer.position || "Chuyên viên tín dụng"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${assignedOfficer.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      {assignedOfficer.phone}
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`mailto:${assignedOfficer.email}`}>
                      <Mail className="h-4 w-4 mr-1" />
                      Email
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Filters and search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm tin nhắn..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Status filter */}
            <div className="w-full md:w-48">
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Lọc theo trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="sent">Đã gửi</SelectItem>
                  <SelectItem value="delivered">Đã giao</SelectItem>
                  <SelectItem value="read">Đã đọc</SelectItem>
                  <SelectItem value="failed">Thất bại</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Communication tabs */}
      <Card>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all" className="flex items-center">
              Tất cả
              <Badge variant="secondary" className="ml-2">
                {communications.length}
              </Badge>
            </TabsTrigger>
            {Object.entries(COMMUNICATION_CHANNELS).map(([key, config]) => (
              <TabsTrigger key={key} value={key} className="flex items-center">
                {React.createElement(config.icon, { className: "h-4 w-4 mr-2" })}
                {config.name.split(' ')[0]}
                <Badge variant="secondary" className="ml-2">
                  {getCommunicationCount(key)}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedTab} className="mt-0">
            <CardContent className="p-0">
              {filteredCommunications.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    {searchQuery || selectedFilter !== "all" || selectedTab !== "all"
                      ? "Không tìm thấy tin nhắn nào phù hợp."
                      : "Chưa có tin nhắn nào."}
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredCommunications.map((communication) => {
                    const channelConfig = getChannelConfig(communication.type);
                    const ChannelIcon = channelConfig.icon;
                    const isUnread = !communication.readAt;

                    return (
                      <div
                        key={communication.id}
                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                          isUnread ? "bg-blue-50" : ""
                        }`}
                        onClick={() => {
                          setSelectedCommunication(communication);
                          if (isUnread) {
                            handleMarkAsRead(communication.id);
                          }
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Channel icon */}
                          <div
                            className="p-2 rounded-lg mt-1"
                            style={{ backgroundColor: channelConfig.color + "20" }}
                          >
                            <ChannelIcon
                              className="h-4 w-4"
                              style={{ color: channelConfig.color }}
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center mb-1">
                                  <h4 className="font-semibold text-gray-900 mr-2">
                                    {communication.title}
                                  </h4>
                                  {isUnread && (
                                    <Badge variant="default" className="text-xs bg-blue-600">
                                      Mới
                                    </Badge>
                                  )}
                                  <Badge
                                    variant="outline"
                                    className={`text-xs ml-2 ${getPriorityColor(communication.priority)}`}
                                  >
                                    {communication.priority === "urgent" ? "Khẩn cấp" :
                                     communication.priority === "high" ? "Cao" :
                                     communication.priority === "normal" ? "Bình thường" : "Thấp"}
                                  </Badge>
                                </div>

                                <p className="text-gray-700 text-sm mb-2 line-clamp-2">
                                  {communication.content}
                                </p>

                                <div className="flex items-center text-xs text-gray-500 space-x-4">
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    {communication.sender.name}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatVietnameseDateTime(communication.sentAt)}
                                  </div>
                                  <div className="flex items-center">
                                    {getStatusIcon(communication.status)}
                                  </div>
                                  {communication.hasAttachments && (
                                    <div className="flex items-center">
                                      <Paperclip className="h-3 w-3 mr-1" />
                                      Có tệp đính kèm
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center space-x-2 ml-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Communication Detail Dialog */}
      <Dialog open={!!selectedCommunication} onOpenChange={() => setSelectedCommunication(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              {selectedCommunication && (
                <>
                  {React.createElement(
                    getChannelConfig(selectedCommunication.type).icon,
                    {
                      className: "h-5 w-5 mr-2",
                      style: { color: getChannelConfig(selectedCommunication.type).color }
                    }
                  )}
                  {selectedCommunication.title}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedCommunication && formatVietnameseDateTime(selectedCommunication.sentAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedCommunication && (
            <div className="space-y-4">
              {/* Sender information */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedCommunication.sender.avatar} />
                  <AvatarFallback>
                    {selectedCommunication.sender.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectedCommunication.sender.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedCommunication.sender.role}
                  </div>
                </div>
                <div className="ml-auto flex items-center space-x-2">
                  <Badge
                    variant="outline"
                    className={getPriorityColor(selectedCommunication.priority)}
                  >
                    {selectedCommunication.priority === "urgent" ? "Khẩn cấp" :
                     selectedCommunication.priority === "high" ? "Cao" :
                     selectedCommunication.priority === "normal" ? "Bình thường" : "Thấp"}
                  </Badge>
                  <div className="flex items-center">
                    {getStatusIcon(selectedCommunication.status)}
                    <span className="ml-1 text-sm text-gray-600">
                      {selectedCommunication.status === "sent" ? "Đã gửi" :
                       selectedCommunication.status === "delivered" ? "Đã giao" :
                       selectedCommunication.status === "read" ? "Đã đọc" : "Thất bại"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 bg-white border rounded-lg">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {selectedCommunication.content}
                </p>
              </div>

              {/* Attachments */}
              {selectedCommunication.attachments && selectedCommunication.attachments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Tệp đính kèm</h4>
                  <div className="space-y-2">
                    {selectedCommunication.attachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center">
                          <Paperclip className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {attachment.name}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({(attachment.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button variant="outline" size="sm" asChild>
                          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recipient information */}
              {selectedCommunication.recipient && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Người nhận</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <div><strong>Tên:</strong> {selectedCommunication.recipient.name}</div>
                      {selectedCommunication.recipient.phone && (
                        <div><strong>Điện thoại:</strong> {selectedCommunication.recipient.phone}</div>
                      )}
                      {selectedCommunication.recipient.email && (
                        <div><strong>Email:</strong> {selectedCommunication.recipient.email}</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              {selectedCommunication.metadata && Object.keys(selectedCommunication.metadata).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Thông tin thêm</h4>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm space-y-1">
                      {Object.entries(selectedCommunication.metadata).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key}:</strong> {String(value)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedCommunication(null)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommunicationHistory;