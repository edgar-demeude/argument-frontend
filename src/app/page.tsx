"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");

  const handleParse = () => {
    // TODO : Implement parsing logic
    console.log("User input:", input);
    alert("Parsing not implemented yet 🚧");
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">ABA Generator</h1>
      <p className="text-gray-600 mb-6 text-center max-w-lg">
        Welcome 👋 <br />
        This tool will allow you to create and manipulate an{" "}
        <strong>Assumption-Based Argumentation (ABA)</strong> framework.<br />
        Paste your data below:
      </p>

      <textarea
        className="w-full max-w-2xl h-48 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
        placeholder={`Example:\nL: [a,b,c,q,p,r,s,t]\nA: [a,b,c]\nC(a): r\nC(b): s\nC(c): t\n[r1]: p <- q,a\n[r2]: q <-\n[r3]: r <- b,c\n[r4]: t <- p,c\n[r5]: s <- t\nPREF: a > b`}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleParse}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
      >
        Parse
      </button>
    </main>
  );
}
