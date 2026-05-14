import React, { useState, useEffect, useMemo, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  addDrillAttempt,
  addDrillCompletion,
  updateLastActions,
  undoLastAction,
  endGame,
} from "../../redux/games-reducer";
import GameResult from "../../components/GameResults";

/* ── Progress ring (SVG) ── */
function ProgressRing({ pct = 0, size = 148, stroke = 13, color = "var(--ht-cyan)", label = "", sublabel = "" }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(pct), 60);
    return () => clearTimeout(t);
  }, [pct]);
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - anim / 100);
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(.4,0,.2,1)",
            filter: `drop-shadow(0 0 6px ${color === "var(--ht-cyan)" ? "#0aa6d6" : "#ef4444"}80)`,
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <div style={{ fontFamily: "var(--ff-display)", fontSize: size * 0.18, color: "var(--ht-text)", lineHeight: 1 }}>
          {pct}%
        </div>
        {label && (
          <div style={{ fontSize: size * 0.1, color: "var(--ht-muted)", fontWeight: 700, letterSpacing: "0.06em", fontFamily: "var(--ff-body)" }}>
            {label}
          </div>
        )}
        {sublabel && (
          <div style={{ fontSize: size * 0.085, color: "var(--ht-dim)", fontFamily: "var(--ff-body)" }}>
            {sublabel}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Mini ring ── */
function MiniRing({ pct = 0, size = 56, name, pts }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setAnim(pct), 80);
    return () => clearTimeout(t);
  }, [pct]);
  const stroke = 5;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - anim / 100);
  const color = pct >= 60 ? "var(--ht-cyan)" : "#ef4444";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth={stroke} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dashoffset 0.8s ease" }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--ff-display)",
            fontSize: size * 0.2,
            color: "var(--ht-text)",
          }}
        >
          {pct}%
        </div>
      </div>
      <div style={{ fontSize: "0.65rem", color: "var(--ht-text)", fontWeight: 700, textAlign: "center", fontFamily: "var(--ff-body)" }}>
        {name}
      </div>
      <div style={{ fontSize: "0.55rem", color: "var(--ht-muted)", fontFamily: "var(--ff-body)" }}>{pts}</div>
    </div>
  );
}

/* ── Float particles ── */
function FloatParticles({ items }) {
  return (
    <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 9999 }}>
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontFamily: "var(--ff-display)",
            fontWeight: 800,
            fontSize: "1.9rem",
            color: p.made ? "var(--ht-green)" : "#f87171",
            textShadow: p.made ? "0 0 16px rgba(74,222,128,.7)" : "0 0 12px rgba(239,68,68,.7)",
            animation: "ht-score-float 0.95s ease-out forwards",
            whiteSpace: "nowrap",
          }}
        >
          {p.made ? "✓" : "✕"}
        </div>
      ))}
    </div>
  );
}

