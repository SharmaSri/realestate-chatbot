// components/ChatBot.js
import { useState } from "react";
import axios from "axios";

export default function ChatBot() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add user message
    setMessages((prev) => [...prev, { type: "user", text: query }]);
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/chat", { query });
      const { summary, cards } = response.data;

      // Add bot response
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: summary, cards },
      ]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setQuery("");
    }
  };

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", fontFamily: "Arial" }}>
      <h2>Real Estate ChatBot</h2>

      <form onSubmit={handleQuery} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about properties..."
          style={{ width: "80%", padding: "0.5rem", fontSize: "1rem" }}
        />
        <button type="submit" style={{ padding: "0.5rem 1rem", marginLeft: "0.5rem" }}>
          Search
        </button>
      </form>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "1rem" }}>
            {msg.type === "user" ? (
              <div style={{ textAlign: "right" }}>
                <strong>You:</strong> {msg.text}
              </div>
            ) : (
              <div style={{ textAlign: "left", background: "#f1f1f1", padding: "0.5rem", borderRadius: "5px" }}>
                <strong>Bot:</strong> {msg.text}
                {msg.cards && msg.cards.length > 0 && (
                  <div style={{ marginTop: "0.5rem" }}>
                    {msg.cards.map((card, i) => (
                      <div key={i} style={{ border: "1px solid #ddd", padding: "0.5rem", marginBottom: "0.5rem", borderRadius: "5px" }}>
                        <strong>{card.title}</strong>
                        <div>{card.city}, {card.locality}</div>
                        <div>{card.bhk} | {card.price} | {card.possessionStatus}</div>
                        {card.amenities && <div>Amenities: {card.amenities.join(", ")}</div>}
                        <a href={`/project/${card.slug}`} style={{ color: "blue" }}>View Project</a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
