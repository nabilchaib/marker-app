// PlayerSelection.js
import React from 'react';
import { useSelector } from 'react-redux';
import PlayerAdder from './PlayerAdder';
import { selectTeamPlayers } from './selectors/selectors';


const PlayerSelection = ({team, onSelect}) => {
    const players = useSelector((state) =>selectTeamPlayers(state, team));
    


  return (
    <div className='playerpage'>
      <div className='title'>
        <h2>Select a player:</h2>
      </div>
      <div className='playerlist'>
        {players.map((player) => (
          <div
            key={player.id}
            className='player-btn'
            onClick={() => onSelect(player.id)}>
            {player.name} #{player.id}
          </div>
        ))}
      </div>
      <PlayerAdder team={team}/>
    </div>
  );
};

export default PlayerSelection;
