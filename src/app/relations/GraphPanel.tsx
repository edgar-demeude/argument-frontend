"use client";
import { useState } from "react";
import { GraphData, GraphNode } from "./types";
import { sampleCSV1, sampleCSV2, parseCSVString } from "./sampleCSV";

interface GraphPanelProps {
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  onAddRelation: (arg1: string, arg2: string) => void;
  loading: boolean;
  selectedNode: GraphNode | null;
}

export default function GraphPanel({
  setGraphData,
  onAddRelation,
  loading,
  selectedNode,
}: GraphPanelProps) {
  const [arg1, setArg1] = useState("");
  const [arg2, setArg2] = useState("");
  const [selectedSample, setSelectedSample] = useState<"sample1" | "sample2">("sample1");

  const handleLoadSampleCSV = () => {
    const csvString = selectedSample === "sample1" ? sampleCSV1 : sampleCSV2;
    const rows = parseCSVString(csvString);
    if (!rows.length) return;

    setGraphData({ nodes: [], links: [] }); // reset graph before loading
    setGraphData((prev) => {
      const nodes = [...prev.nodes];
      const links = [...prev.links];

      rows.forEach((r) => {
        if (!nodes.find((n) => n.id === r.parent)) nodes.push({ id: r.parent, text: r.parent });
        if (!nodes.find((n) => n.id === r.child)) nodes.push({ id: r.child, text: r.child });
        links.push({ source: r.child, target: r.parent, label: r.relation.trim() });
      });

      return { nodes, links };
    });
  };

  return (
    <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0">
      <h2 className="text-xl font-bold mb-4">Controls</h2>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Argument 1 (parent)"
          value={arg1}
          onChange={(e) => setArg1(e.target.value)}
          className="border rounded p-2 w-full bg-gray-700 text-white placeholder-gray-300"
        />
        <input
          type="text"
          placeholder="Argument 2 (child)"
          value={arg2}
          onChange={(e) => setArg2(e.target.value)}
          className="border rounded p-2 w-full bg-gray-700 text-white placeholder-gray-300"
        />
        <button
          onClick={() => onAddRelation(arg1, arg2)}
          className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "Loading..." : "Add Relation"}
        </button>
        <div className="mt-4 space-y-2">
          <label className="block text-white font-semibold">Load Sample CSV:</label>
          <select
            value={selectedSample}
            onChange={(e) => setSelectedSample(e.target.value as "sample1" | "sample2")}
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="sample1">Sample CSV 1 (20 pairs)</option>
            <option value="sample2">Sample CSV 2 (another 20 pairs)</option>
          </select>
          <button
            onClick={handleLoadSampleCSV}
            className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2"
          >
            Load Selected Sample
          </button>
        </div>
      </div>
      {selectedNode && (
        <div className="mt-6 p-3 border rounded bg-gray-700 text-white shadow">
          <h3 className="font-bold text-lg">Node Details</h3>
          <p>
            <span className="font-semibold">ID:</span> {selectedNode.id}
          </p>
          <p>
            <span className="font-semibold">Text:</span> {selectedNode.text}
          </p>
        </div>
      )}
    </div>
  );
}