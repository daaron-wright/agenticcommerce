"use client";

import { memo, useEffect, useState } from "react";
import { Handle, type NodeProps, Position } from "reactflow";
import { UserCheck } from "lucide-react";

/**
 * Diamond-shaped "Human in the loop" node for DAG visualization.
 * Use type: "human" when defining nodes in your DAG data.
 */
export const HumanInTheLoopNode = memo(({ data, isConnectable }: NodeProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const baseColor = data.color || "#ED8936"; // default orange for human steps

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="relative flex items-center justify-center transition-opacity duration-300"
      style={{
        width: 240,
        height: 240,
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div
        className="flex flex-col items-center justify-center shadow-md"
        style={{
          width: 220,
          height: 220,
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          backgroundColor: `${baseColor}ee`,
          border: `2px solid ${baseColor}`,
        }}
      >
        <UserCheck className="mb-0.5 h-5 w-5 shrink-0" style={{ color: "#111" }} />
        <span
          className="text-center text-xs font-normal leading-tight text-black"
          style={{ maxWidth: 120 }}
        >
          {data.label ?? "Human in the loop"}
        </span>
      </div>

      <Handle
        id="target-left"
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gray-500"
        style={{ left: 0, top: "50%" }}
      />
      <Handle
        id="source-right"
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gray-500"
        style={{ right: 0, top: "50%" }}
      />
      <Handle
        id="target-top"
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gray-500"
        style={{ left: "50%", top: 0 }}
      />
      <Handle
        id="target-bottom"
        type="target"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gray-500"
        style={{ left: "50%", bottom: 0 }}
      />
      <Handle
        id="source-left"
        type="source"
        position={Position.Left}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gray-500"
        style={{ left: 0, top: "50%" }}
      />
      <Handle
        id="source-bottom"
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-gray-500"
        style={{ left: "50%", bottom: 0 }}
      />
    </div>
  );
});

HumanInTheLoopNode.displayName = "HumanInTheLoopNode";
