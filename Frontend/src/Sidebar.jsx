
import "./Sidebar.css";
import logo from "./assets/logo.png";
import { MyContext } from "./MyContext.jsx";
import { useContext, useEffect } from "react";
import { v1 as uuidv1 } from "uuid";

const API_URL = import.meta.env.VITE_API_URL;

function Sidebar() {
  const {
    allThreads,
    setAllThreads,
    currThreadId,
    setNewChat,
    setPrompt,
    setReply,
    setCurrThreadId,
    setPrevChats,
  } = useContext(MyContext);

  // Load all previous chats
  useEffect(() => {
    const getAllThreads = async () => {
      try {
        const response = await fetch(`${API_URL}/api/thread`);

        if (!response.ok) {
          throw new Error(`Failed to fetch threads: ${response.status}`);
        }

        const data = await response.json();

        const filteredData = data.map((thread) => ({
          threadId: thread.threadId,
          title: thread.title,
        }));

        setAllThreads(filteredData);
      } catch (err) {
        console.error("Error loading threads:", err);
      }
    };

    getAllThreads();
  }, [currThreadId, setAllThreads]);

  // Create a new chat
  const createNewChat = () => {
    setNewChat(true);
    setPrompt("");
    setReply(null);
    setCurrThreadId(uuidv1());
    setPrevChats([]);
  };

  // Open an existing chat
  const changeThread = async (newThreadId) => {
    setCurrThreadId(newThreadId);
    setNewChat(false);
    setPrompt("");
    setReply(null);

    try {
      const response = await fetch(
        `${API_URL}/api/thread/${newThreadId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to load chat: ${response.status}`);
      }

      const data = await response.json();
      const formattedChats = [];
      let lastUserIndex = -1;

      (data.chats || []).forEach((chat) => {
        if (chat.role === "user") {
          formattedChats.push({
            user: chat.content,
            bot: "",
          });
          lastUserIndex = formattedChats.length - 1;
        } else if (chat.role === "assistant") {
          if (lastUserIndex !== -1) {
            formattedChats[lastUserIndex].bot = chat.content;
          } else {
            formattedChats.push({
              user: "",
              bot: chat.content,
            });
          }
        }
      });

      setPrevChats(formattedChats);
    } catch (err) {
      console.error("Error opening chat:", err);
    }
  };

  // Delete a chat
  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(
        `${API_URL}/api/thread/${threadId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete chat: ${response.status}`);
      }

      setAllThreads((prev) =>
        prev.filter((thread) => thread.threadId !== threadId)
      );

      if (threadId === currThreadId) {
        setCurrThreadId(uuidv1());
        setPrevChats([]);
        setPrompt("");
        setReply(null);
        setNewChat(true);
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
    }
  };

  return (
    <section className="sidebar">
      <button onClick={createNewChat}>
        <img src={logo} alt="Emora" className="logo" />
        <span>
          <i className="fa-solid fa-pen-to-square"></i>
        </span>
      </button>

      <ul className="history">
        {allThreads.map((thread) => (
          <li
            key={thread.threadId}
            onClick={() => changeThread(thread.threadId)}
          >
            <span className="thread-title">{thread.title}</span>

            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteThread(thread.threadId);
              }}
              aria-label={`Delete ${thread.title}`}
            >
              <i className="fa-solid fa-trash"></i>
            </button>
          </li>
        ))}
      </ul>

      <div className="sign">
        <p>Stay Healthy &hearts;</p>
      </div>
    </section>
  );
}

export default Sidebar;
