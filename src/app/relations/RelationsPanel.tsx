"use client";
import { useEffect, useState } from "react";
import { GraphData, GraphNode } from "../components/types";
import { useCSVLoader } from "./utils/useCSVLoader";

interface RelationsPanelProps {
  graphData: GraphData;
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  onAddRelation: (arg1: string, arg2: string) => void;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  is3D: boolean;
  onToggleMode: () => void;
  setOriginalGraphData: React.Dispatch<React.SetStateAction<GraphData | null>>;
}

export default function RelationsPanel({
  graphData,
  setGraphData,
  onAddRelation,
  selectedNode,
  setSelectedNode,
  is3D,
  onToggleMode,
  setOriginalGraphData,
}: RelationsPanelProps) {
  const [arg1, setArg1] = useState("");
  const [arg2, setArg2] = useState("");

  const {
    loading,
    progress,
    samples,
    selectedSample,
    setSelectedSample,
    customFile,
    setCustomFile,
    handleLoadCSV,
    fetchSamples,
  } = useCSVLoader(setGraphData, setOriginalGraphData);

  useEffect(() => {
    fetchSamples();
  }, []);

  const canLoadCSV = !!customFile || !!selectedSample;
  const canAddRelation = !!arg1 && !!arg2;

  return (
    <div className="w-1/4 p-5 overflow-y-auto flex-shrink-0 border-r border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] border-r border-[color-mix(in_oklab,var(--foreground)_20%,transparent)]">
      {/* Mode toggle */}
      <div className="mb-4 p-3 rounded-lg flex items-center justify-between border border-[var(--border)] bg-[var(--surface-alt)]">
        <span>{is3D ? "3D Mode" : "2D Mode"}</span>
        <button
          onClick={onToggleMode}
          disabled={loading}
          className="px-3 py-1 rounded bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Switch to {is3D ? "2D" : "3D"}
        </button>
      </div>

      {/* CSV loader */}
      <div className="mb-6 p-4 rounded-lg shadow-inner bg-[var(--surface-alt)] border border-[var(--border)]">
        <label className="block font-semibold mb-2 text-[var(--foreground)]">Load CSV</label>

        <input
          type="file"
          accept=".csv"
          className="hidden"
          id="csvFile"
          onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
        />
        <label
          htmlFor="csvFile"
          className={`block w-full p-2 text-center rounded-lg cursor-pointer border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Upload .csv File"}
        </label>

        <p className="text-center text-[var(--muted)] my-3 text-sm">— or —</p>

        <select
          value={selectedSample}
          onChange={(e) => setSelectedSample(e.target.value)}
          className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--accent)] cursor-pointer transition"
        >
          <option value="">Choose an example</option>
          {samples.map((s) => (
            <option key={s} value={s}>
              {s.replace(".csv", "")}
            </option>
          ))}
        </select>

        <button
          onClick={handleLoadCSV}
          disabled={!canLoadCSV}
          className={`mt-4 w-full p-2 rounded-lg font-semibold text-[var(--foreground)] transition-all duration-200 ${
            canLoadCSV
              ? "bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:opacity-90 cursor-pointer"
              : "bg-[var(--accent)] opacity-50 cursor-not-allowed"
          }`}
        >
          {loading ? "Loading..." : "Load CSV"}
        </button>

        {loading && progress > 0 && (
          <div className="w-full bg-[var(--border)] h-3 mt-2 rounded">
            <div
              className="bg-[var(--secondary)] h-3 rounded"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Add Relation */}
      <div className="space-y-3 mt-6">
        <input
          value={arg1}
          onChange={(e) => setArg1(e.target.value)}
          placeholder="Argument 1"
          className="border border-[var(--border)] rounded-lg p-2 w-full bg-[var(--surface-alt)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
        />
        <input
          value={arg2}
          onChange={(e) => setArg2(e.target.value)}
          placeholder="Argument 2"
          className="border border-[var(--border)] rounded-lg p-2 w-full bg-[var(--surface-alt)] text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
        />
        <button
          onClick={() => {
            onAddRelation(arg1, arg2);
            setArg1("");
            setArg2("");
          }}
          disabled={!canAddRelation}
          className={`w-full px-4 py-2 rounded-lg font-semibold text-[var(--foreground)] transition-all duration-200 ${
            canAddRelation
              ? "bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] active:opacity-90 cursor-pointer"
              : "bg-[var(--secondary)] opacity-50 cursor-not-allowed"
          }`}
        >
          Add Relation
        </button>
      </div>

      {selectedNode && (
        <div className="mt-6 p-4 border border-[var(--border)] rounded-lg bg-[var(--surface-alt)] text-[var(--foreground)]">
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Text:</strong> {selectedNode.text}</p>
        </div>
      )}
    </div>
  );
}
