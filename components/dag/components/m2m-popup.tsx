"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

type M2MPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function M2MPopup({ isOpen, onClose }: M2MPopupProps) {
  const [mounted, setMounted] = useState(false);

  // Handle mounting/unmounting with a small delay for animations
  useEffect(() => {
    if (isOpen && !mounted) {
      setMounted(true);
    } else if (!isOpen && mounted) {
      // Small delay to allow exit animation to play
      const timer = setTimeout(() => {
        setMounted(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen, mounted]);

  if (!isOpen && !mounted) return null;

  const animationClass = isOpen
    ? "m2m-popup-enter-active"
    : "m2m-popup-exit-active";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-white ${animationClass}`}
    >
      <div className="absolute top-4 right-4">
        <button
          onClick={onClose}
          className="rounded-full p-2 hover:bg-gray-100"
          aria-label="Close"
        >
          <X size={24} />
        </button>
      </div>
      <div className="container mx-auto p-6">
        <h2 className="mb-6 text-2xl font-bold">M2M Visualization</h2>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-8">
          <p className="text-center text-gray-500">M2M content will go here</p>
        </div>
      </div>
    </div>
  );
}
