import { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface TourStep {
  id: string
  title: string
  content: string
  targetSelector: string
  position?: "top" | "bottom" | "left" | "right"
  highlightPadding?: number
}

export interface Tour {
  id: string
  name: string
  description?: string
  steps: TourStep[]
  category?: "feature" | "workflow" | "getting-started"
}

interface TourState {
  isRunning: boolean
  currentStepIndex: number
  completedTours: Set<string>
}

interface TourContextValue {
  state: TourState
  startTour: (tour: Tour) => void
  nextStep: () => void
  prevStep: () => void
  endTour: () => void
  isTourCompleted: (tourId: string) => boolean
  markTourCompleted: (tourId: string) => void
  currentTour: Tour | null
}

const TourContext = createContext<TourContextValue | undefined>(undefined)

export function useTour() {
  const context = useContext(TourContext)
  if (!context) throw new Error("useTour must be used within a TourProvider")
  return context
}

interface TourProviderProps {
  children: React.ReactNode
}

export function TourProvider({ children }: TourProviderProps) {
  const [currentTour, setCurrentTour] = useState<Tour | null>(null)
  const [state, setState] = useState<TourState>(() => {
    const saved = localStorage.getItem("focuscircle:completed-tours")
    let completedTours = new Set<string>()
    if (saved) {
      try {
        completedTours = new Set(JSON.parse(saved))
      } catch (e) {
        console.warn("Failed to parse completed tours from localStorage", e)
      }
    }
    return { isRunning: false, currentStepIndex: 0, completedTours }
  })

  useEffect(() => {
    localStorage.setItem("focuscircle:completed-tours", JSON.stringify(Array.from(state.completedTours)))
  }, [state.completedTours])

  const startTour = useCallback((tour: Tour) => {
    setCurrentTour(tour)
    setState((prev) => ({ ...prev, isRunning: true, currentStepIndex: 0 }))
    document.body.style.overflow = "hidden"
  }, [])

  const endTour = useCallback(() => {
    setState((prev) => ({ ...prev, isRunning: false, currentStepIndex: 0 }))
    if (currentTour) {
      setState((prev) => {
        const next = new Set(prev.completedTours)
        next.add(currentTour.id)
        return { ...prev, completedTours: next }
      })
    }
    setCurrentTour(null)
    document.body.style.overflow = ""
  }, [currentTour])

  const nextStep = useCallback(() => {
    if (!currentTour) return
    setState((prev) => {
      const nextIndex = prev.currentStepIndex + 1
      if (nextIndex >= currentTour.steps.length) {
        return { ...prev, isRunning: false, currentStepIndex: 0 }
      }
      return { ...prev, currentStepIndex: nextIndex }
    })
  }, [currentTour])

  const prevStep = useCallback(() => {
    setState((prev) => ({ ...prev, currentStepIndex: Math.max(0, prev.currentStepIndex - 1) }))
  }, [])

  const isTourCompleted = useCallback((tourId: string) => state.completedTours.has(tourId), [state.completedTours])
  const markTourCompleted = useCallback((tourId: string) => {
    setState((prev) => {
      const next = new Set(prev.completedTours)
      next.add(tourId)
      return { ...prev, completedTours: next }
    })
  }, [])

  return (
    <TourContext.Provider value={{ state, startTour, nextStep, prevStep, endTour, isTourCompleted, markTourCompleted, currentTour }}>
      {children}
      {state.isRunning && <TourOverlay />}
    </TourContext.Provider>
  )
}

function TourOverlay() {
  const { state, currentTour, nextStep, prevStep, endTour } = useTour()
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null)

  if (!currentTour || state.currentStepIndex >= currentTour.steps.length) {
    return null
  }

  const step = currentTour.steps[state.currentStepIndex]
  const target = document.querySelector(step.targetSelector)

  if (target) {
    const rect = target.getBoundingClientRect()
    const padding = step.highlightPadding || 8
    const newRect = new DOMRect(rect.left - padding, rect.top - padding, rect.width + padding * 2, rect.height + padding * 2)
    setHighlightRect(newRect)
    target.scrollIntoView({ behavior: "smooth", block: "center" })
  } else {
    setHighlightRect(null)
  }

  const position = step.position || "bottom"

  const tooltipStyle = (() => {
    const base = { left: "50%", transform: "translateX(-50%)" }
    switch (position) {
      case "top": return { ...base, bottom: "calc(100% + 16px)" }
      case "bottom": return { ...base, top: "calc(100% + 16px)" }
      case "left": return { right: "calc(100% + 16px)", top: "50%", transform: "translateY(-50%)" }
      case "right": return { left: "calc(100% + 16px)", top: "50%", transform: "translateY(-50%)" }
      default: return base
    }
  })()

  const currentNum = state.currentStepIndex + 1

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />
      {highlightRect && (
        <div className="fixed z-40 rounded-2xl border-2 border-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] animate-pulse" style={{ left: highlightRect.left, top: highlightRect.top, width: highlightRect.width, height: highlightRect.height }} />
      )}
      <div className="fixed z-50 max-w-sm rounded-2xl bg-white dark:bg-slate-900 border shadow-xl p-5 animate-in fade-in-0 zoom-in-95" style={tooltipStyle}>
        <div className="mb-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-primary">{currentTour.name} - Step {currentNum} of {currentTour.steps.length}</div>
            <button onClick={endTour} className="rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close tour">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h3 className="text-lg font-semibold">{step.title}</h3>
        </div>
        <p className="mb-5 text-sm text-muted-foreground leading-relaxed">{step.content}</p>
        <div className="flex items-center justify-between">
          <button onClick={prevStep} disabled={currentNum === 1} className={`rounded-lg px-4 py-2 text-sm font-medium transition ${currentNum === 1 ? "cursor-not-allowed opacity-50" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}>Back</button>
          <div className="flex items-center gap-1">
            {Array.from({ length: currentTour.steps.length }).map((_, i) => (<div key={i} className={`h-1.5 w-1.5 rounded-full transition ${i < currentNum ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"}`} />))}
          </div>
          {currentNum < currentTour.steps.length ? (
            <button onClick={nextStep} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">Next</button>
          ) : (
            <button onClick={endTour} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">Done</button>
          )}
        </div>
      </div>
    </>
  )
}

const predefinedToursConst = [
  {
    id: "dashboard-intro",
    name: "Dashboard Overview",
    description: "Get familiar with your FocusCircle dashboard",
    category: "getting-started" as const,
    steps: [
      { id: "dashboard-title", title: "Your Focus Snapshot", content: "This is your main dashboard. Here you get a complete overview of your productivity, tasks, and circle activity all in one place.", targetSelector: "[data-tour='dashboard-header']", position: "bottom" as const },
      { id: "metrics-row", title: "Key Metrics", content: "Track your weekly completions, today's tasks, circle activity, and unread notifications at a glance.", targetSelector: "[data-tour='dashboard-metrics']", position: "bottom" as const },
      { id: "weekly-chart", title: "Weekly Productivity", content: "Visualize your task completion throughout the week. Identify your most productive days!", targetSelector: "[data-tour='weekly-chart']", position: "bottom" as const },
      { id: "today-tasks", title: "Today's Tasks", content: "Focus on what needs to be done today. Complete these tasks to make progress on your goals.", targetSelector: "[data-tour='today-tasks']", position: "bottom" as const },
      { id: "notifications-preview", title: "Recent Notifications", content: "Stay updated with your circle's activity and task assignments. Click to view all notifications.", targetSelector: "[data-tour='notifications-preview']", position: "bottom" as const },
    ],
  },
  {
    id: "kanban-intro",
    name: "Kanban Board Guide",
    description: "Master task management with the Kanban board",
    category: "feature" as const,
    steps: [
      { id: "kanban-views", title: "View Modes", content: "Switch between Kanban (column-based) and Swimlane (grouped by circle) views to organize tasks your way.", targetSelector: "[data-tour='kanban-views']", position: "bottom" as const },
      { id: "wip-limits", title: "WIP Limits", content: "Set Work-In-Progress limits per column to avoid overload. The system prevents you from adding tasks beyond these limits.", targetSelector: "[data-tour='wip-limits']", position: "bottom" as const },
      { id: "drag-drop", title: "Drag & Drop", content: "Move tasks between columns to update their status. Just drag a task card to any column!", targetSelector: "[data-tour='kanban-column']", position: "top" as const, highlightPadding: 12 },
      { id: "task-card", title: "Task Details", content: "Each card shows priority, due date, and circle assignment. Click the edit icon to modify task details or delete it.", targetSelector: "[data-tour='task-card']", position: "right" as const },
    ],
  },
  {
    id: "notifications-intro",
    name: "Notifications Center",
    description: "Never miss important updates",
    category: "feature" as const,
    steps: [
      { id: "notif-button", title: "Notifications Center", content: "Click this bell icon to open your notification center anytime. It shows all your activity updates.", targetSelector: "[data-tour='notification-button']", position: "bottom" as const },
      { id: "filter-options", title: "Filter & Search", content: "Filter notifications by type (task assigned, mention, comment, etc.) and status (read/unread).", targetSelector: "[data-tour='notif-filters']", position: "bottom" as const },
      { id: "bulk-actions", title: "Bulk Actions", content: "Select multiple notifications to mark as read or delete them all at once.", targetSelector: "[data-tour='notif-actions']", position: "bottom" as const },
    ],
  },
] as const

export const predefinedTours = predefinedToursConst as unknown as Tour[]

export function TourLauncher({ tourId }: { tourId: string }) {
  const { startTour, isTourCompleted, currentTour } = useTour()
  const tour = predefinedTours.find((t) => t.id === tourId)
  if (!tour || currentTour?.id === tourId) return null
  return (
    <button
      onClick={() => startTour(tour)}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${isTourCompleted(tourId) ? "border border-primary bg-primary/10 text-primary hover:bg-primary/20" : "bg-primary text-white hover:bg-primary/90 shadow-sm"}`}
    >
      {isTourCompleted(tourId) ? "Retake" : "Start Tour"}
    </button>
  )
}
