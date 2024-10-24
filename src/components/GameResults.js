import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectTeamScore } from './selectors/selectors';
import { pushStatsToFirebase } from '../firebase/api';
import { useNavigate } from 'react-router-dom';

const GameResults = ({ onBackClick }) => {
  const navigate = useNavigate();
  const teamA = useSelector((state) => state.game.teamA);
  const teamB = useSelector((state) => state.game.teamB);
  const game = useSelector((state) => state.game);

  const teamAScore = useSelector((state) => selectTeamScore(state, 'teamA'));
  const teamBScore = useSelector((state) => selectTeamScore(state, 'teamB'));

  const playerStats = (team) => {
    return Object.values(team.players).map((player) => {
      return (
        <tr key={player.id} className="hover:bg-gray-100 bg-gray-50 odd:bg-white even:bg-gray-50">
          <td className="p-3 text-sm">{player.name}</td>
          <td className="p-3 text-sm">{player.stats.points.made[1] + player.stats.points.made[2] * 2 + player.stats.points.made[3] * 3} pts</td>
          <td className="p-3 text-sm">{player.stats.rebounds.offensive + player.stats.rebounds.defensive}</td>
          <td className="p-3 text-sm">{player.stats.assists}</td>
          <td className="p-3 text-sm">{player.stats.fouls}</td>
        </tr>
      );
    });
  };

  const EndGameButton = ({ teamA, teamB }) => {
    const handleClick = async () => {
      await pushStatsToFirebase(game, teamA, teamB);
      navigate('/teamselection');
    };

    return (
      <button
        className="py-2 px-6 rounded-lg bg-red-500 text-white hover:bg-red-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
        onClick={handleClick}
      >
        End Game
      </button>
    );
  };

  return (
    <div className="GameResults flex flex-col items-center justify-center p-8 bg-gray-100 rounded-lg shadow-2xl w-full md:w-3/4 lg:w-1/2 mx-auto space-y-6">
      {/* Animated overlay */}
      <motion.div className="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }}></motion.div>

      <motion.div className="content bg-white rounded-lg p-8" initial={{ y: '-100vh' }} animate={{ y: '0' }}>
        {/* Game Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-[#f64e07] tracking-wider mb-8">Game Results</h2>

        {/* Score Section */}
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

        {/* Player Stats */}
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

        {/* Buttons */}
        <div className="flex justify-between mt-8">
          <button
            className="py-3 px-8 rounded-lg bg-[#0aa6d6] text-white hover:bg-blue-600 shadow-lg hover:shadow-2xl transition-transform transform hover:scale-105"
            onClick={onBackClick}
          >
            Back
          </button>
          <EndGameButton teamA={teamA} teamB={teamB} />
        </div>
      </motion.div>
    </div>
  );
};

export default GameResults;
