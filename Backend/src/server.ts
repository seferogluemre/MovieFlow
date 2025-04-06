import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import user_routes from "./routes/user.routes";
import movie_routes from "./routes/movie.routes";
import auth_routes from "./routes/auth.routes";
import path from "path";

const globalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 70,
  message: {
    error: "Çok fazla istek yaptınız, lütfen daha sonra tekrar deneyin.",
  },
  headers: true,
  standardHeaders: true,
  legacyHeaders: false,
});

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(globalLimiter);
app.use(cors(corsOptions));

app.use(
  "/uploads",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../", "public", "uploads"))
);

app.use(
  "/posters",
  (req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "../", "public", "posters"))
);

app.use("/api/users", user_routes);
app.use("/api/movies", movie_routes);
app.use("/api/auth", auth_routes);

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor...`);
});
