// pages/index.js or pages/chat.js
import { useState } from "react";
import axios from "axios";

export default function ChatBot() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const response = await axios.post("/api/chat", { query });
      setResults(response.data.results);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>Real Estate ChatBot</h2>
      <form onSubmit={handleQuery} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about properties..."
          style={{ width: "70%", padding: "0.5rem", fontSize: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "1rem" }}>
          {results.map((property, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "1rem",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <h3 style={{ margin: "0 0 0.5rem 0" }}>{property.projectName || "N/A"}</h3>
              <p>
                <strong>City:</strong> {property.cityId || "N/A"} | <strong>Locality:</strong> {property.localityId || "N/A"}
              </p>
              <p>
                <strong>BHK:</strong> {property.customBHK || property.type || "N/A"} |{" "}
                <strong>Price:</strong> {property.price ? `₹${property.price}` : "N/A"}
              </p>
              <p>
                <strong>Possession:</strong> {property.status || "N/A"}
              </p>
              {property.amenities && property.amenities.length > 0 && (
                <p>
                  <strong>Amenities:</strong> {property.amenities.slice(0, 3).join(", ")}
                </p>
              )}
              <a
                href={`/project/${property.slug || property.id}`}
                style={{
                  display: "inline-block",
                  marginTop: "0.5rem",
                  padding: "0.4rem 0.8rem",
                  background: "#0070f3",
                  color: "#fff",
                  borderRadius: "5px",
                  textDecoration: "none",
                }}
              >
                View Project
              </a>
            </div>
          ))}
        </div>
      ) : (
        !loading && <p>No results found.</p>
      )}
    </div>
  );
}
