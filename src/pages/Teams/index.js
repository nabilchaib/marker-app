import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline'

import Icon from '../../components/Icon';
import List from '../../components/List';
import Dialog from '../../components/Dialog';
import { addTeams, resetTeamCache, addTeamCache, deleteTeam } from '../../redux/teams-reducer';
import { getTeamsApi, deleteTeamApi } from '../../firebase/api';

export default function Teams() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [getTeamsLoading, setGetTeamsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTeamLoading, setDeleteTeamLoading] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  const user = useSelector(state => state.user);
  const teams = useSelector(state => state.teams);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setGetTeamsLoading(true);
        const teams = await getTeamsApi({ user });
        dispatch(addTeams({ teams }));
        setGetTeamsLoading(false);
      } catch (err) {
        console.log('FETCH TEAMS ERR: ', err);
        setGetTeamsLoading(false);
      }
    };

    if (user?.email && teams.allIds.length <= 0) {
      fetchTeams();
    }
  }, [user?.email]);

  const onNewTeam = () => {
    dispatch(resetTeamCache());
    navigate('/teams/create');
  };

  const onDeleteTeamConfirm = async () => {
    try {
      setDeleteTeamLoading(true);
      await deleteTeamApi({ team: teamToDelete });
      dispatch(deleteTeam({ team: teamToDelete }));
      setDeleteTeamLoading(false);
      onCloseModal();
    } catch (err) {
      setDeleteTeamLoading(false);
      console.log('DELETE TEAM ERR: ', err)
    }
  };

  const onCloseModal = () => {
    setTeamToDelete(null);
    setModalOpen(false);
  };

  const onEditTeam = (team) => {
    dispatch(addTeamCache({ team }));
    navigate('/teams/edit')
  };

  const onDeleteTeam = (team) => {
    setTeamToDelete(team);
    setModalOpen(true);
  };

  const renderListItem = useCallback(({ item }) => {
    return (
      <div className="w-full group flex items-center p-4 pr-10 focus-visible:outline-orange-600">
        <div className="mr-3">
          {item.avatarUrl && (
            <img className="rounded-full h-10 w-10" src={item.avatarUrl} alt="Team Avatar" />
          )}
          {!item.avatarUrl && (
            <span className="border border-gray-300 relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-full">
              <Icon type="jersey" className="mx-auto h-6 w-6 text-gray-400" />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1 flex justify-between items-center">
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-900">
              <a>
                {item.name}
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }, []);

  const dropdownItems = [
    { text: 'Delete', icon: TrashIcon, onClick: onDeleteTeam },
    { text: 'Edit', icon: PencilIcon, onClick: onEditTeam },
  ];

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

      {getTeamsLoading && <p>Loading players...</p>}
      {!getTeamsLoading && teams.allIds.length > 0 && (
        <div className="mt-4">
          <List items={teams} dropdownItems={dropdownItems}>
            {renderListItem}
          </List>
        </div>
      )}
      {!getTeamsLoading && teams.allIds.length <= 0 && (
        <div className="mt-4 border text-center rounded-md p-6">
          <Icon type="jersey" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
        </div>
      )}
      <Dialog
        open={modalOpen}
        handleClose={onCloseModal}
        onConfirm={onDeleteTeamConfirm}
        confirmButtonTitle="Delete"
        loading={deleteTeamLoading}
        title="Are you sure you want to delete this team?"
      />
    </div>
  );
}
