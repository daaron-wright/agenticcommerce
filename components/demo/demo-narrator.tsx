"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Headphones,
  ChevronLeft,
  ChevronRight,
  X,
  Pause,
  Play,
  Volume2,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DEMO_STAGES, type DemoStage } from "@/lib/demo-script";
import { speak, stop as stopTTS, isElevenLabsConfigured } from "@/lib/elevenlabs";

// ── Context ──────────────────────────────────────────────────────────────────

interface DemoNarratorContextValue {
  isActive: boolean;
  startDemo: () => void;
  stopDemo: () => void;
}

const DemoNarratorContext = createContext<DemoNarratorContextValue>({
  isActive: false,
  startDemo: () => {},
  stopDemo: () => {},
});

export const useDemoNarrator = () => useContext(DemoNarratorContext);

// ── Helpers ──────────────────────────────────────────────────────────────────

function highlightTarget(selector: string | undefined) {
  document
    .querySelectorAll("[data-tour-active]")
    .forEach((el) => el.removeAttribute("data-tour-active"));
  if (!selector) return;
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute("data-tour-active", "true");
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

// ── UI Action dispatcher via custom events ───────────────────────────────────

function dispatchUIAction(action: string) {
  switch (action) {
    case "openAlerts":
      window.dispatchEvent(new CustomEvent("demo:open-utility", { detail: "notifications" }));
      // Then switch to alerts sub-tab
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("demo:switch-channel", { detail: "alerts" }));
      }, 300);
      break;
    case "openApprovals":
      window.dispatchEvent(new CustomEvent("demo:open-utility", { detail: "notifications" }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("demo:switch-channel", { detail: "approvals" }));
      }, 300);
      break;
    case "openReach":
      window.dispatchEvent(new CustomEvent("demo:open-utility", { detail: "notifications" }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("demo:switch-channel", { detail: "reach" }));
      }, 300);
      break;
    case "openDemand":
      window.dispatchEvent(new CustomEvent("demo:open-utility", { detail: "notifications" }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("demo:switch-channel", { detail: "demand" }));
      }, 300);
      break;
    case "openCampaign":
      window.dispatchEvent(new CustomEvent("demo:open-utility", { detail: "notifications" }));
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("demo:switch-channel", { detail: "campaign" }));
      }, 300);
      break;
    case "scrollToActions": {
      const el = document.querySelector('[data-demo="action-board"]');
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
      break;
    }
  }
}

// ── Provider + Floating UI ───────────────────────────────────────────────────

