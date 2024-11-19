import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { TrashIcon, PencilIcon, PlusIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

import Icon from '../../components/Icon';
import List from '../../components/List';
import Dialog from '../../components/Dialog';
import { getTeamsApi, deleteTeamApi } from '../../firebase/api';
import { addTeams, resetTeamCache, addTeamCache, deleteTeam } from '../../redux/teams-reducer';
import { addGameToCache, removeGameFromCache } from '../../redux/games-reducer';
import { colors } from '../../utils';


export default function AddPickUpGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [getTeamsLoading, setGetTeamsLoading] = useState(false);
  const [deleteTeamLoading, setDeleteTeamLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);


  const state = useSelector(state => state);
  const user = useSelector(state => state.user);
  const teams = useSelector(state => state.teams);
  const games = useSelector(state => state.games);

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

    if (user?.email) {
      fetchTeams();
    }
  }, [user?.email]);

  const onNewTeam = () => {
    dispatch(resetTeamCache());
    navigate('/games/teams/create')
  };

  const onSelectTeam = team => {
    if (games.editing.teamA === team.id) {
      dispatch(removeGameFromCache({ type: 'teamA' }));
      return false;
    }

    if (games.editing.teamB === team.id) {
      dispatch(removeGameFromCache({ type: 'teamB' }));
      return false;
    }

    if (games.editing.teamA) {
      dispatch(addGameToCache({ teamB: team.id }))
      return false;
    }

    dispatch(addGameToCache({ teamA: team.id }))
  };

  const onCreateNewPickUpGame = () => {
    if (!games.editing.teamA || !games.editing.teamB) {
      toast.error('Select 2 teams before starting your pick-up game', {
        position: 'top-center'
      });
      return false;
    }

    if (teamA.players.length <= 0) {
      toast.error(`There are no players in team ${teamA.name}`, {
        position: 'top-center'
      });
      return false;
    }

    if (teamB.players.length <= 0) {
      toast.error(`There are no players in team ${teamB.name}`, {
        position: 'top-center'
      });
    }
  };

  const onDeleteTeam = (team) => {
    setTeamToDelete(team);
    setModalOpen(true);
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
    navigate('/games/teams/edit')
  };

  const teamA = teams.byId[games.editing.teamA];
  const teamB = teams.byId[games.editing.teamB];
  const dropdownItems = [
    { text: 'Delete', icon: TrashIcon, onClick: onDeleteTeam },
    { text: 'Edit', icon: PencilIcon, onClick: onEditTeam },
  ];

  const renderListItem = useCallback(({ item, onSelectItem }) => {
    return (
      <button onClick={() => onSelectItem(item)} className="w-full group flex items-center p-4 pr-10 focus-visible:outline-orange-600">
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
      </button>
    );
  }, [games.editing]);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-base font-semibold leading-6 text-gray-900">Create a new pick-up game</h2>

      <div className="mt-4 flex flex-col sm:flex-row items-center sm:items-start justify-center">
        <div className="flex flex-col items-center mb-4 mr-0 sm:mb-0 sm:mr-8">
          {!teamA?.avatarUrl && (
            <div className="mb-2 border border-gray-300 relative inline-flex p-2 h-32 w-32 items-center justify-center rounded-full">
              <Icon type="jersey" className="mx-auto h-24 w-24 text-gray-400" />
            </div>
          )}
          {teamA?.avatarUrl && (
            <img className="mb-2 rounded-full h-32 w-32" src={teamA?.avatarUrl} />
          )}
          {teamA?.name && (
            <div>
              {teamA.name}
            </div>
          )}
        </div>
        <div className="self-center mb-4 mr-0 sm:mb-0 sm:mr-8">
          VS
        </div>
        <div className="flex flex-col items-center">
          {!teamB?.avatarUrl && (
            <div className="mb-2 border border-gray-300 relative inline-flex p-2 h-32 w-32 items-center justify-center rounded-full">
              <Icon type="jersey" className="mx-auto h-24 w-24 text-gray-400" />
            </div>
          )}
          {teamB?.avatarUrl && (
            <img className="mb-2 rounded-full h-32 w-32" src={teamB?.avatarUrl} />
          )}
          {teamB?.name && (
            <div>
              {teamB.name}
            </div>
          )}
        </div>
      </div>

      {teams.allIds.length > 0 && (
        <div className="mt-4">
          <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <h2 className="text-base font-semibold leading-6 text-gray-900">Select 2 teams for your pick-up game</h2>
            <button
              type="button"
              className="mt-4 sm:mt-0 w-full sm:w-auto inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              onClick={onNewTeam}
            >
              <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
              New team
            </button>
          </div>
          <List items={teams} onSelectItem={onSelectTeam} dropdownItems={dropdownItems} editingState={games.editing}>
            {renderListItem}
          </List>
        </div>
      )}

      {teams.allIds.length <= 0 && (
        <div className="mt-4 border text-center rounded-md p-6">
          <Icon type="jersey" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No teams</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
          <div className="mt-6">
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
              onClick={onNewTeam}
            >
              <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
              New Team
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <button
          type="button"
          className="w-full sm:w-auto inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          onClick={onCreateNewPickUpGame}
        >
          {false && (
            <Icon type="loader" className="h-5 w-5 mr-2" spinnerColor={colors.orange600} spinnerBackgroundColor={colors.grey300} />
          )}
          Create new pick-up game
        </button>
      </div>
      <Dialog
        open={modalOpen}
        handleClose={onCloseModal}
        onConfirm={onDeleteTeamConfirm}
        confirmButtonTitle="Delete"
        loading={deleteTeamLoading}
        title="Are you sure you want to delete this team?"
      />
    </div>
  )
}
