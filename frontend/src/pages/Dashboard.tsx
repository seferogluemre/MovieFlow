import {
  AccessTime,
  MovieOutlined,
  People,
  RateReview,
} from "@mui/icons-material";
import { Alert, Box, CircularProgress, Grid, Typography } from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import MovieCard from "../components/MovieCard";
import SectionHeader from "../components/SectionHeader";
import StatCard from "../components/StatCard";
import { demoMovies, demoWatchlist } from "../data/mockData";
import { checkApiHealth, userIdKey, userService } from "../utils/api";
import {
  Library,
  LibraryItem,
  Movie,
  User,
  UserStats,
  Watchlist,
  WatchlistItem,
} from "../utils/types";

const Dashboard: FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    moviesWatched: 0,
    reviewsCount: 0,
    friendsCount: 0,
    watchTime: 0,
  });
  const [recentlyWatched, setRecentlyWatched] = useState<Library[]>([]);
  const [watchlist, setWatchlist] = useState<Watchlist[]>([]);
  const [useDemo, setUseDemo] = useState(false);
  const [movieCache, setMovieCache] = useState<Record<number, Movie>>({});

  const userId = parseInt(localStorage.getItem(userIdKey) || "1");

  const checkApiAvailability = useCallback(async () => {
    try {
      const isAvailable = await checkApiHealth();
      setApiAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      setApiAvailable(false);
      return false;
    }
  }, []);

  // Get movie details for library and watchlist items
  const fetchMovieDetails = useCallback(
    async (movieId: number): Promise<Movie | null> => {
      if (movieCache[movieId]) {
        return movieCache[movieId];
      }

      try {
        const response = await fetch(
          `http://localhost:3000/api/movies/${movieId}`
        );

        if (!response.ok) {
          const demoMovie = [...demoMovies, ...demoWatchlist].find(
            (m) => m.id === movieId
          );
          if (demoMovie) {
            // Önbelleğe ekle
            setMovieCache((prev) => ({
              ...prev,
              [movieId]: demoMovie as Movie,
            }));

            return demoMovie as Movie;
          }
          return null;
        }

        const rawData = await response.json();

        // API yanıtının yapısını kontrol edelim
        let movie: Movie | null = null;

        if (rawData && rawData.data && typeof rawData.data === "object") {
          // Normal API yanıtı (data içinde)
          movie = rawData.data as Movie;
        } else if (rawData && rawData.id && rawData.title) {
          // Direkt film objesi
          movie = rawData as Movie;
        } else {
          return null;
        }

        if (!movie) {
          return null;
        }

        setMovieCache((prev) => ({
          ...prev,
          [movieId]: movie!,
        }));

        return movie;
      } catch (error) {
        const demoMovie = [...demoMovies, ...demoWatchlist].find(
          (m) => m.id === movieId
        );
        if (demoMovie) {
          return demoMovie as Movie;
        }

        return null;
      }
    },
    [movieCache]
  );

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);

      try {
        const userData = await userService.getCurrentUser();

        if (!userData) {
          throw new Error("Kullanıcı verileri alınamadı");
        }

        setUser(userData);

        const {
          library = [],
          watchlist = [],
          reviews = [],
          friendsOf = [],
          friends = [],
        } = userData;

        // Kullanıcı istatistiklerini hesapla
        const allFriends = [...friendsOf, ...friends].filter(
          (f) => f.status === "ACCEPTED"
        );

        const libraryWithMovies = await Promise.all(
          library.map(async (item: LibraryItem) => {
            const movie = await fetchMovieDetails(item.movieId);
            return { ...item, movie };
          })
        );

        const watchlistWithMovies = await Promise.all(
          watchlist.map(async (item: WatchlistItem) => {
            const movie = await fetchMovieDetails(item.movieId);
            return { ...item, movie };
          })
        );
        const watchTimeHours = libraryWithMovies.reduce(
          (total: number, item: LibraryItem) => {
            const duration = item.movie?.duration || 120;
            return total + duration / 60;
          },
          0
        );

        const newStats = {
          moviesWatched: library.length,
          reviewsCount: reviews.length,
          friendsCount: allFriends.length,
          watchTime: Math.round(watchTimeHours),
        };
        setUserStats(newStats);

        // Son izlenen filmleri sırala
        const sortedLibrary = [...libraryWithMovies].sort((a, b) => {
          const dateA = a.lastWatched
            ? new Date(a.lastWatched)
            : new Date(a.addedAt);
          const dateB = b.lastWatched
            ? new Date(b.lastWatched)
            : new Date(b.addedAt);
          return dateB.getTime() - dateA.getTime();
        });

        // Verileri ayarla
        setRecentlyWatched(sortedLibrary.slice(0, 3));
        setWatchlist(watchlistWithMovies.slice(0, 3));
        setUseDemo(false);
        setApiAvailable(true);
      } catch (apiError) {
        setUseDemo(true);
        setUserStats({
          moviesWatched: 42,
          reviewsCount: 18,
          friendsCount: 15,
          watchTime: 86,
        });

        const demoLibrary = demoMovies.map((movie, index) => ({
          id: index + 1,
          userId: userId,
          movieId: movie.id,
          addedAt: new Date(Date.now() - index * 86400000).toISOString(), // Farklı günler
          lastWatched: new Date(Date.now() - index * 86400000).toISOString(),
          movie: movie as Movie,
        }));

        const demoWatchlistItems = demoWatchlist.map((movie, index) => ({
          id: index + 1,
          userId: userId,
          movieId: movie.id,
          addedAt: new Date(Date.now() - index * 86400000).toISOString(),
          movie: movie as Movie,
        }));

        setRecentlyWatched(demoLibrary);
        setWatchlist(demoWatchlistItems);
      }

      setLoading(false);
    } catch (err) {
      setError("Veriler yüklenemedi. Lütfen daha sonra tekrar deneyin.");
      setLoading(false);
      setUseDemo(true);

      // Demo veriler
      setUserStats({
        moviesWatched: 42,
        reviewsCount: 18,
        friendsCount: 15,
        watchTime: 86,
      });

      // Demo film verilerine çevirelim
      const demoLibrary = demoMovies.map((movie, index) => ({
        id: index + 1,
        userId: userId,
        movieId: movie.id,
        addedAt: new Date(Date.now() - index * 86400000).toISOString(),
        lastWatched: new Date(Date.now() - index * 86400000).toISOString(),
        movie: movie as Movie,
      }));

      const demoWatchlistItems = demoWatchlist.map((movie, index) => ({
        id: index + 1,
        userId: userId,
        movieId: movie.id,
        addedAt: new Date(Date.now() - index * 86400000).toISOString(),
        movie: movie as Movie,
      }));

      setRecentlyWatched(demoLibrary);
      setWatchlist(demoWatchlistItems);
    }
  }, [checkApiAvailability, userId, fetchMovieDetails]);

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

  return (
    <Box>
      {apiAvailable === false && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Backend API'ye ulaşılamıyor. Lütfen backend sunucusunun çalıştığından
          emin olun.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {useDemo && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          API bağlantısı kurulamadı. Demo veriler gösteriliyor.
        </Alert>
      )}

      <Typography variant="h4" fontWeight="bold" mb={4}>
        Hoş geldin, {user?.name || user?.username || "Kullanıcı"}!
      </Typography>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
          <StatCard
            title="İzlenen Filmler"
            value={userStats.moviesWatched}
            subtitle={`Geçen aydan +3`}
            icon={<MovieOutlined fontSize="large" />}
            iconColor="primary.main"
          />
        </Grid>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
          <StatCard
            title="Yazılan Değerlendirmeler"
            value={userStats.reviewsCount}
            subtitle={`Geçen aydan +2`}
            icon={<RateReview fontSize="large" />}
            iconColor="secondary.main"
          />
        </Grid>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
          <StatCard
            title="İzleme Süresi"
            value={`${userStats.watchTime}s`}
            subtitle={`Geçen aydan +12s`}
            icon={<AccessTime fontSize="large" />}
            iconColor="warning.main"
          />
        </Grid>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
          <StatCard
            title="Arkadaşlar"
            value={userStats.friendsCount}
            subtitle={`+2 yeni arkadaş`}
            icon={<People fontSize="large" />}
            iconColor="success.main"
          />
        </Grid>
      </Grid>

      {/* Recently Watched Section */}
      <Box mb={5}>
        <SectionHeader
          title="Son İzlenenler"
          subtitle="Son zamanlarda izlediğiniz filmler."
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
              Henüz hiç film izlemediniz.
            </Typography>
          )}
        </Box>
      </Box>

      {/* Watchlist Section */}
      <Box mb={5}>
        <SectionHeader
          title="İzleme Listesi"
          subtitle="İzlemek istediğiniz filmler."
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
              İzleme listeniz boş.
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
