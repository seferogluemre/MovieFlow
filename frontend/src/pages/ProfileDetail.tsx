import {
  Check as CheckIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  PersonAddOutlined as PersonAddOutlinedIcon,
  PersonOutlined as PersonOutlinedIcon,
  PersonRemove as PersonRemoveIcon,
  ThumbDown as ThumbDownIcon,
  ThumbUp as ThumbUpIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fade,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Modal,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";
import { FC, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { friendshipService, userService } from "../utils/api";
import { Friendship, TabPanelProps, User } from "../utils/types";

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
  cursor: "pointer",
}));

// Avatar modal için stil
const ModalAvatarContainer = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  outline: "none",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
}));

const ModalAvatar = styled(Avatar)(({ theme }) => ({
  width: 300,
  height: 300,
  border: `4px solid ${theme.palette.common.white}`,
  boxShadow: theme.shadows[10],
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  transition: "background-color 0.3s",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    cursor: "pointer",
  },
}));

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

// Define a proper interface for Reviews
interface Review {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  userId?: number;
  movieId?: number;
  movie?: {
    id?: number;
    title?: string;
    posterImage?: string;
  };
}

// Doğrulanma durumu için badge bileşeni
const VerificationBadge = styled(Box)(
  ({ theme, isVerified }: { theme: any; isVerified: boolean }) => ({
    display: "inline-flex",
    alignItems: "center",
    marginLeft: theme.spacing(1),
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: isVerified
      ? theme.palette.success.main
      : theme.palette.warning.light,
    color: isVerified ? theme.palette.common.white : theme.palette.text.primary,
    fontSize: "0.75rem",
    fontWeight: "bold",
  })
);

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
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  // Profil resmi modalı için state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Add new state for all users
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);

  // Add state for success message if it doesn't exist
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Profil resmi tıklandığında
  const handleAvatarClick = () => {
    setAvatarModalOpen(true);
  };

  // Modal kapatıldığında
  const handleCloseAvatarModal = () => {
    setAvatarModalOpen(false);
  };

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
            setRelationshipStatus("none");
          }
        }

        // Kullanıcı yorumlarını yükle
        await fetchUserReviews(parseInt(id));
      } catch (err: any) {
        setError(
          err.message || "Kullanıcı profili yüklenirken bir hata oluştu."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id, currentUser]);

  // Kullanıcı yorumlarını getir
  const fetchUserReviews = async (userId: number) => {
    // Only current user check is needed now
    const canViewUserReviews =
      // Current user is viewing their own profile
      (currentUser && currentUser.id === userId) ||
      // All other profiles are public
      true;

    // If user doesn't have permission to view reviews, set empty array and return
    if (!canViewUserReviews) {
      setUserReviews([]);
      setLoadingReviews(false);
      return;
    }

    try {
      setLoadingReviews(true);

      // If user is viewing their own profile, use the authenticated endpoint
      if (currentUser && currentUser.id === userId) {
        try {
          const response = await api.get(`/reviews/user/reviews`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          });

          if (response.data) {
            const reviewsArray = Array.isArray(response.data)
              ? response.data
              : response.data.data || [];

            // Enhance reviews with movie details if needed
            const enhancedReviews = await enhanceReviewsWithMovieData(
              reviewsArray
            );
            setUserReviews(enhancedReviews);
            return;
          }
        } catch (error) {}
      }

      // Try getting user data which might include reviews
      try {
        const response = await api.get(`/users/${userId}`);

        if (response.data && response.data.reviews) {
          const reviewsArray = Array.isArray(response.data.reviews)
            ? response.data.reviews
            : [];
          // Enhance reviews with movie details if needed
          const enhancedReviews = await enhanceReviewsWithMovieData(
            reviewsArray
          );
          setUserReviews(enhancedReviews);
          return;
        }
      } catch (error) {}

      // Fallback approach - try the direct reviews by userId endpoint
      try {
        const response = await fetch(
          `http://localhost:3000/api/reviews?userId=${userId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );

        if (response.ok) {
          const responseData = await response.json();
          const reviewsArray = responseData.data || responseData.results || [];
          // Enhance reviews with movie details if needed
          const enhancedReviews = await enhanceReviewsWithMovieData(
            Array.isArray(reviewsArray) ? reviewsArray : []
          );
          setUserReviews(enhancedReviews);
        } else {
          setUserReviews([]);
        }
      } catch (error) {
        setUserReviews([]);
      }
    } catch (error) {
      setUserReviews([]);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Helper function to enhance reviews with movie data if needed
  const enhanceReviewsWithMovieData = async (
    reviews: Review[]
  ): Promise<Review[]> => {
    // If no reviews, return empty array
    if (!reviews.length) return [];

    // Check if reviews already have movie data with posterImage
    const needsMovieData = reviews.some(
      (review) => !review.movie || !review.movie.posterImage
    );

    if (!needsMovieData) return reviews;

    // Fetch movie data for reviews that need it
    try {
      const enhancedReviews = await Promise.all(
        reviews.map(async (review) => {
          // Skip if review already has complete movie data
          if (review.movie && review.movie.posterImage) {
            return review;
          }

          // Otherwise fetch movie data
          try {
            if (!review.movieId) return review;

            const movieResponse = await api.get(`/movies/${review.movieId}`);
            if (movieResponse && movieResponse.data) {
              return {
                ...review,
                movie: movieResponse.data,
              };
            }
          } catch (err) {}
          return review;
        })
      );

      return enhancedReviews;
    } catch (err) {
      return reviews;
    }
  };

  // Kullanıcı ilişkisi değiştiğinde, yorumları yeniden kontrol et
  useEffect(() => {
    if (user && id) {
      fetchUserReviews(parseInt(id));
    }
  }, [relationshipStatus, user]);

  // Profil görüntüleme izni kontrol et
  const canViewDetailedProfile = () => {
    // If it's the current user's profile, they can see everything
    if (currentUser && user && currentUser.id === user.id) {
      return true;
    }

    // All accounts are now public - anyone can view
    return true;
  };

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

      // Update relationship status locally
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);

      // Always reload followers data when a user is followed
      // This ensures the follower count is updated even if the modal isn't open
      const updatedFollowers = await friendshipService.getUserFollowers(
        user.id
      );
      setFollowers(updatedFollowers);

      // Also refresh following list for the current user
      // This ensures mutual followers are properly tracked
      if (currentUser) {
        const updatedFollowing = await friendshipService.getUserFollowing(
          currentUser.id
        );
        setFollowing(updatedFollowing);
      }

      // Check if the other user is following back and update UI accordingly
      if (status.type === "mutualFollow") {
        // If it's mutual follow now, refresh mutual friends
        const mutualData = await friendshipService.getMutualFriends(user.id);
        setMutualFriends(mutualData);
      }

      // Show success message
      setSuccessMessage("Kullanıcı başarıyla takip edildi");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
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

      // Always reload followers data when unfollowing
      const updatedFollowers = await friendshipService.getUserFollowers(
        user.id
      );
      setFollowers(updatedFollowers);

      // Also update following data for the current user
      if (currentUser) {
        const updatedFollowing = await friendshipService.getUserFollowing(
          currentUser.id
        );
        setFollowing(updatedFollowing);
      }

      // Update mutual friends in case a mutual relationship was broken
      const mutualData = await friendshipService.getMutualFriends(user.id);
      setMutualFriends(mutualData);

      // Show success message
      setSuccessMessage("Kullanıcıyı takip etmeyi bıraktınız");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Kullanıcıyı takipten çıkarken bir hata oluştu.");
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle send friend request
  const handleSendFriendRequest = async (targetUserId?: number) => {
    if (!currentUser) return;

    // If no targetUserId provided, use the profile user's id
    const userId = targetUserId || (user ? user.id : null);

    if (!userId) {
      return;
    }

    try {
      setIsActionInProgress(true);
      await friendshipService.sendFriendRequest(userId);

      // If this is the current profile user, update relationship status
      if (user && userId === user.id) {
        // Update relationship status
        const status = await friendshipService.getRelationshipStatus(
          parseInt(id!)
        );
        setRelationshipStatus(status.type as RelationshipStatus);
        setRelationshipId(status.id);
      }
    } catch (err: any) {
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

            userIds.forEach(async (userId) => {
              if (!friendsData[userId]) {
                try {
                  const data = await userService.getUserStats(userId);
                  setFriendsData((prev) => ({ ...prev, [userId]: data }));
                } catch (err) {
                } finally {
                  setLoadingFriends((prev) => ({ ...prev, [userId]: false }));
                }
              }
            });
          }
        } catch (error) {
        } finally {
          setLoadingRelationships(false);
        }
      };

      fetchRelationships();
    }
  }, [friendsModalOpen, tabValue, user]);

  // Load all users when the friends modal is opened
  useEffect(() => {
    if (friendsModalOpen && tabValue === 3 && allUsers.length === 0) {
      const fetchAllUsers = async () => {
        setLoadingAllUsers(true);
        try {
          const users = await userService.getAllUsers();
          setAllUsers(users);
        } catch (error) {
        } finally {
          setLoadingAllUsers(false);
        }
      };

      fetchAllUsers();
    }
  }, [friendsModalOpen, tabValue, allUsers.length]);

  // Check friendship status between current user and another user
  const checkFriendshipStatus = async (otherUserId: number) => {
    if (!currentUser) return "none";

    try {
      const status = await friendshipService.getRelationshipStatus(otherUserId);
      return status.type;
    } catch (error) {
      return "none";
    }
  };

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

  // Add helper function to handle add friend button click
  const handleAddFriendClick = (e: React.MouseEvent, userId: number) => {
    e.stopPropagation();
    handleSendFriendRequest(userId);
  };

  // Function to handle cancelling friend request
  const handleCancelFriendRequest = async () => {
    if (!relationshipId) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.cancelFriendRequest(relationshipId);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);

      setSuccessMessage("Arkadaşlık isteği iptal edildi.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Arkadaşlık isteğini iptal ederken bir hata oluştu.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Add an effect to refresh the relationship lists when status changes
  useEffect(() => {
    // If we're on the profile page and we've taken an action that changed the relationship
    if (user && relationshipStatus) {
      const refreshRelationshipData = async () => {
        try {
          // Only refresh data if modal is open to avoid unnecessary API calls
          if (friendsModalOpen) {
            // Refresh mutual friends
            const mutualData = await friendshipService.getMutualFriends(
              user.id
            );
            setMutualFriends(mutualData);

            // Refresh followers
            const followersData = await friendshipService.getUserFollowers(
              user.id
            );
            setFollowers(followersData);

            // Refresh following
            const followingData = await friendshipService.getUserFollowing(
              user.id
            );
            setFollowing(followingData);
          }
        } catch (error) {}
      };

      refreshRelationshipData();
    }
  }, [relationshipStatus, friendsModalOpen, user]);

  // Add a new effect that ensures the profile stats are loaded when visiting a profile
  useEffect(() => {
    if (user && user.id) {
      const loadProfileStats = async () => {
        try {
          // Load followers, following and mutual friends even if modal isn't open
          // This ensures the counts are accurate when first visiting the profile
          const followersData = await friendshipService.getUserFollowers(
            user.id
          );
          setFollowers(followersData);

          const followingData = await friendshipService.getUserFollowing(
            user.id
          );
          setFollowing(followingData);

          const mutualData = await friendshipService.getMutualFriends(user.id);
          setMutualFriends(mutualData);
        } catch (error) {}
      };

      loadProfileStats();
    }
  }, [user]);

  // Add a function to render the relationship status UI based on status
  const renderRelationshipStatusUI = () => {
    if (!currentUser || !user || currentUser.id === user.id) return null;

    switch (relationshipStatus) {
      case "none":
        return (
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => handleFollowUser()}
              disabled={isActionInProgress}
            >
              {isActionInProgress ? <CircularProgress size={24} /> : "Takip Et"}
            </Button>
            <Button
              variant="outlined"
              startIcon={<PersonAddOutlinedIcon />}
              onClick={() => handleSendFriendRequest()}
              disabled={isActionInProgress}
            >
              Arkadaşlık İsteği Gönder
            </Button>
          </Stack>
        );

      case "pending":
        return (
          <Button
            variant="outlined"
            startIcon={<CheckIcon />}
            onClick={() => handleCancelFriendRequest()}
            disabled={isActionInProgress}
          >
            {isActionInProgress ? (
              <CircularProgress size={24} />
            ) : (
              "İstek Gönderildi"
            )}
          </Button>
        );

      case "pendingIncoming":
        return (
          <Stack spacing={1} direction="column" alignItems="center">
            <Typography variant="body2" color="text.secondary" gutterBottom>
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
        );

      case "friends":
        return (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Button
              variant="contained"
              color="success"
              startIcon={<CheckIcon />}
              disabled
            >
              Arkadaşsınız
            </Button>
          </Box>
        );

      case "following":
        return (
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
        );

      case "follower":
        return (
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
              {isActionInProgress ? <CircularProgress size={24} /> : "Takip Et"}
            </Button>
          </Box>
        );

      case "mutualFollow":
        return (
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
        );

      default:
        return null;
    }
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
            onClick={handleAvatarClick}
          >
            {!user.profileImage && getInitials(user.username)}
          </ProfileAvatar>

          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {user.name || user.username}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="body1" color="text.secondary">
              @{user.username}
            </Typography>
            <VerificationBadge isVerified={user.isVerified || false}>
              {user.isVerified ? (
                <>
                  <VerifiedUserIcon sx={{ fontSize: 16, mr: 0.5 }} />
                  Doğrulanmış
                </>
              ) : (
                <>
                  <VerifiedUserIcon
                    sx={{ fontSize: 16, mr: 0.5, color: "text.disabled" }}
                  />
                  Doğrulanmamış
                </>
              )}
            </VerificationBadge>
          </Box>

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
            <Box mt={3}>{renderRelationshipStatusUI()}</Box>
          )}
        </CardContent>
      </Card>

      {/* Connections stats - MOVED UP */}
      <Paper
        sx={{
          p: 3,
          textAlign: "center",
          cursor: "pointer",
          transition: "background-color 0.3s",
          mb: 4, // Added margin bottom
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

      {/* Yorumlar kısmı - NOW AFTER CONNECTIONS */}
      {canViewDetailedProfile() && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Kullanıcının Yorumları
            </Typography>

            {loadingReviews ? (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : !Array.isArray(userReviews) || userReviews.length === 0 ? (
              <Alert severity="info">Kullanıcı henüz yorum yapmamış.</Alert>
            ) : (
              <List>
                {userReviews.map((review) => (
                  <Box key={review.id}>
                    <ListItem alignItems="flex-start">
                      {review.movie?.posterImage && (
                        <Box
                          component="img"
                          src={
                            review.movie.posterImage.startsWith("http")
                              ? review.movie.posterImage
                              : `http://localhost:3000/uploads/${review.movie.posterImage}`
                          }
                          alt={review.movie?.title || "Film"}
                          sx={{
                            width: 60,
                            height: 90,
                            objectFit: "cover",
                            borderRadius: 1,
                            mr: 2,
                          }}
                          onError={(e) => {
                            // Fallback for broken images
                            (e.target as HTMLImageElement).src =
                              "https://via.placeholder.com/60x90?text=Film";
                          }}
                        />
                      )}
                      <ListItemText
                        primary={
                          <Typography fontWeight="medium">
                            {review.movie?.title || "Film"}
                          </Typography>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {review.content.length > 150
                                ? `${review.content.substring(0, 150)}...`
                                : review.content}
                            </Typography>
                            <br />
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.secondary"
                            >
                              {formatCreationTime(review.createdAt)}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </Box>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      )}

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

                      // Check if current user is viewing and they follow this person back
                      const isCurrentUser =
                        currentUser && currentUser.id === user.id;
                      const isMutualFollow = following.some(
                        (f) => f.friendId === followerUser.id
                      );
                      const isFriend = friendship.status === "ACCEPTED";

                      return (
                        <Box key={friendship.id}>
                          <StyledListItem
                            onClick={() => navigateToProfile(followerUser.id)}
                            sx={{
                              borderLeft: isFriend
                                ? "4px solid #4caf50"
                                : isMutualFollow
                                ? "4px solid #2196f3"
                                : "none",
                            }}
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
                                <Box
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                  >
                                    {followerUser.name || followerUser.username}
                                  </Typography>
                                  {isFriend && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        ml: 1,
                                        color: "success.main",
                                        bgcolor: "rgba(76, 175, 80, 0.12)",
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                      }}
                                    >
                                      Arkadaş
                                    </Typography>
                                  )}
                                  {!isFriend && isMutualFollow && (
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        ml: 1,
                                        color: "primary.main",
                                        bgcolor: "rgba(33, 150, 243, 0.12)",
                                        px: 1,
                                        py: 0.5,
                                        borderRadius: 1,
                                      }}
                                    >
                                      Karşılıklı Takip
                                    </Typography>
                                  )}
                                </Box>
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

      {/* Profil resmi modalı */}
      <Modal
        open={avatarModalOpen}
        onClose={handleCloseAvatarModal}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
            sx: { backgroundColor: "rgba(0, 0, 0, 0.8)" },
          },
        }}
      >
        <Fade in={avatarModalOpen}>
          <ModalAvatarContainer onClick={handleCloseAvatarModal}>
            <ModalAvatar
              src={getProfileImageUrl(user.profileImage)}
              alt={user.username}
              onClick={(e) => e.stopPropagation()}
            >
              {!user.profileImage && getInitials(user.username)}
            </ModalAvatar>
          </ModalAvatarContainer>
        </Fade>
      </Modal>
    </Box>
  );
};

export default ProfileDetail;
