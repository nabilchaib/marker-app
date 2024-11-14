import React from 'react';
import PlayerAdder from './PlayerAdder';

const PlayerSelection = ({ mode, team, players, onSelect, onClose, }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      {/* Modal Container */}
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        
        {/* Close Button */}
        <button
          className="absolute top-2 right-4 text-gray-600 hover:text-red-500 text-2xl font-bold focus:outline-none"
          onClick={() => onClose(false)}
        >
          &times;
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-[#f64e07]">
            {mode === 'drill' ? 'Select a Player for Drill' : 'Select a Player'}
          </h2>
        </div>

        {/* Player List */}
        <div className="grid grid-cols-2 gap-4">
          {players.map((player) => (
            <button
              key={player.id}
              className="py-3 px-4 text-lg font-bold text-white bg-[#0aa6d6] rounded-lg shadow-lg 
                         hover:bg-[#0a87b1] transition-all focus:outline-none focus:ring-4 focus:ring-[#0aa6d6]"
              onClick={() => onSelect(player)}
            >
              #{player.number} - {player.name}
            </button>
          ))}
        </div>

        {/* Add New Player (Only show in game mode) */}
        {mode === 'game' && (
          <div className="mt-6">
            <PlayerAdder team={team} />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerSelection;
