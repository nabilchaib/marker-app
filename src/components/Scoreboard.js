import React from 'react';
import { useSelector } from 'react-redux';
import { selectTeamScore } from './selectors/selectors'
import '../css/main.css'


const Scoreboard = () => {
  const teamAScore = useSelector(state => selectTeamScore(state, 'teamA'));
  const teamBScore = useSelector(state => selectTeamScore(state, 'teamB'));

  return (

    <div className='Scoreboard'>
      <div className='TeamScores'>
        <div className='Score'>
      <h2 >Scoreboard</h2>
          <h3>Home:
            <br></br>
            <div className='points'>
            {teamAScore}
            </div>

            </h3>

          <h3>Away:
          <br></br>
          <div className='points'>
           {teamBScore}
          </div>

           </h3>

        </div>
      </div>
      <div>
      </div>
    </div>
  );
};

export default Scoreboard;
