"use client";
import { ABAApiResponse } from "../components/types";

interface ABAResultsPanelProps {
  results: ABAApiResponse | null;
}

export default function ABAResultsPanel({ results }: ABAResultsPanelProps) {
  // const isABAPlus = results?.reverse_attacks && results.reverse_attacks.length > 0;
  const isABAPlus =
    (results?.aba_plus?.reverse_attacks &&
      results.aba_plus.reverse_attacks.length > 0) ||
    (results?.aba_plus?.normal_attacks &&
      results.aba_plus.normal_attacks.length > 0)

  // Map argument IDs to sets for ABA+
  const idToSetMap: Record<string, string> = {};
  if (isABAPlus && results) {
    results.arguments.forEach((arg) => {
      const match = arg.match(/^\[([A0-9]+)\]=\{([^}]*)\}/);
      if (match) {
        const id = match[1];
        const setStr = `{${match[2]}}`;
        idToSetMap[id] = setStr;
      }
    });
  }

  const formatArgument = (arg: string) => {
    if (!isABAPlus) return arg;
    const match = arg.match(/^\[[A0-9]+\]=\{[^}]*\} ⊢ (.*)$/);
    return match
      ? `{${match[0].match(/\{([^}]*)\}/)?.[1]}} ⊢ ${match[1]}` :
      arg;
  };

  const formatAttack = (att: string) => {
    if (!isABAPlus) return att;
    const parts = att.split("→").map((p) => p.trim());
    const sourceId = parts[0].replace(/[\[\]]/g, "");
    const targetId = parts[1].replace(/[\[\]]/g, "");
    return `${idToSetMap[sourceId] ?? parts[0]} → ${idToSetMap[targetId] ?? parts[1]}`;
  };

  const formatReverseAttack = (r: string) => {
    if (!isABAPlus) return r;
    const match = r.match(/\{([^}]*)\}.*\{([^}]*)\}/);
    return match ? `{${match[1]}} → {${match[2]}}` : r;
  };

  // --- Transformation rendering ---
  const renderTransformations = () => {
    if (!results?.transformations || results.transformations.length === 0)
      return (
        <p className="text-sm opacity-70 italic">
          No transformation data available.
        </p>
      );
    const steps = results.transformations;
    const allNone = steps.every((t) => !t.applied);
    if (allNone) {
      return (
        <p className="text-sm text-[var(--muted)]">
          The framework is already non-circular and atomic.
        </p>
      );
    }
    return (
      <div className="space-y-3 text-sm">
        {steps.map((t, i) => (
          <div key={i} className="space-y-1">
            <p className="font-semibold">
              {t.step === "non_circular"
                ? "Circular → Transformed to Non-Circular"
                : t.step === "atomic"
                  ? "Non-Atomic → Transformed to Atomic"
                  : "No Transformation"}
            </p>
            {t.reason && (
              <p className="text-[var(--muted)] text-xs">{t.reason}</p>
            )}
            {t.result_snapshot && (
              <div className="text-xs mt-1">
                <p className="font-medium">New Language:</p>
                <p className="ml-3 text-[color-mix(in_oklab,var(--foreground)_85%,transparent)]">
                  {`{${t.result_snapshot.language.join(", ")}}`}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const display_arguments = (
    <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
      <h3 className="font-semibold mb-2">Arguments</h3>
      <ul className="list-disc ml-5">
        {([...((results?.arguments ?? []) as string[])])
          .sort((a, b) => {
            // extract A1, A2 ... from "[A1]=" pattern if present
            const idA = a.match(/\[A(\d+)\]/)?.[1];
            const idB = b.match(/\[A(\d+)\]/)?.[1];
            if (idA && idB) return parseInt(idA) - parseInt(idB);
            return a.localeCompare(b);
          })
          .map((a, i) => (
            <li key={i}>{formatArgument(a)}</li>
          ))}
      </ul>
    </div>
  );

  const display_assumption_sets = (
    <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
      <h3 className="font-semibold mb-2">Assumption Combinations</h3>
      <ul className="list-disc ml-5">
        {(results?.aba_plus.assumption_combinations ?? []).map((a, i) => (
          <li key={i}>{a}</li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="w-1/6 bg-[var(--background)] p-4 overflow-y-auto text-[var(--foreground)] flex-shrink-0 space-y-4 border-l border-[color-mix(in_oklab,var(--foreground)_20%,transparent)] flex flex-col">

      {/* Legend always at the top */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 block bg-[var(--attack-red)]"></span>
          <span>Red arrow → : {isABAPlus ? "Normal Attack" : "Attack"}</span>
        </div>
        {(() => { console.log(isABAPlus ? "yes" : "no"); return null; })()}
        {isABAPlus && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-2 block bg-[var(--reverse-blue)]"></span>
            <span>Blue arrow → : Reverse Attack</span>
          </div>
        )}
      </div>

      {/* Results Title */}
      <h2 className="text-xl font-bold">{`ABA${isABAPlus ? "+" : ""} Results`}</h2>

      {/* --- Transformation Section --- */}
      {results && (
        <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
          <h3 className="font-semibold mb-3">Transformation Status</h3>

          {/* If no transformation */}
          {results.transformations?.every((t) => !t.applied) ? (
            <p className="text-sm text-[var(--muted)]">
              The framework is already non-circular and atomic.
            </p>
          ) : (
            <>
              {/* Original Framework */}
              {results.original_framework && (
                <div className="mb-3 text-sm space-y-2">
                  <h4 className="font-semibold text-[var(--accent)]">
                    Original Framework
                  </h4>

                  {/* Language */}
                  <div>
                    <p className="font-medium">Language:</p>
                    <p className="ml-3 text-[color-mix(in_oklab,var(--foreground)_85%,transparent)]">
                      {`{${results.original_framework.language.join(", ")}}`}
                    </p>
                  </div>

                  {/* Rules */}
                  <div>
                    <p className="font-medium">Rules:</p>
                    <ul className="list-disc ml-5 text-xs">
                      {results.original_framework.rules.map((r, i) => (
                        <li key={i}>
                          {`${r.id}: ${r.head} ← ${r.body.join(", ") || "∅"}`}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Assumptions */}
                  <div>
                    <p className="font-medium">Assumptions:</p>
                    <p className="ml-3">{`{${results.original_framework.assumptions.join(", ")}}`}</p>
                  </div>

                  {/* Preferences */}
                  {results.original_framework.preferences && (
                    <div>
                      <p className="font-medium">Preferences:</p>
                      <ul className="list-disc ml-5 text-xs">
                        {Object.entries(results.original_framework.preferences).map(([k, v]) => (
                          <li key={k}>
                            {k} &gt; {v.join(", ")}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Contraries */}
                  {results.original_framework.contraries &&
                    results.original_framework.contraries.length > 0 && (
                      <div>
                        <p className="font-medium">Contraries:</p>
                        <ul className="list-disc ml-5 text-xs">
                          {results.original_framework.contraries.map(([a, b], i) => (
                            <li key={i}>
                              {`${a}\u0304 = ${b}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                </div>
              )}

              {/* Reason(s) for transformation */}
              {results.transformations && results.transformations.length > 0 && (
                <div className="text-xs text-[var(--muted)] italic mb-3 space-y-1">
                  {results.transformations.map((t, i) => (
                    <p key={i}>
                      <span className="font-semibold text-[var(--accent)]">
                        {t.step === "non_circular"
                          ? "Circular → Non-Circular:"
                          : t.step === "atomic"
                            ? "Non-Atomic → Atomic:"
                            : "Transformation:"}
                      </span>{" "}
                      {t.reason || "No reason provided."}
                    </p>
                  ))}
                </div>
              )}

              {/* Transformed Framework */}
              {results.final_framework && (
                <div className="text-sm space-y-2">
                  <h4 className="font-semibold text-[var(--accent)]">
                    Transformed Framework
                  </h4>

                  {/* Language */}
                  <div>
                    <p className="font-medium">Language:</p>
                    <p className="ml-3 text-[color-mix(in_oklab,var(--foreground)_85%,transparent)]">
                      {`{${results.final_framework.language.join(", ")}}`}
                    </p>
                  </div>

                  {/* Rules */}
                  <div>
                    <p className="font-medium">Rules:</p>
                    <ul className="list-disc ml-5 text-xs">
                      {results.final_framework.rules.map((r, i) => (
                        <li key={i}>
                          {`${r.id}: ${r.head} ← ${r.body.join(", ") || "∅"}`}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Assumptions */}
                  <div>
                    <p className="font-medium">Assumptions:</p>
                    <p className="ml-3">{`{${results.final_framework.assumptions.join(", ")}}`}</p>
                  </div>

                  {/* Contraries */}
                  {results.final_framework.contraries &&
                    results.final_framework.contraries.length > 0 && (
                      <div>
                        <p className="font-medium">Contraries:</p>
                        <ul className="list-disc ml-5 text-xs">
                          {results.final_framework.contraries.map(([a, b], i) => (
                            <li key={i}>
                              {`${a}\u0304 = ${b}`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Arguments */}

      {isABAPlus ? display_assumption_sets : display_arguments}

      {/* Normal Attacks */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">
          {isABAPlus ? "Normal Attacks" : "Attacks"}
        </h3>
        <ul className="list-disc ml-5">
          {([...((results?.attacks ?? []) as string[])])
            .sort((a, b) => {
              const srcA = a.split("→")[0]?.trim();
              const srcB = b.split("→")[0]?.trim();

              // Extract A1, A12, etc.
              const numA = srcA.match(/A(\d+)/)?.[1];
              const numB = srcB.match(/A(\d+)/)?.[1];

              if (numA && numB) {
                return parseInt(numA) - parseInt(numB);
              }

              // fallback: lexicographic
              return srcA.localeCompare(srcB);
            })
            .map((a, i) => (
              <li key={i} className="text-[var(--attack-red)]">
                {formatAttack(a)}
              </li>
            ))}
        </ul>
      </div>


      {/* Reverse Attacks */}
      {isABAPlus && (
        <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
          <h3 className="font-semibold mb-2">Reverse Attacks</h3>
          <ul className="list-disc ml-5">
            {(results?.aba_plus?.reverse_attacks ?? []).map((r, i) => (
              <li key={i} className="text-[var(--reverse-blue)]">
                {formatReverseAttack(r)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No results message */}
      {!results && (
        <div className="text-sm opacity-60 italic text-[color-mix(in_oklab,var(--foreground)_70%,transparent)]">
          No results yet.
        </div>
      )}
    </div>
  );
}