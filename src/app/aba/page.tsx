"use client";
import { useEffect, useRef, useState } from "react";
import ABAPanel from "./AbaPanel";
import ABAResultsPanel from "./AbaResultsPanel";
import ABAGraph3D from "./ABAGraph";
import { GraphData, GraphLink, GraphNode, ABAApiResponse, FrameworkState } from "../components/types";
import { GraphWrapperRef } from "../components/GraphWrapper";
import { API_URL } from "../../../config";

export default function ABAPage() {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [abaResults, setAbaResults] = useState<ABAApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [is3D, setIs3D] = useState(true);
  const [viewMode, setViewMode] = useState<"before" | "after">("after");
  const graphRef = useRef<GraphWrapperRef>(null);

  /**
   * Determines if we're viewing ABA+ (has assumption_set_attacks or reverse_attacks)
   */
  const isABAPlus = (data: ABAApiResponse): boolean => {
    const after = data.after_transformation;
    return (
      (after?.assumption_set_attacks?.length ?? 0) > 0 ||
      (after?.reverse_attacks?.length ?? 0) > 0
    );
  };

  /**
   * Generates graph from ABA+ or classical ABA data based on selected view mode
   */
  const generateGraph = (data: ABAApiResponse) => {
    const frameworkState = viewMode === "before" 
      ? data.before_transformation 
      : data.after_transformation;

    if (!frameworkState) {
      console.error("Invalid data structure:", data);
      return;
    }

    if (isABAPlus(data)) {
      // --- ABA+ graph: nodes = assumption sets ---
      const nodes: GraphNode[] = (frameworkState.assumption_sets ?? []).map(setStr => ({
        id: setStr,
        text: setStr,
      }));

      // Normal attacks (red)
      const normalLinks: GraphLink[] = (frameworkState.assumption_set_attacks ?? []).map(a => {
        const [src, dst] = a.split("→").map(p => p.trim());
        return {
          source: src,
          target: dst,
          label: "Normal Attack",
          color: "#f87171",
        };
      });

      // Reverse attacks (blue)
      const reverseLinks: GraphLink[] = (frameworkState.reverse_attacks ?? []).map(a => {
        const [src, dst] = a.split("→").map(p => p.trim());
        return {
          source: src,
          target: dst,
          label: "Reverse Attack",
          color: "#60a5fa",
        };
      });

      setGraphData({ nodes, links: [...normalLinks, ...reverseLinks] });
    } else {
      // --- Classical ABA graph ---
      const nodes: GraphNode[] = (frameworkState.arguments ?? []).map(arg => {
        const id = arg.match(/^\[([A0-9]+)\]/)?.[1] ?? arg;
        return { id, text: id };
      });

      const links: GraphLink[] = (frameworkState.arguments_attacks ?? []).map(att => {
        const [source, target] = att.split("→").map(p => p.trim());
        const srcId = source.match(/\[([A0-9]+)\]/)?.[1] ?? source;
        const tgtId = target.match(/\[([A0-9]+)\]/)?.[1] ?? target;
        return {
          source: srcId,
          target: tgtId,
          label: "Attack",
          color: "#f87171",
        };
      });

      setGraphData({ nodes, links });
    }
  };

  useEffect(() => {
    if (abaResults) {
      generateGraph(abaResults);
    }
  }, [viewMode, abaResults]);

  useEffect(() => {
    const resize = () => {
      window.dispatchEvent(new Event("resize"));
      graphRef.current?.zoomToFit?.(400, -150);
    };
    const timer1 = setTimeout(resize, 100);
    const timer2 = setTimeout(resize, 300);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // Toggle 2D/3D
  const handleToggleMode = () => {
    setIs3D(prev => !prev);
  };

  // File upload / ABA generation
  const uploadFileAndGenerate = async (endpoint: string) => {
    if (!selectedFile) return alert("Please select a file first");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch(`${API_URL}/${endpoint}`, { method: "POST", body: formData });
      const data: ABAApiResponse = await res.json();
      setAbaResults(data);
      generateGraph(data);
    } catch (err) {
      console.error(err);
      setAbaResults(null);
      setGraphData({ nodes: [], links: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateABA = () => uploadFileAndGenerate("aba-upload");
  const handleGenerateABAPlus = () => uploadFileAndGenerate("aba-plus-upload");

  return (
    <div className="flex h-screen" style={{ height: "calc(100vh - 64px)" }}>
      <ABAPanel
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        onGenerateABA={handleGenerateABA}
        onGenerateABAPlus={handleGenerateABAPlus}
        loading={loading}
        onToggleMode={handleToggleMode}
        is3D={is3D}
        viewMode={viewMode}
        setViewMode={setViewMode}
        hasTransformation={abaResults?.meta.transformed ?? false}
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