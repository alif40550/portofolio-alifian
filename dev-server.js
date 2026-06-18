import app from "./api/index.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from public
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Development server running at http://localhost:${PORT}`);
});
