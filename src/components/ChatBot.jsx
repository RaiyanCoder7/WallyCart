import { useState } from "react";
import "../index.css"; // Ensure this line is present if not already

const ChatBot = ({ onSend, messages }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <div className="chatbot-container">
      <h2 className="chatbot-title">Smart Assistant</h2>

      <div className="chatbot-messages">
        {messages.length === 0 ? (
          <p className="chatbot-placeholder">Start a conversation...</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="chatbot-message-pair">
              <div className="chatbot-user-msg">
                <span><strong>You:</strong> {msg.user}</span>
              </div>
              <div className="chatbot-bot-msg">
                <span><strong>Bot:</strong> {msg.bot}</span>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="chatbot-form">
        <input
          type="text"
          className="chatbot-input"
          placeholder="Ask about healthy options, offers..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="chatbot-send-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatBot;