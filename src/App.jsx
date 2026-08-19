import React, { useState, useEffect, useRef } from "react";
import { Plus, X, Trash2, Pencil, ArrowLeft, Star, Search, Circle, Move } from "lucide-react";
import TournamentRoom from "./TournamentRoom.jsx";

/* ---------- static data ---------- */

const ATT_FIELDS = [
  ["offensiveAwareness", "Offensive Awareness"],
  ["ballControl", "Ball Control"],
  ["dribbling", "Dribbling"],
  ["tightPossession", "Tight Possession"],
  ["lowPass", "Low Pass"],
  ["loftedPass", "Lofted Pass"],
  ["finishing", "Finishing"],
  ["heading", "Heading"],
  ["placeKicking", "Place Kicking"],
  ["curl", "Curl"],
];

const DEF_FIELDS = [
  ["defensiveAwareness", "Defensive Awareness"],
  ["tackling", "Tackling"],
  ["aggression", "Aggression"],
  ["defensiveEngagement", "Defensive Engagement"],
  ["gkAwareness", "GK Awareness"],
  ["gkCatching", "GK Catching"],
  ["gkParrying", "GK Parrying"],
  ["gkReflexes", "GK Reflexes"],
  ["gkReach", "GK Reach"],
];

const STR_FIELDS = [
  ["speed", "Speed"],
  ["acceleration", "Acceleration"],
  ["kickingPower", "Kicking Power"],
  ["jumping", "Jumping"],
  ["physicalContact", "Physical Contact"],
  ["balance", "Balance"],
  ["stamina", "Stamina"],
];

// Body Model uses a small 1-15 scale (matches in-game body-shape sliders),
// unlike the 1-99 ability stats above.
const BODY_MODEL_FIELDS = [
  ["armLength", "Arm Length"],
  ["shoulderWidth", "Shoulder Width"],
  ["neckLength", "Neck Length"],
  ["chestMeasurement", "Chest Measurement"],
  ["neckSize", "Neck Size"],
  ["shoulderHeight", "Shoulder Height"],
  ["legLength", "Leg Length"],
  ["thighSize", "Thigh Size"],
  ["waistSize", "Waist Size"],
  ["armSize", "Arm Size"],
  ["calfSize", "Calf Size"],
];

// Body Physics: real-world physical attributes, each with its own sensible range.
const BODY_PHYSICS_FIELDS = [
  ["height", "Height (cm)", 150, 210],
  ["weight", "Weight (kg)", 50, 100],
  ["age", "Age", 15, 45],
  ["weakFootUsage", "Weak Foot Usage", 1, 4],
  ["weakFootAccuracy", "Weak Foot Accuracy", 1, 99],
  ["injuryResistance", "Injury Resistance", 1, 3],
];

const PREFERRED_FOOT_OPTIONS = ["Right", "Left", "Both"];

const POSITIONS = ["GK", "CB", "LB", "RB", "DMF", "CMF", "LMF", "RMF", "AMF", "LWF", "RWF", "SS", "CF"];

const DEFAULT_PLAY_STYLES = [
  "Offensive Goalkeeper", "Defensive Goalkeeper",
  "Build Up", "Extra Frontman", "Destroyer", "Cover Specialist",
  "Offensive Full-back", "Defensive Full-back", "Fullback Finisher",
  "Anchor Man", "Orchestrator", "Box-to-Box", "Deep-Lying Playmaker",
  "Creative Playmaker", "Classic No.10", "Hole Player",
  "Prolific Winger", "Roaming Flank", "Cross Specialist", "Classic Winger",
  "Goal Poacher", "Fox in the Box", "Dummy Runner", "Target Man", "Deep-Lying Forward",
];

const DEFAULT_SKILLS = [
  "Long Range Drive", "Long Range Shooting", "Knuckle Shot", "Chip Shot Control",
  "First-time Shot", "Acrobatic Finishing", "Heading Specialist", "Man Marking",
  "Interception", "Aggressive Dribbling", "Track Back", "Rabona", "Marseille Turn",
  "Sombrero Flick", "Flip Flap", "Scotch Move", "No Look Pass", "Low Lofted Pass",
  "Through Passing", "Weighted Pass", "One-touch Pass", "Double Touch",
  "Cut Behind & Turn", "Gamesmanship", "Long Throw", "Captaincy", "Super-Sub",
  "Fighting Spirit", "Penalty Specialist", "Direct Free Kick",
  "GK High Punt", "One-handed Catch",
];

const FORMATIONS = {
  "4-3-3": [
    { id: "gk", pos: "GK", x: 50, y: 92 },
    { id: "lb", pos: "LB", x: 13, y: 73 },
    { id: "cb1", pos: "CB", x: 36, y: 79 },
    { id: "cb2", pos: "CB", x: 64, y: 79 },
    { id: "rb", pos: "RB", x: 87, y: 73 },
    { id: "cdm", pos: "DMF", x: 50, y: 58 },
    { id: "cm1", pos: "CMF", x: 28, y: 45 },
    { id: "cm2", pos: "CMF", x: 72, y: 45 },
    { id: "lw", pos: "LWF", x: 14, y: 19 },
    { id: "st", pos: "CF", x: 50, y: 9 },
    { id: "rw", pos: "RWF", x: 86, y: 19 },
  ],
  "4-4-2": [
    { id: "gk", pos: "GK", x: 50, y: 92 },
    { id: "lb", pos: "LB", x: 13, y: 74 },
    { id: "cb1", pos: "CB", x: 36, y: 80 },
    { id: "cb2", pos: "CB", x: 64, y: 80 },
    { id: "rb", pos: "RB", x: 87, y: 74 },
    { id: "lm", pos: "LMF", x: 10, y: 45 },
    { id: "cm1", pos: "CMF", x: 37, y: 48 },
    { id: "cm2", pos: "CMF", x: 63, y: 48 },
    { id: "rm", pos: "RMF", x: 90, y: 45 },
    { id: "st1", pos: "CF", x: 37, y: 13 },
    { id: "st2", pos: "CF", x: 63, y: 13 },
  ],
  "4-2-3-1": [
    { id: "gk", pos: "GK", x: 50, y: 92 },
    { id: "lb", pos: "LB", x: 13, y: 74 },
    { id: "cb1", pos: "CB", x: 36, y: 80 },
    { id: "cb2", pos: "CB", x: 64, y: 80 },
    { id: "rb", pos: "RB", x: 87, y: 74 },
    { id: "dm1", pos: "DMF", x: 36, y: 59 },
    { id: "dm2", pos: "DMF", x: 64, y: 59 },
    { id: "aml", pos: "AMF", x: 16, y: 33 },
    { id: "amc", pos: "AMF", x: 50, y: 30 },
    { id: "amr", pos: "AMF", x: 84, y: 33 },
    { id: "cf", pos: "CF", x: 50, y: 9 },
  ],
  "3-5-2": [
    { id: "gk", pos: "GK", x: 50, y: 92 },
    { id: "cb1", pos: "CB", x: 25, y: 78 },
    { id: "cb2", pos: "CB", x: 50, y: 82 },
    { id: "cb3", pos: "CB", x: 75, y: 78 },
    { id: "lm", pos: "LMF", x: 7, y: 50 },
    { id: "cdm", pos: "DMF", x: 36, y: 55 },
    { id: "am", pos: "AMF", x: 50, y: 34 },
    { id: "cm", pos: "CMF", x: 64, y: 55 },
    { id: "rm", pos: "RMF", x: 93, y: 50 },
    { id: "st1", pos: "CF", x: 37, y: 14 },
    { id: "st2", pos: "CF", x: 63, y: 14 },
  ],
};

