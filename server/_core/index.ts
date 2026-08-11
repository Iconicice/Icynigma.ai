import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext, getAuthenticatedUser } from "./context";
import { synthesizeWithElevenLabs, transcribeWithElevenLabs } from "../elevenlabs";
import { synthesizeWithPiper } from "./unified-tts";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  app.post("/api/speech/tts", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Sign in to generate speech." });
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    const provider = req.body?.provider === "piper" ? "piper" : "elevenlabs";
    const voice = typeof req.body?.voice === "string" ? req.body.voice : undefined;
    if (!text || text.length > 4096) return res.status(400).json({ error: "Speech text must be between 1 and 4096 characters." });
    try {
      if (provider === "piper") {
        const result = await synthesizeWithPiper({ text, voice });
        if (!result.success || !result.audioBase64) throw new Error(result.error || "Piper synthesis is unavailable.");
        res.type("audio/wav").send(Buffer.from(result.audioBase64, "base64"));
        return;
      }
      res.type("audio/mpeg").send(await synthesizeWithElevenLabs({ text, voiceId: voice }));
    } catch (error) {
      console.warn("[Speech] synthesis fallback required:", error instanceof Error ? error.message : error);
      res.status(503).json({ error: "Cloud speech is unavailable. Use browser speech instead." });
    }
  });

  app.post("/api/speech/transcribe", async (req, res) => {
    const user = await getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Sign in to transcribe audio." });
    const audioBase64 = typeof req.body?.audioBase64 === "string" ? req.body.audioBase64 : "";
    const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "audio/webm";
    const language = typeof req.body?.language === "string" ? req.body.language : undefined;
    const raw = audioBase64.includes(",") ? audioBase64.slice(audioBase64.indexOf(",") + 1) : audioBase64;
    if (!raw) return res.status(400).json({ error: "Audio is required." });
    const audio = Buffer.from(raw, "base64");
    if (!audio.length || audio.length > 10 * 1024 * 1024) return res.status(413).json({ error: "Audio must be between 1 byte and 10 MB." });
    try {
      res.json(await transcribeWithElevenLabs({ audio, mimeType, language }));
    } catch (error) {
      console.warn("[Speech] transcription fallback required:", error instanceof Error ? error.message : error);
      res.status(503).json({ error: "Cloud transcription is unavailable. Use browser recognition instead." });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
