import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { v4 as uuid } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addMadeShot,
  addAttemptedShot,
  addRebound,
  addAssist,
  addFoul,
  updateLastActions,
  undoLastAction,
  endGame,
} from "../redux/games-reducer";
import PlayerSelection from "./PlayerSelection";
import GameResult from "./GameResults";
import { pushStatsToFirebase } from "../firebase/api";

/* ── helpers ── */
const getPlayerPts = (s) =>
  s ? (s.threes || 0) * 3 + (s.twos || 0) * 2 + (s.freeThrows || 0) : 0;
const getPlayerFgm = (s) => s ? (s.threes || 0) + (s.twos || 0) : 0;
const getPlayerFga = (s) =>
  s
    ? (s.threes || 0) + (s.twos || 0) + (s.attemptedThrees || 0) + (s.attemptedTwos || 0)
    : 0;
const getPlayerReb = (s) =>
  s ? (s.offensiveRebounds || 0) + (s.defensiveRebounds || 0) : 0;

/* ── Float Particles ── */
function FloatParticles({ items }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 9999,
      }}
    >
      {items.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontFamily: "var(--ff-display)",
            fontWeight: 800,
            fontSize: p.pts >= 3 ? "2.4rem" : "1.9rem",
            color:
              p.pts < 0
                ? "#f87171"
                : p.pts >= 3
                ? "var(--ht-gold)"
                : "#fff",
            textShadow:
              p.pts >= 3
                ? "0 0 24px rgba(251,191,36,.9)"
                : "0 0 16px rgba(246,78,7,.7)",
            animation: "ht-score-float 0.95s ease-out forwards",
            whiteSpace: "nowrap",
          }}
        >
          {p.pts < 0 ? "MISS" : p.pts >= 3 ? `+${p.pts} 🔥` : `+${p.pts}`}
        </div>
      ))}
    </div>
  );
}

