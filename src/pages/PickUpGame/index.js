import React from "react";
import { Navigate, useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux';
import Scoreboard from "../../components/Scoreboard";
import GameControls from "../../components/GameControls";
import "../../css/main.css";
import BgImg from "../../components/BackgroundImage";
import Icon from "../../components/Icon";

const PickUpGame = () => {
  const { id: currentGameId } = useParams();
  const navigate = useNavigate();
  const currentGame = useSelector(state => state.games.byId[currentGameId]);
  if (!currentGame) {
    return <Navigate to="/games" />
  }

  const handleReturnToTournament = () => {
    if (currentGame.tournamentId) {
      navigate(`/tournaments/${currentGame.tournamentId}`);
    }
  };

  return (
    <div>
      <div>
        <div className="App">
          <BgImg />
          {currentGame.tournamentId && (
            <button
            onClick={handleReturnToTournament}
            className="fixed top-4 left-4 z-50 flex items-center px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-[#f64e07] hover:text-white hover:bg-[#f64e07] font-semibold text-sm shadow-md transition-all"
          >
            <Icon type="arrow-left" size={16} className="mr-2" />
            Back to Tournament
          </button>
          )}
          <Scoreboard currentGameId={currentGameId} />
          <GameControls currentGameId={currentGameId} />
        </div>
      </div>
    </div>
  );
};

export default PickUpGame;
