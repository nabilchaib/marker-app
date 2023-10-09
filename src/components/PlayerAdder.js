import React, { useState } from 'react';
import { addPlayer } from '../redux/reducer';
import { useDispatch, useSelector } from 'react-redux';
import {
  addPlayerApi
} from '../firebase/api';
import '../css/main.css'


const PlayerAdder = ({ team }) => {
  const dispatch = useDispatch();
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [error, setError] = useState('');
  const game = useSelector((state) => state.game);

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    try {
      if (playerName && playerNumber) {
        const stats = {
          points: {
            attempted: [0, 0, 0, 0],
            made: [0, 0, 0, 0]
          },
          rebounds: {
            offensive: 0,
            defensive: 0
          },
          assists: 0,
          fouls: 0
        };
        const teamData = game[team];
        const { player } = await addPlayerApi({ team: teamData, player: { name: playerName, number: playerNumber, stats: JSON.stringify(stats), team: teamData.id } });
        dispatch(addPlayer({ team, player }));
        setError('');
        setPlayerName('');
        setPlayerNumber('');
      } else {
        throw 'empty fields';
      }
    } catch (err) {
      if (err === 'number exists already') {
        setError('This number is already taken');
      }

      if (err === 'empty fields') {
        setError('Please enter a player name and player number');
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleAddPlayer} className='player-form'>
        <div>
          <label htmlFor='playerName'>Player Name: </label>
          <input
            type='text'
            id='playerName'
            placeholder='Enter player name'
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
        </div>
        <div className="player-number-container">
          <label htmlFor='playerNumber'>Player Number: </label>
          <input
            type='number'
            id='playerNumber'
            placeholder='Enter player Number'
            value={playerNumber}
            onChange={(e) => setPlayerNumber(e.target.value)}
            required
          />
        </div>
        <button className="player-adder-button" type='submit'>Add Player</button>
      </form>
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default PlayerAdder;
