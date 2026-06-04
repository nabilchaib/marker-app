import React, { useState, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { initialStats, endGame } from "../redux/games-reducer";
import { pushStatsToFirebase } from "../firebase/api";
import { trackGameFinished } from "../analytics";

/* ── helpers ── */
const getPts = (s) => s ? (s.threes || 0) * 3 + (s.twos || 0) * 2 + (s.freeThrows || 0) : 0;
const getReb = (s) => s ? (s.offensiveRebounds || 0) + (s.defensiveRebounds || 0) : 0;
const getAst = (s) => s?.assists || 0;
const getFouls = (s) => s?.fouls || 0;
const getFgm = (s) => s ? (s.threes || 0) + (s.twos || 0) : 0;
const getFga = (s) => s ? (s.threes || 0) + (s.twos || 0) + (s.attemptedThrees || 0) + (s.attemptedTwos || 0) : 0;
const getFgPct = (s) => { const a = getFga(s); return a > 0 ? Math.round((getFgm(s) / a) * 100) : 0; };
const getTpm = (s) => s?.threes || 0;
const getTpa = (s) => s ? (s.threes || 0) + (s.attemptedThrees || 0) : 0;
const getTpPct = (s) => { const a = getTpa(s); return a > 0 ? Math.round((getTpm(s) / a) * 100) : 0; };
const getFtm = (s) => s?.freeThrows || 0;
const getFta = (s) => s ? (s.freeThrows || 0) + (s.attemptedFreeThrows || 0) : 0;
const getFtPct = (s) => { const a = getFta(s); return a > 0 ? Math.round((getFtm(s) / a) * 100) : 0; };

/* ── Confetti ── */
function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2.8,
        dur: 2.2 + Math.random() * 2.4,
        color: ["#f64e07", "#0aa6d6", "#fbbf24", "#fff", "#4ade80", "#e879f9"][Math.floor(Math.random() * 6)],
        w: 5 + Math.random() * 7,
        h: Math.random() > 0.5 ? 5 + Math.random() * 7 : 3 + Math.random() * 4,
        round: Math.random() > 0.4,
      })),
    []
  );
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 9998 }}>
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: -20,
            left: `${p.left}%`,
            width: p.w,
            height: p.h,
            background: p.color,
            borderRadius: p.round ? "50%" : "2px",
            animation: `ht-confetti-fall ${p.dur}s ${p.delay}s ease-in both`,
          }}
        />
      ))}
    </div>
  );
}

/* ── Shooting bar ── */
function ShootBar({ label, made, att, pct, color }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: "0.72rem", color: "var(--ht-muted)", letterSpacing: "0.08em", fontWeight: 700, fontFamily: "var(--ff-body)" }}>
          {label}
        </span>
        <span style={{ fontSize: "0.72rem", color: "var(--ht-text)", fontWeight: 700, fontFamily: "var(--ff-body)" }}>
          {made}/{att} <span style={{ color, marginLeft: 4 }}>{pct}%</span>
        </span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color, borderRadius: 3,
          transition: "width 0.8s ease", boxShadow: `0 0 8px ${color}60`,
        }} />
      </div>
    </div>
  );
}

