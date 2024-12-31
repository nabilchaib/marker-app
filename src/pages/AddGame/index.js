import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { LockClosedIcon } from '@heroicons/react/24/solid'

import Icon from '../../components/Icon';
import List from '../../components/List';
import { resetGameCache } from '../../redux/games-reducer';
import { classNames, colors } from '../../utils';

const gameTypes = {
  byId: {
    "pick-up": {
      id: "pick-up",
      name: 'Pick-up game',
      description: 'Start a new pick-up game',
      iconColor: 'bg-orange-200',
      icon: props => <Icon type="hoop" />,
    },
    "drill": {
      id: "drill",
      name: 'Drill',
      description: 'Start a new drill',
      href: '#',
      iconColor: 'bg-orange-300',
      icon: props => <Icon type="drill" />,
    },
    "tournament": {
      id: "tournament",
      name: 'Tournament',
      description: 'Start a new tournament',
      href: '#',
      iconColor: 'bg-orange-400',
      icon: props => <Icon type="tournament" />,
      disabled: true
    },
    "league": {
      id: "league",
      name: 'League',
      description: 'Start a new league',
      href: '#',
      iconColor: 'bg-orange-500',
      icon: props => <Icon type="trophy" />,
      disabled: true
    },
  },
  allIds: [
    "pick-up", "drill", "tournament", "league"
  ]
};

export default function AddGame() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onGameTypeClick = (gameType) => {
    dispatch(resetGameCache()); // Reset cache on all game types

    if (gameType === 'Pick-up game') {
      navigate('/games/pick-up-game/create');
    } else if (gameType === 'Drill') {
      navigate('/games/drill/create');  // Navigate to drill setup or tracking page
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h2 className="text-base font-semibold leading-6 text-gray-900">Create a new game</h2>
      <p className="mt-1 text-sm text-gray-500">Get started by selecting the type of game you'd like to set up.</p>
      <List items={gameTypes} onSelectItem={onGameTypeClick} hasChevron>
        {({ item, onSelectItem }) => {
          return (
            <button disabled={item.disabled} onClick={() => onSelectItem(item.name)} className={classNames(item.disabled ? 'bg-gray-100 hover:bg-gray-200 cursor-not-allowed' : '', 'w-full group flex items-center p-4 pr-10 focus-visible:outline-orange-600')}>
              <div className="mr-3">
                <span
                  className={classNames(item.disabled ? 'bg-gray-300' : item.iconColor, ' relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-lg')}
                >
                  <item.icon aria-hidden="true" className="h-6 w-6" />
                  {item.disabled && <LockClosedIcon className="absolute size-4 -right-1 -bottom-1" />}
                </span>
              </div>
              <div className="min-w-0 flex-1 flex justify-between items-center">
                <div className="flex flex-col items-start">
                  <div className="text-sm text-left font-medium text-gray-900">
                    <a>
                      {item.name}
                    </a>
                  </div>
                  <p className="text-sm text-left text-gray-500">{item.description}</p>
                </div>
                {item.disabled && (
                  <span className="hidden sm:block absolute left-1/2 -translate-x-1/2 inline-flex items-center rounded-md bg-gray-300 px-2 py-1 text-xs font-medium text-gray-600">
                    Unlock this feature
                  </span>
                )}
              </div>
            </button>
          );
        }}
      </List>
    </div>
  )
}
