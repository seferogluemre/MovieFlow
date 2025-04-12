import { FC, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  Divider,
  Container,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";

const Settings: FC = () => {
  const { user, refreshUser } = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;

      setLoading(true);
      try {
        const response = await api.get(`/users/${user.id}`);
        if (response && response.data) {
          setIsPrivate(response.data.isPrivate || false);
        }
      } catch (err) {
        console.error("Error fetching user settings:", err);
        setError("Kullanıcı ayarları yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;

    setSaving(true);
    setSuccess(false);
    setError(null);

    try {
      await api.patch(`/users/${user.id}`, {
        isPrivate,
      });

      setSuccess(true);
      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error("Error saving settings:", err);
      setError("Ayarlar kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Hesap Ayarları
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Ayarlarınız başarıyla kaydedildi.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gizlilik Ayarları
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                  />
                }
                label="Gizli Profil"
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Gizli profil etkinleştirildiğinde, yalnızca takip ettiğiniz veya
                arkadaş olduğunuz kullanıcılar profil detaylarınızı,
                yorumlarınızı ve kütüphanenizi görebilir.
              </Typography>
            </CardContent>
          </Card>

          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : "Ayarları Kaydet"}
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
};

export default Settings;
