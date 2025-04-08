import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import MovieIcon from '@mui/icons-material/Movie';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SettingsIcon from '@mui/icons-material/Settings';
import { Tooltip } from '@mui/material';

type NavigationItem = {
  name: string;
  path: string;
  icon: JSX.Element;
};

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigationItems: NavigationItem[] = [
    { name: 'Home', path: '/', icon: <HomeIcon /> },
    { name: 'Movies', path: '/movies', icon: <MovieIcon /> },
    { name: 'Library', path: '/library', icon: <LibraryBooksIcon /> },
    { name: 'Watchlist', path: '/watchlist', icon: <WatchLaterIcon /> },
    { name: 'Wishlist', path: '/wishlist', icon: <BookmarkIcon /> },
    { name: 'Friends', path: '/friends', icon: <PeopleIcon /> },
    { name: 'Reviews', path: '/reviews', icon: <RateReviewIcon /> },
    { name: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside
      className={`flex h-screen flex-col border-r bg-background transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex h-16 items-center justify-between border-b px-4">
        {!isCollapsed && (
          <Link to="/" className="text-xl font-bold text-primary">
            MovieFlow
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          {isCollapsed ? '>>' : '<<'}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <li key={item.path}>
              <Tooltip title={isCollapsed ? item.name : ''} placement="right">
                <Link
                  to={item.path}
                  className={`flex items-center rounded-md px-3 py-2 transition-colors ${
                    isActive(item.path)
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <span className="mr-3">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </Tooltip>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t p-4">
        {!isCollapsed && (
          <div className="text-xs text-muted-foreground">
            &copy; 2023 MovieFlow
          </div>
        )}
      </div>
    </aside>
  );
} 