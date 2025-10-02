"use client";
import { useState } from "react";
import { GraphData, GraphNode } from "../components/types";

interface ABAPanelProps {
  setGraphData: React.Dispatch<React.SetStateAction<GraphData>>;
  onGenerateABA: (inputText: string) => void;
  loading: boolean;
  selectedNode: GraphNode | null;
}

export default function ABAPanel({
  setGraphData,
  onGenerateABA,
  loading,
  selectedNode,
}: ABAPanelProps) {
  const [inputText, setInputText] = useState<string>(
    `L: [a,b,c,q,p,r,s,t]
A: [a,b,c]
C(a): r
C(b): s
C(c): t
[r1]: p <- q,a
[r2]: q <- 
[r3]: r <- b,c
[r4]: t <- p,c
[r5]: s <- t
PREF: a > b`
  );
  const [selectedSample, setSelectedSample] = useState<"sample1" | "sample2">("sample1");

  const handleLoadSample = () => {
    if (selectedSample === "sample1") {
      setInputText(
        `L: [a,b,c,q,p,r,s,t]
A: [a,b,c]
C(a): r
C(b): s
C(c): t
[r1]: p <- q,a
[r2]: q <- 
[r3]: r <- b,c
[r4]: t <- p,c
[r5]: s <- t
PREF: a > b`
      );
    } else {
      setInputText(
        `L: [x,y,z]
A: [x,y]
C(x): z
[r1]: x <- y
[r2]: y <- 
PREF: x > y`
      );
    }
  };

  return (
    <div className="w-1/4 bg-gray-800 p-4 overflow-y-auto text-white flex-shrink-0">
      <h2 className="text-xl font-bold mb-4">ABA Framework Generator</h2>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={15}
        className="border rounded p-2 w-full bg-gray-700 text-white placeholder-gray-300 resize-none"
        placeholder="Enter your ABA framework here..."
      />

      <button
        onClick={() => onGenerateABA(inputText)}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full mt-2"
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate ABA Framework"}
      </button>

      <div className="mt-4 space-y-2">
        <label className="block text-white font-semibold">Load Sample ABA Framework:</label>
        <select
          value={selectedSample}
          onChange={(e) => setSelectedSample(e.target.value as "sample1" | "sample2")}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="sample1">Sample ABA 1</option>
          <option value="sample2">Sample ABA 2</option>
        </select>
        <button
          onClick={handleLoadSample}
          className="bg-green-600 text-white px-4 py-2 rounded w-full mt-2"
        >
          Load Selected Sample
        </button>
      </div>

      {selectedNode && (
        <div className="mt-6 p-3 border rounded bg-gray-700 text-white shadow">
          <h3 className="font-bold text-lg">Assumption Details</h3>
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
