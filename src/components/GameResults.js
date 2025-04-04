import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { initialStats } from '../redux/games-reducer';

const GameResults = ({ game, onBackClick }) => {
  const navigate = useNavigate();
  const isDrillMode = game.type === 'drill';
  const { teamAId, teamAScore, teamBId, teamBScore } = game;

  const teams = useSelector(state => state.teams);
  const players = useSelector(state => state.players);
  const teamA = teams.byId[teamAId];
  const teamB = teams.byId[teamBId];

  const drillStats = isDrillMode && game.stats;
  const drillPlayer = players.byId[game.playerId];

  const getGameTitle = (game) => {
    if (game.type === 'pick-up') {
      return `🏀 ${teamA?.name || 'Team A'} vs ${teamB?.name || 'Team B'}`;
    }
    if (game.type === 'drill') {
      return `🎯 Drill – ${players.byId[game.playerId]?.name || 'Player'}`;
    }
    return `📋 ${game.category || 'Game'}`;
  };

  const playerStats = (team) => {
    return Object.values(team.players).map((playerId) => {
      const player = players.byId[playerId];
      const stats = game.stats[team.id]?.[playerId] || { ...initialStats };
      return (
        <tr key={player.id} className="hover:bg-gray-100 bg-gray-50 odd:bg-white even:bg-gray-50">
          <td className="p-3 text-sm font-medium text-gray-700">{player.name}</td>
          <td className="p-3 text-sm">{stats.freeThrows + (stats.twos * 2) + (stats.threes * 3)} pts</td>
          <td className="p-3 text-sm">{stats.offensiveRebounds + stats.defensiveRebounds}</td>
          <td className="p-3 text-sm">{stats.assists}</td>
          <td className="p-3 text-sm">{stats.fouls}</td>
        </tr>
      );
    });
  };

  const drillPlayerStats = () => {
    return Object.entries(drillStats).map(([id, stats]) => {
      const player = players.byId[id];
      return (
        <tr key={id} className="hover:bg-gray-100 bg-gray-50 odd:bg-white even:bg-gray-50">
          <td className="p-3 text-sm font-medium text-gray-700">{player.name}</td>
          <td className="p-3 text-sm">Attempts: {stats.attempts}</td>
          <td className="p-3 text-sm">Completions: {stats.completions}</td>
          <td className="p-3 text-sm">Success Rate: {((stats.completions / (stats.attempts || 1)) * 100).toFixed(1)}%</td>
        </tr>
      );
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-cyan-500 text-center mb-6">
        {getGameTitle(game)}
      </h2>

      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full text-sm text-left text-gray-700">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100">
            <tr>
              <th scope="col" className="p-3">Player</th>
              {isDrillMode ? (
                <>
                  <th scope="col" className="p-3">Attempts</th>
                  <th scope="col" className="p-3">Completions</th>
                  <th scope="col" className="p-3">Success Rate</th>
                </>
              ) : (
                <>
                  <th scope="col" className="p-3">Points</th>
                  <th scope="col" className="p-3">Rebounds</th>
                  <th scope="col" className="p-3">Assists</th>
                  <th scope="col" className="p-3">Fouls</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {isDrillMode ? drillPlayerStats() : (
              <>
                {teamA && playerStats(teamA)}
                {teamB && playerStats(teamB)}
              </>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-center">
        <button
          onClick={onBackClick || (() => navigate('/games'))}
          className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md"
        >
          ← Back to Games
        </button>
      </div>
    </div>
  );
};

export default GameResults;