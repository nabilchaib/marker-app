import React from 'react';
import Scoreboard from './components/Scoreboard';
import GameControls from './components/GameControls';
import './css/main.css'
import BgImg from './components/Image';



const App =() => {
  return (
    <div className='App'>
      <h1> Scorer Table</h1>
      <BgImg/>
      <Scoreboard />
      <GameControls/>
    </div>
  );
}

export default App;
