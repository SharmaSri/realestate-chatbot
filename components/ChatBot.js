import { useState } from "react";
import axios from "axios";

export default function ChatBot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { type: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    try {
      const res = await axios.post("/api/chat", { query: input });
      const botMessage = {
        type: "bot",
        text:
          res.data.results.length === 0
            ? "No matching properties found."
            : res.data.results
                .map(
                  (r) =>
                    `${r.name} (${r.bhk}) in ${r.city} - ₹${r.price.toLocaleString()} - Possession: ${r.possessionDate}`
                )
                .join("\n"),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Error fetching results. Try again later." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{ width: "400px", margin: "auto" }}>
      <div
        style={{
          border: "1px solid #ccc",
          padding: "10px",
          height: "400px",
          overflowY: "scroll",
          marginBottom: "10px",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.type === "user" ? "right" : "left", margin: "5px 0" }}>
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: "12px",
                backgroundColor: m.type === "user" ? "#0070f3" : "#eee",
                color: m.type === "user" ? "#fff" : "#000",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Ask about properties..."
        style={{ width: "calc(100% - 22px)", padding: "10px" }}
      />
    </div>
  );
}
