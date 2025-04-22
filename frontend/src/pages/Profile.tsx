import {
  Edit as EditIcon,
  Settings as SettingsIcon,
  VerifiedUser as VerifiedUserIcon,
  VisibilityOff as VisibilityOffIcon,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ChangeEvent, FC, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mailService, userService } from "../utils/api";

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

  // E-posta doğrulama için yeni stateler
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    if (user) {
      if (user && typeof user === "object" && "name" in user) {
        setName((user.name as string) || "");
      } else {
        setName("");
      }

      setUsername(user.username || "");
      setEmail(user.email || "");

      if (user.profileImage) {
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

      // Profil fotoğrafını null olarak ayarla
      const userId = user.id;
      await userService.updateProfile(userId, {
        profileImage: null,
      });

      // Lokal state'i güncelle
      setPreviewUrl(null);

      // Modal'ı kapat
      setOpenModal(false);

      // Kullanıcı verilerini yenile
      await checkAuthStatus();

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profil fotoğrafı kaldırma hatası:", err);

      // Hata mesajını belirle
      let errorMessage =
        "Profil fotoğrafı kaldırılamadı. Lütfen tekrar deneyin.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
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

  // E-posta doğrulama kodu gönder
  const handleSendVerificationCode = async () => {
    if (!user?.email) return;

    setVerificationLoading(true);
    setVerificationError(null);

    try {
      await mailService.sendVerificationEmail(user.email);
      setCodeSent(true);
      setVerificationModalOpen(true);
      setVerificationSuccess(false);
    } catch (err: any) {
      console.error("Doğrulama kodu gönderme hatası:", err);
      let errorMessage = "Doğrulama kodu gönderilemedi. Lütfen tekrar deneyin.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setVerificationError(errorMessage);
    } finally {
      setVerificationLoading(false);
    }
  };

  // E-posta doğrulama modalını kapat
  const handleVerificationModalClose = () => {
    setVerificationModalOpen(false);
    setVerificationCode("");
    setVerificationError(null);
  };

  // Doğrulama kodunu kontrol et
  const handleVerifyEmail = async () => {
    if (!user?.email || !verificationCode) return;

    setVerificationLoading(true);
    setVerificationError(null);

    try {
      const result = await mailService.verifyEmail(
        user.email,
        verificationCode
      );
      console.log("Email verification result:", result);
      setVerificationSuccess(true);

      // Kullanıcı bilgilerini tam olarak güncelle
      await checkAuthStatus();

      // 2 saniye sonra modalı kapat
      setTimeout(() => {
        handleVerificationModalClose();
      }, 2000);
    } catch (err: any) {
      console.error("E-posta doğrulama hatası:", err);
      let errorMessage = "E-posta doğrulanamadı. Lütfen tekrar deneyin.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setVerificationError(errorMessage);
    } finally {
      setVerificationLoading(false);
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

          {/* E-posta doğrulama durumu ve butonu */}
          <Box
            sx={{
              mb: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                backgroundColor: user?.isVerified
                  ? "success.light"
                  : "warning.light",
                px: 2,
                py: 1,
                borderRadius: 1,
                mb: 2,
              }}
            >
              <VerifiedUserIcon
                color={user?.isVerified ? "success" : "disabled"}
                sx={{ mr: 1 }}
              />
              <Typography variant="body2">
                {user?.isVerified
                  ? "E-posta adresiniz doğrulanmış."
                  : "E-posta adresiniz henüz doğrulanmamış."}
              </Typography>
            </Box>

            {!user?.isVerified && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSendVerificationCode}
                disabled={verificationLoading}
                startIcon={
                  verificationLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <VerifiedUserIcon />
                  )
                }
              >
                {verificationLoading ? "Gönderiliyor..." : "E-posta Doğrula"}
              </Button>
            )}

            {verificationError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {verificationError}
              </Alert>
            )}
          </Box>

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

      {/* E-posta doğrulama modalı */}
      <Modal
        open={verificationModalOpen}
        onClose={handleVerificationModalClose}
      >
        <ModalContent>
          <Typography variant="h6" mb={2}>
            E-posta Doğrulama
          </Typography>

          {verificationSuccess ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              E-posta adresiniz başarıyla doğrulandı!
            </Alert>
          ) : (
            <>
              <Typography variant="body2" mb={3}>
                {user?.email} adresine bir doğrulama kodu gönderdik. Lütfen
                e-postanızı kontrol edip, aşağıya 6 haneli doğrulama kodunu
                girin.
              </Typography>

              <TextField
                label="Doğrulama Kodu"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                fullWidth
                margin="normal"
                placeholder="123456"
                disabled={verificationLoading}
                inputProps={{ maxLength: 6 }}
              />

              {verificationError && (
                <Alert severity="error" sx={{ my: 2 }}>
                  {verificationError}
                </Alert>
              )}

              <Box
                sx={{ mt: 3, display: "flex", justifyContent: "space-between" }}
              >
                <Button
                  variant="outlined"
                  onClick={handleVerificationModalClose}
                  disabled={verificationLoading}
                >
                  İptal
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleVerifyEmail}
                  disabled={
                    verificationCode.length !== 6 || verificationLoading
                  }
                  sx={{ ml: 2 }}
                  startIcon={
                    verificationLoading ? <CircularProgress size={20} /> : null
                  }
                >
                  {verificationLoading ? "Doğrulanıyor..." : "Doğrula"}
                </Button>
              </Box>
            </>
          )}
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Profile;
