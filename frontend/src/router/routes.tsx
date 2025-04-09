import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import MovieDetails from "../pages/MovieDetails";
import Profile from "../pages/Profile";
import BrowseMovies from "../pages/BrowseMovies";
import Watchlist from "../pages/Watchlist";
import Wishlist from "../pages/Wishlist";
import Library from "../pages/Library";
import MyReviews from "../pages/MyReviews";
import Friends from "../pages/Friends";
import Settings from "../pages/Settings";

// Auth guard for protected routes
const isAuthenticated = () => {
  return !!localStorage.getItem("accessToken");
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
