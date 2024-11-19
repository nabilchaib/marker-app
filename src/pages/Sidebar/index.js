import { useMemo, useState, Fragment } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Dialog, DialogBackdrop, DialogPanel, TransitionChild } from '@headlessui/react'
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';
import { auth, signOut } from '../../firebase';
import Icon from '../../components/Icon';
import Dropdown from '../../components/Dropdown';
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [topDropdownEl, setTopDropdownEl] = useState(null);
  const [sideDropdownEl, setSideDropdownEl] = useState(null);
  const topDropdownOpen = Boolean(topDropdownEl);
  const sideDropdownOpen = Boolean(sideDropdownEl);

  const user = useSelector(state => state.user);
  const navigate = useNavigate();
  const location = useLocation();

  const onOpenTopDropdown = (e) => {
    setTopDropdownEl(e.currentTarget);
  };

  const onCloseTopDropdown = () => {
    setTopDropdownEl(null);
  };

  const onOpenSideDropdown = (e) => {
    setSideDropdownEl(e.currentTarget);
  };

  const onCloseSideDropdown = () => {
    setSideDropdownEl(null);
  };

  const onProfileClick = () => {
    onCloseSideDropdown();
    onCloseTopDropdown();
  };

  const navigation = useMemo(
    () => [
      { name: 'Games', href: '/games', icon: (props) => <Icon type="hoop" {...props} />, current: isCurrentMenu('games', location.pathname) },
      { name: 'Teams', href: '/teams', icon: (props) => <Icon type="jersey" {...props} />, current: location.pathname === '/teams' },
      { name: 'Players', href: '/players', icon: (props) => <Icon type="player" {...props} />, current: location.pathname === '/players' }, // Added Players menu
    ],
    [location.pathname]
  );

  const onLogout = async () => {
    onCloseSideDropdown();
    onCloseTopDropdown();

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

  const dropdownItems = [
    { text: 'Your profile', icon: UserCircleIcon, onClick: onProfileClick },
    { text: 'Log out', icon: MoonIcon, onClick: onLogout },
  ];

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
                <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2 outline-none focus-visible:outline-orange-600 focus-visible:rounded-md">
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
              <div className="flex h-16 items-center">
                <button className="flex items-center outline-none focus-visible:outline-orange-700 focus-visible:rounded-md">
                  <img
                    alt="HoopTrackr"
                    src="/hoop-trackr-logo-ball.svg"
                    className="h-8 w-auto"
                  />
                  <img
                    alt="HoopTrackr"
                    src="/hoop-trackr-logo-text.svg"
                    className="mt-2 ml-1 h-8 w-auto"
                  />
                </button>
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2">
                      {navigation.map((item) => (
                        <li key={item.name} className="mb-2">
                          <button
                            className={classNames(
                              item.current
                                ? 'bg-orange-700 text-white'
                                : 'text-orange-200 hover:bg-orange-700 hover:text-white',
                              'w-full cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 outline-none focus-visible:outline-orange-700 focus-visible:rounded-md',
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
                          </button>
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
            <button className="flex items-center outline-none focus-visible:outline-orange-700 focus-visible:rounded-md">
              <img
                alt="HoopTrackr"
                src="/hoop-trackr-logo-ball.svg"
                className="h-8 w-auto"
              />
              <img
                alt="HoopTrackr"
                src="/hoop-trackr-logo-text.svg"
                className="mt-2 ml-1 h-8 w-auto"
              />
            </button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2">
                  {navigation.map((item) => (
                    <li key={item.name} className="mb-2">
                      <button
                        className={classNames(
                          item.current
                            ? 'bg-orange-700 text-white'
                            : 'text-orange-200 hover:bg-orange-700 hover:text-white',
                          'w-full cursor-pointer group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 outline-none focus-visible:outline-orange-700 focus-visible:rounded-md',
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
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="-mx-6 mt-auto">
                <button onClick={onOpenSideDropdown} className="text-sm font-semibold leading-6 text-white hover:bg-orange-700 w-full px-6 py-3 flex items-center gap-x-3 outline-none outline-offset-[-3px] focus-visible:outline-orange-700">
                  <Icon className="h-8 w-8" type="avatar" />
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true">{user.firstName} {user.lastName}</span>
                </button>

                <Dropdown
                  anchorEl={sideDropdownEl}
                  open={sideDropdownOpen}
                  items={dropdownItems}
                  onOpen={onOpenSideDropdown}
                  onClose={onCloseSideDropdown}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                  }}
                  transformOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                />
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-orange-600 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
        <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2 text-orange-200 lg:hidden outline-none focus-visible:outline-orange-700 focus-visible:rounded-md">
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="h-6 w-6" />
        </button>
        <div className="flex-1 text-sm font-semibold leading-6 text-white">
          <button className="flex items-center outline-none focus-visible:outline-orange-700 focus-visible:rounded-md">
            <img
              alt="HoopTrackr"
              src="/hoop-trackr-logo-ball.svg"
              className="h-8 w-auto"
            />
            <img
              alt="HoopTrackr"
              src="/hoop-trackr-logo-text.svg"
              className="mt-2 ml-1 h-8 w-auto"
            />
          </button>
        </div>
        <button onClick={onOpenTopDropdown} className="flex outline-none focus-visible:outline-orange-700 focus-visible:rounded-md">
          <span className="sr-only">Your profile</span>
          <Icon className="h-8 w-8" type="avatar" />
        </button>
        <Dropdown
          anchorEl={topDropdownEl}
          open={topDropdownOpen}
          items={dropdownItems}
          onOpen={onOpenTopDropdown}
          onClose={onCloseTopDropdown}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
        />
      </div>


      <main className="lg:pl-72">
        <Outlet />
      </main>
    </div>
  );
}
