import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardActivity, OpsMetric } from "@/lib/dashboard/mock-ecommerce";

type OperationsActivityProps = {
  operations: OpsMetric[];
  recentActivity: DashboardActivity[];
};

const activityIcons = [CheckCircle2, CheckCircle2, AlertCircle, Clock, Clock] as const;

export function OperationsActivity({ operations, recentActivity }: OperationsActivityProps) {
  const router = useRouter();

  const handleWarningNavigation = (warningActionId?: string, warningPrompt?: string) => {
    if (!warningActionId || !warningPrompt) return;
    const query = new URLSearchParams({
      prompt: warningPrompt,
      warningActionId,
    }).toString();
    router.push(`/chat?${query}`);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
      <Card className="border shadow-none">
        <CardHeader>
          <CardTitle className="text-sm">Operations Health</CardTitle>
          <CardDescription className="text-xs">Fulfillment and service quality indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {operations.map((metric) => (
            <div
              key={metric.label}
              onClick={() => handleWarningNavigation(metric.warningActionId, metric.warningPrompt)}
              className={`flex items-center justify-between gap-3 rounded-md border px-2.5 py-2 ${
                metric.isCriticalWarning
                  ? "bg-amber-50/60 hover:bg-amber-100/70 border-amber-300/60 cursor-pointer"
                  : ""
              }`}
            >
              <span className="text-xs">{metric.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium">{metric.value}</span>
                <Badge
                  variant={metric.status === "good" ? "secondary" : metric.status === "warning" ? "outline" : "default"}
                  className="text-[10px]"
                >
                  {metric.status}
                </Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border shadow-none">
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
          <CardDescription className="text-xs">Latest ecommerce and operations updates</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="space-y-0">
            {recentActivity.map((activity, index) => {
              const IconComp = activityIcons[index] ?? Clock;
              return (
                <li key={`${activity.time}-${index}`} className="flex gap-3 py-3 border-b last:border-0">
                  <div className="mt-0.5 shrink-0">
                    <IconComp className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1 flex items-start justify-between gap-2">
                    <p className="text-xs leading-snug">{activity.text}</p>
                    <p className="text-[10px] text-muted-foreground shrink-0">{activity.time}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
