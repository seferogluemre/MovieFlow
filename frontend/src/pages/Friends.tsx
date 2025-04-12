import { FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import api, { processApiError } from "../utils/api";
import { useAuth } from "../context/AuthContext";

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  profileImage: string | null;
}

interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  status: string;
  createdAt: string;
  user: User;
  friend: User;
}

const Friends: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [filteredFriendships, setFilteredFriendships] = useState<Friendship[]>(
    []
  );
  const [filteredRequests, setFilteredRequests] = useState<Friendship[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const init = async () => {
      if (isAuthenticated) {
        fetchData();
      } else {
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          fetchData();
        } else {
          navigate("/login");
        }
      }
    };

    init();
  }, [isAuthenticated, navigate, checkAuthStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch friendships
      const friendshipsResponse = await api.get("/friendships");
      setFriendships(friendshipsResponse.data || []);
      setFilteredFriendships(friendshipsResponse.data || []);

      // Fetch pending requests
      const pendingResponse = await api.get("/friendships/pending");
      setPendingRequests(pendingResponse.data || []);
      setFilteredRequests(pendingResponse.data || []);
    } catch (err) {
      console.error("Error fetching friendships:", err);
      setError("Arkadaşlık verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter friendships based on search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      const filtered = friendships.filter((friendship) => {
        const friend = friendship.friend;
        return (
          friend.name.toLowerCase().includes(query) ||
          friend.username.toLowerCase().includes(query)
        );
      });
      setFilteredFriendships(filtered);

      const filteredPending = pendingRequests.filter((request) => {
        const user = request.user;
        return (
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
        );
      });
      setFilteredRequests(filteredPending);
    } else {
      setFilteredFriendships(friendships);
      setFilteredRequests(pendingRequests);
    }
  }, [searchQuery, friendships, pendingRequests]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const handleAcceptRequest = async (friendshipId: number) => {
    try {
      await api.patch(`/friendships/${friendshipId}`, {
        status: "ACCEPTED",
      });

      setSuccessMessage("Arkadaşlık isteği kabul edildi.");

      // Refresh data
      fetchData();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error accepting friendship request:", err);
      setError(processApiError(err));

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleRejectRequest = async (friendshipId: number) => {
    try {
      await api.patch(`/friendships/${friendshipId}`, {
        status: "BLOCKED",
      });

      setSuccessMessage("Arkadaşlık isteği reddedildi.");

      // Refresh data
      fetchData();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error rejecting friendship request:", err);
      setError(processApiError(err));

      setTimeout(() => {
        setError(null);
      }, 3000);
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

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold">
        Friends
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Manage your friends and friend requests.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="My Friends" />
          <Tab label="Friend Requests" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={
            activeTab === 0 ? "Search friends..." : "Search friend requests..."
          }
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Friends Tab */}
          {activeTab === 0 && (
            <>
              {filteredFriendships.length === 0 ? (
                <Alert severity="info">
                  {searchQuery
                    ? "Arama kriterlerinize uygun arkadaş bulunamadı."
                    : "Henüz bir arkadaşınız yok."}
                </Alert>
              ) : (
                <Paper>
                  <List>
                    {filteredFriendships.map((friendship, index) => (
                      <Box key={friendship.id}>
                        <ListItem
                          secondaryAction={
                            <IconButton
                              edge="end"
                              onClick={() =>
                                handleProfileClick(friendship.friend.id)
                              }
                            >
                              <MoreVertIcon />
                            </IconButton>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar
                              src={friendship.friend.profileImage || undefined}
                              alt={friendship.friend.name}
                              onClick={() =>
                                handleProfileClick(friendship.friend.id)
                              }
                              sx={{ cursor: "pointer", width: 50, height: 50 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography
                                variant="subtitle1"
                                component="span"
                                fontWeight="bold"
                              >
                                {friendship.friend.name}
                              </Typography>
                            }
                            secondary={
                              <>
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  @{friendship.friend.username}
                                </Typography>
                                <br />
                                <Typography
                                  component="span"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Arkadaş oldu:{" "}
                                  {formatDate(friendship.createdAt)}
                                </Typography>
                              </>
                            }
                            sx={{ ml: 2 }}
                          />
                        </ListItem>
                        {index < filteredFriendships.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                </Paper>
              )}
            </>
          )}

          {/* Friend Requests Tab */}
          {activeTab === 1 && (
            <>
              {filteredRequests.length === 0 ? (
                <Alert severity="info">
                  {searchQuery
                    ? "Arama kriterlerinize uygun arkadaşlık isteği bulunamadı."
                    : "Bekleyen arkadaşlık isteği yok."}
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {filteredRequests.map((request) => (
                    <Grid item xs={12} md={4} key={request.id}>
                      <Card>
                        <CardContent>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Avatar
                              src={request.user.profileImage || undefined}
                              alt={request.user.name}
                              onClick={() =>
                                handleProfileClick(request.user.id)
                              }
                              sx={{ cursor: "pointer", width: 60, height: 60 }}
                            />
                            <Box sx={{ ml: 2 }}>
                              <Typography variant="h6">
                                {request.user.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                @{request.user.username}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Requested {formatDate(request.createdAt)}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            startIcon={<CheckIcon />}
                            variant="contained"
                            color="primary"
                            onClick={() => handleAcceptRequest(request.id)}
                            fullWidth
                          >
                            Accept
                          </Button>
                          <Button
                            startIcon={<CloseIcon />}
                            variant="outlined"
                            color="error"
                            onClick={() => handleRejectRequest(request.id)}
                            fullWidth
                          >
                            Decline
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Friends;
