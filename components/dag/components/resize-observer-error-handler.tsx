"use client"

import { useEffect } from "react"

export function ResizeObserverErrorHandler() {
  useEffect(() => {
    // Create a global error handler to catch and suppress ResizeObserver errors
    const originalErrorHandler = window.onerror

    window.onerror = (message, source, lineno, colno, error) => {
      // Check if the error is related to ResizeObserver
      if (
        message &&
        typeof message === "string" &&
        (message.includes("ResizeObserver") || (error && error.message && error.message.includes("ResizeObserver")))
      ) {
        // Prevent the error from propagating
        console.warn("Suppressed ResizeObserver error")
        return true
      }

      // Call the original error handler for other errors
      if (originalErrorHandler) {
        return originalErrorHandler(message, source, lineno, colno, error)
      }
      return false
    }

    // Also suppress console errors related to ResizeObserver
    const originalConsoleError = console.error
    console.error = (...args) => {
      if (args.length > 0 && typeof args[0] === "string" && args[0].includes("ResizeObserver")) {
        console.warn("Suppressed ResizeObserver console error")
        return
      }
      originalConsoleError(...args)
    }

    return () => {
      // Restore original handlers on cleanup
      window.onerror = originalErrorHandler
      console.error = originalConsoleError
    }
  }, [])

  return null
}