/* ── Player Profile Modal ── */
function PlayerProfileModal({ player, stats, teamColor, teamName, onClose }) {
  const s = stats || {};
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(12px)",
        display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 600,
        animation: "ht-fade-in 0.15s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--ht-card)", borderRadius: "20px 20px 0 0",
          padding: "20px 20px 36px", animation: "ht-slide-in 0.2s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 52, height: 52, borderRadius: "50%", background: teamColor + "22",
            border: `2px solid ${teamColor}`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--ff-display)", fontSize: "0.9rem", color: teamColor, flexShrink: 0,
          }}>
            #{player.number}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "1.2rem", fontWeight: 800, fontFamily: "var(--ff-body)" }}>{player.name}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--ht-muted)", marginTop: 1, fontFamily: "var(--ff-body)" }}>{teamName}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,.08)",
              border: "none", color: "var(--ht-muted)", cursor: "pointer", fontSize: "1rem",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >×</button>
        </div>

        {/* Big stat line */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
          {[
            { l: "PTS", v: getPts(s), c: "var(--ht-orange)" },
            { l: "REB", v: getReb(s), c: "var(--ht-cyan)" },
            { l: "AST", v: getAst(s), c: "var(--ht-green)" },
            { l: "PF", v: getFouls(s), c: "var(--ht-gold)" },
          ].map(({ l, v, c }) => (
            <div key={l} style={{ background: "var(--ht-card2)", borderRadius: 10, padding: "10px 6px", textAlign: "center" }}>
              <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.5rem", color: c, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: "0.58rem", color: "var(--ht-muted)", letterSpacing: "0.1em", marginTop: 3, fontFamily: "var(--ff-body)" }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Shooting */}
        <div style={{ fontSize: "0.62rem", color: "var(--ht-muted)", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10, fontFamily: "var(--ff-body)" }}>
          SHOOTING EFFICIENCY
        </div>
        <ShootBar label="FG (2PT)" made={getFgm(s) - getTpm(s)} att={getFga(s) - getTpa(s)} pct={getFga(s) - getTpa(s) > 0 ? Math.round(((getFgm(s) - getTpm(s)) / (getFga(s) - getTpa(s))) * 100) : 0} color="var(--ht-orange)" />
        <ShootBar label="3-POINTER" made={getTpm(s)} att={getTpa(s)} pct={getTpPct(s)} color="var(--ht-gold)" />
        <ShootBar label="FREE THROW" made={getFtm(s)} att={getFta(s)} pct={getFtPct(s)} color="var(--ht-cyan)" />
        {getFga(s) === 0 && getFta(s) === 0 && (
          <div style={{ fontSize: "0.78rem", color: "var(--ht-dim)", textAlign: "center", padding: "8px 0", fontFamily: "var(--ff-body)" }}>
            No shooting data yet
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
const GameResults = ({ game, onBackClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const teams = useSelector((state) => state.teams);
  const players = useSelector((state) => state.players);
  const isDrill = game.type === "drill";

  const teamA = teams.byId[game.teamAId];
  const teamB = teams.byId[game.teamBId];

  const [statsTeam, setStatsTeam] = useState("teamA");
  const [profilePlayer, setProfilePlayer] = useState(null);
  const [copied, setCopied] = useState(false);
  const [shareToast, setShareToast] = useState("");
  const [endingGame, setEndingGame] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const shareCardRef = useRef(null);

  /* ── MVP ── */
  const mvp = useMemo(() => {
    if (isDrill) return null;
    const allPlayerIds = [
      ...(teamA?.players || []),
      ...(teamB?.players || []),
    ];
    let best = null, bestPts = -1;
    allPlayerIds.forEach((pid) => {
      const teamId = teamA?.players?.includes(pid) ? teamA.id : teamB?.id;
      const s = game.stats?.[teamId]?.[pid];
      const pts = getPts(s);
      if (pts > bestPts) { bestPts = pts; best = { player: players.byId[pid], stats: s, teamId }; }
    });
    return best?.player ? best : null;
  }, [isDrill, teamA, teamB, game.stats, players.byId]);

  const winner = useMemo(() => {
    if (isDrill) return null;
    const diff = game.teamAScore - game.teamBScore;
    if (diff > 0) return teamA;
    if (diff < 0) return teamB;
    return null;
  }, [isDrill, game.teamAScore, game.teamBScore, teamA, teamB]);

  const toast_ = (msg) => { setShareToast(msg); setTimeout(() => setShareToast(""), 2400); };

  const handleShare = async (platform) => {
    const mvpLine = mvp ? ` | MVP: ${mvp.player.name} (${getPts(mvp.stats)}pts)` : "";
    const text = isDrill
      ? `🎯 Drill complete! #HoopTrackr`
      : `${teamA?.name} ${game.teamAScore} – ${game.teamBScore} ${teamB?.name}${mvpLine}  🏀 #HoopTrackr`;

    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    else if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
    else if (platform === "copy") {
      navigator.clipboard?.writeText("https://hooptrackr.app").catch(() => {});
      setCopied(true); setTimeout(() => setCopied(false), 2200);
      toast_("Link copied!");
    }
  };

  const handleEndGame = async () => {
    setEndingGame(true);
    try {
      await pushStatsToFirebase(game, teamA, teamB);
      trackGameFinished(game.type || "pick-up");
      dispatch(endGame(game.id));
      navigate("/games");
    } catch (err) {
      console.error("Error ending game:", err);
      toast.error("Failed to save game stats. Please try again.");
    } finally {
      setEndingGame(false);
    }
  };

  /* ── DRILL results ── */
  if (isDrill) {
    const drillStats = game.stats || {};
    const drillPlayerIds = game.playerIds || (game.playerId ? [game.playerId] : []);
    const drillPlayers = drillPlayerIds.map((id) => {
      const p = players.byId[id];
      const s = drillStats[id] || { attempts: 0, completions: 0 };
      return { ...p, ...s, pct: s.attempts > 0 ? Math.round((s.completions / s.attempts) * 100) : 0 };
    }).filter((p) => p?.id);
    const bestPlayer = drillPlayers.length ? drillPlayers.reduce((b, p) => (p.pct > b.pct ? p : b), drillPlayers[0]) : null;

    return (
      <div style={{ background: "var(--ht-bg1)", minHeight: "100vh", color: "var(--ht-text)", fontFamily: "var(--ff-body)", position: "relative" }}>
        <Confetti />
        {/* Header */}
        <div style={{
          background: "linear-gradient(160deg, #0a1115, #162028)",
          padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,.06)",
          textAlign: "center", position: "relative", zIndex: 1,
        }}>
          <div style={{ fontSize: "0.65rem", color: "var(--ht-muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 7 }}>
            Drill Complete
          </div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.1rem", color: "var(--ht-cyan)", marginBottom: 4, animation: "ht-win-reveal 0.6s ease both" }}>
            🎯 {game.name || "Drill Session"}
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--ht-muted)" }}>
            {drillPlayers.reduce((t, p) => t + p.attempts, 0)} total attempts · {drillPlayers.reduce((t, p) => t + p.completions, 0)} completions
          </div>
        </div>

        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          {/* Rings */}
          {drillPlayers.length > 0 && (
            <div style={{ background: "var(--ht-card)", borderRadius: "var(--ht-r)", padding: "18px", animation: "ht-slide-up 0.4s 0.1s ease both" }}>
              <div style={{ fontSize: "0.65rem", color: "var(--ht-muted)", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 16, textAlign: "center" }}>SUCCESS RATE</div>
              <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" }}>
                {drillPlayers.map((p) => {
                  const ringColor = p.pct >= 60 ? "var(--ht-cyan)" : p.pct >= 40 ? "var(--ht-gold)" : "#ef4444";
                  const r = 44; const stroke = 9; const circ = 2 * Math.PI * r; const offset = circ * (1 - p.pct / 100);
                  return (
                    <div key={p.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                      <div style={{ position: "relative", width: 90, height: 90 }}>
                        <svg width={90} height={90} viewBox="0 0 90 90">
                          <circle cx={45} cy={45} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
                          <circle cx={45} cy={45} r={r} fill="none" stroke={ringColor} strokeWidth={stroke}
                            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                            transform="rotate(-90 45 45)" style={{ transition: "stroke-dashoffset 1s ease" }} />
                        </svg>
                        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1rem", color: "var(--ht-text)", lineHeight: 1 }}>{p.pct}%</div>
                          <div style={{ fontSize: "0.55rem", color: "var(--ht-muted)" }}>{p.completions}/{p.attempts}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "0.8rem", fontWeight: 700, color: bestPlayer?.id === p.id ? "var(--ht-cyan)" : "var(--ht-text)" }}>
                          {p.name} {bestPlayer?.id === p.id ? "🏅" : ""}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table */}
          <div style={{ background: "var(--ht-card)", borderRadius: "var(--ht-r)", overflow: "hidden", animation: "ht-slide-up 0.4s 0.3s ease both" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 4, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              {["PLAYER", "ATT", "MADE", "%", "BEST🔥"].map((h) => (
                <div key={h} style={{ fontSize: "0.6rem", color: "var(--ht-muted)", fontWeight: 700, letterSpacing: "0.08em", textAlign: h === "PLAYER" ? "left" : "center" }}>{h}</div>
              ))}
            </div>
            {drillPlayers.map((p, i) => (
              <div key={p.id} style={{
                display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 4, padding: "10px 12px",
                borderBottom: i < drillPlayers.length - 1 ? "1px solid rgba(255,255,255,.03)" : "none",
                background: bestPlayer?.id === p.id ? "rgba(10,166,214,.04)" : "transparent",
              }}>
                <div style={{ fontSize: "0.83rem", fontWeight: bestPlayer?.id === p.id ? 700 : 400, color: bestPlayer?.id === p.id ? "var(--ht-cyan)" : "var(--ht-text)" }}>
                  {p.name}
                </div>
                {[p.attempts, p.completions, `${p.pct}%`, p.best || 0].map((v, j) => (
                  <div key={j} style={{ textAlign: "center", fontFamily: "var(--ff-display)", fontSize: "0.78rem", color: j === 2 ? (p.pct >= 60 ? "var(--ht-cyan)" : p.pct >= 40 ? "var(--ht-gold)" : "var(--ht-miss)") : "var(--ht-text)" }}>
                    {v}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={onBackClick} className="ht-btn-ghost" style={{ flex: 1, padding: 13, fontSize: "0.83rem" }}>
              ← Back
            </button>
            <button
              onClick={() => setShowEndConfirm(true)}
              disabled={endingGame}
              style={{
                flex: 2, padding: 13, background: "var(--ht-cyan)", border: "none", borderRadius: "var(--ht-rs)",
                color: "#fff", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
                fontFamily: "var(--ff-body)", boxShadow: "0 4px 18px rgba(10,166,214,.38)",
              }}
            >
              {endingGame ? "Saving..." : "Save & Exit"}
            </button>
          </div>
        </div>

        {showEndConfirm && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 700 }}>
            <div style={{ background: "var(--ht-card)", borderRadius: 18, padding: "24px", width: "100%", maxWidth: 340, textAlign: "center", border: "1px solid rgba(255,255,255,.07)" }}>
              <div style={{ fontFamily: "var(--ff-display)", fontSize: "1rem", marginBottom: 8 }}>Save drill stats?</div>
              <div style={{ color: "var(--ht-muted)", fontSize: "0.82rem", marginBottom: 20, fontFamily: "var(--ff-body)" }}>This will save to Firebase and end the drill.</div>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => setShowEndConfirm(false)} className="ht-btn-ghost" style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}>Cancel</button>
                <button onClick={handleEndGame} style={{ flex: 1, padding: "10px", background: "var(--ht-cyan)", border: "none", borderRadius: 8, color: "#fff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ── PICK-UP results ── */
  const shownTeam = statsTeam === "teamA" ? teamA : teamB;
  const shownTeamId = statsTeam === "teamA" ? teamA?.id : teamB?.id;
  const shownPlayers = (shownTeam?.players || []).map((id) => players.byId[id]).filter(Boolean);

  const getTeamOfPlayer = (p) => {
    if (teamA?.players?.includes(p.id)) return { team: teamA, color: "var(--ht-orange)" };
    return { team: teamB, color: "var(--ht-cyan)" };
  };

  return (
    <div style={{ background: "var(--ht-bg1)", minHeight: "100vh", color: "var(--ht-text)", fontFamily: "var(--ff-body)", position: "relative" }}>
      <Confetti />

      {/* Winner header */}
      <div style={{
        background: "linear-gradient(160deg, #0a1115 0%, #162028 100%)",
        padding: "18px 20px 14px", borderBottom: "1px solid rgba(255,255,255,.06)",
        position: "relative", zIndex: 1, textAlign: "center",
      }}>
        <div style={{ fontSize: "0.65rem", color: "var(--ht-muted)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 7 }}>Final Score</div>
        {winner ? (
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.1rem", color: "var(--ht-gold)", marginBottom: 10, animation: "ht-win-reveal 0.6s ease both", letterSpacing: "0.06em" }}>
            🏆 {winner.name.toUpperCase()} WIN!
          </div>
        ) : (
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "0.95rem", color: "var(--ht-muted)", marginBottom: 10 }}>TIE GAME</div>
        )}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--ht-orange)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>{teamA?.name}</div>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: "3.6rem", fontWeight: 800, lineHeight: 1, color: winner?.id === teamA?.id ? "var(--ht-orange)" : "rgba(255,255,255,.45)", animation: "ht-win-reveal 0.7s 0.1s ease both" }}>
              {game.teamAScore}
            </div>
          </div>
          <div style={{ color: "var(--ht-dim)", fontFamily: "var(--ff-display)", fontSize: "1.3rem", marginTop: 20 }}>–</div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "0.68rem", color: "var(--ht-cyan)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4, fontWeight: 700 }}>{teamB?.name}</div>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: "3.6rem", fontWeight: 800, lineHeight: 1, color: winner?.id === teamB?.id ? "var(--ht-cyan)" : "rgba(255,255,255,.45)", animation: "ht-win-reveal 0.7s 0.18s ease both" }}>
              {game.teamBScore}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "14px 16px 24px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
        {/* MVP */}
        {mvp && (
          <div style={{
            background: "linear-gradient(135deg, var(--ht-card) 0%, rgba(251,191,36,.07) 100%)",
            border: "1px solid rgba(251,191,36,.22)", borderRadius: "var(--ht-r)",
            padding: "14px 16px", display: "flex", alignItems: "center", gap: 14,
            animation: "ht-slide-up 0.5s 0.25s ease both", position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: 0, left: 0, width: "40%", height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(251,191,36,.05), transparent)",
              animation: "ht-shimmer 3s ease-in-out infinite",
            }} />
            <div style={{
              width: 50, height: 50, borderRadius: "50%", background: "rgba(251,191,36,.12)",
              border: "2px solid rgba(251,191,36,.4)", display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--ff-display)", fontSize: "0.85rem", color: "var(--ht-gold)", flexShrink: 0,
            }}>
              #{mvp.player.number}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "0.62rem", color: "var(--ht-gold)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>🏅 MVP</div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: 5 }}>{mvp.player.name}</div>
              <div style={{ display: "flex", gap: 14 }}>
                {[{ l: "PTS", v: getPts(mvp.stats) }, { l: "REB", v: getReb(mvp.stats) }, { l: "AST", v: getAst(mvp.stats) }].map(({ l, v }) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.15rem", color: "var(--ht-gold)", lineHeight: 1 }}>{v}</div>
                    <div style={{ fontSize: "0.6rem", color: "var(--ht-muted)", letterSpacing: "0.08em", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stats table */}
        <div style={{ background: "var(--ht-card)", borderRadius: "var(--ht-r)", overflow: "hidden", animation: "ht-slide-up 0.5s 0.35s ease both" }}>
          <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
            {["teamA", "teamB"].map((tk) => {
              const t = tk === "teamA" ? teamA : teamB;
              const on = statsTeam === tk;
              const c = tk === "teamA" ? "var(--ht-orange)" : "var(--ht-cyan)";
              return (
                <button key={tk} onClick={() => setStatsTeam(tk)} style={{
                  flex: 1, padding: "10px", border: "none",
                  background: on ? c + "14" : "transparent",
                  color: on ? c : "var(--ht-muted)",
                  fontSize: "0.83rem", fontWeight: 700, cursor: "pointer",
                  borderBottom: `2px solid ${on ? c : "transparent"}`,
                  transition: "all 0.15s", letterSpacing: "0.06em", fontFamily: "var(--ff-body)",
                }}>
                  {t?.name}
                </button>
              );
            })}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 4, padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,.04)" }}>
            {["PLAYER", "PTS", "REB", "AST", "PF"].map((h) => (
              <div key={h} style={{ fontSize: "0.6rem", color: "var(--ht-muted)", fontWeight: 700, letterSpacing: "0.1em", textAlign: h === "PLAYER" ? "left" : "center" }}>{h}</div>
            ))}
          </div>
          {shownPlayers.map((p, i) => {
            const s = game.stats?.[shownTeamId]?.[p.id] || { ...initialStats };
            const isMvp = mvp?.player?.id === p.id;
            const fg2m = getFgm(s) - getTpm(s);
            const fg2a = getFga(s) - getTpa(s);
            const fg2Pct = fg2a > 0 ? Math.round((fg2m / fg2a) * 100) : 0;
            const tpm = getTpm(s);
            const tpa = getTpa(s);
            const tpPct = getTpPct(s);
            const ftm = getFtm(s);
            const fta = getFta(s);
            const ftPct = getFtPct(s);
            const hasShots = fg2a > 0 || tpa > 0 || fta > 0;
            return (
              <div
                key={p.id}
                onClick={() => setProfilePlayer(p)}
                style={{
                  padding: "10px 12px",
                  borderBottom: i < shownPlayers.length - 1 ? "1px solid rgba(255,255,255,.03)" : "none",
                  background: isMvp ? "rgba(251,191,36,.035)" : "transparent",
                  cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = isMvp ? "rgba(251,191,36,.07)" : "rgba(255,255,255,.03)"}
                onMouseLeave={(e) => e.currentTarget.style.background = isMvp ? "rgba(251,191,36,.035)" : "transparent"}
              >
                <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <span style={{ fontSize: "0.7rem", color: "var(--ht-muted)", fontFamily: "var(--ff-display)", minWidth: 22 }}>#{p.number}</span>
                    <span style={{ fontSize: "0.83rem", fontWeight: isMvp ? 700 : 400, color: isMvp ? "var(--ht-gold)" : "var(--ht-text)" }}>
                      {p.name}{isMvp ? " 👑" : ""}
                    </span>
                    <span style={{ fontSize: "0.55rem", color: "var(--ht-dim)", marginLeft: "auto" }}>›</span>
                  </div>
                  {[getPts(s), getReb(s), getAst(s), getFouls(s)].map((v, j) => (
                    <div key={j} style={{ textAlign: "center", fontFamily: "var(--ff-display)", fontSize: "0.82rem", color: v > 0 ? "var(--ht-text)" : "var(--ht-dim)" }}>{v}</div>
                  ))}
                </div>
                {hasShots ? (
                  <div
                    style={{
                      display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
                      marginTop: 6, paddingLeft: 30,
                    }}
                  >
                    {[
                      { label: "2PT", made: fg2m, att: fg2a, pct: fg2Pct, color: "var(--ht-orange)" },
                      { label: "3PT", made: tpm, att: tpa, pct: tpPct, color: "var(--ht-gold)" },
                      { label: "FT", made: ftm, att: fta, pct: ftPct, color: "var(--ht-cyan)" },
                    ].map(({ label, made, att, pct, color }) => {
                      const miss = att - made;
                      const attempted = att > 0;
                      return (
                        <div
                          key={label}
                          style={{
                            display: "flex", flexDirection: "column", alignItems: "center",
                            background: "rgba(255,255,255,.025)",
                            borderLeft: `2px solid ${attempted ? color : "rgba(255,255,255,.06)"}`,
                            borderRadius: 4, padding: "4px 6px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.52rem", color: "var(--ht-muted)",
                              letterSpacing: "0.08em", fontWeight: 700,
                              marginBottom: 2, fontFamily: "var(--ff-body)",
                            }}
                          >
                            {label}
                          </div>
                          <div
                            style={{
                              fontSize: "0.72rem", color: attempted ? "var(--ht-text)" : "var(--ht-dim)",
                              fontFamily: "var(--ff-display)", lineHeight: 1.1,
                            }}
                          >
                            {made}/{att}
                          </div>
                          <div
                            style={{
                              fontSize: "0.56rem",
                              color: attempted ? color : "var(--ht-dim)",
                              fontWeight: 700, marginTop: 2, fontFamily: "var(--ff-body)",
                            }}
                          >
                            {attempted ? `${pct}%` : "—"}
                            {miss > 0 && (
                              <span style={{ color: "var(--ht-muted)", marginLeft: 4, fontWeight: 400 }}>
                                · {miss} miss
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: "0.58rem", color: "var(--ht-dim)",
                      marginTop: 4, paddingLeft: 30, fontFamily: "var(--ff-body)",
                    }}
                  >
                    No shooting attempts
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ padding: "6px 12px", borderTop: "1px solid rgba(255,255,255,.04)" }}>
            <div style={{ fontSize: "0.58rem", color: "var(--ht-dim)", letterSpacing: "0.06em" }}>Tap a player to see full stats →</div>
          </div>
        </div>

        {/* Social share */}
        <div style={{ background: "var(--ht-card)", borderRadius: "var(--ht-r)", padding: "16px", animation: "ht-slide-up 0.5s 0.45s ease both" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
            <div style={{ fontSize: "0.68rem", color: "var(--ht-muted)", letterSpacing: "0.14em", fontWeight: 700, whiteSpace: "nowrap" }}>Share the W</div>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
          </div>

          {/* Share card preview */}
          <div
            ref={shareCardRef}
            style={{
              background: "#0e191d", borderRadius: 12, overflow: "hidden",
              fontFamily: "Audiowide, sans-serif", border: "1px solid rgba(255,255,255,.06)",
            }}
          >
            <div style={{ height: 4, background: "linear-gradient(90deg, var(--ht-orange), var(--ht-cyan))" }} />
            <div style={{ padding: "14px 16px 0" }}>
              <div style={{ fontSize: "0.5rem", color: "#6b8899", letterSpacing: "0.14em", textAlign: "center", marginBottom: 10, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700 }}>
                GAME RECAP · HOOPTRACKR
              </div>
              {winner && (
                <div style={{ textAlign: "center", color: "#fbbf24", fontSize: "0.78rem", marginBottom: 10, letterSpacing: "0.06em" }}>
                  🏆 {winner.name.toUpperCase()} WIN!
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "0.55rem", color: "#f64e07", letterSpacing: "0.08em", marginBottom: 3, textTransform: "uppercase", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700 }}>{teamA?.name}</div>
                  <div style={{ fontSize: "2.6rem", color: winner?.id === teamA?.id ? "#f64e07" : "rgba(255,255,255,.45)", lineHeight: 1 }}>{game.teamAScore}</div>
                </div>
                <div style={{ color: "#2e4a57", fontSize: "1.4rem" }}>–</div>
                <div style={{ flex: 1, textAlign: "center" }}>
                  <div style={{ fontSize: "0.55rem", color: "#0aa6d6", letterSpacing: "0.08em", marginBottom: 3, textTransform: "uppercase", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700 }}>{teamB?.name}</div>
                  <div style={{ fontSize: "2.6rem", color: winner?.id === teamB?.id ? "#0aa6d6" : "rgba(255,255,255,.45)", lineHeight: 1 }}>{game.teamBScore}</div>
                </div>
              </div>
              {mvp && (
                <div style={{ background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.22)", borderRadius: 8, padding: "8px 10px", marginBottom: 10 }}>
                  <div style={{ fontSize: "0.48rem", color: "#fbbf24", letterSpacing: "0.14em", marginBottom: 3, fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700 }}>🏅 MVP</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: "0.82rem", fontWeight: 700, fontFamily: "Barlow Condensed, sans-serif", color: "#fff" }}>{mvp.player.name}</div>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[{ l: "PTS", v: getPts(mvp.stats) }, { l: "REB", v: getReb(mvp.stats) }, { l: "AST", v: getAst(mvp.stats) }].map(({ l, v }) => (
                        <div key={l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "0.82rem", color: "#fbbf24" }}>{v}</div>
                          <div style={{ fontSize: "0.44rem", color: "#6b8899", letterSpacing: "0.06em", fontFamily: "Barlow Condensed, sans-serif" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ background: "rgba(246,78,7,.08)", padding: "7px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.5rem", color: "#f64e07", letterSpacing: "0.1em", fontFamily: "Barlow Condensed, sans-serif", fontWeight: 700 }}>HOOPTRACKR.APP</span>
              <span style={{ fontSize: "0.5rem", color: "#6b8899", fontFamily: "Barlow Condensed, sans-serif" }}>Track your game 🏀</span>
            </div>
          </div>

          {/* Share buttons */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, margin: "12px 0 10px" }}>
            {[
              { icon: "𝕏", label: "Twitter", color: "#1DA1F2", p: "twitter" },
              { icon: "💬", label: "WhatsApp", color: "#25D366", p: "whatsapp" },
              { icon: copied ? "✅" : "🔗", label: copied ? "Copied!" : "Copy", color: "var(--ht-cyan)", p: "copy" },
            ].map(({ icon, label, color, p }) => (
              <button
                key={label}
                onClick={() => handleShare(p)}
                style={{
                  padding: "10px 4px", background: "var(--ht-card2)", border: "1px solid rgba(255,255,255,.06)",
                  borderRadius: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  transition: "transform 0.1s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                onMouseDown={(e) => e.currentTarget.style.transform = "scale(.95)"}
                onMouseUp={(e) => e.currentTarget.style.transform = "scale(1)"}
              >
                <div style={{ fontSize: "1.3rem" }}>{icon}</div>
                <div style={{ fontSize: "0.62rem", color, fontWeight: 700, letterSpacing: "0.04em", fontFamily: "var(--ff-body)" }}>{label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom actions */}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onBackClick} className="ht-btn-ghost" style={{ flex: 1, padding: 13, fontSize: "0.83rem" }}>
            ← Back
          </button>
          <button
            onClick={() => setShowEndConfirm(true)}
            disabled={endingGame}
            style={{
              flex: 2, padding: 13, background: "var(--ht-orange)", border: "none", borderRadius: "var(--ht-rs)",
              color: "#fff", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "var(--ff-body)", letterSpacing: "0.07em", boxShadow: "0 4px 18px rgba(246,78,7,.38)",
              opacity: endingGame ? 0.6 : 1,
            }}
          >
            {endingGame ? "Saving..." : "🏀 Save & Exit"}
          </button>
        </div>
      </div>

      {/* Player profile modal */}
      {profilePlayer && (() => {
        const { team: t, color: c } = getTeamOfPlayer(profilePlayer);
        const pid = profilePlayer.id;
        const tid = t?.id;
        return (
          <PlayerProfileModal
            player={profilePlayer}
            stats={game.stats?.[tid]?.[pid]}
            teamColor={c}
            teamName={t?.name}
            onClose={() => setProfilePlayer(null)}
          />
        );
      })()}

      {/* Share toast */}
      {shareToast && (
        <div style={{
          position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)",
          background: "rgba(255,255,255,.12)", backdropFilter: "blur(12px)",
          padding: "8px 18px", borderRadius: 50, fontSize: "0.8rem", fontWeight: 700,
          color: "#fff", whiteSpace: "nowrap", animation: "ht-slide-up 0.2s ease",
          border: "1px solid rgba(255,255,255,.1)", zIndex: 700, fontFamily: "var(--ff-body)",
        }}>
          {shareToast}
        </div>
      )}

      {/* End game confirmation */}
      {showEndConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 700 }}>
          <div style={{ background: "var(--ht-card)", borderRadius: 18, padding: "24px", width: "100%", maxWidth: 340, textAlign: "center", border: "1px solid rgba(255,255,255,.07)" }}>
            <div style={{ fontFamily: "var(--ff-display)", fontSize: "1rem", marginBottom: 8 }}>Save game stats?</div>
            <div style={{ color: "var(--ht-muted)", fontSize: "0.82rem", marginBottom: 20, fontFamily: "var(--ff-body)" }}>This will save to Firebase and end the game.</div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setShowEndConfirm(false)} className="ht-btn-ghost" style={{ flex: 1, padding: "10px", fontSize: "0.85rem" }}>Cancel</button>
              <button onClick={handleEndGame} style={{ flex: 1, padding: "10px", background: "var(--ht-orange)", border: "none", borderRadius: 8, color: "#fff", fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", fontFamily: "var(--ff-body)" }}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameResults;
