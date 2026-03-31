"use client"

import { useRef, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SpotlightProps {
  className?: string
  fill?: string
}

export function Spotlight({ className, fill = "white" }: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!divRef.current) return

      const div = divRef.current
      const rect = div.getBoundingClientRect()

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      div.style.background = `radial-gradient(600px circle at ${x}px ${y}px, ${fill}/10%, transparent 40%)`
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [fill])

  return (
    <div ref={divRef} className={cn("pointer-events-none absolute inset-0 z-0 transition duration-300", className)} />
  )
}

