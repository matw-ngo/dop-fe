"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Breadcrumb as BreadcrumbComponent,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocalizedPath } from "@/lib/client-utils";
import { useTranslations } from "next-intl";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface AdminBreadcrumbProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export function AdminBreadcrumb({ items, className }: AdminBreadcrumbProps) {
  const params = useParams();
  const getLocalizedPath = useLocalizedPath();
  const t = useTranslations("admin.breadcrumb");

  // Default breadcrumb items based on current route
  const defaultItems: BreadcrumbItem[] = [
    { label: t("dashboard"), href: "/admin" },
    { label: t("flows"), href: "/admin/flows" },
  ];

  // Add flow detail page
  if (params.flowId && !params.stepId) {
    const flowId = Array.isArray(params.flowId)
      ? params.flowId[0]
      : params.flowId;
    defaultItems.push({
      label: t("flow", { id: flowId }),
      isActive: true,
    });
  }

  // Step detail page is now handled by dialog, so no breadcrumb needed for stepId

  const breadcrumbItems = items || defaultItems;

  // If we have too many items, show ellipsis dropdown
  if (breadcrumbItems.length > 4) {
    const firstItems = breadcrumbItems.slice(0, 2);
    const lastItems = breadcrumbItems.slice(-2);

    return (
      <BreadcrumbComponent className={className}>
        <BreadcrumbList>
          {firstItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbItem>
                {item.href && !item.isActive ? (
                  <BreadcrumbLink asChild>
                    <Link href={getLocalizedPath(item.href)}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
              {index < firstItems.length - 1 && <BreadcrumbSeparator />}
            </div>
          ))}

          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                <BreadcrumbEllipsis />
                <span className="sr-only">{t("toggleMenu")}</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {breadcrumbItems.slice(2, -2).map((item, index) => (
                  <DropdownMenuItem key={index} asChild>
                    {item.href && !item.isActive ? (
                      <Link href={getLocalizedPath(item.href)}>
                        {item.label}
                      </Link>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>

          {lastItems.map((item, index) => (
            <div key={index} className="flex items-center">
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {item.href && !item.isActive ? (
                  <BreadcrumbLink asChild>
                    <Link href={getLocalizedPath(item.href)}>{item.label}</Link>
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </div>
          ))}
        </BreadcrumbList>
      </BreadcrumbComponent>
    );
  }

  return (
    <BreadcrumbComponent className={className}>
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <div key={index} className="flex items-center">
            <BreadcrumbItem>
              {item.href && !item.isActive ? (
                <BreadcrumbLink asChild>
                  <Link href={getLocalizedPath(item.href)}>{item.label}</Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </div>
        ))}
      </BreadcrumbList>
    </BreadcrumbComponent>
  );
}
