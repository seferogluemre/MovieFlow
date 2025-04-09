import { FC, useEffect, useState, useCallback } from "react";
import { Box, Grid, Typography, CircularProgress, Alert } from "@mui/material";
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
  checkApiHealth,
} from "../utils/api";
import { Movie, Library, Watchlist, UserStats, User } from "../utils/types";

// API'den dönen film öğesinin tiplerini tanımlama
interface LibraryItem {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  lastWatched: string | null;
  movie?: Movie;
}

interface WatchlistItem {
  id: number;
  userId: number;
  movieId: number;
  addedAt: string;
  movie?: Movie;
}

// Demo verileri - API bağlantısı başarısız olduğunda gösterilecek
const demoMovies = [
  {
    id: 1,
    title: "The Shawshank Redemption",
    description:
      "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
    releaseYear: 1994,
    duration: 142,
    posterImage: "https://via.placeholder.com/300x450?text=Shawshank",
    director: "Frank Darabont",
    rating: 4.9,
    ageRating: "MATURE",
  },
  {
    id: 2,
    title: "The Godfather",
    description:
      "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
    releaseYear: 1972,
    duration: 175,
    posterImage: "https://via.placeholder.com/300x450?text=Godfather",
    director: "Francis Ford Coppola",
    rating: 4.8,
    ageRating: "MATURE",
  },
  {
    id: 3,
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    releaseYear: 2008,
    duration: 152,
    posterImage: "https://via.placeholder.com/300x450?text=Dark+Knight",
    director: "Christopher Nolan",
    rating: 4.7,
    ageRating: "TEEN",
  },
];

