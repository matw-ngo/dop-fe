"use client";

import { useState } from "react";
import { useTheme } from "@/components/renderer/theme/context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DollarSign, HeartPulse, Palette, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

export function ToolsThemeToggle() {
  const t = useTranslations("features.tools.theme");
  const { currentTheme, userGroup, availableThemes, setTheme, setUserGroup } =
    useTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Theme configurations for tools
  const themeOptions = [
    {
      id: "finance",
      name: t("themes.finance.name"),
      description: t("themes.finance.description"),
      icon: DollarSign,
      userGroup: "finance",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "medical",
      name: t("themes.medical.name"),
      description: t("themes.medical.description"),
      icon: HeartPulse,
      userGroup: "healthcare",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      id: "corporate",
      name: t("themes.corporate.name"),
      description: t("themes.corporate.description"),
      icon: Palette,
      userGroup: "business",
      color: "text-slate-600",
      bgColor: "bg-slate-50",
    },
  ];

  const currentThemeConfig =
    themeOptions.find((opt) => opt.id === currentTheme) || themeOptions[0];
  const CurrentIcon = currentThemeConfig.icon;

  const handleThemeSwitch = (themeConfig: (typeof themeOptions)[0]) => {
    // Switch user group if needed
    if (userGroup !== themeConfig.userGroup) {
      setUserGroup(themeConfig.userGroup);
    } else {
      // If already in correct user group, just set theme
      setTheme(themeConfig.id);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-muted/50 transition-colors"
        >
          <CurrentIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{currentThemeConfig.name}</span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 space-y-1">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">{t("title")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("description")}
            </p>
          </div>

          <div className="space-y-1 pt-1">
            {themeOptions.map((themeConfig) => {
              const Icon = themeConfig.icon;
              const isActive = currentTheme === themeConfig.id;
              const isAvailable = availableThemes.includes(themeConfig.id);

              return (
                <DropdownMenuItem
                  key={themeConfig.id}
                  onClick={() => isAvailable && handleThemeSwitch(themeConfig)}
                  disabled={!isAvailable}
                  className={`flex items-center gap-3 p-3 cursor-pointer ${
                    isActive ? "bg-muted/50" : "hover:bg-muted/30"
                  } ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className={`p-2 rounded-md ${themeConfig.bgColor}`}>
                    <Icon className={`w-4 h-4 ${themeConfig.color}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {themeConfig.name}
                      </span>
                      {isActive && (
                        <Badge variant="secondary" className="text-xs">
                          {t("current")}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {themeConfig.description}
                    </p>
                  </div>
                </DropdownMenuItem>
              );
            })}
          </div>

          <div className="px-2 py-2 border-t mt-2">
            <p className="text-xs text-muted-foreground">{t("note")}</p>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
