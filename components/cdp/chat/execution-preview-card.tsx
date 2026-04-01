"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, PlayCircle } from "lucide-react";

export function ExecutionPreviewCard({
  title,
  iframeSrc,
}: {
  title: string;
  iframeSrc: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-stone-200 bg-stone-50/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <PlayCircle className="h-4 w-4 text-sky-600" />
          <div>
            <p className="text-xs font-semibold text-stone-800">Execution Preview</p>
            <p className="text-[11px] text-stone-500">{title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-sky-200 bg-sky-50 text-[10px] text-sky-700">
            Demo simulation
          </Badge>
          <Link
            href={iframeSrc}
            target="_blank"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-500 transition hover:text-stone-800"
          >
            Open
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>

      <div className="bg-stone-100 p-2">
        <iframe
          title={`${title} execution preview`}
          src={iframeSrc}
          className="h-[430px] w-full rounded-xl border border-stone-200 bg-white"
          sandbox="allow-same-origin allow-scripts"
          loading="lazy"
        />
      </div>
    </div>
  );
}
