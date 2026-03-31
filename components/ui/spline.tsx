"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import Spline from "@splinetool/react-spline"

interface SplineSceneProps {
  scene: string
  className?: string
  mousePosition?: { x: number; y: number }
}

export function SplineScene({ scene, className, mousePosition = { x: 0, y: 0 } }: SplineSceneProps) {
  const splineContainerRef = useRef<HTMLDivElement>(null)
  const splineAppRef = useRef<any>(null)

  // Store target rotations for smooth interpolation
  const [targetRotations, setTargetRotations] = useState({ headX: 0, headY: 0, bodyY: 0 })
  // Store current rotations for smooth interpolation
  const currentRotations = useRef({ headX: 0, headY: 0, bodyY: 0 })

  // Function to handle the Spline app once it's loaded
  const onLoad = (splineApp) => {
    splineAppRef.current = splineApp

    // Try to find the robot's head or other parts that should track the mouse
    try {
      // Log all object names to help identify the correct ones
      console.log(
        "All scene objects:",
        splineApp.getAllObjects().map((obj) => obj.name),
      )
    } catch (error) {
      console.error("Error finding robot parts:", error)
    }
  }

  // Update target rotations based on mouse position
  useEffect(() => {
    if (!splineAppRef.current || !mousePosition) return

    try {
      if (splineContainerRef.current) {
        const rect = splineContainerRef.current.getBoundingClientRect()

        // Calculate position relative to the container
        const containerX = rect.left + rect.width / 2
        const containerY = rect.top + rect.height / 2

        // Calculate direction vector from container center to mouse
        const dirX = mousePosition.x - containerX
        const dirY = mousePosition.y - containerY

        // Set target rotations with appropriate sensitivity
        const headSensitivity = 0.0005
        const bodySensitivity = 0.0002

        // Limit rotation range for natural movement
        const maxHeadRotation = 0.3 // radians
        const maxBodyRotation = 0.1 // radians

        setTargetRotations({
          headY: Math.max(-maxHeadRotation, Math.min(maxHeadRotation, dirX * headSensitivity)),
          headX: Math.max(-maxHeadRotation, Math.min(maxHeadRotation, dirY * headSensitivity)),
          bodyY: Math.max(-maxBodyRotation, Math.min(maxBodyRotation, dirX * bodySensitivity)),
        })
      }
    } catch (error) {
      console.error("Error calculating target rotations:", error)
    }
  }, [mousePosition])

  // Smooth interpolation animation loop
  useEffect(() => {
    if (!splineAppRef.current) return

    let animationFrameId: number

    const updateRotations = () => {
      try {
        // Find all objects that might be the robot's head or parts that should track the mouse
        const allObjects = splineAppRef.current.getAllObjects()

        // Try to find objects by common naming patterns
        const headCandidates = allObjects.filter(
          (obj) =>
            obj.name.toLowerCase().includes("head") ||
            obj.name.toLowerCase().includes("face") ||
            obj.name.toLowerCase().includes("helmet"),
        )

        const bodyCandidates = allObjects.filter(
          (obj) =>
            obj.name.toLowerCase().includes("body") ||
            obj.name.toLowerCase().includes("torso") ||
            obj.name.toLowerCase().includes("chest"),
        )

        // Smooth interpolation factor (0-1)
        // Lower values = smoother but slower movement
        const smoothFactor = 0.05

        // Update current rotations with smooth interpolation
        currentRotations.current = {
          headX:
            currentRotations.current.headX + (targetRotations.headX - currentRotations.current.headX) * smoothFactor,
          headY:
            currentRotations.current.headY + (targetRotations.headY - currentRotations.current.headY) * smoothFactor,
          bodyY:
            currentRotations.current.bodyY + (targetRotations.bodyY - currentRotations.current.bodyY) * smoothFactor,
        }

        // Apply rotations to head objects
        headCandidates.forEach((head) => {
          if (head.rotation) {
            head.rotation.x = currentRotations.current.headX
            head.rotation.y = currentRotations.current.headY
          }
        })

        // Apply rotations to body objects
        bodyCandidates.forEach((body) => {
          if (body.rotation) {
            body.rotation.y = currentRotations.current.bodyY
          }
        })

        // Continue animation loop
        animationFrameId = requestAnimationFrame(updateRotations)
      } catch (error) {
        console.error("Error updating rotations:", error)
      }
    }

    // Start animation loop
    animationFrameId = requestAnimationFrame(updateRotations)

    // Clean up animation loop on unmount
    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [targetRotations])

  return (
    <div ref={splineContainerRef} className={`${className} pointer-events-auto`}>
      <Suspense
        fallback={
          <div className="w-full h-full flex items-center justify-center">
            <span className="loader"></span>
          </div>
        }
      >
        <Spline scene={scene} onLoad={onLoad} className="w-full h-full" />
      </Suspense>
    </div>
  )
}

