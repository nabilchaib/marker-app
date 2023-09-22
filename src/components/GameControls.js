import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  initializeDataApi,
  addMadeShotApi,
  addAttemptedShotApi,
  addReboundApi,
  addAssistApi,
  addFoulApi,
  updateLastActionsApi,
  getLastActionsApi,
  undoLastActionApi,
} from '../firebase/api';
import {
  addRebound,
  addAssist,
  addFoul,
  addAttemptedShot,
  addMadeShot,
  undoLastAction,
  updateLastActions,
  initializeData
} from '../redux/reducer';
import '../css/main.css'
import PlayerSelection from './PlayerSelection';
import { motion } from 'framer-motion';
import GameResult from './GameResults';


const GameControls = () => {
  const dispatch = useDispatch();
  const [selectedTeam, setSelectedTeam] = useState('teamA');
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerSelection, setShowPlayerSelection] = useState(false);
  const [showGameResult, setShowGameResult] = useState(false);
  const [lastActions, setLastActions] = useState([]);
  const [userEmail, setUserEmail] = useState('');
  const [undoLoading, setUndoLoading] = useState(false);
  const [madeLoading, setMadeLoading] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [reboundLoading, setReboundLoading] = useState(false);
  const [assistLoading, setAssistLoading] = useState(false);
  const [foulLoading, setFoulLoading] = useState(false);

  const teamA = useSelector((state) => state.game.teamA);
  const teamB = useSelector((state) => state.game.teamB);

  useEffect(() => {
    const fetchData = async userEmail => {
      try {
        const teams = await initializeDataApi(userEmail);
        const lastActions = await getLastActionsApi(userEmail);
        dispatch(initializeData({ teams }));
        setLastActions(lastActions);
      } catch (err) {
        console.log('FETCH ERR: ', err);
      }
    };

    const userString = localStorage.getItem('auth');
    if (userString) {
      const user = JSON.parse(userString);
      if (user) {
        const userEmail = user.user.email;
        setUserEmail(userEmail);
        fetchData(userEmail);
      }
    }
  }, []);

  useEffect(() => {
    const updateActions = async () => {
      try {
        await updateLastActionsApi(lastActions, userEmail);
        dispatch(updateLastActions(lastActions));
      } catch (err) {

      }
    };

    if (teamA && teamB) {
      updateActions();
    }
  }, [lastActions, dispatch]);

  if (!teamA || !teamB) {
    return <div className="loading">loading...</div>
  }

  const handleTeamChange = (teamValue) => {
    setSelectedTeam(teamValue);
    setSelectedPlayer(null);
  };

  const handlePlayerChange = (e) => {
    setSelectedPlayer(JSON.parse(e.target.value));
  };

  const handlePlayerSelect = (player) => {
    const newPlayer = {
      id: player.id,
      number: player.number
    };
    setSelectedPlayer(newPlayer);
    setShowPlayerSelection(false);
  };

  const handleAttempt = async (points) => {
    if (attemptLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setAttemptLoading(points);
        const team = selectedTeam === 'teamA' ? teamA : teamB;
        await addAttemptedShotApi({ team, playerId: selectedPlayer.id, points });
        dispatch(addAttemptedShot({ team: selectedTeam, playerId: selectedPlayer.id, points }))
        setLastActions(prev => [...prev, { action: 'addAttemptedShot', points, playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setAttemptLoading(false);
      } catch (err) {
        setAttemptLoading(false);
      }
    }
  };

  const handleMade = async (points) => {
    if (madeLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setMadeLoading(points);
        const team = selectedTeam === 'teamA' ? teamA : teamB;
        await addMadeShotApi({ team, playerId: selectedPlayer.id, points });
        dispatch(addMadeShot({ team: selectedTeam, playerId: selectedPlayer.id, points }))
        setLastActions(prev => [...prev, { action: 'addMadeShot', points, playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setMadeLoading(false);
      } catch (err) {
        setMadeLoading(false);
      }
    }
  }

  const handleRebound = async (type) => {
    if (reboundLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setReboundLoading(type);
        const team = selectedTeam === 'teamA' ? teamA : teamB;
        await addReboundApi({ team, playerId: selectedPlayer.id, type });
        dispatch(addRebound({ team: selectedTeam, playerId: selectedPlayer.id, type }));
        setLastActions(prev => [...prev, { action: 'addRebound', type, playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setReboundLoading(false);
      } catch (err) {
        setReboundLoading(false);
      }
    };
  }
  const handleAssist = async () => {
    if (assistLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setAssistLoading(true);
        const team = selectedTeam === 'teamA' ? teamA : teamB;
        await addAssistApi({ team, playerId: selectedPlayer.id });
        dispatch(addAssist({ team: selectedTeam, playerId: selectedPlayer.id }));
        setLastActions(prev => [...prev, { action: 'addAssist', playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setAssistLoading(false);
      } catch (err) {
        setAssistLoading(false);
      }
    };
  }
  const handleFoul = async () => {
    if (foulLoading) {
      return false;
    }

    if (!selectedPlayer) {
      setShowPlayerSelection(true)
    } else {
      try {
        setFoulLoading(true);
        const team = selectedTeam === 'teamA' ? teamA : teamB;
        await addFoulApi({ team, playerId: selectedPlayer.id });
        dispatch(addFoul({ team: selectedTeam, playerId: selectedPlayer.id }));
        setLastActions(prev => [...prev, { action: 'addFoul', playerId: selectedPlayer.id, playerNumber: selectedPlayer.number, team: selectedTeam }])
        setFoulLoading(false);
      } catch (err) {
        setFoulLoading(false);
      }
    };
  }
  const handleShowGameResult = () => {
    setShowGameResult(true);
  };

  const handleBackClick = () => {
    setShowGameResult(false);
  };

  const handleDeleteLastAction = async () => {
    // const lastAction = lastActions.pop()
    // console.log(lastAction)
    if (undoLoading) {
      return true;
    }

    try {
      setUndoLoading(true);
      await undoLastActionApi(lastActions, { teamA, teamB });
      dispatch(undoLastAction({ lastActions }));
      setLastActions(prevLastActions => {
        return prevLastActions.slice(0, -1);
      })
      setUndoLoading(false);
    } catch (err) {
      setUndoLoading(false);
    }
  };


  const buttonText = selectedPlayer ? selectedPlayer?.number : 'Select Player';

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
            {teamA.name}
          </motion.button>

        </div>
        <div className='TeamSelector'>
          <motion.button
            whileHover={{ scale: 1.5 }}
            onClick={() => handleTeamChange('teamB')}
            animate={{ scale: selectedTeam === 'teamB' ? 1.5 : 1 }}
          >
            {teamB.name}
          </motion.button>

        </div>
      </div>

      <div>
      </div>

      {showPlayerSelection ? (
        <PlayerSelection team={selectedTeam} players={playerOptions} onSelect={handlePlayerSelect} onClose={setShowPlayerSelection} />
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
          <select className='player' id="player" value={JSON.stringify(selectedPlayer)} onChange={handlePlayerChange}>
            <option value=""></option>
            {playerOptions.map((player) => {
              const newPlayer = {
                id: player.id,
                number: player.number
              };
              return (
                <option key={newPlayer.number} value={JSON.stringify(newPlayer)}>
                  {player.name}
                </option>
              );
            })}
          </select>
        </div>
      )}

      <div className='Remote'>
        <div className='addpoints'>

          <div className='stat'> FT
            <button disabled={madeLoading} className='card-in' onClick={() => handleMade(1)}>{madeLoading === 1 ? 'Loading...' : '+ 1'}</button>
            <button disabled={attemptLoading} className='card-miss' onClick={() => handleAttempt(1)}>{attemptLoading === 1 ? 'Loading...' : 'Miss'}</button>
          </div>
          <div className='stat'> 2 pts
            <button disabled={madeLoading} className='card-in' onClick={() => handleMade(2)}>{madeLoading === 2 ? 'Loading...' : '+ 2'}</button>
            <button disabled={attemptLoading} className='card-miss' onClick={() => handleAttempt(2)}>{attemptLoading === 2 ? 'Loading...' : 'Miss'}</button>
          </div>
          <div className='stat'> 3 pts
            <button className='card-in' onClick={() => handleMade(3)}>{madeLoading === 3 ? 'Loading...' : '+ 3'}</button>
            <button className='card-miss' onClick={() => handleAttempt(3)}>{attemptLoading === 3 ? 'Loading...' : 'Miss'}</button>
          </div>
        </div>

        <div className='addpoints'>

          <div className='stat'> Rebound
            <button disabled={reboundLoading} className='card' onClick={() => handleRebound('offensive')}>{reboundLoading === 'offensive' ? 'Loading...' : 'Offense'}</button>
            <button disabled={reboundLoading} className='card' onClick={() => handleRebound('defensive')}>{reboundLoading === 'defensive' ? 'Loading...' : 'Defense'}</button>
          </div>
          <div className='stat'>
            <button disabled={foulLoading} className='card' onClick={handleFoul}>{foulLoading ? 'Loading...' : 'Foul'}</button>
          </div>
          <div className='stat'>
            <button disabled={assistLoading} className='card' onClick={handleAssist}>{assistLoading ? 'Loading...' : 'Assist'}</button>

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
                <td>#{action.playerNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button disabled={undoLoading} className='button' onClick={handleDeleteLastAction}>{undoLoading ? 'Loading...' : 'Undo last action'}</button>

      {showGameResult && <GameResult onBackClick={handleBackClick} />}

    </div>
  );
};

export default GameControls;
