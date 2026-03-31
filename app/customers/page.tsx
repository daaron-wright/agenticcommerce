"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { PageBanner } from "@/components/ui/page-banner";

const customers = [
  { id: 1, name: "Emma Lindqvist", email: "emma.l@email.com", segment: "High Value", archetype: "Loyal Buyer", ltv: 48200, lastPurchase: "2 days ago", trend: "up", riskScore: "Low" },
  { id: 2, name: "Marcus Bergström", email: "m.bergstrom@email.com", segment: "At Risk", archetype: "Deal Hunter", ltv: 12400, lastPurchase: "45 days ago", trend: "down", riskScore: "High" },
  { id: 3, name: "Sofia Andersson", email: "sofia.a@email.com", segment: "High Value", archetype: "Brand Advocate", ltv: 72100, lastPurchase: "1 week ago", trend: "up", riskScore: "Low" },
  { id: 4, name: "Johan Eriksson", email: "j.eriksson@email.com", segment: "Growth", archetype: "Occasional Buyer", ltv: 8900, lastPurchase: "3 weeks ago", trend: "up", riskScore: "Medium" },
  { id: 5, name: "Astrid Nilsson", email: "astrid.n@email.com", segment: "Dormant", archetype: "Bargain Seeker", ltv: 3200, lastPurchase: "4 months ago", trend: "down", riskScore: "High" },
  { id: 6, name: "Lars Johansson", email: "l.johansson@email.com", segment: "High Value", archetype: "Loyal Buyer", ltv: 55800, lastPurchase: "5 days ago", trend: "up", riskScore: "Low" },
  { id: 7, name: "Maja Svensson", email: "maja.s@email.com", segment: "Growth", archetype: "Trend Follower", ltv: 14600, lastPurchase: "10 days ago", trend: "up", riskScore: "Low" },
  { id: 8, name: "Erik Karlsson", email: "e.karlsson@email.com", segment: "At Risk", archetype: "Occasional Buyer", ltv: 9800, lastPurchase: "38 days ago", trend: "down", riskScore: "Medium" },
];

const segmentColors: Record<string, string> = {
  "High Value": "bg-slate-100 text-slate-800 border-slate-200",
  "Growth": "bg-slate-50 text-slate-600 border-slate-200",
  "At Risk": "bg-slate-100 text-slate-900 border-slate-300",
  "Dormant": "bg-slate-50 text-slate-500 border-slate-100",
};

const riskColors: Record<string, string> = {
  "Low": "text-slate-500",
  "Medium": "text-slate-700",
  "High": "text-slate-900",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.segment.toLowerCase().includes(search.toLowerCase()),
  );

  const segmentCounts = customers.reduce<Record<string, number>>((acc, c) => {
    acc[c.segment] = (acc[c.segment] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Recent from chat */}
      <RecentFromChat category="customers" />

      <PageBanner title="Customer Insights" description="Unified customer profiles enriched by the CDP identity graph" />

      {/* Segment summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(segmentCounts).map(([seg, count]) => (
          <Card key={seg}>
            <CardContent className="pt-4 pb-4">
              <span className={`inline-block text-xs px-2 py-0.5 rounded border font-medium mb-2 ${segmentColors[seg]}`}>{seg}</span>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">customers</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm">All Customers</CardTitle>
            <div className="relative ml-auto w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                className="pl-8 h-8 text-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Customer</th>
                <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Segment</th>
                <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Archetype</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">LTV (£)</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Last Purchase</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Trend</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Churn Risk</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="py-2.5 px-2">
                    <div className="font-medium">{c.name}</div>
                    <div className="text-muted-foreground">{c.email}</div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-medium ${segmentColors[c.segment]}`}>{c.segment}</span>
                  </td>
                  <td className="py-2.5 px-2 text-muted-foreground">{c.archetype}</td>
                  <td className="text-right py-2.5 px-2 font-semibold">{c.ltv.toLocaleString("en-GB")}</td>
                  <td className="text-right py-2.5 px-2 text-muted-foreground">{c.lastPurchase}</td>
                  <td className="text-right py-2.5 px-2">
                    {c.trend === "up"
                      ? <TrendingUp className="h-3.5 w-3.5 text-slate-500 ml-auto" />
                      : <TrendingDown className="h-3.5 w-3.5 text-slate-400 ml-auto" />
                    }
                  </td>
                  <td className={`text-right py-2.5 px-2 font-semibold ${riskColors[c.riskScore]}`}>{c.riskScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
