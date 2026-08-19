import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { Send, Trophy, Circle } from "lucide-react";

// In local dev this defaults to your Termux-hosted server. Once deployed,
// set VITE_TOURNAMENT_SERVER_URL in your Vercel project's Environment
// Variables to your Render service URL (e.g. https://pitchlink-server.onrender.com)
// and redeploy — no code edit needed.
const SERVER_URL = import.meta.env.VITE_TOURNAMENT_SERVER_URL || "http://localhost:3001";

const STATUS = {
  open: { label: "Open", color: "#9BE83A" },
  full: { label: "Full", color: "#FFA733" },
  closed: { label: "Closed", color: "#FF5C5C" },
};

export default function TournamentRoom() {
  const [connected, setConnected] = useState(false);
  const [name, setName] = useState(() => localStorage.getItem("tr-name") || "");
  const [nameSet, setNameSet] = useState(!!localStorage.getItem("tr-name"));
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", code: "", status: "open", note: "" });
  const socketRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("history", (msgs) => setMessages(msgs));
    socket.on("message", (msg) => setMessages((prev) => [...prev, msg]));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function saveName() {
    if (!name.trim()) return;
    localStorage.setItem("tr-name", name.trim());
    setNameSet(true);
  }

  function sendText() {
    if (!text.trim()) return;
    socketRef.current?.emit("message", { type: "text", user: name, text: text.trim() });
    setText("");
  }

  function sendTournament() {
    if (!form.title.trim()) return;
    socketRef.current?.emit("message", { type: "tournament", user: name, ...form });
    setForm({ title: "", code: "", status: "open", note: "" });
    setShowForm(false);
  }

  function setTournamentStatus(id, status) {
    socketRef.current?.emit("update-status", { id, status });
  }

  if (!nameSet) {
    return (
      <div className="rounded-xl p-5 text-center" style={{ background: "#151F1A", border: "1px solid #223028" }}>
        <Trophy size={28} color="#9BE83A" className="mx-auto mb-2" />
        <p className="text-sm mb-3" style={{ color: "#CBD9D0" }}>Pick a name to join the tournament room</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && saveName()}
          placeholder="Your gamer tag"
          className="w-full rounded-lg px-3 py-2 text-[15px] outline-none mb-3"
          style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
        />
        <button onClick={saveName} className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "#9BE83A", color: "#0F2308" }}>
          Join Room
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Circle size={8} fill={connected ? "#9BE83A" : "#FF5C5C"} stroke="none" />
          <span className="text-xs" style={{ color: "#5C6E64" }}>{connected ? "Connected" : "Connecting…"}</span>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="text-xs px-3 py-1.5 rounded-full font-medium"
          style={{ background: "#17231D", color: "#9BE83A", border: "1px solid #26382E" }}
        >
          + Post Tournament
        </button>
      </div>

      {showForm && (
        <div className="rounded-xl p-3 mb-3 space-y-2" style={{ background: "#151F1A", border: "1px solid #223028" }}>
          <input
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Tournament name"
            className="w-full rounded-lg px-3 py-2 text-[14px] outline-none"
            style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
          />
          <input
            value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
            placeholder="Join code or link"
            className="w-full rounded-lg px-3 py-2 text-[14px] outline-none"
            style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
          />
          <div className="flex gap-2">
            {Object.entries(STATUS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setForm({ ...form, status: k })}
                className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                style={{ background: form.status === k ? v.color : "#0B1210", color: form.status === k ? "#0F2308" : "#8FA096", border: "1px solid #223028" }}
              >
                {v.label}
              </button>
            ))}
          </div>
          <input
            value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
            placeholder="Note (optional — e.g. starts 9PM, 8 slots)"
            className="w-full rounded-lg px-3 py-2 text-[14px] outline-none"
            style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
          />
          <button onClick={sendTournament} className="w-full py-2 rounded-lg text-sm font-medium" style={{ background: "#9BE83A", color: "#0F2308" }}>
            Post to room
          </button>
        </div>
      )}

      <div className="rounded-xl mb-3 overflow-y-auto" style={{ background: "#0F1613", border: "1px solid #1D2A23", height: 380 }}>
        <div className="p-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "#5C6E64" }}>No activity yet. Post a tournament or say hi.</p>
          )}
          {messages.map((m) =>
            m.type === "tournament" ? (
              <div key={m.id} className="rounded-lg p-3" style={{ background: "#151F1A", border: "1px solid #223028" }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-semibold" style={{ color: "#F1F7F3" }}>{m.title}</span>
                  <span
                    className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: STATUS[m.status]?.color, color: "#0B1210" }}
                  >
                    {STATUS[m.status]?.label}
                  </span>
                </div>
                {m.code && (
                  <div className="text-[12px] font-mono px-2 py-1 rounded mb-1 inline-block" style={{ background: "#0B1210", color: "#3FE8D6" }}>
                    {m.code}
                  </div>
                )}
                {m.note && <p className="text-[12px]" style={{ color: "#8FA096" }}>{m.note}</p>}
                <p className="text-[10px] mt-1" style={{ color: "#4A5A50" }}>
                  posted by {m.user || "someone"}
                  {m.user === name && (
                    <>
                      {" · "}
                      {Object.keys(STATUS).map((k) => (
                        <button key={k} onClick={() => setTournamentStatus(m.id, k)} className="underline mr-1" style={{ color: "#5C6E64" }}>
                          mark {k}
                        </button>
                      ))}
                    </>
                  )}
                </p>
              </div>
            ) : (
              <div key={m.id} className="text-[13px]">
                <span style={{ color: "#9BE83A" }}>{m.user || "someone"}: </span>
                <span style={{ color: "#CBD9D0" }}>{m.text}</span>
              </div>
            )
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendText()}
          placeholder="Message the room…"
          className="flex-1 rounded-lg px-3 py-2 text-[14px] outline-none"
          style={{ background: "#151F1A", border: "1px solid #223028", color: "#F1F7F3" }}
        />
        <button onClick={sendText} className="px-3 rounded-lg" style={{ background: "#9BE83A" }}>
          <Send size={18} color="#0F2308" />
        </button>
      </div>
    </div>
  );
}
