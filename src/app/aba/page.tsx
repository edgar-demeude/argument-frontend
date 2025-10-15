"use client";
import { useEffect, useRef, useState } from "react";
import ABAPanel from "./abaPanelProps";
import ABAResultsPanel from "./abaResultsPanel";
import { GraphData, GraphLink, GraphNode, ABAApiResponse } from "../components/types";
import { GraphWrapperRef } from "../components/GraphWrapper";
import { API_URL } from "../../../config";
import ABAGraph3D from "./ABAGraph3D";

export default function ABAPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [abaResults, setAbaResults] = useState<ABAApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // currently selected file
  const graphRef = useRef<GraphWrapperRef>(null);
  const [is3D, setIs3D] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
      graphRef.current?.zoomToFit?.(400, 50);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleMode = () => setIs3D(prev => !prev);

  const generateGraph = (data: ABAApiResponse) => {
    const cleanLabel = (arg: string) =>
      arg.startsWith("[") && arg.indexOf("]") > 0 ? arg.slice(1, arg.indexOf("]")) : arg;

    const nodes: GraphNode[] = (data.arguments ?? []).map(arg => ({ id: cleanLabel(arg), text: arg }));

    const links: GraphLink[] = (data.attacks ?? []).map(att => {
      const parts = att.split("→").map(p => p.trim());
      return { source: cleanLabel(parts[0]), target: cleanLabel(parts[1]), label: "attack" };
    });

    const reverseLinks: GraphLink[] = (data.reverse_attacks ?? []).map((r, i) => ({
      source: nodes[i % nodes.length]?.id ?? `node-${i}`,
      target: nodes[(i + 1) % nodes.length]?.id ?? `node-${i + 1}`,
      label: "reverse",
      dashed: true,
    }));

    setGraphData({ nodes, links: [...links, ...reverseLinks] });
  };

  // Dedicated ABA function
  const handleGenerateABA = async () => {
    if (!selectedFile) return alert("Please select a file first");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${API_URL}/aba-upload`, { method: "POST", body: formData });
      const data: ABAApiResponse = await res.json();
      setAbaResults(data);
      generateGraph(data);
      setTimeout(() => graphRef.current?.zoomToFit?.(400, 50), 150);
    } catch (err) {
      console.error("Error generating ABA:", err);
      setAbaResults(null);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  // Dedicated ABA+ function
  const handleGenerateABAPlus = async () => {
    if (!selectedFile) return alert("Please select a file first");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${API_URL}/aba-plus-upload`, { method: "POST", body: formData });
      const data: ABAApiResponse = await res.json();
      setAbaResults(data);
      generateGraph(data);
      setTimeout(() => graphRef.current?.zoomToFit?.(400, 50), 150);
    } catch (err) {
      console.error("Error generating ABA+:", err);
      setAbaResults(null);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ABAPanel
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        fileContent={selectedFile ? fileContent(selectedFile) : ""}
        onGenerateABA={handleGenerateABA}
        onGenerateABAPlus={handleGenerateABAPlus}
        loading={loading}
        onToggleMode={handleToggleMode}
      />

      <div className="flex-1 h-full overflow-hidden relative">
        <ABAGraph3D
          ref={graphRef}
          graphData={graphData}
          onNodeClick={setSelectedNode}
          is3D={is3D}
        />
      </div>

      <ABAResultsPanel results={abaResults} />
    </div>
  );
}

// helper to read file content
function fileContent(file: File) {
  return file ? file.name : "";
}
