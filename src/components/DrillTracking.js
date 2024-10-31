import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import GameControls from './GameControls'; 
import BgImg from './BackgroundImage';
import { useDispatch } from 'react-redux';
import { addMadeShot, addAttemptedShot } from '../redux/game-reducer';
import { addPlayerStatsApi, updatePlayerStatsApi } from '../firebase/api';

const DrillTracking = () => {
  const location = useLocation();
  const playerId = location.state?.playerId;
  const playerName = location.state?.playerName || "Unknown Player";
  const dispatch = useDispatch();
  const [attempts, setAttempts] = useState(0);
  const [completions, setCompletions] = useState(0);
  const [playerStatsId, setPlayerStatsId] = useState(null); // Store the player_stats document ID

  useEffect(() => {
    if (!playerId) return;

    // Initialize a new player_stats document for this drill session
    const initializeStats = async () => {
      const statsId = await addPlayerStatsApi(playerId, new Date().toISOString(), "drill");
      setPlayerStatsId(statsId);
    };
    initializeStats();
  }, [playerId]);

  const handleMade = () => {
    setAttempts(attempts + 1);
    setCompletions(completions + 1);
    dispatch(addMadeShot({ playerId, type_of_game: "drill" }));

    if (playerStatsId) {
      updatePlayerStatsApi(playerStatsId, { shots_made: completions + 1 });
    }
  };

  const handleMissed = () => {
    setAttempts(attempts + 1);
    dispatch(addAttemptedShot({ playerId, type_of_game: "drill" }));

    if (playerStatsId) {
      updatePlayerStatsApi(playerStatsId, { shots_attempted: attempts + 1 });
    }
  };

  return (
    <div className="drill-tracking p-4 opacity-95 sm:p-6 lg:p-8 bg-gray-50 rounded-lg shadow-md">
      <BgImg />
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Drill Tracking for {playerName}</h2>

      <div className="flex flex-col md:flex-row md:space-x-8 mb-4">
        {/* Display Attempts, Completions, and Success Rate */}
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Attempts</h3>
          <p className="text-3xl font-bold text-orange-600">{attempts}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Completions</h3>
          <p className="text-3xl font-bold text-green-500">{completions}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md w-full md:w-1/3 text-center">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Success Rate</h3>
          <p className="text-3xl font-bold text-blue-600">
            {attempts > 0 ? `${((completions / attempts) * 100).toFixed(2)}%` : '0%'}
          </p>
        </div>
      </div>

      {/* Game Controls with drill-specific mode */}
      <GameControls 
        mode="drill" 
        onMade={handleMade} 
        onMissed={handleMissed} 
      />

      {/* Action Log */}
      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Action Log</h3>
        <div className="bg-white rounded-lg shadow-md p-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Action</th>
                <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Points</th>
              </tr>
            </thead>
            <tbody>
              {/* This example row can be dynamically rendered from a real action log */}
              <tr className="bg-white border-b">
                <td className="py-3 px-6 text-sm text-gray-900">Attempted Shot</td>
                <td className="py-3 px-6 text-sm text-gray-900">0</td>
              </tr>
              <tr className="bg-gray-50 border-b">
                <td className="py-3 px-6 text-sm text-gray-900">Made Shot</td>
                <td className="py-3 px-6 text-sm text-gray-900">2</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DrillTracking;
