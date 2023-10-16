import React, { useState } from 'react';
import TeamSelectionPage from './components/TeamSelection';
import Scoreboard from './components/Scoreboard';
import GameControls from './components/GameControls';
import './css/main.css'
import BgImg from './components/Image';

const App =() => {
  const [selectedTeams, setSelectedTeams] = useState([]);
  
  const handleTeamSelection = (teams) => {
    setSelectedTeams(teams);
  };
  return (
    <div>
        <div>          
           <div className='App'>
            <h1> Scorer Table</h1>
            <BgImg/>
            <Scoreboard />
            <GameControls/>
           </div>
      </div>
      
    </div>  
  );
};

export default App;