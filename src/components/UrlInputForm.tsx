"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UrlInputForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Analysis failed. Please try again.");
        return;
      }

      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      router.push("/dashboard");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-4">
      <div>
        <label
          htmlFor="sheets-url"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Google Sheets URL
        </label>
        <input
          id="sheets-url"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          required
          className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     text-sm"
        />
        <p className="mt-1 text-xs text-gray-500">
          Make sure the sheet is shared publicly (Anyone with link → Viewer)
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !url.trim()}
        className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg
                   hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors duration-200"
      >
        {loading ? "Analyzing..." : "Analyze Feedback"}
      </button>
    </form>
  );
}
