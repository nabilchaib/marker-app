import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import { Provider } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, onAuthStateChanged } from './firebase';
import { addOrGetUserApi } from './firebase/api';
import store from './redux/store';
import { addUser } from './redux/user-reducer';
import './index.css';
import App from './App';
import Sidebar from './pages/Sidebar';
import Games from './pages/Games';
import AddGame from './pages/AddGame';
import AddPickUpGame from './pages/AddPickUpGame';
import AddTeam from './pages/AddTeam';
import EditTeam from './pages/EditTeam';
import EditPlayer from './pages/EditPlayer';
import AddPlayer from './pages/AddPlayer';
import AddDrill from './pages/AddDrill';
import Login from './pages/Login';
import reportWebVitals from './reportWebVitals';
import Teams from './pages/Teams';
import Players from './pages/Players';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import TeamSelectionPage from './components/TeamSelection';
import CreateTeamPage from './components/CreateTeam';
import "react-toastify/dist/ReactToastify.css";
import DrillTracking from './components/DrillTracking';

const Protected = ({ children, type }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return null;
  }

  if (!user && type !== 'login') {
    return <Navigate to="/login" />;
  }

  if (user && type === 'login') {
    return <Navigate to="/" />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Protected>
      <Sidebar />
    </Protected>,
    children: [
      {
        index: true,
        element: <Games />
      },
      {
        path: 'games',
        element: <Games />
      },
      {
        path: 'games/create',
        element: <AddGame />
      },
      {
        path: 'games/teams/create',
        element: <AddTeam />
      },
      {
        path: 'games/teams/edit',
        element: <EditTeam />
      },
      {
        path: 'games/teams/players/create',
        element: <AddPlayer />
      },
      {
        path: 'games/teams/players/edit',
        element: <EditPlayer />
      },
      {
        path: 'pick-up-game/create',
        element: <AddPickUpGame />
      },
      {
        path: 'drill/create',
        element: <AddDrill />
      },
      {
        path: 'drill/tracking',
        element: <DrillTracking />
      },
      {
        path: 'teams',
        element: <Teams />
      },
      {
        path: 'players',
        element: <Players />
      }
    ]
  },
  {
    path: '/login',
    element: <Protected type="login">
      <Login />
    </Protected>
  },
  {
    path: "/teamselection",
    element: <Protected>
      <TeamSelectionPage />
    </Protected>
  },
  {
    path: "/createteam",
    element: <Protected><CreateTeamPage /></Protected>
  },
  {
    path: "/start-game",
    element: <Protected><App /></Protected>
  }

]);

const MainApp = () => {
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userFromStore = store.getState()?.user?.email;
        if (!userFromStore) {
          const fetchedUser = await addOrGetUserApi({ email: user.email });
          store.dispatch(addUser({ user: fetchedUser }));
        }
      } else {
        store.dispatch({ type: 'resetStore' });
      }
    });
  }, []);

  return (
    <Provider store={store}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
      <ToastContainer />
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MainApp />);

reportWebVitals();
