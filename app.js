import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chat from "./controllers/chatbotController.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/api/chatbot", chat);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
