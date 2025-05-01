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

  // Calculate drill stats
  const drillStats = useMemo(() => {
    if (mode === "drill" && selectedPlayer) {
      return currentGame.stats[selectedPlayer.id] || { attempts: 0, completions: 0 };
    }
    return { attempts: 0, completions: 0 };
  }, [mode, selectedPlayer, currentGame.stats]);

  const successRate = useMemo(() => {
    if (drillStats.attempts === 0) return 0;
    return ((drillStats.completions / drillStats.attempts) * 100).toFixed(1);
  }, [drillStats]);

  const [showEndGameConfirmation, setShowEndGameConfirmation] = useState(false);

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
          teamId: mode === "pick-up" ? (selectedTeam === "teamA" ? teamA.id : teamB.id) : selectedPlayer.id,
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
          teamId: mode === "pick-up" ? (selectedTeam === "teamA" ? teamA.id : teamB.id) : selectedPlayer.id,
          playerId: selectedPlayer.id,
          points,
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
          teamId: mode === "pick-up" ? (selectedTeam === "teamA" ? teamA.id : teamB.id) : selectedPlayer.id,
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
          teamId: mode === "pick-up" ? (selectedTeam === "teamA" ? teamA.id : teamB.id) : selectedPlayer.id,
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

  const handleConfirmEndGame = () => {
    setShowEndGameConfirmation(false);
    setShowGameResult(true);
    handleEndGame();
  };

  const handleCancelEndGame = () => {
    setShowEndGameConfirmation(false);
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
    <div className="Controls">
      {/* Team Selection */}
      {mode === "pick-up" && (
        <div className="flex justify-around py-4">
          <button
            className={`py-4 px-8 md:py-5 md:px-10 text-lg md:text-xl font-bold rounded-lg transition-transform duration-200 transform ${
              selectedTeam === "teamA"
                ? "bg-[#f64e07] text-white scale-110"
                : "bg-gray-300 text-gray-700"
            }`}
            onClick={() => handleTeamChange("teamA")}
          >
            {teamA?.name || "Team A"}
          </button>

          <button
            className={`py-4 px-8 md:py-5 md:px-10 text-lg md:text-xl font-bold rounded-lg transition-transform duration-200 transform ${
              selectedTeam === "teamB"
                ? "bg-[#f64e07] text-white scale-110"
                : "bg-gray-300 text-gray-700"
            }`}
            onClick={() => handleTeamChange("teamB")}
          >
            {teamB?.name || "Team B"}
          </button>
        </div>
      )}

      {/* Player Selection */}
      {showPlayerSelection ? (
        <PlayerSelection
          team={mode === "pick-up" ? selectedTeam : null}
          players={mode === "drill" ? selectedPlayers : playerOptionsMap[selectedTeam]}
          onSelect={handlePlayerSelect}
          onClose={setShowPlayerSelection}
        />
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <button
            disabled={mode === "pick-up" && !!currentPlayer}
            className="relative w-full sm:w-auto py-2 px-4 md:py-4 md:px-8 text-base md:text-xl font-bold text-white bg-[#0aa6d6]
                      rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 hover:rotate-2 duration-200
                      focus:outline-none focus:ring-4 focus:ring-[#0aa6d6]"
            onClick={() => setShowPlayerSelection(true)}
          >
            <span className="absolute inset-0 bg-[#0a355e] opacity-75 blur-lg rounded-lg animate-pulse"></span>
            <span className="relative z-10">
              {selectedPlayer
                ? `#${selectedPlayer.number} - ${selectedPlayer.name}`
                : "Select Player"}
            </span>
          </button>

          {mode === "drill" ? (
            <div className="flex flex-col items-center justify-center space-y-6 p-4 w-full">
              <h2 className="text-xl font-bold text-white">
                Drill Mode: {selectedPlayer?.name}
              </h2>

              <div className="flex space-x-4">
                <button 
                  className={`${buttonStyles.madeShot} py-4 px-8 text-xl`} 
                  onClick={handleDrillCompletion}
                >
                  Made 
                </button>
                <button 
                  className={`${buttonStyles.missedShot} py-4 px-8 text-xl`} 
                  onClick={handleDrillAttempt}
                >
                  Miss 
                </button>
              </div>

              <div className="flex space-x-4">
                <button className={buttonStyles.undo} onClick={handleDeleteLastAction}>Undo</button>
                <button 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg" 
                  onClick={handleShowGameResult}
                >
                  Game Results
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Shot Controls Grid */}
              <div className="grid grid-cols-3 gap-1 w-full px-2">
                {/* Free Throw Column */}
                <div className="flex flex-col items-center space-y-2">
                  <h3 className="text-white font-semibold">Free Throw</h3>
                  <button 
                    className={`${buttonStyles.madeShot} w-full py-4 px-20 text-xl`} 
                    onClick={() => handleMade(1)}
                    disabled={madeLoading === 1}
                  >
                    {madeLoading === 1 ? "Loading..." : "+1"}
                  </button>
                  <button 
                    className={`${buttonStyles.missedShot} w-full py-4 px-8 text-xl`} 
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
                    className={`${buttonStyles.madeShot} w-full py-4 px-20 text-xl`} 
                    onClick={() => handleMade(2)}
                    disabled={madeLoading === 2}
                  >
                    {madeLoading === 2 ? "Loading..." : "+2"}
                  </button>
                  <button 
                    className={`${buttonStyles.missedShot} w-full py-4 px-8 text-xl`} 
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
                    className={`${buttonStyles.madeShot} w-full py-4 px-20 text-xl`} 
                    onClick={() => handleMade(3)}
                    disabled={madeLoading === 3}
                  >
                    {madeLoading === 3 ? "Loading..." : "+3"}
                  </button>
                  <button 
                    className={`${buttonStyles.missedShot} w-full py-4 px-8 text-xl`} 
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

              {/* Game Results Button */}
              <button 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg shadow-lg transition-colors duration-200"
                onClick={handleShowGameResult}
              >
                Game Results
              </button>
            </>
          )}
        </div>
      )}

      {/* Last Actions Table */}
      {mode === "pick-up" && (
        <div className="py-4">
          <h2 className="text-lg sm:text-xl font-bold text-orange-600 mb-4 text-center">
            Last Actions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-gray-100 border border-gray-300 rounded-lg shadow-sm">
              <thead>
                <tr className="bg-gray-200 text-gray-800">
                  <th className="py-3 px-6 text-left text-sm font-semibold border-b border-gray-300">
                    Action
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold border-b border-gray-300">
                    Points
                  </th>
                  <th className="py-3 px-6 text-left text-sm font-semibold border-b border-gray-300">
                    Player #
                  </th>
                </tr>
              </thead>
              <tbody>
                {lastActions.slice(-10).map((action, index) => (
                  <tr
                    key={action.id}
                    className={`${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-gray-200 transition-colors`}
                  >
                    <td className="py-3 px-6 text-sm text-gray-900 border-b border-gray-300">
                      {action.action}
                    </td>
                    <td className="py-3 px-6 text-sm text-green-600 font-semibold border-b border-gray-300">
                      {action.points}
                    </td>
                    <td className="py-3 px-6 text-sm text-orange-500 font-semibold border-b border-gray-300">
                      #{action.playerNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* End Game Confirmation Modal */}
      {showEndGameConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">
              End {mode === "drill" ? "Drill" : "Game"}?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to end this {mode === "drill" ? "drill" : "game"}? 
              This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelEndGame}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndGame}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                End {mode === "drill" ? "Drill" : "Game"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Result Modal */}
      {showGameResult && (
        <div className="game-result-overlay fixed inset-0 flex justify-center items-center bg-black bg-opacity-80 z-50">
          <div className="game-result-container w-full max-w-4xl rounded-lg shadow-2xl bg-white text-center relative overflow-y-auto max-h-screen">
            <GameResult game={currentGame} onBackClick={handleBackClick} />
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
