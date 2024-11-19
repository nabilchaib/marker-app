import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { addPlayers } from '../../redux/players-reducer';
import { EllipsisHorizontalIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import Icon from '../../components/Icon';

export default function Players() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access players from Redux store
  const players = useSelector(state => state.players.allIds.map(id => state.players.byId[id]));

  // Fetch players from Firebase and update Redux store
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersCollection = collection(db, 'players');
        const playersSnapshot = await getDocs(playersCollection);
        const playersData = playersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch(addPlayers({ players: playersData }));
        setLoading(false);
      } catch (error) {
        setError('Failed to load players');
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [dispatch]);

  const onNewPlayer = () => {
    navigate('/games/teams/players/create'); // Redirect to player creation page
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-start">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Players</h2>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500"
          onClick={onNewPlayer}
        >
          <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
          New Player
        </button>
      </div>

      {loading ? (
        <p>Loading players...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul role="list" className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          {players.map(player => (
            <li key={player.id} className="relative flex justify-between gap-x-6 px-4 py-4 hover:bg-orange-100">
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  <a>{player.name}</a>
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {player.team ? `Team: ${player.team}` : 'No team assigned'}
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {player.position ? `Position: ${player.position}` : 'Position not specified'}
                </p>
              </div>
              <div className="flex items-center gap-x-4">
                <Menu>
                  <MenuButton as={Fragment}>
                    <EllipsisHorizontalIcon aria-hidden="true" className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  </MenuButton>
                  <MenuItems className="z-100 w-52 bg-white rounded-xl border p-1 text-sm/6 focus:outline-none">
                    <MenuItem>
                      <button className="group flex w-full items-center gap-2 py-1.5 px-3 hover:bg-gray-200">
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
