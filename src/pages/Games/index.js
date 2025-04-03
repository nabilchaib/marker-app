import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  TrashIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";
import SportsBasketballIcon from '@mui/icons-material/SportsBasketball';

import {
  deleteGame,
} from "../../redux/games-reducer";
import List from '../../components/List';
import Icon from "../../components/Icon";
import { classNames } from "../../utils";


export default function AddGame() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const games = useSelector(state => state.games);
  const teams = useSelector(state => state.teams);
  const players = useSelector(state => state.players);

  const onNewGameClick = () => {
    navigate("/games/create");
  };

  const getIconBackgroundColor = (type) => {
    if (type === 'drill') {
      return "bg-orange-300";
    }

    return "bg-orange-200";
  };

  const getGameIcon = (game) => {
    if (game.type === 'pick-up') {
      return <Icon type="hoop" className="h-6 w-6" />;
    }

    return <Icon type="drill" className="h-6 w-6" />;
  };

  const getGameTitle = (game) => {
    if (game.type === 'pick-up') {
      const teamA = teams.byId[game.teamAId];
      const teamB = teams.byId[game.teamBId];
      return `${teamA.name} vs ${teamB.name}`;
    }

    if (game.type === 'drill') {
      if (game.playerIds?.length > 0) {
        const playerNames = game.playerIds
          .map(id => players.byId[id]?.name)
          .filter(Boolean);
        return playerNames.length === 1 
          ? playerNames[0] 
          : `Drill with ${playerNames.length} players`;
      }
      return game.playerId ? players.byId[game.playerId]?.name || 'Drill' : 'Drill';
    }

    return game.category;
  };

  const onResumeGame = game => {
    if (game.type === 'pick-up') {
      navigate(`/games/pick-up-game/${game.id}`);
    }

    if (game.type === 'drill') {
      navigate(`/games/drill/${game.id}`);
    }
  };

  const onDeleteGame = game => {
    dispatch(deleteGame(game.id))
  };


  const dropdownItems = [
    { text: 'Resume game', icon: () => <SportsBasketballIcon className="!w-4 !h-4" />, onClick: onResumeGame },
    { text: 'Delete', icon: TrashIcon, onClick: onDeleteGame },
  ];

  const renderListItem = useCallback(({ item }) => {
    return (
      <div className="w-full group flex items-center p-4 pr-10 focus-visible:outline-orange-600">
        <div className="mr-3">

        <div
          className={classNames(
            getIconBackgroundColor(item.type),
            "relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-lg"
          )}
        >
          {getGameIcon(item)}
        </div>
        </div>

        <div>
          <p className="text-sm font-semibold leading-6 text-gray-900">
            <a>{getGameTitle(item)}</a>
          </p>
          <p className="mt-1 flex text-xs leading-5 text-gray-500">
            <a className="relative truncate">{item.type}</a>
          </p>
        </div>
      </div>
    );
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-start">
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          Games
        </h2>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          onClick={onNewGameClick}
        >
          <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
          New Game
        </button>
      </div>
      {games.allIds.length > 0 && (
        <List items={games} dropdownItems={dropdownItems}>
          {renderListItem}
        </List>
      )}
      {games.allIds.length <= 0 && (
        <div className="mt-4 border text-center rounded-md p-6">
          <Icon type="hoop" className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No games</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new game.</p>
        </div>
      )}
    </div>
  );
}
