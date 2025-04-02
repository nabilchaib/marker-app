import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { initialStats } from '../redux/games-reducer';
import { updateTournamentMatch, advanceTeamInTournament } from '../redux/tournaments-reducer';

const GameResults = ({ game, onBackClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDrillMode = game.type === 'drill';
  const { teamAId, teamAScore, teamBId, teamBScore } = game;

  // Only retrieve team scores if not in drill mode
  const teams = useSelector(state => state.teams);
  const players = useSelector(state => state.players);
  const teamA = teams.byId[teamAId];
  const teamB = teams.byId[teamBId];

  // Get drill stats from the selected player in drill mode
  const drillStats = isDrillMode && game.stats;
  const drillPlayer = players.byId[game.playerId];


  // Render player stats based on game mode
  const playerStats = (team) => {
    return Object.values(team.players).map((playerId) => {
      const player = players.byId[playerId];
      const stats = game.stats[team.id]?.[playerId] || { ...initialStats };
      return (
        <tr key={player.id} className="hover:bg-gray-100 bg-gray-50 odd:bg-white even:bg-gray-50">
          <td className="p-3 text-sm">{player.name}</td>
          <td className="p-3 text-sm">{stats.freeThrows + (stats.twos * 2) + (stats.threes * 3)} pts</td>
          <td className="p-3 text-sm">{stats.offensiveRebounds + stats.defensiveRebounds}</td>
          <td className="p-3 text-sm">{stats.assists}</td>
          <td className="p-3 text-sm">{stats.fouls}</td>
        </tr>
      );
    });
  };

  // Render drill stats if in drill mode
  const drillPlayerStats = () => {
    return Object.entries(drillStats).map(playerStats => {
      const id = playerStats[0];
      const stats = playerStats[1];
      return (
        <tr key={id} className="hover:bg-gray-100 bg-gray-50 odd:bg-white even:bg-gray-50">
          <td className="p-3 text-sm">{drillPlayer.name}</td>
          <td className="p-3 text-sm">Attempts</td>
          <td className="p-3 text-sm">{stats.attempts}</td>
          <td className="p-3 text-sm">Completions</td>
          <td className="p-3 text-sm">{stats.completions}</td>
          <td className="p-3 text-sm">
            {stats.attempts > 0 ? `${((stats.completions / stats.attempts) * 100).toFixed(2)}%` : '0%'}
          </td>
        </tr>
      );
    });
  };

  const EndButton = () => {
    const handleClick = async () => {
      if (game.tournamentId) {
        // Update the tournament match with final scores and winner
        const winnerId = teamAScore > teamBScore ? teamAId : teamBId;
        
        // Update match status and scores
        dispatch(updateTournamentMatch({
          tournamentId: game.tournamentId,
          round: game.tournamentRound,
          matchIndex: game.tournamentMatchIndex,
          updates: {
            status: 'completed',
            winnerId: winnerId,
            teamAScore: teamAScore,
            teamBScore: teamBScore
          }
        }));

        // Advance the winning team to the next round
        dispatch(advanceTeamInTournament({
          tournamentId: game.tournamentId,
          round: game.tournamentRound,
          matchIndex: game.tournamentMatchIndex,
          teamId: winnerId,
          score: Math.max(teamAScore, teamBScore)
        }));

        // Navigate back to the tournament
        navigate(`/tournaments/${game.tournamentId}`);
      } else {
        // For regular games, navigate to the games list
        navigate('/games');
      }
    };

    return (
      <button
        className="py-2 px-6 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
        onClick={handleClick}
      >
        {isDrillMode ? 'End Drill' : 'End Game'}
      </button>
    );
  };

  return (
    <div className="GameResults flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg shadow-2xl w-full md:w-3/4 lg:w-1/2 mx-auto space-y-6 overflow-y-auto max-h-screen">
      <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}></motion.div>

      <motion.div className="content bg-white rounded-lg p-8 overflow-y-auto max-h-full" initial={{ y: '-100vh' }} animate={{ y: '0' }}>
        <h2 className="text-3xl md:text-4xl font-bold text-[#f64e07] tracking-wider mb-8">
          {isDrillMode ? 'Drill Results' : 'Game Results'}
        </h2>

        {isDrillMode ? (
          <div className="table mb-8">
            <h2 className="text-2xl font-semibold mb-4">Drill Stats</h2>
            <table className="min-w-full bg-white border-collapse border border-gray-200 text-left rounded-lg shadow-sm">
              <thead className="bg-gray-200 text-gray-700">
                <tr>
                  <th className="p-3 font-semibold text-sm">Player</th>
                  <th className="p-3 font-semibold text-sm">Metric</th>
                  <th className="p-3 font-semibold text-sm">Value</th>
                  <th className="p-3 font-semibold text-sm">Metric</th>
                  <th className="p-3 font-semibold text-sm">Value</th>
                  <th className="p-3 font-semibold text-sm">Success Rate</th>
                </tr>
              </thead>
              <tbody>{drillPlayerStats()}</tbody>
            </table>
          </div>
        ) : (
          <>
            {/* Game Scores */}
            <div className="scores flex justify-around mb-10">
              <div className="team text-center">
                <p className="text-2xl font-bold text-[#f64e07]">{teamA.name}</p>
                <h2 className="text-5xl font-extrabold text-gray-900">{teamAScore}</h2>
              </div>

              <div className="team text-center">
                <p className="text-2xl font-bold text-[#0aa6d6]">{teamB.name}</p>
                <h2 className="text-5xl font-extrabold text-gray-900">{teamBScore}</h2>
              </div>
            </div>

            {/* Team Stats */}
            <div className="table mb-8">
              <h2 className="text-2xl font-semibold mb-4">{teamA.name} Stats</h2>
              <table className="min-w-full bg-white border-collapse border border-gray-200 text-left rounded-lg shadow-sm">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3 font-semibold text-sm">Player</th>
                    <th className="p-3 font-semibold text-sm">Points</th>
                    <th className="p-3 font-semibold text-sm">Rebounds</th>
                    <th className="p-3 font-semibold text-sm">Assists</th>
                    <th className="p-3 font-semibold text-sm">Fouls</th>
                  </tr>
                </thead>
                <tbody>{playerStats(teamA)}</tbody>
              </table>

              <h2 className="text-2xl font-semibold mt-6 mb-4">{teamB.name} Stats</h2>
              <table className="min-w-full bg-white border-collapse border border-gray-200 text-left rounded-lg shadow-sm">
                <thead className="bg-gray-200 text-gray-700">
                  <tr>
                    <th className="p-3 font-semibold text-sm">Player</th>
                    <th className="p-3 font-semibold text-sm">Points</th>
                    <th className="p-3 font-semibold text-sm">Rebounds</th>
                    <th className="p-3 font-semibold text-sm">Assists</th>
                    <th className="p-3 font-semibold text-sm">Fouls</th>
                  </tr>
                </thead>
                <tbody>{playerStats(teamB)}</tbody>
              </table>
            </div>
          </>
        )}

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button
            className="py-3 px-8 rounded-lg bg-[#0aa6d6] text-white hover:bg-blue-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={onBackClick}
          >
            Back
          </button>
          <EndButton />
        </div>
      </motion.div>
    </div>
  );
};

export default GameResults;
