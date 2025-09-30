"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

// Charger react-force-graph côté client uniquement
const ForceGraph2D = dynamic(
  () => import("react-force-graph").then((mod) => mod.ForceGraph2D),
  { ssr: false }
);

interface GraphData {
  nodes: { id: string; text: string }[];
  links: { source: string; target: string; label: string }[];
}

export default function RelationsPage() {
  const [arg1, setArg1] = useState("");
  const [arg2, setArg2] = useState("");
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // ---- API appels ----
  const handleTextSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://my-backend.onrender.com/predict-text", {
        method: "POST",
        body: new URLSearchParams({ arg1, arg2 }),
      });
      const data = await res.json();

      setGraphData({
        nodes: [
          { id: arg1, text: arg1 },
          { id: arg2, text: arg2 },
        ],
        links: [{ source: arg1, target: arg2, label: data.relation }],
      });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleCSVSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await fetch("https://my-backend.onrender.com/predict-csv", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      const nodes: { id: string; text: string }[] = [];
      const links: { source: string; target: string; label: string }[] = [];

      data.results.forEach((row: any) => {
        if (!nodes.find((n) => n.id === row.parent))
          nodes.push({ id: row.parent, text: row.parent });
        if (!nodes.find((n) => n.id === row.child))
          nodes.push({ id: row.child, text: row.child });
        links.push({ source: row.parent, target: row.child, label: row.relation });
      });

      setGraphData({ nodes, links });
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen">
      {/* Panel gauche */}
      <div className="w-1/4 bg-gray-100 p-4 overflow-y-auto border-r space-y-6">
        <h2 className="text-xl font-bold">Contrôle</h2>

        {/* Input manuel */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Argument 1"
            value={arg1}
            onChange={(e) => setArg1(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <input
            type="text"
            placeholder="Argument 2"
            value={arg2}
            onChange={(e) => setArg2(e.target.value)}
            className="border rounded p-2 w-full"
          />
          <button
            onClick={handleTextSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Chargement..." : "Prédire relation"}
          </button>
        </div>

        {/* Upload CSV */}
        <div>
          <h3 className="font-semibold mb-1">Charger un CSV</h3>
          <input type="file" accept=".csv" onChange={handleCSVSubmit} />
        </div>

        {/* Infos sur le noeud sélectionné */}
        {selectedNode && (
          <div className="mt-6 p-3 border rounded bg-white shadow">
            <h3 className="font-bold text-lg">Détails du nœud</h3>
            <p><span className="font-semibold">ID :</span> {selectedNode.id}</p>
            <p><span className="font-semibold">Texte :</span> {selectedNode.text}</p>
          </div>
        )}
      </div>

      {/* Zone du graphe */}
      <div className="flex-1">
        {graphData && (
          <ForceGraph2D
            graphData={graphData}
            nodeLabel="id"
            linkLabel="label"
            nodeAutoColorBy="id"
            linkDirectionalArrowLength={6}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.2}
            onNodeClick={(node) => setSelectedNode(node)}
          />
        )}
      </div>
    </div>
  );
}
