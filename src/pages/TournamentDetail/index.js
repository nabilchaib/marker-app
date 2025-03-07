import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { getTournamentByIdApi, addGameApi, updateTournamentApi } from '../../firebase/api';
import { updateTournament, addGameToTournament, updateTournamentMatch } from '../../redux/tournaments-reducer';
import { addNewGame } from '../../redux/games-reducer';
import Icon from '../../components/Icon';

const TournamentDetail = () => {
  const { tournamentId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const user = useSelector(state => state.user);
  console.log('UU: ', user)
  const teams = useSelector(state => state.teams.byId);
  const games = useSelector(state => state.games.byId);

  // Get tournament from Redux store
  const tournament = useSelector(state => state.tournaments.byId[tournamentId]);

  useEffect(() => {
    const fetchTournament = async () => {
      try {
        setLoading(true);
        if (!tournament) {
          const tournamentData = await getTournamentByIdApi({ tournamentId });
          dispatch(updateTournament({ id: tournamentId, updates: tournamentData }));
        }
      } catch (error) {
        console.error('Error fetching tournament:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournament();
  }, [tournamentId, dispatch, tournament]);

  // Create and start a game for a match
  const handleStartGame = async (round, matchIndex) => {
    try {
      const match = tournament.rounds.find(r => r.name === round)?.games[matchIndex];

      if (!match || match.status === 'completed') {
        return;
      }

      // Get team data for both teams
      const teamA = teams[match.teamAId];
      const teamB = teams[match.teamBId];

      // Check if both teams are valid
      if (!teamA || !teamB || match.teamAId.startsWith('bye-') || match.teamBId.startsWith('bye-')) {
        alert('Cannot start game: At least one team is not available or is a BYE.');
        return;
      }

      // Create a new game
      const gameData = {
        id: uuid(),
        teamAId: teamA.id,
        teamBId: teamB.id,
        createdBy: user.email,
        createdOn: new Date().getTime(),
        actions: [],
        type: 'tournament',
        teamAScore: 0,
        teamBScore: 0,
        notSaved: true,
        stats: {},
        tournamentId: tournamentId,
        tournamentRound: round,
        tournamentMatchIndex: matchIndex
      };

      // Save to Firestore and Redux
      const newGame = await addGameApi(gameData);
      dispatch(addNewGame(newGame));

      // Update the tournament match with the game ID
      dispatch(addGameToTournament({
        tournamentId,
        gameId: newGame.id,
        round,
        matchIndex
      }));

      // Update the match in Firestore
      await updateTournamentApi({
        tournament: {
          id: tournamentId,
          rounds: tournament.rounds.map(r => {
            if (r.name === round) {
              const updatedGames = [...r.games];
              updatedGames[matchIndex] = {
                ...updatedGames[matchIndex],
                gameId: newGame.id,
                status: 'in-progress'
              };
              return { ...r, games: updatedGames };
            }
            return r;
          })
        }
      });

      // Navigate to the game page
      navigate(`/games/${newGame.id}`);
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Error starting game. Please try again.');
    }
  };

  const renderKnockoutBracket = () => {
    if (!tournament || !tournament.rounds) {
      return <div>No bracket data available</div>;
    }

    return (
      <div className="overflow-x-auto">
        <div className="flex p-4" style={{ minWidth: tournament.rounds.length * 300 }}>
          {tournament.rounds.map((round, roundIndex) => (
            <div key={round.name} className="flex-1 px-2">
              <h3 className="text-center font-semibold mb-4">{round.name}</h3>
              <div className="space-y-8">
                {round.games.map((match, matchIndex) => {
                  // Calculate spacing to align matches properly
                  const matchesInPreviousRound = roundIndex > 0
                    ? tournament.rounds[roundIndex - 1].games.length
                    : 0;
                  const matchSpacing = matchesInPreviousRound > round.games.length
                    ? `${matchesInPreviousRound / round.games.length * 8}rem`
                    : '8rem';

                  return (
                    <div
                      key={`${round.name}-${matchIndex}`}
                      className="bg-white border rounded-lg shadow-sm p-3"
                      style={{ marginTop: matchIndex > 0 ? matchSpacing : '0' }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-500">Match {matchIndex + 1}</span>
                        {match.status === 'completed' ? (
                          <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                            Completed
                          </span>
                        ) : match.status === 'in-progress' ? (
                          <span className="text-xs bg-green-200 text-green-800 rounded-full px-2 py-0.5">
                            In Progress
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-200 text-yellow-800 rounded-full px-2 py-0.5">
                            Scheduled
                          </span>
                        )}
                      </div>

                      <div className={`flex items-center justify-between p-2 ${match.winnerId === match.teamAId ? 'bg-green-50' : ''}`}>
                        <div className="flex items-center">
                          {match.teamAId ? (
                            <span>{match.teamAName}</span>
                          ) : (
                            <span className="text-gray-400">TBD</span>
                          )}
                        </div>
                        <div className="font-bold">{match.teamAScore}</div>
                      </div>

                      <div className="border-t my-1"></div>

                      <div className={`flex items-center justify-between p-2 ${match.winnerId === match.teamBId ? 'bg-green-50' : ''}`}>
                        <div className="flex items-center">
                          {match.teamBId ? (
                            <span>{match.teamBName}</span>
                          ) : (
                            <span className="text-gray-400">TBD</span>
                          )}
                        </div>
                        <div className="font-bold">{match.teamBScore}</div>
                      </div>

                      {match.status !== 'completed' && match.teamAId && match.teamBId &&
                       !match.teamAId.startsWith('bye-') && !match.teamBId.startsWith('bye-') && (
                        <div className="mt-2 text-center">
                          {match.gameId ? (
                            <Link
                              to={`/games/${match.gameId}`}
                              className="inline-block text-sm text-blue-600 hover:text-blue-800"
                            >
                              View Game
                            </Link>
                          ) : (
                            <button
                              onClick={() => handleStartGame(round.name, matchIndex)}
                              className="text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                            >
                              Start Game
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRoundRobinSchedule = () => {
    if (!tournament || !tournament.rounds) {
      return <div>No schedule data available</div>;
    }

    return (
      <div className="space-y-6">
        {/* Standings Table */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Standings</h3>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    W
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    L
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tournament.standings && tournament.standings.map((team, index) => (
                  <tr key={team.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.wins || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.losses || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {team.points || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Schedule</h3>
          <div className="space-y-4">
            {tournament.rounds.map(round => (
              <div key={round.name} className="bg-white rounded-lg shadow-sm p-4">
                <h4 className="font-medium mb-3">{round.name}</h4>
                <div className="space-y-3">
                  {round.games.map((match, matchIndex) => (
                    <div key={`${round.name}-${matchIndex}`} className="border rounded p-3">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-500">
                          Match {matchIndex + 1}
                        </div>
                        {match.status === 'completed' ? (
                          <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                            Completed
                          </span>
                        ) : match.status === 'in-progress' ? (
                          <span className="text-xs bg-green-200 text-green-800 rounded-full px-2 py-0.5">
                            In Progress
                          </span>
                        ) : (
                          <span className="text-xs bg-yellow-200 text-yellow-800 rounded-full px-2 py-0.5">
                            Scheduled
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex-1 flex items-center">
                          <div className={`${match.winnerId === match.teamAId ? 'font-bold' : ''}`}>
                            {match.teamAName}
                          </div>
                          <div className="mx-2 font-bold">
                            {match.status !== 'scheduled' ? `${match.teamAScore} - ${match.teamBScore}` : 'vs'}
                          </div>
                          <div className={`${match.winnerId === match.teamBId ? 'font-bold' : ''}`}>
                            {match.teamBName}
                          </div>
                        </div>

                        {match.status !== 'completed' && (
                          <div>
                            {match.gameId ? (
                              <Link
                                to={`/games/${match.gameId}`}
                                className="inline-block text-sm text-blue-600 hover:text-blue-800"
                              >
                                View Game
                              </Link>
                            ) : (
                              <button
                                onClick={() => handleStartGame(round.name, matchIndex)}
                                className="text-sm bg-blue-500 hover:bg-blue-700 text-white py-1 px-3 rounded"
                              >
                                Start Game
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-4 text-center">Loading tournament...</div>;
  }

  if (!tournament) {
    return (
      <div className="p-4 text-center">
        <p>Tournament not found</p>
        <Link to="/tournaments" className="text-blue-500 hover:text-blue-700">
          Return to tournaments
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{tournament.name}</h1>
          <div className="text-gray-600">
            {tournament.location && (
              <div className="mt-1 flex items-center">
                <Icon type="map-pin" size={16} className="mr-1" />
                <span>{tournament.location}</span>
              </div>
            )}
            <div className="mt-1 flex items-center">
              <Icon type="calendar" size={16} className="mr-1" />
              <span>
                {new Date(tournament.startDate).toLocaleDateString()} - {new Date(tournament.endDate).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-1 flex items-center">
              <Icon type="users" size={16} className="mr-1" />
              <span>{tournament.teams.length} Teams</span>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <Link
            to="/tournaments"
            className="inline-flex items-center text-blue-500 hover:text-blue-700"
          >
            <Icon type="arrow-left" size={16} className="mr-1" />
            Back to Tournaments
          </Link>
        </div>
      </div>

      {tournament.description && (
        <div className="bg-white p-4 mb-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700">{tournament.description}</p>
        </div>
      )}

      <div className="bg-white p-4 mb-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Tournament Format</h2>
        <div className="flex items-center">
          <span className="mr-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {tournament.format === 'knockout' ? 'Knockout' : 'Round-Robin'}
          </span>
          <span className="text-gray-700">
            {tournament.format === 'knockout'
              ? 'Single elimination tournament bracket'
              : 'All teams play against each other'}
          </span>
        </div>
      </div>

      <div className="bg-white p-4 mb-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Teams</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {tournament.teams.map(team => (
            <div key={team.id} className="border rounded-lg p-3 flex items-center">
              {team.avatarUrl ? (
                <img src={team.avatarUrl} alt={team.name} className="w-8 h-8 rounded-full mr-2" />
              ) : (
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                  <Icon type="users" size={16} />
                </div>
              )}
              <span className="truncate">{team.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          {tournament.format === 'knockout' ? 'Tournament Bracket' : 'Tournament Schedule & Standings'}
        </h2>

        {tournament.format === 'knockout'
          ? renderKnockoutBracket()
          : renderRoundRobinSchedule()
        }
      </div>
    </div>
  );
};

export default TournamentDetail;
