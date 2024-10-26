import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from './../firebase';
import { addGameApi, initializeGameApi } from './../firebase/api';
import { useDispatch, useSelector } from 'react-redux';
import { initializeGame } from './../redux/game-reducer';
import { useNavigate } from 'react-router-dom';

const TeamSelectionPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const state = useSelector(state => state);
  console.log('MAP: ', state)

  useEffect(() => {
    const fetchTeams = async () => {
      const teamsCollection = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsCollection);
      const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('T: ', teamsData);
      setTeams(teamsData);
    };
    fetchTeams();
  }, []);

  const handleTeamSelection = (team) => {
    const alreadySelectedTeams = selectedTeams.filter(t => t.id === team.id);
    if (alreadySelectedTeams.length > 0) {
      setSelectedTeams(prev => prev.filter(t => t.id !== team.id));
    } else if (selectedTeams.length < 2) {
      setSelectedTeams(prev => [...prev, team]);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const { game, startNew } = await initializeGameApi(selectedTeams);
      if (startNew) {
        const newGame = await addGameApi(game);
        dispatch(initializeGame({ game: newGame }));
      } else {
        dispatch(initializeGame({ game }));
      }
      navigate('/start-game');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col items-center p-4">
      <h1 className="text-3xl font-semibold mb-8">Select Your Teams</h1>
      <div className="grid grid-cols-2 gap-4 w-full md:w-2/3 lg:w-1/2">
        {teams.map(team => (
          <div
            key={team.id}
            onClick={() => handleTeamSelection(team)}
            className={`p-4 rounded-lg cursor-pointer border-2
              ${selectedTeams.find(t => t.id === team.id) ? 'bg-blue-500 border-blue-700' : 'bg-gray-800 border-gray-700'} transition transform hover:scale-105`}>
            <h2 className="text-lg font-bold">{team.name}</h2>
            <p className="text-sm">{team.players.length} players</p>
          </div>
        ))}
      </div>
      <div className="flex space-x-4 mt-8">
        <button
          onClick={() => navigate('/createteam')}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
          Create New Team
        </button>
        <button
          onClick={handleSubmit}
          className={`bg-green-500 text-white py-2 px-4 rounded-lg ${selectedTeams.length === 2 ? 'hover:bg-green-600' : 'opacity-50 cursor-not-allowed'}`}
          disabled={selectedTeams.length !== 2}>
          Start Game
        </button>
      </div>
    </div>
  );
};

export default TeamSelectionPage;
