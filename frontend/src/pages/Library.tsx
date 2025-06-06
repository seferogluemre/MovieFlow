import {
  AccessTime as AccessTimeIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  RateReview as RateReviewIcon,
  Search as SearchIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  InputAdornment,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextareaAutosize,
  TextField,
  Typography,
} from "@mui/material";
import { format, formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RatingModal from "../components/RatingModal";
import { useAuth } from "../context/AuthContext";
import api, { processApiError, ratingService } from "../utils/api";
import { LibraryItem, Rating } from "../utils/types";

const Library: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [library, setLibrary] = useState<LibraryItem[]>([]);
  const [filteredLibrary, setFilteredLibrary] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(
    new Date()
  );

  const [userRatings, setUserRatings] = useState<{ [key: number]: Rating }>({});
  const [loadingRatings, setLoadingRatings] = useState<boolean>(false);
  const [ratingModalOpen, setRatingModalOpen] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<{
    id: number;
    title: string;
  } | null>(null);

  const [reviewDialog, setReviewDialog] = useState({
    open: false,
    itemId: null as number | null,
    movieId: null as number | null,
    content: "",
  });

  const [watchedDialog, setWatchedDialog] = useState({
    open: false,
    itemId: null as number | null,
  });

  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
    open: false,
    itemId: null as number | null,
  });

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        fetchLibrary();
        fetchUserRatings();
      } else {
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          fetchLibrary();
          fetchUserRatings();
        } else {
          navigate("/login");
        }
      }
    };

    init();
  }, [isAuthenticated, navigate]);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const response = await api.get("/library");
      setLibrary(response.data || []);
      setFilteredLibrary(response.data || []);
      setError(null);
    } catch (err) {
      setError(
        "Kütüphaneniz yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRatings = async () => {
    try {
      setLoadingRatings(true);
      const response = await ratingService.getUserRatings();

      const ratingsMap: { [key: number]: Rating } = {};
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach((rating: Rating) => {
          if (rating.movieId) {
            ratingsMap[rating.movieId] = rating;
          }
        });
      }

      setUserRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
    } finally {
      setLoadingRatings(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = library.filter(
        (item) =>
          item.movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.movie.director.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredLibrary(filtered);
    } else {
      setFilteredLibrary(library);
    }
  }, [searchQuery, library]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    itemId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedItemId(itemId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItemId(null);
  };

  const handleViewDetails = () => {
    const selectedItem = library.find((item) => item.id === selectedItemId);
    if (selectedItem) {
      navigate(`/movie/${selectedItem.movie.id}`);
    }
    handleMenuClose();
  };

  const handleUpdateLastWatched = () => {
    setWatchedDialog({
      open: true,
      itemId: selectedItemId,
    });
    handleMenuClose();
  };

  const handleWriteReview = () => {
    const selectedItem = library.find((item) => item.id === selectedItemId);
    if (selectedItem) {
      setReviewDialog({
        open: true,
        itemId: selectedItemId,
        movieId: selectedItem.movie.id,
        content: "",
      });
    }
    handleMenuClose();
  };

  const handleRateMovie = () => {
    const selectedItem = library.find((item) => item.id === selectedItemId);
    if (!selectedItem) return;

    setSelectedMovie({
      id: selectedItem.movie.id,
      title: selectedItem.movie.title,
    });
    setRatingModalOpen(true);
    handleMenuClose();
  };

  const handleSubmitRating = async (score: number) => {
    if (!selectedMovie) return;

    try {
      const movieId = selectedMovie.id;
      const existingRating = userRatings[movieId];

      let result;
      if (existingRating) {
        result = await ratingService.updateRating(existingRating.id, score);
      } else {
        result = await ratingService.createRating(movieId, score);
      }

      if (result && result.data) {
        setUserRatings((prev) => ({
          ...prev,
          [movieId]: result.data,
        }));

        const action = existingRating ? "güncellendi" : "eklendi";
        setSuccessMessage(`Film puanınız başarıyla ${action}.`);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      const errorMessage = processApiError(error);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteRating = async () => {
    if (!selectedMovie) return;

    const movieId = selectedMovie.id;
    const existingRating = userRatings[movieId];

    if (!existingRating) return;

    try {
      await ratingService.deleteRating(existingRating.id);

      const updatedRatings = { ...userRatings };
      delete updatedRatings[movieId];
      setUserRatings(updatedRatings);

      setSuccessMessage("Film puanınız başarıyla silindi.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      const errorMessage = processApiError(error);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRemoveClick = () => {
    setConfirmDeleteDialog({
      open: true,
      itemId: selectedItemId,
    });
    handleMenuClose();
  };

  const handleCloseReviewDialog = () => {
    setReviewDialog({
      open: false,
      itemId: null,
      movieId: null,
      content: "",
    });
  };

  const handleReviewContentChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setReviewDialog((prev) => ({ ...prev, content: event.target.value }));
  };

  const handleSubmitReview = async () => {
    if (!reviewDialog.movieId || !reviewDialog.content) return;

    try {
      const response = await api.post("/reviews", {
        movieId: reviewDialog.movieId,
        content: reviewDialog.content,
      });

      if (response.status === 201) {
        setSuccessMessage("İncelemeniz başarıyla eklendi.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      handleCloseReviewDialog();
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCloseWatchedDialog = () => {
    setWatchedDialog({
      open: false,
      itemId: null,
    });
    setSelectedDateTime(new Date());
  };

  const handleDateTimeChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setSelectedDateTime(
      event.target.value ? new Date(event.target.value) : null
    );
  };

  const handleSubmitWatchedDate = async () => {
    if (!watchedDialog.itemId || !selectedDateTime) return;

    try {
      const response = await api.patch(`/library/${watchedDialog.itemId}`, {
        lastWatched: selectedDateTime.toISOString(),
      });

      if (response.status === 200) {
        const updatedLibrary = library.map((item) =>
          item.id === watchedDialog.itemId
            ? { ...item, lastWatched: selectedDateTime.toISOString() }
            : item
        );
        setLibrary(updatedLibrary);
        setFilteredLibrary(
          searchQuery
            ? filteredLibrary.map((item) =>
                item.id === watchedDialog.itemId
                  ? { ...item, lastWatched: selectedDateTime.toISOString() }
                  : item
              )
            : updatedLibrary
        );

        setSuccessMessage("Son izleme tarihi başarıyla güncellendi.");
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      handleCloseWatchedDialog();
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog({
      open: false,
      itemId: null,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteDialog.itemId) return;

    try {
      await api.delete(`/library/${confirmDeleteDialog.itemId}`);
      setLibrary((prevLibrary) =>
        prevLibrary.filter((item) => item.id !== confirmDeleteDialog.itemId)
      );
      setSuccessMessage("Film kütüphanenizden kaldırıldı");
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseDeleteDialog();
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Hiç izlenmedi";
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: tr,
      });
    } catch (e) {
      return "Geçersiz tarih";
    }
  };

  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case "GENERAL":
        return "success";
      case "PARENTAL_GUIDANCE":
        return "info";
      case "TEEN":
        return "warning";
      case "MATURE":
      case "ADULT":
        return "error";
      default:
        return "default";
    }
  };

  const translateAgeRating = (rating: string) => {
    switch (rating) {
      case "GENERAL":
        return "GENEL";
      case "PARENTAL_GUIDANCE":
        return "EBEVEYN REHBERLİĞİ";
      case "TEEN":
        return "GENÇ";
      case "MATURE":
        return "YETİŞKİN";
      case "ADULT":
        return "18+";
      default:
        return rating;
    }
  };

  const getUserRatingForMovie = (movieId: number) => {
    return userRatings[movieId] || null;
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Kütüphanem
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Film koleksiyonunuz.
          </Typography>
        </Box>

        <TextField
          placeholder="Kütüphanede ara..."
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
      ) : filteredLibrary.length === 0 ? (
        <Alert severity="info">
          {searchQuery
            ? "Aramanızla eşleşen film bulunamadı."
            : "Kütüphaneniz boş. Kütüphanenize eklemek için filmleri keşfedin!"}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Film</TableCell>
                <TableCell>Yönetmen</TableCell>
                <TableCell>Yıl</TableCell>
                <TableCell>Kullanıcı Puanı</TableCell>
                <TableCell>Genel Puan</TableCell>
                <TableCell>Yaş Sınırı</TableCell>
                <TableCell>Son İzlenme</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLibrary.map((item) => {
                const userRating = getUserRatingForMovie(item.movie.id);

                return (
                  <TableRow
                    key={item.id}
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
                            item.movie.posterImage ||
                            "https://via.placeholder.com/60x80?text=Resim+Yok"
                          }
                          alt={item.movie.title}
                        />
                        <Typography fontWeight="bold">
                          {item.movie.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{item.movie.director}</TableCell>
                    <TableCell>{item.movie.releaseYear}</TableCell>
                    <TableCell>
                      {userRating ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StarIcon
                            sx={{
                              color: "warning.main",
                              fontSize: 16,
                              mr: 0.5,
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {userRating.score}
                          </Typography>
                        </Box>
                      ) : (
                        "Puanlanmamış"
                      )}
                    </TableCell>
                    <TableCell>
                      {item.movie.rating > 0 ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StarIcon
                            sx={{
                              color: "warning.main",
                              fontSize: 16,
                              mr: 0.5,
                            }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {item.movie.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      ) : (
                        "Puanlanmamış"
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={translateAgeRating(item.movie.ageRating)}
                        color={getAgeRatingColor(item.movie.ageRating) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(item.lastWatched)}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        edge="end"
                        aria-label="actions"
                        onClick={(e) => handleMenuOpen(e, item.id)}
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{ mt: 1 }}
      >
        <Typography
          variant="subtitle2"
          sx={{ px: 2, py: 1, fontWeight: "bold" }}
        >
          İşlemler
        </Typography>

        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Detayları Gör</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleUpdateLastWatched}>
          <ListItemIcon>
            <AccessTimeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Son İzleme Tarihini Güncelle</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRateMovie}>
          <ListItemIcon>
            <StarIcon fontSize="small" color="warning" />
          </ListItemIcon>
          <ListItemText>Puanla</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleWriteReview}>
          <ListItemIcon>
            <RateReviewIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>İnceleme Yaz</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRemoveClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Kaldır</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={watchedDialog.open} onClose={handleCloseWatchedDialog}>
        <DialogTitle>Son İzleme Tarihini Güncelle</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu filmi en son ne zaman izlediğinizi seçin.
          </DialogContentText>
          <TextField
            label="İzleme Zamanı"
            type="datetime-local"
            value={
              selectedDateTime
                ? format(selectedDateTime, "yyyy-MM-dd'T'HH:mm")
                : ""
            }
            onChange={handleDateTimeChange}
            fullWidth
            margin="normal"
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWatchedDialog}>İptal</Button>
          <Button
            onClick={handleSubmitWatchedDate}
            color="primary"
            disabled={!selectedDateTime}
          >
            Güncelle
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={reviewDialog.open} onClose={handleCloseReviewDialog}>
        <DialogTitle>İnceleme Yaz</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu film hakkındaki düşüncelerinizi paylaşın.
          </DialogContentText>
          <TextareaAutosize
            minRows={5}
            placeholder="Film hakkında yorumunuzu buraya yazın..."
            value={reviewDialog.content}
            onChange={handleReviewContentChange}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "4px",
              border: "1px solid #ddd",
              marginTop: "16px",
              fontSize: "16px",
              fontFamily: "inherit",
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>İptal</Button>
          <Button
            onClick={handleSubmitReview}
            color="primary"
            disabled={!reviewDialog.content}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmDeleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Kütüphaneden Kaldır</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu filmi kütüphanenizden kaldırmak istediğinize emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>İptal</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Kaldır
          </Button>
        </DialogActions>
      </Dialog>

      {selectedMovie && (
        <RatingModal
          open={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          onSubmit={handleSubmitRating}
          onDelete={
            userRatings[selectedMovie.id] ? handleDeleteRating : undefined
          }
          movieTitle={selectedMovie.title}
          initialRating={userRatings[selectedMovie.id]?.score || 0}
          existingRatingId={userRatings[selectedMovie.id]?.id}
        />
      )}
    </Box>
  );
};

export default Library;
