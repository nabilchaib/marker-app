import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { ToastContainer } from 'react-toastify'
import { Navigate } from 'react-router-dom'
import { Provider } from 'react-redux';
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, onAuthStateChanged, signOut } from './firebase';
import { addOrGetUserApi } from './firebase/api';
import store from './redux/store';
import { addUser } from './redux/user-reducer';
import './index.css';
import App from './App';
import Login from './pages/Login';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import TeamSelectionPage from './components/TeamSelection';
import "react-toastify/dist/ReactToastify.css";

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
    path: "/",
    element: <Protected>
      <App />
    </Protected>,
  },
  {
    path: "/login",
    element: <Protected type="login">
      <Login />
    </Protected>
  },
  {
    path: "/teamselection",
    element: <Protected>
      <TeamSelectionPage />
    </Protected>
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

  const onSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.log('ERR SIGNING OUT: ', err)
    }
  };

  return (
    <Provider store={store}>
      <React.StrictMode>
        <RouterProvider router={router} />
      </React.StrictMode>
      <button className="absolute" onClick={onSignOut}> sign out</button>
      <ToastContainer />
    </Provider>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<MainApp />);

reportWebVitals();
