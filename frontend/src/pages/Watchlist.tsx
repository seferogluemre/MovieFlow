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
  Bookmark as BookmarkIcon,
  PlaylistAdd as PlaylistAddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import api, { processApiError } from "../utils/api";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "../context/AuthContext";

interface WatchlistItem {
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

const Watchlist: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [filteredWatchlist, setFilteredWatchlist] = useState<WatchlistItem[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    itemId: number | null;
  }>({
    open: false,
    itemId: null,
  });

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        fetchWatchlist();
      } else {
        // Auth durumunu kontrol et, belki sayfa yenilendi
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          fetchWatchlist();
        } else {
          navigate("/login");
        }
      }
    };

    init();
  }, [isAuthenticated, navigate]);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await api.get("/watchlist");
      setWatchlist(response.data || []);
      setFilteredWatchlist(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching watchlist:", err);
      setError("Failed to load your watchlist. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      const filtered = watchlist.filter(
        (item) =>
          item.movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.movie.director.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWatchlist(filtered);
    } else {
      setFilteredWatchlist(watchlist);
    }
  }, [searchQuery, watchlist]);

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
    const selectedItem = watchlist.find((item) => item.id === selectedItemId);
    if (selectedItem) {
      navigate(`/movie/${selectedItem.movie.id}`);
    }
    handleMenuClose();
  };

  const handleMarkAsWatched = () => {
    // Bu özellik şimdilik dummy olarak kalacak
    handleMenuClose();
  };

  const handleAddToWishlist = () => {
    // Bu özellik şimdilik dummy olarak kalacak
    handleMenuClose();
  };

  const handleRemoveClick = () => {
    setConfirmDialog({
      open: true,
      itemId: selectedItemId,
    });
    handleMenuClose();
  };

  const handleRemoveConfirm = async () => {
    try {
      if (confirmDialog.itemId) {
        await api.delete(`/watchlist/${confirmDialog.itemId}`);
        setWatchlist((prevWatchlist) =>
          prevWatchlist.filter((item) => item.id !== confirmDialog.itemId)
        );
        setError(null);
      }
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      const errorMessage = processApiError(err);
      setError(errorMessage);
    } finally {
      setConfirmDialog({
        open: false,
        itemId: null,
      });
    }
  };

  const handleCloseDialog = () => {
    setConfirmDialog({
      open: false,
      itemId: null,
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (e) {
      return "Invalid date";
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
            My Watchlist
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Movies you want to watch in the future.
          </Typography>
        </Box>

        <TextField
          placeholder="Search watchlist..."
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
      ) : filteredWatchlist.length === 0 ? (
        <Alert severity="info">
          {searchQuery
            ? "No movies found matching your search."
            : "Your watchlist is empty. Add movies to watch later!"}
        </Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Movie</TableCell>
                <TableCell>Director</TableCell>
                <TableCell>Year</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Age Rating</TableCell>
                <TableCell>Added Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredWatchlist.map((item) => (
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
                      "Not rated"
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
          Actions
        </Typography>

        <MenuItem onClick={handleViewDetails}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleMarkAsWatched}>
          <ListItemIcon>
            <CheckIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Mark as Watched</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleAddToWishlist}>
          <ListItemIcon>
            <BookmarkIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Add to Wishlist</ListItemText>
        </MenuItem>

        <MenuItem onClick={handleRemoveClick} sx={{ color: "error.main" }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Remove</ListItemText>
        </MenuItem>
      </Menu>

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>Confirm Removal</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this movie from your watchlist?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleRemoveConfirm} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Watchlist;
