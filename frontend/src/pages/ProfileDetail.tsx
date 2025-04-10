import { FC, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  IconButton,
  Stack,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  People as PeopleIcon,
  PersonOutlined as PersonOutlinedIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
} from "@mui/icons-material";
import { userService, friendshipService } from "../utils/api";
import { User, Friendship } from "../utils/types";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

// Büyük avatar
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
}));

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
      id={`friends-tabpanel-${index}`}
      aria-labelledby={`friends-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

// New type for the relationship status
type RelationshipStatus =
  | "none"
  | "pending"
  | "pendingIncoming"
  | "friends"
  | "following"
  | "follower"
  | "mutualFollow"
  | "blocked"
  | "blockedByOther";

const ProfileDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relationshipStatus, setRelationshipStatus] =
    useState<RelationshipStatus>("none");
  const [relationshipId, setRelationshipId] = useState<number | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const navigate = useNavigate();
  const [friendsModalOpen, setFriendsModalOpen] = useState(false);
  const [friendsData, setFriendsData] = useState<{ [key: number]: User }>({});
  const [loadingFriends, setLoadingFriends] = useState<{
    [key: number]: boolean;
  }>({});
  const [tabValue, setTabValue] = useState(0);
  const [followers, setFollowers] = useState<Friendship[]>([]);
  const [following, setFollowing] = useState<Friendship[]>([]);
  const [mutualFriends, setMutualFriends] = useState<Friendship[]>([]);
  const [loadingRelationships, setLoadingRelationships] = useState(false);

  // Load user data and relationship status
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Get user data
        const userData = await userService.getUserStats(parseInt(id));
        setUser(userData);

        // Check relationship status if logged in
        if (currentUser && currentUser.id !== parseInt(id)) {
          try {
            const status = await friendshipService.getRelationshipStatus(
              parseInt(id)
            );
            setRelationshipStatus(status.type as RelationshipStatus);
            setRelationshipId(status.id);
          } catch (e) {
            console.error("Error checking relationship status:", e);
            setRelationshipStatus("none");
          }
        }
      } catch (err: any) {
        console.error("Error loading user profile:", err);
        setError(
          err.message || "Kullanıcı profili yüklenirken bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, currentUser]);

  // Handle follow user
  const handleFollowUser = async () => {
    if (!user || !currentUser) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.followUser(user.id);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);
    } catch (err: any) {
      console.error("Error following user:", err);
      setError("Kullanıcıyı takip ederken bir hata oluştu.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle unfollow user
  const handleUnfollowUser = async () => {
    if (!user || !currentUser) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.unfollowUser(user.id);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);
    } catch (err: any) {
      console.error("Error unfollowing user:", err);
      setError("Kullanıcıyı takipten çıkarken bir hata oluştu.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle send friend request (legacy compatibility)
  const handleSendFriendRequest = async () => {
    if (!user || !currentUser) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.sendFriendRequest(user.id);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);
    } catch (err: any) {
      console.error("Error sending friend request:", err);
      setError("Arkadaşlık isteği gönderilirken bir hata oluştu.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle remove friend (works for unfollowing as well)
  const handleRemoveFriend = async () => {
    await handleUnfollowUser();
  };

  // Handle accept friend request
  const handleAcceptFriendRequest = async () => {
    if (!relationshipId) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.acceptFriendRequest(relationshipId);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);
    } catch (err: any) {
      console.error("Error accepting friend request:", err);
      setError("Arkadaşlık isteğini kabul ederken bir hata oluştu.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle reject friend request
  const handleRejectFriendRequest = async () => {
    if (!relationshipId) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.rejectFriendRequest(relationshipId);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);
    } catch (err: any) {
      console.error("Error rejecting friend request:", err);
      setError("Arkadaşlık isteğini reddetken bir hata oluştu.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Load followers, following, and mutual friends
  useEffect(() => {
    if (friendsModalOpen && user) {
      const fetchRelationships = async () => {
        setLoadingRelationships(true);

        try {
          // Fetch appropriate data based on tab
          if (tabValue === 0) {
            // Mutual Friends
            const data = await friendshipService.getMutualFriends(user.id);
            setMutualFriends(data);
          } else if (tabValue === 1) {
            // Followers
            const data = await friendshipService.getUserFollowers(user.id);
            setFollowers(data);
          } else if (tabValue === 2) {
            // Following
            const data = await friendshipService.getUserFollowing(user.id);
            setFollowing(data);
          }

          // Collect all IDs we need to load
          let userIds: number[] = [];

          if (tabValue === 0) {
            userIds = mutualFriends.map((f) =>
              f.userId === user.id ? f.friendId : f.userId
            );
          } else if (tabValue === 1) {
            userIds = followers.map((f) => f.userId);
          } else if (tabValue === 2) {
            userIds = following.map((f) => f.friendId);
          }

          // Initialize loading state for each user
          const initialLoadingState: { [key: number]: boolean } = {};
          userIds.forEach((id) => {
            if (!friendsData[id]) {
              initialLoadingState[id] = true;
            }
          });

          if (Object.keys(initialLoadingState).length > 0) {
            setLoadingFriends((prev) => ({ ...prev, ...initialLoadingState }));

            // Load each user's data
            userIds.forEach(async (userId) => {
              if (!friendsData[userId]) {
                try {
                  const data = await userService.getUserStats(userId);
                  setFriendsData((prev) => ({ ...prev, [userId]: data }));
                } catch (err) {
                  console.error(
                    `Error loading user data for ID ${userId}:`,
                    err
                  );
                } finally {
                  setLoadingFriends((prev) => ({ ...prev, [userId]: false }));
                }
              }
            });
          }
        } catch (error) {
          console.error("Error loading relationships:", error);
        } finally {
          setLoadingRelationships(false);
        }
      };

      fetchRelationships();
    }
  }, [friendsModalOpen, tabValue, user]);

  // Profil fotoğrafı URL'sini oluştur
  const getProfileImageUrl = (profileImage?: string | null) => {
    if (!profileImage) return undefined;

    return profileImage.startsWith("http")
      ? profileImage
      : `http://localhost:3000/uploads/${profileImage}`;
  };

  // Kullanıcı adının ilk harflerini al
  const getInitials = (username?: string) => {
    if (!username) return "U";
    return username.substring(0, 2).toUpperCase();
  };

  // Format creation time
  const formatCreationTime = (date: string) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: tr,
    });
  };

  // Navigate to profile
  const navigateToProfile = (userId: number) => {
    setFriendsModalOpen(false);
    navigate(`/profile/${userId}`);
  };

  // Handle modal
  const handleOpenFriendsModal = () => {
    setFriendsModalOpen(true);
  };

  const handleCloseFriendsModal = () => {
    setFriendsModalOpen(false);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Get counts for different relationships
  const getFollowersCount = () => {
    return followers.length;
  };

  const getFollowingCount = () => {
    return following.length;
  };

  const getMutualFriendsCount = () => {
    return mutualFriends.length;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "70vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Alert severity="error" sx={{ mt: 4 }}>
        {error || "Kullanıcı bulunamadı."}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: "600px", mx: "auto", py: 4 }}>
      <Card sx={{ mb: 4 }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
          }}
        >
          <ProfileAvatar
            src={getProfileImageUrl(user.profileImage)}
            alt={user.username}
          >
            {!user.profileImage && getInitials(user.username)}
          </ProfileAvatar>

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {user.name || user.username}
          </Typography>

          <Typography variant="body1" color="text.secondary" gutterBottom>
            @{user.username}
          </Typography>

          {/* Email bilgisi */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mt: 2,
            }}
          >
            <EmailIcon color="action" />
            <Typography variant="body1">{user.email}</Typography>
          </Box>

          {user.bio && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="body1">{user.bio}</Typography>
            </Box>
          )}

          {/* Relationship actions */}
          {currentUser && currentUser.id !== user.id && (
            <Box mt={3}>
              {relationshipStatus === "none" && (
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleFollowUser}
                    disabled={isActionInProgress}
                  >
                    {isActionInProgress ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Takip Et"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<PersonAddOutlinedIcon />}
                    onClick={handleSendFriendRequest}
                    disabled={isActionInProgress}
                  >
                    Arkadaşlık İsteği Gönder
                  </Button>
                </Stack>
              )}

              {relationshipStatus === "pending" && (
                <Button variant="outlined" startIcon={<CheckIcon />} disabled>
                  İstek Gönderildi
                </Button>
              )}

              {relationshipStatus === "pendingIncoming" && (
                <Stack spacing={1} direction="column" alignItems="center">
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    gutterBottom
                  >
                    Size arkadaşlık isteği gönderdi
                  </Typography>
                  <Stack spacing={1} direction="row">
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ThumbUpIcon />}
                      onClick={handleAcceptFriendRequest}
                      disabled={isActionInProgress}
                    >
                      {isActionInProgress ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Kabul Et"
                      )}
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<ThumbDownIcon />}
                      onClick={handleRejectFriendRequest}
                      disabled={isActionInProgress}
                    >
                      Reddet
                    </Button>
                  </Stack>
                </Stack>
              )}

              {relationshipStatus === "friends" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckIcon />}
                    disabled
                  >
                    Arkadaşsınız
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<PersonRemoveIcon />}
                    onClick={handleUnfollowUser}
                    disabled={isActionInProgress}
                  >
                    {isActionInProgress ? (
                      <CircularProgress size={16} />
                    ) : (
                      "Arkadaşlıktan Çıkar"
                    )}
                  </Button>
                </Box>
              )}

              {relationshipStatus === "following" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckIcon />}
                    disabled
                  >
                    Takip Ediyorsunuz
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<PersonRemoveIcon />}
                    onClick={handleUnfollowUser}
                    disabled={isActionInProgress}
                  >
                    {isActionInProgress ? (
                      <CircularProgress size={16} />
                    ) : (
                      "Takibi Bırak"
                    )}
                  </Button>
                </Box>
              )}

              {relationshipStatus === "follower" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Sizi takip ediyor
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<PersonAddIcon />}
                    onClick={handleFollowUser}
                    disabled={isActionInProgress}
                  >
                    {isActionInProgress ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Takip Et"
                    )}
                  </Button>
                </Box>
              )}

              {relationshipStatus === "mutualFollow" && (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<CheckIcon />}
                    disabled
                  >
                    Birbirinizi Takip Ediyorsunuz
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<PersonRemoveIcon />}
                    onClick={handleUnfollowUser}
                    disabled={isActionInProgress}
                  >
                    {isActionInProgress ? (
                      <CircularProgress size={16} />
                    ) : (
                      "Takibi Bırak"
                    )}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Connections stats */}
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "background-color 0.3s",
          "&:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.04)",
          },
        }}
        onClick={handleOpenFriendsModal}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="medium">
              {getFollowersCount()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Takipçi
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="medium">
              {getFollowingCount()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Takip
            </Typography>
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" fontWeight="medium">
              {getMutualFriendsCount()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Arkadaş
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Connections Modal */}
      <Dialog
        open={friendsModalOpen}
        onClose={handleCloseFriendsModal}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {user.name || user.username}'in Bağlantıları
            </Typography>
            <IconButton onClick={handleCloseFriendsModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={tabValue} onChange={handleTabChange} centered>
            <Tab
              icon={<PeopleIcon />}
              label={`Arkadaşlar (${getMutualFriendsCount()})`}
              id="friends-tab-0"
              aria-controls="friends-tabpanel-0"
            />
            <Tab
              icon={<PersonOutlinedIcon />}
              label={`Takipçiler (${getFollowersCount()})`}
              id="friends-tab-1"
              aria-controls="friends-tabpanel-1"
            />
            <Tab
              icon={<PersonAddOutlinedIcon />}
              label={`Takip Edilenler (${getFollowingCount()})`}
              id="friends-tab-2"
              aria-controls="friends-tabpanel-2"
            />
          </Tabs>
        </Box>

        <DialogContent dividers>
          {loadingRelationships ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Mutual Friends Tab */}
              <TabPanel value={tabValue} index={0}>
                {!mutualFriends.length ? (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Henüz ortak arkadaş yok.
                  </Typography>
                ) : (
                  <List sx={{ width: "100%" }}>
                    {(() => {
                      const displayedUserIds = new Set<number>();
                      return mutualFriends
                        .filter((friendship) => {
                          const otherUserId =
                            friendship.userId === user.id
                              ? friendship.friendId
                              : friendship.userId;

                          if (displayedUserIds.has(otherUserId)) {
                            return false;
                          }

                          displayedUserIds.add(otherUserId);
                          return true;
                        })
                        .map((friendship, index, filteredFriendships) => {
                          const otherUserId =
                            friendship.userId === user.id
                              ? friendship.friendId
                              : friendship.userId;

                          const otherUser = friendsData[otherUserId];
                          const isLoading = loadingFriends[otherUserId];

                          if (isLoading) {
                            return (
                              <Box
                                key={friendship.id}
                                sx={{
                                  p: 2,
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                <CircularProgress size={24} />
                              </Box>
                            );
                          }

                          if (!otherUser) return null;

                          return (
                            <Box key={friendship.id}>
                              <StyledListItem
                                onClick={() => navigateToProfile(otherUser.id)}
                              >
                                <ListItemAvatar>
                                  <Avatar
                                    src={getProfileImageUrl(
                                      otherUser.profileImage
                                    )}
                                    alt={otherUser.username}
                                  >
                                    {!otherUser.profileImage &&
                                      getInitials(otherUser.username)}
                                  </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="subtitle1"
                                      fontWeight="bold"
                                    >
                                      {otherUser.name || otherUser.username}
                                    </Typography>
                                  }
                                  secondary={
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        component="span"
                                      >
                                        @{otherUser.username}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        component="div"
                                        sx={{ mt: 0.5 }}
                                      >
                                        Arkadaşlık{" "}
                                        {formatCreationTime(
                                          friendship.createdAt
                                        )}
                                      </Typography>
                                    </Box>
                                  }
                                />
                              </StyledListItem>
                              {index < filteredFriendships.length - 1 && (
                                <Divider variant="inset" component="li" />
                              )}
                            </Box>
                          );
                        });
                    })()}
                  </List>
                )}
              </TabPanel>

              {/* Followers Tab */}
              <TabPanel value={tabValue} index={1}>
                {!followers.length ? (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Henüz takipçi yok.
                  </Typography>
                ) : (
                  <List sx={{ width: "100%" }}>
                    {followers.map((friendship, index) => {
                      const followerUser = friendsData[friendship.userId];
                      const isLoading = loadingFriends[friendship.userId];

                      if (isLoading) {
                        return (
                          <Box
                            key={friendship.id}
                            sx={{
                              p: 2,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <CircularProgress size={24} />
                          </Box>
                        );
                      }

                      if (!followerUser) return null;

                      return (
                        <Box key={friendship.id}>
                          <StyledListItem
                            onClick={() => navigateToProfile(followerUser.id)}
                          >
                            <ListItemAvatar>
                              <Avatar
                                src={getProfileImageUrl(
                                  followerUser.profileImage
                                )}
                                alt={followerUser.username}
                              >
                                {!followerUser.profileImage &&
                                  getInitials(followerUser.username)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {followerUser.name || followerUser.username}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="span"
                                  >
                                    @{followerUser.username}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="div"
                                    sx={{ mt: 0.5 }}
                                  >
                                    Takip ediyor{" "}
                                    {formatCreationTime(friendship.createdAt)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </StyledListItem>
                          {index < followers.length - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </Box>
                      );
                    })}
                  </List>
                )}
              </TabPanel>

              {/* Following Tab */}
              <TabPanel value={tabValue} index={2}>
                {!following.length ? (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Henüz takip ettiği kullanıcı yok.
                  </Typography>
                ) : (
                  <List sx={{ width: "100%" }}>
                    {following.map((friendship, index) => {
                      const followingUser = friendsData[friendship.friendId];
                      const isLoading = loadingFriends[friendship.friendId];

                      if (isLoading) {
                        return (
                          <Box
                            key={friendship.id}
                            sx={{
                              p: 2,
                              display: "flex",
                              justifyContent: "center",
                            }}
                          >
                            <CircularProgress size={24} />
                          </Box>
                        );
                      }

                      if (!followingUser) return null;

                      return (
                        <Box key={friendship.id}>
                          <StyledListItem
                            onClick={() => navigateToProfile(followingUser.id)}
                          >
                            <ListItemAvatar>
                              <Avatar
                                src={getProfileImageUrl(
                                  followingUser.profileImage
                                )}
                                alt={followingUser.username}
                              >
                                {!followingUser.profileImage &&
                                  getInitials(followingUser.username)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography
                                  variant="subtitle1"
                                  fontWeight="bold"
                                >
                                  {followingUser.name || followingUser.username}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="span"
                                  >
                                    @{followingUser.username}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="div"
                                    sx={{ mt: 0.5 }}
                                  >
                                    Takip ediliyor{" "}
                                    {formatCreationTime(friendship.createdAt)}
                                  </Typography>
                                </Box>
                              }
                            />
                          </StyledListItem>
                          {index < following.length - 1 && (
                            <Divider variant="inset" component="li" />
                          )}
                        </Box>
                      );
                    })}
                  </List>
                )}
              </TabPanel>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ProfileDetail;
