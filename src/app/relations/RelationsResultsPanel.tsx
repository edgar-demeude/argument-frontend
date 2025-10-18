"use client";

import { GraphData, GraphNode } from "../components/types";

interface RelationsResultsPanelProps {
  graphData: GraphData;
}

export default function RelationsResultsPanel({ graphData }: RelationsResultsPanelProps) {
  // Count the number of each link type
  const counts: Record<string, number> = {};
  graphData.links.forEach((link) => {
    const type = typeof link.label === "string" && link.label.includes("Support")
      ? "Support"
      : "Attack";
    counts[type] = (counts[type] ?? 0) + 1;
  });

  const types = Object.keys(counts);

  return (
    <div className="w-1/6 bg-[var(--background)] p-4 overflow-y-auto text-[var(--foreground)] flex-shrink-0 space-y-4 border-l border-[color-mix(in_oklab,var(--foreground)_20%,transparent)] flex flex-col">
      
      {/* Legend always at the top */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 block bg-[var(--accent)]"></span>
          <span>Green arrows → : Supports</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 block bg-[var(--attack-red)]"></span>
          <span>Red arrows → : Attacks</span>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-xl font-bold mb-4 text-[var(--foreground)]">Results</h2>

      {/* Relation counts */}
      {types.length > 0 ? (
        <div className="space-y-3 text-sm">
          {types.map((type) => (
            <div key={type} className="flex flex-col gap-1">
              <span className="text-[color-mix(in_oklab,var(--foreground)_80%,transparent)] font-medium uppercase tracking-wide text-xs">
                {type}
              </span>
              <span
                className={`font-semibold ${
                  type.toLowerCase() === "attack"
                    ? "text-[var(--attack-red)]"
                    : "text-[var(--accent)]"
                }`}
              >
                {counts[type]}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-sm opacity-60 italic text-[color-mix(in_oklab,var(--foreground)_70%,transparent)]">
          No relations yet.
        </div>
      )}
    </div>
  );
}
