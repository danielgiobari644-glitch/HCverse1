/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Lazily initialized Gemini Client to avoid load-time crashes if key is omitted
let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY || "AIzaSyAPGXfNLl68ovQW_zTCjiiMLWBf8jo-Y3I";
    aiClient = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware
  app.use(express.json());

  // real-time Spiritual Companion query endpoint
  app.post("/api/companion", async (req, res) => {
    try {
      const { prompt, history, userName } = req.body;
      
      // Attempt to leverage Gemini, fallback gracefully if not active/failed
      const ai = getAiClient();

      const systemInstruction = `You are the HCVerse AI Spiritual Companion, an elegant, highly knowledgeable, polite, and compassionate Christian theological assistant.
Your focus is to analyze scriptures, highlight comforting bible passages, translate terms from the King James Version (KJV) using historical Hebrew or Greek translation context where useful, and draft elegant scripture studying programs/calendars.
You are talking to ${userName || 'a Believer'}. Always keep your tone peaceful, encouraging, and deeply respectful. Avoid technical or cold jargon.
When quoting Scripture, rely on the King James Version (KJV) standard.
Use Markdown formatting beautifully: wrap Bible references in bold, like **Proverbs 3:5-6**, and structure your suggestions with standard clean bullets. Let's study in grace together.`;

      const formattedContents = [];

      // Add conversation context history if exists
      if (history && Array.isArray(history) && history.length > 0) {
        // Prepare historical message array
        for (const item of history) {
          formattedContents.push({
            role: item.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: item.content || '' }]
          });
        }
        // Ensure the last item of history matches the new prompt if needed, or append current prompt
        const lastItem = formattedContents[formattedContents.length - 1];
        if (lastItem && lastItem.role !== 'user') {
          formattedContents.push({
            role: 'user',
            parts: [{ text: prompt }]
          });
        }
      } else {
        formattedContents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }

      // Filter and sanitize to guarantee strict alternating roles: user, model, user, model...
      // Starting and ending with 'user'.
      const cleanedContents: any[] = [];
      for (const msg of formattedContents) {
        if (cleanedContents.length === 0) {
          if (msg.role === 'user') {
            cleanedContents.push(msg);
          }
        } else {
          const prevMsg = cleanedContents[cleanedContents.length - 1];
          if (msg.role !== prevMsg.role) {
            cleanedContents.push(msg);
          } else {
            // Append the text if the role is consecutive and identical, to preserve context
            if (prevMsg.parts && prevMsg.parts[0] && msg.parts && msg.parts[0]) {
              prevMsg.parts[0].text += "\n" + msg.parts[0].text;
            }
          }
        }
      }

      // If the cleaned contents is empty or does not end with a 'user' message, fall back or append
      if (cleanedContents.length === 0) {
        cleanedContents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      } else if (cleanedContents[cleanedContents.length - 1].role !== 'user') {
        cleanedContents.push({
          role: 'user',
          parts: [{ text: prompt }]
        });
      }

      // Generate content via Gemini
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: cleanedContents,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.75,
          maxOutputTokens: 800,
        }
      });

      const replyText = response.text || "I am with you on your spiritual path. Let us inspect the word of truth.";
      res.json({ text: replyText });

    } catch (error: any) {
      console.warn("[Companion Warning] Gemini call failed, returning fallback. Reason:", error.message || error);
      res.status(500).json({ 
        error: "Gemini query failed",
        message: error.message || String(error)
      });
    }
  });

  // Serve Frontend assets using Vite or static middleware
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
    console.log(`[HCVerse Server] Running full-stack on http://0.0.0.0:${PORT}`);
  });
}

startServer();
