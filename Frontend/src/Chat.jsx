import "./Chat.css";
import { useContext } from "react";
import { MyContext } from "./MyContext.jsx";

function Chat() {
  const { prevChats } = useContext(MyContext);
  console.log(prevChats); 

  return (
    <div className="chats">
      {prevChats.map((chat, index) => (
        <div key={index} className="chatRow">
          
          <div className="userDiv">
            <p className="userMessage">{chat.user}</p>
          </div>

          <div className="gptDiv">
            <p className="gptMessage">{chat.bot}</p>
          </div>

        </div>
      ))}
    </div>
  );
}

export default Chat;