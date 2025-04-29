import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { initialStats, endGame } from '../redux/games-reducer';

const GameResults = ({ game, onBackClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDrillMode = game.type === 'drill';
  const { teamAId, teamAScore, teamBId, teamBScore } = game;

  const teams = useSelector(state => state.teams);
  const players = useSelector(state => state.players);
  const teamA = teams.byId[teamAId];
  const teamB = teams.byId[teamBId];

  const drillStats = isDrillMode && game.stats;
  const drillPlayer = players.byId[game.playerId];

  const handleEndGame = async () => {
    try {
      dispatch(endGame(game.id));
      navigate('/games');
    } catch (err) {
      console.error('Error ending game:', err);
    }
  };

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">{getGameTitle(game)}</h2>
      
      {isDrillMode ? (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Drill Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Completions</p>
              <p className="text-2xl font-bold">{drillStats?.completions || 0}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Attempts</p>
              <p className="text-2xl font-bold">{drillStats?.attempts || 0}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Final Score</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{teamA?.name || 'Team A'}</p>
              <p className="text-2xl font-bold">{teamAScore || 0}</p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="text-sm text-gray-600">{teamB?.name || 'Team B'}</p>
              <p className="text-2xl font-bold">{teamBScore || 0}</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={onBackClick}
          className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md"
        >
          ← Back to Game
        </button>
        <button
          onClick={handleEndGame}
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md"
        >
          End {isDrillMode ? 'Drill' : 'Game'}
        </button>
      </div>
    </div>
  );
};

export default GameResults;