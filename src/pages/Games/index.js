import { Fragment } from 'react'
import { useNavigate } from 'react-router-dom';
import { ChevronRightIcon, LockClosedIcon, EllipsisHorizontalIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/solid'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react'
import Icon from '../../components/Icon';
import { classNames } from '../../utils';

const games = [
  {
    type: 'Pick-up game',
    id: 1,
    teamA: 'Bulls',
    teamB: 'Wolves',
    createdAt: '2023-01-23T13:23Z',
    completed: false
  },
  {
    type: 'Pick-up game',
    id: 2,
    teamA: 'Bears',
    teamB: 'Hurricanes',
    createdAt: '2023-01-24T13:23Z',
    completed: true,
  },
  {
    type: 'Drill',
    id: 3,
    category: '3pts shooting',
    createdAt: '2023-01-25T13:23Z',
    completed: true,
  },
]

const getIconBackgroundColor = type => {
  if (type === 'Drill') {
    return 'bg-orange-300';
  }

  return 'bg-orange-200'
};

const getGameTitle = game => {
  if (game.type === 'Pick-up game') {
    return `${game.teamA} vs ${game.teamB}`;
  }

  return game.category;
};

const getGameIcon = game => {
  if (game.type === 'Pick-up game') {
    return <Icon type="hoop" className="h-6 w-6" />
  }

  return <Icon type="drill" className="h-6 w-6" />
};

export default function AddGame() {
  const navigate = useNavigate();

  const onNewGameClick = () => {
    navigate('/games/create');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex justify-between items-start">
        <h2 className="text-base font-semibold leading-6 text-gray-900">Active games</h2>
        <button
          type="button"
          className="inline-flex items-center rounded-md bg-orange-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-600"
          onClick={onNewGameClick}
        >
          <PlusIcon aria-hidden="true" className="-ml-0.5 mr-1.5 h-5 w-5" />
          New Game
        </button>
      </div>
      <ul
        role="list"
        className="divide-y divide-gray-100 overflow-hidden bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl"
      >
        {games.map((game) => (
          <li key={game.id} className="cursor-pointer relative flex justify-between gap-x-6 px-4 py-4 hover:bg-orange-100">
            <div className="flex min-w-0 gap-x-4">
              <div className={classNames(getIconBackgroundColor(game.type), "relative inline-flex p-2 h-10 w-10 items-center justify-center rounded-lg")}>
                {getGameIcon(game)}
              </div>
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">
                  <a>
                    {getGameTitle(game)}
                  </a>
                </p>
                <p className="mt-1 flex text-xs leading-5 text-gray-500">
                  <a className="relative truncate">
                    {game.type}
                  </a>
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-x-4">
              <Menu>
                <MenuButton as={Fragment}>
                  <EllipsisHorizontalIcon aria-hidden="true" className="h-5 w-5 flex-none text-gray-400 hover:text-gray-500" />
                </MenuButton>
                <MenuItems
                  anchor={{ to: "bottom end" }}
                  className="z-100 w-52 bg-white rounded-xl border border-gray/5 p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                >
                  <MenuItem>
                    <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-gray-200">
                      <TrashIcon className="size-4" />
                      Delete
                    </button>
                  </MenuItem>
                </MenuItems>
              </Menu>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
