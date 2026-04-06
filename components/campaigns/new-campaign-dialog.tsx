"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewCampaignDialog({
  open,
  onOpenChange,
  defaultName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultName?: string;
}) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [audience, setAudience] = useState("");
  const [goal, setGoal] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(defaultName ?? "");
    setChannel("");
    setBudget("");
    setStartDate("");
    setEndDate("");
    setAudience("");
    setGoal("");
  }, [open]);

  const canSubmit = name.trim() && channel && budget && goal;

  const handleCreate = () => {
    if (!canSubmit) return;
    toast.success("Campaign created", {
      description: `"${name.trim()}" has been queued for review and activation.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="camp-name">Campaign name</Label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Spring Sale 2026 — UK"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google-pmax">Google PMAX</SelectItem>
                  <SelectItem value="facebook">Facebook Ads</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="snapchat">Snapchat</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="multi">Multi-channel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="camp-budget">Budget (£)</Label>
              <Input
                id="camp-budget"
                type="number"
                min={0}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="camp-start">Start date</Label>
              <Input
                id="camp-start"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="camp-end">End date</Label>
              <Input
                id="camp-end"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Audience segment</Label>
              <Select value={audience} onValueChange={setAudience}>
                <SelectTrigger>
                  <SelectValue placeholder="Select audience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All customers</SelectItem>
                  <SelectItem value="high-value">High Value</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="dormant">Dormant</SelectItem>
                  <SelectItem value="new">New Customers</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Goal</Label>
              <Select value={goal} onValueChange={setGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Select goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conversions">Conversions</SelectItem>
                  <SelectItem value="brand">Brand Awareness</SelectItem>
                  <SelectItem value="retargeting">Retargeting</SelectItem>
                  <SelectItem value="prospecting">Prospecting</SelectItem>
                  <SelectItem value="retention">Retention</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={handleCreate}>
            Create campaign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
