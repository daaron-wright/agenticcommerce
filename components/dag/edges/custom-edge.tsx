import { memo } from "react"
import { BaseEdge, EdgeLabelRenderer, type EdgeProps, getBezierPath } from "reactflow"

export const CustomEdge = memo(
  ({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    animated,
    data,
  }: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
      sourceX,
      sourceY,
      sourcePosition,
      targetX,
      targetY,
      targetPosition,
    })

    // Enhanced edge styling
    const edgeStyle = {
      ...style,
      strokeWidth: animated ? 2 : 1.5,
      stroke: animated ? "#3b82f6" : "#718096",
      opacity: animated ? 0.9 : 0.7,
      filter: animated ? "drop-shadow(0 0 2px rgba(59, 130, 246, 0.5))" : "none",
    }

    return (
      <>
        <BaseEdge path={edgePath} markerEnd={markerEnd} style={edgeStyle} animated={animated} />
        {animated && (
          <EdgeLabelRenderer>
            <div
              style={{
                position: "absolute",
                transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                pointerEvents: "none",
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                padding: "2px 4px",
                borderRadius: "4px",
                fontSize: "10px",
                fontWeight: 500,
                color: "#3b82f6",
                border: "1px solid rgba(59, 130, 246, 0.2)",
                backdropFilter: "blur(4px)",
              }}
              className="nodrag nopan"
            >
              Processing
            </div>
          </EdgeLabelRenderer>
        )}
      </>
    )
  },
)

CustomEdge.displayName = "CustomEdge"
