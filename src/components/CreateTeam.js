import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { addDoc, collection } from 'firebase/firestore';

const CreateTeamPage = () => {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(['']);
  const navigate = useNavigate();

  const handlePlayerChange = (index, value) => {
    const updatedPlayers = [...players];
    updatedPlayers[index] = value;
    setPlayers(updatedPlayers);
  };

  const addPlayerInput = () => {
    setPlayers([...players, '']);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (teamName && players.length > 0) {
      try {
        const teamRef = collection(db, 'teams');
        await addDoc(teamRef, { name: teamName, players });
        navigate('/teamselection');
      } catch (error) {
        console.error('Error creating team:', error);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create a New Team</h2>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Team Name:</label>
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            required
            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-600 mb-1">Players:</label>
          {players.map((player, index) => (
            <input
              key={index}
              type="text"
              placeholder={`Player ${index + 1}`}
              value={player}
              onChange={(e) => handlePlayerChange(index, e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ))}
          <button
            type="button"
            onClick={addPlayerInput}
            className="bg-green-500 text-white p-2 rounded mt-2 w-full hover:bg-green-600"
          >
            Add Player
          </button>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Team
        </button>
      </form>
    </div>
  );
};

export default CreateTeamPage;
