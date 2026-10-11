import "./ChatWindow.css";
import { useState, useEffect, useContext } from "react";
import { MyContext } from "./MyContext.jsx";
import { BeatLoader } from "react-spinners";

const quotes = [
  "You are stronger than you think",
  "Take it one day at a time",
  "Your feelings are valid",
  "Small steps still move you forward",
  "You’ve survived 100% of your bad days",
  "It’s okay to not be okay"
];

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    setReply,
    currThreadId,
    prevChats,
    setPrevChats
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState("");
  const [fade, setFade] = useState(true);

  // ✅ SEND MESSAGE FUNCTION
  const getReply = async () => {
    if (!prompt.trim()) return;

    setLoading(true);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId
      })
    };

    try {
      const response = await fetch("http://localhost:8080/api/chat", options);
      const data = await response.json();

      const userMessage = prompt;

      const botReply = data.reply?.trim()
        ? data.reply
        : "I'm here for you. Tell me more about what's troubling you.";

      setReply(botReply);

      setPrevChats(prev => [
        ...prev,
        { user: userMessage, bot: botReply }
      ]);

      setPrompt("");
    } catch (err) {
      console.log(err);
    }

    setLoading(false);
  };

  // ✅ ROTATING QUOTES
  useEffect(() => {
    const changeQuote = () => {
      setFade(false);

      setTimeout(() => {
        const random = Math.floor(Math.random() * quotes.length);
        setQuote(quotes[random]);
        setFade(true);
      }, 300);
    };

    changeQuote();
    const interval = setInterval(changeQuote, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="chatWindow">

      <div className="navbar">
        <h2>Emora</h2>
      </div>

      <div className={`quoteBox ${fade ? "fade-in" : "fade-out"}`}>
        <p>{quote}</p>
      </div>

      <div className="chatArea">
        {prevChats.map((chat, index) => (
          <div key={index} className="chatMessage">
            <div className="chat-row left">
              <div className="chat-bubble user">{chat.user}</div>
            </div>

            <div className="chat-row right">
              <div className="chat-bubble bot">{chat.bot}</div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-row right">
            <div className="chat-bubble bot typing">
              <BeatLoader size={6} color="#aaa" />
            </div>
          </div>
        )}
      </div>

      <div className="chatInput">
        <input
          type="text"
          placeholder="How was your day?"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              getReply();
            }
          }}
        />

        <button onClick={getReply} disabled={loading}>
          ➤
        </button>
      </div>
    </div>
  );
}

export default ChatWindow;