import { FC, useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import {
  MovieOutlined,
  RateReview,
  People,
  AccessTime,
} from "@mui/icons-material";
import StatCard from "../components/StatCard";
import MovieCard from "../components/MovieCard";
import SectionHeader from "../components/SectionHeader";
import {
  userService,
  libraryService,
  watchlistService,
  reviewService,
  friendshipService,
} from "../utils/api";
import { Movie, Library, Watchlist, UserStats } from "../utils/types";

const Dashboard: FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    moviesWatched: 0,
    reviewsCount: 0,
    friendsCount: 0,
    watchTime: 0,
  });
  const [recentlyWatched, setRecentlyWatched] = useState<Library[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);

  // Get user ID from local storage
  const userId = parseInt(localStorage.getItem("userId") || "1");

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const user = await userService.getUserStats(userId);

      // Get library (recently watched)
      const library = await libraryService.getUserLibrary(userId);

      // Get watchlist
      const watchlist = await watchlistService.getUserWatchlist(userId);

      // Get reviews
      const reviews = await reviewService.getUserReviews(userId);

      // Get friends
      const friends = await friendshipService.getUserFriends(userId);

      // Calculate total watch time (in hours)
      const watchTimeHours = library.reduce((total, item) => {
        return total + (item.movie?.duration || 0) / 60;
      }, 0);

      setUserStats({
        moviesWatched: library.length,
        reviewsCount: reviews.length,
        friendsCount: friends.filter((f) => f.status === "ACCEPTED").length,
        watchTime: Math.round(watchTimeHours),
      });

      // Sort library by last watched date
      const sortedLibrary = [...library].sort(
        (a, b) =>
          new Date(b.lastWatched || b.addedAt).getTime() -
          new Date(a.lastWatched || a.addedAt).getTime()
      );

      setRecentlyWatched(sortedLibrary.slice(0, 3));
      setWatchlist(watchlist.slice(0, 3));
      setLoading(false);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={4}>
        Welcome back, John!
      </Typography>

      {/* Stats Row */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Movies Watched"
            value={userStats.moviesWatched}
            subtitle={`+3 from last month`}
            icon={<MovieOutlined fontSize="large" />}
            iconColor="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Reviews Written"
            value={userStats.reviewsCount}
            subtitle={`+2 from last month`}
            icon={<RateReview fontSize="large" />}
            iconColor="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Watch Time"
            value={`${userStats.watchTime}h`}
            subtitle={`+12h from last month`}
            icon={<AccessTime fontSize="large" />}
            iconColor="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Friends"
            value={userStats.friendsCount}
            subtitle={`+2 new friends`}
            icon={<People fontSize="large" />}
            iconColor="success.main"
          />
        </Grid>
      </Grid>

      {/* Recently Watched Section */}
      <Box mb={5}>
        <SectionHeader
          title="Recently Watched"
          subtitle="Movies you've watched recently."
          viewAllLink="/library"
        />
        <Box>
          {recentlyWatched.length > 0 ? (
            recentlyWatched.map((item) => (
              <MovieCard
                key={item.id}
                movie={item.movie!}
                watchedDate={item.lastWatched || item.addedAt}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              You haven't watched any movies yet.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Watchlist Section */}
      <Box mb={5}>
        <SectionHeader
          title="Watchlist"
          subtitle="Movies you want to watch."
          viewAllLink="/watchlist"
        />
        <Box>
          {watchlist.length > 0 ? (
            watchlist.map((item) => (
              <MovieCard
                key={item.id}
                movie={item.movie!}
                addedDate={item.addedAt}
              />
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              Your watchlist is empty.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
