// pages/index.jsx
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [cards, setCards] = useState([]);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSummary(data.summary || "");
      setCards(data.cards || []);
    } catch (err) {
      console.error(err);
      setSummary("Something went wrong. Please try again.");
      setCards([]);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Real Estate ChatBot</h1>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border p-2 flex-1"
          placeholder="Ask about properties..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {summary && <p className="mb-4 font-semibold">{summary}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.slug}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-1">{card.title}</h2>
            <p className="mb-1">
              <strong>City:</strong> {card.city}
            </p>
            <p className="mb-1">
              <strong>Locality:</strong> {card.locality}
            </p>
            <p className="mb-1">
              <strong>BHK:</strong> {card.BHK}
            </p>
            <p className="mb-1">
              <strong>Price:</strong> {card.price}
            </p>
            <p className="mb-1">
              <strong>Possession:</strong> {card.possession}
            </p>
            <p className="mb-1">
              <strong>Amenities:</strong> {card.amenities.join(", ")}
            </p>
            <a
              href={`/project/${card.slug}`}
              className="text-blue-600 hover:underline mt-2 block"
            >
              View Details
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
