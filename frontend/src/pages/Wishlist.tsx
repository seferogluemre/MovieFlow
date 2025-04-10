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
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  PlaylistAdd as PlaylistAddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import api, { processApiError } from "../utils/api";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";

interface WishlistItem {
  id: number;
  addedAt: string;
  userId: number;
  movieId: number;
  movie: {
    id: number;
    title: string;
    description: string;
    releaseYear: number;
    duration: number;
    posterImage: string;
    director: string;
    rating: number;
    ageRating: string;
    createdAt: string;
    updatedAt: string;
  };
}

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
      console.error("Error fetching wishlist:", err);
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
        } else if (confirmDialog.action === "watchlist" && selectedItem) {
          // İzleme listesine ekleme işlemi
          await api.post("/watchlist", { movieId: selectedItem.movie.id });
          setError(null);
        }
      }
    } catch (err) {
      console.error("Error with wishlist action:", err);
      const errorMessage = processApiError(err);
      setError(errorMessage);
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

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
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
            My Wishlist
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Movies you wish to add to your collection.
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
                          "https://via.placeholder.com/60x80?text=No+Image"
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
                          ? item.movie.ageRating.replace("_", " ")
                          : "GENERAL"
                      }
                      size="small"
                      color={getAgeRatingColor(item.movie.ageRating)}
                    />
                  </TableCell>
                  <TableCell>{formatDate(item.addedAt)}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      aria-label="actions"
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
            : "İzleme Listesine Eklemeyi Onayla"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmDialog.action === "delete"
              ? "Bu filmi istek listenizden kaldırmak istediğinizden emin misiniz?"
              : "Bu filmi izleme listenize eklemek istediğinizden emin misiniz?"}
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
    </Box>
  );
};

export default Wishlist;
