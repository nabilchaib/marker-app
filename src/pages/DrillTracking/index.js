import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom'
import GameControls from '../../components/GameControls';
import BgImg from '../../components/BackgroundImage';

const DrillTracking = () => {
  const { id: currentGameId } = useParams();
  const currentGame = useSelector(state => state.games.byId[currentGameId]) || {};
  const players = useSelector(state => state.players.byId);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);

  useEffect(() => {
    if (currentGame?.playerIds) {
      const initialPlayers = currentGame.playerIds
        .map(id => players[id])
        .filter(player => player);
      setSelectedPlayers(initialPlayers);
      // Set the first player as current player
      if (initialPlayers.length > 0) {
        setCurrentPlayer(initialPlayers[0]);
      }
    }
  }, [currentGame?.playerIds, players]);

  if (!currentGame) {
    return <Navigate to="/games" />
  }

  const handlePlayerSelect = (player) => {
    setCurrentPlayer(player);
  };

  const totalStats = selectedPlayers.reduce((acc, player) => {
    const playerStats = currentGame?.stats?.[player.id] || { completions: 0, attempts: 0 };
    return {
      completions: acc.completions + playerStats.completions,
      attempts: acc.attempts + playerStats.attempts
    };
  }, { completions: 0, attempts: 0 });

  const successRate = totalStats.attempts === 0 ? 0 : 
    ((totalStats.completions / totalStats.attempts) * 100).toFixed(1);

  return (
    <div className="DrillTracking flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-black bg-opacity-50 rounded-lg shadow-xl text-white">
      <BgImg />
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f64e07] to-[#0aa6d6] tracking-wider text-center">
        Drill Tracking
      </h2>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2 mt-4 w-full sm:max-w-lg lg:max-w-3xl">
        <div className="flex flex-col items-center space-y-1 bg-gray-800 bg-opacity-90 py-2 px-4 rounded-lg shadow-md">
          <h3 className="text-sm sm:text-base font-semibold tracking-wide text-center">Total Attempts</h3>
          <div className="text-3xl sm:text-4xl font-extrabold text-orange-600">{totalStats.attempts}</div>
        </div>

        <div className="flex flex-col items-center space-y-1 bg-gray-800 bg-opacity-90 py-2 px-4 rounded-lg shadow-md">
          <h3 className="text-sm sm:text-base font-semibold tracking-wide text-center">Total Completions</h3>
          <div className="text-3xl sm:text-4xl font-extrabold text-green-500">{totalStats.completions}</div>
        </div>

        <div className="flex flex-col items-center space-y-1 bg-gray-800 bg-opacity-90 py-2 px-4 rounded-lg shadow-md">
          <h3 className="text-sm sm:text-base font-semibold tracking-wide text-center">Success Rate</h3>
          <div className="text-3xl sm:text-4xl font-extrabold text-blue-600">{successRate}%</div>
        </div>
      </div>

      {/* Selected Players Section */}
      <div className="mt-6 flex flex-col items-center w-full">
        <h3 className="text-lg font-semibold mb-2">Selected Players</h3>
        <div className="flex flex-wrap gap-2">
          {selectedPlayers.map(player => (
            <span
              key={player.id}
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                currentPlayer?.id === player.id
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-cyan-100 text-cyan-800'
              }`}
            >
              {player.name}
            </span>
          ))}
        </div>
      </div>

      {/* Game Controls Section */}
      <div className="mt-6 flex flex-col items-center w-full">
        <GameControls 
          mode="drill" 
          currentPlayer={currentPlayer}
          currentGameId={currentGame.id} 
          selectedPlayers={selectedPlayers}
          onPlayerSelect={handlePlayerSelect}
        />
      </div>
    </div>
  );
};

export default DrillTracking;
