"use client";

import { useEffect } from "react";

export function ResizeObserverErrorHandler() {
  useEffect(() => {
    // Suppress ResizeObserver loop errors that are safely ignorable in React apps
    const handleError = (e: ErrorEvent) => {
      if (
        e.message === "ResizeObserver loop limit exceeded" ||
        e.message === "ResizeObserver loop completed with undelivered notifications."
      ) {
        const resizeObserverErrDiv = document.getElementById("webpack-dev-server-client-overlay-div");
        const resizeObserverErr = document.getElementById("webpack-dev-server-client-overlay");
        
        if (resizeObserverErr) {
          resizeObserverErr.setAttribute("style", "display: none");
        }
        if (resizeObserverErrDiv) {
          resizeObserverErrDiv.setAttribute("style", "display: none");
        }
        
        e.stopImmediatePropagation();
      }
    };
    
    // Also patch window.onerror directly for older/different dev servers
    const originalOnError = window.onerror;
    window.onerror = function (message, source, lineno, colno, error) {
      if (
        message === "ResizeObserver loop limit exceeded" ||
        message === "ResizeObserver loop completed with undelivered notifications."
      ) {
        return true; // Suppress it
      }
      if (originalOnError) {
        return originalOnError.apply(this, [message, source, lineno, colno, error]);
      }
      return false;
    };

    window.addEventListener("error", handleError, { capture: true });

    return () => {
      window.removeEventListener("error", handleError, { capture: true });
      window.onerror = originalOnError;
    };
  }, []);

  return null;
}
