"use client";
import { ABAApiResponse } from "../components/types";

interface ABAResultsPanelProps {
  results: ABAApiResponse | null;
}

export default function ABAResultsPanel({ results }: ABAResultsPanelProps) {
  if (!results)
    return (
      <div className="w-1/6 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0">
        No results available.
      </div>
    );

  // Detect ABA+ by presence of reverse_attacks
  const isABAPlus = results.reverse_attacks && results.reverse_attacks.length > 0;

  // Map argument id to set string for ABA+
  const idToSetMap: Record<string, string> = {};
  if (isABAPlus) {
    results.arguments.forEach((arg) => {
      // "[A8]={c,a} ⊢ s" → id: "A8", set: "{c,a}"
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
    const sourceId = parts[0].replace(/[\[\]]/g, ""); // "A7"
    const targetId = parts[1].replace(/[\[\]]/g, "");
    return `${idToSetMap[sourceId] ?? parts[0]} → ${idToSetMap[targetId] ?? parts[1]}`;
  };

  const formatReverseAttack = (r: string) => {
    if (!isABAPlus) return r;
    // "(frozenset({c, a}), frozenset({c, b}))" → "{c,a} → {c,b}"
    const match = r.match(/\{([^}]*)\}.*\{([^}]*)\}/);
    return match ? `{${match[1]}} → {${match[2]}}` : r;
  };

  return (
    <div className="w-1/6 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0">
      <h2 className="text-xl font-bold mb-4">ABA{isABAPlus ? "+" : ""} Results</h2>

      <div className="mb-4">
        <h3 className="font-semibold">Assumptions</h3>
        <ul className="list-disc ml-5">
          {(results.assumptions ?? []).map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Arguments</h3>
        <ul className="list-disc ml-5">
          {(results.arguments ?? []).map((a, i) => (
            <li key={i}>{formatArgument(a)}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">
          {isABAPlus ? "Normal Attacks" : "Attacks"}
        </h3>
        <ul className="list-disc ml-5">
          {(results.attacks ?? []).map((a, i) => (
            <li key={i}>{formatAttack(a)}</li>
          ))}
        </ul>
      </div>

      {isABAPlus && (
        <div>
          <h3 className="font-semibold">Reverse Attacks</h3>
          <ul className="list-disc ml-5">
            {(results.reverse_attacks ?? []).map((r, i) => (
              <li key={i}>{formatReverseAttack(r)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
