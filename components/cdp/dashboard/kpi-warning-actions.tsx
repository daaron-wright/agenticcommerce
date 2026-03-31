"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { EcomKpi } from "@/lib/dashboard/mock-ecommerce";

type KpiWarningActionsProps = {
  warning: NonNullable<EcomKpi["warning"]>;
};

export function KpiWarningActions({ warning }: KpiWarningActionsProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleOptionClick = (warningActionId: string, prompt: string) => {
    setOpen(false);
    const query = new URLSearchParams({
      prompt,
      warningActionId,
    }).toString();
    router.push(`/chat?${query}`);
  };

  return (
    <>
      <div className="px-4 py-1.5 border-b border-amber-300/70 bg-amber-100/70 flex items-center justify-between gap-2 min-w-0">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-amber-800 min-w-0 flex-shrink" title={warning.label}>
          <AlertTriangle className="h-3 w-3 flex-shrink-0" />
          <span className="hidden md:inline truncate">{warning.label}</span>
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setOpen(true)}
          className="h-6 px-2 text-[10px] text-amber-800 hover:text-amber-800 hover:bg-amber-200/60 flex-shrink-0 whitespace-nowrap ml-auto"
        >
          Investigate with AI
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{warning.label}</DialogTitle>
            <DialogDescription>{warning.message}</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {warning.options.map((option) => (
              <button
                key={option.title}
                onClick={() => handleOptionClick(option.warningActionId, option.prompt)}
                className="w-full text-left rounded-md border px-3 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{option.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.description}</p>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
