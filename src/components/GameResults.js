import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { selectTeamScore } from './selectors/selectors';
import { pushStatsToFirebase } from '../firebase/api';
import { useNavigate } from 'react-router-dom';
import '../css/gameresults.css';

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
        <tr key={player.id}>
          <td>{player.name}</td>
          <td className='number'>{player.stats.points.made[1] + player.stats.points.made[2] * 2 + player.stats.points.made[3] * 3} pts </td>
          <td>{player.stats.rebounds.offensive + player.stats.rebounds.defensive}</td>
          <td>{player.stats.assists}</td>
          <td>{player.stats.fouls}</td>
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
      <button className='button' onClick={handleClick}>End Game</button>
    );
  };

  return (
    <div className='GameResults'>
      <motion.div
        className='overlay'
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      ></motion.div>

      <motion.div
        className='content'
        initial={{ y: '-100vh' }}
        animate={{ y: '0' }}
      >
        <h2>Game Results</h2>

        <div className='scores'>
          <div>
            <p>{teamA.name}</p>
            <h2>{teamAScore}</h2>
          </div>

          <div>
            <p>{teamB.name}</p>
            <h2>{teamBScore}</h2>
          </div>
        </div>

        <div className='table'>
          <h2>{teamA.name}: {teamA.points}</h2>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Points</th>
                <th>Rebounds</th>
                <th>Assists</th>
                <th>Fouls</th>
              </tr>
            </thead>
            <tbody>{playerStats(teamA)}</tbody>
          </table>
          <h2>{teamB.name}: {teamB.points}</h2>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Points</th>
                <th>Rebounds</th>
                <th>Assists</th>
                <th>Fouls</th>
              </tr>
            </thead>
            <tbody>{playerStats(teamB)}</tbody>
          </table>
        </div>
        <button className='button' onClick={onBackClick}>Back</button>
        <br></br>
        <EndGameButton teamA={teamA} teamB={teamB} />
      </motion.div>
    </div>
  );
};

export default GameResults;
