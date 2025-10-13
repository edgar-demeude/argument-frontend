"use client";
import { useEffect, useRef, useState } from "react";
import RelationsPanelProps from "./relationsPannelProps";
import { GraphWrapperRef } from "../components/GraphWrapper";
import { GraphData, GraphNode } from "../components/types";
import { API_URL } from "../../../config";
import RelationsGraph from "./RelationsGraph";

export default function RelationsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [is3D, setIs3D] = useState(true);

  const [originalGraphData, setOriginalGraphData] = useState<GraphData | null>(null);
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const graphRef = useRef<GraphWrapperRef>(null);

  // Initial resize / zoom
  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      graphRef.current?.zoomToFit?.(400, 50);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Zoom when graphData changes
  useEffect(() => {
    if (graphData.nodes.length > 0) {
      setTimeout(() => {
        graphRef.current?.zoomToFit?.(400, 50);
      }, 150);
    }
  }, [graphData]);

  // Toggle 2D/3D
  const handleToggleMode = () => {
    setIs3D(prev => !prev);
    if (originalGraphData) {
      // Reset graph using cached original data
      setGraphData(originalGraphData);
    }
    setTimeout(() => graphRef.current?.zoomToFit?.(400, 50), 100);
  };

  // Add relation (updates both cache and current graph)
  const handleAddRelation = async (arg1: string, arg2: string) => {
    if (!arg1 || !arg2) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/predict-text`, {
        method: "POST",
        body: new URLSearchParams({ arg1, arg2 }),
      });
      const data = await res.json();

      const newNode = (id: string) => ({ id, text: id });

      const updateGraph = (prev: GraphData): GraphData => {
        const nodes = [...prev.nodes];
        const links = [...prev.links];

        if (!nodes.find(n => n.id === arg1)) nodes.push(newNode(arg1));
        if (!nodes.find(n => n.id === arg2)) nodes.push(newNode(arg2));

        links.push({
          source: arg2,
          target: arg1,
          label: `${data.relation.predicted_label} (${(data.relation.probability * 100).toFixed(1)}%)`,
        });

        return { nodes, links };
      };

      setGraphData(prev => updateGraph(prev));
      setOriginalGraphData(prev => prev ? updateGraph(prev) : updateGraph(graphData));
    } catch (err) {
      console.error("Error adding relation:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <RelationsPanelProps
        graphData={graphData}
        setGraphData={setGraphData}
        onAddRelation={handleAddRelation}
        loading={loading}
        setLoading={setLoading}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        is3D={is3D}
        setIs3D={setIs3D}
        onToggleMode={handleToggleMode}
        setOriginalGraphData={setOriginalGraphData}
      />
      <div className="flex-1 h-full min-w-0 overflow-hidden relative">
        <RelationsGraph
          ref={graphRef}
          graphData={graphData}
          onNodeClick={node => setSelectedNode(node)}
          is3D={is3D}
        />
      </div>
    </div>
  );
}
