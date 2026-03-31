# DAG Visualization Component

This is a self-contained Directed Acyclic Graph (DAG) visualization component for React applications. It provides an interactive visualization of workflow processes with expandable nodes, animations, and detailed information display.

## Features

- Interactive DAG visualization with custom node types
- Expandable nodes with detailed information
- Animated workflow simulation
- Scrollable content areas for node details
- Responsive design
- Cloud and On-Premise node types with distinct styling

## Dependencies

This component requires the following dependencies:

\`\`\`bash
npm install reactflow framer-motion lucide-react lodash
\`\`\`

## Usage

1. Copy the entire `dag` folder into your project's `components` directory
2. Import the DAG visualization component in your page or component:

\`\`\`jsx
import { DAGVisualization } from "@/components/dag"

export default function MyPage() {
  return (
    <div className="h-screen w-full">
      <DAGVisualization />
    </div>
  )
}
\`\`\`

## Customization

You can customize the DAG data by modifying the `utils/dag-data.ts` file. This file contains the node and edge definitions that make up the graph.

## Component Structure

- `index.tsx` - Main export file
- `visualization.tsx` - Main DAG component
- `nodes/` - Custom node components
  - `custom-node.tsx` - Standard node component
  - `cloud-node.tsx` - Cloud-specific node with glow effect
  - `on-prem-node.tsx` - On-premise node with server styling
- `edges/` - Custom edge components
  - `custom-edge.tsx` - Enhanced edge with animation support
- `components/` - Shared components
  - `button.tsx` - Button component (fallback if shadcn/ui is not available)
  - `scrollable-content.tsx` - Scrollable content area with event isolation
  - `glow-effect.tsx` - Animated glow effect for cloud nodes
  - `resize-observer-error-handler.tsx` - Utility to handle ResizeObserver errors
- `utils/` - Utility functions and data
  - `dag-data.ts` - Node and edge definitions
- `background/` - Background elements
  - `background-layer.tsx` - Background styling elements
- `styles/` - CSS styles
  - `dag-styles.css` - DAG-specific styles

## Tailwind CSS

This component uses Tailwind CSS for styling. Make sure your project has Tailwind CSS configured.
\`\`\`
