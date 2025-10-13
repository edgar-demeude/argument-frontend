"use client";
import { useEffect, useState } from "react";
import { GraphData, GraphNode } from "../components/types";
import { API_URL } from "../../../config";

interface RelationsPanelPropsProps {
  graphData: GraphData;
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  onAddRelation: (arg1: string, arg2: string) => void;
  loading: boolean;
  setLoading: (val: boolean) => void;
  selectedNode: GraphNode | null;
  setSelectedNode: (node: GraphNode | null) => void;
  is3D: boolean;
  setIs3D: (val: boolean) => void;
  onToggleMode: () => void;
  setOriginalGraphData: React.Dispatch<React.SetStateAction<GraphData | null>>;
}

interface CSVResult {
  parent: string;
  child: string;
  relation: {
    predicted_label: string;
    probability: number;
  };
  progress?: number;
}

export default function RelationsPanelProps({
  graphData,
  setGraphData,
  loading,
  setLoading,
  selectedNode,
  setSelectedNode,
  is3D,
  onToggleMode,
  setOriginalGraphData,
}: RelationsPanelPropsProps) {
  const [arg1, setArg1] = useState("");
  const [arg2, setArg2] = useState("");
  const [samples, setSamples] = useState<string[]>([]);
  const [selectedSample, setSelectedSample] = useState<string>("");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const res = await fetch(`${API_URL}/samples`);
        const data = await res.json();
        setSamples(data.samples || []);
      } catch (err) {
        console.error("Error loading samples:", err);
      }
    };
    fetchSamples();
  }, []);

  const safeNode = (id: string | number) => ({ id: String(id), text: String(id) });

  // Chargement CSV ou sample
  const handleLoadCSV = async () => {
    if (!customFile && !selectedSample) {
      alert("Choose a CSV or sample.");
      return;
    }

    setLoading(true);
    setProgress(0);

    const formData = new FormData();
    try {
      if (customFile) formData.append("file", customFile);
      else if (selectedSample) {
        const res = await fetch(`${API_URL}/samples/${selectedSample}`);
        const csvText = await res.text();
        formData.append("file", new Blob([csvText], { type: "text/csv" }), selectedSample);
      }

      const res = await fetch(`${API_URL}/predict-csv-stream`, { method: "POST", body: formData });
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      const nodes: typeof graphData.nodes = [];
      const links: typeof graphData.links = [];
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          try {
            const data: CSVResult = JSON.parse(part.replace("data: ", ""));
            if (!data.parent || !data.child) continue;

            if (!nodes.find((n) => n.id === data.parent)) nodes.push(safeNode(data.parent));
            if (!nodes.find((n) => n.id === data.child)) nodes.push(safeNode(data.child));

            links.push({
              source: data.child,
              target: data.parent,
              label: `${data.relation.predicted_label} (${(data.relation.probability * 100).toFixed(1)}%)`,
            });

            setGraphData({ nodes: [...nodes], links: [...links] });
            setOriginalGraphData({ nodes: [...nodes], links: [...links] });
            setProgress(data.progress || 0);
          } catch (err) {
            console.error("Streaming parse error:", err);
          }
        }
      }
    } catch (err) {
      console.error("CSV load error:", err);
      alert("Failed to load CSV.");
    } finally {
      setLoading(false);
      setProgress(0);
      setCustomFile(null);
      setSelectedSample("");
    }
  };

  // Ajout d'une relation manuelle
  const handleAddRelation = async () => {
    if (!arg1 || !arg2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict-text`, {
        method: "POST",
        body: new URLSearchParams({ arg1, arg2 }),
      });
      const data = await res.json();

      const updateGraph = (prev: GraphData): GraphData => {
        const nodes = [...prev.nodes];
        const links = [...prev.links];

        if (!nodes.find((n) => n.id === arg1)) nodes.push(safeNode(arg1));
        if (!nodes.find((n) => n.id === arg2)) nodes.push(safeNode(arg2));

        links.push({
          source: arg2,
          target: arg1,
          label: `${data.relation.predicted_label} (${(data.relation.probability * 100).toFixed(1)}%)`,
        });

        return { nodes, links };
      };

      setGraphData(prev => updateGraph(prev));
      setOriginalGraphData(prev => prev ? updateGraph(prev) : updateGraph(graphData));

      setArg1("");
      setArg2("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-1/4 bg-gray-800 p-5 overflow-y-auto text-white flex-shrink-0">
      {/* Mode Toggle */}
      <div className="mb-4 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
        <span>{is3D ? "3D Mode" : "2D Mode"}</span>
        <button onClick={onToggleMode} disabled={loading} className="bg-purple-600 px-3 py-1 rounded hover:bg-purple-500">
          Switch to {is3D ? "2D" : "3D"}
        </button>
      </div>

      {/* Add Relation */}
      <div className="space-y-3 mb-6">
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
          onClick={handleAddRelation} 
          className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500 cursor-pointer"
          }`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Add Relation"}
        </button>
      </div>

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
        {loading && progress > 0 && (
          <div className="w-full bg-gray-600 h-3 mt-2 rounded">
            <div className="bg-blue-500 h-3 rounded" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
        )}
      </div>

      {/* Node details */}
      {selectedNode && (
        <div className="mt-6 p-4 border border-gray-600 rounded-lg bg-gray-700">
          <p>ID: {selectedNode.id}</p>
          <p>Text: {selectedNode.text}</p>
        </div>
      )}
    </div>
  );
}
