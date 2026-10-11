console.log("chat routes loaded");
import express from "express";
import Thread from "../models/Thread.js";
import { generateReply } from "../utils/gemini.js";

const router = express.Router();

router.post("/test", async (req, res) => {
  try {
    const thread = new Thread({
      threadId: "xyz",
      title: "testing new thread",
      messages: []
    });

    const response = await thread.save();
    res.send(response);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
});


router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find().sort({ updatedAt: -1 });
    res.json(threads);
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch");
  }
});


router.get("/thread/:id", async (req, res) => {
  const { id: threadId } = req.params;

  try {
    const thread = await Thread.findOne({ threadId });

    if (!thread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.json({ chats: thread.messages });
  } catch (err) {
    console.log(err);
    res.status(500).send("Failed to fetch");
  }
});


router.delete("/thread/:id", async (req, res) => {
  const { id: threadId } = req.params;

  try {
    const deletedThread = await Thread.findOneAndDelete({ threadId });

    if (!deletedThread) {
      return res.status(404).json({ error: "Thread not found" });
    }

    res.status(200).json({ message: "Thread deleted successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).send("Thread could not be deleted");
  }
});


router.post("/chat", async (req, res) => {
  const { threadId, message } = req.body;

  console.log("Incoming:", { threadId, message }); // ✅ ADD

  if (!threadId || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let thread = await Thread.findOne({ threadId });

    if (!thread) {
      thread = new Thread({
        threadId,
        title: message.slice(0, 30),
        messages: [{ role: "user", content: message }]
      });
    } else {
      thread.messages.push({ role: "user", content: message });
    }

    console.log("Calling Gemini..."); // ✅ ADD

    const assistantReply = await generateReply(message);

    console.log("Reply:", assistantReply); // ✅ ADD

    thread.messages.push({
      role: "assistant",
      content: assistantReply
    });

    await thread.save();

    res.json({ reply: assistantReply });

  } catch (err) {
    console.log("CHAT ERROR:", err); // ✅ IMPROVED LOG
    res.status(500).json({ error: "Chat failed" });
  }
});
export default router;