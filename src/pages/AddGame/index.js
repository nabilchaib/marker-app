import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, LockClosedIcon, EllipsisHorizontalIcon, TrashIcon, PlusIcon } from '@heroicons/react/20/solid'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import Icon from '../../components/Icon';
import { classNames } from '../../utils';

const gameTypes = [
  {
    type: 'Pick-up game',
    description: 'Start a new pick-up game',
    href: '#',
    iconColor: 'bg-orange-200',
    icon: props => <Icon type="hoop" />,
  },
  {
    type: 'Drill',
    description: 'Start a new drill',
    href: '#',
    iconColor: 'bg-orange-300',
    icon: props => <Icon type="drill" />,
  },
  {
    type: 'Tournament',
    description: 'Start a new tournament',
    href: '#',
    iconColor: 'bg-orange-400',
    icon: props => <Icon type="tournament" />,
    disabled: true
  },
  {
    type: 'League',
    description: 'Start a new league',
    href: '#',
    iconColor: 'bg-orange-500',
    icon: props => <Icon type="trophy" />,
    disabled: true
  },
]


export default function AddGame() {
  const navigate = useNavigate();

  const onGameTypeClick = (gameType) => {
    if (gameType === 'Pick-up game') {
      console.log('NAVIGATE PICK')
      navigate('/pick-up-game/create');
    }
  };

  return (
    <div>
      <h2 className="text-base font-semibold leading-6 text-gray-900">Create a new game</h2>
      <p className="mt-1 text-sm text-gray-500">Get started by selecting the type of game you'd like to set up.</p>
      <ul role="list" className="mt-6 divide-y divide-gray-200 border-b border-t border-gray-200">
        {gameTypes.map((game, index) => (
          <li onClick={() => onGameTypeClick(game.type)} key={index} className={classNames(game.disabled ? 'bg-gray-100' : '', game.disabled ? 'hover:bg-gray-200' : 'hover:bg-orange-100', 'cursor-pointer')}>
            <div className="group relative flex items-start space-x-3 p-4">
              <div className="flex-shrink-0">
                <span
                  className={classNames(game.disabled ? 'bg-gray-300' : game.iconColor, ' relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-lg')}
                >
                  <game.icon aria-hidden="true" className="h-6 w-6" />
                  {game.disabled && <LockClosedIcon className="absolute size-4 -right-1 -bottom-1" />}
                </span>
              </div>
              <div className="min-w-0 flex-1 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    <a>
                      {game.type}
                    </a>
                  </div>
                  <p className="text-sm text-gray-500">{game.description}</p>
                </div>
                {game.disabled && (
                  <span className="hidden sm:block absolute left-1/2 -translate-x-1/2 inline-flex items-center rounded-md bg-gray-300 px-2 py-1 text-xs font-medium text-gray-600">
                    Unlock this feature
                  </span>
                )}
              </div>
              <div className="flex-shrink-0 self-center">
                <ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-gray-400 group-hover:text-gray-500" />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
