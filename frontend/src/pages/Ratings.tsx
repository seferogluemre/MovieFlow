import {
  Edit as EditIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  Grid,
  LinearProgress,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingModal from "../components/RatingModal";
import { useAuth } from "../context/AuthContext";
import { ratingService } from "../utils/api";
import { Rating } from "../utils/types";

// Tab interface
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ratings-tabpanel-${index}`}
      aria-labelledby={`ratings-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `ratings-tab-${index}`,
    "aria-controls": `ratings-tabpanel-${index}`,
  };
}

const Ratings: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tabValue, setTabValue] = useState(0);

  // State for rating modal
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        fetchRatings();
      } else {
        // Check auth status, maybe page was refreshed
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          fetchRatings();
        } else {
          navigate("/login");
        }
      }
    };

    init();
  }, [isAuthenticated, navigate, checkAuthStatus]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const response = await ratingService.getUserRatings();

      if (response && response.data && Array.isArray(response.data)) {
        // Sort ratings by date (newest first)
        const sortedRatings = response.data.sort(
          (a: Rating, b: Rating) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setRatings(sortedRatings);
        setFilteredRatings(sortedRatings);
      } else {
        setRatings([]);
        setFilteredRatings([]);
      }

      setError(null);
    } catch (err) {
      setError(
        "Puanlamalarınız yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = ratings.filter(
        (rating) =>
          rating.movie?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          rating.movie?.director
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
      setFilteredRatings(filtered);
    } else {
      setFilteredRatings(ratings);
    }
  }, [searchQuery, ratings]);

  const handleEditRating = (rating: Rating) => {
    setSelectedRating(rating);
    setRatingModalOpen(true);
  };

  const handleViewMovie = (movieId: number) => {
    navigate(`/movie/${movieId}`);
  };

  const handleUpdateRating = async (score: number) => {
    if (!selectedRating) return;

    try {
      const result = await ratingService.updateRating(selectedRating.id, score);

      if (result && result.data) {
        // Update the rating in the list
        setRatings((prevRatings) =>
          prevRatings.map((r) =>
            r.id === selectedRating.id ? { ...r, score } : r
          )
        );

        setSuccessMessage("Film puanınız başarıyla güncellendi.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      console.error("Error updating rating:", error);
      setError("Puan güncellenirken bir hata oluştu.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteRating = async () => {
    if (!selectedRating) return;

    try {
      await ratingService.deleteRating(selectedRating.id);

      // Remove the rating from the list
      setRatings((prevRatings) =>
        prevRatings.filter((r) => r.id !== selectedRating.id)
      );

      setSuccessMessage("Film puanınız başarıyla silindi.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Error deleting rating:", error);
      setError("Puan silinirken bir hata oluştu.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      });
    } catch (e) {
      return "Geçersiz tarih";
    }
  };

  const getStarColor = (score: number) => {
    if (score >= 4) return "success.main";
    if (score >= 3) return "warning.main";
    if (score >= 2) return "info.main";
    return "error.main";
  };

  // Generate statistics data for the Statistics tab
  const calculateRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0]; // 1-star to 5-star count
    
    ratings.forEach(rating => {
      if (rating.score >= 1 && rating.score <= 5) {
        distribution[rating.score - 1]++;
      }
    });
    
    return distribution;
  };

  const getRecentTrends = () => {
    // Last 30 days ratings
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRatings = ratings.filter(
      rating => new Date(rating.createdAt) >= thirtyDaysAgo
    );
    
    const averageScore = recentRatings.length > 0
      ? recentRatings.reduce((sum, r) => sum + r.score, 0) / recentRatings.length
      : 0;
      
    return {
      count: recentRatings.length,
      averageScore: averageScore.toFixed(1),
    };
  };

  const getTopGenres = () => {
    const genreCounts: Record<string, number> = {};
    
    ratings.forEach(rating => {
      if (rating.movie?.genres) {
        rating.movie.genres.forEach(genre => {
          if (genreCounts[genre.name]) {
            genreCounts[genre.name]++;
          } else {
            genreCounts[genre.name] = 1;
          }
        });
      }
    });
    
    // Sort by count and return top 5
    return Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const getTopDirectors = () => {
    const directorCounts: Record<string, number> = {};
    
    ratings.forEach(rating => {
      if (rating.movie?.director) {
        const director = rating.movie.director;
        if (directorCounts[director]) {
          directorCounts[director]++;
        } else {
          directorCounts[director] = 1;
        }
      }
    });
    
    // Sort by count and return top 5
    return Object.entries(directorCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const ratingDistribution = calculateRatingDistribution();
  const recentTrends = getRecentTrends();
  const topGenres = getTopGenres();
  const topDirectors = getTopDirectors();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Film Puanlarım
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Puan verdiğiniz tüm filmler burada listelenir.
          </Typography>
        </Box>

        {tabValue === 0 && (
          <TextField
            placeholder="Puanlar içinde ara..."
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        )}
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="rating tabs"
              sx={{ mb: 1 }}
            >
              <Tab label="Puanlarım" {...a11yProps(0)} />
              <Tab label="İstatistikler" {...a11yProps(1)} />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            {filteredRatings.length === 0 ? (
              <Alert severity="info">
                {searchQuery
                  ? "Aramanızla eşleşen puan bulunamadı."
                  : "Henüz hiçbir filme puan vermemişsiniz."}
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Film</TableCell>
                      <TableCell>Puanım</TableCell>
                      <TableCell>Yönetmen</TableCell>
                      <TableCell>Yıl</TableCell>
                      <TableCell>Puanlama Tarihi</TableCell>
                      <TableCell align="right">İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredRatings.map((rating) => (
                      <TableRow
                        key={rating.id}
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell component="th" scope="row">
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Box
                              component="img"
                              sx={{
                                width: 60,
                                height: 80,
                                objectFit: "cover",
                                borderRadius: 1,
                                mr: 2,
                              }}
                              src={
                                rating.movie?.posterImage ||
                                "https://via.placeholder.com/60x80?text=Resim+Yok"
                              }
                              alt={rating.movie?.title || "Film"}
                            />
                            <Typography fontWeight="bold">
                              {rating.movie?.title || "Bilinmeyen Film"}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <StarIcon
                              sx={{
                                color: getStarColor(rating.score),
                                fontSize: 20,
                                mr: 0.5,
                              }}
                            />
                            <Typography variant="body1" fontWeight="bold">
                              {rating.score} / 5
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {rating.movie?.director || "Bilinmeyen"}
                        </TableCell>
                        <TableCell>{rating.movie?.releaseYear || "?"}</TableCell>
                        <TableCell>{formatDate(rating.createdAt)}</TableCell>
                        <TableCell align="right">
                          <Box>
                            <Tooltip title="Filmi Görüntüle">
                              <IconButton
                                color="primary"
                                onClick={() => handleViewMovie(rating.movieId)}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Puanı Düzenle">
                              <IconButton
                                color="warning"
                                onClick={() => handleEditRating(rating)}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              {/* Rating Count and Average */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Özet İstatistikler
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1">
                        Toplam Puanlama: <b>{ratings.length}</b>
                      </Typography>
                      <Typography variant="body1">
                        Ortalama Puan:{" "}
                        <b>
                          {ratings.length > 0
                            ? (
                                ratings.reduce((sum, r) => sum + r.score, 0) /
                                ratings.length
                              ).toFixed(1)
                            : "0.0"}
                        </b>
                      </Typography>
                      <Typography variant="body1">
                        Son 30 Gün Puanlama: <b>{recentTrends.count}</b>
                      </Typography>
                      <Typography variant="body1">
                        Son 30 Gün Ortalama: <b>{recentTrends.averageScore}</b>
                      </Typography>
                    </Box>
                    
                    <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                      En Yüksek Puanladığınız Filmler
                    </Typography>
                    
                    {ratings
                      .filter((r) => r.score === 5)
                      .slice(0, 3)
                      .map((rating) => (
                        <Box 
                          key={rating.id} 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            mb: 1,
                            cursor: 'pointer'
                          }}
                          onClick={() => handleViewMovie(rating.movieId)}
                        >
                          <Box
                            component="img"
                            sx={{
                              width: 40,
                              height: 60,
                              objectFit: "cover",
                              borderRadius: 1,
                              mr: 1,
                            }}
                            src={
                              rating.movie?.posterImage ||
                              "https://via.placeholder.com/40x60?text=Resim+Yok"
                            }
                            alt={rating.movie?.title || "Film"}
                          />
                          <Typography variant="body2">
                            {rating.movie?.title || "Bilinmeyen Film"} ({rating.movie?.releaseYear || "?"})
                          </Typography>
                        </Box>
                      ))}
                  </CardContent>
                </Card>
              </Grid>

              {/* Rating Distribution */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      Puan Dağılımı
                    </Typography>
                    
                    {[5, 4, 3, 2, 1].map((score) => {
                      const count = ratingDistribution[score - 1];
                      const percentage = ratings.length > 0 
                        ? Math.round((count / ratings.length) * 100)
                        : 0;
                        
                      return (
                        <Box key={score} sx={{ mb: 1.5 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <StarIcon 
                                sx={{ 
                                  color: getStarColor(score), 
                                  fontSize: 16, 
                                  mr: 0.5 
                                }} 
                              />
                              <Typography variant="body2">{score} Yıldız</Typography>
                            </Box>
                            <Typography variant="body2">
                              {count} film ({percentage}%)
                            </Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={percentage} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 1,
                              bgcolor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: getStarColor(score),
                              }
                            }} 
                          />
                        </Box>
                      );
                    })}
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Genres */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      En Çok Puanladığınız Türler
                    </Typography>
                    
                    {topGenres.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Henüz yeterli veri yok
                      </Typography>
                    ) : (
                      topGenres.map(([genre, count], index) => (
                        <Box key={genre} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{genre}</Typography>
                            <Typography variant="body2">{count} film</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(count / topGenres[0][1]) * 100} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 1,
                              bgcolor: 'grey.200'
                            }} 
                          />
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Top Directors */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight="bold">
                      En Çok Puanladığınız Yönetmenler
                    </Typography>
                    
                    {topDirectors.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Henüz yeterli veri yok
                      </Typography>
                    ) : (
                      topDirectors.map(([director, count], index) => (
                        <Box key={director} sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2">{director}</Typography>
                            <Typography variant="body2">{count} film</Typography>
                          </Box>
                          <LinearProgress 
                            variant="determinate" 
                            value={(count / topDirectors[0][1]) * 100} 
                            sx={{ 
                              height: 10, 
                              borderRadius: 1,
                              bgcolor: 'grey.200'
                            }} 
                          />
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>
        </>
      )}

      {/* Rating modal */}
      {selectedRating && (
        <RatingModal
          open={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          onSubmit={handleUpdateRating}
          onDelete={handleDeleteRating}
          movieTitle={selectedRating.movie?.title || "Film"}
          initialRating={selectedRating.score}
          existingRatingId={selectedRating.id}
        />
      )}
    </Box>
  );
};

export default Ratings;
