import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { extractReviews } from "./backend/services/scraper.ts";

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
  console.warn("Warning: GEMINI_API_KEY is not set in environment variables.");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000; // Use 3000 for AI Studio, but allow override to 5000 if needed.

  app.use(express.json());

  // API Routes
  app.post("/api/analyze", async (req, res) => {
    const { content, source_type } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Content is required" });
    }

    try {
      if (source_type === 'url') {
        const scraped = await extractReviews(content);
        return res.json({
          reviews: scraped.reviews,
          productName: scraped.title,
          platform: scraped.platform,
          isFallback: scraped.isFallback
        });
      } else {
        return res.json({
          reviews: content,
          productName: "Pasted Reviews",
          platform: 'unknown',
          isFallback: false
        });
      }
    } catch (error: any) {
      console.error("Scraping Error:", error);
      res.status(500).json({ error: error.message || "Failed to extract reviews" });
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
