import React, { useState, useEffect, useMemo } from "react";
import { v4 as uuid } from "uuid";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  addMadeShot,
  addAttemptedShot,
  addRebound,
  addAssist,
  addFoul,
  addDrillAttempt,
  addDrillCompletion,
  updateLastActions,
  undoLastAction,
  endGame,
} from "../redux/games-reducer";
import "../css/main.css";
import PlayerSelection from "./PlayerSelection";
import GameResult from "./GameResults";
import { buttonStyles } from '../utils/buttonStyles';

const GameControls = ({ currentGameId, currentPlayer, selectedPlayers, onPlayerSelect }) => {
  const dispatch = useDispatch();
  const currentGame = useSelector((state) => state.games.byId[currentGameId]);
  const teamA = useSelector((state) => state.teams.byId[currentGame.teamAId]);
  const teamB = useSelector((state) => state.teams.byId[currentGame.teamBId]);
  const players = useSelector((state) => state.players);
  const allPlayers = useMemo(() => {
    return players.allIds
      .map((playerId) => players.byId[playerId])
      .filter(player => player !== undefined);
  }, [players.allIds, players.byId]);
  const teamAPlayers = useMemo(() => {
    return (teamA?.players || [])
      .map((playerId) => players.byId[playerId])
      .filter(player => player !== undefined);
  }, [teamA?.players, players.byId]);
  const teamBPlayers = useMemo(() => {
    return (teamB?.players || [])
      .map((playerId) => players.byId[playerId])
      .filter(player => player !== undefined);
  }, [teamB?.players, players.byId]);
  const mode = currentGame.type;

  const [selectedTeam, setSelectedTeam] = useState(
    mode === "pick-up" ? "teamA" : null
  );
  const [selectedPlayer, setSelectedPlayer] = useState(currentPlayer);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [showGameResult, setShowGameResult] = useState(false);
  const [undoLoading, setUndoLoading] = useState(false);
  const [madeLoading, setMadeLoading] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [reboundLoading, setReboundLoading] = useState(false);
  const [assistLoading, setAssistLoading] = useState(false);
  const [foulLoading, setFoulLoading] = useState(false);
  const [playerOptionsMap, setPlayerOptionsMap] = useState({
    teamA: [],
    teamB: [],
  });
  const navigate = useNavigate();

  const [lastActions, setLastActions] = useState(currentGame.actions || []);
  const [showAllActions, setShowAllActions] = useState(false);

  useEffect(() => {
    if (mode === "drill") {
      setPlayerOptionsMap({
        teamA: selectedPlayers || [],
        teamB: selectedPlayers || [],
      });
    } else if (mode === "pick-up") {
      setPlayerOptionsMap({
        teamA: teamAPlayers,
        teamB: teamBPlayers,
      });
    }
  }, [mode, teamA, teamB, selectedPlayers]);

  useEffect(() => {
    dispatch(
      updateLastActions({ gameId: currentGame.id, actions: lastActions })
    );
  }, [lastActions, dispatch]);

  const handleTeamChange = (teamValue) => {
    setSelectedTeam(teamValue);
    setSelectedPlayer(null);
  };

  const handlePlayerSelect = (player) => {
    console.log('PP: ', player, currentPlayer)
    setSelectedPlayer(player);
    setShowPlayerSelection(false);
    if (onPlayerSelect) {
      onPlayerSelect(player);
    }
  };

  const handleAttempt = async (points) => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      dispatch(
        addAttemptedShot({
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          gameMode: mode,
          points,
        })
      );
      setLastActions((prev) => [
        ...prev,
        {
          id: uuid(),
          action: "addAttemptedShot",
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          points: points,
          playerNumber: selectedPlayer.number,
          gameMode: mode,
        },
      ]);
    }
  };

  const handleMade = async (points) => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      dispatch(
        addMadeShot({
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          gameMode: mode,
          points,
        })
      );
      setLastActions((prev) => [
        ...prev,
        {
          id: uuid(),
          action: "addMadeShot",
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          points,
          playerNumber: selectedPlayer.number,
          gameMode: mode,
        },
      ]);
    }
  };

  const handleRebound = async (type) => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      dispatch(
        addRebound({
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          gameMode: mode,
          reboundType: type,
        })
      );
      setLastActions((prev) => [
        ...prev,
        {
          id: uuid(),
          action: "addRebound",
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          reboundType: type,
          playerNumber: selectedPlayer.number,
          gameMode: mode,
        },
      ]);
    }
  };

  const handleAssist = async () => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      dispatch(
        addAssist({
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          gameMode: mode,
        })
      );
      setLastActions((prev) => [
        ...prev,
        {
          id: uuid(),
          action: "addAssist",
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          playerNumber: selectedPlayer.number,
          gameMode: mode,
        },
      ]);
    }
  };

  const handleFoul = async () => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      dispatch(
        addFoul({
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          gameMode: mode,
        })
      );
      setLastActions((prev) => [
        ...prev,
        {
          id: uuid(),
          action: "addFoul",
          gameId: currentGame.id,
          teamId: selectedTeam === "teamA" ? teamA.id : teamB.id,
          playerId: selectedPlayer.id,
          playerNumber: selectedPlayer.number,
          gameMode: mode,
        },
      ]);
    }
  };

  const handleDrillCompletion = () => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      dispatch(
        addDrillCompletion({
          gameId: currentGame.id,
          playerId: selectedPlayer.id,
        })
      );
      setLastActions((prev) => [
        ...prev,
        {
          id: uuid(),
          action: "addDrillCompletion",
          gameId: currentGame.id,
          playerId: selectedPlayer.id,
          playerNumber: selectedPlayer.number,
          gameMode: mode,
        },
      ]);
    }
  };

  const handleDrillAttempt = () => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      dispatch(
        addDrillAttempt({
          gameId: currentGame.id,
          playerId: selectedPlayer.id,
        })
      );
      setLastActions((prev) => [
        ...prev,
        {
          id: uuid(),
          action: "addDrillAttempt",
          gameId: currentGame.id,
          playerId: selectedPlayer.id,
          playerNumber: selectedPlayer.number,
          gameMode: mode,
        },
      ]);
    }
  };

  const handleShowGameResult = () => {
    setShowGameResult(true);
  };

  const handleBackClick = () => {
    setShowGameResult(false);
  };

  const handleDeleteLastAction = async () => {
    dispatch(undoLastAction({ gameId: currentGame.id, actions: lastActions }));
    setLastActions((prevLastActions) => {
      return prevLastActions.slice(0, -1);
    });
  };

  const handleEndGame = async () => {
    try {
      // For freemium version, we only update the Redux store
      dispatch(endGame(currentGame.id));
      navigate('/games');
    } catch (err) {
      console.error('Error ending game:', err);
    }
  };

  const displayedActions = showAllActions
    ? lastActions.slice(-10)
    : lastActions.length > 0
      ? [lastActions[lastActions.length - 1]]
      : [];

  return (
    <div className="flex flex-col space-y-4 p-4">
      {/* Player Selection */}
      <div className="flex flex-col space-y-2">
        <h2 className="text-white font-bold text-lg">Select Player</h2>
        <button
          className={buttonStyles.playerSelect}
          onClick={() => setShowPlayerSelection(true)}
        >
          {selectedPlayer ? selectedPlayer.name : "Select Player"}
        </button>
      </div>

      {/* Shot Controls Grid */}
      <div className="grid grid-cols-3 gap-4 w-full">
        {/* Free Throw Column */}
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-white font-semibold">Free Throw</h3>
          <button 
            className={`${buttonStyles.madeShot} w-full`} 
            onClick={() => handleMade(1)}
            disabled={madeLoading === 1}
          >
            {madeLoading === 1 ? "Loading..." : "+1"}
          </button>
          <button 
            className={`${buttonStyles.missedShot} w-full`} 
            onClick={() => handleAttempt(1)}
            disabled={attemptLoading === 1}
          >
            {attemptLoading === 1 ? "Loading..." : "Miss"}
          </button>
        </div>

        {/* 2 Points Column */}
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-white font-semibold">2 Points</h3>
          <button 
            className={`${buttonStyles.madeShot} w-full`} 
            onClick={() => handleMade(2)}
            disabled={madeLoading === 2}
          >
            {madeLoading === 2 ? "Loading..." : "+2"}
          </button>
          <button 
            className={`${buttonStyles.missedShot} w-full`} 
            onClick={() => handleAttempt(2)}
            disabled={attemptLoading === 2}
          >
            {attemptLoading === 2 ? "Loading..." : "Miss"}
          </button>
        </div>

        {/* 3 Points Column */}
        <div className="flex flex-col items-center space-y-2">
          <h3 className="text-white font-semibold">3 Points</h3>
          <button 
            className={`${buttonStyles.madeShot} w-full`} 
            onClick={() => handleMade(3)}
            disabled={madeLoading === 3}
          >
            {madeLoading === 3 ? "Loading..." : "+3"}
          </button>
          <button 
            className={`${buttonStyles.missedShot} w-full`} 
            onClick={() => handleAttempt(3)}
            disabled={attemptLoading === 3}
          >
            {attemptLoading === 3 ? "Loading..." : "Miss"}
          </button>
        </div>
      </div>

      {/* Other Controls */}
      <div className="grid grid-cols-2 gap-4 w-full">
        <button className={buttonStyles.assist} onClick={handleAssist}>
          Assist
        </button>
        <button className={buttonStyles.rebound} onClick={() => handleRebound("offensive")}>
          Rebound
        </button>
        <button className={buttonStyles.foul} onClick={handleFoul}>
          Foul
        </button>
        <button className={buttonStyles.undo} onClick={handleDeleteLastAction}>
          Undo
        </button>
      </div>

      {/* Game End Button */}
      <button 
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors duration-200"
        onClick={handleShowGameResult}
      >
        End Game
      </button>

      {/* Player Selection Modal */}
      {showPlayerSelection && (
        <PlayerSelection
          players={mode === "pick-up" ? allPlayers : selectedTeam === "teamA" ? teamAPlayers : teamBPlayers}
          onSelect={handlePlayerSelect}
          onClose={() => setShowPlayerSelection(false)}
        />
      )}

      {/* Game Result Modal */}
      {showGameResult && (
        <GameResult
          game={currentGame}
          onClose={() => setShowGameResult(false)}
          onEndGame={handleEndGame}
        />
      )}
    </div>
  );
};

export default GameControls;
