import React from "react";
import { Navigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux';
import Scoreboard from "../../components/Scoreboard";
import GameControls from "../../components/GameControls";
import "../../css/main.css";
import BgImg from "../../components/BackgroundImage";

const PickUpGame = () => {
  const { id: currentGameId } = useParams();
  const currentGame = useSelector(state => state.games.byId[currentGameId]);
  if (!currentGame) {
    return <Navigate to="/games" />
  }

  return (
    <div>
      <div>
        <div className="App">
          <BgImg />
          <Scoreboard currentGameId={currentGameId} />
          <GameControls currentGameId={currentGameId} />
        </div>
      </div>
    </div>
  );
};

export default PickUpGame;
