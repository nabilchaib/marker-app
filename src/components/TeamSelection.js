import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from './../firebase';
import { initializeDataApi } from './../firebase/api';
import { useDispatch } from 'react-redux';
import { initializeData } from './../redux/reducer';
import { useNavigate } from 'react-router-dom';


const TeamSelectionPage = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeams, setSelectedTeams] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();



  useEffect(() => {
    const fetchTeams = async () => {
      const teamsCollection = collection(db, 'teams');
      const teamsSnapshot = await getDocs(teamsCollection);
      const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeams(teamsData);
    };
    fetchTeams();
  }, []);

const handleTeamSelection = (teamId) => {
  if (selectedTeams.length < 2) {
    const isSelected = selectedTeams.includes(teamId);
    if (isSelected) {
      setSelectedTeams(selectedTeams.filter(id => id !== teamId));
    } else {
      setSelectedTeams([...selectedTeams, teamId]);
    }
  } else if (selectedTeams.includes(teamId)) {
    setSelectedTeams(selectedTeams.filter(id => id !== teamId));
  }
};

  const handleSubmit = async (event) => {
    console.log('selectedTeams', selectedTeams);
    event.preventDefault();
    try {
      // send selected teams to the backend and UserEmail to InitializeDataApi
      const teams = await initializeDataApi( selectedTeams);
      console.log('teams', teams);
      dispatch(initializeData({ teams }));
      navigate('/teamselection');
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
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
                  checked={selectedTeams.includes(team.id)}
                  onChange={() => handleTeamSelection(team.id)}
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