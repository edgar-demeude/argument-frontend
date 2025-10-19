"use client";
import { useRef } from "react";
import { useABAFileLoader } from "./utils/useABAFileLoader";

interface ABAPanelProps {
  selectedFile: File | null;
  setSelectedFile: (file: File) => void;
  onGenerateABA: () => void;
  onGenerateABAPlus: () => void;
  loading: boolean;
  onToggleMode: () => void;
  is3D: boolean;
  viewMode: "before" | "after";
  setViewMode: (mode: "before" | "after") => void;
  hasTransformation: boolean;
}

export default function ABAPanel({
  selectedFile,
  setSelectedFile,
  onGenerateABA,
  onGenerateABAPlus,
  loading,
  onToggleMode,
  is3D,
  viewMode,
  setViewMode,
  hasTransformation,
}: ABAPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    fileContent,
    setFileContent,
    exampleFiles,
    handleFileChange,
    handleExampleSelect,
  } = useABAFileLoader({ fileInputRef, setSelectedFile });

  const handleContentChange = (content: string) => {
    setFileContent(content);
    const tempFile = new File([content], selectedFile?.name || "manual.txt", {
      type: "text/plain",
    });
    setSelectedFile(tempFile);
  };

  return (
    <div className="w-1/4 p-5 overflow-y-auto flex-shrink-0 border-r border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] border-r border-[color-mix(in_oklab,var(--foreground)_20%,transparent)]">
      
      {/* Mode toggle 2D/3D */}
      <div className="mb-4 p-3 rounded-lg flex items-center justify-between border border-[var(--border)] bg-[var(--surface-alt)]">
        <span>{is3D ? "3D Mode" : "2D Mode"}</span>
        <button
          onClick={onToggleMode}
          disabled={loading}
          className="px-3 py-1 rounded bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Switch to {is3D ? "2D" : "3D"}
        </button>
      </div>

      {/* Before/After View Toggle */}
      {hasTransformation && (
        <div className="mb-4 p-3 rounded-lg border border-[var(--border)] bg-[var(--surface-alt)]">
          <span className="block mb-2 font-medium">Transformation</span>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("before")}
              className={`flex-1 py-2 px-2 rounded-lg font-semibold transition cursor-pointer ${
                viewMode === "before"
                  ? "bg-[var(--accent)] text-[var(--foreground)]"
                  : "bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[var(--foreground)]"
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setViewMode("after")}
              className={`flex-1 py-2 px-2 rounded-lg font-semibold transition cursor-pointer ${
                viewMode === "after"
                  ? "bg-[var(--accent)] text-[var(--foreground)]"
                  : "bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[var(--foreground)]"
              }`}
            >
              After
            </button>
          </div>
        </div>
      )}

      {/* File upload / manual input */}
      <div className="mb-4 p-4 rounded-lg shadow-inner bg-[var(--surface-alt)] border border-[var(--border)]">
        <label className="block font-semibold mb-2 text-[var(--foreground)]">
          ABA File
        </label>

        <label
          className={`block w-full p-2 text-center rounded-lg cursor-pointer border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Loading..." : "Upload .txt File"}
          <input
            type="file"
            ref={fileInputRef}
            accept=".txt"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        <p className="text-center text-[var(--muted)] my-3 text-xs">— or —</p>

        <select
          className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--accent)] cursor-pointer transition"
          onChange={handleExampleSelect}
          defaultValue=""
        >
          <option value="">Choose an example</option>
          {exampleFiles.map((ex) => (
            <option key={ex.path} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>

        <textarea
          className="mt-4 w-full h-40 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition"
          value={fileContent}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="Type or paste ABA content here..."
        />
      </div>

      {/* Generate ABA buttons */}
      <div className="space-y-3">
        <button
          onClick={onGenerateABA}
          disabled={loading || !selectedFile}
          className={`w-full px-4 py-2 rounded-lg font-semibold text-[var(--foreground)] transition-all duration-200 ${
            loading || !selectedFile
              ? "bg-[var(--accent)] opacity-50 cursor-not-allowed"
              : "bg-[var(--accent)] hover:bg-[var(--accent-hover)] active:opacity-90 cursor-pointer"
          }`}
        >
          {loading ? "Generating ABA..." : "Generate ABA"}
        </button>

        <button
          onClick={onGenerateABAPlus}
          disabled={loading || !selectedFile}
          className={`w-full px-4 py-2 rounded-lg font-semibold text-[var(--foreground)] transition-all duration-200 ${
            loading || !selectedFile
              ? "bg-[var(--secondary)] opacity-50 cursor-not-allowed"
              : "bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] active:opacity-90 cursor-pointer"
          }`}
        >
          {loading ? "Generating ABA+..." : "Generate ABA+"}
        </button>
      </div>
    </div>
  );
}
