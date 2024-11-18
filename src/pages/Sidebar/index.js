import { useMemo, useState, Fragment } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild, Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { auth, signOut } from '../../firebase';
import Icon from '../../components/Icon';
import { classNames } from '../../utils';

const isCurrentMenu = (menu, path) => {
  const menuMap = {
    '/': 'games',
    '/games': 'games',
    '/games/create': 'games',
    '/games/teams/create': 'games',
    '/pick-up-game/create': 'games',
    '/teams': 'teams',
    '/players': 'players', // Added mapping for players page
  };

  return menu === menuMap[path];
};

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  // Define navigation menu items
  const navigation = useMemo(
    () => [
      { name: 'Games', href: '/games', icon: (props) => <Icon type="hoop" {...props} />, current: isCurrentMenu('games', location.pathname) },
      { name: 'Teams', href: '/teams', icon: (props) => <Icon type="jersey" {...props} />, current: location.pathname === '/teams' },
      { name: 'Players', href: '/players', icon: (props) => <Icon type="player" {...props} />, current: location.pathname === '/players' }, // Added Players menu
    ],
    [location.pathname]
  );

  const onLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };

  const onNavigation = (item) => {
    setSidebarOpen(false);
    navigate(item.href);
  };

  return (
    <div>
      {/* Sidebar for Mobile */}
      <Dialog open={sidebarOpen} onClose={setSidebarOpen} className="relative z-50 lg:hidden">
      <DialogBackdrop
          transition
          className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />
        {/* <DialogBackdrop className="fixed inset-0 bg-gray-900/80 transition-opacity duration-300 ease-linear" /> */}
        <div className="fixed inset-0 flex">
        <DialogPanel
            transition
            className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out data-[closed]:-translate-x-full"
          >
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out data-[closed]:opacity-0">
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                </button>
              </div>
            </TransitionChild>
            {/* Sidebar component, swap this element with another sidebar if you like */}
 
          {/* <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out">
            <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
              <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
              </button>
            </div> */}
            <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-orange-600 px-6 pb-2">
              <div className="flex h-16 shrink-0 items-center">
                <button className="flex items-center">
                  <img alt="HoopTrackr" src="/hoop-trackr-logo-ball.svg" className="h-8 w-auto" />
                  <img alt="HoopTrackr" src="/hoop-trackr-logo-text.svg" className="mt-2 ml-1 h-8 w-auto" />
                </button>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <a
                            className={classNames(
                              item.current
                              ? 'bg-orange-700 text-white'
                              : 'text-orange-200 hover:bg-orange-700 hover:text-white',
                              'cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                              )}
                            onClick={() => onNavigation(item)}
                          >
                            <item.icon
                              aria-hidden="true"
                              className={classNames(
                                item.current ? 'text-white' : 'text-orange-200 group-hover:text-white',
                                'h-6 w-6 shrink-0'
                              )}
                            />
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Sidebar for Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-orange-600 px-6">
          <div className="flex items-center h-16 shrink-0">
            <button className="flex items-center">
              <img alt="HoopTrackr" src="/hoop-trackr-logo-ball.svg" className="h-8 w-auto" />
              <img alt="HoopTrackr" src="/hoop-trackr-logo-text.svg" className="mt-2 ml-1 h-8 w-auto" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <a
                        className={classNames(
                          item.current
                          ? 'bg-orange-700 text-white'
                          : 'text-orange-200 hover:bg-orange-700 hover:text-white',
                          'cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6'
                          )}
                        onClick={() => onNavigation(item)}
                      >
                        <item.icon
                          aria-hidden="true"
                          className={classNames(
                            item.current ? 'text-white' : 'text-orange-200 group-hover:text-white',
                            'h-6 w-6 shrink-0'
                          )}
                        />
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <Menu>
                  <MenuButton as={Fragment}>
                    <a
                      href="#"
                      className="flex items-center gap-x-3 px-6 py-3 text-sm font-semibold leading-6 text-white hover:bg-orange-700"
                    >
                      <Icon className="h-8 w-8" type="avatar" />
                      <span>{user.firstName} {user.lastName}</span>
                    </a>
                  </MenuButton>
                  <MenuItems
                    anchor={{ to: "top end", offset: '1rem' }}
                    className="z-100 w-52 bg-white rounded-xl border border-gray/5 p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
                  >
                    <MenuItem>
                      <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3">
                        <UserCircleIcon className="h-4 w-4" />
                        Your profile
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <button onClick={onLogout} className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3">
                        <MoonIcon className="h-4 w-4" />
                        Log out
                      </button>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-orange-600 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-orange-200 lg:hidden">
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-white">
          <button className="flex items-center">
            <img
              alt="Your Company"
              src="/hoop-trackr-logo-ball.svg"
              className="h-8 w-auto"
            />
            <img
              alt="Your Company"
              src="/hoop-trackr-logo-text.svg"
              className="mt-2 ml-1 h-8 w-auto"
            />
          </button>
        </div>
        <Menu>
          <MenuButton as={Fragment}>
            <a href="#">
              <span className="sr-only">Your profile</span>
              <Icon className="h-8 w-8" type="avatar" />
            </a>
          </MenuButton>
          <MenuItems
            anchor={{ to: "bottom", offset: '-4.5rem' }}
            className="z-100 w-52 bg-white rounded-xl border border-gray/5 p-1 text-sm/6 transition duration-100 ease-out [--anchor-gap:var(--spacing-1)] focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
          >
            <MenuItem>
              <button className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-gray-200">
                <UserCircleIcon className="size-4 fill-white/30" />
                Your profile
              </button>
            </MenuItem>
            <MenuItem>
              <button onClick={onLogout} className="group flex w-full items-center gap-2 rounded-lg py-1.5 px-3 data-[focus]:bg-gray-200">
                <MoonIcon className="size-4 fill-white/30" />
                Log out
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>


      <main className="lg:pl-72">
        <Outlet />
      </main>
    </div>
  );
}
