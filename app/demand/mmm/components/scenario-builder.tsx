"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Activity, Target, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const demandDrivers = [
  { id: "weather", label: "Weather Signals" },
  { id: "promo_calendar", label: "Promotional Calendar" },
  { id: "pos_realtime", label: "POS Real-Time Data" },
  { id: "external_events", label: "External Events" },
  { id: "social_listening", label: "Social Listening" },
];

const perishableCategories = [
  { id: "dairy", label: "Dairy & Chilled" },
  { id: "bakery", label: "Bakery & Pastries" },
  { id: "produce", label: "Fresh Produce" },
  { id: "deli", label: "Deli & Prepared" },
  { id: "beverages", label: "Beverages" },
];

interface Scenario {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  expectedOutcome: string;
  budgetChange: string;
  risk: "Low" | "Medium" | "High";
}

const mockScenarios: Scenario[] = [
  {
    id: "waste",
    title: "Reduce Perishable Waste",
    description: "Tighten forecasts using all 5 driver signals — weather, promotions, POS, events, and social — to minimize over-ordering across dairy and bakery categories.",
    icon: TrendingUp,
    color: "text-green-600 bg-green-50",
    expectedOutcome: "-25% Waste Rate",
    budgetChange: "No Change",
    risk: "Low",
  },
  {
    id: "promo",
    title: "Maximize Promotional Uplift",
    description: "Model promotional lift with pre-positioning inventory for upcoming BOGO and seasonal promotions across fresh produce and prepared foods.",
    icon: Target,
    color: "text-blue-600 bg-blue-50",
    expectedOutcome: "+18% Promo Revenue",
    budgetChange: "+12% Inventory",
    risk: "Medium",
  },
  {
    id: "touchless",
    title: "Touchless Forecasting",
    description: "Automate 85% of SKU-store intersections by expanding ML-driven baseline forecasting and reserving planner judgment for true exceptions only.",
    icon: Activity,
    color: "text-purple-600 bg-purple-50",
    expectedOutcome: "85% Touchless Coverage",
    budgetChange: "No Change",
    risk: "Low",
  },
];

export function ScenarioBuilderTab({ onModelApplied }: { onModelApplied: () => void }) {
  const [step, setStep] = useState<"input" | "generating" | "scenarios" | "executing" | "success">("input");
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  const handleGenerate = () => {
    setStep("generating");
    setTimeout(() => {
      setStep("scenarios");
    }, 2000);
  };

  const handleExecute = (id: string) => {
    setSelectedScenario(id);
    setStep("executing");
    setTimeout(() => {
      setStep("success");
    }, 2500);
  };

  if (step === "success") {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold">Pipeline Successfully Executed</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-md">
            The demand planning pipeline has integrated this scenario. Forecasts and driver weights have been updated.
          </p>
        </div>
        <Button onClick={onModelApplied} className="mt-4 gap-2">
          View What-If Scenarios <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  if (step === "executing") {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="relative">
          <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-75" />
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center animate-pulse relative z-10">
            <Activity className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold">Running Demand Planning Pipeline...</h3>
          <p className="text-muted-foreground text-sm mt-1 animate-pulse">
            Executing ML forecast models and updating demand projections
          </p>
        </div>
      </div>
    );
  }

  if (step === "generating") {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
        <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center animate-pulse">
          <Zap className="w-8 h-8 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">Agent Analyzing Inputs...</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Evaluating demand driver interactions and historical category data to propose optimal forecast strategies.
          </p>
        </div>
      </div>
    );
  }

  if (step === "scenarios") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-lg font-bold">Proposed Demand Planning Scenarios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Based on your inputs, the agent recommends the following forecast optimization strategies.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockScenarios.map((scenario) => {
            const Icon = scenario.icon;
            return (
              <Card key={scenario.id} className="relative flex flex-col">
                <CardHeader className="pb-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", scenario.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-base">{scenario.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                    {scenario.description}
                  </p>
                  
                  <div className="space-y-2 mt-auto mb-6 bg-muted/50 p-3 rounded-lg text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Expected:</span>
                      <span className="font-semibold text-green-600">{scenario.expectedOutcome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Inventory:</span>
                      <span className="font-medium">{scenario.budgetChange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Risk Level:</span>
                      <span className={cn("font-medium", scenario.risk === "Low" ? "text-green-600" : scenario.risk === "Medium" ? "text-orange-500" : "text-red-500")}>
                        {scenario.risk}
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full gap-2" 
                    onClick={() => handleExecute(scenario.id)}
                  >
                    <Activity className="w-4 h-4" /> Execute Model
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button variant="ghost" size="sm" onClick={() => setStep("input")}>
            ← Back to inputs
          </Button>
        </div>
      </div>
    );
  }

  // Input step
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-lg font-bold">Scenario Builder</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Provide constraints and focus areas. The agent will generate demand planning models optimized for your perishable categories.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Demand Drivers</CardTitle>
            <CardDescription className="text-xs">Which demand signals should be integrated into the forecast?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {demandDrivers.map((d) => (
              <div key={d.id} className="flex items-center space-x-2">
                <Checkbox id={d.id} defaultChecked />
                <Label htmlFor={d.id} className="text-sm font-normal cursor-pointer">{d.label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Perishable Categories</CardTitle>
            <CardDescription className="text-xs">Which product categories are your priority for this cycle?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {perishableCategories.map((cat) => (
              <div key={cat.id} className="flex items-center space-x-2">
                <Checkbox id={cat.id} defaultChecked={cat.id === "dairy" || cat.id === "bakery"} />
                <Label htmlFor={cat.id} className="text-sm font-normal cursor-pointer">{cat.label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Additional Constraints & Business Rules</CardTitle>
          <CardDescription className="text-xs">Tell the agent about shelf-life limits, waste targets, or category-specific rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="e.g. Maximum 3-day shelf life for bakery. Prioritize waste reduction over stock-out prevention for dairy."
            className="min-h-[100px] text-sm resize-none"
            defaultValue="Reduce perishable waste below 6% while maintaining 95%+ fill rate. Focus on dairy and bakery categories first."
          />
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button onClick={handleGenerate} className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
          <Zap className="w-4 h-4" /> Generate Scenarios
        </Button>
      </div>
    </div>
  );
}
