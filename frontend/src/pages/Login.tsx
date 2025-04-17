import { Movie as MovieIcon } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { FC, FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login: FC = () => {
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      await login(email, password);
      console.log("Login successful, redirecting to home page");

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      setError(
        "Giriş başarısız. Lütfen bilgilerinizi kontrol edip tekrar deneyin."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "background.default",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              mb: 4,
              justifyContent: "center",
            }}
          >
            <MovieIcon sx={{ fontSize: 32, mr: 1, color: "primary.main" }} />
            <Typography variant="h4" component="div" fontWeight="bold">
              Film Portalı
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Giriş Yap
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Hesabınıza erişmek için bilgilerinizi girin
          </Typography>

          {(error || authError) && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error || authError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="E-posta"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            <TextField
              label="Şifre"
              variant="outlined"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              type="password"
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? <CircularProgress size={24} /> : "Giriş Yap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
