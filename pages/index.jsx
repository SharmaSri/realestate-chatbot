// pages/index.jsx
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    setSummary("");
    setResults([]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSummary(data.summary || "");
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setSummary("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Real Estate ChatBot</h1>

      <div className="flex mb-4">
        <input
          type="text"
          placeholder="Ask about properties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-l"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="p-2 bg-blue-600 text-white rounded-r hover:bg-blue-700"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {summary && <p className="mb-4 font-medium">{summary}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((project) => (
          <div key={project.slug} className="bg-white p-4 rounded shadow">
            <h2 className="text-xl font-semibold mb-1">{project.title}</h2>
            <p className="text-gray-600 mb-1">
              {project.city} {project.locality && `• ${project.locality}`}
            </p>
            <p className="text-gray-600 mb-1">BHK: {project.bhk}</p>
            <p className="text-gray-600 mb-1">Price: {project.price}</p>
            <p className="text-gray-600 mb-1">Possession: {project.possession}</p>
            {project.amenities && project.amenities.length > 0 && (
              <p className="text-gray-600 mb-1">
                Amenities: {project.amenities.join(", ")}
              </p>
            )}
            <a
              href={`/project/${project.slug}`}
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              View Project
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
