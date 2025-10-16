"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import GradualPanel from "./gradualPanel";
import { GradualResult } from "./types";
import { API_URL } from "../../../config";

// Import the 3D plot dynamically to avoid SSR issues
const Gradual3D = dynamic(() => import("./Gradual3D"), { ssr: false });

export default function GradualPage() {
  // State for API result and loading
  const [result, setResult] = useState<GradualResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Parameters for gradual semantics computation
  const [args, setArgs] = useState<string[]>(["A", "B", "C"]);
  const [relations, setRelations] = useState<[string, string][]>([["A", "B"], ["B", "C"]]);
  const [nSamples, setNSamples] = useState(500);
  const [maxIter, setMaxIter] = useState(1000);

  // Handler for API call, using current parameters
  async function handleCompute() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/gradual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          A: args,
          R: relations,
          n_samples: nSamples,
          max_iter: maxIter,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen">
      {/* Left panel: parameter controls */}
      <GradualPanel
        args={args}
        setArgs={setArgs}
        relations={relations}
        setRelations={setRelations}
        nSamples={nSamples}
        setNSamples={setNSamples}
        maxIter={maxIter}
        setMaxIter={setMaxIter}
        loading={loading}
        onCompute={handleCompute}
      />
      {/* Right panel: 3D plot */}
      <div className="flex-1 p-4 bg-gray-900">
        {result ? (
          <Gradual3D data={result} />
        ) : (
          <p className="text-gray-400 text-center mt-20">No data yet.</p>
        )}
      </div>
    </div>
  );
}
