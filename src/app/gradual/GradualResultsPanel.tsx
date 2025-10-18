"use client";

import { GradualOutput } from "./types";

interface GradualResultsPanelProps {
  data: GradualOutput | null;
}

export default function GradualResultsPanel({ data }: GradualResultsPanelProps) {
  return (
    <div className="w-1/6 bg-[var(--background)] p-4 overflow-y-auto text-[var(--foreground)] flex-shrink-0 border-l border-[color-mix(in_oklab,var(--foreground)_20%,transparent)] flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Results</h2>

      {data ? (
        <div className="space-y-3 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-[color-mix(in_oklab,var(--foreground)_80%,transparent)] font-medium uppercase tracking-wide text-xs">
              Axes
            </span>
            <span className="text-[var(--accent)] font-semibold">
              {data.axes && data.axes.length ? data.axes.join(", ") : "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[color-mix(in_oklab,var(--foreground)_80%,transparent)] font-medium uppercase tracking-wide text-xs">
              Hull Volume
            </span>
            <span className="text-[var(--accent)] font-semibold">
              {data.hull_volume?.toFixed(4) ?? "—"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[color-mix(in_oklab,var(--foreground)_80%,transparent)] font-medium uppercase tracking-wide text-xs">
              Hull Area
            </span>
            <span className="text-[var(--accent)] font-semibold">
              {data.hull_area?.toFixed(4) ?? "—"}
            </span>
          </div>
        </div>
      ) : (
        <div className="text-sm opacity-60 italic text-[color-mix(in_oklab,var(--foreground)_70%,transparent)]">
          No results yet.
        </div>
      )}
    </div>
  );
}
