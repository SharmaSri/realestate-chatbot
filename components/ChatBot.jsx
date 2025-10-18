import { useState } from "react";
import ChatMessage from "./ChatMessage";
import ProjectCard from "./ProjectCard";

export default function ChatBot({ projects }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    if (!input) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();
    const botMessage = { sender: "bot", text: data.botText };
    setMessages((prev) => [...prev, botMessage]);

    // Append projects returned by API
    if (data.projects?.length) {
      const projectMsgs = data.projects.map((p) => ({ sender: "bot", text: p.ProjectName, project: p }));
      setMessages((prev) => [...prev, ...projectMsgs]);
    }
  };

  return (
    <div>
      <div style={{ maxHeight: "400px", overflowY: "auto", marginBottom: "10px" }}>
        {messages.map((m, i) => (
          m.project ? <ProjectCard key={i} project={m.project} /> : <ChatMessage key={i} message={m} />
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask about projects..."
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
}
