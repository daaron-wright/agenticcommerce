import type { Node, Edge } from "reactflow";

export interface WorkflowEventLog {
  event: string;
  nodeId: string;
  nodeType: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  userRole?: string;
  duration?: number; // Time since previous event in ms
}

export interface WorkflowMetadata {
  workflowId: string;
  startTime: number;
  endTime: number;
  duration: number;
  totalEvents: number;
  totalNodes: number;
  totalEdges: number;
}

export interface UserMetadata {
  username: string;
  displayName: string;
  role: string;
  email?: string;
  deniedPermissions?: string[];
  sessionStart: number;
}

export interface WorkflowLogExport {
  metadata: WorkflowMetadata;
  user: UserMetadata;
  events: WorkflowEventLog[];
  chatTranscript?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: number;
    sourceTag?: string;
    warningActionId?: string;
  }>;
  dagSnapshot: {
    nodes: Node[];
    edges: Edge[];
    nodeConnections: Array<{
      from: string;
      to: string;
      edgeId: string;
    }>;
  };
  permissions: {
    role: string;
    canExportLogs: boolean;              // All users can export logs
    canExecuteAIActions: boolean;        // Can execute AI-generated recommendations
    canApproveReviewActions: boolean;    // Can approve actions sent for review
    canMonitorWorkflow: boolean;
  };
  exportedAt: number;
  exportedBy: string;
}

/**
 * Format timestamp to human-readable date/time
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Format duration in milliseconds to human-readable format
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

/**
 * Format relative time (e.g., "2m ago", "just now")
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 10) return `${seconds}s ago`;
  return 'just now';
}

/**
 * Extract node connections from edges in a readable format
 */
export function extractNodeConnections(edges: Edge[]): Array<{
  from: string;
  to: string;
  edgeId: string;
}> {
  return edges.map((edge) => ({
    from: edge.source,
    to: edge.target,
    edgeId: edge.id,
  }));
}

/**
 * Export workflow log data as JSON string
 */
export function exportAsJSON(data: WorkflowLogExport): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Export workflow log data as Markdown string
 */
export function exportAsMarkdown(data: WorkflowLogExport): string {
  const { metadata, user, events, chatTranscript, dagSnapshot, permissions, exportedAt, exportedBy } = data;

  let markdown = `# Kyndryl Unified CDP Workflow Log Export\n\n`;
  markdown += `**Exported:** ${formatTimestamp(exportedAt)} by ${exportedBy}\n\n`;
  markdown += `---\n\n`;

  // User Information
  markdown += `## User Information\n\n`;
  markdown += `- **Name:** ${user.displayName}\n`;
  markdown += `- **Username:** ${user.username}\n`;
  markdown += `- **Role:** ${user.role}\n`;
  if (user.email) {
    markdown += `- **Email:** ${user.email}\n`;
  }
  markdown += `- **Session Start:** ${formatTimestamp(user.sessionStart)}\n\n`;

  // Permissions
  markdown += `## Permissions\n\n`;
  markdown += `- **Role:** ${permissions.role}\n`;
  markdown += `- **Can Export Logs:** ${permissions.canExportLogs ? '✅' : '❌'}\n`;
  markdown += `- **Can Execute AI Actions:** ${permissions.canExecuteAIActions ? '✅' : '❌'}\n`;
  markdown += `- **Can Approve Review Actions:** ${permissions.canApproveReviewActions ? '✅' : '❌'}\n`;
  markdown += `- **Can Monitor Workflows:** ${permissions.canMonitorWorkflow ? '✅' : '❌'}\n\n`;

  // Workflow Summary
  markdown += `## Workflow Summary\n\n`;
  markdown += `- **Workflow ID:** \`${metadata.workflowId}\`\n`;
  markdown += `- **Start Time:** ${formatTimestamp(metadata.startTime)}\n`;
  markdown += `- **End Time:** ${formatTimestamp(metadata.endTime)}\n`;
  markdown += `- **Duration:** ${formatDuration(metadata.duration)}\n`;
  markdown += `- **Total Events:** ${metadata.totalEvents}\n`;
  markdown += `- **Total Nodes:** ${metadata.totalNodes}\n`;
  markdown += `- **Total Edges:** ${metadata.totalEdges}\n\n`;

  // Event Log
  markdown += `## Event Log\n\n`;
  markdown += `| Time | Event | Node Type | Duration Since Previous |\n`;
  markdown += `|------|-------|-----------|------------------------|\n`;

  events.forEach((event) => {
    const time = formatTimestamp(event.timestamp);
    const duration = event.duration ? formatDuration(event.duration) : 'N/A';
    markdown += `| ${time} | ${event.event} | ${event.nodeType} | ${duration} |\n`;
  });

  markdown += `\n`;

  // Chat Interactions
  markdown += `## Chat Interactions\n\n`;
  if (chatTranscript && chatTranscript.length > 0) {
    chatTranscript.forEach((message, idx) => {
      const roleLabel = message.role === "user" ? "User" : "Assistant";
      markdown += `### ${idx + 1}. ${roleLabel} (${formatTimestamp(message.timestamp)})\n\n`;
      if (message.sourceTag) {
        markdown += `- **Source Tag:** ${message.sourceTag}\n`;
      }
      if (message.warningActionId) {
        markdown += `- **Warning Action ID:** ${message.warningActionId}\n`;
      }
      if (message.sourceTag || message.warningActionId) {
        markdown += `\n`;
      }
      markdown += `${message.content}\n\n`;
    });
  } else {
    markdown += `_No chat interactions available for this session._\n\n`;
  }

  // DAG Node Connections
  markdown += `## DAG Node Connections\n\n`;
  markdown += `The workflow graph consists of ${dagSnapshot.nodeConnections.length} connections:\n\n`;
  
  if (dagSnapshot.nodeConnections.length > 0) {
    markdown += `| From | To | Edge ID |\n`;
    markdown += `|------|----|---------|\n`;
    dagSnapshot.nodeConnections.forEach((conn) => {
      markdown += `| ${conn.from} | ${conn.to} | \`${conn.edgeId}\` |\n`;
    });
  } else {
    markdown += `_No connections established yet._\n`;
  }

  markdown += `\n`;

  // Node Details
  markdown += `## Node Details\n\n`;
  markdown += `Total nodes in DAG: ${dagSnapshot.nodes.length}\n\n`;
  
  dagSnapshot.nodes.forEach((node, idx) => {
    markdown += `### ${idx + 1}. ${node.id}\n\n`;
    markdown += `- **Type:** ${node.type || 'default'}\n`;
    markdown += `- **Position:** (${Math.round(node.position.x)}, ${Math.round(node.position.y)})\n`;
    if (node.data?.label) {
      markdown += `- **Label:** ${node.data.label}\n`;
    }
    markdown += `\n`;
  });

  markdown += `---\n\n`;
  markdown += `_Generated by Kyndryl Unified CDP_\n`;

  return markdown;
}

/**
 * Download log data as a file
 */
export function downloadLogFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate a workflow export with the specified format
 */
export function generateWorkflowExport(
  data: WorkflowLogExport,
  format: 'json' | 'markdown'
): { content: string; filename: string; mimeType: string } {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const workflowIdShort = data.metadata.workflowId.split('-')[0];

  if (format === 'json') {
    return {
      content: exportAsJSON(data),
      filename: `workflow-${workflowIdShort}-${timestamp}.json`,
      mimeType: 'application/json',
    };
  } else {
    return {
      content: exportAsMarkdown(data),
      filename: `workflow-${workflowIdShort}-${timestamp}.md`,
      mimeType: 'text/markdown',
    };
  }
}
