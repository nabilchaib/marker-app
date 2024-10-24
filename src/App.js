import React, { useState } from 'react';
import Scoreboard from './components/Scoreboard';
import GameControls from './components/GameControls';
import './css/main.css'
import BgImg from './components/BackgroundImage';

const App =() => {
  const [selectedTeams, setSelectedTeams] = useState([]);

  const handleTeamSelection = (teams) => {
    setSelectedTeams(teams);
  };
  return (
    <div>
        <div>
           <div className='App'>
            {/* <h1> Scorer Table</h1> */}
            <BgImg/>
            <Scoreboard />
            <GameControls/>
           </div>
      </div>

    </div>
  );
};

export default App;
