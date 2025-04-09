import { FC, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Movie as MovieIcon } from "@mui/icons-material";
import { authService } from "../utils/api";

const Login: FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      // For demo purposes, let's just check for valid-looking email and non-empty password
      if (!email.includes("@") || password.length < 6) {
        throw new Error("Invalid email or password");
      }

      // In a real app, we would call the login API
      // const { accessToken, refreshToken, session } = await authService.login(email, password);

      // For demo purposes, we'll just simulate a successful login
      // Store tokens in localStorage
      localStorage.setItem("accessToken", "demo-access-token");
      localStorage.setItem("refreshToken", "demo-refresh-token");
      localStorage.setItem("userId", "1");

      // Navigate to dashboard
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
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
              FilmPortal
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Enter your credentials to access your account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
            />
            <TextField
              label="Password"
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
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
