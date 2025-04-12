import { FC, useState, useEffect, ChangeEvent } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Card,
  CardContent,
  Modal,
  IconButton,
  CircularProgress,
  Alert,
  Paper,
  Stack,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import api, { userService } from "../utils/api";
import { User } from "../utils/types";
import { useNavigate } from "react-router-dom";

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  marginBottom: theme.spacing(2),
  border: `3px solid ${theme.palette.primary.main}`,
}));

const ProfileImageContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  marginBottom: theme.spacing(3),
}));

const EditButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  right: -8,
  bottom: 20,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const ModalContent = styled(Paper)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
}));

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const Profile: FC = () => {
  const { user, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Form başlangıç değerlerini doldur
  useEffect(() => {
    if (user) {
      // name özelliği için güvenli kontrol
      if (user && typeof user === "object" && "name" in user) {
        setName((user.name as string) || "");
      } else {
        setName("");
      }

      setUsername(user.username || "");
      setEmail(user.email || "");

      // Profil fotoğrafı URL'si
      if (user.profileImage) {
        // Tam URL kontrolü
        if (user.profileImage.startsWith("http")) {
          setPreviewUrl(user.profileImage);
        } else {
          setPreviewUrl(`http://localhost:3000/uploads/${user.profileImage}`);
        }
      }
    }
  }, [user]);

  const handleModalOpen = () => {
    setOpenModal(true);
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setSelectedFile(null);

    // Kullanıcı profil fotoğrafı bilgisini güncelle
    if (user?.profileImage) {
      const imageUrl = user.profileImage.startsWith("http")
        ? user.profileImage
        : `http://localhost:3000/uploads/${user.profileImage}`;
      setPreviewUrl(imageUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Dosya boyutu 5MB'dan küçük olmalıdır.");
        setTimeout(() => setError(null), 3000);
        return;
      }

      // Sadece desteklenen resim formatları
      const validImageTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        setError(
          "Sadece JPG, PNG, GIF veya WEBP formatlarını yükleyebilirsiniz."
        );
        setTimeout(() => setError(null), 3000);
        return;
      }

      setSelectedFile(file);

      // Önizleme URL'si oluştur
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileImage = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("Profil fotoğrafını kaldırma işlemi başlatılıyor...");

      // API isteği yapmadan önce değerleri kontrol et
      console.log("Kullanıcı ID:", user.id);
      console.log("Gönderilecek veri:", { profileImage: null });

      // Set profile image to null instead of empty string
      const response = await userService.updateProfile(user.id, {
        profileImage: null,
      });
      console.log("API yanıtı:", response);

      // Update local state
      setPreviewUrl(null);

      // Close modal
      setOpenModal(false);

      // Refresh user data to update user object
      await checkAuthStatus();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error removing profile image:", err);

      // Log detaylı hata bilgisi
      if (err.response) {
        console.error("Hata yanıtı:", err.response);
        console.error("Hata durum kodu:", err.response.status);
        console.error("Hata verileri:", err.response.data);
      }

      // More detailed error messages
      if (err.response && err.response.data) {
        // Show the error message returned by the backend
        if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (err.response.data.issues) {
          // Could be a Zod validation error
          setError(
            `Validasyon hatası: ${JSON.stringify(err.response.data.issues)}`
          );
        } else {
          setError(`Hata: ${JSON.stringify(err.response.data)}`);
        }
      } else if (err.message && err.message.includes("Network Error")) {
        setError(
          "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Profil fotoğrafı kaldırılamadı. Lütfen tekrar deneyin.");
      }

      setTimeout(() => setError(null), 5000); // Longer display time
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfileImage = async () => {
    if (!selectedFile || !user) return;

    setLoading(true);
    try {
      console.log("Profil fotoğrafı yükleme işlemi başlatılıyor...");
      console.log(
        "Yüklenecek dosya:",
        selectedFile.name,
        selectedFile.type,
        selectedFile.size
      );

      // Yükleme işlemini gerçekleştir
      const result = await userService.uploadProfileImage(
        user.id,
        selectedFile
      );
      console.log("Yükleme yanıtı:", result);

      // Modal'ı kapat
      setOpenModal(false);
      setSelectedFile(null);

      // Kullanıcı verilerini yenile ve başarı mesajı göster
      const updatedUser = await checkAuthStatus();
      console.log("Güncellenmiş kullanıcı verisi:", updatedUser);

      // previewUrl'i güncelle (doğrudan güncellenen kullanıcı nesnesinden)
      if (user?.profileImage) {
        const imageUrl = user.profileImage.startsWith("http")
          ? user.profileImage
          : `http://localhost:3000/uploads/${user.profileImage}`;
        setPreviewUrl(imageUrl);
        console.log("Önizleme URL'si güncellendi:", imageUrl);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Error uploading profile image:", err);

      // Daha detaylı hata mesajları
      if (err.response && err.response.data) {
        // Backend'in döndürdüğü hata mesajını göster
        if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.error) {
          setError(err.response.data.error);
        } else if (err.response.data.issues) {
          // Zod validasyon hatası olabilir
          setError(
            `Validasyon hatası: ${JSON.stringify(err.response.data.issues)}`
          );
        } else {
          setError(`Hata: ${JSON.stringify(err.response.data)}`);
        }
      } else if (err.message && err.message.includes("Network Error")) {
        setError(
          "Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin."
        );
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Profil fotoğrafı yüklenemedi. Lütfen tekrar deneyin.");
      }
      setTimeout(() => setError(null), 5000); // Daha uzun süre gösterim
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    // Basit doğrulama
    if (!username.trim()) {
      setError("Kullanıcı adı boş olamaz.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!email.trim()) {
      setError("E-posta adresi boş olamaz.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setError("Geçerli bir e-posta adresi giriniz.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    if (username.trim().length < 3) {
      setError("Kullanıcı adı en az 3 karakter olmalıdır.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setLoading(true);
    try {
      // UserService aracılığıyla kullanıcı bilgilerini güncelle
      const userData: any = {
        username,
        email,
        // Mevcut profil fotoğrafı bilgisini de gönder
        // Bu özellikle profil fotoğrafını kaldırmak için gerekli
        profileImage: user.profileImage,
      };

      // Eğer name değeri varsa ve User modelinde destekleniyorsa ekle
      if (name.trim()) {
        userData.name = name;
      }

      await userService.updateProfile(user.id, userData);

      // Kullanıcı verisini yenile
      await checkAuthStatus();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      // Hata mesajını daha anlaşılır hale getir
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Profil güncellenemedi. Lütfen tekrar deneyin.");
      }
      setTimeout(() => setError(null), 3000);
      console.error("Error updating profile:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: "auto",
        py: 4,
        px: { xs: 2, md: 0 },
      }}
    >
      {/* Add a settings button at the top */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          {user?.isPrivate && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <VisibilityOffIcon
                color="action"
                fontSize="small"
                sx={{ mr: 0.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                Gizli Profil
              </Typography>
            </Box>
          )}
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={() => navigate("/settings")}
          >
            Gizlilik Ayarları
          </Button>
        </Stack>
      </Box>

      <Typography variant="h4" fontWeight="bold" mb={2}>
        Profil
      </Typography>
      <Typography variant="body1" color="text.secondary" mb={4}>
        Hesap ayarlarınızı ve profil bilgilerinizi yönetin.
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          İşlem başarıyla tamamlandı.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight="bold" mb={3}>
            Profil Bilgileri
          </Typography>

          <ProfileImageContainer>
            <ProfileAvatar src={previewUrl || ""} alt={user?.username}>
              {!previewUrl && user?.username
                ? user.username.substring(0, 2).toUpperCase()
                : ""}
            </ProfileAvatar>
            <Typography variant="body1" fontWeight="bold">
              {user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              @{user?.username}
            </Typography>
            <Button
              variant="outlined"
              onClick={handleModalOpen}
              startIcon={<EditIcon />}
            >
              Fotoğraf Değiştir
            </Button>
          </ProfileImageContainer>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="İsim"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="E-posta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              variant="outlined"
            />

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpdateProfile}
              disabled={loading}
              sx={{ mt: 2, alignSelf: "flex-end" }}
            >
              {loading ? <CircularProgress size={24} /> : "Profili Güncelle"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Profil Fotoğrafı Düzenleme Modal */}
      <Modal
        open={openModal}
        onClose={handleModalClose}
        aria-labelledby="profile-photo-modal"
      >
        <ModalContent>
          <Typography variant="h6" component="h2" fontWeight="bold" mb={3}>
            Profil Fotoğrafı
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <ProfileAvatar
              src={previewUrl || ""}
              alt={user?.username}
              sx={{ width: 150, height: 150 }}
            >
              {!previewUrl && user?.username
                ? user.username.substring(0, 2).toUpperCase()
                : ""}
            </ProfileAvatar>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Button
              component="label"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              Yeni Fotoğraf Yükle
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>

            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleRemoveProfileImage}
              disabled={loading}
            >
              Fotoğrafı Kaldır
            </Button>

            {selectedFile && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleUploadProfileImage}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Kaydet"}
              </Button>
            )}

            <Button
              variant="text"
              onClick={handleModalClose}
              disabled={loading}
            >
              Kapat
            </Button>
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;
