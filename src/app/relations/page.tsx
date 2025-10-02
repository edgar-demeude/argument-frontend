"use client";
import { useRef, useState } from "react";
import RelationsPannelProps from "./relationsPannelProps";
import Graph3D, { Graph3DRef } from "../components/graph3D";
import { GraphData, GraphNode } from "../components/types";
import { API_URL } from "../../../config";

export default function RelationsPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const graphRef = useRef<Graph3DRef>(null);

  const handleAddRelation = async (arg1: string, arg2: string) => {
    if (!arg1 || !arg2) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict-text`, {
        method: "POST",
        body: new URLSearchParams({ arg1, arg2 }),
      });
      const data = await res.json();

      setGraphData((prev) => {
        const nodes = [...prev.nodes];
        const links = [...prev.links];
        if (!nodes.find((n) => n.id === arg1)) nodes.push({ id: arg1, text: arg1 });
        if (!nodes.find((n) => n.id === arg2)) nodes.push({ id: arg2, text: arg2 });
        links.push({
          source: arg2,
          target: arg1,
          label: `${data.relation.predicted_label} (${(data.relation.probability * 100).toFixed(1)}%)`,
        });
        return { nodes, links };
      });

      // zoom to fit
      setTimeout(() => {
        graphRef.current?.zoomToFit?.(400, 50);
      }, 150);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <RelationsPannelProps
        setGraphData={setGraphData}
        onAddRelation={handleAddRelation}
        loading={loading}
        selectedNode={selectedNode}
      />
      <div className="flex-1 h-full min-w-0 overflow-hidden relative">
        <Graph3D
          ref={graphRef}
          graphData={graphData}
          onNodeClick={(node) => setSelectedNode(node)}
        />
      </div>
    </div>
  );
}