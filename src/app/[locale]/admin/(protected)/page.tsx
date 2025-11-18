"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutDashboardIcon,
  FileTextIcon,
  UsersIcon,
  SettingsIcon,
  ArrowRightIcon
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function AdminDashboard() {
  const { user } = useAuth();
  const t = useTranslations("admin.dashboard");

  const stats = [
    {
      title: t("stats.totalFlows"),
      value: "12",
      description: t("stats.changePrefix", { percentage: "2" }),
      icon: FileTextIcon,
    },
    {
      title: t("stats.totalUsers"),
      value: "1,234",
      description: t("stats.changePrefix", { percentage: "18" }),
      icon: UsersIcon,
    },
    {
      title: t("stats.visits"),
      value: "8,549",
      description: t("stats.changePrefix", { percentage: "12" }),
      icon: LayoutDashboardIcon,
    },
  ];

  const quickActions = [
    {
      title: t("quickActions.flowManagement.title"),
      description: t("quickActions.flowManagement.description"),
      icon: FileTextIcon,
      href: "/admin/flows",
      color: "bg-blue-500",
    },
    {
      title: t("quickActions.userManagement.title"),
      description: t("quickActions.userManagement.description"),
      icon: UsersIcon,
      href: "/admin/users",
      color: "bg-green-500",
    },
    {
      title: t("quickActions.systemSettings.title"),
      description: t("quickActions.systemSettings.description"),
      icon: SettingsIcon,
      href: "/admin/settings",
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t("welcome", { username: user?.username || "" })}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/flows">
            {t("createNewFlow")}
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">{t("quickActions.title")}</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
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
                <Button variant="outline" className="w-full" asChild>
                  <Link href={action.href}>
                    {t("quickActions.flowManagement.button")}
                    <ArrowRightIcon className="ml-2 size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentActivity.title")}</CardTitle>
          <CardDescription>
            {t("recentActivity.subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="size-2 rounded-full bg-blue-500"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {t("recentActivity.flowCreated", { flowName: "Đăng ký tài khoản" })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("recentActivity.minutesAgo", { minutes: "2" })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="size-2 rounded-full bg-green-500"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {t("recentActivity.userRegistered", { username: "user123" })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("recentActivity.minutesAgo", { minutes: "15" })}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="size-2 rounded-full bg-purple-500"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {t("recentActivity.settingsUpdated")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("recentActivity.hoursAgo", { hours: "1" })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}