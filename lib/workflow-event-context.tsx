"use client";

import { createContext, useContext, useCallback, useRef, useState } from "react";

type WorkflowEventHandler = (event: string) => void;

export interface WorkflowReplayRequest {
  replayId: string;
  events: string[];
  title?: string;
  targetPath?: string;
}

interface WorkflowEventContextValue {
  emitWorkflowEvent: (event: string) => void;
  setWorkflowEventHandler: (handler: WorkflowEventHandler | null) => void;
  resetDAG: () => void;
  setResetDAGHandler: (handler: (() => void) | null) => void;
  clearWorkflowSession: () => void;
  getWorkflowEvents: () => string[];
  replayWorkflowEvents: (request: WorkflowReplayRequest) => void;
  replayRequest: WorkflowReplayRequest | null;
  getReplayRequest: () => WorkflowReplayRequest | null;
  clearReplayRequest: () => void;
}

const WorkflowEventContext = createContext<WorkflowEventContextValue | undefined>(undefined);

export function WorkflowEventProvider({ children }: { children: React.ReactNode }) {
  const handlerRef = useRef<WorkflowEventHandler | null>(null);
  const resetHandlerRef = useRef<(() => void) | null>(null);
  const [events, setEvents] = useState<string[]>([]);
  const [replayRequest, setReplayRequest] = useState<WorkflowReplayRequest | null>(null);

  const setWorkflowEventHandler = useCallback((handler: WorkflowEventHandler | null) => {
    handlerRef.current = handler;
  }, []);

  const setResetDAGHandler = useCallback((handler: (() => void) | null) => {
    resetHandlerRef.current = handler;
  }, []);

  const emitWorkflowEvent = useCallback((event: string) => {
    // Store the event in history
    setEvents((prev) => {
      const updated = [...prev, event];
      console.log(`[Context] Event emitted: '${event}' - Total events stored: ${updated.length}`, updated);
      return updated;
    });
    // Call the handler if it exists
    if (handlerRef.current) {
      handlerRef.current(event);
    }
  }, []);

  const resetDAG = useCallback(() => {
    // Clear the event history when DAG is reset
    console.log(`[Context] resetDAG called - clearing all events`);
    setEvents([]);
    if (resetHandlerRef.current) {
      resetHandlerRef.current();
    }
  }, []);

  const clearWorkflowSession = useCallback(() => {
    setEvents([]);
    setReplayRequest(null);
    if (resetHandlerRef.current) {
      resetHandlerRef.current();
    }
  }, []);

  const getWorkflowEvents = useCallback(() => {
    console.log(`[Context] getWorkflowEvents called - returning ${events.length} events:`, events);
    return events;
  }, [events]);

  const replayWorkflowEvents = useCallback((request: WorkflowReplayRequest) => {
    setReplayRequest(request);
  }, []);

  const getReplayRequest = useCallback(() => {
    return replayRequest;
  }, [replayRequest]);

  const clearReplayRequest = useCallback(() => {
    setReplayRequest(null);
  }, []);

  return (
    <WorkflowEventContext.Provider
      value={{
        emitWorkflowEvent,
        setWorkflowEventHandler,
        resetDAG,
        setResetDAGHandler,
        clearWorkflowSession,
        getWorkflowEvents,
        replayWorkflowEvents,
        replayRequest,
        getReplayRequest,
        clearReplayRequest,
      }}
    >
      {children}
    </WorkflowEventContext.Provider>
  );
}

export function useWorkflowEvents() {
  const context = useContext(WorkflowEventContext);
  if (!context) {
    throw new Error("useWorkflowEvents must be used within WorkflowEventProvider");
  }
  return context;
}
