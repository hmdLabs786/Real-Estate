import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Groq
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // API Proxy Route for Groq
  app.post("/api/chat", async (req, res) => {
    try {
      const { prompt, systemInstruction } = req.body;
      
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "GROQ_API_KEY is not configured on the server." });
      }

      const response = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          ...(systemInstruction ? [{ role: "system", content: systemInstruction } as const] : []),
          { role: "user", content: prompt },
        ],
      });
      
      const text = response.choices[0]?.message?.content || "";
      
      res.json({ text });
    } catch (error: any) {
      if (error.status === 429) {
        console.error("Groq Rate Limit Exceeded:", error.message);
        return res.status(429).json({ 
          error: "Groq Rate Limit Exceeded. Please try again in a moment." 
        });
      }
      console.error("Groq Server Error:", error);
      res.status(500).json({ error: "Failed to communicate with AI service." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
