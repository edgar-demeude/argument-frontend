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
    <div className="w-1/4 bg-gray-800 p-5 overflow-y-auto text-white flex-shrink-0">
      {/* Mode toggle */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
        <span>{is3D ? "3D Mode" : "2D Mode"}</span>
        <button
          onClick={onToggleMode}
          disabled={loading}
          className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-500 transition"
        >
          Switch to {is3D ? "2D" : "3D"}
        </button>
      </div>

      {/* CSV loader */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg shadow-inner">
        <label className="block text-white font-semibold mb-2">Load CSV</label>

        <input
          type="file"
          accept=".csv"
          className="hidden"
          id="csvFile"
          onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
        />
        <label
          htmlFor="csvFile"
          className={`block w-full p-2 text-center rounded-lg cursor-pointer border border-gray-600 bg-gray-800 hover:border-gray-400 transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Upload .csv File"}
        </label>

        <p className="text-center text-gray-400 my-3 text-sm">— or —</p>

        <select
          value={selectedSample}
          onChange={(e) => setSelectedSample(e.target.value)}
          className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 cursor-pointer transition"
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
          className={`mt-4 w-full p-2 rounded-lg font-semibold text-white transition-all duration-200 ${
            canLoadCSV
              ? "bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer"
              : "bg-green-400 text-gray-200 cursor-not-allowed"
          }`}
          disabled={!canLoadCSV}
        >
          {loading ? "Loading..." : "Load CSV"}
        </button>

        {loading && progress > 0 && (
          <div className="w-full bg-gray-600 h-3 mt-2 rounded">
            <div className="bg-blue-500 h-3 rounded" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
      </div>

      {/* Add Relation */}
      <div className="space-y-3 mt-6">
        <input
          value={arg1}
          onChange={(e) => setArg1(e.target.value)}
          placeholder="Argument 1"
          className="border border-gray-600 rounded-lg p-2 w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          value={arg2}
          onChange={(e) => setArg2(e.target.value)}
          placeholder="Argument 2"
          className="border border-gray-600 rounded-lg p-2 w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          onClick={() => {
            onAddRelation(arg1, arg2);
            setArg1("");
            setArg2("");
          }}
          className={`w-full px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 ${
            canAddRelation
              ? "bg-blue-600 hover:bg-blue-700 active:bg-blue-800 cursor-pointer"
              : "bg-blue-400 text-gray-200 cursor-not-allowed"
          }`}
          disabled={!canAddRelation}
        >
          Add Relation
        </button>
      </div>

      {selectedNode && (
        <div className="mt-6 p-4 border border-gray-600 rounded-lg bg-gray-700">
          <p><strong>ID:</strong> {selectedNode.id}</p>
          <p><strong>Text:</strong> {selectedNode.text}</p>
        </div>
      )}
    </div>
  );
}
