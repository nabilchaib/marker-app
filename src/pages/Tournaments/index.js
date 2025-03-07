import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getTournamentsApi, deleteTournamentApi } from '../../firebase/api';
import { addNewTournament, deleteTournament } from '../../redux/tournaments-reducer';
import List from '../../components/List';
import Icon from '../../components/Icon';

const Tournaments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.user);
  const tournaments = useSelector(state => {
    return state.tournaments.allIds
      .map(id => state.tournaments.byId[id])
      .filter(tournament => tournament !== null)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const tournamentsData = await getTournamentsApi({ user });
        tournamentsData.forEach(tournament => {
          dispatch(addNewTournament(tournament));
        });
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, [dispatch, user]);

  const handleDeleteTournament = async (tournamentId) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await deleteTournamentApi({ tournamentId });
        dispatch(deleteTournament(tournamentId));
      } catch (error) {
        console.error('Error deleting tournament:', error);
      }
    }
  };

  const handleViewTournament = (tournamentId) => {
    navigate(`/tournaments/${tournamentId}`);
  };

  const renderTournamentItem = (tournament) => {
    const status = getStatusLabel(tournament.status);
    const statusClass = getStatusClass(tournament.status);

    return (
      <div className="flex justify-between items-center w-full py-2">
        <div className="flex items-center">
          <div className="mr-4">
            <Icon type="trophy" size={24} />
          </div>
          <div>
            <div className="font-semibold">{tournament.name}</div>
            <div className="text-sm text-gray-600">
              {tournament.format === 'knockout' ? 'Knockout' : 'Round-Robin'} • 
              <span className={`ml-1 ${statusClass}`}>{status}</span>
            </div>
            <div className="text-xs text-gray-500">
              {tournament.teams?.length || 0} teams • 
              {new Date(tournament.startDate).toLocaleDateString()}
            </div>
          </div>
        </div>
        <div className="flex">
          <button
            onClick={() => handleViewTournament(tournament.id)}
            className="p-2 text-blue-500 hover:text-blue-700"
          >
            <Icon type="eye" size={20} />
          </button>
          <button
            onClick={() => handleDeleteTournament(tournament.id)}
            className="p-2 text-red-500 hover:text-red-700"
          >
            <Icon type="trash" size={20} />
          </button>
        </div>
      </div>
    );
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'upcoming': return 'Upcoming';
      case 'active': return 'In Progress';
      case 'completed': return 'Completed';
      default: return 'Upcoming';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'upcoming': return 'text-yellow-600';
      case 'active': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-yellow-600';
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading tournaments...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Tournaments</h1>
        <Link 
          to="/add-tournament"
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Create Tournament
        </Link>
      </div>

      {tournaments.length > 0 ? (
        <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
          {tournaments.map(tournament => renderTournamentItem(tournament))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <Icon type="trophy" size={48} className="mx-auto mb-2" />
          <p>No tournaments yet</p>
          <p className="text-sm mt-2">Create your first tournament to get started</p>
        </div>
      )}
    </div>
  );
};

export default Tournaments;