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
      console.log('T: ', teamsData)
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
      // send selected teams to the backend and UserEmail to InitializeGameApi
      const { game, startNew } = await initializeGameApi(selectedTeams);
      if (startNew) {
        const newGame = await addGameApi(game);
        dispatch(initializeGame({ game: newGame }));
      } else {
        dispatch(initializeGame({ game }));
      }
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="team-selection" onSubmit={handleSubmit}>
      <div className='playerpage'>
        <div className='title'>
          <h2>Select your teams:</h2>
        </div>
        <div className='playerlist'>
          {teams.map(team => (
            <div
              key={team.id}
              className='player-btn'>
              <label>
                <input
                  type="checkbox"
                  // make the checkbox bigger
                  style={{ width: '20px', height: '20px' }}
                  checked={selectedTeams?.[0]?.id === team.id || selectedTeams?.[1]?.id === team.id}
                  onChange={() => handleTeamSelection(team)}
                />
                {team.name}
              </label>
            </div>
          ))}
        </div>
        <button type="submit">Start game</button>
      </div>
    </form>
  );
};

export default TeamSelectionPage;