const DEFAULT_ADDITIONAL_SKILLS = [];

const uid = () => Math.random().toString(36).slice(2, 10);

const emptyPlayer = () => ({
  id: uid(),
  name: "",
  position: "CF",
  ovr: 80,
  playStyles: [],
  attacking: Object.fromEntries(ATT_FIELDS.map(([k]) => [k, 70])),
  defending: Object.fromEntries(DEF_FIELDS.map(([k]) => [k, 50])),
  strength: Object.fromEntries(STR_FIELDS.map(([k]) => [k, 70])),
  bodyModel: Object.fromEntries(BODY_MODEL_FIELDS.map(([k]) => [k, 7])),
  bodyPhysics: Object.fromEntries(BODY_PHYSICS_FIELDS.map(([k]) => [k, 0])),
  preferredFoot: "Right",
  boosted: [],
  skills: [],
  additionalSkills: [],
});

const SAMPLE_PLAYERS = [
  {
    id: uid(), name: "P. E. Aubameyang", position: "CF", ovr: 102.32,
    playStyles: ["Goal Poacher", "Fox in the Box"],
    attacking: { offensiveAwareness: 95, ballControl: 83, dribbling: 87, tightPossession: 80, lowPass: 66, loftedPass: 64, finishing: 89, heading: 76, placeKicking: 76, curl: 82 },
    defending: { defensiveAwareness: 46, tackling: 50, aggression: 51, defensiveEngagement: 49 },
    strength: { speed: 95, acceleration: 95, kickingPower: 84, jumping: 82, physicalContact: 78, balance: 87, stamina: 89 },
    bodyModel: { armLength: 8, shoulderWidth: 5, neckLength: 7, chestMeasurement: 6, neckSize: 7, shoulderHeight: 7, legLength: 11, thighSize: 6, waistSize: 5, armSize: 8, calfSize: 6 },
    bodyPhysics: { height: 187, weight: 80, age: 34, weakFootUsage: 3, weakFootAccuracy: 76, injuryResistance: 2 },
    preferredFoot: "Right",
    boosted: ["offensiveAwareness", "ballControl"],
    skills: ["First-time Shot", "Acrobatic Finishing", "Long Range Drive"],
    additionalSkills: [],
  },
];

const emptyManager = () => ({ id: uid(), name: "", teamStyles: [], notes: "" });

const DEFAULT_TEAM_STYLES = [
  "Possession Game", "Quick Counter", "Long Ball Counter", "Out Wide",
  "Long Ball", "Overload", "Counter Press", "High Press", "Contain", "Deep Defense",
];

function normalizePlayer(p) {
  const base = emptyPlayer();
  return {
    ...base,
    ...p,
    attacking: { ...base.attacking, ...(p.attacking || {}) },
    defending: { ...base.defending, ...(p.defending || {}) },
    strength: { ...base.strength, ...(p.strength || {}) },
    bodyModel: { ...base.bodyModel, ...(p.bodyModel || {}) },
    bodyPhysics: { ...base.bodyPhysics, ...(p.bodyPhysics || {}) },
    playStyles: p.playStyles || [],
    boosted: p.boosted || [],
    skills: p.skills || [],
    additionalSkills: p.additionalSkills || [],
  };
}

/* ---------- helpers ---------- */

function tier(v) {
  if (v >= 90) return { bg: "#3FE8D6", fg: "#07211D" };
  if (v >= 80) return { bg: "#9BE83A", fg: "#0F2308" };
  if (v >= 70) return { bg: "#FFA733", fg: "#2B1600" };
  return { bg: "#FF5C5C", fg: "#2B0505" };
}

function ovrTier(v) {
  if (v >= 95) return "#3FE8D6";
  if (v >= 85) return "#9BE83A";
  if (v >= 75) return "#FFA733";
  return "#FF5C5C";
}

function loadList(key, defaults) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaults;
  } catch {
    return defaults;
  }
}
function saveList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}
const loadObj = loadList;
const saveObj = saveList;

