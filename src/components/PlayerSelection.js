import '../css/main.css'

const PlayerSelection = ({ players, onSelect }) => {
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
                        onClick={() => onSelect(player.id)}>{player.name}
                    </div>

                ))}
            </div>
        </div>
    );
};

export default PlayerSelection;
