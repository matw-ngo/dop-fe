"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/ui/use-toast";
import { useAuth } from "@/lib/auth/auth-context";
import { getLocalizedRedirect } from "@/lib/client-utils";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const t = useTranslations("admin.login");

  // Redirect if already authenticated using useEffect
  useEffect(() => {
    if (isAuthenticated) {
      const adminPath = getLocalizedRedirect("/admin", pathname);
      router.push(adminPath);
    }
  }, [isAuthenticated, router, pathname]);

  // Return null if authenticated to prevent rendering
  if (isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: t("errors.missingFields.title"),
        description: t("errors.missingFields.description"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: t("success.title"),
          description: t("success.description"),
        });
        // Redirect is handled by the auth context
      } else {
        toast({
          title: t("errors.invalidCredentials.title"),
          description: t("errors.invalidCredentials.description"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("errors.systemError.title"),
        description: t("errors.systemError.description"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t("title")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("subtitle")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">{t("username")}</Label>
              <Input
                id="username"
                type="text"
                placeholder={t("usernamePlaceholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                placeholder={t("passwordPlaceholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2 size-4" />
                  {t("loggingIn")}
                </>
              ) : (
                t("loginButton")
              )}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>{t("demoAccount")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
