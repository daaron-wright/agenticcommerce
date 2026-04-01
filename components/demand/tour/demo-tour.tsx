"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  createContext,
  useContext,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight, X, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TOUR_STEPS } from "./tour-steps";

// ── Context ──────────────────────────────────────────────────────────────────

interface TourContextValue {
  start: () => void;
  currentStepId: string | null;
}

const TourContext = createContext<TourContextValue>({
  start: () => {},
  currentStepId: null,
});
export const useTour = () => useContext(TourContext);

// ── Helpers ──────────────────────────────────────────────────────────────────

function scrollTargetIntoView(selector: string) {
  const el = document.querySelector(selector);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function highlightTarget(selector: string | undefined) {
  // Remove previous highlights
  document
    .querySelectorAll("[data-tour-active]")
    .forEach((el) => el.removeAttribute("data-tour-active"));
  if (!selector) return;
  const el = document.querySelector(selector);
  if (el) {
    el.setAttribute("data-tour-active", "true");
  }
}

// ── Provider + Spotlight Tour ────────────────────────────────────────────────

export function DemoTourProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const waitingForRoute = useRef(false);

  const current = TOUR_STEPS[step];
  const currentStepId = isOpen && current ? current.id : null;

  // ── Step actions ────────────────────────────────────────────────────────

  const STEP_ACTIONS: Record<string, () => void> = {
    "chat-status": () => {
      // Click the first prompt card to trigger agent processing
      const btn = document.querySelector(
        '[data-tour="chat-prompts"] button',
      ) as HTMLButtonElement | null;
      btn?.click();
    },
    "dag-toggle": () => {
      // Click the DAG toggle button to open the sidebar
      const btn = document.querySelector(
        '[data-tour="dag-toggle"]',
      ) as HTMLButtonElement | null;
      btn?.click();
    },
  };

  // ── Highlight + scroll + action on step change ──────────────────────────

  useEffect(() => {
    if (!isOpen || !current) return;

    // Scroll target into view
    if (current.target) {
      scrollTargetIntoView(current.target);
    }

    // Apply highlight ring via data attribute (retry a few times for post-route render)
    const t1 = setTimeout(() => highlightTarget(current.target), 200);
    const t2 = setTimeout(() => highlightTarget(current.target), 700);
    const t3 = setTimeout(() => highlightTarget(current.target), 1200);

    // Run step action
    const actionTimer = setTimeout(() => {
      const action = STEP_ACTIONS[current.id];
      if (action) action();
    }, 800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(actionTimer);
    };
  }, [isOpen, step, current, pathname]);

  // ── Navigation ──────────────────────────────────────────────────────────

  const navigate = useCallback(
    (direction: 1 | -1) => {
      const next = step + direction;
      if (next < 0 || next >= TOUR_STEPS.length) return;
      const nextStep = TOUR_STEPS[next];

      setTransitioning(true);
      highlightTarget(undefined);

      if (nextStep.route !== pathname) {
        waitingForRoute.current = true;
        router.push(nextStep.route);
        setTimeout(() => {
          setStep(next);
          setTransitioning(false);
        }, 1200);
      } else {
        setTimeout(() => {
          setStep(next);
          setTransitioning(false);
        }, 150);
      }
    },
    [step, pathname, router],
  );

  const close = useCallback(() => {
    setIsOpen(false);
    setStep(0);
    highlightTarget(undefined);
  }, []);

  const start = useCallback(() => {
    // Prefetch all tour routes so RSC payloads are cached before navigation
    const uniqueRoutes = [...new Set(TOUR_STEPS.map((s) => s.route))];
    uniqueRoutes.forEach((route) => router.prefetch(route));

    setStep(0);
    highlightTarget(undefined);
    const firstRoute = TOUR_STEPS[0].route;
    if (pathname !== firstRoute) {
      waitingForRoute.current = true;
      router.push(firstRoute);
    }
    setIsOpen(true);
  }, [pathname, router]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, navigate, close]);


  return (
    <TourContext.Provider value={{ start, currentStepId }}>
      {children}

      {isOpen && current && (
        <>
          {/* Tooltip panel — fixed bottom-right */}
          <div
            key={step}
            className="fixed z-[200] pointer-events-auto"
            style={{ position: "fixed", bottom: 24, right: 24 }}
          >
            <div
              className={cn(
                "w-[360px] bg-white border border-stone-200 rounded-xl shadow-lg",
                "animate-in slide-in-from-bottom-4 fade-in duration-300",
                transitioning && "opacity-50",
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 pt-4 pb-0">
                <p className="text-[10px] text-stone-400 font-medium uppercase tracking-widest">
                  Step {step + 1} of {TOUR_STEPS.length}
                </p>
                <button
                  onClick={close}
                  className="text-stone-400 hover:text-stone-700 transition-colors -mr-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Content */}
              <div className="px-5 pt-2 pb-4">
                <div className="flex items-start gap-2 mb-1.5">
                  <h3 className="text-sm font-semibold text-stone-800">
                    {current.title}
                  </h3>
                  <ArrowUpRight className="h-3.5 w-3.5 text-stone-400 mt-0.5 flex-shrink-0" />
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {current.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 pb-4">
                {/* Dots */}
                <div className="flex gap-1">
                  {TOUR_STEPS.map((_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 rounded-full transition-all",
                        i === step
                          ? "w-4 bg-stone-700"
                          : i < step
                            ? "w-1.5 bg-stone-400"
                            : "w-1.5 bg-stone-200",
                      )}
                    />
                  ))}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-1.5">
                  {step > 0 && (
                    <button
                      onClick={() => navigate(-1)}
                      disabled={transitioning}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 px-2 py-1 rounded-md hover:bg-stone-100 transition-colors disabled:opacity-50"
                    >
                      <ChevronLeft className="h-3 w-3" /> Back
                    </button>
                  )}
                  {step < TOUR_STEPS.length - 1 ? (
                    <button
                      onClick={() => navigate(1)}
                      disabled={transitioning}
                      className="flex items-center gap-1 text-xs font-medium text-white bg-stone-700 hover:bg-stone-800 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                    >
                      Next <ChevronRight className="h-3 w-3" />
                    </button>
                  ) : (
                    <button
                      onClick={close}
                      className="text-xs font-medium text-white bg-stone-700 hover:bg-stone-800 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Finish
                    </button>
                  )}
                </div>
              </div>

              {/* Skip link */}
              {step < TOUR_STEPS.length - 1 && (
                <div className="border-t border-stone-100 px-5 py-2.5">
                  <button
                    onClick={close}
                    className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    Skip tour
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </TourContext.Provider>
  );
}
