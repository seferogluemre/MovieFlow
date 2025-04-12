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
import api, { processApiError, userService } from "../utils/api";
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

interface UserRelationship {
  userId: number;
  isFriend: boolean;
  isPending: boolean;
  isFollowing: boolean;
  isBlocked: boolean;
}

const Friends: FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus, currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friendship[]>([]);
  const [sentRequests, setSentRequests] = useState<Friendship[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [userRelationships, setUserRelationships] = useState<
    Record<number, UserRelationship>
  >({});
  const [filteredFriendships, setFilteredFriendships] = useState<Friendship[]>(
    []
  );
  const [filteredRequests, setFilteredRequests] = useState<Friendship[]>([]);
  const [filteredSentRequests, setFilteredSentRequests] = useState<
    Friendship[]
  >([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
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
      const fetchedFriendships = friendshipsResponse.data || [];

      // Get current user ID from localStorage for direct comparison
      const currentUserId = localStorage.getItem("user_id")
        ? parseInt(localStorage.getItem("user_id")!)
        : currentUser?.id;

      setFriendships(fetchedFriendships);

      // Filter out current user properly from displayed friendships
      // This Map will track the most recent friendship for each unique user
      const uniqueFriendships = new Map();

      // Process each friendship to find the most recent one for each user
      fetchedFriendships.forEach((friendship) => {
        // Skip self-relationships and any friendship where the current user is one of the parties
        if (
          friendship.userId === currentUserId &&
          friendship.friendId === currentUserId
        ) {
          return;
        }

        // Determine which user in this friendship is NOT the current user
        const otherUserId =
          friendship.userId === currentUserId
            ? friendship.friendId
            : friendship.userId;

        // Skip if the other user is somehow the current user (extra safety)
        if (otherUserId === currentUserId) {
          return;
        }

        // than the one we've already tracked, update the map
        if (
          !uniqueFriendships.has(otherUserId) ||
          new Date(friendship.createdAt) >
            new Date(uniqueFriendships.get(otherUserId).createdAt)
        ) {
          uniqueFriendships.set(otherUserId, friendship);
        }
      });

      // Convert the Map values back to an array
      const filtered = Array.from(uniqueFriendships.values());
      setFilteredFriendships(filtered);

      // Fetch received friend requests
      const pendingResponse = await api.get("/friendships/pending");
      setPendingRequests(pendingResponse.data || []);
      setFilteredRequests(pendingResponse.data || []);

      // Fetch sent friend requests
      const sentResponse = await api.get("/friendships/sent");
      setSentRequests(sentResponse.data || []);
      setFilteredSentRequests(sentResponse.data || []);

      // When on All Users tab, fetch all users
      if (activeTab === 3) {
        fetchAllUsers();
      }
    } catch (err) {
      console.error("Error fetching friendships:", err);
      setError("Arkadaşlık verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    if (loadingUsers) return;

    try {
      setLoadingUsers(true);
      const users = await userService.getAllUsers();

      // Get current user ID from localStorage for direct comparison
      const currentUserId = localStorage.getItem("user_id")
        ? parseInt(localStorage.getItem("user_id")!)
        : currentUser?.id;

      // Filter out the current user from the list of all users
      const filteredUsers = users.filter((user) => user.id !== currentUserId);

      setAllUsers(filteredUsers);
      setFilteredUsers(filteredUsers);

      // Build relationship map
      const relationships: Record<number, UserRelationship> = {};

      filteredUsers.forEach((user: User) => {
        const isFriend = friendships.some(
          (f) =>
            (f.friendId === user.id || f.userId === user.id) &&
            f.status === "ACCEPTED"
        );

        const isPending = friendships.some(
          (f) =>
            (f.friendId === user.id || f.userId === user.id) &&
            f.status === "PENDING"
        );

        const isFollowing = friendships.some(
          (f) => f.friendId === user.id && f.status === "FOLLOWING"
        );

        const isBlocked = friendships.some(
          (f) =>
            (f.friendId === user.id || f.userId === user.id) &&
            f.status === "BLOCKED"
        );

        relationships[user.id] = {
          userId: user.id,
          isFriend,
          isPending,
          isFollowing,
          isBlocked,
        };
      });

      setUserRelationships(relationships);
    } catch (err) {
      console.error("Error fetching all users:", err);
      setError("Kullanıcılar yüklenirken bir hata oluştu.");
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    // Get current user ID from localStorage for direct comparison
    const currentUserId = localStorage.getItem("user_id")
      ? parseInt(localStorage.getItem("user_id")!)
      : currentUser?.id;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();

      // This Map will track the most recent friendship for each unique user
      const uniqueFriendships = new Map();

      // Process each friendship to find the most recent one for each user that matches search
      friendships.forEach((friendship) => {
        // Skip self-relationships
        if (
          friendship.userId === currentUserId &&
          friendship.friendId === currentUserId
        ) {
          return;
        }

        // Get the other user in the friendship
        const otherUserId =
          friendship.userId === currentUserId
            ? friendship.friendId
            : friendship.userId;

        // Skip if the other user is somehow the current user (extra safety)
        if (otherUserId === currentUserId) {
          return;
        }

        const otherUser =
          friendship.userId === currentUserId
            ? friendship.friend
            : friendship.user;

        // Check if the other user matches the search query
        if (
          otherUser.name.toLowerCase().includes(query) ||
          otherUser.username.toLowerCase().includes(query)
        ) {
          // If this is the first time we've seen this user, or this friendship is more recent
          // than the one we've already tracked, update the map
          if (
            !uniqueFriendships.has(otherUserId) ||
            new Date(friendship.createdAt) >
              new Date(uniqueFriendships.get(otherUserId).createdAt)
          ) {
            uniqueFriendships.set(otherUserId, friendship);
          }
        }
      });

      // Convert the Map values back to an array
      const filtered = Array.from(uniqueFriendships.values());
      setFilteredFriendships(filtered);

      // Filter received friend requests
      const filteredPending = pendingRequests.filter((request) => {
        const user = request.user;
        return (
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
        );
      });
      setFilteredRequests(filteredPending);

      // Filter sent friend requests
      const filteredSent = sentRequests.filter((request) => {
        const user = request.friend;
        return (
          user.name.toLowerCase().includes(query) ||
          user.username.toLowerCase().includes(query)
        );
      });
      setFilteredSentRequests(filteredSent);

      // Filter all users
      const filteredAllUsers = allUsers
        .filter((user) => user.id !== currentUser?.id) // Filter out current user
        .filter((user) => {
          return (
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query)
          );
        });
      setFilteredUsers(filteredAllUsers);
    } else {
      // When no search query, filter out friendships that only involve the current user
      // This Map will track the most recent friendship for each unique user
      const uniqueFriendships = new Map();

      // Process each friendship to find the most recent one for each user
      friendships.forEach((friendship) => {
        // Skip friendships where both user and friend are the current user
        if (
          friendship.userId === currentUserId &&
          friendship.friendId === currentUserId
        ) {
          return;
        }

        // Determine which user in this friendship is NOT the current user
        const otherUserId =
          friendship.userId === currentUserId
            ? friendship.friendId
            : friendship.userId;

        // If this is the first time we've seen this user, or this friendship is more recent
        // than the one we've already tracked, update the map
        if (
          !uniqueFriendships.has(otherUserId) ||
          new Date(friendship.createdAt) >
            new Date(uniqueFriendships.get(otherUserId).createdAt)
        ) {
          uniqueFriendships.set(otherUserId, friendship);
        }
      });

      // Convert the Map values back to an array
      const filteredFriends = Array.from(uniqueFriendships.values());
      setFilteredFriendships(filteredFriends);
      setFilteredRequests(pendingRequests);
      setFilteredSentRequests(sentRequests);

      // Filter out current user from all users
      const filteredUsers = allUsers.filter(
        (user) => user.id !== currentUser?.id
      );
      setFilteredUsers(filteredUsers);
    }
  }, [
    searchQuery,
    friendships,
    pendingRequests,
    sentRequests,
    allUsers,
    currentUser,
  ]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Fetch all users when switching to the All Users tab
    if (newValue === 3 && allUsers.length === 0) {
      fetchAllUsers();
    }
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

  const handleSendFriendRequest = async (userId: number) => {
    try {
      await api.post(`/friendships`, {
        friendId: userId,
        status: "PENDING",
      });

      setSuccessMessage("Arkadaşlık isteği gönderildi.");

      // Update the relationship for this user
      setUserRelationships((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          isPending: true,
        },
      }));

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error sending friendship request:", err);
      setError(processApiError(err));

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleFollowUser = async (userId: number) => {
    try {
      await api.post(`/friendships/follow/${userId}`);

      setSuccessMessage("Kullanıcı takip edilmeye başlandı.");

      // Update the relationship for this user
      setUserRelationships((prev) => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          isFollowing: true,
        },
      }));

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error following user:", err);
      setError(processApiError(err));

      setTimeout(() => {
        setError(null);
      }, 3000);
    }
  };

  const handleCancelRequest = async (friendshipId: number) => {
    try {
      await api.delete(`/friendships/${friendshipId}`);

      setSuccessMessage("Arkadaşlık isteği iptal edildi.");

      // Refresh data
      fetchData();

      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error("Error canceling friendship request:", err);
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
          <Tab label="Sent Requests" />
          <Tab label="All Users" />
        </Tabs>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder={
            activeTab === 0
              ? "Search friends..."
              : activeTab === 1
              ? "Search friend requests..."
              : activeTab === 2
              ? "Search sent requests..."
              : "Search users..."
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
                    {filteredFriendships.map((friendship, index) => {
                      const currentUserId = localStorage.getItem("userId")
                        ? parseInt(localStorage.getItem("userId")!)
                        : currentUser?.id;

                      const otherUserId =
                        friendship.userId === currentUserId
                          ? friendship.friendId
                          : friendship.userId;

                      const otherUser =
                        friendship.userId === currentUserId
                          ? friendship.friend
                          : friendship.user;

                      // Double-check that we're not displaying the current user
                      if (otherUserId === currentUserId) return null;

                      return (
                        <Box key={friendship.id}>
                          <ListItem
                            secondaryAction={
                              <IconButton
                                edge="end"
                                onClick={() => handleProfileClick(otherUserId)}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            }
                          >
                            <ListItemAvatar>
                              <Avatar
                                src={otherUser.profileImage || undefined}
                                alt={otherUser.name}
                                onClick={() => handleProfileClick(otherUserId)}
                                sx={{
                                  cursor: "pointer",
                                  width: 50,
                                  height: 50,
                                }}
                              />
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  component="span"
                                  fontWeight="bold"
                                >
                                  {otherUser.name}
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                    component="span"
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    @{otherUser.username}
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
                          {index < filteredFriendships.length - 1 && (
                            <Divider />
                          )}
                        </Box>
                      );
                    })}
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

          {/* Sent Requests Tab */}
          {activeTab === 2 && (
            <>
              {filteredSentRequests.length === 0 ? (
                <Alert severity="info">
                  {searchQuery
                    ? "Arama kriterlerinize uygun gönderilen istek bulunamadı."
                    : "Gönderilen arkadaşlık isteği yok."}
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {filteredSentRequests.map((request) => (
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
                              src={request.friend.profileImage || undefined}
                              alt={request.friend.name}
                              onClick={() =>
                                handleProfileClick(request.friend.id)
                              }
                              sx={{ cursor: "pointer", width: 60, height: 60 }}
                            />
                            <Box sx={{ ml: 2 }}>
                              <Typography variant="h6">
                                {request.friend.name}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                @{request.friend.username}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Sent {formatDate(request.createdAt)}
                          </Typography>
                        </CardContent>
                        <CardActions>
                          <Button
                            startIcon={<CloseIcon />}
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelRequest(request.id)}
                            fullWidth
                          >
                            Cancel Request
                          </Button>
                          <Button
                            startIcon={<PersonIcon />}
                            variant="outlined"
                            onClick={() =>
                              handleProfileClick(request.friend.id)
                            }
                            fullWidth
                          >
                            View Profile
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {/* All Users Tab */}
          {activeTab === 3 && (
            <>
              {loadingUsers ? (
                <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : filteredUsers.length === 0 ? (
                <Alert severity="info">
                  {searchQuery
                    ? "Arama kriterlerinize uygun kullanıcı bulunamadı."
                    : "Sistemde henüz kullanıcı yok."}
                </Alert>
              ) : (
                <Grid container spacing={3}>
                  {filteredUsers.map((user) => {
                    const relationship = userRelationships[user.id];
                    // Get current user ID from localStorage for double safety
                    const currentUserId = localStorage.getItem("user_id")
                      ? parseInt(localStorage.getItem("user_id")!)
                      : currentUser?.id;

                    // Skip if this is the current user (extra safety check)
                    if (user.id === currentUserId) return null;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={user.id}>
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
                                src={user.profileImage || undefined}
                                alt={user.name}
                                onClick={() => handleProfileClick(user.id)}
                                sx={{
                                  cursor: "pointer",
                                  width: 60,
                                  height: 60,
                                }}
                              />
                              <Box sx={{ ml: 2 }}>
                                <Typography variant="h6">
                                  {user.name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  @{user.username}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                          <CardActions>
                            <Button
                              startIcon={<PersonIcon />}
                              variant="outlined"
                              onClick={() => handleProfileClick(user.id)}
                            >
                              Profile
                            </Button>

                            {relationship?.isFriend ? (
                              <Button
                                startIcon={<PersonIcon />}
                                variant="contained"
                                color="success"
                                disabled
                              >
                                Friends
                              </Button>
                            ) : relationship?.isPending ? (
                              <Button
                                startIcon={<PersonAddIcon />}
                                variant="outlined"
                                color="primary"
                                disabled
                              >
                                Request Sent
                              </Button>
                            ) : relationship?.isBlocked ? (
                              <Button
                                startIcon={<CloseIcon />}
                                variant="outlined"
                                color="error"
                                disabled
                              >
                                Blocked
                              </Button>
                            ) : (
                              <Button
                                startIcon={<PersonAddIcon />}
                                variant="contained"
                                color="primary"
                                onClick={() => handleSendFriendRequest(user.id)}
                              >
                                Add Friend
                              </Button>
                            )}

                            {!relationship?.isFriend &&
                              !relationship?.isFollowing &&
                              !relationship?.isBlocked && (
                                <Button
                                  startIcon={<PersonAddIcon />}
                                  variant="outlined"
                                  onClick={() => handleFollowUser(user.id)}
                                >
                                  Follow
                                </Button>
                              )}
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
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
