import { FC, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Check as CheckIcon,
  Email as EmailIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { userService, friendshipService } from "../utils/api";
import { User } from "../utils/types";
import { useAuth } from "../context/AuthContext";

// Büyük avatar
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 150,
  height: 150,
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
}));

const ProfileDetail: FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [friendshipStatus, setFriendshipStatus] = useState<
    "none" | "pending" | "friends" | "blocked"
  >("none");
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  // Kullanıcı verilerini yükle
  useEffect(() => {
    const fetchUserData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        // Kullanıcı bilgilerini al
        const userData = await userService.getUserStats(parseInt(id));
        setUser(userData);

        // Arkadaşlık durumunu kontrol et
        if (currentUser && currentUser.id !== parseInt(id)) {
          try {
            const friends = await friendshipService.getUserFriends(
              currentUser.id
            );
            const friendship = friends?.find(
              (f: any) =>
                f.friendId === parseInt(id) || f.userId === parseInt(id)
            );

            if (friendship) {
              if (friendship.status === "ACCEPTED") {
                setFriendshipStatus("friends");
              } else if (friendship.status === "PENDING") {
                setFriendshipStatus("pending");
              } else if (friendship.status === "BLOCKED") {
                setFriendshipStatus("blocked");
              }
            } else {
              setFriendshipStatus("none");
            }
          } catch (e) {
            console.error("Error checking friendship status:", e);
            setFriendshipStatus("none");
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

  // Arkadaşlık isteği gönderme
  const handleSendFriendRequest = async () => {
    if (!user || !currentUser) return;

    try {
      setIsSendingRequest(true);
      // API'ye istek gönder
      await friendshipService.sendFriendRequest(user.id);
      // Başarılı ise durumu güncelle
      setFriendshipStatus("pending");
    } catch (err: any) {
      console.error("Error sending friend request:", err);
      setError("Arkadaşlık isteği gönderilirken bir hata oluştu.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  // Arkadaşlıktan çıkarma
  const handleRemoveFriend = async () => {
    if (!user || !currentUser) return;

    try {
      setIsSendingRequest(true);
      // API'ye istek gönder
      await friendshipService.removeFriend(user.id);
      // Başarılı ise durumu güncelle
      setFriendshipStatus("none");
    } catch (err: any) {
      console.error("Error removing friend:", err);
      setError("Arkadaşlıktan çıkarılırken bir hata oluştu.");
    } finally {
      setIsSendingRequest(false);
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

          {/* Arkadaşlık durumu ve işlemleri */}
          {currentUser && currentUser.id !== user.id && (
            <Box mt={3}>
              {friendshipStatus === "none" && (
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={handleSendFriendRequest}
                  disabled={isSendingRequest}
                >
                  {isSendingRequest ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Arkadaş Ekle"
                  )}
                </Button>
              )}

              {friendshipStatus === "pending" && (
                <Button variant="outlined" startIcon={<CheckIcon />} disabled>
                  İstek Gönderildi
                </Button>
              )}

              {friendshipStatus === "friends" && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PersonRemoveIcon />}
                  onClick={handleRemoveFriend}
                  disabled={isSendingRequest}
                >
                  {isSendingRequest ? (
                    <CircularProgress size={24} />
                  ) : (
                    "Arkadaşlıktan Çıkar"
                  )}
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Arkadaş sayısı */}
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <PersonIcon />
          <Typography variant="h6" fontWeight="medium">
            {user.friends?.length || 0} Arkadaş
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProfileDetail;
