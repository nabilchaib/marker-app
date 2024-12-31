import React, { useEffect, useState, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/solid';

import { getPlayersApi, deletePlayerApi } from '../../firebase/api';
import { addPlayers, addPlayerCache, deletePlayer } from '../../redux/players-reducer';
import Icon from '../../components/Icon';
import List from '../../components/List';
import Dialog from '../../components/Dialog';

export default function Players() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getPlayersLoading, setGetPlayersLoading] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [deletePlayerLoading, setDeletePlayerLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const user = useSelector(state => state.user);
  const players = useSelector(state => state.players);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setGetPlayersLoading(true);
        const players = await getPlayersApi({ user });
        dispatch(addPlayers({ players }));
        setGetPlayersLoading(false);
      } catch (err) {
        console.log('FETCH PLAYERS ERR: ', err);
        setGetPlayersLoading(false);
      }
    };

    if (user?.email && players.allIds.length <= 0) {
      fetchPlayers();
    }
  }, [user?.email]);

  const onCloseModal = () => {
    setPlayerToDelete(null);
    setModalOpen(false);
  };

  const onEditPlayer = (player) => {
    dispatch(addPlayerCache({ player }));
    navigate('/players/edit')
  };

  const onDeletePlayer = (player) => {
    setPlayerToDelete(player);
    setModalOpen(true);
  };

  const onDeletePlayerConfirm = async () => {
    try {
      setDeletePlayerLoading(true);
      await deletePlayerApi({ player: playerToDelete });
      dispatch(deletePlayer({ player: playerToDelete }));
      setDeletePlayerLoading(false);
      onCloseModal();
    } catch (err) {
      setDeletePlayerLoading(false);
      console.log('DELETE PLAYER ERR: ', err)
    }
  };

  const onNewPlayer = () => {
    navigate('/players/create');
  };

  const renderListItem = useCallback(
    ({ item }) => {
      return (
        <div className="w-full group flex items-center p-4 pr-10 focus-visible:outline-orange-600">
          <div className="mr-3">
            {item.avatarUrl && (
              <img className="rounded-full h-10 w-10" src={item.avatarUrl} />
            )}
            {!item.avatarUrl && (
              <span className="border border-gray-300 relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-full">
                <Icon type="jersey" className="mx-auto h-6 w-6 text-gray-400" />
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1 flex justify-between items-center">
            <div className="flex items-center">
              <p className="mr-3 text-sm text-gray-500">#{item.number}</p>
              <div className="text-sm font-medium text-gray-900">
                <a>
                  {item.name}
                </a>
              </div>
            </div>
          </div>
        </div>
      );
    },
    []
  );

  const dropdownItems = [
    { text: 'Delete', icon: TrashIcon, onClick: onDeletePlayer },
    { text: 'Edit', icon: PencilIcon, onClick: onEditPlayer },
  ];

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


      {!getPlayersLoading && players.allIds.length > 0 && (
        <div className="mt-4">
          <List items={players} dropdownItems={dropdownItems}>
            {renderListItem}
          </List>
        </div>
      )}
      {!getPlayersLoading && players.allIds.length <= 0 && (
        <div className="mt-4 border text-center rounded-md p-6">
          <Icon type="jersey" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No players</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new player.</p>
        </div>
      )}
      <Dialog
        open={modalOpen}
        handleClose={onCloseModal}
        onConfirm={onDeletePlayerConfirm}
        confirmButtonTitle="Delete"
        loading={deletePlayerLoading}
        title="Are you sure you want to delete this player?"
      />
    </div>
  );
}
