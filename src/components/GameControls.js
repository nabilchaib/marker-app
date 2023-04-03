import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addRebound,
  addAssist,
  addFoul,
  addAttemptedShot,
  addMadeShot,
} from '../redux/reducer';
import '../css/main.css'
import PlayerSelection from './PlayerSelection';
import { motion } from 'framer-motion';
import GameResult from './GameResults';




const GameControls = () => {
  const dispatch = useDispatch();
  const [selectedTeam, setSelectedTeam] = useState('teamA');
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [showGameResult, setShowGameResult] = useState(false);

  const teamA = useSelector((state) => state.game.teamA);
  const teamB = useSelector((state) => state.game.teamB);

  const handleTeamChange = (teamValue) => {
    setSelectedTeam(teamValue);
    setSelectedPlayer('');
  };

  const handlePlayerChange = (e) => {
    setSelectedPlayer(e.target.value);
  };

  const handlePlayerSelect = (playerId) => {
    setSelectedPlayer(playerId);
    setShowPlayerSelection(false);
  };

  const handleAttempt = (points) => {
    dispatch(addAttemptedShot({ team: selectedTeam, playerId: selectedPlayer, points }))
  };

  const handleMade = (points) => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      dispatch(addMadeShot({ team: selectedTeam, playerId: selectedPlayer, points }))
    }
  }

  const handleRebound = (type) => {
    dispatch(addRebound({ team: selectedTeam, playerId: selectedPlayer, type }));
  };

  const handleAssist = () => {
    dispatch(addAssist({ team: selectedTeam, playerId: selectedPlayer }));
  };

  const handleFoul = () => {
    dispatch(addFoul({ team: selectedTeam, playerId: selectedPlayer }));
  };

  const handleShowGameResult = () => {
    setShowGameResult(true);
  };

  const handleBackClick = () => {
    setShowGameResult(false);
  };

  const buttonText = selectedPlayer ? selectedPlayer : 'Select Player';


  const playerOptions = selectedTeam === 'teamA' ? teamA.players : teamB.players;

  return (
    <div className='Controls'>
      <div className='displayteams'>
        <div className='TeamSelector'>
          <motion.button
            whileHover={{ scale: 1.4 }}
            onClick={() => handleTeamChange('teamA')}
            animate={{ scale: selectedTeam === 'teamA' ? 1.4 : 1 }}
          >
            TeamA
          </motion.button>

        </div>
        <div className='TeamSelector'>
        <motion.button
            whileHover={{ scale: 1.4 }}
            onClick={() => handleTeamChange('teamB')}
            animate={{ scale: selectedTeam === 'teamB' ? 1.4 : 1 }}
          >
            TeamB
          </motion.button>
          
        </div>
      </div>

      {showPlayerSelection ? (
        <PlayerSelection players={playerOptions} onSelect={handlePlayerSelect} />
      ) : (
        <div className='Selector'>
          <button className='SelectPlayer' onClick={() => setShowPlayerSelection(true)}>{buttonText}</button>
          <label htmlFor="player">Player:</label>
          <select className='player' id="player" value={selectedPlayer} onChange={handlePlayerChange}>
            <option value=""></option>
            {playerOptions.map((player) => (
              <option key={player.id} value={player.id}>
                {player.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className='Remote'>
        <div className='addpoints'>

          <div className='stat'> FT
            <button className='card' onClick={() => handleMade(1)}>+1</button>
            <button className='card-miss' onClick={() => handleAttempt(1)}>Miss</button>
          </div>
          <div className='stat'> 2 pts
            <button className='card' onClick={() => handleMade(2)}>+2</button>
            <button className='card-miss' onClick={() => handleAttempt(2)}>Miss</button>
          </div>
          <div className='stat'> 3 pts
            <button className='card' onClick={() => handleMade(3)}>+3</button>
            <button className='card-miss' onClick={() => handleAttempt(3)}>Miss</button>
          </div>
        </div>

        <div className='addpoints'>

          <div className='stat'> Rebound
            <button className='card' onClick={() => handleRebound('offensive')}>Offensive </button>
            <button className='card' onClick={() => handleRebound('defensive')}>Defensive </button>
          </div>
          <div className='stat'> Fouls
            <button className='card' onClick={handleFoul}>Foul</button>
          </div>
          <div className='stat'> Assist
            <button className='card' onClick={handleAssist}>Assist</button>

          </div>
        </div>
      </div>
      <button onClick={handleShowGameResult}>Show Game Result</button>
      {showGameResult && <GameResult onBackClick={handleBackClick}/>}

    </div>
  );
};

export default GameControls;
