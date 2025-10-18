import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSummary("");
    setResults([]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setSummary(data.summary);
      setResults(data.results);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-semibold text-center text-gray-800 mb-6">
          Real Estate ChatBot
        </h1>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about properties..."
            className="flex-grow border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-blue-300"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && (
          <p className="text-center text-red-500 font-medium">{error}</p>
        )}

        {summary && (
          <p className="text-center text-gray-700 font-medium mb-4">
            {summary}
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-5"
            >
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                {item.projectName || "Unnamed Project"}
              </h2>
              <p className="text-gray-600 mb-1">
                <strong>City:</strong> {item.cityId || "N/A"}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>BHK:</strong> {item.customBHK || item.type || "N/A"}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Price:</strong>{" "}
                {item.price ? `₹${Number(item.price).toLocaleString()}` : "N/A"}
              </p>
              <p className="text-gray-600 mb-1">
                <strong>Possession:</strong>{" "}
                {item.possessionDate
                  ? new Date(item.possessionDate).toLocaleDateString()
                  : "N/A"}
              </p>
              <p className="text-gray-600 mb-2">
                <strong>Status:</strong>{" "}
                {item.status ? item.status.replace("_", " ") : "N/A"}
              </p>

              {item.amenities && item.amenities.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium text-gray-700">Amenities:</p>
                  <ul className="list-disc ml-5 text-gray-600 text-sm">
                    {item.amenities.map((am, idx) => (
                      <li key={idx}>{am}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