/* ── Player bottom sheet ── */
function PlayerSheet({ players, selected, onSelect, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        zIndex: 200,
        animation: "ht-fade-in 0.15s ease",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--ht-card)",
          borderRadius: "20px 20px 0 0",
          padding: "20px 20px 32px",
          animation: "ht-slide-in 0.22s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "0.9rem", color: "var(--ht-cyan)", letterSpacing: "0.08em" }}>
            SELECT PLAYER
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
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {players.map((p) => {
            const on = selected?.id === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                style={{
                  padding: "14px 8px",
                  background: on ? "rgba(10,166,214,.25)" : "var(--ht-card2)",
                  border: `2px solid ${on ? "var(--ht-cyan)" : "rgba(255,255,255,.06)"}`,
                  borderRadius: 12, cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  transition: "all 0.1s",
                  boxShadow: on ? "0 0 14px rgba(10,166,214,.35)" : "none",
                }}
              >
                <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.25rem", color: on ? "var(--ht-cyan)" : "var(--ht-text)" }}>
                  #{p.number}
                </div>
                <div style={{ fontSize: "0.75rem", color: on ? "var(--ht-text)" : "var(--ht-muted)", fontWeight: 700, textAlign: "center", fontFamily: "var(--ff-body)" }}>
                  {p.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── End modal ── */
function EndModal({ onConfirm, onCancel }) {
  return (
    <div
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.82)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 24, zIndex: 300,
      }}
    >
      <div style={{
        background: "var(--ht-card)", borderRadius: 18, padding: "28px 24px", width: "100%", maxWidth: 360,
        textAlign: "center", animation: "ht-slide-up 0.2s ease", border: "1px solid rgba(255,255,255,.07)",
      }}>
        <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>🏁</div>
        <div style={{ fontFamily: "var(--ff-display)", fontSize: "1.1rem", marginBottom: 8, color: "var(--ht-text)" }}>
          End Drill?
        </div>
        <div style={{ color: "var(--ht-muted)", fontSize: "0.84rem", marginBottom: 24, lineHeight: 1.6, fontFamily: "var(--ff-body)" }}>
          Results and success rates will be shown.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} className="ht-btn-ghost" style={{ flex: 1, padding: "12px", fontSize: "0.88rem" }}>
            Keep Going
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "12px", background: "var(--ht-cyan)", border: "none", borderRadius: 10,
              color: "#fff", fontSize: "0.88rem", fontWeight: 700, cursor: "pointer",
              fontFamily: "var(--ff-body)", boxShadow: "0 4px 16px rgba(10,166,214,.4)",
            }}
          >
            End Drill 🎯
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
const DrillTracking = () => {
  const { id: currentGameId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentGame = useSelector((state) => state.games.byId[currentGameId]) || {};
  const playersById = useSelector((state) => state.players.byId);

  const selectedPlayers = useMemo(() => {
    if (!currentGame?.playerIds) return [];
    return currentGame.playerIds.map((id) => playersById[id]).filter(Boolean);
  }, [currentGame?.playerIds, playersById]);

  const [selPlayer, setSelPlayer] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [madeKey, setMadeKey] = useState(0);
  const [floats, setFloats] = useState([]);
  const [lastActions, setLastActions] = useState(currentGame.actions || []);

  useEffect(() => {
    if (selectedPlayers.length > 0 && !selPlayer) {
      setSelPlayer(selectedPlayers[0]);
    }
  }, [selectedPlayers]);

  useEffect(() => {
    if (currentGame.id) {
      dispatch(updateLastActions({ gameId: currentGame.id, actions: lastActions }));
    }
  }, [lastActions, dispatch, currentGame.id]);

  const streak = useMemo(() => {
    if (!lastActions.length || !selPlayer) return 0;
    let s = 0;
    for (let i = lastActions.length - 1; i >= 0; i--) {
      const a = lastActions[i];
      if (a.playerId !== selPlayer.id) break;
      if (a.action === "addDrillCompletion") s++;
      else break;
    }
    return s;
  }, [lastActions, selPlayer]);

  const addFloat = useCallback((made) => {
    const id = Date.now() + Math.random();
    setFloats((prev) => [...prev, { id, made, x: 35 + Math.random() * 30, y: 30 + Math.random() * 15 }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1000);
  }, []);

  if (!currentGame?.id) return <Navigate to="/games" />;

  const getStats = (playerId) =>
    currentGame.stats?.[playerId] || { attempts: 0, completions: 0 };

  const ps = selPlayer ? getStats(selPlayer.id) : null;
  const pct = ps && ps.attempts > 0 ? Math.round((ps.completions / ps.attempts) * 100) : 0;

  const handleMade = () => {
    if (!selPlayer) { setShowSelect(true); return; }
    dispatch(addDrillCompletion({ gameId: currentGame.id, playerId: selPlayer.id }));
    setLastActions((prev) => [
      ...prev.slice(-19),
      { id: uuid(), action: "addDrillCompletion", gameId: currentGame.id, playerId: selPlayer.id, playerNumber: selPlayer.number },
    ]);
    setMadeKey((k) => k + 1);
    addFloat(true);
  };

  const handleMiss = () => {
    if (!selPlayer) { setShowSelect(true); return; }
    dispatch(addDrillAttempt({ gameId: currentGame.id, playerId: selPlayer.id }));
    setLastActions((prev) => [
      ...prev.slice(-19),
      { id: uuid(), action: "addDrillAttempt", gameId: currentGame.id, playerId: selPlayer.id, playerNumber: selPlayer.number },
    ]);
    addFloat(false);
  };

  const handleUndo = () => {
    if (!lastActions.length) return;
    dispatch(undoLastAction({ gameId: currentGame.id, actions: lastActions })); // reducer uses [last]
    setLastActions((prev) => prev.slice(0, -1)); // remove newest (at end)
  };

  const handleEndDrill = () => {
    dispatch(endGame(currentGame.id));
    setShowEnd(false);
    setShowResults(true);
  };

  const ringColor = pct >= 60 ? "var(--ht-cyan)" : "#ef4444";
  const playersWithStats = selectedPlayers.map((p) => {
    const s = getStats(p.id);
    return { ...p, ...s, pct: s.attempts > 0 ? Math.round((s.completions / s.attempts) * 100) : 0 };
  });

  return (
    <div className="ht-game-screen">
      <FloatParticles items={floats} />

      {/* Header */}
      <div
        style={{
          background: "linear-gradient(to bottom, #0a1115, var(--ht-bg1))",
          padding: "14px 18px 12px",
          borderBottom: "1px solid rgba(255,255,255,0.055)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.7rem", color: "var(--ht-muted)", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--ht-cyan)", display: "inline-block", animation: "ht-pulse-dot 1.5s infinite" }} />
            DRILL MODE
          </div>
          <div style={{ fontFamily: "var(--ff-display)", fontSize: "0.75rem", color: "var(--ht-cyan)", letterSpacing: "0.08em" }}>
            🎯 {currentGame.name || "Drill"}
          </div>
          <button
            onClick={() => setShowEnd(true)}
            style={{
              background: "rgba(10,166,214,.12)", border: "1px solid rgba(10,166,214,.3)", borderRadius: 7,
              padding: "5px 10px", color: "var(--ht-cyan)", cursor: "pointer", fontSize: "0.72rem",
              fontWeight: 700, letterSpacing: "0.07em", fontFamily: "var(--ff-body)",
            }}
          >
            END 🏁
          </button>
        </div>
      </div>

      {/* Player chip */}
      <div style={{ padding: "12px 16px 0", flexShrink: 0 }}>
        <button
          onClick={() => setShowSelect(true)}
          style={{
            width: "100%", padding: "11px 14px",
            background: selPlayer ? "var(--ht-card2)" : "rgba(10,166,214,.08)",
            border: `1.5px solid ${selPlayer ? "rgba(255,255,255,.09)" : "var(--ht-cyan)"}`,
            borderRadius: 12, color: "var(--ht-text)",
            display: "flex", alignItems: "center", gap: 10, cursor: "pointer", transition: "all 0.15s",
          }}
        >
          {selPlayer ? (
            <>
              <div style={{
                width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                background: "var(--ht-cyan-dim)", border: "2px solid var(--ht-cyan)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--ff-display)", fontSize: "0.72rem", color: "var(--ht-cyan)",
              }}>
                {selPlayer.number}
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--ff-body)" }}>{selPlayer.name}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--ht-muted)", marginTop: 1, fontFamily: "var(--ff-body)" }}>
                  {ps?.attempts || 0} attempts · {ps?.completions || 0} made · {pct}%
                </div>
              </div>
              {streak >= 2 && (
                <div style={{ fontSize: "1.1rem", animation: "ht-fire-glow 1.4s ease-in-out infinite" }}>
                  {streak >= 4 ? "🔥🔥" : "🔥"}
                </div>
              )}
              <div style={{ color: "var(--ht-muted)", fontSize: "0.8rem" }}>›</div>
            </>
          ) : (
            <>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--ht-cyan-dim)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", flexShrink: 0 }}>👆</div>
              <div style={{ flex: 1, textAlign: "left", fontSize: "0.9rem", color: "var(--ht-cyan)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>Select a Player</div>
              <div style={{ color: "var(--ht-cyan)", fontSize: "0.8rem" }}>›</div>
            </>
          )}
        </button>
      </div>

      {/* Main content area */}
      <div
        style={{
          flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", padding: "12px 16px", gap: 12, minHeight: 0, overflowY: "auto",
        }}
      >
        {selPlayer ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <ProgressRing
                pct={pct}
                size={148}
                stroke={13}
                color={ringColor}
                label={`${ps?.completions || 0}/${ps?.attempts || 0}`}
                sublabel="success"
              />
              {streak >= 2 && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "rgba(251,191,36,.1)", border: "1px solid rgba(251,191,36,.2)",
                  borderRadius: 20, padding: "5px 14px",
                }}>
                  <div style={{ animation: "ht-fire-glow 1.2s ease-in-out infinite", fontSize: "1rem" }}>🔥</div>
                  <div style={{ fontFamily: "var(--ff-display)", fontSize: "0.72rem", color: "var(--ht-gold)" }}>
                    STREAK × {streak}
                  </div>
                  <div style={{ animation: "ht-fire-glow 1.2s ease-in-out infinite", fontSize: "1rem" }}>🔥</div>
                </div>
              )}
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                key={madeKey}
                className="ht-btn-made-drill flash"
                onClick={handleMade}
                style={{ height: 82, fontSize: "1.5rem" }}
              >
                <span style={{ position: "relative", zIndex: 1 }}>✓ MADE</span>
                <span style={{ position: "relative", zIndex: 1, fontSize: "0.7rem", opacity: 0.85, letterSpacing: "0.1em" }}>
                  COMPLETION
                </span>
              </button>
              <button className="ht-btn-miss" onClick={handleMiss} style={{ height: 56, fontSize: "0.95rem" }}>
                ✕&nbsp;&nbsp;MISS
              </button>
            </div>

            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <button
                className="ht-btn-ghost"
                onClick={handleUndo}
                style={{ flex: 1, height: 40, fontSize: "0.75rem", letterSpacing: "0.06em" }}
              >
                ↩ UNDO
              </button>
              <button
                onClick={() => setShowEnd(true)}
                style={{
                  flex: 2, height: 40, background: "rgba(10,166,214,.1)",
                  border: "1.5px solid rgba(10,166,214,.3)", borderRadius: "var(--ht-rs)",
                  color: "var(--ht-cyan)", fontFamily: "var(--ff-body)", fontSize: "0.82rem",
                  fontWeight: 700, cursor: "pointer", letterSpacing: "0.07em",
                }}
              >
                END DRILL 🏁
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 0.5 }}>
            <div style={{
              width: 140, height: 140, borderRadius: "50%",
              border: "12px solid rgba(255,255,255,.06)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem",
            }}>🎯</div>
            <div style={{ fontSize: "0.85rem", color: "var(--ht-muted)", textAlign: "center", fontFamily: "var(--ff-body)" }}>
              Select a player above<br />to start tracking
            </div>
          </div>
        )}

        {/* Mini rings for all players who have attempts */}
        {playersWithStats.filter((p) => p.attempts > 0).length > 0 && (
          <div style={{ width: "100%" }}>
            <div style={{ fontSize: "0.6rem", color: "var(--ht-muted)", letterSpacing: "0.12em", fontWeight: 700, marginBottom: 8, textAlign: "center", fontFamily: "var(--ff-body)" }}>
              ALL PLAYERS
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              {playersWithStats.filter((p) => p.attempts > 0).map((p) => (
                <MiniRing key={p.id} pct={p.pct} name={p.name} pts={`${p.completions}/${p.attempts}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {showSelect && (
        <PlayerSheet
          players={selectedPlayers}
          selected={selPlayer}
          onSelect={(p) => { setSelPlayer(p); setShowSelect(false); }}
          onClose={() => setShowSelect(false)}
        />
      )}
      {showEnd && <EndModal onConfirm={handleEndDrill} onCancel={() => setShowEnd(false)} />}
      {showResults && (
        <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.9)", zIndex: 500 }}>
          <div style={{ width: "100%", maxWidth: 480, maxHeight: "100vh", overflowY: "auto" }}>
            <GameResult game={currentGame} onBackClick={() => setShowResults(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default DrillTracking;
