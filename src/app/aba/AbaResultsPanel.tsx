"use client";
import { ABAApiResponse, FrameworkState } from "../components/types";

interface ABAResultsPanelProps {
  results: ABAApiResponse | null;
  viewMode?: "before" | "after";
}

export default function ABAResultsPanel({ results }: ABAResultsPanelProps) {
  const isABAPlus = (data: ABAApiResponse): boolean => {
    const after = data.after_transformation;
    return (
      (after?.assumption_set_attacks?.length ?? 0) > 0 ||
      (after?.reverse_attacks?.length ?? 0) > 0
    );
  };

  const renderFrameworkDetails = (fw: FrameworkState | null, label: string) => {
    if (!fw) return null;

    return (
      <div className="text-sm space-y-2">
        <h4 className="font-semibold text-[var(--accent)]">{label}</h4>

        {/* Language */}
        <div>
          <p className="font-medium">Language:</p>
          <p className="ml-3 text-[color-mix(in_oklab,var(--foreground)_85%,transparent)]">
            {`{${fw.framework.language.join(", ")}}`}
          </p>
        </div>

        {/* Rules */}
        <div>
          <p className="font-medium">Rules:</p>
          <ul className="list-disc ml-5 text-xs">
            {fw.framework.rules.map((r, i) => (
              <li key={i}>
                {`${r.id}: ${r.head} ← ${r.body.join(", ") || "∅"}`}
              </li>
            ))}
          </ul>
        </div>

        {/* Assumptions */}
        <div>
          <p className="font-medium">Assumptions:</p>
          <p className="ml-3">{`{${fw.framework.assumptions.join(", ")}}`}</p>
        </div>

        {/* Preferences */}
        {fw.framework.preferences && (
          <div>
            <p className="font-medium">Preferences:</p>
            <ul className="list-disc ml-5 text-xs">
              {Object.entries(fw.framework.preferences).map(([k, v]) => (
                <li key={k}>
                  {k} &gt; {v.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Contraries */}
        {fw.framework.contraries?.length > 0 && (
          <div>
            <p className="font-medium">Contraries:</p>
            <ul className="list-disc ml-5 text-xs">
              {fw.framework.contraries.map(([a, b], i) => (
                <li key={i}>
                  {`${a}\u0304 = ${b}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderArguments = (fw: FrameworkState) => {
    return (
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">Arguments</h3>
        <ul className="list-disc ml-5 text-sm max-h-40 overflow-y-auto">
          {(fw.arguments ?? [])
            .sort((a, b) => {
              const idA = a.match(/\[A(\d+)\]/)?.[1];
              const idB = b.match(/\[A(\d+)\]/)?.[1];
              if (idA && idB) return parseInt(idA) - parseInt(idB);
              return a.localeCompare(b);
            })
            .map((a, i) => (
              <li key={i} className="text-xs">{a}</li>
            ))}
        </ul>
      </div>
    );
  };

  const renderArgumentAttacks = (fw: FrameworkState) => {
    return (
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">Argument Attacks</h3>
        <ul className="list-disc ml-5 text-sm max-h-40 overflow-y-auto">
          {(fw.arguments_attacks ?? [])
            .sort()
            .map((a, i) => (
              <li key={i} className="text-xs text-[var(--attack-red)]">{a}</li>
            ))}
        </ul>
      </div>
    );
  };

  const renderAssumptionSets = (fw: FrameworkState) => {
    return (
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">Assumption Sets</h3>
        <ul className="list-disc ml-5 text-sm max-h-40 overflow-y-auto">
          {(fw.assumption_sets ?? []).map((s, i) => (
            <li key={i} className="text-xs">{s}</li>
          ))}
        </ul>
      </div>
    );
  };

  const renderAssumptionSetAttacks = (fw: FrameworkState) => {
    return (
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">Normal Attacks (Assumption Sets)</h3>
        <ul className="list-disc ml-5 text-sm max-h-40 overflow-y-auto">
          {(fw.assumption_set_attacks ?? [])
            .sort()
            .map((a, i) => (
              <li key={i} className="text-xs text-[var(--attack-red)]">{a}</li>
            ))}
        </ul>
      </div>
    );
  };

  const renderReverseAttacks = (fw: FrameworkState) => {
    return (
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">Reverse Attacks</h3>
        <ul className="list-disc ml-5 text-sm max-h-40 overflow-y-auto">
          {(fw.reverse_attacks ?? [])
            .sort()
            .map((r, i) => (
              <li key={i} className="text-xs text-[var(--reverse-blue)]">{r}</li>
            ))}
        </ul>
      </div>
    );
  };

  if (!results) {
    return (
      <div className="w-1/6 bg-[var(--background)] p-4 overflow-y-auto text-[var(--foreground)] flex-shrink-0 border-l border-[color-mix(in_oklab,var(--foreground)_20%,transparent)]">
        <div className="text-sm opacity-60 italic">No results yet.</div>
      </div>
    );
  }

  const isPlus = isABAPlus(results);
  const hasTransformation = results.meta.transformed;

  return (
    <div className="w-1/5 bg-[var(--background)] p-4 overflow-y-auto text-[var(--foreground)] flex-shrink-0 space-y-4 border-l border-[color-mix(in_oklab,var(--foreground)_20%,transparent)] flex flex-col text-xs">
      {/* Legend */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-xs space-y-1 sticky top-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-2 block bg-red-400"></span>
          <span>{isPlus ? "Normal Attack" : "Attack"}</span>
        </div>
        {isPlus && (
          <div className="flex items-center gap-2">
            <span className="w-3 h-2 block bg-blue-400"></span>
            <span>Reverse Attack</span>
          </div>
        )}
      </div>

      <h2 className="text-lg font-bold">{`ABA${isPlus ? "+" : ""} Results`}</h2>

      {/* Transformation Info */}
      {hasTransformation && (
        <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
          <h3 className="font-semibold mb-2">Transformation</h3>
          <p className="text-xs mb-2">
            {results.meta.transformations_applied.join(", ")}
          </p>
          {results.transformations?.[0]?.reason && (
            <p className="text-xs text-[var(--muted)]">
              {results.transformations[0].reason}
            </p>
          )}
        </div>
      )}

      {/* Before Transformation */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg space-y-2">
        <h3 className="font-semibold">Before Transformation</h3>
        {renderFrameworkDetails(results.before_transformation, "Original Framework")}
      </div>

      {renderArguments(results.before_transformation)}
      {renderArgumentAttacks(results.before_transformation)}

      {isPlus && (
        <>
          {renderAssumptionSets(results.before_transformation)}
          {(results.before_transformation.assumption_set_attacks?.length ?? 0) > 0 &&
            renderAssumptionSetAttacks(results.before_transformation)}
          {(results.before_transformation.reverse_attacks?.length ?? 0) > 0 &&
            renderReverseAttacks(results.before_transformation)}
        </>
      )}

      {/* Divider */}
      {hasTransformation && (
        <div className="border-t border-[var(--border)] my-2"></div>
      )}

      {/* After Transformation */}
      {hasTransformation && (
        <>
          <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg space-y-2">
            <h3 className="font-semibold">After Transformation</h3>
            {renderFrameworkDetails(results.after_transformation, "Transformed Framework")}
          </div>

          {renderArguments(results.after_transformation)}
          {renderArgumentAttacks(results.after_transformation)}

          {isPlus && (
            <>
              {renderAssumptionSets(results.after_transformation)}
              {(results.after_transformation.assumption_set_attacks?.length ?? 0) > 0 &&
                renderAssumptionSetAttacks(results.after_transformation)}
              {(results.after_transformation.reverse_attacks?.length ?? 0) > 0 &&
                renderReverseAttacks(results.after_transformation)}
            </>
          )}
        </>
      )}
    </div>
  );
}