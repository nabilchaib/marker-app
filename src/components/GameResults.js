import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { initialStats, endGame } from '../redux/games-reducer';
import { pushStatsToFirebase } from '../firebase/api';
import { trackGameFinished } from '../analytics';

const GameResults = ({ game, onBackClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDrillMode = game.type === 'drill';
  const { teamAId, teamAScore, teamBId, teamBScore } = game;
  const [showEndGameConfirmation, setShowEndGameConfirmation] = useState(false);
  const [endingGame, setEndingGame] = useState(false);

  const teams = useSelector(state => state.teams);
  const players = useSelector(state => state.players);
  const teamA = teams.byId[teamAId];
  const teamB = teams.byId[teamBId];

  const drillStats = isDrillMode && game.stats;
  const drillPlayer = players.byId[game.playerId];

  const handleEndGame = async () => {
    setEndingGame(true);
    try {
      await pushStatsToFirebase(game, teamA, teamB);
      trackGameFinished(game.type || 'pick-up');
      dispatch(endGame(game.id));
      navigate('/games');
    } catch (err) {
      console.error('Error ending game:', err);
      toast.error('Failed to save game stats. Please try again.');
    } finally {
      setEndingGame(false);
    }
  };

  const handleConfirmEndGame = () => {
    setShowEndGameConfirmation(false);
    handleEndGame();
  };

  const handleCancelEndGame = () => {
    setShowEndGameConfirmation(false);
  };

  const getGameTitle = (game) => {
    if (game.type === 'pick-up') {
      return `🏀 ${teamA?.name || 'Team A'} vs ${teamB?.name || 'Team B'}`;
    }
    if (game.type === 'drill') {
      return `🎯 Drill – ${drillPlayer?.name || 'Player'}`;
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

      <div className="mt-6 text-center space-x-4">
        <button
          onClick={onBackClick}
          className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md"
        >
          ← Back to Game
        </button>
        <button
          onClick={() => setShowEndGameConfirmation(true)}
          disabled={endingGame}
          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {endingGame ? 'Saving...' : `End ${isDrillMode ? 'Drill' : 'Game'}`}
        </button>
      </div>

      {/* End Game Confirmation Modal */}
      {showEndGameConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">
              End {isDrillMode ? "Drill" : "Game"}?
            </h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to end this {isDrillMode ? "drill" : "game"}? 
              This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleCancelEndGame}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndGame}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                End {isDrillMode ? "Drill" : "Game"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameResults;