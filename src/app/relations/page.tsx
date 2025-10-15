"use client";
import { useEffect, useRef, useState } from "react";
import RelationsPanel from "./relationsPanel";
import RelationsGraph from "./RelationsGraph";
import { GraphWrapperRef } from "../components/GraphWrapper";
import { GraphData, GraphNode } from "../components/types";
import { API_URL } from "../../../config";

export default function RelationsPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [originalGraphData, setOriginalGraphData] = useState<GraphData | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [is3D, setIs3D] = useState(true);

  const graphRef = useRef<GraphWrapperRef>(null);

  /** Zoom helper */
  const zoomToFit = (delay = 0) => {
    setTimeout(() => graphRef.current?.zoomToFit?.(400, 50), delay);
  };

  /** Initial zoom on mount */
  useEffect(() => {
    zoomToFit(200);
    window.dispatchEvent(new Event("resize"));
  }, []);

  /** Zoom when graph data changes */
  useEffect(() => {
    if (graphData.nodes.length > 0) zoomToFit(150);
  }, [graphData]);

  useEffect(() => {
    const resize = () => {
      window.dispatchEvent(new Event("resize"));
      graphRef.current?.zoomToFit?.(400, 50);
    };

    // Call after mount
    const timer1 = setTimeout(resize, 100);
    const timer2 = setTimeout(resize, 300); // ensure layout is done

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  /** Toggle between 2D and 3D mode */
  const handleToggleMode = () => {
    setIs3D(prev => !prev);
    if (originalGraphData) setGraphData(originalGraphData);
    zoomToFit(100);
  };

  /** Add relation between two arguments */
  const handleAddRelation = async (arg1: string, arg2: string) => {
    if (!arg1 || !arg2) return;

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
      setOriginalGraphData(prev => (prev ? updateGraph(prev) : updateGraph(graphData)));
    } catch (err) {
      console.error("Error adding relation:", err);
    }
  };

  return (
    <div className="flex h-screen">
      <RelationsPanel
        graphData={graphData}
        setGraphData={setGraphData}
        onAddRelation={handleAddRelation}
        selectedNode={selectedNode}
        setSelectedNode={setSelectedNode}
        is3D={is3D}
        onToggleMode={handleToggleMode}
        setOriginalGraphData={setOriginalGraphData}
      />

      <div className="flex-1 h-full min-w-0 overflow-hidden relative">
        <RelationsGraph
          ref={graphRef}
          graphData={graphData}
          onNodeClick={setSelectedNode}
          is3D={is3D}
        />
      </div>
    </div>
  );
}
