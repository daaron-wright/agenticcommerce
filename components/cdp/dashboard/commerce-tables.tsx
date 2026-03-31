import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChannelPerformance, TopProduct } from "@/lib/dashboard/mock-ecommerce";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(value);

type CommerceTablesProps = {
  channels: ChannelPerformance[];
  topProducts: TopProduct[];
};

export function CommerceTables({ channels, topProducts }: CommerceTablesProps) {
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
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="border shadow-none">
        <CardHeader>
          <CardTitle className="text-sm">Channel Mix</CardTitle>
          <CardDescription className="text-xs">Traffic and conversion performance by channel</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold text-muted-foreground">Channel</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Sessions</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Orders</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Conv.</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.channel} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-2.5 font-medium">{channel.channel}</td>
                  <td className="py-2.5 text-right">{channel.sessions.toLocaleString("en-GB")}</td>
                  <td className="py-2.5 text-right">{channel.orders.toLocaleString("en-GB")}</td>
                  <td className="py-2.5 text-right">{channel.conversionRate.toFixed(2)}%</td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(channel.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="border shadow-none">
        <CardHeader>
          <CardTitle className="text-sm">Top Products</CardTitle>
          <CardDescription className="text-xs">Best sellers with return and stock signals</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-semibold text-muted-foreground">Product</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Units</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Revenue</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Returns</th>
                <th className="text-right py-2 font-semibold text-muted-foreground">Stock</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product) => (
                <tr
                  key={product.sku}
                  onClick={() => handleWarningNavigation(product.warningActionId, product.warningPrompt)}
                  className={`border-b last:border-0 hover:bg-muted/40 ${
                    product.isCriticalWarning
                      ? "bg-amber-50/60 hover:bg-amber-100/70 cursor-pointer"
                      : ""
                  }`}
                >
                  <td className="py-2.5">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-[10px] text-muted-foreground">{product.sku}</p>
                  </td>
                  <td className="py-2.5 text-right">{product.unitsSold.toLocaleString("en-GB")}</td>
                  <td className="py-2.5 text-right font-medium">{formatCurrency(product.revenue)}</td>
                  <td className="py-2.5 text-right">{product.returnRate.toFixed(1)}%</td>
                  <td className="py-2.5 text-right">
                    <Badge
                      variant={
                        product.stockStatus === "Healthy"
                          ? "secondary"
                          : product.stockStatus === "Low"
                            ? "outline"
                            : "default"
                      }
                      className="text-[10px]"
                    >
                      {product.stockStatus}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
