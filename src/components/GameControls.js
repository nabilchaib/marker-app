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
} from "../redux/games-reducer";
import "../css/main.css";
import PlayerSelection from "./PlayerSelection";
import GameResult from "./GameResults";

const GameControls = ({ currentGameId, currentPlayer }) => {
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

  useEffect(() => {
    if (mode === "drill") {
      setPlayerOptionsMap({
        teamA: allPlayers,
        teamB: allPlayers,
      });
    } else if (mode === "pick-up") {
      setPlayerOptionsMap({
        teamA: teamAPlayers,
        teamB: teamBPlayers,
      });
    }
  }, [mode, teamA, teamB, navigate]);

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
          team={mode === "pick-up" ? selectedTeam : null} // Pass `null` or handle differently for drills
          players={
            mode === "drill" ? allPlayers : playerOptionsMap[selectedTeam]
          } // Show all players in drill mode
          onSelect={handlePlayerSelect}
          onClose={setShowPlayerSelection}
        />
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <button
            disabled={!!currentPlayer}
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

          {/* Drill or Game Mode Scoring Controls */}
          {mode === "drill" && (
            <div className="flex space-x-4 w-full">
              <button
                onClick={handleDrillAttempt}
                disabled={attemptLoading}
                className="w-full sm:w-1/2 py-4 text-lg sm:text-xl font-bold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-500 focus:outline-none"
              >
                {attemptLoading ? "Loading..." : "Miss"}
              </button>
              <button
                onClick={handleDrillCompletion}
                disabled={madeLoading}
                className="w-full sm:w-1/2 py-4 text-lg sm:text-xl font-bold text-white bg-green-600 rounded-lg shadow-md hover:bg-green-500 focus:outline-none"
              >
                {madeLoading ? "Loading..." : "Made"}
              </button>
            </div>
          )}

          {mode === "pick-up" && (
            <div className="addpoints flex flex-wrap justify-between items-center space-y-4 md:space-y-2 md:space-x-4">
              <div className="grid grid-cols-3 gap-4 text-center py-4">
                {/* Free Throw */}
                <div>
                  <h3 className="font-semibold text-white">Free Throw</h3>
                  <button
                    disabled={madeLoading === 1}
                    className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white
                      ${
                        madeLoading === 1
                          ? "bg-gray-400"
                          : "bg-[#f64e07] hover:bg-orange-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleMade(1)}
                  >
                    <span className="inline-block w-8 text-center">
                      {madeLoading === 1 ? "Loading..." : "+1"}
                    </span>
                  </button>
                  <button
                    disabled={attemptLoading === 1}
                    className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white mt-2
                      ${
                        attemptLoading === 1
                          ? "bg-gray-400"
                          : "bg-red-500 hover:bg-red-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleAttempt(1)}
                  >
                    <span className="inline-block w-8 text-center">
                      {attemptLoading === 1 ? "Loading..." : "Miss"}
                    </span>
                  </button>
                </div>

                {/* Two Points */}
                <div>
                  <h3 className="font-semibold text-white">2 Points</h3>
                  <button
                    disabled={madeLoading === 2}
                    className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white
                      ${
                        madeLoading === 2
                          ? "bg-gray-400"
                          : "bg-[#f64e07] hover:bg-orange-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleMade(2)}
                  >
                    <span className="inline-block w-8 text-center">
                      {madeLoading === 2 ? "Loading..." : "+2"}
                    </span>
                  </button>
                  <button
                    disabled={attemptLoading === 2}
                    className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white mt-2
                      ${
                        attemptLoading === 2
                          ? "bg-gray-400"
                          : "bg-red-500 hover:bg-red-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleAttempt(2)}
                  >
                    <span className="inline-block w-8 text-center">
                      {attemptLoading === 2 ? "Loading..." : "Miss"}
                    </span>
                  </button>
                </div>

                {/* Three Points */}
                <div>
                  <h3 className="font-semibold text-white">3 Points</h3>
                  <button
                    disabled={madeLoading === 3}
                    className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white
                      ${
                        madeLoading === 3
                          ? "bg-gray-400"
                          : "bg-[#f64e07] hover:bg-orange-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleMade(3)}
                  >
                    <span className="inline-block w-8 text-center">
                      {madeLoading === 3 ? "Loading..." : "+3"}
                    </span>
                  </button>
                  <button
                    disabled={attemptLoading === 3}
                    className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white mt-2
                      ${
                        attemptLoading === 3
                          ? "bg-gray-400"
                          : "bg-red-500 hover:bg-red-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleAttempt(3)}
                  >
                    <span className="inline-block w-8 text-center">
                      {attemptLoading === 3 ? "Loading..." : "Miss"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Rebounds, Assists, Fouls - Shown only in Game Mode */}
          {mode === "pick-up" && (
            <div className="addpoints flex flex-wrap justify-between items-center space-y-4 md:space-y-2 md:space-x-4">
              {/* Rebound */}
              <div className="stat flex flex-col items-center w-full md:w-1/3 space-y-2">
                <h3 className="font-semibold text-white mb-2">Rebound</h3>
                <div className="flex space-x-2">
                  <button
                    disabled={reboundLoading === "offensive"}
                    className={`py-2 px-4 text-sm md:text-base rounded-lg font-bold text-white
                      ${
                        reboundLoading === "offensive"
                          ? "bg-gray-400"
                          : "bg-[#f64e07] hover:bg-orange-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleRebound("offensive")}
                  >
                    <span className="inline-block w-12 text-center">
                      {reboundLoading === "offensive"
                        ? "Loading..."
                        : "Offense"}
                    </span>
                  </button>

                  <button
                    disabled={reboundLoading === "defensive"}
                    className={`py-2 px-4 text-sm md:text-base rounded-lg font-bold text-white
                      ${
                        reboundLoading === "defensive"
                          ? "bg-gray-400"
                          : "bg-[#f64e07] hover:bg-orange-600"
                      }
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleRebound("defensive")}
                  >
                    <span className="inline-block w-12 text-center">
                      {reboundLoading === "defensive"
                        ? "Loading..."
                        : "Defense"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Assist and Foul */}
              <div className="stat flex flex-col items-center w-full md:w-1/3 space-y-4">
                <button
                  disabled={assistLoading}
                  className={`py-2 px-6 md:py-3 md:px-8 lg:py-4 lg:px-10 w-full rounded-lg font-bold text-white
                    ${
                      assistLoading
                        ? "bg-gray-400"
                        : "bg-[#0aa6d6] hover:bg-blue-600"
                    }
                    shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                  onClick={handleAssist}
                >
                  <span className="inline-block w-12 text-center">
                    {assistLoading ? "Loading..." : "Assist"}
                  </span>
                </button>

                <button
                  disabled={foulLoading}
                  className={`py-2 px-6 md:py-3 md:px-8 lg:py-4 lg:px-10 w-full rounded-lg font-bold text-white
                    ${
                      foulLoading
                        ? "bg-gray-400"
                        : "bg-red-500 hover:bg-red-600"
                    }
                    shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                  onClick={handleFoul}
                >
                  <span className="inline-block w-12 text-center">
                    {foulLoading ? "Loading..." : "Foul"}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Undo Last Action */}
      <div className="controls py-8 px-6 flex flex-col items-center space-y-6">
        <button
          disabled={undoLoading}
          className={`py-2 px-6 w-full md:w-auto rounded-lg font-bold text-white ${
            undoLoading ? "bg-gray-400" : "bg-[#f64e07] hover:bg-orange-600"
          } shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
          onClick={handleDeleteLastAction}
        >
          {undoLoading ? "Loading..." : "Undo Last Action"}
        </button>

        {/* Show Game Result */}
        <div className="addpoints py-4 px-6 flex justify-center">
          <button
            className="py-4 px-6 w-full md:w-auto rounded-lg font-bold text-white bg-[#0aa6d6] hover:bg-blue-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={handleShowGameResult}
          >
            {mode === "drill" ? "Drill Stats" : "Game Stats"}
          </button>
        </div>
      </div>

      {/* Last Actions Table */}
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
