import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addPlayer } from '../redux/reducer';
import { selectTeamPlayers } from './selectors/selectors';


const PlayerSelector = ({ team }) => {
  const players = useSelector((state) => selectTeamPlayers(state, team));
  const dispatch = useDispatch();
  const [playerName, setPlayerName] = useState('');

  const handleAddPlayer = () => {
    if (playerName.trim() !== '') {
      dispatch(addPlayer({ team, player: { name: playerName } }));
      setPlayerName('');
    }
  };

  return (
    <div>
      <ul>
        {players.map((player) => (
          <li key={player.id}>{player.name}</li>
        ))}
      </ul>
      {players.length === 0 && <p>Please add a player to this team</p>}
      <input
        type="text"
        value={playerName}
        onChange={(e) => setPlayerName(e.target.value)}
        placeholder="Player Name"
      />
      <button onClick={handleAddPlayer}>Add Player</button>
    </div>
  );
};

export default PlayerSelector;