function loadState() {
  try {
    const raw = localStorage.getItem("squad-builder-state");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveState(state) {
  try {
    localStorage.setItem("squad-builder-state", JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

// Loaded once, only if the person has no saved squad yet — this is the
// dataset produced by scripts/fetch_players.py (see TERMUX_SETUP.md).
async function loadDatasetPlayers() {
  try {
    const res = await fetch("/players.json");
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length ? data : null;
  } catch {
    return null;
  }
}

/* ---------- small UI atoms ---------- */

function StatPill({ value }) {
  const t = tier(value);
  return (
    <span
      className="font-display px-2 py-0.5 rounded text-[15px] font-bold min-w-[34px] text-center inline-block"
      style={{ background: t.bg, color: t.fg }}
    >
      {value}
    </span>
  );
}

function NeutralPill({ value }) {
  return (
    <span
      className="font-display px-2 py-0.5 rounded text-[15px] font-bold min-w-[34px] text-center inline-block"
      style={{ background: "#1B2A22", color: "#9BE83A" }}
    >
      {value}
    </span>
  );
}

// Fixed-width numeric field for stat entry. Keeps its own local text state
// while the person is typing and only clamps to [min, max] on blur — this is
// what stops it from snapping to the max value mid-edit on mobile.
function NumberField({ value, onChange, min = 1, max = 99 }) {
  const [text, setText] = useState(String(value));
  useEffect(() => { setText(String(value)); }, [value]);

  function commit() {
    let n = parseInt(text, 10);
    if (isNaN(n)) n = min;
    n = Math.max(min, Math.min(max, n));
    setText(String(n));
    if (n !== value) onChange(n);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      value={text}
      onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ""))}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
      onFocus={(e) => e.target.select()}
      className="w-16 rounded-lg px-2 py-1 text-center text-[14px] outline-none"
      style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
    />
  );
}

function Chip({ label, active, onClick, small }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border transition-colors ${small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"}`}
      style={{
        borderColor: active ? "#9BE83A" : "#2B3A32",
        background: active ? "rgba(155,232,58,0.15)" : "transparent",
        color: active ? "#C7FF6E" : "#8FA096",
      }}
    >
      {label}
    </button>
  );
}

/* ---------- Pitch slot tile ---------- */

function EditablePitchTile({ slot, onDrag, onPosChange, pitchRef }) {
  function handlePointerDown(e) {
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e) {
    if (e.buttons === 0) return;
    const rect = pitchRef.current.getBoundingClientRect();
    let x = ((e.clientX - rect.left) / rect.width) * 100;
    let y = ((e.clientY - rect.top) / rect.height) * 100;
    x = Math.max(3, Math.min(97, x));
    y = Math.max(3, Math.min(97, y));
    onDrag(slot.id, x, y);
  }
  return (
    <div
      className="absolute flex flex-col items-center gap-0.5 touch-none"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: "translate(-50%,-50%)" }}
    >
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        className="rounded-full flex items-center justify-center font-display font-bold text-[13px] cursor-grab"
        style={{ width: 42, height: 42, background: "#9BE83A", color: "#0F2308", border: "2px solid rgba(255,255,255,0.4)" }}
      >
        <Move size={16} />
      </div>
      <select
        value={slot.pos}
        onChange={(e) => onPosChange(slot.id, e.target.value)}
        onPointerDown={(e) => e.stopPropagation()}
        className="text-[9px] uppercase rounded px-1 py-0.5 outline-none"
        style={{ background: "#0B1210", color: "#9BE83A", border: "1px solid #223028" }}
      >
        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
      </select>
    </div>
  );
}

function PitchTile({ slot, player, onClick }) {
  const color = player ? ovrTier(player.ovr) : "#3A4A41";
  return (
    <button
      onClick={onClick}
      className="absolute flex flex-col items-center gap-0.5"
      style={{ left: `${slot.x}%`, top: `${slot.y}%`, transform: "translate(-50%,-50%)" }}
    >
      <div
        className="rounded-full flex items-center justify-center font-display font-bold text-[15px]"
        style={{
          width: 42, height: 42,
          background: player ? color : "rgba(20,28,26,0.85)",
          color: player ? "#0B1210" : "#5C6E64",
          border: player ? "2px solid rgba(255,255,255,0.25)" : "2px dashed #3A4A41",
        }}
      >
        {player ? Math.round(player.ovr) : <Plus size={16} />}
      </div>
      <div className="font-body text-[9px] tracking-wide uppercase" style={{ color: "#7C8C82" }}>
        {slot.pos}
      </div>
      {player && (
        <div className="font-body text-[9px] leading-none max-w-[54px] truncate" style={{ color: "#D6E4DB" }}>
          {player.name.split(" ").slice(-1)[0]}
        </div>
      )}
    </button>
  );
}

/* ---------- Player detail card ---------- */

