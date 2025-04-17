import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextareaAutosize,
  CardHeader,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import api, { processApiError } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { Review } from "../utils/types";

const MyReviews: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);

  // Dialog states
  const [editReviewDialog, setEditReviewDialog] = useState({
    open: false,
    reviewId: null as number | null,
    content: "",
  });

  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
    open: false,
    reviewId: null as number | null,
  });

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        await fetchUserReviews();
      } else {
        // Auth durumunu kontrol et, belki sayfa yenilendi
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          await fetchUserReviews();
        } else {
          navigate("/login");
        }
      }
    };

    init();
  }, [isAuthenticated, navigate]);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);

      // Kullanıcı verileri ve review'ler için tek bir istek
      const userResponse = await api.get(`/users/${user?.id}`);

      // Review'leri al
      const reviewsData = userResponse.data.reviews || [];

      // Her review için film bilgilerini getir
      const reviewsWithMovies = await Promise.all(
        reviewsData.map(async (review: Review) => {
          try {
            const movieResponse = await api.get(`/movies/${review.movieId}`);
            return { ...review, movie: movieResponse.data };
          } catch (err) {
            console.error(
              `Error fetching movie data for review ${review.id}:`,
              err
            );
            return review;
          }
        })
      );

      setReviews(reviewsWithMovies);
      setFilteredReviews(reviewsWithMovies);
      setError(null);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError(
        "İncelemeleriniz yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = reviews.filter(
        (review) =>
          review.movie?.title
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          review.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredReviews(filtered);
    } else {
      setFilteredReviews(reviews);
    }
  }, [searchQuery, reviews]);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    reviewId: number
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedReviewId(reviewId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReviewId(null);
  };

  const handleViewFullReview = () => {
    const selectedReview = reviews.find(
      (review) => review.id === selectedReviewId
    );
    if (selectedReview) {
      navigate(
        `/movie/${selectedReview.movieId}?reviewId=${selectedReview.id}`
      );
    }
    handleMenuClose();
  };

  const handleEditReview = () => {
    const selectedReview = reviews.find(
      (review) => review.id === selectedReviewId
    );
    if (selectedReview) {
      setEditReviewDialog({
        open: true,
        reviewId: selectedReviewId,
        content: selectedReview.content,
      });
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setConfirmDeleteDialog({
      open: true,
      reviewId: selectedReviewId,
    });
    handleMenuClose();
  };

  // Edit Dialog Handlers
  const handleCloseEditDialog = () => {
    setEditReviewDialog({
      open: false,
      reviewId: null,
      content: "",
    });
  };

  const handleReviewContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setEditReviewDialog({
      ...editReviewDialog,
      content: e.target.value,
    });
  };

  const handleSaveEditedReview = async () => {
    if (!editReviewDialog.reviewId || !editReviewDialog.content.trim()) return;

    try {
      await api.patch(`/reviews/${editReviewDialog.reviewId}`, {
        content: editReviewDialog.content,
      });

      // Update state to reflect the change
      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review.id === editReviewDialog.reviewId
            ? {
              ...review,
              content: editReviewDialog.content,
              updatedAt: new Date().toISOString(),
            }
            : review
        )
      );

      setSuccessMessage("İncelemeniz başarıyla güncellendi");
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseEditDialog();
    } catch (err) {
      console.error("Error updating review:", err);
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Delete Dialog Handlers
  const handleCloseDeleteDialog = () => {
    setConfirmDeleteDialog({
      open: false,
      reviewId: null,
    });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteDialog.reviewId) return;

    try {
      await api.delete(`/reviews/${confirmDeleteDialog.reviewId}`);
      setReviews((prevReviews) =>
        prevReviews.filter(
          (review) => review.id !== confirmDeleteDialog.reviewId
        )
      );
      setSuccessMessage("İncelemeniz başarıyla silindi");
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseDeleteDialog();
    } catch (err) {
      console.error("Error deleting review:", err);
      const errorMessage = processApiError(err);
      setError(errorMessage);
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

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
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
            İncelemelerim
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Filmler hakkında yazdığınız incelemeler.
          </Typography>
        </Box>

        <TextField
          placeholder="İncelemelerde ara..."
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
      ) : filteredReviews.length === 0 ? (
        <Alert severity="info">
          {searchQuery
            ? "Aramanızla eşleşen inceleme bulunamadı."
            : "Henüz inceleme yazmadınız. Film sayfalarından inceleme yazabilirsiniz."}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {filteredReviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Card>
                <CardHeader
                  avatar={
                    <Avatar
                      alt={review.movie?.title}
                      src={review.movie?.posterImage || ""}
                      variant="rounded"
                      sx={{ width: 60, height: 80 }}
                    />
                  }
                  action={
                    <IconButton
                      aria-label="işlemler"
                      onClick={(e) => handleMenuOpen(e, review.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  }
                  title={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="h6" component="span">
                        {review.movie?.title}
                      </Typography>
                      <Chip
                        label={review.movie?.releaseYear}
                        size="small"
                        variant="outlined"
                      />
                      {review.movie?.rating ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <StarIcon
                            sx={{ color: "warning.main", fontSize: 16 }}
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {review.movie?.rating.toFixed(1)}
                          </Typography>
                        </Box>
                      ) : ""}
                    </Box>
                  }
                  subheader={`Yönetmen: ${review.movie?.director
                    } | Yazıldığı tarih: ${formatDate(review.createdAt)}`}
                />
                <Divider />
                <CardContent>
                  <Typography variant="body1" gutterBottom>
                    {truncateText(review.content, 300)}
                  </Typography>
                  {review.content.length > 300 && (
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedReviewId(review.id);
                        handleViewFullReview();
                      }}
                      sx={{ mt: 1 }}
                    >
                      Devamını oku
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Actions Menu */}
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

        <MenuItem onClick={handleViewFullReview}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Tam İncelemeyi Gör</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleEditReview}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>İncelemeyi Düzenle</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleDeleteClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Sil</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit Review Dialog */}
      <Dialog
        open={editReviewDialog.open}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>İncelemeyi Düzenle</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Film hakkındaki incelemenizi güncelleyin:
          </DialogContentText>
          <TextareaAutosize
            aria-label="Film incelemesi"
            minRows={8}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "4px",
              borderColor: "#ccc",
              fontSize: "16px",
            }}
            value={editReviewDialog.content}
            onChange={handleReviewContentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog}>İptal</Button>
          <Button
            onClick={handleSaveEditedReview}
            color="primary"
            disabled={!editReviewDialog.content.trim()}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Silmeyi Onayla</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu incelemeyi silmek istediğinizden emin misiniz? Bu işlem geri
            alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>İptal</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyReviews;
