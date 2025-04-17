import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import BrowseMovies from "../pages/BrowseMovies";
import Dashboard from "../pages/Dashboard";
import Friends from "../pages/Friends";
import Library from "../pages/Library";
import Login from "../pages/Login";
import MovieDetails from "../pages/MovieDetails";
import MyReviews from "../pages/MyReviews";
import Profile from "../pages/Profile";
import ProfileDetail from "../pages/ProfileDetail";
import Settings from "../pages/Settings";
import Watchlist from "../pages/Watchlist";
import Wishlist from "../pages/Wishlist";
import { accessKey } from "../utils/api";

const isAuthenticated = () => {
  return !!localStorage.getItem(accessKey);
};

const AuthGuard = ({ element }: { element: React.ReactNode }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

const routes = createBrowserRouter([
  {
    path: "/",
    element: <AuthGuard element={<MainLayout />} />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "profile/:id",
        element: <ProfileDetail />,
      },
      {
        path: "browse",
        element: <BrowseMovies />,
      },
      {
        path: "watchlist",
        element: <Watchlist />,
      },
      {
        path: "wishlist",
        element: <Wishlist />,
      },
      {
        path: "library",
        element: <Library />,
      },
      {
        path: "reviews",
        element: <MyReviews />,
      },
      {
        path: "friends",
        element: <Friends />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
      {
        path: "movie/:id",
        element: <MovieDetails />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

export default routes;
