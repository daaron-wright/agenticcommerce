"use client";

import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import { WEEKLY_COMMERCIAL_REVIEW } from "@/lib/commercial-review";
import { useActionEffects } from "@/lib/action-effects-store";
import { toast } from "sonner";

export function AIRecommendationsPanel({ className }: { className?: string }) {
  const { user } = useAuth();
  const canExecuteAI = user ? hasPermissionForUser(user, "ai_action_execute") : false;
  const effects = useActionEffects();

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="h-3.5 w-3.5 text-stone-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-500">AI Recommendations</h3>
      </div>
      <div className="space-y-2.5">
        {WEEKLY_COMMERCIAL_REVIEW.recommendations.map((recommendation) => {
          const isApplied = !!effects.appliedRecommendations[recommendation.id];

          return (
            <div
              key={recommendation.id}
              className={cn(
                "rounded-xl border px-3.5 py-3 shadow-sm",
                isApplied
                  ? "border-emerald-200 bg-emerald-50/60"
                  : "border-stone-200 bg-white"
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold text-stone-900">{recommendation.title}</p>
                {isApplied ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-2.5 w-2.5" /> Applied
                  </span>
                ) : (
                  <span
                    className={cn(
                      "inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
                      recommendation.priority === "high"
                        ? "bg-rose-100 text-rose-700"
                        : recommendation.priority === "medium"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-stone-200 text-stone-700"
                    )}
                  >
                    {recommendation.priority}
                  </span>
                )}
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-stone-600">{recommendation.action}</p>
              <p className="mt-1 text-[11px] font-medium text-emerald-700">{recommendation.impact}</p>
              <div className="mt-2.5 flex items-center gap-2">
                {isApplied ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="h-3 w-3" /> Action applied to dashboard
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        effects.applyRecommendation(recommendation.id);
                        toast.success("Recommendation applied", {
                          description: `${recommendation.title} — metrics updated across dashboards`,
                        });
                      }}
                      className="inline-flex items-center rounded-md bg-emerald-700 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-emerald-800"
                    >
                      Apply now
                    </button>
                    <Link
                      href={`/chat?actionId=${recommendation.nbaActionId}&intent=${canExecuteAI ? "execute" : "review"}&prompt=${encodeURIComponent(
                        canExecuteAI ? recommendation.executePrompt : recommendation.reviewPrompt
                      )}`}
                      className="inline-flex items-center rounded-md bg-stone-800 px-2.5 py-1.5 text-[11px] font-medium text-white hover:bg-stone-900"
                    >
                      {canExecuteAI ? "Execute in chat" : "Send for review"}
                    </Link>
                    <Link
                      href={`/chat?prompt=${encodeURIComponent(recommendation.reviewPrompt)}`}
                      className="inline-flex items-center rounded-md border border-stone-300 px-2.5 py-1.5 text-[11px] font-medium text-stone-700 hover:bg-white"
                    >
                      Review
                    </Link>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Page layout wrapper: main content on the left, AI recommendations sticky on the right.
 */
export function PageWithRecommendations({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
      <div className="min-w-0">{children}</div>
      <aside className="hidden xl:block">
        <div className="sticky top-6 space-y-4 rounded-2xl border border-stone-200 bg-stone-50/60 p-4">
          <AIRecommendationsPanel />
        </div>
      </aside>
    </div>
  );
}
