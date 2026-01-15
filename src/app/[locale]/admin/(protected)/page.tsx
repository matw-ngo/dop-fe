"use client";

import {
  ActivityIcon,
  AlertTriangleIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ClockIcon,
  CreditCardIcon,
  DollarSignIcon,
  FileCheckIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  TrendingUpIcon,
  UserPlusIcon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAdminAccess } from "@/hooks/auth/use-auth-guards";
import { useAuth } from "@/lib/auth/auth-context";
import { useLocalizedPath } from "@/lib/client-utils";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { canViewAnalytics, canManageUsers, canManageFlows } = useAdminAccess();
  const getLocalizedPath = useLocalizedPath();
  const t = useTranslations("admin.dashboard");

  // Mock user stats for now - TODO: Replace with actual API call
  const mockUserStats = {
    totalUsers: 1234,
    usersChange: "+8",
    usersTrend: "up" as const,
  };
  const isLoadingUsers = false;

  // Mock loan stats for now
  const mockLoanStats = {
    totalFlows: 12,
    flowsChange: "+8",
    flowsTrend: "up",
    totalApplications: 856,
    applicationsChange: "+15",
    applicationsTrend: "up",
    conversionRate: 68.5,
    conversionRateChange: "+2.3",
    conversionRateTrend: "up",
    recentActivities: [
      {
        type: "flowCreated",
        title: t("recentActivity.flowCreated", {
          flowName: "Đăng ký tài khoản",
        }),
        time: "2 phút trước",
        icon: FileCheckIcon,
        color: "bg-blue-500",
      },
      {
        type: "userRegistered",
        title: t("recentActivity.userRegistered", { username: "user123" }),
        time: "15 phút trước",
        icon: UserPlusIcon,
        color: "bg-green-500",
      },
      {
        type: "applicationSubmitted",
        title: t("recentActivity.applicationSubmitted", {
          amount: "50,000,000 VNĐ",
        }),
        time: "1 giờ trước",
        icon: DollarSignIcon,
        color: "bg-orange-500",
      },
      {
        type: "settingsUpdated",
        title: t("recentActivity.settingsUpdated"),
        time: "1 giờ trước",
        icon: SettingsIcon,
        color: "bg-purple-500",
      },
    ],
  };

  // Enhanced stats with loading states
  const stats = [
    {
      title: t("stats.totalFlows"),
      value: mockLoanStats.totalFlows.toString(),
      description: t("stats.changePrefix", {
        percentage: mockLoanStats.flowsChange,
      }),
      icon: FileTextIcon,
      trend: mockLoanStats.flowsTrend,
    },
    {
      title: t("stats.totalUsers"),
      value: mockUserStats.totalUsers.toString(),
      description: t("stats.changePrefix", {
        percentage: mockUserStats.usersChange,
      }),
      icon: UsersIcon,
      trend: mockUserStats.usersTrend,
      loading: isLoadingUsers,
    },
    {
      title: t("stats.applications"),
      value: mockLoanStats.totalApplications.toString(),
      description: t("stats.changePrefix", {
        percentage: mockLoanStats.applicationsChange,
      }),
      icon: ActivityIcon,
      trend: mockLoanStats.applicationsTrend,
    },
    {
      title: t("stats.conversionRate"),
      value: `${mockLoanStats.conversionRate}%`,
      description: t("stats.conversionChange", {
        rate: mockLoanStats.conversionRateChange,
      }),
      icon: TrendingUpIcon,
      trend: mockLoanStats.conversionRateTrend,
    },
  ];

  const quickActions = [
    {
      title: t("quickActions.flowManagement.title"),
      description: t("quickActions.flowManagement.description"),
      icon: FileTextIcon,
      href: getLocalizedPath("/admin/flows"),
      color: "bg-blue-500",
      enabled: canManageFlows,
    },
    {
      title: t("quickActions.userManagement.title"),
      description: t("quickActions.userManagement.description"),
      icon: UsersIcon,
      href: getLocalizedPath("/admin/users"),
      color: "bg-green-500",
      enabled: canManageUsers,
    },
    {
      title: t("quickActions.loanApplications.title"),
      description: t("quickActions.loanApplications.description"),
      icon: CreditCardIcon,
      href: getLocalizedPath("/admin/loan-applications"),
      color: "bg-orange-500",
      enabled: true,
    },
    {
      title: t("quickActions.systemSettings.title"),
      description: t("quickActions.systemSettings.description"),
      icon: SettingsIcon,
      href: getLocalizedPath("/admin/settings"),
      color: "bg-purple-500",
      enabled: canViewAnalytics,
    },
  ];

  const recentActivities = mockLoanStats.recentActivities;

  // Helper component for trend indicators
  const TrendIndicator = ({ trend }: { trend?: string }) => {
    if (!trend) return null;

    return (
      <span
        className={`inline-flex items-center text-xs ${
          trend === "up" ? "text-green-600" : "text-red-600"
        }`}
      >
        {trend === "up" ? (
          <TrendingUpIcon className="w-3 h-3 mr-1" />
        ) : (
          <TrendingUpIcon className="w-3 h-3 mr-1 rotate-180" />
        )}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("welcome", { username: user?.username || "" })}
          </h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button asChild disabled={!canManageFlows}>
          <Link href={canManageFlows ? getLocalizedPath("/admin/flows") : "#"}>
            {t("createNewFlow")}
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stat.loading ? <Skeleton className="h-8 w-16" /> : stat.value}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                <TrendIndicator trend={stat.trend} />
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          {t("quickActions.title")}
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className={`hover:shadow-md transition-shadow ${
                !action.enabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className={`p-2 rounded-md ${action.color}`}>
                    <action.icon className="size-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </div>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                  disabled={!action.enabled}
                >
                  <Link href={action.enabled ? action.href : "#"}>
                    {t("quickActions.flowManagement.button")}
                    <ArrowRightIcon className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Additional Dashboard Sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity.title")}</CardTitle>
            <CardDescription>{t("recentActivity.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div
                    className={`size-2 rounded-full ${activity.color}`}
                  ></div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.title}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <ClockIcon className="w-3 h-3 mr-1" />
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>{t("systemStatus.title")}</CardTitle>
            <CardDescription>{t("systemStatus.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="size-4 text-green-500" />
                  <span className="text-sm">{t("systemStatus.api")}</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {t("systemStatus.operational")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="size-4 text-green-500" />
                  <span className="text-sm">{t("systemStatus.database")}</span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {t("systemStatus.operational")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangleIcon className="size-4 text-yellow-500" />
                  <span className="text-sm">{t("systemStatus.ekyc")}</span>
                </div>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  {t("systemStatus.maintenance")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircleIcon className="size-4 text-green-500" />
                  <span className="text-sm">
                    {t("systemStatus.notifications")}
                  </span>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {t("systemStatus.operational")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
