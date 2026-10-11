import { useState } from "react";
import { MyContext } from "./MyContext";

export const MyProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const login = (token) => {
    localStorage.setItem("token", token);
    setToken(token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [allThreads, setAllThreads] = useState([]);

  return (
    <MyContext.Provider
      value={{
        token,
        login,
        logout,
        prompt,
        setPrompt,
        reply,
        setReply,
        allThreads,
        setAllThreads,
      }}
    >
      {children}
    </MyContext.Provider>
  );
};