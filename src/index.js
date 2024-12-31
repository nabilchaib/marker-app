import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, onAuthStateChanged } from './firebase';
import { addOrGetUserApi } from './firebase/api';
import { store, persistor } from './redux/store';
import { addUser } from './redux/user-reducer';
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
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import './index.css';

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
    ]
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
      <PersistGate loading={null} persistor={persistor}>
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
        <ToastContainer />
      </PersistGate>
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MainApp />);

reportWebVitals();
