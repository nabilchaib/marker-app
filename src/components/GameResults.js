import React from 'react';
import { useSelector } from 'react-redux';
import '../css/gameresults.css';
import { motion } from 'framer-motion';
import { selectTeamScore, selectTeamPlayers } from './selectors/selectors'


const GameResults = ({ onBackClick }) => {
    const teamA = useSelector((state) => state.game.teamA);
    const teamB = useSelector((state) => state.game.teamB);

    const teamAScore = useSelector(state => selectTeamScore(state, 'teamA'));
    const teamBScore = useSelector(state => selectTeamScore(state, 'teamB'));

    const teamAPlayers = useSelector((state) => selectTeamPlayers(state, "teamA"));
    const teamBPlayers = useSelector((state) => selectTeamPlayers(state, "team2"));

    const playerStats = (team) => {
        return team.players.map((player) => {
            return (
                <tr key={player.id}>
                    <td>{player.name}</td>
                    <td className='number'>{player.stats.points.made[1] + player.stats.points.made[2] * 2 + player.stats.points.made[3] * 3} pts </td>
                    <td>{player.stats.rebounds.offensive+player.stats.rebounds.defensive}</td>
                    <td>{player.stats.assists}</td>
                    <td>{player.stats.fouls}</td>
                </tr>
            );
        });
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
                        <p>{teamAScore}</p>
                    </div>

                    <div>
                        <p>{teamB.name}</p>
                        <p>{teamBScore}</p>
                    </div>
                </div>

                <div className='table'>
                    <h2>Team A: {teamA.points}</h2>
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
                    <h2>Team B: {teamB.points}</h2>
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
                
                
                <br></br>
                <button className='button' onClick={onBackClick}>Back</button>
            </motion.div>
        </div>
    );
};

export default GameResults;
