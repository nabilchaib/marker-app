import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom'
import { Provider } from 'react-redux';
import store from './redux/store';
import './index.css';
import App from './App';
import Login from './pages/Login';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import TeamSelectionPage from './components/TeamSelection';

const Protected = ({ children }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const item = localStorage.getItem('auth');
    if (!item) {
      navigate('/login');
    }

  }, []);

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
    element: <Login />
  },
  {
    path: "/teamselection",
    element: <Protected>
      <TeamSelectionPage />
    </Protected>
  }
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>

  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
  </Provider>
);

reportWebVitals();
