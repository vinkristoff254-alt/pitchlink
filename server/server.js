import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_FILE = path.join(__dirname, "messages.json");

function readMessages() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  } catch {
    return [];
  }
}
function writeMessages(msgs) {
  // keep the last 300 so the file doesn't grow forever
  fs.writeFileSync(DB_FILE, JSON.stringify(msgs.slice(-300), null, 2));
}

const app = express();
app.use(cors());
app.get("/health", (_req, res) => res.json({ ok: true }));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  socket.emit("history", readMessages());

  socket.on("message", (payload) => {
    const msgs = readMessages();
    const msg = {
      id: Date.now() + "-" + Math.random().toString(36).slice(2, 8),
      ts: Date.now(),
      ...payload,
    };
    msgs.push(msg);
    writeMessages(msgs);
    io.emit("message", msg);
  });

  socket.on("update-status", ({ id, status }) => {
    const msgs = readMessages();
    const target = msgs.find((m) => m.id === id);
    if (!target) return;
    target.status = status;
    writeMessages(msgs);
    io.emit("history", msgs); // simplest way to sync the status change everywhere
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Tournament room server on :${PORT}`));