/* ── Leaderboard strip ── */
function LeaderboardStrip({ allPlayers, allStats, teamAId, teamBId }) {
  const sorted = allPlayers
    .map((p) => {
      const teamId = p.teamId;
      const s = allStats?.[teamId]?.[p.id];
      return { ...p, pts: getPlayerPts(s) };
    })
    .filter((p) => p.pts > 0)
    .sort((a, b) => b.pts - a.pts)
    .slice(0, 6);

  if (!sorted.length) return null;

  return (
    <div style={{ flexShrink: 0 }}>
      <div
        style={{
          fontSize: "0.58rem",
          color: "var(--ht-muted)",
          letterSpacing: "0.12em",
          marginBottom: 5,
          fontWeight: 700,
          fontFamily: "var(--ff-body)",
        }}
      >
        🏆 LEADERS
      </div>
      <div
        style={{
          display: "flex",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 2,
          WebkitOverflowScrolling: "touch",
        }}
      >
        {sorted.map((p, i) => (
          <div
            key={p.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              background: "var(--ht-card)",
              borderRadius: 20,
              padding: "4px 9px 4px 5px",
              flexShrink: 0,
              border: `1px solid ${
                i === 0 ? "rgba(251,191,36,.3)" : "rgba(255,255,255,.06)"
              }`,
            }}
          >
            <span
              style={{
                width: 17,
                height: 17,
                borderRadius: "50%",
                background:
                  i === 0
                    ? "var(--ht-gold)"
                    : i === 1
                    ? "rgba(255,255,255,.15)"
                    : "var(--ht-card2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.5rem",
                color: i === 0 ? "#000" : "var(--ht-muted)",
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                fontSize: "0.73rem",
                fontWeight: 700,
                whiteSpace: "nowrap",
                color: "var(--ht-text)",
                fontFamily: "var(--ff-body)",
              }}
            >
              {p.name}
            </span>
            <span
              style={{
                fontFamily: "var(--ff-display)",
                fontSize: "0.7rem",
                color: i === 0 ? "var(--ht-gold)" : "var(--ht-orange)",
                marginLeft: 1,
              }}
            >
              {p.pts}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Player Sheet (bottom sheet) ── */
function PlayerSheet({ players, selected, color, teamName, allStats, teamId, onSelect, onClose }) {
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--ff-display)",
                fontSize: "0.9rem",
                color,
                letterSpacing: "0.08em",
              }}
            >
              SELECT PLAYER
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--ht-muted)",
                marginTop: 2,
                fontFamily: "var(--ff-body)",
              }}
            >
              {teamName}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: "rgba(255,255,255,.08)",
              border: "none",
              color: "var(--ht-muted)",
              cursor: "pointer",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
          }}
        >
          {players.map((p) => {
            const on = selected?.id === p.id;
            const s = allStats?.[teamId]?.[p.id];
            const pts = getPlayerPts(s);
            return (
              <button
                key={p.id}
                onClick={() => onSelect(p)}
                style={{
                  padding: "14px 8px",
                  background: on ? color + "25" : "var(--ht-card2)",
                  border: `2px solid ${on ? color : "rgba(255,255,255,.06)"}`,
                  borderRadius: 12,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 5,
                  transition: "all 0.1s",
                  boxShadow: on ? `0 0 14px ${color}35` : "none",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--ff-display)",
                    fontSize: "1.25rem",
                    color: on ? color : "var(--ht-text)",
                  }}
                >
                  #{p.number}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: on ? "var(--ht-text)" : "var(--ht-muted)",
                    fontWeight: 700,
                    textAlign: "center",
                    fontFamily: "var(--ff-body)",
                  }}
                >
                  {p.name}
                </div>
                {pts > 0 && (
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: on ? color : "var(--ht-dim)",
                      fontWeight: 700,
                      fontFamily: "var(--ff-body)",
                    }}
                  >
                    {pts}pts
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── End Game modal ── */
function EndModal({ onConfirm, onCancel, label = "Game" }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        backdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 300,
      }}
    >
      <div
        style={{
          background: "var(--ht-card)",
          borderRadius: 18,
          padding: "28px 24px",
          width: "100%",
          maxWidth: 360,
          textAlign: "center",
          animation: "ht-slide-up 0.2s ease",
          border: "1px solid rgba(255,255,255,.07)",
        }}
      >
        <div style={{ fontSize: "2.2rem", marginBottom: 12 }}>🏁</div>
        <div
          style={{
            fontFamily: "var(--ff-display)",
            fontSize: "1.1rem",
            marginBottom: 8,
            color: "var(--ht-text)",
          }}
        >
          End {label}?
        </div>
        <div
          style={{
            color: "var(--ht-muted)",
            fontSize: "0.84rem",
            marginBottom: 24,
            lineHeight: 1.6,
            fontFamily: "var(--ff-body)",
          }}
        >
          Stats will be saved and you'll get a shareable game card!
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            className="ht-btn-ghost"
            style={{ flex: 1, padding: "12px", fontSize: "0.88rem" }}
          >
            Keep Playing
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "12px",
              background: "var(--ht-orange)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: "0.88rem",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "var(--ff-body)",
              boxShadow: "0 4px 16px rgba(246,78,7,.4)",
            }}
          >
            End & Share 🏆
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════ */
const GameControls = ({ currentGameId, currentPlayer, selectedPlayers, onPlayerSelect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentGame = useSelector((state) => state.games.byId[currentGameId]);
  const teamA = useSelector((state) => state.teams.byId[currentGame.teamAId]);
  const teamB = useSelector((state) => state.teams.byId[currentGame.teamBId]);
  const players = useSelector((state) => state.players);
  const allStats = currentGame.stats || {};

  const teamAPlayers = useMemo(
    () =>
      (teamA?.players || [])
        .map((id) => players.byId[id])
        .filter(Boolean)
        .map((p) => ({ ...p, teamId: teamA?.id })),
    [teamA, players.byId]
  );
  const teamBPlayers = useMemo(
    () =>
      (teamB?.players || [])
        .map((id) => players.byId[id])
        .filter(Boolean)
        .map((p) => ({ ...p, teamId: teamB?.id })),
    [teamB, players.byId]
  );
  const allPlayers = useMemo(() => [...teamAPlayers, ...teamBPlayers], [teamAPlayers, teamBPlayers]);

  /* ── local state ── */
  const [activeTeam, setActiveTeam] = useState("teamA");
  const [selectedPlayer, setSelectedPlayer] = useState(currentPlayer || null);
  const [shotPts, setShotPts] = useState(2);
  const [showSelect, setShowSelect] = useState(false);
  const [showEnd, setShowEnd] = useState(false);
  const [showGameResult, setShowGameResult] = useState(false);
  const [lastActions, setLastActions] = useState(currentGame.actions || []);
  const [floats, setFloats] = useState([]);
  const [madeKey, setMadeKey] = useState(0);
  const [streaks, setStreaks] = useState({});

  const team = activeTeam === "teamA" ? teamA : teamB;
  const teamPlayers = activeTeam === "teamA" ? teamAPlayers : teamBPlayers;
  const teamColor = activeTeam === "teamA" ? "var(--ht-orange)" : "var(--ht-cyan)";
  const teamId = activeTeam === "teamA" ? teamA?.id : teamB?.id;

  /* current player's display stats */
  const pStats = selectedPlayer
    ? allStats?.[teamId]?.[selectedPlayer.id]
    : null;
  const pPts = getPlayerPts(pStats);
  const pFgm = getPlayerFgm(pStats);
  const pFga = getPlayerFga(pStats);
  const pFgPct = pFga > 0 ? Math.round((pFgm / pFga) * 100) : null;
  const streak = streaks[selectedPlayer?.id] || 0;

  /* ── sync actions to redux ── */
  useEffect(() => {
    dispatch(updateLastActions({ gameId: currentGame.id, actions: lastActions }));
  }, [lastActions, dispatch, currentGame.id]);

  const addFloat = useCallback((pts) => {
    const id = Date.now() + Math.random();
    const x = 38 + Math.random() * 24;
    const y = 30 + Math.random() * 20;
    setFloats((prev) => [...prev, { id, pts, x, y }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 1000);
  }, []);

  const pushAction = useCallback((label, type, pts = 0) => {
    setLastActions((prev) => [...prev.slice(-8), { id: uuid(), label, type, pts }]);
  }, []);

  /* ── handlers ── */
  const handleTeamChange = (teamKey) => {
    setActiveTeam(teamKey);
    setSelectedPlayer(null);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayer(player);
    setShowSelect(false);
    if (onPlayerSelect) onPlayerSelect(player);
  };

  const handleMade = () => {
    if (!selectedPlayer) { setShowSelect(true); return; }
    const tid = teamId;
    dispatch(addMadeShot({ gameId: currentGame.id, teamId: tid, playerId: selectedPlayer.id, points: shotPts }));
    const entry = { id: uuid(), action: "addMadeShot", gameId: currentGame.id, teamId: tid, playerId: selectedPlayer.id, points: shotPts, playerNumber: selectedPlayer.number, label: `${selectedPlayer.name} +${shotPts}`, type: "made", pts: shotPts };
    setLastActions((prev) => [...prev.slice(-8), entry]); // oldest-first, newest at end
    setStreaks((prev) => ({ ...prev, [selectedPlayer.id]: (prev[selectedPlayer.id] || 0) + 1 }));
    setMadeKey((k) => k + 1);
    addFloat(shotPts);
  };

  const handleMiss = () => {
    if (!selectedPlayer) { setShowSelect(true); return; }
    const tid = teamId;
    dispatch(addAttemptedShot({ gameId: currentGame.id, teamId: tid, playerId: selectedPlayer.id, points: shotPts }));
    const entry = { id: uuid(), action: "addAttemptedShot", gameId: currentGame.id, teamId: tid, playerId: selectedPlayer.id, points: shotPts, playerNumber: selectedPlayer.number, label: `${selectedPlayer.name} MISS`, type: "miss", pts: 0 };
    setLastActions((prev) => [...prev.slice(-8), entry]);
    setStreaks((prev) => ({ ...prev, [selectedPlayer.id]: 0 }));
    addFloat(-1);
  };

  const handleAssist = () => {
    if (!selectedPlayer) { setShowSelect(true); return; }
    dispatch(addAssist({ gameId: currentGame.id, teamId, playerId: selectedPlayer.id }));
    pushAction(`${selectedPlayer.name} AST`, "ast");
  };

  const handleRebound = () => {
    if (!selectedPlayer) { setShowSelect(true); return; }
    dispatch(addRebound({ gameId: currentGame.id, teamId, playerId: selectedPlayer.id, reboundType: "offensive" }));
    pushAction(`${selectedPlayer.name} REB`, "reb");
  };

  const handleFoul = () => {
    if (!selectedPlayer) { setShowSelect(true); return; }
    dispatch(addFoul({ gameId: currentGame.id, teamId, playerId: selectedPlayer.id }));
    pushAction(`FOUL #${selectedPlayer.number}`, "foul");
  };

  const handleUndo = () => {
    if (!lastActions.length) return;
    dispatch(undoLastAction({ gameId: currentGame.id, actions: lastActions })); // reducer uses [last]
    setLastActions((prev) => prev.slice(0, -1)); // remove newest (at end)
  };

  const handleEndGame = async () => {
    try {
      await pushStatsToFirebase(currentGame, teamA, teamB);
    } catch (err) {
      console.error("Error persisting final stats:", err);
    }
    dispatch(endGame(currentGame.id));
    navigate("/games");
  };

  const actionColor = { made: "var(--ht-orange)", miss: "var(--ht-miss)", ast: "var(--ht-cyan)", reb: "#4ade80", foul: "#fbbf24" };

  return (
    <>
      <FloatParticles items={floats} />

      {/* Team toggle */}
      <div style={{ padding: "10px 16px 0", display: "flex", gap: 8, flexShrink: 0 }}>
        {["teamA", "teamB"].map((tk) => {
          const t = tk === "teamA" ? teamA : teamB;
          const on = activeTeam === tk;
          const c = tk === "teamA" ? "var(--ht-orange)" : "var(--ht-cyan)";
          return (
            <button
              key={tk}
              onClick={() => handleTeamChange(tk)}
              style={{
                flex: 1,
                padding: "9px",
                borderRadius: 10,
                border: `2px solid ${on ? c : "rgba(255,255,255,.07)"}`,
                background: on ? c + "1e" : "transparent",
                color: on ? c : "var(--ht-muted)",
                fontFamily: "var(--ff-body)",
                fontSize: "0.92rem",
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: "0.06em",
                transition: "all 0.15s",
                boxShadow: on ? `0 0 14px ${c}35` : "none",
              }}
            >
              {t?.name || (tk === "teamA" ? "Team A" : "Team B")}
            </button>
          );
        })}
      </div>

      {/* Player chip */}
      <div style={{ padding: "10px 16px 0", flexShrink: 0 }}>
        <button
          onClick={() => setShowSelect(true)}
          style={{
            width: "100%",
            padding: "11px 14px",
            background: selectedPlayer ? "var(--ht-card2)" : "rgba(246,78,7,.08)",
            border: `1.5px solid ${selectedPlayer ? "rgba(255,255,255,.09)" : "var(--ht-orange)"}`,
            borderRadius: 12,
            color: "var(--ht-text)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {selectedPlayer ? (
            <>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  flexShrink: 0,
                  background: activeTeam === "teamA" ? "var(--ht-orange-dim)" : "var(--ht-cyan-dim)",
                  border: `2px solid ${teamColor}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--ff-display)",
                  fontSize: "0.72rem",
                  color: teamColor,
                }}
              >
                {selectedPlayer.number}
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{ fontSize: "0.95rem", fontWeight: 700, fontFamily: "var(--ff-body)" }}>
                  {selectedPlayer.name}
                </div>
                <div style={{ fontSize: "0.68rem", color: "var(--ht-muted)", marginTop: 1, fontFamily: "var(--ff-body)" }}>
                  {pFga > 0
                    ? `${pPts}pts · ${pFgm}/${pFga} FG · ${pFgPct}%`
                    : "Tap to change player"}
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
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--ht-orange-dim)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.1rem",
                  flexShrink: 0,
                }}
              >
                👆
              </div>
              <div style={{ flex: 1, textAlign: "left", fontSize: "0.9rem", color: "var(--ht-orange)", fontWeight: 600, fontFamily: "var(--ff-body)" }}>
                Select a Player
              </div>
              <div style={{ color: "var(--ht-orange)", fontSize: "0.8rem" }}>›</div>
            </>
          )}
        </button>
      </div>

      {/* Controls area */}
      <div
        style={{
          flex: 1,
          padding: "10px 16px 16px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minHeight: 0,
          overflowY: "auto",
        }}
      >
        {/* Shot type pills */}
        <div
          style={{
            display: "flex",
            background: "var(--ht-card)",
            borderRadius: 10,
            padding: 3,
            gap: 2,
            flexShrink: 0,
          }}
        >
          {[
            { pts: 1, label: "1PT · FT" },
            { pts: 2, label: "2PT" },
            { pts: 3, label: "3PT · ARC" },
          ].map(({ pts, label }) => (
            <button
              key={pts}
              onClick={() => setShotPts(pts)}
              style={{
                flex: 1,
                padding: "7px 4px",
                borderRadius: 8,
                border: "none",
                background: shotPts === pts ? "var(--ht-orange)" : "transparent",
                color: shotPts === pts ? "#fff" : "var(--ht-muted)",
                fontFamily: "var(--ff-body)",
                fontSize: "0.78rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.15s",
                letterSpacing: "0.06em",
                boxShadow: shotPts === pts ? "0 2px 10px rgba(246,78,7,.4)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* MADE button */}
        <button
          key={madeKey}
          className="ht-btn-made flash"
          onClick={handleMade}
          style={{ height: 88, fontSize: "1.55rem", flexShrink: 0 }}
        >
          <span style={{ position: "relative", zIndex: 1 }}>✓ MADE</span>
          <span style={{ position: "relative", zIndex: 1, fontSize: "0.72rem", opacity: 0.85, letterSpacing: "0.1em" }}>
            +{shotPts} {shotPts === 1 ? "FREE THROW" : shotPts === 2 ? "2-POINTER" : "3-POINTER"}
          </span>
        </button>

        {/* MISS button */}
        <button
          className="ht-btn-miss"
          onClick={handleMiss}
          style={{ height: 56, fontSize: "0.95rem", flexShrink: 0 }}
        >
          ✕&nbsp;&nbsp;MISS
        </button>

        {/* Stat buttons */}
        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
          {[
            { label: "🤝 ASSIST", fn: handleAssist },
            { label: "💪 REBOUND", fn: handleRebound },
            { label: "⚠ FOUL", fn: handleFoul },
          ].map(({ label, fn }) => (
            <button
              key={label}
              className="ht-btn-stat"
              onClick={fn}
              style={{ height: 48, fontSize: "0.73rem", letterSpacing: "0.04em" }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Leaderboard strip */}
        <LeaderboardStrip allPlayers={allPlayers} allStats={allStats} teamAId={teamA?.id} teamBId={teamB?.id} />

        {/* Action feed */}
        <div
          style={{
            flex: 1,
            background: "var(--ht-card)",
            borderRadius: 10,
            padding: "10px 12px",
            overflow: "hidden",
            minHeight: 44,
          }}
        >
          {lastActions.length === 0 ? (
            <div style={{ color: "var(--ht-dim)", fontSize: "0.75rem", textAlign: "center", paddingTop: 4, fontFamily: "var(--ff-body)" }}>
              Shot log will appear here
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[...lastActions].reverse().slice(0, 4).map((a, i) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 8, opacity: Math.max(0.2, 1 - i * 0.18) }}>
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: actionColor[a.type] || "var(--ht-muted)",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      fontSize: "0.78rem",
                      color: i === 0 ? "var(--ht-text)" : "var(--ht-muted)",
                      fontWeight: i === 0 ? 600 : 400,
                      fontFamily: "var(--ff-body)",
                    }}
                  >
                    {a.label || a.action}
                  </div>
                  {a.pts > 0 && (
                    <div style={{ fontFamily: "var(--ff-display)", fontSize: "0.78rem", color: "var(--ht-orange)" }}>
                      +{a.pts}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom row: Undo + End Game */}
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            className="ht-btn-ghost"
            onClick={handleUndo}
            style={{ flex: 1, height: 42, fontSize: "0.75rem", letterSpacing: "0.06em" }}
          >
            ↩ UNDO
          </button>
          <button
            onClick={() => setShowEnd(true)}
            style={{
              flex: 2,
              height: 42,
              background: "var(--ht-orange-dim)",
              border: "1.5px solid rgba(246,78,7,.3)",
              borderRadius: "var(--ht-rs)",
              color: "var(--ht-orange)",
              fontFamily: "var(--ff-body)",
              fontSize: "0.83rem",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: "0.07em",
            }}
          >
            END GAME 🏁
          </button>
        </div>
      </div>

      {/* Overlays */}
      {showSelect && (
        <PlayerSheet
          players={teamPlayers}
          selected={selectedPlayer}
          color={teamColor}
          teamName={team?.name}
          allStats={allStats}
          teamId={teamId}
          onSelect={handlePlayerSelect}
          onClose={() => setShowSelect(false)}
        />
      )}
      {showEnd && (
        <EndModal
          label="Game"
          onConfirm={() => { setShowEnd(false); setShowGameResult(true); handleEndGame(); }}
          onCancel={() => setShowEnd(false)}
        />
      )}
      {showGameResult && (
        <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.9)", zIndex: 500 }}>
          <div style={{ width: "100%", maxWidth: 480, maxHeight: "100vh", overflowY: "auto" }}>
            <GameResult game={currentGame} onBackClick={() => setShowGameResult(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default GameControls;
