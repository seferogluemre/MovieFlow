import {
  CheckCircle as CheckCircleIcon,
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
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
import UserOnlineStatus from "../components/UserOnlineStatus";
import { useAuth } from "../context/AuthContext";
import api, { friendshipService, userService } from "../utils/api";
import { Friendship, TabPanelProps, User } from "../utils/types";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);

  // Profil resmi modalı için state
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Add new state for all users
  const [allUsers, setAllUsers] = useState<User[]>([]);
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
            console.log("Relationship status:", status);
            setRelationshipStatus(status.type as RelationshipStatus);
            setRelationshipId(status.id);

            // Also preload the connections data to ensure UI updates properly
            const followersData = await friendshipService.getUserFollowers(
              parseInt(id)
            );
            setFollowers(followersData);

            const followingData = await friendshipService.getUserFollowing(
              parseInt(id)
            );
            setFollowing(followingData);

            const mutualData = await friendshipService.getMutualFriends(
              parseInt(id)
            );
            setMutualFriends(mutualData);
          } catch (e) {
            console.error("Error fetching relationship status:", e);
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

  // Check relationship status first on page load
  useEffect(() => {
    if (currentUser && user && currentUser.id !== user.id) {
      const checkRelationship = async () => {
        try {
          const status = await friendshipService.getRelationshipStatus(user.id);
          console.log("Current relationship status check:", status);

          // If we have a relationship, update it
          if (status) {
            setRelationshipStatus(status.type as RelationshipStatus);
            setRelationshipId(status.id);
          } else {
            setRelationshipStatus("none");
          }
        } catch (err) {
          console.error("Error checking relationship status:", err);
        }
      };

      checkRelationship();
    }
  }, [currentUser, user]);

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
        } catch (error) {
          console.error("Error fetching user reviews:", error);
        }
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
      } catch (error) {
        console.error("Error fetching user reviews:", error);
      }

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
      setSuccessMessage(
        `${user.username} kullanıcısını başarıyla takip etmeye başladınız`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Kullanıcıyı takip ederken bir hata oluştu.");
      setTimeout(() => setError(null), 3000);
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

    if (!userId || !user) {
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

      // Show success message
      setSuccessMessage(
        `${user.username} kullanıcısına arkadaşlık isteği gönderildi`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Arkadaşlık isteği gönderilirken bir hata oluştu.");
      setTimeout(() => setError(null), 3000);
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
    if (!relationshipId || !user) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.acceptFriendRequest(relationshipId);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);

      // Show success message
      setSuccessMessage(
        `${user.username} ile arkadaşlık isteğini kabul ettiniz`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Arkadaşlık isteğini kabul ederken bir hata oluştu.");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsActionInProgress(false);
    }
  };

  // Handle reject friend request
  const handleRejectFriendRequest = async () => {
    if (!relationshipId || !user) return;

    try {
      setIsActionInProgress(true);
      await friendshipService.rejectFriendRequest(relationshipId);

      // Update relationship status
      const status = await friendshipService.getRelationshipStatus(
        parseInt(id!)
      );
      setRelationshipStatus(status.type as RelationshipStatus);
      setRelationshipId(status.id);

      // Show success message
      setSuccessMessage(
        `${user.username} kullanıcısının arkadaşlık isteğini reddettiniz`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError("Arkadaşlık isteğini reddetken bir hata oluştu.");
      setTimeout(() => setError(null), 3000);
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
          // Always fetch all relationship data when the modal opens
          // Followers
          const followersData = await friendshipService.getUserFollowers(
            user.id
          );
          setFollowers(followersData || []);
          console.log(
            "Followers data (detailed):",
            JSON.stringify(followersData, null, 2)
          );

          // Following
          const followingData = await friendshipService.getUserFollowing(
            user.id
          );
          setFollowing(followingData || []);
          console.log(
            "Following data (detailed):",
            JSON.stringify(followingData, null, 2)
          );

          // Mutual Friends
          const mutualData = await friendshipService.getMutualFriends(user.id);
          setMutualFriends(mutualData || []);
          console.log(
            "Mutual friends data (detailed):",
            JSON.stringify(mutualData, null, 2)
          );

          // Collect all user IDs we need to load details for
          let userIds: number[] = [];

          // Add follower user IDs
          if (followersData && followersData.length > 0) {
            followersData.forEach((friendship) => {
              if (friendship && friendship.userId) {
                userIds.push(friendship.userId);
              }
            });
          }

          // Add following user IDs
          if (followingData && followingData.length > 0) {
            followingData.forEach((friendship) => {
              if (friendship && friendship.friendId) {
                userIds.push(friendship.friendId);
              }
            });
          }

          // Add mutual friend IDs
          if (mutualData && mutualData.length > 0) {
            mutualData.forEach((friend) => {
              if (friend && friend.id) {
                userIds.push(friend.id);
              }
            });
          }

          // Remove duplicates
          userIds = [...new Set(userIds)];
          console.log("User IDs to fetch:", userIds);

          // Initialize loading state for each user
          const initialLoadingState: { [key: number]: boolean } = {};
          userIds.forEach((id) => {
            if (!friendsData[id]) {
              initialLoadingState[id] = true;
            }
          });

          if (Object.keys(initialLoadingState).length > 0) {
            setLoadingFriends((prev) => ({ ...prev, ...initialLoadingState }));

            // Fetch user details for each ID
            for (const userId of userIds) {
              if (!friendsData[userId]) {
                try {
                  const userData = await userService.getUserStats(userId);
                  setFriendsData((prev) => ({ ...prev, [userId]: userData }));
                } catch (err) {
                  console.error(
                    `Error fetching user stats for ID ${userId}:`,
                    err
                  );
                } finally {
                  setLoadingFriends((prev) => ({ ...prev, [userId]: false }));
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching relationships:", error);
        } finally {
          setLoadingRelationships(false);
        }
      };

      fetchRelationships();
    }
  }, [friendsModalOpen, user]);

  // Load all users when the friends modal is opened
  useEffect(() => {
    if (friendsModalOpen && tabValue === 3 && allUsers.length === 0) {
      const fetchAllUsers = async () => {
        setLoadingAllUsers(true);
        try {
          const users = await userService.getAllUsers();
          setAllUsers(users);
        } catch (error) {
          console.error("Error fetching all users:", error);
        } finally {
          setLoadingAllUsers(false);
        }
      };

      fetchAllUsers();
    }
  }, [friendsModalOpen, tabValue, allUsers.length]);

  // Profil fotoğrafı URL'sini oluştur
  const getProfileImageUrl = (profileImage?: string | null) => {
    if (!profileImage) return undefined;

    // Eğer URL zaten tam bir URL ise direkt döndür
    if (profileImage.startsWith("http")) {
      return profileImage;
    }

    // Eğer sadece dosya adı varsa, backend URL'si ile birleştir
    return `http://localhost:3000/uploads/${profileImage}`;
  };

  // Kullanıcı adının ilk harflerini al
  const getInitials = (username?: string) => {
    if (!username) return "U";
    return username.substring(0, 2).toUpperCase();
  };

  // Format creation time
  const formatCreationTime = (date: string) => {
    try {
      if (!date) return "bilinmeyen zaman";
      return formatDistanceToNow(new Date(date), {
        addSuffix: true,
        locale: tr,
      });
    } catch (error) {
      console.error("Date formatting error:", error, date);
      return "bilinmeyen zaman";
    }
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
    return followers ? followers.length : 0;
  };

  const getFollowingCount = () => {
    return following ? following.length : 0;
  };

  const getMutualFriendsCount = () => {
    // If no mutual friends data or empty array, return 0
    if (!mutualFriends || mutualFriends.length === 0) {
      return 0;
    }

    // Check if we have direct user objects from API
    if (
      mutualFriends[0] &&
      mutualFriends[0].id &&
      !mutualFriends[0].userId &&
      !mutualFriends[0].friendId
    ) {
      return mutualFriends.length;
    }

    // Filter out valid mutual friends where status is ACCEPTED
    const validMutualFriends = mutualFriends.filter(
      (friendship) => friendship && friendship.status === "ACCEPTED"
    );

    return validMutualFriends.length;
  };

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
    } catch (err) {
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
        } catch (error) {
          console.error("Error fetching profile stats:", error);
        }
      };

      loadProfileStats();
    }
  }, [user]);

  // Add a function to render the relationship status UI based on status
  const renderRelationshipStatusUI = () => {
    if (!currentUser || !user || currentUser.id === user.id) return null;

    console.log("Rendering relationship UI with status:", relationshipStatus);

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
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<PersonRemoveIcon />}
              onClick={handleRemoveFriend}
              disabled={isActionInProgress}
            >
              {isActionInProgress ? (
                <CircularProgress size={16} />
              ) : (
                "Arkadaşlıktan Çıkar"
              )}
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
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<PersonAddOutlinedIcon />}
                onClick={() => handleSendFriendRequest()}
                disabled={isActionInProgress}
              >
                Arkadaş Ol
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
            </Stack>
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

  // Return component
  return (
    <Box sx={{ maxWidth: "600px", mx: "auto", py: 4 }}>
      {/* Success and error messages */}
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

      <Card sx={{ mb: 4 }}>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: 4,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexDirection: { xs: "column", sm: "row" },
              mb: 2,
            }}
          >
            <Avatar
              src={getProfileImageUrl(user.profileImage)}
              alt={user.name}
              onClick={handleAvatarClick}
              sx={{
                width: 100,
                height: 100,
                cursor: "pointer",
                mb: { xs: 2, sm: 0 },
                mr: { sm: 2 },
              }}
            />
            <Box sx={{ ml: { sm: 2 } }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography variant="h4" component="h1">
                  {user.name}
                </Typography>
                <UserOnlineStatus userId={parseInt(id || "0")} size="large" />
                {user.isVerified && (
                  <Box
                    component="span"
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      ml: 1,
                      bgcolor: "success.main",
                      color: "white",
                      borderRadius: 1,
                      px: 1,
                      py: 0.5,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                    }}
                  >
                    <CheckCircleIcon
                      fontSize="small"
                      sx={{ mr: 0.5, fontSize: "1rem" }}
                    />
                    Doğrulanmış
                  </Box>
                )}
              </Box>
              <Typography variant="body1" color="text.secondary">
                @{user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formatCreationTime(user.createdAt)} Katıldı
              </Typography>
            </Box>
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
                            bgcolor: "#dddddd",
                          }}
                          loading="lazy"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            (e.target as HTMLImageElement).onError = null;
                            (e.target as HTMLImageElement).src =
                              "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAABaCAYAAAA6xe0SAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNi4wLWMwMDIgNzkuMTY0NDYwLCAyMDIwLzA1LzEyLTE2OjA0OjE3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iIHhtbG5zOnBob3Rvc2hvcD0iaHR0cDovL25zLmFkb2JlLmNvbS9waG90b3Nob3AvMS4wLyIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0RXZ0PSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VFdmVudCMiIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSI2MCIgZXhpZjpQaXhlbFlEaW1lbnNpb249IjkwIiB4bXA6Q3JlYXRlRGF0ZT0iMjAyMy0wMS0wMVQxMjowMDowMFoiIHhtcDpNb2RpZnlEYXRlPSIyMDIzLTAxLTAxVDEyOjAwOjAwWiIgeG1wOk1ldGFkYXRhRGF0ZT0iMjAyMy0wMS0wMVQxMjowMDowMFoiIGRjOnRpdGxlPSJQbGFjZWhvbGRlciBNb3ZpZSBJbWFnZSIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2YzBkMGYyMi0wZDEwLTQyNDctOTI2NC1iODI3NmQ3MWNmOWEiIHhtcE1NOkRvY3VtZW50SUQ9ImFkb2JlOmRvY2lkOnBob3Rvc2hvcDo2YzUwZGJiYS0zZDYyLTQ2NGEtYjk4Ni0wODE0MzU1MjRmMTAiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo2YzBkMGYyMi0wZDEwLTQyNDctOTI2NC1iODI3NmQ3MWNmOWEiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOjZjMGQwZjIyLTBkMTAtNDI0Ny05MjY0LWI4Mjc2ZDcxY2Y5YSIgc3RFdnQ6d2hlbj0iMjAyMy0wMS0wMVQxMjowMDowMFoiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+8UjJrgAAAYBJREFUeJzt3c1twjAYxvFnkNLxCXZCZjgxADNkA0boDjlXJF8CjEJPbQ89gEQJIYX6+ufY8ftcI1Jb+cGJExvIvF/ZCrCj7+G/Dd2rqgrr9Rpd14WuSmKbzQbX6xWllFDVyPu+x3w+R9M0qKrK+Ln5dDrher0O71OapmFVVfFz+/1+SFMFXZbltbXWt2H7vqf7/Z6iKKg8z0lrTUVR0KfabrdUliXVdU1t21JWWK1WuFwuKMuSbcyMk+7J9X3P3gI4x2loq6GthrYa2mpof8e+LuR4POJ8PrOMlcZoaKuhrYa2GtpqaKuhrYb2l2UZY9DjOLbD2UELEqQFiaE1tNXQVkNbDW01tNXQVkNbDW01tNXQVkNbDW01tNXQVkNbDW01tNXQVkNbDW01tNXQVkNbDW01tNXQVkNbDW01tNXQVkNbDW01tNXQVkNbYj/FxVn+yXy73VLTNMQ5xtYrYOLxxK7riHM8ZRVFQZzzPAY2hXv63c04S/8AE8cjh4dbRhkAAAAASUVORK5CYII=";
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
                {!mutualFriends ||
                !mutualFriends.length ||
                !getMutualFriendsCount() ? (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Henüz ortak arkadaş yok.
                  </Typography>
                ) : (
                  <List sx={{ width: "100%" }}>
                    {(() => {
                      // Handle direct user objects in the mutualFriends array (from API)
                      if (
                        mutualFriends[0] &&
                        mutualFriends[0].id &&
                        !mutualFriends[0].userId &&
                        !mutualFriends[0].friendId
                      ) {
                        return mutualFriends.map((friend, index) => (
                          <Box key={friend.id}>
                            <StyledListItem
                              onClick={() => navigateToProfile(friend.id)}
                            >
                              <ListItemAvatar>
                                <UserOnlineStatus
                                  online={friend.isOnline || false}
                                >
                                  <Avatar
                                    src={getProfileImageUrl(
                                      friend.profileImage
                                    )}
                                    alt={friend.username}
                                  >
                                    {!friend.profileImage &&
                                      getInitials(friend.username)}
                                  </Avatar>
                                </UserOnlineStatus>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                  >
                                    {friend.name || friend.username}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      component="span"
                                    >
                                      @{friend.username}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </StyledListItem>
                            {index < mutualFriends.length - 1 && (
                              <Divider variant="inset" component="li" />
                            )}
                          </Box>
                        ));
                      }

                      // Original friendship-based display logic
                      const displayedUserIds = new Set<number>();
                      return mutualFriends
                        .filter((friendship) => {
                          // Only show ACCEPTED friendships
                          if (!friendship || friendship.status !== "ACCEPTED") {
                            return false;
                          }

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

                          // Use friendsData or the user/friend object from friendship
                          const otherUser =
                            friendsData[otherUserId] ||
                            (friendship.userId === user.id
                              ? friendship.friend
                              : friendship.user);

                          const isLoading = otherUser
                            ? false
                            : loadingFriends[otherUserId];

                          if (isLoading) {
                            return (
                              <Box
                                key={friendship.id || index}
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

                          if (!otherUser) {
                            console.warn(
                              "No user data for mutual friend:",
                              friendship
                            );
                            return null;
                          }

                          return (
                            <Box key={friendship.id || index}>
                              <StyledListItem
                                onClick={() => navigateToProfile(otherUser.id)}
                              >
                                <ListItemAvatar>
                                  <UserOnlineStatus
                                    online={friendship.isOnline || false}
                                  >
                                    <Avatar
                                      src={getProfileImageUrl(
                                        otherUser.profileImage
                                      )}
                                      alt={otherUser.username}
                                    >
                                      {!otherUser.profileImage &&
                                        getInitials(otherUser.username)}
                                    </Avatar>
                                  </UserOnlineStatus>
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
                                          friendship.createdAt || ""
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
                {!followers || !followers.length ? (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Henüz takipçi yok.
                  </Typography>
                ) : (
                  <List sx={{ width: "100%" }}>
                    {followers.map((friendship, index) => {
                      // Direct user objects (API may directly return user objects)
                      if (
                        friendship.id &&
                        !friendship.userId &&
                        !friendship.friendId
                      ) {
                        // Direct user object from API
                        return (
                          <Box key={friendship.id}>
                            <StyledListItem
                              onClick={() => navigateToProfile(friendship.id)}
                            >
                              <ListItemAvatar>
                                <UserOnlineStatus
                                  online={friendship.isOnline || false}
                                >
                                  <Avatar
                                    src={getProfileImageUrl(
                                      friendship.profileImage
                                    )}
                                    alt={friendship.username}
                                  >
                                    {!friendship.profileImage &&
                                      getInitials(friendship.username)}
                                  </Avatar>
                                </UserOnlineStatus>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                  >
                                    {friendship.name || friendship.username}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      component="span"
                                    >
                                      @{friendship.username}
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
                      }

                      // Handle friendship objects with explicit userId references
                      if (friendship.userId && !friendship.user) {
                        // This is just an ID reference, look up in friendsData
                        const followerUser = friendsData[friendship.userId];
                        const isLoading = followerUser
                          ? false
                          : loadingFriends[friendship.userId];

                        if (isLoading) {
                          return (
                            <Box
                              key={friendship.id || index}
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

                        if (!followerUser) {
                          console.warn(
                            "No user data for follower:",
                            friendship
                          );
                          return null;
                        }

                        // Check if current user is viewing and they follow this person back
                        const isCurrentUser =
                          currentUser && currentUser.id === user.id;
                        const isMutualFollow = following.some(
                          (f) => f.friendId === followerUser.id
                        );

                        return (
                          <Box key={friendship.id || index}>
                            <StyledListItem
                              onClick={() => navigateToProfile(followerUser.id)}
                            >
                              <ListItemAvatar>
                                <UserOnlineStatus
                                  online={friendship.isOnline || false}
                                >
                                  <Avatar
                                    src={getProfileImageUrl(
                                      followerUser.profileImage
                                    )}
                                    alt={followerUser.username}
                                  >
                                    {!followerUser.profileImage &&
                                      getInitials(followerUser.username)}
                                  </Avatar>
                                </UserOnlineStatus>
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
                                      {formatCreationTime(
                                        friendship.createdAt || ""
                                      )}
                                    </Typography>
                                  </Box>
                                }
                              />
                              {isCurrentUser && (
                                <Box ml={1}>
                                  {isMutualFollow ? (
                                    <Chip
                                      size="small"
                                      icon={<CheckIcon />}
                                      label="Karşılıklı"
                                      color="primary"
                                      sx={{ fontSize: "0.75rem" }}
                                    />
                                  ) : (
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleFollowUser();
                                      }}
                                      startIcon={<PersonAddIcon />}
                                    >
                                      Takip Et
                                    </Button>
                                  )}
                                </Box>
                              )}
                            </StyledListItem>
                            {index < followers.length - 1 && (
                              <Divider variant="inset" component="li" />
                            )}
                          </Box>
                        );
                      }

                      // For friendship objects that include user data directly
                      const followerUser = friendship.user
                        ? friendship.user
                        : null;

                      if (!followerUser) {
                        console.warn("No user data for follower:", friendship);
                        return null;
                      }

                      // Check if current user is viewing and they follow this person back
                      const isCurrentUser =
                        currentUser && currentUser.id === user.id;
                      const isMutualFollow = following.some(
                        (f) => f.friendId === followerUser.id
                      );

                      return (
                        <Box key={friendship.id || index}>
                          <StyledListItem
                            onClick={() => navigateToProfile(followerUser.id)}
                          >
                            <ListItemAvatar>
                              <UserOnlineStatus
                                online={friendship.isOnline || false}
                              >
                                <Avatar
                                  src={getProfileImageUrl(
                                    followerUser.profileImage
                                  )}
                                  alt={followerUser.username}
                                >
                                  {!followerUser.profileImage &&
                                    getInitials(followerUser.username)}
                                </Avatar>
                              </UserOnlineStatus>
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
                                    {formatCreationTime(
                                      friendship.createdAt || ""
                                    )}
                                  </Typography>
                                </Box>
                              }
                            />
                            {isCurrentUser && (
                              <Box ml={1}>
                                {isMutualFollow ? (
                                  <Chip
                                    size="small"
                                    icon={<CheckIcon />}
                                    label="Karşılıklı"
                                    color="primary"
                                    sx={{ fontSize: "0.75rem" }}
                                  />
                                ) : (
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFollowUser();
                                    }}
                                    startIcon={<PersonAddIcon />}
                                  >
                                    Takip Et
                                  </Button>
                                )}
                              </Box>
                            )}
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
                {!following || !following.length ? (
                  <Typography
                    variant="body1"
                    sx={{ textAlign: "center", py: 2 }}
                  >
                    Henüz takip ettiği kullanıcı yok.
                  </Typography>
                ) : (
                  <List sx={{ width: "100%" }}>
                    {following.map((friendship, index) => {
                      // For direct user objects (API may directly return user objects)
                      if (
                        friendship.id &&
                        !friendship.friendId &&
                        !friendship.userId
                      ) {
                        return (
                          <Box key={friendship.id}>
                            <StyledListItem
                              onClick={() => navigateToProfile(friendship.id)}
                            >
                              <ListItemAvatar>
                                <UserOnlineStatus
                                  online={friendship.isOnline || false}
                                >
                                  <Avatar
                                    src={getProfileImageUrl(
                                      friendship.profileImage
                                    )}
                                    alt={friendship.username}
                                  >
                                    {!friendship.profileImage &&
                                      getInitials(friendship.username)}
                                  </Avatar>
                                </UserOnlineStatus>
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="subtitle1"
                                    fontWeight="bold"
                                  >
                                    {friendship.name || friendship.username}
                                  </Typography>
                                }
                                secondary={
                                  <Box>
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      component="span"
                                    >
                                      @{friendship.username}
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
                      }

                      // For friendship objects with friendId
                      const followingUser = friendship.friendId
                        ? friendsData[friendship.friendId] || friendship.friend
                        : null;

                      const isLoading = followingUser
                        ? false
                        : loadingFriends[friendship.friendId];

                      if (isLoading) {
                        return (
                          <Box
                            key={friendship.id || index}
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

                      if (!followingUser) {
                        console.warn("No user data for following:", friendship);
                        return null;
                      }

                      // Check mutual status
                      const isMutualFollow = followers.some(
                        (f) => f.userId === followingUser.id
                      );
                      const isFriend = friendship.status === "ACCEPTED";

                      return (
                        <Box key={friendship.id || index}>
                          <StyledListItem
                            onClick={() => navigateToProfile(followingUser.id)}
                            sx={{
                              borderLeft: isFriend
                                ? "4px solid #4caf50"
                                : isMutualFollow
                                ? "4px solid #2196f3"
                                : "none",
                            }}
                          >
                            <ListItemAvatar>
                              <UserOnlineStatus
                                online={friendship.isOnline || false}
                              >
                                <Avatar
                                  src={getProfileImageUrl(
                                    followingUser.profileImage
                                  )}
                                  alt={followingUser.username}
                                >
                                  {!followingUser.profileImage &&
                                    getInitials(followingUser.username)}
                                </Avatar>
                              </UserOnlineStatus>
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
                                    {followingUser.name ||
                                      followingUser.username}
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
                                    @{followingUser.username}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    component="div"
                                    sx={{ mt: 0.5 }}
                                  >
                                    Takip ediliyor{" "}
                                    {formatCreationTime(
                                      friendship.createdAt || ""
                                    )}
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
