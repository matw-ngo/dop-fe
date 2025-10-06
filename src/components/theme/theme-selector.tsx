"use client";

import { Download, Monitor, Moon, Palette, Settings, Sun } from "lucide-react";
import { useTheme as useNextTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/lib/theme/context";
import { themes, userGroups } from "@/lib/theme/themes";
import type { ThemeMode } from "@/lib/theme/types";
import { exportThemeAsCSS } from "@/lib/theme/utils";
import { ThemeCustomizer } from "./theme-customizer";

export function ThemeSelector() {
  const { theme: nextTheme, setTheme: setNextTheme } = useNextTheme();
  const {
    currentTheme,
    userGroup,
    availableThemes,
    canCustomize,
    themeConfig,
    setTheme,
    setUserGroup,
  } = useTheme();

  const [showCustomizer, setShowCustomizer] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleModeChange = (mode: string) => {
    setNextTheme(mode);
  };

  const handleThemeExport = () => {
    if (!themeConfig) return;

    const css = exportThemeAsCSS(themeConfig);
    const blob = new Blob([css], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${themeConfig.id}-theme.css`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentGroup = userGroups[userGroup];
  const currentThemeConfig = themes[currentTheme];

  return (
    <div className="flex items-center gap-2">
      {/* User Group Selector */}
      <Select value={userGroup} onValueChange={setUserGroup}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(userGroups).map((group) => (
            <SelectItem key={group.id} value={group.id}>
              {group.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Theme Selector */}
      <Select value={currentTheme} onValueChange={setTheme}>
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableThemes.map((themeId) => {
            const theme = themes[themeId];
            return (
              <SelectItem key={themeId} value={themeId}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full border"
                    style={{ backgroundColor: theme.colors.light.primary }}
                  />
                  {theme.name}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Mode Selector */}
      <Select value={nextTheme} onValueChange={handleModeChange}>
        <SelectTrigger className="w-[100px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="light">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Light
            </div>
          </SelectItem>
          <SelectItem value="dark">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              Dark
            </div>
          </SelectItem>
          <SelectItem value="system">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              System
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Theme Options */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Current Theme</h4>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">
                      {currentThemeConfig?.name}
                    </CardTitle>
                    <Badge variant="secondary">{currentGroup?.name}</Badge>
                  </div>
                  <CardDescription className="text-xs">
                    {currentThemeConfig?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-1">
                    {Object.entries(currentThemeConfig?.colors.light || {})
                      .slice(0, 8)
                      .map(([key, color]) => (
                        <div
                          key={key}
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color }}
                          title={key}
                        />
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              {canCustomize && (
                <Dialog open={showCustomizer} onOpenChange={setShowCustomizer}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Palette className="h-4 w-4 mr-2" />
                      Customize
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Customize Theme</DialogTitle>
                    </DialogHeader>
                    <ThemeCustomizer onClose={() => setShowCustomizer(false)} />
                  </DialogContent>
                </Dialog>
              )}

              <Button variant="outline" size="sm" onClick={handleThemeExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            {currentGroup?.customizations && (
              <div className="text-xs text-muted-foreground space-y-1">
                <p className="font-medium">Group Permissions:</p>
                <ul className="space-y-1">
                  {currentGroup.customizations.allowCustomColors && (
                    <li>• Custom colors allowed</li>
                  )}
                  {currentGroup.customizations.allowCustomFonts && (
                    <li>• Custom fonts allowed</li>
                  )}
                  {currentGroup.customizations.allowCustomRadius && (
                    <li>• Custom radius allowed</li>
                  )}
                  {currentGroup.customizations.brandingRequired && (
                    <li>• Branding required</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
