import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-toastify';

import Icon from '../../components/Icon';
import { getPlayersApi } from '../../firebase/api';
import { addPlayers } from '../../redux/players-reducer';
import { resetGameCache } from '../../redux/games-reducer';
import DrillTracking from '../../components/DrillTracking';

export default function AddDrill() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getPlayersLoading, setGetPlayersLoading] = useState(false);
  const user = useSelector(state => state.user);
  const players = useSelector(state => state.players);

  const [selectedPlayer, setSelectedPlayer] = useState(null);

  // Fetch players if not already loaded
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

  const onNewPlayer = () => {
    navigate('/games/teams/players/create'); // Redirect to player creation
  };

  const onSelectPlayer = playerId => {
    setSelectedPlayer(playerId === selectedPlayer ? null : playerId);
  };

  const onStartDrill = () => {
    if (!selectedPlayer) {
      toast.error('Select a player to start the drill', {
        position: 'top-center',
      });
      return;
    }

    dispatch(resetGameCache());
    navigate('/drill/tracking', { state: { playerId: selectedPlayer } });
  };

  const selectedPlayerData = players.byId[selectedPlayer];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-base font-semibold leading-6 text-gray-900">Create a New Drill</h2>
      <p className="mt-1 text-sm text-gray-500">Choose a player to begin tracking drill attempts and completions.</p>

      <div className="mt-4 flex flex-col items-center justify-center">
        {/* Selected Player Display */}
        <div className="flex flex-col items-center mb-4">
          {!selectedPlayerData?.avatarUrl && (
            <div className="mb-2 border border-gray-300 relative inline-flex p-2 h-32 w-32 items-center justify-center rounded-full">
              <Icon type="jersey" className="mx-auto h-24 w-24 text-gray-400" />
            </div>
          )}
          {selectedPlayerData?.avatarUrl && (
            <img className="mb-2 rounded-full h-32 w-32" src={selectedPlayerData.avatarUrl} alt="Player Avatar" />
          )}
          {selectedPlayerData?.name && <div>{selectedPlayerData.name}</div>}
        </div>
      </div>

      {players.allIds.length > 0 && (
        <div className="mt-4">
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <h2 className="text-base font-semibold leading-6 text-gray-900">Select a Player</h2>
            <button
              type="button"
              className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              onClick={onNewPlayer}
            >
              <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
              New Player
            </button>
          </div>
          <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
            {players.allIds.map((playerId) => {
              const player = players.byId[playerId];
              return (
                <li
                  onClick={() => onSelectPlayer(playerId)}
                  key={player.id}
                  className={`hover:bg-orange-100 cursor-pointer ${selectedPlayer === playerId ? 'bg-orange-100' : ''}`}
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
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              onClick={onNewPlayer}
            >
              <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
              New Player
            </button>
          </div>
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