function StatSectionView({ title, fields, values, boosted, pillType = "tier" }) {
  return (
    <div className="px-5 py-3" style={{ borderTop: "1px solid #1D2A23" }}>
      <h3 className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5C6E64" }}>{title}</h3>
      <div className="space-y-1.5">
        {fields.map(([k, label]) => (
          <div key={k} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              {boosted && boosted.includes(k) && <Circle size={7} fill="#3FE8D6" stroke="none" />}
              <span className="font-body text-[14px]" style={{ color: "#CBD9D0" }}>{label}</span>
            </div>
            {pillType === "tier" ? <StatPill value={values[k]} /> : <NeutralPill value={values[k]} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChipSectionView({ title, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="px-5 py-3" style={{ borderTop: "1px solid #1D2A23" }}>
      <h3 className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5C6E64" }}>{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {items.map((s) => (
          <span key={s} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "#17231D", color: "#9BE83A", border: "1px solid #26382E" }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

function PlayerCard({ player, onClose, onEdit, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(5,9,8,0.75)" }}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[88vh] overflow-y-auto" style={{ background: "#101815", border: "1px solid #223028" }}>
        <div className="sticky top-0 flex items-center justify-between px-4 py-3" style={{ background: "#101815", borderBottom: "1px solid #1D2A23" }}>
          <button onClick={onClose} className="text-[#8FA096]"><ArrowLeft size={20} /></button>
          <div className="flex gap-3">
            <button onClick={() => onEdit(player)} className="text-[#8FA096]"><Pencil size={18} /></button>
            <button onClick={() => onDelete(player.id)} className="text-[#FF5C5C]"><Trash2 size={18} /></button>
          </div>
        </div>

        <div className="px-5 pt-4 pb-2 text-center">
          <h2 className="font-display uppercase tracking-wide text-2xl font-bold" style={{ color: "#F1F7F3" }}>
            {player.name || "Unnamed Player"}
          </h2>
          <div className="flex justify-center gap-2 mt-1 flex-wrap">
            {player.playStyles.map((s) => (
              <span key={s} className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full" style={{ background: "#1B2A22", color: "#9BE83A" }}>
                {s}
              </span>
            ))}
          </div>
          <div className="mt-3 inline-block px-4 py-1 rounded-lg font-display font-bold text-2xl" style={{ background: ovrTier(player.ovr), color: "#0B1210" }}>
            {player.ovr}
          </div>
          <div className="text-xs mt-1 tracking-widest uppercase" style={{ color: "#5C6E64" }}>
            {player.position} · {player.preferredFoot} Foot
          </div>
        </div>

        <StatSectionView title="Attacking Awareness" fields={ATT_FIELDS} values={player.attacking} boosted={player.boosted} />
        <StatSectionView title="Defending" fields={DEF_FIELDS} values={player.defending} boosted={player.boosted} />
        <StatSectionView title="Strength" fields={STR_FIELDS} values={player.strength} boosted={player.boosted} />
        <StatSectionView title="Body Model" fields={BODY_MODEL_FIELDS} values={player.bodyModel} pillType="neutral" />
        <StatSectionView
          title="Body Physics"
          fields={BODY_PHYSICS_FIELDS.map(([k, label]) => [k, label])}
          values={player.bodyPhysics}
          pillType="neutral"
        />

        <ChipSectionView title="Skills" items={player.skills} />
        <ChipSectionView title="Additional Skills" items={player.additionalSkills} />

        {player.boosted.length > 0 && (
          <div className="px-5 py-3 pb-6" style={{ borderTop: "1px solid #1D2A23" }}>
            <h3 className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5C6E64" }}>Boosters Active</h3>
            <div className="flex flex-wrap gap-1.5">
              {player.boosted.map((k) => {
                const f = [...ATT_FIELDS, ...DEF_FIELDS, ...STR_FIELDS].find((f) => f[0] === k);
                return (
                  <span key={k} className="text-xs px-2.5 py-1 rounded-full flex items-center gap-1" style={{ background: "#0F2323", color: "#3FE8D6", border: "1px solid #1D3A38" }}>
                    <Circle size={6} fill="#3FE8D6" stroke="none" />
                    {f?.[1] || k}
                  </span>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- editable chip list (used for Playing Styles & Skills) ---------- */

function ManageableChipList({ label, hint, list, selected, onToggle, max, onAdd, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [newVal, setNewVal] = useState("");

  function submitAdd() {
    const v = newVal.trim();
    if (!v) return;
    if (list.some((x) => x.toLowerCase() === v.toLowerCase())) { setNewVal(""); return; }
    onAdd(v);
    setNewVal("");
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>
          {label} {hint && <span style={{ color: "#3FE8D6" }}>· {hint}</span>}
        </label>
        <button onClick={() => setEditing((e) => !e)} className="text-[11px] font-medium" style={{ color: editing ? "#FF8484" : "#9BE83A" }}>
          {editing ? "Done" : "Edit list"}
        </button>
      </div>

      {editing && (
        <div className="flex gap-2 mt-2 mb-1">
          <input
            value={newVal}
            onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitAdd()}
            placeholder={`Add a ${label.toLowerCase().split(" (")[0].replace(/s$/, "")}…`}
            className="flex-1 rounded-lg px-3 py-1.5 text-[13px] outline-none"
            style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
          />
          <button onClick={submitAdd} className="px-3 rounded-lg text-xs font-medium" style={{ background: "#9BE83A", color: "#0F2308" }}>
            Add
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mt-2">
        {list.map((s) =>
          editing ? (
            <span key={s} className="flex items-center gap-1 rounded-full pl-3 pr-1.5 py-1 text-xs" style={{ background: "#1B1414", color: "#E8B4B4", border: "1px solid #3A2323" }}>
              {s}
              <button onClick={() => onRemove(s)} className="rounded-full p-0.5" style={{ color: "#FF8484" }}>
                <X size={12} />
              </button>
            </span>
          ) : (
            <Chip key={s} label={s} small active={selected.includes(s)} onClick={() => onToggle(s, max)} />
          )
        )}
        {list.length === 0 && <p className="text-xs" style={{ color: "#5C6E64" }}>Nothing here yet — add one above.</p>}
      </div>
    </div>
  );
}

/* ---------- Player editor ---------- */

function EditableStatSection({ title, hint, fields, section, p, setP, boostable }) {
  const setVal = (k, v) => setP((prev) => ({ ...prev, [section]: { ...prev[section], [k]: v } }));
  const toggleBoost = (k) =>
    setP((prev) => ({
      ...prev,
      boosted: prev.boosted.includes(k) ? prev.boosted.filter((x) => x !== k) : [...prev.boosted, k],
    }));

  return (
    <div>
      <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>
        {title} {hint && <span style={{ color: "#3FE8D6" }}>· {hint}</span>}
      </label>
      <div className="mt-2 space-y-2">
        {fields.map(([k, label, min, max]) => (
          <div key={k} className="flex items-center gap-2">
            {boostable && (
              <button onClick={() => toggleBoost(k)} className="shrink-0" title="Toggle booster">
                <Circle size={12} fill={p.boosted.includes(k) ? "#3FE8D6" : "none"} stroke={p.boosted.includes(k) ? "#3FE8D6" : "#3A4A41"} />
              </button>
            )}
            <span className="text-[13px] flex-1" style={{ color: "#CBD9D0" }}>{label}</span>
            <NumberField value={p[section][k]} onChange={(v) => setVal(k, v)} min={min ?? 1} max={max ?? 99} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PlayerEditor({
  initial, skillsList, styleList, additionalSkillsList,
  onAddSkill, onRemoveSkill, onAddStyle, onRemoveStyle,
  onAddAdditionalSkill, onRemoveAdditionalSkill,
  onSave, onCancel,
}) {
  const [p, setP] = useState(initial);

  const toggleArr = (field, val, max) =>
    setP((prev) => {
      const has = prev[field].includes(val);
      if (has) return { ...prev, [field]: prev[field].filter((x) => x !== val) };
      if (max && prev[field].length >= max) return prev;
      return { ...prev, [field]: [...prev[field], val] };
    });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(5,9,8,0.8)" }}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto" style={{ background: "#101815", border: "1px solid #223028" }}>
        <div className="sticky top-0 flex items-center justify-between px-4 py-3" style={{ background: "#101815", borderBottom: "1px solid #1D2A23" }}>
          <button onClick={onCancel} className="text-[#8FA096] text-sm">Cancel</button>
          <span className="font-display uppercase tracking-wide text-sm" style={{ color: "#F1F7F3" }}>Edit Player</span>
          <button
            onClick={() => p.name.trim() && onSave(p)}
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{ background: "#9BE83A", color: "#0F2308" }}
          >
            Save
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>Name</label>
            <input
              value={p.name}
              onChange={(e) => setP({ ...p, name: e.target.value })}
              placeholder="Player name"
              className="w-full mt-1 rounded-lg px-3 py-2 text-[15px] outline-none"
              style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>Position</label>
              <select
                value={p.position}
                onChange={(e) => setP({ ...p, position: e.target.value })}
                className="w-full mt-1 rounded-lg px-3 py-2 text-[15px] outline-none"
                style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
              >
                {POSITIONS.map((pos) => <option key={pos} value={pos}>{pos}</option>)}
              </select>
            </div>
            <div className="w-28">
              <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>Rating</label>
              <input
                type="number" step="0.01"
                value={p.ovr}
                onChange={(e) => setP({ ...p, ovr: Number(e.target.value) })}
                className="w-full mt-1 rounded-lg px-3 py-2 text-[15px] outline-none"
                style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>Preferred Foot</label>
            <div className="flex gap-2 mt-2">
              {PREFERRED_FOOT_OPTIONS.map((foot) => (
                <button
                  key={foot}
                  onClick={() => setP({ ...p, preferredFoot: foot })}
                  className="flex-1 py-1.5 rounded-lg text-xs font-medium"
                  style={{ background: p.preferredFoot === foot ? "#9BE83A" : "#0B1210", color: p.preferredFoot === foot ? "#0F2308" : "#8FA096", border: "1px solid #223028" }}
                >
                  {foot}
                </button>
              ))}
            </div>
          </div>

          <ManageableChipList
            label="Playstyles"
            hint="max 2"
            list={styleList}
            selected={p.playStyles}
            max={2}
            onToggle={(s, max) => toggleArr("playStyles", s, max)}
            onAdd={onAddStyle}
            onRemove={(s) => { onRemoveStyle(s); setP((prev) => ({ ...prev, playStyles: prev.playStyles.filter((x) => x !== s) })); }}
          />

          <EditableStatSection title="Attacking Awareness" hint="tap dot to boost" fields={ATT_FIELDS} section="attacking" p={p} setP={setP} boostable />
          <EditableStatSection title="Defending" hint="tap dot to boost" fields={DEF_FIELDS} section="defending" p={p} setP={setP} boostable />
          <EditableStatSection title="Strength" hint="tap dot to boost" fields={STR_FIELDS} section="strength" p={p} setP={setP} boostable />
          <EditableStatSection title="Body Model" hint="1–15 scale" fields={BODY_MODEL_FIELDS.map(([k, l]) => [k, l, 1, 15])} section="bodyModel" p={p} setP={setP} />
          <EditableStatSection title="Body Physics" fields={BODY_PHYSICS_FIELDS} section="bodyPhysics" p={p} setP={setP} />

          <ManageableChipList
            label="Skills"
            list={skillsList}
            selected={p.skills}
            onToggle={(s) => toggleArr("skills", s)}
            onAdd={onAddSkill}
            onRemove={(s) => { onRemoveSkill(s); setP((prev) => ({ ...prev, skills: prev.skills.filter((x) => x !== s) })); }}
          />

          <div className="pb-4">
            <ManageableChipList
              label="Additional Skills"
              list={additionalSkillsList}
              selected={p.additionalSkills}
              onToggle={(s) => toggleArr("additionalSkills", s)}
              onAdd={onAddAdditionalSkill}
              onRemove={(s) => { onRemoveAdditionalSkill(s); setP((prev) => ({ ...prev, additionalSkills: prev.additionalSkills.filter((x) => x !== s) })); }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Manager / coach editor & card ---------- */

function ManagerEditor({ initial, teamStyleList, onAddStyle, onRemoveStyle, onSave, onCancel }) {
  const [m, setM] = useState(initial);
  const toggle = (s) =>
    setM((prev) => ({
      ...prev,
      teamStyles: prev.teamStyles.includes(s) ? prev.teamStyles.filter((x) => x !== s) : [...prev.teamStyles, s],
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(5,9,8,0.8)" }}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto" style={{ background: "#101815", border: "1px solid #223028" }}>
        <div className="sticky top-0 flex items-center justify-between px-4 py-3" style={{ background: "#101815", borderBottom: "1px solid #1D2A23" }}>
          <button onClick={onCancel} className="text-[#8FA096] text-sm">Cancel</button>
          <span className="font-display uppercase tracking-wide text-sm" style={{ color: "#F1F7F3" }}>Edit Manager</span>
          <button
            onClick={() => m.name.trim() && onSave(m)}
            className="text-sm font-semibold px-3 py-1 rounded-full"
            style={{ background: "#9BE83A", color: "#0F2308" }}
          >
            Save
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>Name</label>
            <input
              value={m.name}
              onChange={(e) => setM({ ...m, name: e.target.value })}
              placeholder="Manager name"
              className="w-full mt-1 rounded-lg px-3 py-2 text-[15px] outline-none"
              style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
            />
          </div>
          <ManageableChipList
            label="Team Playstyle"
            list={teamStyleList}
            selected={m.teamStyles}
            onToggle={(s) => toggle(s)}
            onAdd={onAddStyle}
            onRemove={(s) => { onRemoveStyle(s); setM((prev) => ({ ...prev, teamStyles: prev.teamStyles.filter((x) => x !== s) })); }}
          />
          <div className="pb-4">
            <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>Notes</label>
            <textarea
              value={m.notes}
              onChange={(e) => setM({ ...m, notes: e.target.value })}
              placeholder="Preferred formation, tactics, anything worth remembering"
              rows={3}
              className="w-full mt-1 rounded-lg px-3 py-2 text-[14px] outline-none resize-none"
              style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ManagerCard({ manager, onClose, onEdit, onDelete }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(5,9,8,0.75)" }}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[88vh] overflow-y-auto" style={{ background: "#101815", border: "1px solid #223028" }}>
        <div className="sticky top-0 flex items-center justify-between px-4 py-3" style={{ background: "#101815", borderBottom: "1px solid #1D2A23" }}>
          <button onClick={onClose} className="text-[#8FA096]"><ArrowLeft size={20} /></button>
          <div className="flex gap-3">
            <button onClick={() => onEdit(manager)} className="text-[#8FA096]"><Pencil size={18} /></button>
            <button onClick={() => onDelete(manager.id)} className="text-[#FF5C5C]"><Trash2 size={18} /></button>
          </div>
        </div>
        <div className="px-5 pt-4 pb-6 text-center">
          <h2 className="font-display uppercase tracking-wide text-2xl font-bold" style={{ color: "#F1F7F3" }}>{manager.name}</h2>
          <div className="flex justify-center gap-1.5 mt-3 flex-wrap">
            {manager.teamStyles.map((s) => (
              <span key={s} className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full" style={{ background: "#17231D", color: "#9BE83A", border: "1px solid #26382E" }}>
                {s}
              </span>
            ))}
            {manager.teamStyles.length === 0 && <span className="text-xs" style={{ color: "#5C6E64" }}>No team playstyle set</span>}
          </div>
          {manager.notes && (
            <p className="text-sm mt-4 text-left" style={{ color: "#CBD9D0" }}>{manager.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Position picker (assign to slot) ---------- */

function Picker({ roster, onPick, onClear, hasCurrent, onClose }) {
  const [q, setQ] = useState("");
  const filtered = roster.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(5,9,8,0.8)" }}>
      <div className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[80vh] overflow-y-auto" style={{ background: "#101815", border: "1px solid #223028" }}>
        <div className="sticky top-0 px-4 py-3 flex items-center justify-between" style={{ background: "#101815", borderBottom: "1px solid #1D2A23" }}>
          <span className="font-display uppercase tracking-wide text-sm" style={{ color: "#F1F7F3" }}>Select Player</span>
          <button onClick={onClose} style={{ color: "#8FA096" }}><X size={20} /></button>
        </div>
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: "#0B1210", border: "1px solid #223028" }}>
            <Search size={15} color="#5C6E64" />
            <input
              value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search roster"
              className="bg-transparent outline-none text-[14px] flex-1" style={{ color: "#F1F7F3" }}
            />
          </div>
        </div>
        {hasCurrent && (
          <button onClick={onClear} className="mx-4 mt-3 w-[calc(100%-2rem)] text-left px-3 py-2 rounded-lg text-sm" style={{ background: "#2A1414", color: "#FF8484", border: "1px solid #3A1D1D" }}>
            Remove player from this spot
          </button>
        )}
        <div className="px-4 py-3 space-y-1.5">
          {filtered.length === 0 && <div className="text-sm text-center py-6" style={{ color: "#5C6E64" }}>No players found</div>}
          {filtered.map((p) => (
            <button key={p.id} onClick={() => onPick(p.id)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#151F1A" }}>
              <div className="text-left">
                <div className="text-[14px] font-medium" style={{ color: "#F1F7F3" }}>{p.name}</div>
                <div className="text-[11px] uppercase tracking-wide" style={{ color: "#5C6E64" }}>{p.position}</div>
              </div>
              <span className="font-display font-bold px-2 py-0.5 rounded" style={{ background: ovrTier(p.ovr), color: "#0B1210" }}>{Math.round(p.ovr)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Main App ---------- */

export default function App() {
  const [players, setPlayers] = useState(SAMPLE_PLAYERS);
  const [skillsList, setSkillsList] = useState(() => loadList("skills-list-v1", DEFAULT_SKILLS));
  const [styleList, setStyleList] = useState(() => loadList("styles-list-v1", DEFAULT_PLAY_STYLES));
  const [additionalSkillsList, setAdditionalSkillsList] = useState(() => loadList("additional-skills-list-v1", DEFAULT_ADDITIONAL_SKILLS));

  function addSkill(name) {
    setSkillsList((prev) => { const next = [...prev, name]; saveList("skills-list-v1", next); return next; });
  }
  function removeSkill(name) {
    setSkillsList((prev) => { const next = prev.filter((s) => s !== name); saveList("skills-list-v1", next); return next; });
    setPlayers((prev) => prev.map((pl) => ({ ...pl, skills: pl.skills.filter((s) => s !== name) })));
  }
  function addAdditionalSkill(name) {
    setAdditionalSkillsList((prev) => { const next = [...prev, name]; saveList("additional-skills-list-v1", next); return next; });
  }
  function removeAdditionalSkill(name) {
    setAdditionalSkillsList((prev) => { const next = prev.filter((s) => s !== name); saveList("additional-skills-list-v1", next); return next; });
    setPlayers((prev) => prev.map((pl) => ({ ...pl, additionalSkills: pl.additionalSkills.filter((s) => s !== name) })));
  }
  function addStyle(name) {
    setStyleList((prev) => { const next = [...prev, name]; saveList("styles-list-v1", next); return next; });
  }
  function removeStyle(name) {
    setStyleList((prev) => { const next = prev.filter((s) => s !== name); saveList("styles-list-v1", next); return next; });
    setPlayers((prev) => prev.map((pl) => ({ ...pl, playStyles: pl.playStyles.filter((s) => s !== name) })));
  }
  const [formation, setFormation] = useState("4-3-3");
  const [customFormations, setCustomFormations] = useState(() => loadObj("custom-formations-v1", {}));
  const [editingFormation, setEditingFormation] = useState(false);
  const [draftSlots, setDraftSlots] = useState(null);
  const [saveFormationName, setSaveFormationName] = useState("");
  const [showSaveFormation, setShowSaveFormation] = useState(false);
  const pitchRef = useRef(null);
  const [starting, setStarting] = useState({});
  const [subs, setSubs] = useState(Array(7).fill(null));
  const [tab, setTab] = useState("pitch");
  const [pickerCtx, setPickerCtx] = useState(null);
  const [viewPlayer, setViewPlayer] = useState(null);
  const [editPlayer, setEditPlayer] = useState(null);

  function getSlotsFor(key) {
    return FORMATIONS[key] || customFormations[key] || FORMATIONS["4-3-3"];
  }
  function startEditFormation() {
    setDraftSlots(getSlotsFor(formation).map((s) => ({ ...s })));
    setSaveFormationName(FORMATIONS[formation] ? "" : formation);
    setEditingFormation(true);
  }
  function cancelEditFormation() {
    setEditingFormation(false);
    setDraftSlots(null);
  }
  function dragSlot(slotId, x, y) {
    setDraftSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, x, y } : s)));
  }
  function changeSlotPos(slotId, pos) {
    setDraftSlots((prev) => prev.map((s) => (s.id === slotId ? { ...s, pos } : s)));
  }
  function confirmSaveFormation() {
    const name = saveFormationName.trim();
    if (!name) return;
    const next = { ...customFormations, [name]: draftSlots };
    setCustomFormations(next);
    saveObj("custom-formations-v1", next);
    setFormation(name);
    setEditingFormation(false);
    setDraftSlots(null);
    setShowSaveFormation(false);
    setSaveFormationName("");
  }
  function deleteCustomFormation(name) {
    const next = { ...customFormations };
    delete next[name];
    setCustomFormations(next);
    saveObj("custom-formations-v1", next);
    if (formation === name) setFormation("4-3-3");
  }

  const [managers, setManagers] = useState([]);
  const [teamStyleList, setTeamStyleList] = useState(() => loadList("team-styles-list-v1", DEFAULT_TEAM_STYLES));
  const [viewManager, setViewManager] = useState(null);
  const [editManager, setEditManager] = useState(null);

  function addTeamStyle(name) {
    setTeamStyleList((prev) => { const next = [...prev, name]; saveList("team-styles-list-v1", next); return next; });
  }
  function removeTeamStyle(name) {
    setTeamStyleList((prev) => { const next = prev.filter((s) => s !== name); saveList("team-styles-list-v1", next); return next; });
    setManagers((prev) => prev.map((mg) => ({ ...mg, teamStyles: mg.teamStyles.filter((s) => s !== name) })));
  }
  function saveManager(m) {
    setManagers((prev) => (prev.some((x) => x.id === m.id) ? prev.map((x) => (x.id === m.id ? m : x)) : [...prev, m]));
    setEditManager(null);
    setViewManager((v) => (v && v.id === m.id ? m : v));
  }
  function deleteManager(id) {
    setManagers((prev) => prev.filter((m) => m.id !== id));
    setViewManager(null);
  }

  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      const saved = loadState();
      if (saved) {
        setPlayers((saved.players || SAMPLE_PLAYERS).map(normalizePlayer));
        setFormation(saved.formation || "4-3-3");
        setStarting(saved.starting || {});
        setSubs(saved.subs || Array(7).fill(null));
        setManagers(saved.managers || []);
      } else {
        const dataset = await loadDatasetPlayers();
        if (dataset) setPlayers(dataset.map(normalizePlayer));
      }
      loaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    saveState({ players, formation, starting, subs, managers });
  }, [players, formation, starting, subs, managers]);

  const byId = (id) => players.find((p) => p.id === id);
  const usedIds = new Set([...Object.values(starting), ...subs].filter(Boolean));
  const reserves = players.filter((p) => !usedIds.has(p.id));
  const slots = getSlotsFor(formation);
  const filledStarters = slots.map((s) => starting[s.id]).filter(Boolean).map(byId).filter(Boolean);
  const squadOvr = filledStarters.length ? (filledStarters.reduce((a, p) => a + Number(p.ovr), 0) / filledStarters.length).toFixed(2) : "—";

  function removePlayerFromAllSlots(id) {
    setStarting((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => { if (next[k] === id) delete next[k]; });
      return next;
    });
    setSubs((prev) => prev.map((x) => (x === id ? null : x)));
  }

  function assign(id) {
    removePlayerFromAllSlots(id);
    if (pickerCtx.type === "start") {
      setStarting((prev) => ({ ...prev, [pickerCtx.slotId]: id }));
    } else {
      setSubs((prev) => prev.map((x, i) => (i === pickerCtx.index ? id : x)));
    }
    setPickerCtx(null);
  }

  function clearSlot() {
    if (pickerCtx.type === "start") {
      setStarting((prev) => { const n = { ...prev }; delete n[pickerCtx.slotId]; return n; });
    } else {
      setSubs((prev) => prev.map((x, i) => (i === pickerCtx.index ? null : x)));
    }
    setPickerCtx(null);
  }

  function saveNewOrEdited(p) {
    setPlayers((prev) => (prev.some((x) => x.id === p.id) ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p]));
    setEditPlayer(null);
    setViewPlayer((v) => (v && v.id === p.id ? p : v));
  }

  function deletePlayer(id) {
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    removePlayerFromAllSlots(id);
    setViewPlayer(null);
  }

  const pickerCurrent = pickerCtx
    ? pickerCtx.type === "start" ? starting[pickerCtx.slotId] : subs[pickerCtx.index]
    : null;

  return (
    <div className="min-h-screen font-body" style={{ background: "#0B1210" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Teko:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        .font-display{font-family:'Teko',sans-serif; letter-spacing:0.02em;}
        .font-body{font-family:'Inter',sans-serif;}
      `}</style>

      {/* header */}
      <div className="px-5 pt-6 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/pitchlink-icon.png" alt="PitchLink" className="rounded-xl" style={{ width: 40, height: 40 }} />
          <div>
            <h1 className="font-display font-bold text-3xl leading-none tracking-wide" style={{ color: "#F1F7F3" }}>PITCH<span style={{ color: "#9BE83A" }}>LINK</span></h1>
            <p className="text-xs mt-0.5" style={{ color: "#5C6E64" }}>{players.length} players · {managers.length} staff</p>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display font-bold text-2xl" style={{ color: ovrTier(squadOvr === "—" ? 0 : Number(squadOvr)) }}>{squadOvr}</div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: "#5C6E64" }}>Squad OVR</div>
        </div>
      </div>

      {/* tabs */}
      <div className="px-5 flex gap-2 mb-4 flex-wrap">
        {[["pitch", "Starting XI"], ["bench", "Bench"], ["roster", "Roster"], ["staff", "Staff"], ["tournaments", "Tournaments"]].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="px-4 py-1.5 rounded-full text-sm font-medium"
            style={{ background: tab === k ? "#9BE83A" : "#151F1A", color: tab === k ? "#0F2308" : "#8FA096" }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* PITCH TAB */}
      {tab === "pitch" && (
        <div className="px-5 pb-24">
          {!editingFormation ? (
            <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
              <div className="flex gap-1.5 flex-wrap">
                {Object.keys(FORMATIONS).map((f) => (
                  <Chip key={f} label={f} small active={formation === f} onClick={() => setFormation(f)} />
                ))}
                {Object.keys(customFormations).map((f) => (
                  <span key={f} className="flex items-center gap-1 rounded-full pl-3 pr-1.5 py-1 text-xs" style={{ background: formation === f ? "rgba(155,232,58,0.15)" : "transparent", border: `1px solid ${formation === f ? "#9BE83A" : "#2B3A32"}`, color: formation === f ? "#C7FF6E" : "#8FA096" }}>
                    <button onClick={() => setFormation(f)}>{f}</button>
                    <button onClick={() => deleteCustomFormation(f)} style={{ color: "#FF8484" }}><X size={11} /></button>
                  </span>
                ))}
              </div>
              <button onClick={startEditFormation} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: "#17231D", color: "#9BE83A", border: "1px solid #26382E" }}>
                Custom Formation
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-3 gap-2">
              <span className="text-xs" style={{ color: "#5C6E64" }}>Drag positions on the pitch, change the label under each dot</span>
            </div>
          )}

          <div
            ref={pitchRef}
            className="relative w-full rounded-2xl overflow-hidden"
            style={{
              aspectRatio: "2 / 3",
              background: "repeating-linear-gradient(180deg, #14261C 0px, #14261C 40px, #122318 40px, #122318 80px)",
              border: "1px solid #223028",
            }}
          >
            <div className="absolute left-1/2 top-1/2 rounded-full" style={{ width: "34%", aspectRatio: "1/1", border: "1.5px solid rgba(255,255,255,0.15)", transform: "translate(-50%,-50%)" }} />
            <div className="absolute left-1/2 top-0 w-full" style={{ borderTop: "1.5px solid rgba(255,255,255,0.15)", transform: "translateX(-50%)" }} />
            <div className="absolute left-1/2" style={{ top: "50%", width: "100%", borderTop: "1.5px solid rgba(255,255,255,0.15)", transform: "translate(-50%,-50%)" }} />
            {editingFormation
              ? draftSlots.map((s) => (
                  <EditablePitchTile key={s.id} slot={s} onDrag={dragSlot} onPosChange={changeSlotPos} pitchRef={pitchRef} />
                ))
              : slots.map((s) => (
                  <PitchTile key={s.id} slot={s} player={byId(starting[s.id])} onClick={() => setPickerCtx({ type: "start", slotId: s.id })} />
                ))}
          </div>

          {editingFormation && (
            <div className="flex gap-2 mt-3">
              <button onClick={cancelEditFormation} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "#151F1A", color: "#8FA096", border: "1px solid #223028" }}>
                Cancel
              </button>
              <button onClick={() => setShowSaveFormation(true)} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "#9BE83A", color: "#0F2308" }}>
                Save Formation
              </button>
            </div>
          )}

          {showSaveFormation && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: "rgba(5,9,8,0.8)" }}>
              <div className="w-full max-w-sm rounded-2xl p-4" style={{ background: "#101815", border: "1px solid #223028" }}>
                <label className="text-xs uppercase tracking-widest" style={{ color: "#5C6E64" }}>Formation Name</label>
                <input
                  value={saveFormationName}
                  onChange={(e) => setSaveFormationName(e.target.value)}
                  placeholder="e.g. My 4-1-4-1"
                  className="w-full mt-1 rounded-lg px-3 py-2 text-[15px] outline-none"
                  style={{ background: "#0B1210", border: "1px solid #223028", color: "#F1F7F3" }}
                />
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setShowSaveFormation(false)} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "#151F1A", color: "#8FA096", border: "1px solid #223028" }}>
                    Cancel
                  </button>
                  <button onClick={confirmSaveFormation} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: "#9BE83A", color: "#0F2308" }}>
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BENCH TAB */}
      {tab === "bench" && (
        <div className="px-5 pb-24">
          <h3 className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5C6E64" }}>Substitutes</h3>
          <div className="grid grid-cols-1 gap-2 mb-6">
            {subs.map((id, i) => {
              const p = byId(id);
              return (
                <button
                  key={i}
                  onClick={() => setPickerCtx({ type: "sub", index: i })}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg"
                  style={{ background: "#151F1A", border: "1px solid #223028" }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs w-5" style={{ color: "#5C6E64" }}>{i + 1}</span>
                    {p ? (
                      <div className="text-left">
                        <div className="text-[14px]" style={{ color: "#F1F7F3" }}>{p.name}</div>
                        <div className="text-[10px] uppercase tracking-wide" style={{ color: "#5C6E64" }}>{p.position}</div>
                      </div>
                    ) : (
                      <span className="text-sm" style={{ color: "#5C6E64" }}>Empty slot</span>
                    )}
                  </div>
                  {p && <span className="font-display font-bold px-2 py-0.5 rounded" style={{ background: ovrTier(p.ovr), color: "#0B1210" }}>{Math.round(p.ovr)}</span>}
                </button>
              );
            })}
          </div>

          <h3 className="text-xs uppercase tracking-widest mb-2" style={{ color: "#5C6E64" }}>Reserves</h3>
          <div className="space-y-1.5">
            {reserves.length === 0 && <p className="text-sm" style={{ color: "#5C6E64" }}>No reserves — everyone's on the sheet.</p>}
            {reserves.map((p) => (
              <button key={p.id} onClick={() => setViewPlayer(p)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#101815", border: "1px solid #1D2A23" }}>
                <div className="text-left">
                  <div className="text-[14px]" style={{ color: "#CBD9D0" }}>{p.name}</div>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: "#5C6E64" }}>{p.position}</div>
                </div>
                <span className="font-display font-bold px-2 py-0.5 rounded" style={{ background: ovrTier(p.ovr), color: "#0B1210" }}>{Math.round(p.ovr)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ROSTER TAB */}
      {tab === "roster" && (
        <div className="px-5 pb-24">
          <button
            onClick={() => setEditPlayer(emptyPlayer())}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg mb-4 text-sm font-medium"
            style={{ background: "#9BE83A", color: "#0F2308" }}
          >
            <Plus size={16} /> Add Player
          </button>
          <div className="space-y-1.5">
            {players.map((p) => (
              <button key={p.id} onClick={() => setViewPlayer(p)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#151F1A", border: "1px solid #223028" }}>
                <div className="text-left">
                  <div className="text-[14px]" style={{ color: "#F1F7F3" }}>{p.name || "Unnamed Player"}</div>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: "#5C6E64" }}>{p.position}</div>
                </div>
                <span className="font-display font-bold px-2 py-0.5 rounded" style={{ background: ovrTier(p.ovr), color: "#0B1210" }}>{p.ovr}</span>
              </button>
            ))}
            {players.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#5C6E64" }}>No players yet. Add your first one above.</p>}
          </div>
        </div>
      )}

      {/* STAFF TAB */}
      {tab === "staff" && (
        <div className="px-5 pb-24">
          <button
            onClick={() => setEditManager(emptyManager())}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg mb-4 text-sm font-medium"
            style={{ background: "#9BE83A", color: "#0F2308" }}
          >
            <Plus size={16} /> Add Manager
          </button>
          <div className="space-y-1.5">
            {managers.map((m) => (
              <button key={m.id} onClick={() => setViewManager(m)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: "#151F1A", border: "1px solid #223028" }}>
                <div className="text-left">
                  <div className="text-[14px]" style={{ color: "#F1F7F3" }}>{m.name || "Unnamed Manager"}</div>
                  <div className="text-[10px] uppercase tracking-wide" style={{ color: "#5C6E64" }}>
                    {m.teamStyles.length ? m.teamStyles.join(" · ") : "No playstyle set"}
                  </div>
                </div>
              </button>
            ))}
            {managers.length === 0 && <p className="text-sm text-center py-8" style={{ color: "#5C6E64" }}>No managers yet. Add your first one above.</p>}
          </div>
        </div>
      )}

      {/* TOURNAMENTS TAB */}
      {tab === "tournaments" && (
        <div className="px-5 pb-24">
          <TournamentRoom />
        </div>
      )}

      {pickerCtx && (
        <Picker
          roster={players}
          hasCurrent={!!pickerCurrent}
          onPick={assign}
          onClear={clearSlot}
          onClose={() => setPickerCtx(null)}
        />
      )}
      {viewPlayer && (
        <PlayerCard
          player={viewPlayer}
          onClose={() => setViewPlayer(null)}
          onEdit={(p) => { setEditPlayer(p); setViewPlayer(null); }}
          onDelete={deletePlayer}
        />
      )}
      {editPlayer && (
        <PlayerEditor
          initial={editPlayer}
          skillsList={skillsList}
          styleList={styleList}
          additionalSkillsList={additionalSkillsList}
          onAddSkill={addSkill}
          onRemoveSkill={removeSkill}
          onAddStyle={addStyle}
          onRemoveStyle={removeStyle}
          onAddAdditionalSkill={addAdditionalSkill}
          onRemoveAdditionalSkill={removeAdditionalSkill}
          onSave={saveNewOrEdited}
          onCancel={() => setEditPlayer(null)}
        />
      )}
      {viewManager && (
        <ManagerCard
          manager={viewManager}
          onClose={() => setViewManager(null)}
          onEdit={(m) => { setEditManager(m); setViewManager(null); }}
          onDelete={deleteManager}
        />
      )}
      {editManager && (
        <ManagerEditor
          initial={editManager}
          teamStyleList={teamStyleList}
          onAddStyle={addTeamStyle}
          onRemoveStyle={removeTeamStyle}
          onSave={saveManager}
          onCancel={() => setEditManager(null)}
        />
      )}
    </div>
  );
}
