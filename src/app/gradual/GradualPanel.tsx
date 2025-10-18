"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GradualInput } from "./types";
import { API_URL } from "../../../config";

const ARG_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const REL_RE = /\(([A-Za-z]),\s*([A-Za-z])\)/g;

type ExampleMeta = { name: string; path: string };
type ExampleContent = {
  num_args?: number;
  args?: string[];
  R?: [string, string][];
  relations?: [string, string][];
};

export default function GradualPanel(props: {
  onRun: (payload: GradualInput) => void;
  showHull: boolean;
  setShowHull: (val: boolean) => void;
}) {
  const { onRun, showHull, setShowHull } = props;

  // --- examples ---
  const [exampleFiles, setExampleFiles] = useState<ExampleMeta[]>([]);
  const [selectedExample, setSelectedExample] = useState<string | null>(null);

  // --- main inputs ---
  const [numArgs, setNumArgs] = useState<number>(3);
  const [nSamples, setNSamples] = useState<number>(1000);
  const [relations, setRelations] = useState<string>("(A,B),(B,C)");

  // dynamic derived list of args
  const A = useMemo(() => ARG_LABELS.slice(0, numArgs), [numArgs]);

  // axes and controlled args
  const [xAxis, setXAxis] = useState<string>("A");
  const [yAxis, setYAxis] = useState<string>("B");
  const [zAxis, setZAxis] = useState<string>("C");
  const [controlledArgs, setControlledArgs] = useState<Record<string, number>>({});

  // validation state
  const [relationError, setRelationError] = useState<string | null>(null);

  // --- fetch example list once ---
  useEffect(() => {
    async function fetchExamples() {
      try {
        const res = await fetch(`${API_URL}/gradual-examples`);
        const data = await res.json();
        setExampleFiles(data.examples || []);
      } catch (err) {
        console.error("Failed to fetch gradual examples:", err);
      }
    }
    fetchExamples();
  }, []);

  // --- handle example selection ---
  async function loadExample(name: string) {
    setSelectedExample(name);
    try {
      const res = await fetch(`${API_URL}/gradual-examples/${name}.json`);
      const data: ExampleContent = await res.json();

      const num = data.num_args ?? data.args?.length ?? 3;
      const rel = data.R ?? data.relations ?? [];

      setNumArgs(num);
      setRelations(rel.map(([a, b]) => `(${a},${b})`).join(","));
      setControlledArgs({});
      setXAxis("A");
      setYAxis("B");
      setZAxis("C");
    } catch (e) {
      console.error(e);
    }
  }

  // --- recompute A-dependent state ---
  useEffect(() => {
    setXAxis(A[0] ?? "A");
    setYAxis(A[1] ?? "B");
    setZAxis(A[2] ?? "C");
    setControlledArgs((prev) => {
      const next: Record<string, number> = {};
      for (const k of Object.keys(prev)) if (A.includes(k)) next[k] = prev[k];
      return next;
    });
  }, [A]);

  // --- parse relations + validation ---
  const parsedR = useMemo(() => {
    const out: [string, string][] = [];
    const up = relations.toUpperCase();
    REL_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = REL_RE.exec(up)) !== null) {
      const a = m[1];
      const b = m[2];
      if (A.includes(a) && A.includes(b)) out.push([a, b]);
    }
    return out;
  }, [relations, A]);

  function validateRelations(): boolean {
    const up = relations.toUpperCase();
    const matches = [...up.matchAll(REL_RE)];
    if (matches.length === 0 && up.trim() !== "") {
      setRelationError("Invalid format. Use (A,B),(B,C),(A,C) ...");
      return false;
    }
    for (const m of matches) {
      const a = m[1];
      const b = m[2];
      if (!A.includes(a) || !A.includes(b)) {
        setRelationError(`Unknown argument in relation (${a},${b})`);
        return false;
      }
    }
    setRelationError(null);
    return true;
  }

  const showAxes = numArgs > 3;
  const axes = showAxes ? [xAxis, yAxis, zAxis] : A.slice(0, Math.min(3, A.length));
  const nonVisualized = A.filter((a) => !axes.includes(a));

  function handleCompute() {
    if (!validateRelations()) return;

    const payload: GradualInput = {
      num_args: numArgs,
      R: parsedR,
      n_samples: nSamples,
      axes: showAxes ? [xAxis, yAxis, zAxis] : undefined,
      controlled_args: nonVisualized.reduce((acc, k) => {
        acc[k] = controlledArgs[k] ?? 0.5;
        return acc;
      }, {} as Record<string, number>),
    };
    props.onRun(payload);
  }

  return (
    <div className="w-1/4 p-5 overflow-y-auto flex-shrink-0 border-l border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] border-r border-[color-mix(in_oklab,var(--foreground)_20%,transparent)]">
      <h2 className="text-lg font-semibold mb-4">Gradual Semantics</h2>

      {/* Example selection */}
      <div className="p-4 rounded-xl border border-[var(--border)] mb-6 shadow-inner bg-[var(--surface-alt)]">
        <label className="block mb-2 font-semibold text-[var(--foreground)]">
          Example
        </label>
        <select
          value={selectedExample ?? ""}
          onChange={(e) => loadExample(e.target.value)}
          className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--accent)] cursor-pointer transition"
        >
          <option value="">Select example...</option>
          {exampleFiles.map((ex) => (
            <option key={ex.name} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {/* Number of arguments */}
      <div className="p-4 rounded-xl border border-[var(--border)] mb-4 shadow-inner bg-[var(--surface-alt)]">
        <label className="block mb-3 font-semibold text-[var(--foreground)]">
          Number of Arguments (|A|): <span className="text-[var(--accent)]">{numArgs}</span>
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={numArgs}
          className="w-full accent-[var(--accent)] cursor-pointer"
          onChange={(e) => setNumArgs(Number(e.target.value))}
        />
      </div>

      {/* Number of samples */}
      <div className="p-4 rounded-xl border border-[var(--border)] mb-4 shadow-inner bg-[var(--surface-alt)]">
        <label className="block mb-3 font-semibold text-[var(--foreground)]">
          Number of Samples: <span className="text-[var(--accent)]">{nSamples}</span>
        </label>
        <input
          type="range"
          min={100}
          max={100000}
          step={100}
          value={nSamples}
          className="w-full accent-[var(--accent)] cursor-pointer"
          onChange={(e) => setNSamples(Number(e.target.value))}
        />
      </div>

      {/* Relations textbox */}
      <div className="p-4 rounded-xl border border-[var(--border)] mb-4 shadow-inner bg-[var(--surface-alt)]">
        <label className="block mb-2 font-semibold text-[var(--foreground)]">
          Relations R (format: (A,B),(B,C))
        </label>
        <textarea
          value={relations}
          onChange={(e) => setRelations(e.target.value)}
          className="w-full min-h-[80px] p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        />
        {relationError && (
          <div className="text-red-500 text-sm mt-2">{relationError}</div>
        )}
        {!relationError && (
          <div className="text-xs text-[var(--foreground)] mt-2">
            Parsed:{" "}
            {parsedR.length
              ? parsedR.map(([a, b], i) => <code key={i}>({a},{b}) </code>)
              : "none"}
          </div>
        )}
      </div>

      {/* Conditional axes selection */}
      {showAxes && (
        <div className="grid grid-cols-3 gap-2 p-4 bg-[var(--surface-alt)] rounded-xl shadow-inner border border-[var(--border)] mb-4">
          {[{ label: "X", value: xAxis, setter: setXAxis },
            { label: "Y", value: yAxis, setter: setYAxis },
            { label: "Z", value: zAxis, setter: setZAxis }].map(({ label, value, setter }) => (
            <div key={label}>
              <label className="block mb-2 font-semibold text-[var(--foreground)] text-sm">{label} axis</label>
              <select
                value={value}
                onChange={(e) => setter(e.target.value)}
                className="w-full border border-[var(--border)] rounded-lg px-2 py-1 bg-[var(--surface)] text-[var(--foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer transition"
              >
                {A.map((a) => <option key={a}>{a}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Sliders for non-visualized args */}
      {nonVisualized.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--border)] mb-6 shadow-inner bg-[var(--surface-alt)]">
          <div className="text-sm mb-3 font-semibold text-[var(--foreground)]">
            Adjust weights for other arguments:
          </div>
          <div className="space-y-2">
            {nonVisualized.map((arg) => (
              <div key={arg} className="flex items-center gap-3">
                <span className="w-6 font-semibold">{arg}</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={controlledArgs[arg] ?? 0.5}
                  onChange={(e) =>
                    setControlledArgs((prev) => ({
                      ...prev,
                      [arg]: Number(e.target.value),
                    }))
                  }
                  className="w-full accent-[var(--accent)] cursor-pointer"
                />
                <span className="w-12 text-right tabular-nums text-sm">
                  {(controlledArgs[arg] ?? 0.5).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toggle mesh hull */}
      <div className="p-4 mb-4 flex justify-between items-center rounded-xl border border-[var(--border)] bg-[var(--surface-alt)] shadow-inner">
        <span className="font-semibold text-[var(--foreground)]">Show 3D Hull Mesh</span>
        <button
          onClick={() => setShowHull(!showHull)}
          className={`px-3 py-1 rounded-lg font-medium transition-all duration-150 cursor-pointer border
            ${showHull
              ? "bg-[var(--accent)] text-white border-transparent"
              : "bg-[var(--surface)] text-[var(--foreground)] border-[var(--border)]"
            }`}
        >
          {showHull ? "ON" : "OFF"}
        </button>
      </div>

      {/* Compute button */}
      <button
        onClick={handleCompute}
        className="w-full px-4 py-2 rounded-lg font-semibold text-[var(--foreground)] transition-all duration-200 bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] active:opacity-90 cursor-pointer"
      >
        Compute
      </button>
    </div>
  );
}