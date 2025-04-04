import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { v4 as uuid } from 'uuid';

import Icon from '../../components/Icon';
import { getPlayersApi } from '../../firebase/api';
import { addPlayers } from '../../redux/players-reducer';
import { addNewGame } from '../../redux/games-reducer';

export default function AddDrill() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getPlayersLoading, setGetPlayersLoading] = useState(false);
  const user = useSelector(state => state.user);
  const players = useSelector(state => state.players);

  const [selectedPlayers, setSelectedPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setGetPlayersLoading(true);
        const playersData = await getPlayersApi({ user });
        dispatch(addPlayers({ players: playersData }));
        setGetPlayersLoading(false);
      } catch (err) {
        console.log('FETCH PLAYERS ERR:', err);
        setGetPlayersLoading(false);
      }
    };

    if (user?.email && !players.allIds.length) {
      fetchPlayers();
    }
  }, [user?.email, players.allIds.length]);

  const onSelectPlayer = playerId => {
    setSelectedPlayers(prev => 
      prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const onStartDrill = () => {
    if (selectedPlayers.length === 0) {
      toast.error('Select at least one player to start the drill', {
        position: 'top-center',
      });
      return;
    }

    const newDrill = {
      id: uuid(),
      playerIds: selectedPlayers,
      type: 'drill',
      createdBy: user.id,
      createdOn: new Date().getTime(),
      actions: [],
      notSaved: true,
      stats: {},
    };

    dispatch(addNewGame(newDrill));
    navigate(`/games/drill/${newDrill.id}`);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-base font-semibold leading-6 text-gray-900">Create a New Drill</h2>
      <p className="mt-1 text-sm text-gray-500">Choose players to begin tracking drill attempts and completions.</p>

      {/* Selected Players Display */}
      {selectedPlayers.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedPlayers.map(playerId => {
            const player = players.byId[playerId];
            return (
              <span
                key={player.id}
                className="inline-flex items-center rounded-full bg-cyan-100 text-cyan-800 px-3 py-1 text-sm font-medium"
              >
                {player.name}
                <button
                  onClick={() => onSelectPlayer(player.id)}
                  className="ml-2 text-cyan-500 hover:text-cyan-700 focus:outline-none"
                >
                  ×
                </button>
              </span>
            );
          })}
        </div>
      )}

      {players.allIds.length > 0 && (
        <div className="mt-4">
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <h2 className="text-base font-semibold leading-6 text-gray-900">Select Players</h2>
          </div>
          <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
            {players.allIds.map((playerId) => {
              const player = players.byId[playerId];
              return (
                <li
                  onClick={() => onSelectPlayer(playerId)}
                  key={player.id}
                  className={`hover:bg-orange-100 cursor-pointer ${selectedPlayers.includes(playerId) ? 'bg-orange-100' : ''}`}
                >
                  <div className="group flex items-center p-4">
                    <div className="mr-3">
                      {player.avatarUrl ? (
                        <img className="rounded-full h-10 w-10" src={player.avatarUrl} alt="Player Avatar" />
                      ) : (
                        <span className="border border-gray-300 relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-full">
                          <Icon type="jersey" className="mx-auto h-6 w-6 text-gray-400" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-gray-900">{player.name}</div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {players.allIds.length <= 0 && (
        <div className="mt-4 border text-center rounded-md p-6">
          <Icon type="jersey" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No players</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new player.</p>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          className="w-full sm:w-auto inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          onClick={onStartDrill}
        >
          Start Drill
        </button>
      </div>
    </div>
  );
}