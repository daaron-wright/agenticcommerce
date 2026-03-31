"use client"

import type React from "react"
import { useRef, useEffect } from "react"

interface ScrollableContentProps {
  children: React.ReactNode
}

export const ScrollableContent: React.FC<ScrollableContentProps> = ({ children }) => {
  // Create a ref to the scrollable div
  const scrollRef = useRef<HTMLDivElement>(null)

  // Function to handle all events and prevent propagation
  const blockEvent = (e: React.SyntheticEvent) => {
    e.stopPropagation()
  }

  // Add a global event handler when this component mounts
  useEffect(() => {
    // Function to check if an event target is within our scrollable area
    const isScrollableArea = (target: EventTarget | null) => {
      if (!target || !scrollRef.current) return false
      return scrollRef.current.contains(target as Node)
    }

    // Handler for mousedown events
    const handleMouseDown = (e: MouseEvent) => {
      if (isScrollableArea(e.target)) {
        e.stopPropagation()
      }
    }

    // Add the global event listener
    document.addEventListener("mousedown", handleMouseDown, true)

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleMouseDown, true)
    }
  }, [])

  return (
    <div
      className="scrollable-area"
      onClick={blockEvent}
      onMouseDown={blockEvent}
      style={{ border: "1px solid #d1d5db" }} // Grey border instead of blue
    >
      {/* This div blocks events from reaching the DAG */}
      <div className="event-blocker"></div>

      {/* The actual scrollable content */}
      <div
        ref={scrollRef}
        className="scrollable-content"
        onClick={blockEvent}
        onMouseDown={blockEvent}
        onMouseUp={blockEvent}
        onMouseMove={blockEvent}
        onWheel={blockEvent}
      >
        {children}
      </div>
    </div>
  )
}
