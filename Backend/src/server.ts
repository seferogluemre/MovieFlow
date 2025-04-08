import express from "express";
import rateLimit from "express-rate-limit";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import user_routes from "./routes/user.routes";
import actor_routes from "./routes/actor.routes";
import movie_routes from "./routes/movie.routes";
import auth_routes from "./routes/auth.routes";
import genre_routes from "./routes/genre.routes";
import review_routes from "./routes/review.routes";
import rating_routes from "./routes/rating.routes";
import path from "path";
import watchList_routes from "./routes/watchlist.routes";
import wishList_routes from "./routes/wishlist.routes";
import libraryRoutes from "./routes/library.routes";
import friendshipRoutes from "./routes/friendship.routes";
import movieGenreRoutes from "./routes/movie-genre.routes";
import movieActorRoutes from "./routes/movie-actor.routes";
import notificationRoutes from "./routes/notification.routes";

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
  origin: "*",
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

app.use("/api/watchlist", watchList_routes);
app.use("/api/wishlist", wishList_routes);
app.use("/api/users", user_routes);
app.use("/api/actors", actor_routes);
app.use("/api/movies", movie_routes);
app.use("/api/auth", auth_routes);
app.use("/api/genres", genre_routes);
app.use("/api/reviews", review_routes);
app.use("/api/ratings", rating_routes);

app.use("/api/library", libraryRoutes);
app.use("/api/friendships", friendshipRoutes);
app.use("/api/movie-genres", movieGenreRoutes);
app.use("/api/movie-actors", movieActorRoutes);
app.use("/api/notifications", notificationRoutes);

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor...`);
});