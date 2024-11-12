import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllPlayers } from './selectors/selectors';
import { useNavigate } from 'react-router-dom';
import {
  addMadeShotApi,
  addAttemptedShotApi,
  addReboundApi,
  addAssistApi,
  addFoulApi,
  updateLastActionsApi,
  undoLastActionApi,
} from '../firebase/api';
import {
  addRebound,
  addAssist,
  addFoul,
  addAttemptedShot,
  addMadeShot,
  undoLastAction,
  updateLastActions,
} from '../redux/game-reducer';
import '../css/main.css'
import PlayerSelection from './PlayerSelection';
// import { motion } from 'framer-motion';
import GameResult from './GameResults';

const GameControls = ({mode}) => {
  const dispatch = useDispatch();
  const [selectedTeam, setSelectedTeam] = useState(mode === 'game' ? 'teamA' : null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
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
    teamB: []
  });
  const navigate = useNavigate();
  
  const teamA = useSelector((state) => state.game.teamA);
  const teamB = useSelector((state) => state.game.teamB);
  const game = useSelector((state) => state.game);
  const allPlayers = useSelector(selectAllPlayers); 
  const [lastActions, setLastActions] = useState(game.actions || []);

  useEffect(() => {
    if (mode === "drill") {
      setPlayerOptionsMap({
        teamA: allPlayers,
        teamB: allPlayers
      });
    } else if (mode === "game") {
      if (!teamA || !teamB) {
        navigate('/teamselection');
      } else {
        setPlayerOptionsMap({
          teamA: Object.values(teamA.players || {}),
          teamB: Object.values(teamB.players || {}),
        });
      }
    }
  }, [mode, teamA, teamB, navigate]);

  useEffect(() => {
    const updateActions = async () => {
      try {
        await updateLastActionsApi(game, lastActions);
        dispatch(updateLastActions(lastActions));
      } catch (err) {

      }
    };

    if (teamA && teamB) {
      updateActions();
    }
  }, [lastActions, dispatch]);

  if (mode === "game" && (!teamA || !teamB)) {
    return <div className="loading">loading...</div>
  }

  const handleTeamChange = (teamValue) => {
    setSelectedTeam(teamValue);
    setSelectedPlayer(null);
  };

  const handlePlayerSelect = (player) => {
    const newPlayer = {
      id: player.id,
      number: player.number
    };
    setSelectedPlayer(newPlayer);
    setShowPlayerSelection(false);
  };

  const handleAttempt = async (points) => {
    if (attemptLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true);
    } else {
      try {
        setAttemptLoading(points);
        const type_of_game = mode === "drill" ? "drill" : "game";
        const effectivePoints = mode === "drill" ? 0 : points;
        await addAttemptedShotApi({ game, selectedTeam, playerId: selectedPlayer.id, points: effectivePoints, type_of_game });
        dispatch(addAttemptedShot({ team: selectedTeam, playerId: selectedPlayer.id, points: effectivePoints, type_of_game }));

        setLastActions(prev => [
          ...prev,
          {
            id: uuidv4(),
            action: 'addAttemptedShot',
            points: effectivePoints,
            playerId: selectedPlayer.id,
            playerNumber: selectedPlayer.number,
            team: selectedTeam,
            type_of_game
          }
        ]);
        setAttemptLoading(false);
      } catch (err) {
        console.error('Error in handleAttempt:', err);
        setAttemptLoading(false);
      }
    }
  };


  const handleMade = async (points) => {
    if (madeLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setMadeLoading(points);
        const type_of_game = mode === "drill" ? "drill" : "game";
        const effectivePoints = mode === "drill" ? 0 : points;
        await addMadeShotApi({ game, selectedTeam, playerId: selectedPlayer.id, points: effectivePoints, type_of_game });
        dispatch(addMadeShot({ team: selectedTeam, playerId: selectedPlayer.id, points: effectivePoints, type_of_game }));
        setLastActions(prev => [...prev, { id: uuidv4(), action: 'addMadeShot', points:effectivePoints, playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam, type_of_game }])
        setMadeLoading(false);
      } catch (err) {
        setMadeLoading(false);
      }
    }
  }

  const handleRebound = async (type) => {
    if (reboundLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setReboundLoading(type);
        await addReboundApi({ game, selectedTeam, playerId: selectedPlayer.id, type });
        dispatch(addRebound({ team: selectedTeam, playerId: selectedPlayer.id, type }));
        setLastActions(prev => [...prev, { id: uuidv4(), action: 'addRebound', type, playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setReboundLoading(false);
      } catch (err) {
        setReboundLoading(false);
      }
    };
  }
  const handleAssist = async () => {
    if (assistLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setAssistLoading(true);
        await addAssistApi({ game, selectedTeam, playerId: selectedPlayer.id });
        dispatch(addAssist({ team: selectedTeam, playerId: selectedPlayer.id }));
        setLastActions(prev => [...prev, { id: uuidv4(), action: 'addAssist', playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setAssistLoading(false);
      } catch (err) {
        setAssistLoading(false);
      }
    };
  }
  const handleFoul = async () => {
    if (foulLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setFoulLoading(true);
        await addFoulApi({ game, selectedTeam, playerId: selectedPlayer.id });
        dispatch(addFoul({ team: selectedTeam, playerId: selectedPlayer.id }));
        setLastActions(prev => [...prev, { id: uuidv4(), action: 'addFoul', playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setFoulLoading(false);
      } catch (err) {
        setFoulLoading(false);
      }
    };
  }
  const handleShowGameResult = () => {
    setShowGameResult(true);
  };

  const handleBackClick = () => {
    setShowGameResult(false);
  };

  const handleDeleteLastAction = async () => {
    if (undoLoading) {
      return true;
    }

    try {
      setUndoLoading(true);
      await undoLastActionApi(lastActions, game);
      dispatch(undoLastAction(lastActions));
      setLastActions(prevLastActions => {
        return prevLastActions.slice(0, -1);
      })
      setUndoLoading(false);
    } catch (err) {
      setUndoLoading(false);
    }
  };


  // const buttonText = selectedPlayer ? selectedPlayer?.number : 'Select Player';
  const playerOptions = mode === 'game' 
    ? selectedTeam === 'teamA' ? teamA.players : teamB.players
    : allPlayers;

  return (
    <div className="Controls">
      {/* Team Selection */}
      {mode === "game" && (
      <div className="flex justify-around py-4">
        <button
          className={`py-4 px-8 md:py-5 md:px-10 text-lg md:text-xl font-bold rounded-lg transition-transform duration-200 transform ${
            selectedTeam === 'teamA' ? 'bg-[#f64e07] text-white scale-110' : 'bg-gray-300 text-gray-700'
          }`}
          onClick={() => handleTeamChange('teamA')}
        >
          {teamA?.name || 'Team A'}
        </button>

        <button
          className={`py-4 px-8 md:py-5 md:px-10 text-lg md:text-xl font-bold rounded-lg transition-transform duration-200 transform ${
            selectedTeam === 'teamB' ? 'bg-[#f64e07] text-white scale-110' : 'bg-gray-300 text-gray-700'
          }`}
          onClick={() => handleTeamChange('teamB')}
        >
          {teamB?.name || 'Team B'}
        </button>
      </div>
    )}
  
      {/* Player Selection */}
      {showPlayerSelection ? (
        <PlayerSelection
        team={mode === 'game' ? selectedTeam : null} // Pass `null` or handle differently for drills
        players={mode === 'drill' ? allPlayers : playerOptionsMap[selectedTeam]} // Show all players in drill mode
        onSelect={handlePlayerSelect}
        onClose={setShowPlayerSelection}
      />
      ) : (
        <div className="flex flex-col items-center space-y-4">
          <button
            className="relative w-full sm:w-auto py-2 px-4 md:py-4 md:px-8 text-base md:text-xl font-bold text-white bg-[#0aa6d6] 
                      rounded-lg shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105 hover:rotate-2 duration-200 
                      focus:outline-none focus:ring-4 focus:ring-[#0aa6d6]"
            onClick={() => setShowPlayerSelection(true)}
          >
            <span className="absolute inset-0 bg-[#0a355e] opacity-75 blur-lg rounded-lg animate-pulse"></span>
            <span className="relative z-10">
              {selectedPlayer ? `Player #${selectedPlayer.number}` : 'Select Player'}
            </span>
          </button>
  
          {/* Drill or Game Mode Scoring Controls */}
          {mode === "drill" ? (
            <div className="flex space-x-4">
              <button
                onClick={() => handleAttempt(0)}
                disabled={attemptLoading}
                className={`py-4 px-8 text-lg font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
              >
                {attemptLoading ? "Loading..." : "Miss"}
              </button>
              <button
                onClick={() => handleMade(0)}
                disabled={madeLoading}
                className={`py-4 px-8 text-lg font-bold text-white bg-[#f64e07] rounded-lg hover:bg-orange-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
              >
                {madeLoading ? "Loading..." : "Made"}
              </button>
            </div>
          ) : (
            <div className="Remote">
              <div className="grid grid-cols-3 gap-4 text-center py-4">
                {[1, 2, 3].map((points) => (
                  <div key={points}>
                    <h3 className="font-semibold text-white">{points} Points</h3>
                    <button
                      disabled={madeLoading === points}
                      className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white 
                        ${madeLoading === points ? 'bg-gray-400' : 'bg-[#f64e07] hover:bg-orange-600'}
                        shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                      onClick={() => handleMade(points)}
                    >
                      <span className="inline-block w-8 text-center">
                        {madeLoading === points ? 'Loading...' : `+${points}`}
                      </span>
                    </button>
                    <button
                      disabled={attemptLoading === points}
                      className={`py-2 px-4 md:py-3 md:px-6 lg:py-4 lg:px-8 w-full rounded-lg font-bold text-white mt-2 
                        ${attemptLoading === points ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}
                        shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                      onClick={() => handleAttempt(points)}
                    >
                      <span className="inline-block w-8 text-center">
                        {attemptLoading === points ? 'Loading...' : 'Miss'}
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
  
          {/* Rebounds, Assists, Fouls - Shown only in Game Mode */}
          {mode === "game" && (
            <div className="addpoints flex flex-wrap justify-between items-center space-y-4 md:space-y-2 md:space-x-4">
              {/* Rebound */}
              <div className="stat flex flex-col items-center w-full md:w-1/3 space-y-2">
                <h3 className="font-semibold text-white mb-2">Rebound</h3>
                <div className="flex space-x-2">
                  <button
                    disabled={reboundLoading === 'offensive'}
                    className={`py-2 px-4 text-sm md:text-base rounded-lg font-bold text-white
                      ${reboundLoading === 'offensive' ? 'bg-gray-400' : 'bg-[#f64e07] hover:bg-orange-600'}
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleRebound('offensive')}
                  >
                    <span className="inline-block w-12 text-center">
                      {reboundLoading === 'offensive' ? 'Loading...' : 'Offense'}
                    </span>
                  </button>
  
                  <button
                    disabled={reboundLoading === 'defensive'}
                    className={`py-2 px-4 text-sm md:text-base rounded-lg font-bold text-white
                      ${reboundLoading === 'defensive' ? 'bg-gray-400' : 'bg-[#f64e07] hover:bg-orange-600'}
                      shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                    onClick={() => handleRebound('defensive')}
                  >
                    <span className="inline-block w-12 text-center">
                      {reboundLoading === 'defensive' ? 'Loading...' : 'Defense'}
                    </span>
                  </button>
                </div>
              </div>
  
              {/* Assist and Foul */}
              <div className="stat flex flex-col items-center w-full md:w-1/3 space-y-4">
                <button
                  disabled={assistLoading}
                  className={`py-2 px-6 md:py-3 md:px-8 lg:py-4 lg:px-10 w-full rounded-lg font-bold text-white
                    ${assistLoading ? 'bg-gray-400' : 'bg-[#0aa6d6] hover:bg-blue-600'}
                    shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                  onClick={handleAssist}
                >
                  <span className="inline-block w-12 text-center">
                    {assistLoading ? 'Loading...' : 'Assist'}
                  </span>
                </button>
  
                <button
                  disabled={foulLoading}
                  className={`py-2 px-6 md:py-3 md:px-8 lg:py-4 lg:px-10 w-full rounded-lg font-bold text-white
                    ${foulLoading ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'}
                    shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
                  onClick={handleFoul}
                >
                  <span className="inline-block w-12 text-center">
                    {foulLoading ? 'Loading...' : 'Foul'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
  
      {/* Last Actions Table */}
      <div className="py-4">
        <h2 className="text-lg font-bold text-[#f64e07] mb-2">Last Actions</h2>
        <table className="min-w-full table-auto bg-[#0a355e] border border-[#0aa6d6] rounded-lg">
          <thead>
            <tr className="bg-[#0aa6d6] text-white">
              <th className="py-2 px-4 border border-[#0f1e25]">Action</th>
              <th className="py-2 px-4 border border-[#0f1e25]">Points</th>
              <th className="py-2 px-4 border border-[#0f1e25]">Player #</th>
            </tr>
          </thead>
          <tbody>
            {lastActions.slice(-10).map((action) => (
              <tr key={action.id} className="bg-white text-black">
                <td className="py-2 px-4 border border-[#0aa6d6]">{action.action}</td>
                <td className="py-2 px-4 border border-[#0aa6d6]">{action.points}</td>
                <td className="py-2 px-4 border border-[#0aa6d6]">#{action.playerNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  
      {/* Undo Last Action */}
      <div className="controls flex flex-col items-center space-y-6">
        <button
          disabled={undoLoading}
          className={`py-2 px-6 w-full md:w-auto rounded-lg font-bold text-white ${
            undoLoading ? 'bg-gray-400' : 'bg-[#f64e07] hover:bg-orange-600'
          } shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105`}
          onClick={handleDeleteLastAction}
        >
          {undoLoading ? 'Loading...' : 'Undo Last Action'}
        </button>
  
        {/* Show Game Result */}
        <div className="addpoints py-8 px-6 flex justify-center">
          <button
            className="py-4 px-6 w-full md:w-auto rounded-lg font-bold text-white bg-[#0aa6d6] hover:bg-blue-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={handleShowGameResult}
          >
            {mode === "drill" ? "Drill Stats" : "Game Stats"}
          </button>
        </div>
  
        {/* Game Result Modal */}
        {showGameResult && (
          <div className="game-result-overlay fixed inset-0 flex justify-center items-center bg-black bg-opacity-80 z-50">
            <div className="game-result-container w-full max-w-4xl p-8 rounded-lg shadow-2xl bg-white text-center relative">
              <GameResult onBackClick={handleBackClick} />
              <button
                className="mt-6 py-2 px-6 rounded-lg bg-[#0aa6d6] text-white hover:bg-blue-600 shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
                onClick={handleBackClick}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );  
  
  
};

export default GameControls;
