import { ExecutionPreviewPlayer } from "@/components/cdp/chat/execution-preview-player";
import { isNBAActionId } from "@/components/cdp/chat/chat-data";

export default function ChatExecutionPreviewPage({
  searchParams,
}: {
  searchParams?: {
    actionId?: string | string[];
    run?: string | string[];
    experimentId?: string | string[];
  };
}) {
  const actionId =
    typeof searchParams?.actionId === "string" && isNBAActionId(searchParams.actionId)
      ? searchParams.actionId
      : null;
  const runId = typeof searchParams?.run === "string" ? searchParams.run : null;
  const experimentId =
    typeof searchParams?.experimentId === "string" ? searchParams.experimentId : null;

  if (!actionId) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-sm text-slate-500">
        No execution preview is available.
      </div>
    );
  }

  return <ExecutionPreviewPlayer actionId={actionId} runId={runId} experimentId={experimentId} />;
}
