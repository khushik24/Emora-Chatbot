import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";

dotenv.config();

const app = express();
const PORT =8080;

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use("/api",chatRoutes);

import Thread from "./models/Thread.js";

app.listen(PORT, ()=>{
  console.log(`server running on ${PORT}`);
  connectDB();
});

const connectDB = async() =>{
  try{
    await mongoose.connect(process.env.MONGO_DB_URL);
    console.log("connectect with database");
  }catch(err){
    console.log("err");
  }
};