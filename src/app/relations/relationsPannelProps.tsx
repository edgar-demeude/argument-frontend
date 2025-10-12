"use client";
import { useEffect, useState } from "react";
import { GraphData, GraphNode } from "../components/types";
import { API_URL } from "../../../config";

interface GraphPanelProps {
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  onAddRelation: (arg1: string, arg2: string) => void;
  loading: boolean;
  selectedNode: GraphNode | null;
  setLoading: (val: boolean) => void;
}

interface CSVResult {
  parent: string;
  child: string;
  relation: {
    predicted_label: string;
    probability: number;
  };
}

export default function RelationsPanelProps({
  setGraphData,
  onAddRelation,
  loading,
  selectedNode,
  setLoading,
}: GraphPanelProps) {
  const [arg1, setArg1] = useState("");
  const [arg2, setArg2] = useState("");
  const [samples, setSamples] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>("");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch(`${API_URL}/samples`)
      .then((res) => res.json())
      .then((data) => setSamples(data.samples))
      .catch((err) => console.error("Error loading samples:", err));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const safeNode = (id: any) => ({ id: String(id), text: String(id) });

  const handleLoadCSV = async () => {
    setLoading(true);
    setProgress(0);
    setGraphData({ nodes: [], links: [] });

    const formData = new FormData();

    if (customFile) {
      formData.append("file", customFile);
    } else if (selectedSample) {
      const res = await fetch(`${API_URL}/samples/${selectedSample}`);
      const csvText = await res.text();
      formData.append("file", new Blob([csvText], { type: "text/csv" }), selectedSample);
    } else {
      alert("Please choose a sample or upload a CSV file.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/predict-csv-stream`, {
        method: "POST",
        body: formData,
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder("utf-8");
      const nodes: GraphNode[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const links: any[] = [];
      let buffer = "";

      while (true) {
        const { value, done } = await reader!.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n\n");
        buffer = parts.pop()!; // keep incomplete chunk for next loop

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const data = JSON.parse(part.replace("data: ", ""));

          if (!data.parent || !data.child) continue;

          if (!nodes.find((n) => n.id === data.parent)) nodes.push(safeNode(data.parent));
          if (!nodes.find((n) => n.id === data.child)) nodes.push(safeNode(data.child));

          links.push({
            source: data.child,
            target: data.parent,
            label: `${data.relation.predicted_label} (${(data.relation.probability * 100).toFixed(1)}%)`,
          });

          setGraphData({ nodes: [...nodes], links: [...links] });
          setProgress(data.progress);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setProgress(1);
    }
  };

  return (
    <div className="w-1/4 bg-gray-800 p-5 overflow-y-auto text-white flex-shrink-0">
      <h2 className="text-xl font-bold mb-4">Controls</h2>
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Argument 1 (parent)"
          value={arg1}
          onChange={(e) => setArg1(e.target.value)}
          className="border border-gray-600 rounded-lg p-2 w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          placeholder="Argument 2 (child)"
          value={arg2}
          onChange={(e) => setArg2(e.target.value)}
          className="border border-gray-600 rounded-lg p-2 w-full bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          onClick={() => onAddRelation(arg1, arg2)}
          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Add Relation"}
        </button>

        {/* CSV loader */}
        <div className="mt-6 p-4 bg-gray-700 rounded-lg shadow-inner">
          <label className="block text-white font-semibold mb-2">Load a CSV file</label>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCustomFile(e.target.files?.[0] || null)}
            className="block w-full p-2 text-sm text-gray-300 bg-gray-800 rounded-lg border border-gray-600 cursor-pointer hover:border-gray-400 focus:outline-none transition"
          />

          <p className="text-center text-gray-400 my-3 text-sm">— or —</p>

          <select
            value={selectedSample}
            onChange={(e) => setSelectedSample(e.target.value)}
            className="w-full p-2 rounded-lg bg-gray-800 border border-gray-600 text-white focus:ring-2 focus:ring-green-500 cursor-pointer transition"
          >
            <option value="">Choose an example</option>
            {samples.map((s) => (
              <option key={s} value={s}>{s.replace(".csv", "")}</option>
            ))}
          </select>

          <button
            onClick={handleLoadCSV}
            className={`mt-4 w-full p-2 rounded-lg font-semibold transition-all duration-200 ${
              loading ? "bg-green-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-500 active:bg-green-700 cursor-pointer"
            }`}
            disabled={loading}
          >
            {loading ? "Loading..." : "Load CSV"}
          </button>

          {/* Progress bar */}
          {loading && (
            <div className="w-full bg-gray-600 rounded-full h-3 mt-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.round(progress * 100)}%` }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Node details */}
      {selectedNode && (
        <div className="mt-6 p-4 border border-gray-600 rounded-lg bg-gray-700 text-white shadow">
          <h3 className="font-bold text-lg mb-2">Node Details</h3>
          <p className="text-sm"><span className="font-semibold">ID:</span> {selectedNode.id}</p>
          <p className="text-sm mt-1"><span className="font-semibold">Text:</span> {selectedNode.text}</p>
        </div>
      )}
    </div>
  );
}
