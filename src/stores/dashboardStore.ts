"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const dashboardWidgetIds = [
  "advancedAnalytics",
  "businessPipeline",
  "activityFeed",
  "quickAgenda",
  "notifications",
  "pipeline",
  "tasks",
  "calendar",
  "ai",
  "acquisition",
  "cashflow",
  "forecast",
  "profitability",
  "team",
  "activity",
  "automations"
] as const;

export type DashboardWidgetId = (typeof dashboardWidgetIds)[number];
export type DashboardDensity = "comfortable" | "compact";
export type DashboardMode = "overview" | "analytics";

type DashboardStore = {
  density: DashboardDensity;
  hiddenWidgets: DashboardWidgetId[];
  mode: DashboardMode;
  order: DashboardWidgetId[];
  setDensity: (density: DashboardDensity) => void;
  setMode: (mode: DashboardMode) => void;
  toggleWidget: (id: DashboardWidgetId) => void;
  moveWidget: (id: DashboardWidgetId, direction: -1 | 1) => void;
  reset: () => void;
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set) => ({
      density: "comfortable",
      hiddenWidgets: [],
      mode: "overview",
      order: [...dashboardWidgetIds],
      moveWidget: (id, direction) =>
        set((state) => {
          const index = state.order.indexOf(id);
          const nextIndex = index + direction;
          if (index < 0 || nextIndex < 0 || nextIndex >= state.order.length) return state;
          const order = [...state.order];
          [order[index], order[nextIndex]] = [order[nextIndex], order[index]];
          return { order };
        }),
      reset: () => set({ density: "comfortable", hiddenWidgets: [], mode: "overview", order: [...dashboardWidgetIds] }),
      setDensity: (density) => set({ density }),
      setMode: (mode) => set({ mode }),
      toggleWidget: (id) =>
        set((state) => ({
          hiddenWidgets: state.hiddenWidgets.includes(id) ? state.hiddenWidgets.filter((widgetId) => widgetId !== id) : [...state.hiddenWidgets, id]
        }))
    }),
    { name: "centrix-dashboard-store-v1" }
  )
);
