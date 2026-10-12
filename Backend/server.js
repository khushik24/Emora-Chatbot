
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "http://localhost:5173",
  "https://emora-chatbot.vercel.app",
  "https://emora-chatbot-knvlm08kr-project-3a3b.vercel.app"
];

app.use(
  cors({
    origin: allowedOrigins
  })
);

app.use(express.json());

app.use("/api", chatRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("Connected with database");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

connectDB();
