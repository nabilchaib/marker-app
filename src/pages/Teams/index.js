import React, { useEffect, useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addTeams, resetTeamCache } from '../../redux/teams-reducer';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { EllipsisHorizontalIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid';
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import Icon from '../../components/Icon';

export default function Teams() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Access teams from Redux store
  const teams = useSelector(state => state.teams.allIds.map(id => state.teams.byId[id]));

  // Fetch teams from Firebase and update Redux store
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsCollection = collection(db, 'teams');
        const teamsSnapshot = await getDocs(teamsCollection);
        const teamsData = teamsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        dispatch(addTeams({ teams: teamsData }));
        setLoading(false);
      } catch (error) {
        setError('Failed to load teams');
        setLoading(false);
      }
    };

    fetchTeams();
  }, [dispatch]);

  const onNewTeam = () => {
    dispatch(resetTeamCache());
    navigate('/games/teams/create');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-start">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Teams</h2>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500"
          onClick={onNewTeam}
        >
          <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
          New Team
        </button>
      </div>

      {loading ? (
        <p>Loading teams...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul role="list" className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
          {teams.map((team) => (
            <li key={team.id} className="relative flex justify-between gap-x-6 px-4 py-4 hover:bg-orange-100">
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  <a>{team.name}</a>
                </p>
                <p className="mt-1 text-xs leading-5 text-gray-500">Created at: {team.createdAt}</p>
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
