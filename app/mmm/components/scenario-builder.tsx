"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Zap, Activity, Target, TrendingUp, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const channels = [
  { id: "google_pmax", label: "Google PMAX" },
  { id: "google_search", label: "Google Search" },
  { id: "meta_prospecting", label: "Meta Prospecting" },
  { id: "meta_retargeting", label: "Meta Retargeting" },
  { id: "tiktok", label: "TikTok Video Ads" },
];

const segments = [
  { id: "high_value", label: "High-Value Loyalists" },
  { id: "at_risk", label: "At-Risk High Value" },
  { id: "new_customers", label: "New Customers" },
  { id: "deal_hunters", label: "Deal Hunters" },
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
    id: "profit",
    title: "Maximize Short-Term Profit",
    description: "Shifts budget away from upper-funnel TikTok/Meta awareness into high-converting Google PMAX and Meta Retargeting.",
    icon: TrendingUp,
    color: "text-green-600 bg-green-50",
    expectedOutcome: "+£12,500 net profit / week",
    budgetChange: "Reallocate £25,000",
    risk: "Low",
  },
  {
    id: "acquisition",
    title: "Aggressive Customer Acquisition",
    description: "Over-invests in Meta Prospecting and TikTok to capture the 'New Customers' segment. Temporarily accepts lower ROAS for long-term LTV.",
    icon: Target,
    color: "text-blue-600 bg-blue-50",
    expectedOutcome: "+1,400 new customers / month",
    budgetChange: "Increase total spend by 15%",
    risk: "Medium",
  },
  {
    id: "retention",
    title: "Defend High-Value Segment",
    description: "Focuses spend on At-Risk High Value customers through heavily targeted Meta Retargeting and brand search campaigns.",
    icon: Activity,
    color: "text-purple-600 bg-purple-50",
    expectedOutcome: "-25% churn rate",
    budgetChange: "Reallocate £8,000",
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
          <h3 className="text-xl font-bold">Model Successfully Executed</h3>
          <p className="text-muted-foreground text-sm mt-2 max-w-md">
            The MMM pipeline has integrated this scenario. Your future scenario charts and saturation curves have been updated to reflect the new budget allocation.
          </p>
        </div>
        <Button onClick={onModelApplied} className="mt-4 gap-2">
          View Future Scenario <ArrowRight className="w-4 h-4" />
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
          <h3 className="text-lg font-semibold">Running DAG Pipeline...</h3>
          <p className="text-muted-foreground text-sm mt-1 animate-pulse">
            Executing PyMC model and updating saturation curves
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
            Evaluating channel interactions and historical segment data to propose optimal business goals.
          </p>
        </div>
      </div>
    );
  }

  if (step === "scenarios") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div>
          <h2 className="text-lg font-bold">Proposed Business Scenarios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Based on your inputs, the agent recommends the following strategic models.
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
                      <span className="text-muted-foreground">Budget:</span>
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
          Provide constraints and focus areas. The agent will generate actionable MMM models optimized for your goals.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Target Channels</CardTitle>
            <CardDescription className="text-xs">Which channels should be considered for budget reallocation?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {channels.map((ch) => (
              <div key={ch.id} className="flex items-center space-x-2">
                <Checkbox id={ch.id} defaultChecked />
                <Label htmlFor={ch.id} className="text-sm font-normal cursor-pointer">{ch.label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Key Segments</CardTitle>
            <CardDescription className="text-xs">Which CDP audiences are your priority for this cycle?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {segments.map((seg) => (
              <div key={seg.id} className="flex items-center space-x-2">
                <Checkbox id={seg.id} defaultChecked={seg.id === "high_value" || seg.id === "at_risk"} />
                <Label htmlFor={seg.id} className="text-sm font-normal cursor-pointer">{seg.label}</Label>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Additional Insights & Constraints</CardTitle>
          <CardDescription className="text-xs">Tell the agent about specific business rules, CPA limits, or inventory conditions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="e.g. Total budget cannot exceed £250k. We need to clear summer inventory, so favor campaigns with high immediate conversion rate even if LTV is lower."
            className="min-h-[100px] text-sm resize-none"
            defaultValue="Maximize profit while ensuring overall blended ROAS stays above 4.5x. Avoid spending more than £50K on TikTok as creative is fatigued."
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
