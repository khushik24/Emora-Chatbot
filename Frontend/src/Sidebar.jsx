import "./Sidebar.css";
import logo from "./assets/logo.png";
import { MyContext } from "./MyContext.jsx";
import { useContext, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats
  } = useContext(MyContext);

  // 🔹 Fetch all threads
  useEffect(() => {
    const getAllThreads = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/thread");
        const data = await response.json();

        const filteredData = data.map(thread => ({
          threadId: thread.threadId,
          title: thread.title
        }));

        setAllThreads(filteredData);
      } catch (err) {
        console.error(err);
      }
    };

    getAllThreads();
  }, [currThreadId, setAllThreads]);

  // 🔹 Create new chat
  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  // 🔹 Change thread (🔥 FIXED LOGIC HERE)
  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setNewChat(false);
    setPrompt("");
    setReply(null);

    try {
      const response = await fetch(
        `http://localhost:8080/api/thread/${newThreadId}`
      );
      const data = await response.json();

      console.log("THREAD DATA:", data);

      // ✅ Convert role/content → user/bot
      const formattedChats = [];
      let lastUserIndex = -1;

      (data.chats || []).forEach(chat => {
        if (chat.role === "user") {
          formattedChats.push({
            user: chat.content,
            bot: ""
          });
          lastUserIndex = formattedChats.length - 1;
        } else if (chat.role === "assistant") {
          if (lastUserIndex !== -1) {
            formattedChats[lastUserIndex].bot = chat.content;
          } else {
            // edge case: assistant comes first
            formattedChats.push({
              user: "",
              bot: chat.content
            });
          }
        }
      });

      console.log("FORMATTED:", formattedChats);

      setPrevChats(formattedChats);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Delete thread
  const deleteThread = async (threadId) => {
    try {
      await fetch(`http://localhost:8080/api/thread/${threadId}`, {
        method: "DELETE"
      });

      setAllThreads(prev =>
        prev.filter(thread => thread.threadId !== threadId)
      );

      if (threadId === currThreadId) {
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setNewChat(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <section className="sidebar">
      {/* 🔹 New Chat Button */}
      <button onClick={createNewChat}>
        <img src={logo} alt="emora" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      {/* 🔹 Threads List */}
      <ul className="history">
        {allThreads.map(thread => (
          <li
            key={thread.threadId}
            onClick={() => changeThread(thread.threadId)}
          >
            <span className="thread-title">{thread.title}</span>

            <button
              className="delete-btn"
              onClick={e => {
                e.stopPropagation(); // ✅ prevent thread click
                deleteThread(thread.threadId);
              }}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </li>
        ))}
      </ul>

      {/* 🔹 Footer */}
      <div className="sign">
        <p>Stay Healthy &hearts;</p>
      </div>
    </section>
  );
}

export default Sidebar;