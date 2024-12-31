import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useParams } from 'react-router-dom'
import GameControls from '../../components/GameControls';
import BgImg from '../../components/BackgroundImage';

const DrillTracking = () => {
  const { id: currentGameId } = useParams();
  const currentGame = useSelector(state => state.games.byId[currentGameId]) || {};
  const { playerId } = currentGame;
  const player = useSelector(state => state.players.byId[playerId]);
  const { completions = 0, attempts = 0 } = currentGame?.stats?.[playerId] || {};
  const successRate = attempts === 0 ? 0 : ((completions / attempts) * 100).toFixed(1);

  if (!currentGame) {
    return <Navigate to="/games" />
  }

  return (
  <div className="DrillTracking flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-black bg-opacity-50 rounded-lg shadow-xl text-white">
    <BgImg />
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f64e07] to-[#0aa6d6] tracking-wider text-center">
      Drill Tracking for {player.name}
    </h2>

    {/* Stats Section */}
    <div className="grid grid-cols-3 gap-2 mt-4 w-full sm:max-w-lg lg:max-w-3xl">
      <div className="flex flex-col items-center space-y-1 bg-gray-800 bg-opacity-90 py-2 px-4 rounded-lg shadow-md">
        <h3 className="text-sm sm:text-base font-semibold tracking-wide text-center">Attempts</h3>
        <div className="text-3xl sm:text-4xl font-extrabold text-orange-600">{attempts}</div>
      </div>

      <div className="flex flex-col items-center space-y-1 bg-gray-800 bg-opacity-90 py-2 px-4 rounded-lg shadow-md">
        <h3 className="text-sm sm:text-base font-semibold tracking-wide text-center">Completions</h3>
        <div className="text-3xl sm:text-4xl font-extrabold text-green-500">{completions}</div>
      </div>

      <div className="flex flex-col items-center space-y-1 bg-gray-800 bg-opacity-90 py-2 px-4 rounded-lg shadow-md">
        <h3 className="text-sm sm:text-base font-semibold tracking-wide text-center">Success Rate</h3>
        <div className="text-3xl sm:text-4xl font-extrabold text-blue-600">{successRate}%</div>
      </div>
    </div>

    {/* Game Controls Section */}
    <div className="mt-6 flex flex-col items-center w-full">
      <GameControls mode="drill" currentPlayer={player} currentGameId={currentGame.id} />
    </div>
  </div>
);

};

export default DrillTracking;
