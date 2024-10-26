import React, { useState } from 'react';
import { addPlayer } from '../redux/game-reducer';
import { useDispatch, useSelector } from 'react-redux';
import { addPlayerApi } from '../firebase/api';

const PlayerAdder = ({ team }) => {
  const dispatch = useDispatch();
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [error, setError] = useState('');
  const game = useSelector((state) => state.game);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      if (playerName && playerNumber) {
        const teamData = game[team];
        const { player } = await addPlayerApi({
          game,
          selectedTeam: team,
          team: teamData,
          player: { name: playerName, number: playerNumber, team: teamData.id },
        });
        dispatch(addPlayer({ team, player }));
        setError('');
        setPlayerName('');
        setPlayerNumber('');
      } else {
        throw 'empty fields';
      }
    } catch (err) {
      if (err === 'number exists already') {
        setError('This number is already taken');
      }

      if (err === 'empty fields') {
        setError('Please enter a player name and player number');
      }
    }
  };

  return (
    <div className="mt-4">
      <form onSubmit={handleAddPlayer} className="flex flex-col space-y-4">
        {/* Player Name */}
        <div className="flex flex-col">
          <label htmlFor="playerName" className="text-sm font-semibold text-gray-700 mb-2">
            Player Name:
          </label>
          <input
            type="text"
            id="playerName"
            placeholder="Enter player name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
            className="py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0aa6d6] focus:border-transparent"
          />
        </div>

        {/* Player Number */}
        <div className="flex flex-col">
          <label htmlFor="playerNumber" className="text-sm font-semibold text-gray-700 mb-2">
            Player Number:
          </label>
          <input
            type="number"
            id="playerNumber"
            placeholder="Enter player number"
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
            required
            className="py-2 px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0aa6d6] focus:border-transparent"
          />
        </div>

        {/* Add Player Button */}
        <button
          type="submit"
          className="py-3 px-6 bg-[#f64e07] text-white rounded-lg shadow-lg hover:bg-orange-600 transition-all focus:outline-none focus:ring-4 focus:ring-[#f64e07]"
        >
          Add Player
        </button>
      </form>

      {/* Error Message */}
      {error && (
        <div className="mt-4 text-sm text-red-500 font-semibold">
          {error}
        </div>
      )}
    </div>
  );
};

export default PlayerAdder;
