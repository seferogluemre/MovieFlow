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
  Paper,
  Snackbar,
} from "@mui/material";
import { VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
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
        console.log(`Fetching user settings for user ID: ${user.id}`);
        const response = await api.get(`/users/${user.id}`);

        console.log(`User settings response:`, response.data);

        if (response && response.data) {
          // Set the initial isPrivate value from the user data
          setIsPrivate(!!response.data.isPrivate);
          console.log(
            `Initial isPrivate value set to: ${!!response.data.isPrivate}`
          );
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
      console.log(`Saving privacy settings for user ID: ${user.id}`);
      console.log(`Setting isPrivate to: ${isPrivate}`);

      // Make PATCH request to update the user's privacy setting
      const response = await api.patch(`/users/${user.id}`, {
        isPrivate: isPrivate,
      });

      console.log(`Privacy settings update response:`, response.data);

      setSuccess(true);

      // Refresh user data in context to update the UI
      if (refreshUser) {
        await refreshUser();
        console.log("User data refreshed after privacy setting update");
      }
    } catch (err: any) {
      console.error("Error saving privacy settings:", err);

      // Provide more detailed error messages based on the response
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Gizlilik ayarları kaydedilirken bir hata oluştu.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePrivacy = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsPrivate(event.target.checked);
    console.log(`Privacy toggle changed to: ${event.target.checked}`);
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
      <Paper
        sx={{
          p: 2,
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" component="h1">
          Hesap Ayarları
        </Typography>

        {isPrivate && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <VisibilityOffIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              Gizli Profil Aktif
            </Typography>
          </Box>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Gizlilik ayarlarınız başarıyla kaydedildi.
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Gizlilik Ayarları
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPrivate}
                      onChange={handleTogglePrivacy}
                    />
                  }
                  label={
                    <Typography variant="body1" fontWeight="medium">
                      Gizli Profil
                    </Typography>
                  }
                />

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, ml: 2 }}
                >
                  Gizli profil etkinleştirildiğinde, yalnızca takip ettiğiniz
                  veya arkadaş olduğunuz kullanıcılar profil detaylarınızı,
                  yorumlarınızı ve kütüphanenizi görebilir.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleSaveSettings}
                  disabled={saving}
                >
                  {saving ? (
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                  ) : null}
                  Ayarları Kaydet
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Container>
  );
};

export default Settings;
