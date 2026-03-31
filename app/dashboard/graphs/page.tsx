"use client";

import { useState } from "react";
import { GraphInstanceDialog } from "@/components/knowledge-graph/graph-instance-dialog";
import { SavedGraphLibrary } from "@/components/knowledge-graph/saved-graph-instances";

export default function SavedGraphsPage() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <SavedGraphLibrary onCreateRequest={() => setDialogOpen(true)} />
      <GraphInstanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        source="control_tower"
      />
    </>
  );
}
