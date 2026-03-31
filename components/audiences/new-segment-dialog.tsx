"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function estimatedReach(channel: string, ltv: string, freq: string): string {
  const base = 14200;
  const channelFactor: Record<string, number> = { all: 1, email: 0.62, search: 0.41, social: 0.54, direct: 0.28 };
  const ltvFactor: Record<string, number> = { any: 1, low: 0.48, mid: 0.32, high: 0.18 };
  const freqFactor: Record<string, number> = { any: 1, "1-2": 0.52, "3-5": 0.31, "6+": 0.12 };
  const n = Math.round(base * (channelFactor[channel] ?? 1) * (ltvFactor[ltv] ?? 1) * (freqFactor[freq] ?? 1));
  return `~${n.toLocaleString("en-GB")} profiles`;
}

export function NewSegmentDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [channel, setChannel] = useState("all");
  const [ltv, setLtv] = useState("any");
  const [freq, setFreq] = useState("any");

  useEffect(() => {
    if (!open) return;
    setName("");
    setDescription("");
    setChannel("all");
    setLtv("any");
    setFreq("any");
  }, [open]);

  const reach = estimatedReach(channel, ltv, freq);
  const canSubmit = name.trim().length > 0;

  const handleCreate = () => {
    if (!canSubmit) return;
    toast.success("Segment created", {
      description: `"${name.trim()}" is now available for activation in campaigns.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Segment</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-1">
          <div className="grid gap-2">
            <Label htmlFor="seg-name">Segment name</Label>
            <Input
              id="seg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High-Value Email Responders"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="seg-desc">Description</Label>
            <Textarea
              id="seg-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the intent and criteria for this segment"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-2">
              <Label>Channel</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="search">Search</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>LTV range</Label>
              <Select value={ltv} onValueChange={setLtv}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="low">£0 – £200</SelectItem>
                  <SelectItem value="mid">£200 – £500</SelectItem>
                  <SelectItem value="high">£500+</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Purchase freq.</Label>
              <Select value={freq} onValueChange={setFreq}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1-2">1–2 orders</SelectItem>
                  <SelectItem value="3-5">3–5 orders</SelectItem>
                  <SelectItem value="6+">6+ orders</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Estimated reach</span>
            <span className="text-sm font-semibold text-slate-800">{reach}</span>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!canSubmit} onClick={handleCreate}>
            Create segment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
