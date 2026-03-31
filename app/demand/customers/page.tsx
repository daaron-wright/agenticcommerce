"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, TrendingUp, TrendingDown } from "lucide-react";
import { RecentFromChat } from "@/components/cdp/recent-from-chat";
import { cn } from "@/lib/utils";

const stores = [
  { id: 1, name: "Store #142 — Downtown Metro", region: "Urban", cluster: "High-Traffic", forecastAccuracy: 71, wasteRate: 9.8, fillRate: 88, topCategory: "Prepared Foods", volatility: "High", status: "Active" },
  { id: 2, name: "Store #089 — Westfield Mall", region: "Urban", cluster: "High-Traffic", forecastAccuracy: 73, wasteRate: 8.9, fillRate: 90, topCategory: "Dairy", volatility: "High", status: "Active" },
  { id: 3, name: "Store #215 — Oak Park", region: "Suburban", cluster: "Standard", forecastAccuracy: 78, wasteRate: 7.2, fillRate: 93, topCategory: "Bakery", volatility: "Medium", status: "Active" },
  { id: 4, name: "Store #331 — Riverside", region: "Suburban", cluster: "Standard", forecastAccuracy: 80, wasteRate: 6.8, fillRate: 94, topCategory: "Produce", volatility: "Medium", status: "Active" },
  { id: 5, name: "Store #067 — University District", region: "Urban", cluster: "University", forecastAccuracy: 69, wasteRate: 10.2, fillRate: 87, topCategory: "Beverages", volatility: "High", status: "Active" },
  { id: 6, name: "Store #412 — Country Road", region: "Rural", cluster: "Low-Volume", forecastAccuracy: 84, wasteRate: 5.4, fillRate: 96, topCategory: "Dairy", volatility: "Low", status: "Active" },
  { id: 7, name: "Store #298 — Lakeside", region: "Suburban", cluster: "Standard", forecastAccuracy: 79, wasteRate: 7.0, fillRate: 93, topCategory: "Produce", volatility: "Medium", status: "Active" },
  { id: 8, name: "Store #156 — Station Quarter", region: "Urban", cluster: "High-Traffic", forecastAccuracy: 72, wasteRate: 9.1, fillRate: 89, topCategory: "Deli", volatility: "High", status: "Active" },
];

const clusterColors: Record<string, string> = {
  "High-Traffic": "bg-red-50 text-red-700 border-red-200",
  "Standard": "bg-blue-50 text-blue-700 border-blue-200",
  "University": "bg-purple-50 text-purple-700 border-purple-200",
  "Low-Volume": "bg-green-50 text-green-700 border-green-200",
};

const volatilityColors: Record<string, string> = {
  "Low": "text-green-600",
  "Medium": "text-amber-600",
  "High": "text-red-600",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  const filtered = stores.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.region.toLowerCase().includes(search.toLowerCase()) ||
      s.cluster.toLowerCase().includes(search.toLowerCase()),
  );

  const clusterCounts = stores.reduce<Record<string, number>>((acc, s) => {
    acc[s.cluster] = (acc[s.cluster] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <RecentFromChat category="customers" />

      <div>
        <h1 className="text-2xl font-bold">Store Insights</h1>
        <p className="text-muted-foreground text-sm mt-1">Store-level demand planning performance and forecast accuracy</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Object.entries(clusterCounts).map(([cluster, count]) => (
          <Card key={cluster}>
            <CardContent className="pt-4 pb-4">
              <span className={`inline-block text-xs px-2 py-0.5 rounded border font-medium mb-2 ${clusterColors[cluster]}`}>{cluster}</span>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs text-muted-foreground">stores</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-sm">All Stores</CardTitle>
            <div className="relative ml-auto w-64">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search stores..."
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
                <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Store</th>
                <th className="text-left py-2 px-2 font-semibold text-muted-foreground">Cluster</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Forecast Accuracy</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Waste Rate</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Fill Rate</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Top Waste Category</th>
                <th className="text-right py-2 px-2 font-semibold text-muted-foreground">Demand Volatility</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b hover:bg-muted/30 transition-colors cursor-pointer">
                  <td className="py-2.5 px-2">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-muted-foreground">{s.region}</div>
                  </td>
                  <td className="py-2.5 px-2">
                    <span className={`inline-block text-[10px] px-2 py-0.5 rounded border font-medium ${clusterColors[s.cluster]}`}>{s.cluster}</span>
                  </td>
                  <td className="text-right py-2.5 px-2 font-semibold">
                    <span className={cn(s.forecastAccuracy >= 80 ? "text-green-600" : s.forecastAccuracy >= 75 ? "text-amber-600" : "text-red-600")}>
                      {s.forecastAccuracy}%
                    </span>
                  </td>
                  <td className="text-right py-2.5 px-2">
                    <span className={cn("font-medium", s.wasteRate <= 6 ? "text-green-600" : s.wasteRate <= 8 ? "text-amber-600" : "text-red-600")}>
                      {s.wasteRate}%
                    </span>
                  </td>
                  <td className="text-right py-2.5 px-2 font-semibold">{s.fillRate}%</td>
                  <td className="text-right py-2.5 px-2 text-muted-foreground">{s.topCategory}</td>
                  <td className={`text-right py-2.5 px-2 font-semibold ${volatilityColors[s.volatility]}`}>{s.volatility}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
