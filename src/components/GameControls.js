import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  addRebound,
  addAssist,
  addFoul,
  addAttemptedShot,
  addMadeShot,
  undoLastAction,
  updateLastActions
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
  const [lastActions, setLastActions] = useState([]);


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
    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else 
    dispatch(addAttemptedShot({ team: selectedTeam, playerId: selectedPlayer, points }))
    setLastActions([...lastActions, { action: 'addAttemptedShot', points, playerId: selectedPlayer, team: selectedTeam }])
  };

  const handleMade = (points) => {
    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      dispatch(addMadeShot({ team: selectedTeam, playerId: selectedPlayer, points }))
      setLastActions([...lastActions, { action: 'addMadeShot', points, playerId: selectedPlayer, team: selectedTeam }])
    }
  }

  const handleRebound = (type) => {
    dispatch(addRebound({ team: selectedTeam, playerId: selectedPlayer, type }));
    setLastActions([...lastActions, { action: 'addRebound', type, playerId: selectedPlayer, team: selectedTeam }])
  };

  const handleAssist = () => {
    dispatch(addAssist({ team: selectedTeam, playerId: selectedPlayer }));
    setLastActions([...lastActions, { action: 'addAssist', playerId: selectedPlayer, team: selectedTeam }])

  };

  const handleFoul = () => {
    dispatch(addFoul({ team: selectedTeam, playerId: selectedPlayer }));
    setLastActions([...lastActions, { action: 'addFoul', playerId: selectedPlayer, team: selectedTeam }])

  };

  const handleShowGameResult = () => {
    setShowGameResult(true);
  };

  const handleBackClick = () => {
    setShowGameResult(false);
  };

  useEffect(() => {
    dispatch(updateLastActions(lastActions));
  }, [lastActions, dispatch]);  


  const handleDeleteLastAction = () => {
    // const lastAction = lastActions.pop()
    // console.log(lastAction)
    dispatch(undoLastAction({lastActions}));
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
          <motion.button
            className='SelectPlayer'
            whileHover={{ scale: 1.1 }}

            onClick={() => setShowPlayerSelection(true)}
          >
            {buttonText}
          </motion.button>
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

      <div>
        <h1>Last Actions</h1>
        <ul>
          {lastActions.slice(-3).map((action, index) => (
            <li className='title' key={index}>
              {action.action} - {action.points} points by #{action.selectedPlayer}
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleDeleteLastAction}>Undo last action</button>

      <div className='addpoints'>
        <button className='card' onClick={handleShowGameResult}>Game Stats</button>
      </div>
      {showGameResult && <GameResult onBackClick={handleBackClick} />}

    </div>
  );
};

export default GameControls;
