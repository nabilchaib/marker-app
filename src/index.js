import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import { ToastContainer } from 'react-toastify';
import { Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, onAuthStateChanged } from './firebase';
import { addOrGetUserApi } from './firebase/api';
import { store, persistor } from './redux/store';
import { addUser } from './redux/user-reducer';
import { initAnalytics, identifyUser, resetUser, trackSignedUp } from './analytics';
import Sidebar from './pages/Sidebar';
import Games from './pages/Games';
import AddGame from './pages/AddGame';
import AddPickUpGame from './pages/AddPickUpGame';
import AddTeam from './pages/AddTeam';
import PickUpGame from './pages/PickUpGame';
import DrillTracking from './pages/DrillTracking';
import EditTeam from './pages/EditTeam';
import EditPlayer from './pages/EditPlayer';
import AddPlayer from './pages/AddPlayer';
import AddDrill from './pages/AddDrill';
import Login from './pages/Login';
import reportWebVitals from './reportWebVitals';
import Teams from './pages/Teams';
import Players from './pages/Players';
import Tournaments from './pages/Tournaments';
import AddTournament from './pages/AddTournament';
import TournamentDetail from './pages/TournamentDetail';
import LandingPage from './pages/LandingPage';
import Demo from './pages/Demo';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import './index.css';

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.2,
  });
}

initAnalytics();

const Protected = ({ children, type }) => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return null;
  }

  if (!user) {
    if (type === 'login') {
      return children;
    }
    return <Navigate to="/landing" />;
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
        path: 'games/pick-up-game/create',
        element: <AddPickUpGame />
      },
      {
        path: 'games/drill/create',
        element: <AddDrill />
      },
      {
        path: 'teams',
        element: <Teams />
      },
      {
        path: 'teams/create',
        element: <AddTeam />
      },
      {
        path: 'teams/edit',
        element: <EditTeam />
      },
      {
        path: 'players',
        element: <Players />
      },
      {
        path: 'players/create',
        element: <AddPlayer />
      },
      {
        path: 'players/edit',
        element: <EditPlayer />
      },
      {
        path: 'tournaments',
        element: <Tournaments />
      },
      {
        path: 'add-tournament',
        element: <AddTournament />
      },
      {
        path: 'tournaments/:tournamentId',
        element: <TournamentDetail />
      },
    ]
  },
  {
    path: '/landing',
    element: <LandingPage />
  },
  {
    path: '/demo',
    element: <Demo />
  },
  {
    path: '/login',
    element: <Protected type="login">
      <Login />
    </Protected>
  },
  {
    path: 'games/pick-up-game/:id',
    element: <Protected>
      <PickUpGame />
    </Protected>
  },
  {
    path: 'games/drill/:id',
    element: <Protected>
      <DrillTracking />
    </Protected>
  },
]);

const MainApp = () => {
  const [, loading] = useAuthState(auth);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        identifyUser(user.email);
        const userFromStore = store.getState()?.user?.email;
        if (!userFromStore) {
          const fetchedUser = await addOrGetUserApi({ email: user.email });
          if (fetchedUser?.isNew) trackSignedUp();
          store.dispatch(addUser({ user: fetchedUser }));
        }
      } else {
        resetUser();
        store.dispatch({ type: 'resetStore' });
      }
    });
  }, []);

  if (loading) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <React.StrictMode>
          <Sentry.ErrorBoundary fallback={<div style={{ padding: 32, color: '#fff', background: '#0e191d' }}>Something went wrong. Please refresh the page.</div>}>
            <RouterProvider router={router} />
          </Sentry.ErrorBoundary>
        </React.StrictMode>
        <ToastContainer />
      </PersistGate>
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MainApp />);

reportWebVitals();
