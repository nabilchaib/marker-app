import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import GameControls from './GameControls';
import { selectAllPlayers } from './selectors/selectors';
import { addMadeShot, addAttemptedShot, initializeGame } from '../redux/game-reducer';
import { addGameApi, updatePlayerStatsApi } from '../firebase/api';
import BgImg from './BackgroundImage';

const DrillTracking = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const playerId = location.state?.playerId;

  // Get selected player and game state
  const allPlayers = useSelector(selectAllPlayers);
  const selectedPlayer = allPlayers.find(player => player.id === playerId);
  const game = useSelector(state => state.game);

  const attempts = game?.players?.[selectedPlayer?.id]?.stats?.drill_attempts || 0;
  const completions = game?.players?.[selectedPlayer?.id]?.stats?.drill_made || 0;
  const successRate = attempts > 0 ? ((completions / attempts) * 100).toFixed(1) : '0';

  useEffect(() => {
    if (!selectedPlayer?.id) return;

    const initializeDrill = async () => {
      try {
        const newGame = {
          playerId: selectedPlayer.id,
          type_of_game: 'drill',
          actions: [],
          players: {
            [selectedPlayer.id]: {
              id: selectedPlayer.id,
              stats: {
                drill_attempts: 0,
                drill_made: 0,
              }
            }
          }
        };
        const createdGame = await addGameApi(newGame);

        if (createdGame?.id) {
          dispatch(initializeGame({ game: createdGame }));
        }
      } catch (err) {
        console.error('Failed to initialize drill:', err);
      }
    };

    initializeDrill();
  }, [selectedPlayer, dispatch]);

  const handleMade = async () => {
    dispatch(addMadeShot({ playerId: selectedPlayer.id, type_of_game: 'drill' }));

    if (game.id) {
      try {
        await updatePlayerStatsApi(game.id, { shots_made: completions + 1 });
      } catch (err) {
        console.error('Failed to update stats for made shot:', err);
      }
    }
  };

  const handleMissed = async () => {
    dispatch(addAttemptedShot({ playerId: selectedPlayer.id, type_of_game: 'drill' }));

    if (game.id) {
      try {
        await updatePlayerStatsApi(game.id, { shots_attempted: attempts + 1 });
      } catch (err) {
        console.error('Failed to update stats for missed shot:', err);
      }
    }
  };

  return (
  <div className="DrillTracking flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 bg-black bg-opacity-50 rounded-lg shadow-xl text-white">
    <BgImg />
    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f64e07] to-[#0aa6d6] tracking-wider text-center">
      Drill Tracking for {selectedPlayer ? selectedPlayer.name : 'Unknown Player'}
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
      <GameControls mode="drill" onMade={handleMade} onMissed={handleMissed} />
    </div>

    {/* Action Log Section */}
    <div className="mt-6 bg-white rounded-lg shadow-md p-4 w-full max-w-xl">
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">Action Log</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Action</th>
              <th className="py-3 px-6 text-left text-sm font-semibold text-gray-700">Points</th>
            </tr>
          </thead>
          <tbody>
            {/* Render action log rows dynamically if needed */}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);
  
};

export default DrillTracking;
