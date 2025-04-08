import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import NotFound from '../pages/NotFound';
import Movies from '../pages/Movies';
import MovieDetail from '../pages/MovieDetail';
import Watchlist from '../pages/Watchlist';
import Wishlist from '../pages/Wishlist';
import Library from '../pages/Library';
import Friends from '../pages/Friends';
import Reviews from '../pages/Reviews';
import Settings from '../pages/Settings';

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'movies',
        element: <Movies />,
      },
      {
        path: 'movie/:id',
        element: <MovieDetail />,
      },
      {
        path: 'watchlist',
        element: <Watchlist />,
      },
      {
        path: 'wishlist',
        element: <Wishlist />,
      },
      {
        path: 'library',
        element: <Library />,
      },
      {
        path: 'friends',
        element: <Friends />,
      },
      {
        path: 'reviews',
        element: <Reviews />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
]);

export default function Router() {
  return <RouterProvider router={router} />;
} 