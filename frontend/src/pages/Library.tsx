import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Rating,
  TextareaAutosize,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  AccessTime as AccessTimeIcon,
  RateReview as RateReviewIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import api, { processApiError } from "../utils/api";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";
import { LibraryItem } from "../utils/types";


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
      } else {
        // Auth durumunu kontrol et, belki sayfa yenilendi
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          fetchLibrary();
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

  const handleRemoveClick = () => {
    setConfirmDeleteDialog({
      open: true,
      itemId: selectedItemId,
    });
    handleMenuClose();
  };

  // Last watched dialog handling
  const handleCloseWatchedDialog = () => {
    setWatchedDialog({
      open: false,
      itemId: null,
    });
  };

  const handleSaveLastWatched = async () => {
    if (!watchedDialog.itemId || !selectedDateTime) return;

    try {
      await api.patch(`/library/${watchedDialog.itemId}`, {
        lastWatched: selectedDateTime.toISOString(),
      });

      // Update state to reflect the change
      setLibrary((prevLibrary) =>
        prevLibrary.map((item) =>
          item.id === watchedDialog.itemId
            ? { ...item, lastWatched: selectedDateTime.toISOString() }
            : item
        )
      );

      setSuccessMessage("Son izleme tarihi başarıyla güncellendi");
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseWatchedDialog();
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Review dialog handling
  const handleCloseReviewDialog = () => {
    setReviewDialog({
      open: false,
      itemId: null,
      movieId: null,
      content: "",
    });
  };

  const handleReviewContentChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setReviewDialog({
      ...reviewDialog,
      content: e.target.value,
    });
  };

  const handleSubmitReview = async () => {
    if (!reviewDialog.movieId || !reviewDialog.content.trim()) return;

    try {
      await api.post("/reviews", {
        content: reviewDialog.content,
        movieId: reviewDialog.movieId,
      });

      setSuccessMessage("İncelemeniz başarıyla gönderildi");
      setTimeout(() => setSuccessMessage(null), 3000);
      handleCloseReviewDialog();
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Delete dialog handling
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

  // Helper function to get age rating color
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

  // Yaş sınırı etiketlerini Türkçe karşılıklarına çevir
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
                <TableCell>Puan</TableCell>
                <TableCell>Yaş Sınırı</TableCell>
                <TableCell>Son İzlenme</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLibrary.map((item) => (
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
                    {item.movie.rating > 0 ? (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <StarIcon
                          sx={{ color: "warning.main", fontSize: 16, mr: 0.5 }}
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
                      label={
                        item.movie.ageRating
                          ? translateAgeRating(item.movie.ageRating)
                          : "GENEL"
                      }
                      size="small"
                      color={getAgeRatingColor(item.movie.ageRating)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(item.lastWatched)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="işlemler"
                      onClick={(e) => handleMenuOpen(e, item.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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

      {/* Last Watched Dialog */}
      <Dialog open={watchedDialog.open} onClose={handleCloseWatchedDialog}>
        <DialogTitle>Son İzleme Tarihini Güncelle</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bu film için son izleme tarihinizi seçin:
          </DialogContentText>
          <TextField
            label="Son İzleme Tarihi"
            type="datetime-local"
            value={
              selectedDateTime
                ? format(selectedDateTime, "yyyy-MM-dd'T'HH:mm")
                : ""
            }
            onChange={(e) => {
              const newDate = e.target.value ? new Date(e.target.value) : null;
              setSelectedDateTime(newDate);
            }}
            sx={{ width: "100%", mt: 2 }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseWatchedDialog}>İptal</Button>
          <Button onClick={handleSaveLastWatched} color="primary">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog.open}
        onClose={handleCloseReviewDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Film İncelemesi Yaz</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Bu film hakkındaki düşüncelerinizi paylaşın:
          </DialogContentText>
          <TextareaAutosize
            aria-label="Film incelemesi"
            minRows={5}
            placeholder="Bu film hakkında ne düşünüyorsunuz?"
            style={{
              width: "100%",
              padding: "8px",
              borderRadius: "4px",
              borderColor: "#ccc",
            }}
            value={reviewDialog.content}
            onChange={handleReviewContentChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReviewDialog}>İptal</Button>
          <Button
            onClick={handleSubmitReview}
            color="primary"
            disabled={!reviewDialog.content.trim()}
          >
            Gönder
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Kaldırmayı Onayla</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bu filmi kütüphanenizden kaldırmak istediğinizden emin misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>İptal</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Kaldır
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Library;
