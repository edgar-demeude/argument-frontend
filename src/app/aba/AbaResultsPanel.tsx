"use client";
import { ABAApiResponse } from "../components/types";

interface ABAResultsPanelProps {
  results: ABAApiResponse | null;
}

export default function ABAResultsPanel({ results }: ABAResultsPanelProps) {
  const isABAPlus = results?.reverse_attacks && results.reverse_attacks.length > 0;

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
    return match ? `{${match[0].match(/\{([^}]*)\}/)?.[1]}} ⊢ ${match[1]}` : arg;
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

  return (
    <div className="w-1/6 bg-[var(--background)] p-4 overflow-y-auto text-[var(--foreground)] flex-shrink-0 space-y-4 border-l border-[color-mix(in_oklab,var(--foreground)_20%,transparent)] flex flex-col">
      
      {/* Legend always at the top */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg text-sm space-y-1">
        <div className="flex items-center gap-2">
          <span className="w-4 h-2 block bg-[var(--attack-red)]"></span>
          <span>Red arrows → : Attacks</span>
        </div>
        {isABAPlus && (
          <div className="flex items-center gap-2">
            <span className="w-4 h-2 block bg-[var(--reverse-blue)]"></span>
            <span>Blue arrows → : Reverse attacks</span>
          </div>
        )}
      </div>

      {/* Results Title */}
      <h2 className="text-xl font-bold">{`ABA${isABAPlus ? "+" : ""} Results`}</h2>

      {/* Assumptions */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">Assumptions</h3>
        <ul className="list-disc ml-5">
          {(results?.assumptions ?? []).map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      {/* Arguments */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">Arguments</h3>
        <ul className="list-disc ml-5">
          {(results?.arguments ?? []).map((a, i) => (
            <li key={i}>{formatArgument(a)}</li>
          ))}
        </ul>
      </div>

      {/* Normal Attacks */}
      <div className="p-3 bg-[var(--surface-alt)] border border-[var(--border)] rounded-lg">
        <h3 className="font-semibold mb-2">{isABAPlus ? "Normal Attacks" : "Attacks"}</h3>
        <ul className="list-disc ml-5">
          {(results?.attacks ?? []).map((a, i) => (
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
            {(results?.reverse_attacks ?? []).map((r, i) => (
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