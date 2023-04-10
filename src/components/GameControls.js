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
    dispatch(undoLastAction({ lastActions }));
    setLastActions(prevLastActions => {
      console.log(prevLastActions);
      return prevLastActions.slice(0, -1);
    })
  };


  const buttonText = selectedPlayer ? selectedPlayer : 'Select Player';

  const playerOptions = selectedTeam === 'teamA' ? teamA.players : teamB.players;

  return (
    <div className='Controls'>
      <div className='displayteams'>
        <div className='TeamSelector'>
          <motion.button
            whileHover={{ scale: 1.5 }}
            onClick={() => handleTeamChange('teamA')}
            animate={{ scale: selectedTeam === 'teamA' ? 1.5 : 1 }}
          >
            TeamA
          </motion.button>

        </div>
        <div className='TeamSelector'>
          <motion.button
            whileHover={{ scale: 1.5 }}
            onClick={() => handleTeamChange('teamB')}
            animate={{ scale: selectedTeam === 'teamB' ? 1.5 : 1 }}
          >
            TeamB
          </motion.button>

        </div>
      </div>
        
      <div>
      </div>

      {showPlayerSelection ? (
        <PlayerSelection team={selectedTeam} players={playerOptions} onSelect={handlePlayerSelect} />
      ) : (
        <div className='Selector'>
          <motion.button
            className='SelectPlayer'
            whileHover={{ scale: 1.1 }}

            onClick={() => setShowPlayerSelection(true)}
          >
            <h2>
              {buttonText}
            </h2>
          </motion.button>
          <h2>Player:</h2>
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
            <button className='card-in' onClick={() => handleMade(1)}>+ 1</button>
            <button className='card-miss' onClick={() => handleAttempt(1)}>Miss</button>
          </div>
          <div className='stat'> 2 pts
            <button className='card-in' onClick={() => handleMade(2)}>+ 2</button>
            <button className='card-miss' onClick={() => handleAttempt(2)}>Miss</button>
          </div>
          <div className='stat'> 3 pts
            <button className='card-in' onClick={() => handleMade(3)}>+ 3</button>
            <button className='card-miss' onClick={() => handleAttempt(3)}>Miss</button>
          </div>
        </div>

        <div className='addpoints'>

          <div className='stat'> Rebound
            <button className='card' onClick={() => handleRebound('offensive')}>Offense </button>
            <button className='card' onClick={() => handleRebound('defensive')}>Defense </button>
          </div>
          <div className='stat'>
            <button className='card' onClick={handleFoul}>Foul</button>
          </div>
          <div className='stat'>
            <button className='card' onClick={handleAssist}>Assist</button>

          </div>
        </div>
      </div>
      <div className='addpoints'>
        <button className='card' onClick={handleShowGameResult}>Game Stats</button>
      </div>

      <div>
        <h1>Last Actions</h1>
        <table>
          <thead>
            <tr>
              <th>Action</th>
              <th>Points</th>
              <th>Player ID</th>
            </tr>
          </thead>
          <tbody>
            {lastActions.slice(-10).map((action, index) => (
              <tr key={index}>
                <td>{action.action}</td>
                <td>{action.points}</td>
                <td>#{action.playerId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className='button' onClick={handleDeleteLastAction}>Undo last action</button>

      {showGameResult && <GameResult onBackClick={handleBackClick} />}

    </div>
  );
};

export default GameControls;
