"use client"
import { memo, useEffect, useState, useRef } from "react"
import { Handle, type NodeProps, Position } from "reactflow"
import {
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cloud,
  ChevronDown,
  ChevronUp,
  Clock,
  Settings,
  Database,
  FileText,
} from "lucide-react"
import { GlowEffect } from "../components/glow-effect"
import { ScrollableContent } from "../components/scrollable-content"

// Cloud node component with a glow border effect and expandable details
export const CloudNode = memo(({ data, isConnectable, id }: NodeProps) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const progressRef = useRef<number | null>(null)
  const baseColor = data.color || "#3b82f6" // Default to blue for cloud nodes

  // Generate a darker shade for borders
  const darkerColor = (() => {
    // Convert hex to RGB
    const r = Number.parseInt(baseColor.slice(1, 3), 16)
    const g = Number.parseInt(baseColor.slice(3, 5), 16)
    const b = Number.parseInt(baseColor.slice(5, 7), 16)

    // Darken by 15%
    const darkerR = Math.max(0, r - 30)
    const darkerG = Math.max(0, g - 30)
    const darkerB = Math.max(0, b - 30)

    // Convert back to hex
    return `#${darkerR.toString(16).padStart(2, "0")}${darkerG.toString(16).padStart(2, "0")}${darkerB.toString(16).padStart(2, "0")}`
  })()

  // Generate a lighter shade for highlights
  const lighterColor = (() => {
    // Convert hex to RGB
    const r = Number.parseInt(baseColor.slice(1, 3), 16)
    const g = Number.parseInt(baseColor.slice(3, 5), 16)
    const b = Number.parseInt(baseColor.slice(5, 7), 16)

    // Lighten by 20%
    const lighterR = Math.min(255, r + 40)
    const lighterG = Math.min(255, g + 40)
    const lighterB = Math.min(255, b + 40)

    // Convert back to hex
    return `#${lighterR.toString(16).padStart(2, "0")}${lighterG.toString(16).padStart(2, "0")}${lighterB.toString(16).padStart(2, "0")}`
  })()

  // Generate glow colors based on the base color
  const glowColors = [
    baseColor,
    lighterColor,
    "#60a5fa", // blue-400
    "#3b82f6", // blue-500
    "#2563eb", // blue-600
  ]

  useEffect(() => {
    // Animate node appearance
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  // Optimize the useEffect for progress updates to reduce layout thrashing
  useEffect(() => {
    // Clear any existing animation frame
    if (progressRef.current) {
      cancelAnimationFrame(progressRef.current)
      progressRef.current = null
    }

    if (data.processingState === "processing") {
      setProgress(0) // Reset progress when starting

      // Use RAF instead of setInterval for smoother animation
      const startTime = Date.now()
      const duration = data.processingTime * 1000

      const updateProgress = () => {
        const elapsed = Date.now() - startTime
        const newProgress = Math.min(100, (elapsed / duration) * 100)

        setProgress(newProgress)

        if (newProgress < 100) {
          progressRef.current = requestAnimationFrame(updateProgress)
        } else {
          progressRef.current = null
        }
      }

      progressRef.current = requestAnimationFrame(updateProgress)
    } else if (data.processingState === "completed") {
      setProgress(100)
    } else {
      setProgress(0)
    }

    // Cleanup on unmount or state change
    return () => {
      if (progressRef.current) {
        cancelAnimationFrame(progressRef.current)
        progressRef.current = null
      }
    }
  }, [data.processingState, data.processingTime])

  // Get status icon based on processing state
  const statusIcon = (() => {
    switch (data.processingState) {
      case "processing":
        return <Loader2 size={14} className="animate-spin text-blue-500" />
      case "completed":
        return <CheckCircle2 size={14} className="text-green-500" />
      case "error":
        return <AlertCircle size={14} className="text-red-500" />
      default:
        return null
    }
  })()

  // Get status color based on processing state
  const getStatusColor = () => {
    switch (data.processingState) {
      case "processing":
        return baseColor
      case "completed":
        return "#10b981" // Green
      case "error":
        return "#ef4444" // Red
      default:
        return "transparent"
    }
  }

  // Get status text based on processing state
  const getStatusText = () => {
    switch (data.processingState) {
      case "processing":
        return "Active"
      case "completed":
        return "Completed"
      case "error":
        return "Error"
      default:
        return "Idle"
    }
  }

  // Toggle expanded section
  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null)
    } else {
      setExpandedSection(section)
    }
  }

  // Mock data for expanded sections
  const mockInputSchema = {
    type: "object",
    properties: {
      query: { type: "string" },
      parameters: { type: "object" },
      timestamp: { type: "string", format: "date-time" },
    },
    required: ["query"],
  }

  const mockOutputSchema = {
    type: "object",
    properties: {
      results: { type: "array" },
      metadata: { type: "object" },
      status: { type: "string" },
    },
    required: ["results", "status"],
  }

  const mockLogs = [
    { timestamp: "2025-04-30T14:32:15Z", level: "INFO", message: "Cloud process started" },
    { timestamp: "2025-04-30T14:32:16Z", level: "INFO", message: "Initializing cloud resources" },
    { timestamp: "2025-04-30T14:32:18Z", level: "INFO", message: "Fetching data from cloud storage" },
    { timestamp: "2025-04-30T14:32:20Z", level: "WARN", message: "High latency detected in cloud region" },
    { timestamp: "2025-04-30T14:32:22Z", level: "INFO", message: "Cloud process completed successfully" },
  ]

  const mockConfig = {
    version: "2.0.1",
    region: "us-east-1",
    instanceType: "c5.large",
    timeout: "45s",
    lastModified: "2025-04-29T10:22:18Z",
  }

  // Format timestamp to readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const inputSchema = data.inputSchema || mockInputSchema
  const outputSchema = data.outputSchema || mockOutputSchema
  const logs = data.logs || mockLogs

  return (
    <div
      className={`group transition-opacity duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
      style={{
        minWidth: "240px",
        maxWidth: isExpanded ? "400px" : "300px", // Wider when expanded
        cursor: "pointer",
        transform: "translate3d(0,0,0)", // Force hardware acceleration
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Main node container with glow border effect */}
      <div
        className={`relative isolate overflow-hidden rounded-lg transition-all duration-300 ${isExpanded ? "shadow-lg" : ""}`}
        style={{
          background: `linear-gradient(145deg, ${lighterColor}15, ${baseColor}25)`,
          backdropFilter: "blur(8px)",
          padding: "2px", // Space for the glow border
        }}
      >
        {/* Glow border effect */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <GlowEffect
            colors={glowColors}
            mode="flowHorizontal"
            blur="soft"
            scale={1.05}
            duration={8}
            className="opacity-80"
          />
        </div>

        {/* Inner content container */}
        <div className="relative z-10 rounded-lg overflow-hidden bg-white bg-opacity-90">
          {/* Color bar at top */}
          <div
            className="h-1.5 w-full"
            style={{
              background: `linear-gradient(to right, ${darkerColor}, ${baseColor})`,
            }}
          />

          {/* Processing progress bar */}
          {data.processingState === "processing" && (
            <div className="h-1 w-full bg-gray-200">
              <div
                className="h-full"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(to right, ${lighterColor}, ${baseColor})`,
                }}
              />
            </div>
          )}

          {/* Content container */}
          <div className="relative z-10 p-4">
            {/* Cloud icon in top-left corner */}
            <div className="absolute left-3 top-3">
              <Cloud
                size={18}
                className="text-blue-400"
                style={{
                  filter: "drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))",
                }}
              />
            </div>

            {/* Header with improved typography - moved to right to accommodate icon */}
            <div className="mb-2 flex items-center justify-between pl-7">
              <div className="flex items-center">
                <div
                  className="mr-3 flex h-7 w-7 items-center justify-center rounded-md"
                  style={{
                    background:
                      data.processingState === "processing"
                        ? `linear-gradient(135deg, ${baseColor}, ${darkerColor})`
                        : data.processingState === "completed"
                          ? "linear-gradient(135deg, #059669, #10b981)"
                          : `linear-gradient(135deg, ${baseColor}, ${darkerColor})`,
                    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1), 0 0 0 1px ${
                      data.processingState === "completed" ? "#059669" : baseColor
                    }50`,
                  }}
                >
                  <div
                    className="h-3 w-3 rounded-sm"
                    style={{
                      background: data.processingState === "completed" ? "#ecfdf5" : lighterColor,
                      boxShadow: `0 0 4px ${data.processingState === "completed" ? "#ecfdf5" : lighterColor}80`,
                    }}
                  />
                </div>
                <div
                  className="text-sm font-semibold"
                  style={{
                    color: data.processingState === "completed" ? "#059669" : baseColor,
                  }}
                >
                  {data.label}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {statusIcon}
                {isExpanded ? (
                  <ChevronUp size={16} style={{ color: baseColor }} />
                ) : (
                  <ChevronRight size={16} className="opacity-0 group-hover:opacity-50" style={{ color: baseColor }} />
                )}
              </div>
            </div>

            {/* Description with improved styling */}
            {data.description && (
              <div
                className={`mt-2 text-xs font-medium leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}
                style={{ color: `${darkerColor}dd` }}
              >
                {data.description}
              </div>
            )}

            {/* Details with improved styling */}
            {(data.showLabel || isExpanded) && data.details && (
              <div className="mt-2.5 space-y-1">
                {data.details.map((detail: string, index: number) => (
                  <div key={index} className="flex items-start text-xs" style={{ color: `${darkerColor}cc` }}>
                    <span
                      className="mr-1.5 mt-1 h-1 w-1 flex-shrink-0 rounded-full"
                      style={{
                        backgroundColor: data.processingState === "completed" ? "#059669" : baseColor,
                      }}
                    ></span>
                    <span className="font-medium">{detail}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Metrics with enhanced presentation */}
            {(data.showLabel || isExpanded) && data.metrics && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {Object.entries(data.metrics).map(([key, value]) => (
                  <div
                    key={key}
                    className="overflow-hidden rounded-md"
                    style={{
                      background: `linear-gradient(to bottom, ${baseColor}10, ${baseColor}20)`,
                      boxShadow: `0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px ${baseColor}20`,
                    }}
                  >
                    <div
                      className="px-2 py-1 text-xs font-medium"
                      style={{
                        background: `${baseColor}30`,
                        color: darkerColor,
                      }}
                    >
                      {key}
                    </div>
                    <div
                      className="px-2 py-1.5 text-sm font-bold"
                      style={{
                        color: data.processingState === "completed" ? "#059669" : baseColor,
                      }}
                    >
                      {value as string}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Processing time indicator */}
            {(data.showLabel || isExpanded) && data.processingTime && (
              <div className="mt-2 flex items-center justify-end">
                <div className="text-xs" style={{ color: `${darkerColor}99` }}>
                  Processing time: {data.processingTime}s
                </div>
              </div>
            )}

            {/* Expanded details */}
            {isExpanded && (
              <div className="mt-4 border-t pt-3" style={{ borderColor: `${baseColor}20` }}>
                {/* Node ID and Status */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-medium" style={{ color: darkerColor }}>
                    <span>Node ID:</span>
                    <span className="font-mono">{id}</span>
                  </div>
                  <div
                    className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
                    style={{
                      backgroundColor: getStatusColor() !== "transparent" ? getStatusColor() : baseColor,
                    }}
                  >
                    {getStatusText()}
                  </div>
                </div>

                {/* Last Modified */}
                <div className="mb-3 flex items-center gap-1 text-xs" style={{ color: `${darkerColor}99` }}>
                  <Clock size={12} />
                  <span>Last modified: {formatTimestamp(mockConfig.lastModified)}</span>
                </div>

                {/* Expandable Sections */}
                {/* Input Schema */}
                <div className="mb-2 rounded-md border" style={{ borderColor: `${baseColor}20` }}>
                  <button
                    className="flex w-full items-center justify-between p-2 text-xs font-medium"
                    style={{
                      backgroundColor: `${baseColor}10`,
                      color: darkerColor,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSection("input")
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Database size={12} />
                      <span>Input Schema</span>
                    </div>
                    {expandedSection === "input" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSection === "input" && (
                    <div
                      className="p-2"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                    >
                      <ScrollableContent>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(inputSchema, null, 2)}</pre>
                      </ScrollableContent>
                    </div>
                  )}
                </div>

                {/* Output Schema */}
                <div className="mb-2 rounded-md border" style={{ borderColor: `${baseColor}20` }}>
                  <button
                    className="flex w-full items-center justify-between p-2 text-xs font-medium"
                    style={{
                      backgroundColor: `${baseColor}10`,
                      color: darkerColor,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSection("output")
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Database size={12} />
                      <span>Output Schema</span>
                    </div>
                    {expandedSection === "output" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSection === "output" && (
                    <div
                      className="p-2"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                    >
                      <ScrollableContent>
                        <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{JSON.stringify(outputSchema, null, 2)}</pre>
                      </ScrollableContent>
                    </div>
                  )}
                </div>

                {/* Processing Logs */}
                <div className="mb-2 rounded-md border" style={{ borderColor: `${baseColor}20` }}>
                  <button
                    className="flex w-full items-center justify-between p-2 text-xs font-medium"
                    style={{
                      backgroundColor: `${baseColor}10`,
                      color: darkerColor,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSection("logs")
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={12} />
                      <span>Processing Logs</span>
                    </div>
                    {expandedSection === "logs" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSection === "logs" && (
                    <div
                      className="p-2"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                    >
                      <ScrollableContent>
                        {logs.map((log, index) => (
                          <div key={index} className="mb-1 flex flex-col">
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-gray-500">
                                {new Date(log.timestamp).toLocaleTimeString()}
                              </span>
                              <span
                                className={`rounded px-1 text-xs ${
                                  log.level === "INFO"
                                    ? "bg-blue-100 text-blue-800"
                                    : log.level === "WARN"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : log.level === "ERROR"
                                        ? "bg-red-100 text-red-800"
                                        : ""
                                }`}
                              >
                                {log.level}
                              </span>
                            </div>
                            <div className="pl-4">{log.message}</div>
                          </div>
                        ))}
                        <button
                          className="mt-2 text-xs font-medium"
                          style={{ color: baseColor }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          See more logs...
                        </button>
                      </ScrollableContent>
                    </div>
                  )}
                </div>

                {/* Configuration */}
                <div className="mb-2 rounded-md border" style={{ borderColor: `${baseColor}20` }}>
                  <button
                    className="flex w-full items-center justify-between p-2 text-xs font-medium"
                    style={{
                      backgroundColor: `${baseColor}10`,
                      color: darkerColor,
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleSection("config")
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Settings size={12} />
                      <span>Configuration</span>
                    </div>
                    {expandedSection === "config" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {expandedSection === "config" && (
                    <div
                      className="p-2"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      onMouseUp={(e) => e.stopPropagation()}
                      onMouseMove={(e) => e.stopPropagation()}
                    >
                      <ScrollableContent>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(mockConfig).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="font-medium">{key}:</span>
                              <span>{value}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollableContent>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Handles with improved styling */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !opacity-100"
        style={{
          top: "50%",
          background: "white",
          borderColor: getStatusColor() !== "transparent" ? getStatusColor() : baseColor,
          boxShadow: `0 0 0 2px white, 0 0 0 4px ${baseColor}30`,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !opacity-100"
        style={{
          top: "50%",
          background: "white",
          borderColor: getStatusColor() !== "transparent" ? getStatusColor() : baseColor,
          boxShadow: `0 0 0 2px white, 0 0 0 4px ${baseColor}30`,
        }}
      />
    </div>
  )
})

CloudNode.displayName = "CloudNode"
