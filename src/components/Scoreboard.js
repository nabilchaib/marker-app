import React from 'react';
import { useSelector } from 'react-redux';
import { selectTeamScore } from './selectors/selectors';

const Scoreboard = () => {
  const teamAScore = useSelector(state => selectTeamScore(state, 'teamA'));
  const teamBScore = useSelector(state => selectTeamScore(state, 'teamB'));

  return (
    <div className="Scoreboard flex flex-col items-center w-4/5 justify-center space-y-6 p-6 bg-black bg-opacity-50 rounded-lg shadow-xl text-white">
      {/* Scoreboard Title */}
      <h2 className="text-2xl md:text-3xl font-bold text-[#f64e07] tracking-wider text-center">
        Scoreboard
      </h2>

      {/* Team Scores */}
        <div className="flex flex-row justify-around w-full max-w-lg items-center">
          {/* Home Team Score */}
          <div className="flex flex-col items-center space-y-2 bg-gray-800 bg-opacity-90 py-4 px-6 sm:px-8 md:px-10 lg:px-12 rounded-lg shadow-md w-full sm:w-3/4 lg:w-1/2">
            <h3 className="text-lg sm:text-xl font-semibold tracking-widest text-center">Home</h3>
            <div className="points text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
              {teamAScore}
            </div>
          </div>

          {/* Glowing Divider */}
          <div className="w-px h-16 mx-4 sm:mx-6 bg-gradient-to-b from-[#f64e07] to-[#0aa6d6] opacity-80"></div>

          {/* Away Team Score */}
          <div className="flex flex-col items-center space-y-2 bg-gray-800 bg-opacity-90 py-4 px-6 sm:px-8 md:px-10 lg:px-12 rounded-lg shadow-md w-full sm:w-3/4 lg:w-1/2">
            <h3 className="text-lg sm:text-xl font-semibold tracking-widest text-center">Away</h3>
            <div className="points text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
              {teamBScore}
            </div>
          </div>
        </div>
    </div>


  );
  }
  

export default Scoreboard;
