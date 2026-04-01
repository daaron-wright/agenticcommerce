"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Filter, Download, MessageSquare, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getAllAuditEvents } from "@/lib/risk/cyber-risk-data";
import { BENCHMARK_CITATIONS } from "@/lib/risk/industry-benchmarks";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function EventTypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    "Assessment Complete": "bg-blue-50 text-blue-700",
    "Financial Model Run": "bg-purple-50 text-purple-700",
    "Risk Score Computed": "bg-stone-100 text-stone-700",
    "Control Gap Detected": "bg-red-50 text-red-700",
    "Threat Indicator": "bg-amber-50 text-amber-700",
    "Vulnerability Detected": "bg-red-50 text-red-700",
    "Benchmark Updated": "bg-teal-50 text-teal-700",
    "Recovery Test Failed": "bg-red-50 text-red-700",
    "Controls Review": "bg-emerald-50 text-emerald-700",
    "Scenario Exploration": "bg-indigo-50 text-indigo-700",
    "Workstream Execution": "bg-violet-50 text-violet-700",
    "Custom Assessment": "bg-sky-50 text-sky-700",
  };
  return (
    <Badge variant="outline" className={cn("text-[10px] border-0 whitespace-nowrap", colors[type] || "bg-stone-50 text-stone-600")}>
      {type}
    </Badge>
  );
}

export default function AssessmentHistoryPage() {
  const [showFilters, setShowFilters] = useState(false);
  const auditEvents = getAllAuditEvents();

  return (
    <div className="space-y-6">
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Audit Filters</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-5">
            <div className="space-y-2">
              <Label>Severity</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All domains</SelectItem>
                  <SelectItem value="ecommerce">E-Commerce</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="supply-chain">Supply Chain</SelectItem>
                  <SelectItem value="crm">CRM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Event type</Label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="threat">Threat Indicator</SelectItem>
                  <SelectItem value="vulnerability">Vulnerability</SelectItem>
                  <SelectItem value="control">Controls Review</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={() => { toast.success("Filters applied"); setShowFilters(false); }}>
              Apply filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">System</p>
          <h1 className="text-2xl font-bold tracking-tight">Assessment History</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Complete timeline of cyber risk assessments, scoring events, and control changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => setShowFilters(true)}>
            <Filter className="h-3.5 w-3.5" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={() => toast.success("Export started", { description: "CSV will download shortly." })}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-stone-600" />
          <h2 className="text-base font-semibold">Event Stream</h2>
          <span className="text-xs text-muted-foreground">({auditEvents.length} events)</span>
        </div>

        <Card className="border shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-stone-50/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Timestamp</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Event Type</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Business Service</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Agent</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Details</th>
                </tr>
              </thead>
              <tbody>
                {auditEvents.map((event) => {
                  const isChat = event.source === "chat";
                  return (
                  <tr
                    key={event.id}
                    className={cn(
                      "border-b last:border-0 transition-colors",
                      isChat ? "bg-indigo-50/30 hover:bg-indigo-50/50" : "hover:bg-stone-50"
                    )}
                  >
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {isChat ? (
                          <MessageSquare className="h-3.5 w-3.5 text-indigo-500" />
                        ) : (
                          <ShieldCheck className="h-3.5 w-3.5 text-stone-400" />
                        )}
                        {event.timestamp}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <EventTypeBadge type={event.eventType} />
                    </td>
                    <td className="px-4 py-3">
                      {event.serviceId ? (
                        <Link href={`/vendor/${event.serviceId}`} className="text-sm text-teal-600 hover:underline">
                          {event.serviceName}
                        </Link>
                      ) : (
                        <span className="text-sm text-stone-600">{event.serviceName}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-stone-700">{event.actor}</span>
                      {isChat && (
                        <Badge variant="secondary" className="ml-2 text-[9px] px-1.5 py-0 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                          Chat Session
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-600 max-w-[300px] truncate" title={event.details}>{event.details}</td>
                  </tr>
                )})}
              </tbody>
            </table>
          </div>
        </Card>

        <p className="text-[9px] text-stone-400 italic text-right">{BENCHMARK_CITATIONS.fair}</p>
      </div>
    </div>
  );
}
