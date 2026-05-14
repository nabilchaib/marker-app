import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";

const Scoreboard = ({ currentGameId }) => {
  const currentGame = useSelector((state) => state.games.byId[currentGameId]);
  const teams = useSelector((state) => state.teams);
  const teamA = teams.byId[currentGame.teamAId];
  const teamB = teams.byId[currentGame.teamBId];
  const teamAScore = currentGame.teamAScore;
  const teamBScore = currentGame.teamBScore;

  const [flashTeam, setFlashTeam] = useState(null);
  const prevScores = useRef({ a: teamAScore, b: teamBScore });

  useEffect(() => {
    if (teamAScore > prevScores.current.a) {
      setFlashTeam("teamA");
      setTimeout(() => setFlashTeam(null), 450);
    } else if (teamBScore > prevScores.current.b) {
      setFlashTeam("teamB");
      setTimeout(() => setFlashTeam(null), 450);
    }
    prevScores.current = { a: teamAScore, b: teamBScore };
  }, [teamAScore, teamBScore]);

  return (
    <div
      style={{
        background: "linear-gradient(to bottom, #0a1115, var(--ht-bg1))",
        padding: "14px 18px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.055)",
        flexShrink: 0,
      }}
    >
      {/* Top bar: live pill + logo + end button placeholder */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            fontSize: "0.72rem",
            color: "var(--ht-muted)",
            letterSpacing: "0.08em",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#4ade80",
              display: "inline-block",
              animation: "ht-pulse-dot 1.5s infinite",
            }}
          />
          LIVE
        </div>
        <div
          style={{
            fontFamily: "var(--ff-display)",
            fontSize: "0.75rem",
            color: "var(--ht-orange)",
            letterSpacing: "0.08em",
          }}
        >
          HOOPTRACKR
        </div>
        {/* spacer to match width */}
        <div style={{ width: 60 }} />
      </div>

      {/* Scores */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}
      >
        {/* Team A */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--ht-orange)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
              fontWeight: 700,
              fontFamily: "var(--ff-body)",
            }}
          >
            {teamA?.name || "Home"}
          </div>
          <div
            className={flashTeam === "teamA" ? "ht-score-pop" : ""}
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: "3.4rem",
              fontWeight: 800,
              color: "var(--ht-orange)",
              lineHeight: 1,
              transition: "color 0.3s",
            }}
          >
            {teamAScore}
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <div
            style={{
              width: 1,
              height: 18,
              background: "linear-gradient(to bottom, var(--ht-orange), var(--ht-cyan))",
            }}
          />
          <div
            style={{
              fontSize: "0.65rem",
              color: "var(--ht-dim)",
              letterSpacing: "0.08em",
              fontFamily: "var(--ff-body)",
            }}
          >
            VS
          </div>
          <div
            style={{
              width: 1,
              height: 18,
              background: "linear-gradient(to bottom, var(--ht-cyan), transparent)",
            }}
          />
        </div>

        {/* Team B */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              fontSize: "0.7rem",
              color: "var(--ht-cyan)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 4,
              fontWeight: 700,
              fontFamily: "var(--ff-body)",
            }}
          >
            {teamB?.name || "Away"}
          </div>
          <div
            className={flashTeam === "teamB" ? "ht-score-pop" : ""}
            style={{
              fontFamily: "var(--ff-display)",
              fontSize: "3.4rem",
              fontWeight: 800,
              color: "var(--ht-cyan)",
              lineHeight: 1,
              transition: "color 0.3s",
            }}
          >
            {teamBScore}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoreboard;
