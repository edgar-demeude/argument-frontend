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
      <div className="mb-4 p-3 rounded-xl flex items-center justify-between border border-[var(--border)] bg-[var(--surface-alt)]">
        <span className="font-medium text-sm">{is3D ? "3D Mode" : "2D Mode"}</span>
        <button
          onClick={onToggleMode}
          disabled={loading}
          className="px-3 py-1 rounded-lg bg-[var(--secondary)] hover:bg-[var(--secondary-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-xs"
        >
          Switch to {is3D ? "2D" : "3D"}
        </button>
      </div>

      {/* Before/After View Toggle */}
      {hasTransformation && (
        <div className="mb-4 p-3 rounded-xl border border-[var(--border)] bg-[var(--surface-alt)]">
          <span className="font-medium text-sm block mb-2">View</span>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("before")}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "before"
                  ? "bg-[var(--accent)] text-[var(--foreground)]"
                  : "bg-[var(--surface)] border border-[var(--border)] hover:bg-[var(--surface-alt)] text-[var(--foreground)]"
              }`}
            >
              Before
            </button>
            <button
              onClick={() => setViewMode("after")}
              className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition cursor-pointer ${
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
      <div className="p-4 rounded-xl border border-[var(--border)] mb-6 shadow-inner bg-[var(--surface-alt)]">
        <label className="block text-[var(--foreground)] font-semibold mb-2 text-sm">
          ABA File
        </label>

        <label
          className={`block w-full p-2 text-center rounded-lg cursor-pointer border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-alt)] transition text-xs ${
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
          className="w-full p-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] focus:ring-2 focus:ring-[var(--accent)] cursor-pointer transition text-xs"
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
          className="mt-4 w-full h-40 p-2 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--foreground)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
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
          className={`w-full px-4 py-2 rounded-lg font-semibold text-[var(--foreground)] transition-all duration-200 text-sm ${
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
          className={`w-full px-4 py-2 rounded-lg font-semibold text-[var(--foreground)] transition-all duration-200 text-sm ${
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