const demoWatchlist = [
  {
    id: 1,
    title: "Dune",
    description:
      "Feature adaptation of Frank Herbert's science fiction novel, about the son of a noble family entrusted with the protection of the most valuable asset and most vital element in the galaxy.",
    releaseYear: 2021,
    duration: 155,
    posterImage: "https://via.placeholder.com/300x450?text=Dune",
    director: "Denis Villeneuve",
    rating: 4.7,
    ageRating: "TEEN",
  },
  {
    id: 2,
    title: "Blade Runner 2049",
    description:
      "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
    releaseYear: 2017,
    duration: 164,
    posterImage: "https://via.placeholder.com/300x450?text=Blade+Runner",
    director: "Denis Villeneuve",
    rating: 4.5,
    ageRating: "MATURE",
  },
  {
    id: 3,
    title: "The Lord of the Rings: The Fellowship of the Ring",
    description:
      "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.",
    releaseYear: 2001,
    duration: 178,
    posterImage: "https://via.placeholder.com/300x450?text=LOTR",
    director: "Peter Jackson",
    rating: 4.9,
    ageRating: "TEEN",
  },
];

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

  // Get user ID from local storage
  const userId = parseInt(localStorage.getItem("userId") || "1");

  // API sağlık kontrolü
  const checkApiAvailability = useCallback(async () => {
    try {
      console.log("🔍 API sağlık kontrolü başlatıldı...");
      const isAvailable = await checkApiHealth();
      console.log(
        `✅ API sağlık kontrolü tamamlandı: ${
          isAvailable ? "Erişilebilir" : "Erişilemiyor"
        }`
      );
      setApiAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error("❌ API sağlık kontrolü hatası:", error);
      setApiAvailable(false);
      return false;
    }
  }, []);

  // Get movie details for library and watchlist items
  const fetchMovieDetails = useCallback(
    async (movieId: number): Promise<Movie | null> => {
      // Önbellekte varsa, oradan getir
      if (movieCache[movieId]) {
        return movieCache[movieId];
      }

      try {
        // API'ye istek gönder
        const response = await fetch(
          `http://localhost:3000/api/movies/${movieId}`
        );

        if (!response.ok) {
          console.error(
            `❌ Film ID=${movieId} alınamadı: ${response.status} ${response.statusText}`
          );
          // Hata durumunda demo verilerden bulalım
          const demoMovie = [...demoMovies, ...demoWatchlist].find(
            (m) => m.id === movieId
          );
          if (demoMovie) {
            console.log(`✅ Demo film kullanılıyor: ${demoMovie.title}`);

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
          console.error(
            `❌ Film ID=${movieId} için geçersiz veri yapısı:`,
            rawData
          );
          return null;
        }

        if (!movie) {
          console.error(
            `❌ Film ID=${movieId} için geçerli film verisi alınamadı`
          );
          return null;
        }

        // Önbelleğe ekle
        setMovieCache((prev) => ({
          ...prev,
          [movieId]: movie!,
        }));

        return movie;
      } catch (error) {
        console.error(`❌ Film ID=${movieId} alınamadı:`, error);

        // Hata durumunda demo verilerden bulalım
        const demoMovie = [...demoMovies, ...demoWatchlist].find(
          (m) => m.id === movieId
        );
        if (demoMovie) {
          console.log(`✅ Demo film kullanılıyor: ${demoMovie.title}`);
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
      console.log("🔍 Kullanıcı verileri yükleniyor...");

      try {
        // Kullanıcı bilgilerini çek
        console.log(`👤 Kullanıcı verisi çekiliyor: ID=${userId}`);
        const userData = await userService.getCurrentUser();
        console.log(
          "✅ Kullanıcı verisi alındı:",
          userData ? "Başarılı" : "Bulunamadı"
        );

        if (!userData) {
          throw new Error("Kullanıcı verileri alınamadı");
        }

        setUser(userData);
        console.log("👤 Kullanıcı:", userData.name || userData.username);

        // Verileri doğrudan API yanıtından al
        console.log("📝 Kullanıcı detayları işleniyor...");

        // userData içindeki verileri konsola logla
        console.log(
          "📚 Library:",
          userData.library ? `${userData.library.length} öğe` : "Yok"
        );
        console.log(
          "📋 Watchlist:",
          userData.watchlist ? `${userData.watchlist.length} öğe` : "Yok"
        );
        console.log(
          "✍️ Reviews:",
          userData.reviews ? `${userData.reviews.length} değerlendirme` : "Yok"
        );

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
        console.log(`👥 Toplam arkadaş sayısı: ${allFriends.length}`);

        // Library için film bilgilerini alalım
        console.log("🎬 Kütüphane filmleri detayları alınıyor...");
        const libraryWithMovies = await Promise.all(
          library.map(async (item: LibraryItem) => {
            console.log(`  🎬 Film ID=${item.movieId} detayları alınıyor...`);
            const movie = await fetchMovieDetails(item.movieId);
            return { ...item, movie };
          })
        );
        console.log(
          "✅ Kütüphane filmleri tamamlandı:",
          libraryWithMovies.length
        );

        // Watchlist için film bilgilerini alalım
        console.log("🎬 İzleme listesi filmleri detayları alınıyor...");
        const watchlistWithMovies = await Promise.all(
          watchlist.map(async (item: WatchlistItem) => {
            console.log(`  🎬 Film ID=${item.movieId} detayları alınıyor...`);
            const movie = await fetchMovieDetails(item.movieId);
            return { ...item, movie };
          })
        );
        console.log(
          "✅ İzleme listesi filmleri tamamlandı:",
          watchlistWithMovies.length
        );

        // İzleme süresini hesapla
        const watchTimeHours = libraryWithMovies.reduce(
          (total: number, item: LibraryItem) => {
            const duration = item.movie?.duration || 120;
            return total + duration / 60;
          },
          0
        );
        console.log(
          `⏱️ Toplam izleme süresi: ${Math.round(watchTimeHours)} saat`
        );

        // İstatistikleri güncelle
        const newStats = {
          moviesWatched: library.length,
          reviewsCount: reviews.length,
          friendsCount: allFriends.length,
          watchTime: Math.round(watchTimeHours),
        };
        console.log("📊 Hesaplanan istatistikler:", newStats);
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
        console.log("✅ Dashboard verileri başarıyla yüklendi");
      } catch (apiError) {
        console.error("❌ API veri çekme hatası:", apiError);
        setUseDemo(true);
        console.warn("⚠️ Demo verilere geçiliyor...");

        // Demo verilerini kullan
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
        console.log("✅ Demo veriler ayarlandı");
      }

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
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
        Welcome back, {user?.name || user?.username || "User"}!
      </Typography>

      {/* Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
          <StatCard
            title="Movies Watched"
            value={userStats.moviesWatched}
            subtitle={`+3 from last month`}
            icon={<MovieOutlined fontSize="large" />}
            iconColor="primary.main"
          />
        </Grid>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
          <StatCard
            title="Reviews Written"
            value={userStats.reviewsCount}
            subtitle={`+2 from last month`}
            icon={<RateReview fontSize="large" />}
            iconColor="secondary.main"
          />
        </Grid>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
          <StatCard
            title="Watch Time"
            value={`${userStats.watchTime}h`}
            subtitle={`+12h from last month`}
            icon={<AccessTime fontSize="large" />}
            iconColor="warning.main"
          />
        </Grid>
        <Grid
          sx={{ gridColumn: { xs: "span 12", sm: "span 6", md: "span 3" } }}
        >
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
