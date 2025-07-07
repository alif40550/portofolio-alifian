import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chat from "../controllers/chatbotController.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/chatbot", chat);

// This is required for Vercel to handle the Express app as a serverless function
export default app;
