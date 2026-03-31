"use client";

import type React from "react";

import { useCallback, useEffect, useState, useRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  type Node,
  type Edge,
  type NodeTypes,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { Download, Clock, User } from "lucide-react";
import { createInitialDAG } from "./utils/dag-workflow";

// Import local components
import { CustomNode } from "./nodes/custom-node";
import { CloudNode } from "./nodes/cloud-node";
import { OnPremNode } from "./nodes/on-prem-node";
import { BackgroundLayer } from "./background/background-layer";
import "./styles/dag-styles.css";

// If you're using shadcn/ui Button, import it from your components
// If not, the component includes a basic button implementation below
import { Button } from "./components/button";
import { useWorkflowEvents } from "@/lib/workflow-event-context";
import { useAuth } from "@/lib/auth-context";
import { hasPermissionForUser } from "@/lib/permissions/roles";
import type { UserPermissionContext } from "@/lib/permissions/roles";
import type { WorkflowEventLog, WorkflowLogExport, UserMetadata } from "./utils/log-export";
import {
  formatRelativeTime,
  formatTimestamp,
  formatDuration,
  extractNodeConnections,
  generateWorkflowExport,
  downloadLogFile,
} from "./utils/log-export";

// Define node types including the new Cloud and On-Prem nodes
const nodeTypes: NodeTypes = {
  custom: CustomNode,
  cloud: CloudNode,
  onprem: OnPremNode,
};

// Helper function to check if we're in browser environment
const isBrowser = () => typeof window !== "undefined";

// Helper for localStorage interaction
const COMPLETED_DAGS_KEY = "kyn_completed_dags";
const hasCompletedDAG = (id: string): boolean => {
  if (!isBrowser()) return false;
  try {
    const stored = localStorage.getItem(COMPLETED_DAGS_KEY);
    if (!stored) return false;
    const completedDAGs = JSON.parse(stored);
    return Array.isArray(completedDAGs) && completedDAGs.includes(id);
  } catch (e) {
    console.error("Error checking completed DAGs:", e);
    return false;
  }
};

const clearDAGMemory = (id: string): void => {
  if (!isBrowser()) return;
  try {
    const stored = localStorage.getItem(COMPLETED_DAGS_KEY);
    if (!stored) return;

    let completedDAGs = JSON.parse(stored);
    if (!Array.isArray(completedDAGs)) return;

    // Remove this ID from the completed list
    completedDAGs = completedDAGs.filter((dagId) => dagId !== id);
    localStorage.setItem(COMPLETED_DAGS_KEY, JSON.stringify(completedDAGs));
    console.log(`Cleared DAG ${id} from completed memory`);
  } catch (e) {
    console.error("Error clearing DAG memory:", e);
  }
};

/**
 * Migrate old omnis completed DAGs to new kyn storage key (one-time operation)
 * Ensures users don't lose their workflow completion history after rebranding
 */
const migrateCompletedDAGsKey = (): void => {
  if (!isBrowser()) return;
  try {
    const OLD_KEY = "omnis_completed_dags";
    const NEW_KEY = COMPLETED_DAGS_KEY;
    
    const oldData = localStorage.getItem(OLD_KEY);
    if (oldData && !localStorage.getItem(NEW_KEY)) {
      localStorage.setItem(NEW_KEY, oldData);
      localStorage.removeItem(OLD_KEY);
      console.log("Migrated completed DAGs from old omnis key to new kyn key");
    }
  } catch (e) {
    console.error("Error migrating completed DAGs key:", e);
  }
};

// Call migration on module load (one-time check)
if (isBrowser()) {
  migrateCompletedDAGsKey();
}

// Define props interface with onDAGComplete callback and message ID
export interface DAGVisualizationProps {
  onDAGComplete?: () => void;
  messageId?: string; // Add messageId to make each DAG unique per chat message
  isMeaslesUseCase?: boolean; // Chat workflow
  isIzuzuUseCase?: boolean;
  isBackToSchoolUseCase?: boolean;
  isMarketingPersonaUseCase?: boolean;
  isDataAdminUseCase?: boolean;
  isServiceAdminUseCase?: boolean;
  isDashboardUseCase?: boolean;
  isReportsUseCase?: boolean;
  isMMMUseCase?: boolean;
  setWorkflowEventHandler?: (handler: ((eventString: string) => void) | null) => void; // Handler setter for chat workflow events
  setResetDAGHandler?: (handler: (() => void) | null) => void; // Handler setter for resetting DAG
}

// Main component with ReactFlowProvider
export function DAGVisualization({
  messageId = "default", // Default ID if none provided
  setWorkflowEventHandler,
  setResetDAGHandler,
}: DAGVisualizationProps = {}) {
  // Generate a unique ID for this DAG instance based on the message ID
  // This ensures each chat message has its own DAG state
  const instanceId = `health_prompt_dag_${messageId}`;

  return (
    <div className="dag-container relative h-full min-h-0 w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm">
      <BackgroundLayer />
      <ReactFlowProvider>
        <DAGFlow
          instanceId={instanceId}
          setWorkflowEventHandler={setWorkflowEventHandler}
          setResetDAGHandler={setResetDAGHandler}
        />
      </ReactFlowProvider>
    </div>
  );
}

// Separate flow component to use ReactFlow hooks
import { getNodeIdForChatEvent } from "./utils/chat-event-node-map";
import { DAG_COLOR_KEY, nodeLibrary, isFlowStepNodeId, buildFlowStepNode } from "./utils/node-library";

function DAGFlow({
  // ...existing code...
    // ...existing code...
  instanceId,
  setWorkflowEventHandler,
  setResetDAGHandler,
}: {
  instanceId: string;
  setWorkflowEventHandler?: (handler: ((eventString: string) => void) | null) => void;
  setResetDAGHandler?: (handler: (() => void) | null) => void;
}) {
  // Auth and user context
  const { user } = useAuth();
  
  // Generate unique workflow ID on mount
  const [workflowId] = useState(() => {
    // Generate UUID v4
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  });
  
  // Store workflow start time
  const [workflowStartTime] = useState(Date.now());
  
  // Store user metadata on mount
  const [userMetadata] = useState<UserMetadata>(() => ({
    username: user?.username || 'anonymous',
    displayName: user?.displayName || 'Anonymous User',
    role: user?.role || 'unknown',
    email: user?.email,
    deniedPermissions: user?.deniedPermissions,
    sessionStart: Date.now(),
  }));
  
  // State for event/node logs with enhanced structure
  const [eventLog, setEventLog] = useState<WorkflowEventLog[]>([]);
  const [showLogDropdown, setShowLogDropdown] = useState<boolean>(false);
  const [exportFormat, setExportFormat] = useState<'json' | 'markdown'>('json');
  
  // State management
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const nodesRef = useRef<Node[]>([]);
  const edgesRef = useRef<Edge[]>([]);
  const branchTailByIdRef = useRef<Record<string, string>>({});
  const branchLaneByIdRef = useRef<Record<string, number>>({});

  // Use the same default distance as between AGENT_START and RECOMMENDATIONS
  const DEFAULT_NODE_DISTANCE = 250 + 300;
  const BRANCH_LANE_GAP = 140;

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  const parsePendingApprovalFlow = (event: string) => {
    if (!event.startsWith("PENDING_APPROVAL_FLOW|")) return null;
    const parts = event.split("|");
    if (parts.length < 3) return null;
    return {
      branchId: parts[1],
      normalizedEvent: parts.slice(2).join("|"),
    };
  };

  const addNodeForWorkflowEvent = (
    eventString: string,
    options?: {
      sourceNodeId?: string | null;
      position?: { x: number; y: number };
    }
  ) => {
    const pendingFlowMeta = parsePendingApprovalFlow(eventString);
    const normalizedEvent = pendingFlowMeta?.normalizedEvent ?? eventString;
    const nodeId = getNodeIdForChatEvent(normalizedEvent);
    const nodeType = nodeId ? nodeId : "placeholder";
    const hasNodeTemplate = Boolean(nodeLibrary[nodeType]);
    const isDynamicFlowStep = Boolean(nodeId && isFlowStepNodeId(nodeId));
    const isPlaceholder = !hasNodeTemplate && !isDynamicFlowStep;
    const customLabel = isPlaceholder ? normalizedEvent : undefined;
    const uniqueId = `${nodeType}-${eventString.replace(/\s+/g, '_')}-${Date.now()}-${Math.random()}`;
    
    const currentNodes = nodesRef.current;
    const lastNode = currentNodes[currentNodes.length - 1];
    const sourceNodeId = pendingFlowMeta
      ? (branchTailByIdRef.current[pendingFlowMeta.branchId] ?? "AGENT_START")
      : (options?.sourceNodeId ?? (lastNode ? lastNode.id : null));
    const sourceNode = sourceNodeId ? currentNodes.find((node) => node.id === sourceNodeId) : lastNode;

    let newPosition = options?.position
      ? options.position
      : sourceNode
        ? { x: sourceNode.position.x + DEFAULT_NODE_DISTANCE, y: sourceNode.position.y }
        : { x: 250, y: 250 };

    if (pendingFlowMeta) {
      if (branchLaneByIdRef.current[pendingFlowMeta.branchId] === undefined) {
        branchLaneByIdRef.current[pendingFlowMeta.branchId] = Object.keys(branchLaneByIdRef.current).length;
      }
      const laneIndex = branchLaneByIdRef.current[pendingFlowMeta.branchId];
      const startNode = currentNodes.find((node) => node.id === "AGENT_START");
      const laneY = (startNode?.position.y ?? 250) + laneIndex * BRANCH_LANE_GAP;
      if (!branchTailByIdRef.current[pendingFlowMeta.branchId]) {
        newPosition = {
          x: (startNode?.position.x ?? 250) + DEFAULT_NODE_DISTANCE,
          y: laneY,
        };
      } else {
        newPosition = {
          x: newPosition.x,
          y: laneY,
        };
      }
    }

    let newNode;
    if (isPlaceholder) {
      console.warn(`[DAG] Unmapped chat event: '${eventString}'. Adding placeholder node.`);
      newNode = {
        ...nodeLibrary["placeholder"],
        id: uniqueId,
        position: newPosition,
        data: {
          ...nodeLibrary["placeholder"].data,
          label: customLabel,
        },
      };
    } else if (isDynamicFlowStep) {
      newNode = {
        ...buildFlowStepNode(normalizedEvent),
        id: uniqueId,
        position: newPosition,
      };
    } else {
      newNode = {
        ...nodeLibrary[nodeType],
        id: uniqueId,
        position: newPosition,
      };
    }

    console.log(`[DAG] Adding node for event: '${eventString}' as nodeId: '${uniqueId}'`);
    setNodes((prevNodes) => [...prevNodes, newNode]);
    nodesRef.current = [...nodesRef.current, newNode];
    if (pendingFlowMeta) {
      branchTailByIdRef.current[pendingFlowMeta.branchId] = uniqueId;
    }

    // Log event and node creation with enhanced metadata
    const timestamp = Date.now();
    setEventLog((prev: WorkflowEventLog[]) => {
      const lastEvent = prev[prev.length - 1];
      const duration = lastEvent ? timestamp - lastEvent.timestamp : undefined;

      return [
        ...prev,
        {
          event: eventString,
          nodeId: uniqueId,
          nodeType,
          timestamp,
          userId: userMetadata.username,
          userName: userMetadata.displayName,
          userRole: userMetadata.role,
          duration,
        },
      ];
    });
    
    // Create edge after we know the source node ID
    setEdges((prevEdges) => {
      if (!sourceNodeId) return prevEdges; // No previous node to connect from
      if (!nodesRef.current.find((node) => node.id === sourceNodeId)) return prevEdges;
      
      const newEdge = {
        id: `e-${sourceNodeId}-${uniqueId}`,
        source: sourceNodeId,
        target: uniqueId,
        animated: false,
        style: isPlaceholder
          ? { stroke: "#FF9800", strokeWidth: 2, opacity: 0.7 }
          : { stroke: "#718096", strokeWidth: 1.5, opacity: 0.7 },
      };
      console.log(`[DAG] Adding edge from '${sourceNodeId}' to '${uniqueId}'`);
      if (prevEdges.find((edge) => edge.id === newEdge.id)) return prevEdges;
      return [...prevEdges, newEdge];
    });

    return uniqueId;
  };

  // Dummy handlers for missing functions
  const onNodeClick = () => {};

          // Expose addNodeForWorkflowEvent as handler for workflow events
          useEffect(() => {
            if (setWorkflowEventHandler) {
              setWorkflowEventHandler(addNodeForWorkflowEvent);
            }
            return () => {
              setWorkflowEventHandler?.(null);
            };
          }, [setWorkflowEventHandler, addNodeForWorkflowEvent]);

  // Replay stored workflow events when DAG mounts
  const { getWorkflowEvents, replayRequest, clearReplayRequest } = useWorkflowEvents();
  const hasReplayedRef = useRef(false);
  useEffect(() => {
    if (hasReplayedRef.current) return;
    hasReplayedRef.current = true;
    console.log(`[DAG] Replay effect running on mount`);
    const storedEvents = getWorkflowEvents();
    console.log(`[DAG] Retrieved ${storedEvents.length} stored events:`, storedEvents);
    if (storedEvents.length > 0) {
      console.log(`[DAG] Starting replay of ${storedEvents.length} events`);
      // Use a small delay to ensure initial nodes are set
      setTimeout(() => {
        storedEvents.forEach((event, index) => {
          console.log(`[DAG] Replaying event ${index + 1}/${storedEvents.length}: '${event}'`);
          addNodeForWorkflowEvent(event);
        });
      }, 100);
    } else {
      console.log(`[DAG] No stored events to replay`);
    }
  }, []);

  const handledReplayIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!replayRequest) return;
    if (replayRequest.targetPath) {
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (!currentPath.startsWith(replayRequest.targetPath)) {
        return;
      }
    }
    if (handledReplayIdRef.current === replayRequest.replayId) return;

    handledReplayIdRef.current = replayRequest.replayId;

    setTimeout(() => {
      const startNode = nodes.find((node) => node.id === "AGENT_START");
      const startX = startNode?.position.x ?? 250;
      const startY = startNode?.position.y ?? 250;

      let previousNodeId: string = "AGENT_START";
      replayRequest.events.forEach((event, index) => {
        setTimeout(() => {
          const nextNodeId = addNodeForWorkflowEvent(event, {
            sourceNodeId: previousNodeId,
            position:
              previousNodeId === "AGENT_START"
                ? {
                    x: startX + DEFAULT_NODE_DISTANCE,
                    y: startY,
                  }
                : undefined,
          });
          if (nextNodeId) {
            previousNodeId = nextNodeId;
          }
        }, index * 80);
      });
    }, 100);

    clearReplayRequest();
  }, [clearReplayRequest, replayRequest, nodes]);

  // Dynamic DAG data loading based on use case
  // Use new workflow logic: only show AGENT_START node initially

  // On mount, set initial nodes/edges if DAG not completed
  useEffect(() => {
    if (!hasCompletedDAG(instanceId)) {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [instanceId]);

  // DAG initialization logic
  const initialPosition = { x: 250, y: 250 };
  const initialDAG = createInitialDAG(initialPosition);
  const initialNodes: Node[] = initialDAG.nodes;
  const initialEdges: Edge[] = initialDAG.edges;

  // Generate export data for download
  const generateExportData = useCallback((): WorkflowLogExport => {
    const getChatTranscript = (): WorkflowLogExport["chatTranscript"] => {
      if (typeof window === "undefined") return [];

      try {
        const raw = window.sessionStorage.getItem("kyn-chat-history");
        if (!raw) return [];

        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed
          .filter(
            (message): message is {
              role: "user" | "assistant";
              content: string;
              timestamp?: string | number;
              sourceTag?: string;
              warningActionId?: string;
            } =>
              typeof message === "object" &&
              message !== null &&
              "role" in message &&
              "content" in message &&
              (message as { role?: unknown }).role !== undefined &&
              ((message as { role?: unknown }).role === "user" || (message as { role?: unknown }).role === "assistant") &&
              typeof (message as { content?: unknown }).content === "string",
          )
          .map((message) => {
            const normalizedTimestamp =
              typeof message.timestamp === "number"
                ? message.timestamp
                : Date.parse(String(message.timestamp ?? ""));

            return {
              role: message.role,
              content: message.content.trim(),
              timestamp: Number.isFinite(normalizedTimestamp) ? normalizedTimestamp : Date.now(),
              sourceTag: typeof message.sourceTag === "string" ? message.sourceTag : undefined,
              warningActionId:
                typeof message.warningActionId === "string" ? message.warningActionId : undefined,
            };
          })
          .filter((message) => message.content.length > 0);
      } catch {
        return [];
      }
    };

    const now = Date.now();
    const metadata = {
      workflowId,
      startTime: workflowStartTime,
      endTime: now,
      duration: now - workflowStartTime,
      totalEvents: eventLog.length,
      totalNodes: nodes.length,
      totalEdges: edges.length,
    };

    const dagSnapshot = {
      nodes,
      edges,
      nodeConnections: extractNodeConnections(edges),
    };

    const permissionUser: UserPermissionContext | null = user
      ? {
          role: user.role,
          deniedPermissions: user.deniedPermissions,
        }
      : null;

    const permissions = {
      role: userMetadata.role,
      canExportLogs: true, // All users can export logs
      canExecuteAIActions: permissionUser
        ? hasPermissionForUser(permissionUser, 'ai_action_execute')
        : false,
      canApproveReviewActions: permissionUser
        ? hasPermissionForUser(permissionUser, 'action_approve_review')
        : false,
      canMonitorWorkflow: permissionUser
        ? hasPermissionForUser(permissionUser, 'workflow_monitor')
        : false,
    };

    return {
      metadata,
      user: userMetadata,
      events: eventLog,
      chatTranscript: getChatTranscript(),
      dagSnapshot,
      permissions,
      exportedAt: now,
      exportedBy: userMetadata.displayName,
    };
  }, [workflowId, workflowStartTime, eventLog, nodes, edges, userMetadata]);

  // Handle log download
  const handleDownloadLog = useCallback(() => {
    const exportData = generateExportData();
    const { content, filename, mimeType } = generateWorkflowExport(exportData, exportFormat);
    downloadLogFile(content, filename, mimeType);
    console.log(`[DAG] Downloaded workflow log as ${exportFormat}: ${filename}`);
  }, [generateExportData, exportFormat]);

  const handleClearChat = useCallback(() => {
    const initial = createInitialDAG({ x: 250, y: 250 });
    setNodes(initial.nodes);
    setEdges(initial.edges);
    setEventLog([]); // Clear event log on reset
    branchTailByIdRef.current = {};
    branchLaneByIdRef.current = {};
    clearDAGMemory(instanceId);
  }, [instanceId, setNodes, setEdges]);

  // Expose resetDAG handler for clearing from chat
  useEffect(() => {
    if (setResetDAGHandler) {
      setResetDAGHandler(handleClearChat);
    }
    return () => {
      setResetDAGHandler?.(null);
    };
  }, [setResetDAGHandler, handleClearChat]);

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView={false}
        minZoom={0.1}
        maxZoom={4}
        defaultViewport={{ x: 250, y: 250, zoom: 0.3 }}
        proOptions={{
          hideAttribution: true,
        }}
        className="rounded-lg react-flow-wrapper"
        zoomOnScroll={true}
        zoomOnPinch={true}
        panOnScroll={false}
        panOnDrag={true}
        elementsSelectable={true}
        nodesConnectable={false}
        nodesDraggable={false}
        onNodeClick={onNodeClick}
      >
        <Background color="rgba(0, 0, 0, 0.01)" gap={20} size={1} />
        <Controls className="bg-white text-gray-700" showInteractive={true} />
        <Panel position="top-right" className="z-[110] flex gap-2">
                  <div style={{ position: 'relative' }}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1 shadow-sm"
                      onClick={() => setShowLogDropdown((v: boolean) => !v)}
                      style={{ minWidth: 90 }}
                    >
                      {showLogDropdown ? 'Hide Log' : 'Show Log'}
                    </Button>
                    {showLogDropdown && (
                      <div
                        className="fixed inset-x-2 top-14 bottom-24 z-[120] flex min-h-0 flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-auto sm:top-8 sm:right-0 sm:h-[min(80vh,520px)] sm:min-h-[420px] sm:w-[420px] sm:max-w-[85vw] sm:bottom-auto"
                      >
                        {/* Header */}
                        <div style={{ 
                          padding: '12px 16px', 
                          borderBottom: '1px solid #e5e7eb',
                          background: 'linear-gradient(to right, #f9fafb, #ffffff)'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 8 }}>
                            <div style={{ fontWeight: 'bold', fontSize: 15 }}>
                              Workflow Event Log
                            </div>
                            {eventLog.length > 0 && (
                              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                <select
                                  value={exportFormat}
                                  onChange={(e) => setExportFormat(e.target.value as 'json' | 'markdown')}
                                  style={{
                                    fontSize: 11,
                                    padding: '3px 6px',
                                    borderRadius: 4,
                                    border: '1px solid #d1d5db',
                                    background: '#fff',
                                    width: 96,
                                    minWidth: 96
                                  }}
                                >
                                  <option value="json">JSON</option>
                                  <option value="markdown">Markdown</option>
                                </select>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-1.5 text-xs"
                                  onClick={handleDownloadLog}
                                >
                                  <Download className="h-3.5 w-3.5" />
                                  Export
                                </Button>
                              </div>
                            )}
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280', fontFamily: 'monospace' }}>
                            ID: {workflowId.split('-')[0]}...
                          </div>
                        </div>

                        {/* User Info Section */}
                        <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', background: '#fafafa' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <User className="h-3.5 w-3.5 text-slate-500" />
                            <span style={{ fontSize: 12, fontWeight: 600 }}>{userMetadata.displayName}</span>
                            <span style={{ 
                              fontSize: 10, 
                              padding: '2px 6px', 
                              borderRadius: 4, 
                              background:
                                userMetadata.role === 'super_admin'
                                  ? '#fee2e2'
                                  : userMetadata.role === 'data_admin'
                                  ? '#dbeafe'
                                  : '#fef3c7',
                              color:
                                userMetadata.role === 'super_admin'
                                  ? '#991b1b'
                                  : userMetadata.role === 'data_admin'
                                  ? '#1e40af'
                                  : '#92400e',
                              fontWeight: 600
                            }}>
                              {userMetadata.role.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          <div style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Clock className="h-3 w-3" />
                            Session: {formatDuration(Date.now() - workflowStartTime)}
                          </div>
                        </div>

                        {/* Stats Section */}
                        <div style={{ 
                          padding: '10px 16px', 
                          borderBottom: '1px solid #e5e7eb',
                          display: 'flex',
                          justifyContent: 'space-around',
                          background: '#f9fafb'
                        }}>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>{eventLog.length}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>Events</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>{nodes.length}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>Nodes</div>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: 16, fontWeight: 'bold', color: '#1f2937' }}>{edges.length}</div>
                            <div style={{ fontSize: 10, color: '#6b7280' }}>Edges</div>
                          </div>
                        </div>

                        {/* Events List */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px', paddingBottom: 16, scrollPaddingBottom: 16, minHeight: 0 }}>
                          {eventLog.length === 0 ? (
                            <div style={{ color: '#9ca3af', textAlign: 'center', padding: '20px 0', fontSize: 13 }}>
                              No events yet. Start a conversation to see workflow events.
                            </div>
                          ) : (
                            <div>
                              <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
                                EVENT TIMELINE
                              </div>
                              <ul style={{ fontSize: 12, margin: 0, padding: 0, listStyle: 'none' }}>
                                {eventLog.slice().reverse().map((log, idx) => (
                                  <li 
                                    key={log.nodeId} 
                                    style={{ 
                                      marginBottom: 10, 
                                      borderLeft: '2px solid #e5e7eb', 
                                      paddingLeft: 10,
                                      paddingBottom: 10,
                                      position: 'relative'
                                    }}
                                  >
                                    <div style={{ 
                                      position: 'absolute', 
                                      left: -5, 
                                      top: 0, 
                                      width: 8, 
                                      height: 8, 
                                      borderRadius: '50%', 
                                      background: idx === 0 ? '#10b981' : '#e5e7eb' 
                                    }} />
                                    <div style={{ fontWeight: 600, color: '#1f2937', marginBottom: 3 }}>
                                      {log.event}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 2 }}>
                                      Node: <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{log.nodeType}</span>
                                    </div>
                                    <div style={{ fontSize: 10, color: '#9ca3af', display: 'flex', gap: 8 }}>
                                      <span title={formatTimestamp(log.timestamp)}>
                                        {formatRelativeTime(log.timestamp)}
                                      </span>
                                      {log.duration && (
                                        <span>• {formatDuration(log.duration)} since prev</span>
                                      )}
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
        </Panel>

      </ReactFlow>
      </div>
      <div className="sticky bottom-0 z-20 shrink-0 border-t border-slate-200 bg-white/95 px-3 py-2.5 backdrop-blur-sm">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-600">Workflow Color Key</div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {DAG_COLOR_KEY.map((item) => (
            <div
              key={item.label}
              className="rounded border border-slate-200 bg-white px-2 py-1.5"
            >
              <div className="inline-flex items-center gap-1.5">
                <span
                  className="h-3 w-3 shrink-0 rounded-full border border-slate-300"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[11px] font-semibold leading-none text-slate-700">{item.label}</span>
              </div>
              <div className="mt-1 text-[10px] leading-snug text-slate-500">{item.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
