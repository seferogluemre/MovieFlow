import {
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  PlaylistAdd as PlaylistAddIcon,
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
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { processApiError } from "../utils/api";
import { WishlistItem } from "../utils/types";


const Wishlist: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [filteredWishlist, setFilteredWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    itemId: number | null;
    action: "delete" | "watchlist" | null;
  }>({
    open: false,
    itemId: null,
    action: null,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        fetchWishlist();
      } else {
        // Auth durumunu kontrol et, belki sayfa yenilendi
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          fetchWishlist();
        } else {
          navigate("/login");
        }
      }
    };

    init();
  }, [isAuthenticated, navigate]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await api.get("/wishlist");
      setWishlist(response.data || []);
      setFilteredWishlist(response.data || []);
      setError(null);
    } catch (err) {
      setError(
        "İstek listeniz yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = wishlist.filter(
        (item) =>
          item.movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.movie.director.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWishlist(filtered);
    } else {
      setFilteredWishlist(wishlist);
    }
  }, [searchQuery, wishlist]);

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
    const selectedItem = wishlist.find((item) => item.id === selectedItemId);
    if (selectedItem) {
      navigate(`/movie/${selectedItem.movie.id}`);
    }
    handleMenuClose();
  };

  const handleAddToWatchlist = () => {
    setConfirmDialog({
      open: true,
      itemId: selectedItemId,
      action: "watchlist",
    });
    handleMenuClose();
  };

  const handleRemoveClick = () => {
    setConfirmDialog({
      open: true,
      itemId: selectedItemId,
      action: "delete",
    });
    handleMenuClose();
  };

  const handleConfirmAction = async () => {
    try {
      if (confirmDialog.itemId) {
        const selectedItem = wishlist.find(
          (item) => item.id === confirmDialog.itemId
        );

        if (confirmDialog.action === "delete") {
          // İstek listesinden silme işlemi
          await api.delete(`/wishlist/${confirmDialog.itemId}`);
          setWishlist((prevWishlist) =>
            prevWishlist.filter((item) => item.id !== confirmDialog.itemId)
          );
          setError(null);
          // Başarılı bildirim göster
          setSnackbar({
            open: true,
            message: "Film istek listenizden kaldırıldı.",
            severity: "success",
          });
        } else if (confirmDialog.action === "watchlist" && selectedItem) {
          // İzleme listesine ekleme işlemi
          await api.post("/watchlist", { movieId: selectedItem.movie.id });
          setError(null);
          // Başarılı bildirim göster
          setSnackbar({
            open: true,
            message: "Film izleme listenize eklendi.",
            severity: "success",
          });
        }
      }
    } catch (err) {
      const errorMessage = processApiError(err);
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setConfirmDialog({
        open: false,
        itemId: null,
        action: null,
      });
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      itemId: null,
      action: null,
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
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

  // Helper function to get age rating color
  const getAgeRatingColor = (rating: string) => {
    switch (rating) {
      case "GENERAL":
        return "success";
      case "PARENTAL_GUIDANCE":
        return "info";
      case "TEEN":
        return "warning";
      default:
        return "error";
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
            İstek Listem
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Koleksiyonunuza eklemek istediğiniz filmler.
          </Typography>
        </Box>

        <TextField
          placeholder="İstek listesinde ara..."
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : filteredWishlist.length === 0 ? (
        <Alert severity="info">
          {searchQuery
            ? "Aramanızla eşleşen film bulunamadı."
            : "İstek listeniz boş. Koleksiyonunuza eklemek istediğiniz filmleri buraya ekleyin!"}
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
                <TableCell>Eklenme Tarihi</TableCell>
                <TableCell align="right">İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWishlist.map((item) => (
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
                  <TableCell>{formatDate(item.addedAt)}</TableCell>
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

        <MenuItem onClick={handleAddToWatchlist}>
          <ListItemIcon>
            <PlaylistAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>İzleme Listesine Ekle</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRemoveClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Kaldır</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>
          {confirmDialog.action === "delete"
            ? "Kaldırmayı Onayla"
            : "İzleme Listesine Ekle"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === "delete"
              ? "Bu filmi istek listenizden kaldırmak istediğinizden emin misiniz?"
              : "Bu filmi izleme listenize eklemek istiyor musunuz?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>İptal</Button>
          <Button
            onClick={handleConfirmAction}
            color={confirmDialog.action === "delete" ? "error" : "primary"}
            autoFocus
          >
            {confirmDialog.action === "delete" ? "Kaldır" : "Ekle"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar toast notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Wishlist;
