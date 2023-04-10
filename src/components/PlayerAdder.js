import React, { useState } from 'react';
import { addPlayer } from '../redux/reducer';
import { useDispatch } from 'react-redux';
import '../css/main.css'


const PlayerAdder = ({ team }) => {
  const dispatch = useDispatch();
  const [playerName, setPlayerName] = useState('');
  const [playerId, setPlayerId] = useState('');

  const handleAddPlayer = () => {
    dispatch(addPlayer({ team, player: { name: playerName, id: playerId } }));
    setPlayerName('');
    setPlayerId('');
  };

  return (
    <div>
      <form onSubmit={handleAddPlayer} className='player-form'>
        <div>
          <label htmlFor='playerName'>Player Name:</label>
          <input
            type='text'
            id='playerName'
            placeholder='Enter player name'
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor='playerId'>Player ID:</label>
          <input
            type='number'
            id='playerId'
            placeholder='Enter player ID'
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            required
          />
        </div>
        <button type='submit'>Add Player</button>
      </form>
    </div>
  );
};

export default PlayerAdder;
