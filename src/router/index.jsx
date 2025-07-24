import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Trading from '../pages/Trading';
import History from '../pages/History';
import Account from '../pages/Account';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Trading />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'trading',
        element: <Trading />
      },
      {
        path: 'history',
        element: <History />
      },
      {
        path: 'account',
        element: <Account />
      }
    ]
  }
]);
