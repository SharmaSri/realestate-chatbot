export default function ChatMessage({ message }) {
  return (
    <div style={{ textAlign: message.sender === "user" ? "right" : "left", margin: "5px 0" }}>
      <span style={{ background: message.sender === "user" ? "#DCF8C6" : "#FFF", padding: "5px 10px", borderRadius: "10px", display: "inline-block" }}>
        {message.text}
      </span>
    </div>
  );
}
