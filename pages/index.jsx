import React, { useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  const handleSend = async () => {
    if (!message.trim()) return;

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    setResponse(data.reply);
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "40px" }}>
      <h1>🏠 Real Estate Chatbot</h1>
      <textarea
        rows="4"
        style={{ width: "100%", marginBottom: "10px" }}
        placeholder="Ask about a property..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button
        onClick={handleSend}
        style={{
          background: "#0070f3",
          color: "white",
          border: "none",
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Send
      </button>

      {response && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            background: "#f3f3f3",
            borderRadius: "8px",
          }}
        >
          <strong>Bot:</strong> {response}
        </div>
      )}
    </div>
  );
}
