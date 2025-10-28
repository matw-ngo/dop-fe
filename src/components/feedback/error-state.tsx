import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { RotateCw, ChevronsUpDown, AlertCircle } from "lucide-react";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry: () => void;
  t: (key: string) => string;
}

export function ErrorState({ title, message, onRetry, t }: ErrorStateProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
      <div className="mx-auto bg-red-100 rounded-full p-3 w-fit">
        <AlertCircle className="h-12 w-12 text-red-600" />
      </div>
      <h2 className="mt-6 text-2xl font-bold">{title || t("defaultTitle")}</h2>
      <p className="mt-2 text-muted-foreground">{t("description")}</p>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="mt-6 w-full max-w-sm"
      >
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs">
            <ChevronsUpDown className="h-4 w-4 mr-2" />
            {isOpen ? t("hideDetails") : t("showDetails")}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-2 p-3 bg-gray-100 rounded-md text-left text-xs text-gray-600 overflow-auto">
            <pre className="whitespace-pre-wrap">{message}</pre>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <Button
        onClick={onRetry}
        size="lg"
        variant="destructive"
        className="mt-8"
      >
        <RotateCw className="mr-2 h-4 w-4" />
        {t("retryButton")}
      </Button>
    </div>
  );
}
