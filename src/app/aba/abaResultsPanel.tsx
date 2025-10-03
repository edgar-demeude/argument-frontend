"use client";
import { ABAApiResponse } from "../components/types";

interface ABAResultsPanelProps {
  results: ABAApiResponse | null;
}

export default function ABAResultsPanel({ results }: ABAResultsPanelProps) {
  if (!results) return <div className="w-1/6 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0">No results available.</div>;

  return (
    <div className="w-1/6 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0">
      <h2 className="text-xl font-bold mb-4">ABA+ Results</h2>

      <div className="mb-4">
        <h3 className="font-semibold">Assumptions</h3>
        <ul className="list-disc ml-5">
          {(results.assumptions ?? []).map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Arguments</h3>
        <ul className="list-disc ml-5">
          {(results.arguments ?? []).map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Attacks</h3>
        <ul className="list-disc ml-5">
          {(results.attacks ?? []).map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold">Reverse Attacks</h3>
        <ul className="list-disc ml-5">
          {(results.reverse_attacks ?? []).map((r, i) => <li key={i}>{r}</li>)}
        </ul>
      </div>
    </div>
  );
}
