"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();
  const pathname = usePathname();

  const onSelectChange = (nextLocale: string) => {
    startTransition(() => {
      const newPath = pathname.replace(
        new RegExp(`^/${localActive}`),
        `/${nextLocale}`,
      );
      router.replace(newPath);
    });
  };

  return (
    <div className="fixed bottom-5 right-5">
      <Select
        defaultValue={localActive}
        onValueChange={onSelectChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="vi">Tiếng Việt</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
