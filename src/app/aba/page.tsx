"use client";
import { useRef, useState } from "react";
import ABAPanel from "./abaPannelProps";
import { GraphData, GraphNode } from "../components/types";
import Graph3D, { Graph3DRef } from "../components/graph3D";
import { API_URL } from "../../../config";

export default function ABAPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<Graph3DRef>(null);

  // Handler to generate an ABA framework from textarea text
  const handleGenerateABA = async (inputText: string) => {
    if (!inputText) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/generate-aba`, {
        method: "POST",
        body: new URLSearchParams({ text: inputText }),
      });
      const data = await res.json();

      // API output transformation -> GraphData
      const nodes = data.nodes.map((n: any) => ({ id: n.id, text: n.text }));
      const links = data.attacks.map((a: any) => ({ source: a.from, target: a.to, label: "attacks" }));

      setGraphData({ nodes, links });

      // Zoom in the graph
      setTimeout(() => {
        graphRef.current?.zoomToFit?.(400, 50);
      }, 150);
    } catch (error) {
      console.error("Erreur lors de la génération ABA :", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ABAPanel
        setGraphData={setGraphData}
        onGenerateABA={handleGenerateABA}
        loading={loading}
        selectedNode={selectedNode}
      />
      <div className="flex-1 h-full">
        <Graph3D
          ref={graphRef}
          graphData={graphData}
          onNodeClick={(node) => setSelectedNode(node)}
        />
      </div>
    </div>
  );
}