export function DemoNarratorProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const abortRef = useRef(false);

  const stage = DEMO_STAGES[currentStage];
  const hasApiKey = isElevenLabsConfigured();

  // ── Play narration for current stage ────────────────────────────────────

  const playStage = useCallback(
    async (s: DemoStage) => {
      abortRef.current = false;

      // Navigate if needed
      if (s.route !== pathname) {
        router.push(s.route);
        await new Promise((r) => setTimeout(r, 1200));
      }

      if (abortRef.current) return;

      // Highlight target
      setTimeout(() => highlightTarget(s.target), 300);
      setTimeout(() => highlightTarget(s.target), 800);

      // Dispatch UI action
      if (s.uiAction) {
        setTimeout(() => dispatchUIAction(s.uiAction!), 500);
      }

      // Play TTS
      if (hasApiKey) {
        setIsLoading(true);
        setIsPlaying(true);
        try {
          await speak(s.narration);
        } catch {
          // ignore
        }
        if (!abortRef.current) {
          setIsPlaying(false);
          setIsLoading(false);
        }
      }
    },
    [pathname, router, hasApiKey],
  );

  // ── Start / Stop ───────────────────────────────────────────────────────

  const startDemo = useCallback(() => {
    // Prefetch routes
    const uniqueRoutes = [...new Set(DEMO_STAGES.map((s) => s.route))];
    uniqueRoutes.forEach((route) => router.prefetch(route));

    setCurrentStage(0);
    setIsActive(true);
    setPanelVisible(true);
    highlightTarget(undefined);

    // Navigate to first stage route
    const first = DEMO_STAGES[0];
    if (pathname !== first.route) {
      router.push(first.route);
    }

    // Play after short delay
    setTimeout(() => playStage(first), 800);
  }, [pathname, router, playStage]);

  const stopDemo = useCallback(() => {
    abortRef.current = true;
    stopTTS();
    setIsActive(false);
    setIsPlaying(false);
    setIsLoading(false);
    setPanelVisible(false);
    setCurrentStage(0);
    highlightTarget(undefined);
  }, []);

  // ── Navigation ─────────────────────────────────────────────────────────

  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= DEMO_STAGES.length) return;
      abortRef.current = true;
      stopTTS();
      setIsPlaying(false);
      setIsLoading(false);

      setTimeout(() => {
        setCurrentStage(index);
        playStage(DEMO_STAGES[index]);
      }, 200);
    },
    [playStage],
  );

  const next = useCallback(() => {
    if (currentStage < DEMO_STAGES.length - 1) goTo(currentStage + 1);
  }, [currentStage, goTo]);

  const prev = useCallback(() => {
    if (currentStage > 0) goTo(currentStage - 1);
  }, [currentStage, goTo]);

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stopTTS();
      setIsPlaying(false);
    } else if (stage) {
      playStage(stage);
    }
  }, [isPlaying, stage, playStage]);

  // ── Keyboard shortcuts ─────────────────────────────────────────────────

  useEffect(() => {
    if (!isActive) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopDemo();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isActive, next, prev, stopDemo]);

  return (
    <DemoNarratorContext.Provider value={{ isActive, startDemo, stopDemo }}>
      {children}

      {/* ── Floating Demo Icon ─────────────────────────────────────────── */}
      <div className="fixed z-[210] bottom-[5.5rem] right-3 flex flex-col items-center gap-3">
        {/* Narrator panel (shown when active) */}
        {isActive && panelVisible && stage && (
          <div
            key={currentStage}
            className={cn(
              "w-[340px] bg-white border border-stone-200 rounded-xl shadow-xl",
              "animate-in slide-in-from-bottom-4 fade-in duration-300 mb-2",
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-3 pb-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {hasApiKey ? (
                    <Volume2 className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <VolumeX className="h-3 w-3 text-stone-400" />
                  )}
                  <span className="text-[10px] text-stone-500 font-medium uppercase tracking-widest">
                    Stage {currentStage + 1} / {DEMO_STAGES.length}
                  </span>
                </div>
                {isPlaying && (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-600">Playing</span>
                  </span>
                )}
                {isLoading && !isPlaying && (
                  <span className="text-[10px] text-amber-600">Loading...</span>
                )}
              </div>
              <button
                onClick={stopDemo}
                className="text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="px-4 pt-2 pb-3">
              <h3 className="text-sm font-semibold text-stone-800 mb-1">
                {stage.title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed line-clamp-3">
                {stage.narration}
              </p>
              {!hasApiKey && (
                <p className="text-[10px] text-stone-400 mt-2 italic">
                  Set NEXT_PUBLIC_ELEVENLABS_API_KEY for voice narration
                </p>
              )}
            </div>

            {/* Progress dots */}
            <div className="px-4 pb-2">
              <div className="flex gap-1">
                {DEMO_STAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === currentStage
                        ? "w-5 bg-stone-700"
                        : i < currentStage
                          ? "w-1.5 bg-stone-400 hover:bg-stone-500"
                          : "w-1.5 bg-stone-200 hover:bg-stone-300",
                    )}
                  />
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between border-t border-stone-100 px-4 py-2.5">
              <div className="flex items-center gap-1">
                <button
                  onClick={prev}
                  disabled={currentStage === 0}
                  className="flex items-center gap-0.5 text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-3 w-3" /> Back
                </button>
                {hasApiKey && (
                  <button
                    onClick={togglePlayPause}
                    className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3 w-3" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3 w-3" /> Replay
                      </>
                    )}
                  </button>
                )}
              </div>
              {currentStage < DEMO_STAGES.length - 1 ? (
                <button
                  onClick={next}
                  className="flex items-center gap-1 text-xs font-medium text-white bg-stone-700 hover:bg-stone-800 px-3 py-1.5 rounded-md transition-colors"
                >
                  Next <ChevronRight className="h-3 w-3" />
                </button>
              ) : (
                <button
                  onClick={stopDemo}
                  className="text-xs font-medium text-white bg-stone-700 hover:bg-stone-800 px-3 py-1.5 rounded-md transition-colors"
                >
                  Finish
                </button>
              )}
            </div>
          </div>
        )}

        {/* Floating button */}
        <button
          onClick={isActive ? togglePlayPause : startDemo}
          className={cn(
            "relative h-10 w-10 rounded-full shadow-lg flex items-center justify-center",
            "transform-none active:transform-none",
            isActive
              ? "bg-red-200 text-black"
              : "bg-red-100 text-black border border-red-200",
          )}
          style={{ transform: "none" }}
          title={isActive ? "Demo in progress" : "Start narrated demo"}
        >
          <Headphones className="h-4 w-4" style={{ transform: "none" }} />
          {/* Pulse ring when idle */}
          {!isActive && (
            <span className="absolute inset-0 rounded-full border-2 border-red-300/40 animate-ping" />
          )}
          {/* Stage badge */}
          {isActive && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {currentStage + 1}
            </span>
          )}
        </button>
      </div>
    </DemoNarratorContext.Provider>
  );
}
