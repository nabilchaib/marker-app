import React from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import GameResults from "../../components/GameResults";

/**
 * Standalone "View stats" route. Mounts <GameResults> against a game already
 * present in Redux (either freshly loaded from Firestore or rehydrated from
 * localStorage via redux-persist) so a user can review their full made/miss
 * breakdown without having to trigger the end-game flow from GameControls.
 *
 * Works for both pick-up and drill games — GameResults handles both shapes.
 *
 * If the game isn't in state.games.byId (e.g. cold load, different browser),
 * we redirect to /games rather than render an empty shell. A future task
 * (HT-021 follow-up) can wire a Firestore fetch here for finished games.
 */
const GameStats = () => {
  const { id: currentGameId } = useParams();
  const navigate = useNavigate();
  const currentGame = useSelector(
    (state) => state.games.byId[currentGameId]
  );

  if (!currentGame) {
    return <Navigate to="/games" replace />;
  }

  return (
    <div
      className="ht-game-screen"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.95)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflowY: "auto",
        zIndex: 100,
      }}
    >
      <div style={{ width: "100%", maxWidth: 480, padding: "1rem 0" }}>
        <GameResults
          game={currentGame}
          onBackClick={() => navigate("/games")}
        />
      </div>
    </div>
  );
};

export default GameStats;
