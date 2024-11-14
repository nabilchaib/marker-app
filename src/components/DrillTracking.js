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
  const successRate = attempts > 0 ? ((completions / attempts) * 100).toFixed(2) : '0';

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
    <div className="DrillTracking flex flex-col items-center w-4/5 justify-center space-y-6 p-6 bg-black bg-opacity-50 rounded-lg shadow-xl text-white">
      <BgImg />
      <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f64e07] to-[#0aa6d6] tracking-wider relative">
        Drill Tracking for {selectedPlayer ? selectedPlayer.name : 'Unknown Player'}
      </h2>

      <div className="flex flex-row justify-around w-full max-w-lg items-center space-x-4">
        <div className="flex flex-col items-center space-y-2 bg-gray-800 bg-opacity-90 py-4 px-6 rounded-lg shadow-md w-full sm:w-1/3">
          <h3 className="text-lg font-semibold tracking-widest text-center">Attempts</h3>
          <div className="text-5xl font-extrabold text-orange-600">{attempts}</div>
        </div>
        <div className="w-px h-16 mx-4 bg-gradient-to-b from-[#f64e07] to-[#0aa6d6] opacity-80"></div>
        <div className="flex flex-col items-center space-y-2 bg-gray-800 bg-opacity-90 py-4 px-6 rounded-lg shadow-md w-full sm:w-1/3">
          <h3 className="text-lg font-semibold tracking-widest text-center">Completions</h3>
          <div className="text-5xl font-extrabold text-green-500">{completions}</div>
        </div>
        <div className="w-px h-16 mx-4 bg-gradient-to-b from-[#f64e07] to-[#0aa6d6] opacity-80"></div>
        <div className="flex flex-col items-center space-y-2 bg-gray-800 bg-opacity-90 py-4 px-6 rounded-lg shadow-md w-full sm:w-1/3">
          <h3 className="text-lg font-semibold tracking-widest text-center">Success Rate</h3>
          <div className="text-5xl font-extrabold text-blue-600">{successRate}%</div>
        </div>
      </div>

      <GameControls mode="drill" onMade={handleMade} onMissed={handleMissed} />

      <div className="mt-6 bg-white rounded-lg shadow-md p-4 w-full max-w-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Action Log</h3>
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
  );
};

export default DrillTracking;
