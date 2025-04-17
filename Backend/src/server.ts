import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middlewares/error.middleware";
import actor_routes from "./routes/actor.routes";
import auth_routes from "./routes/auth.routes";
import friendshipRoutes from "./routes/friendship.routes";
import genre_routes from "./routes/genre.routes";
import libraryRoutes from "./routes/library.routes";
import movieActorRoutes from "./routes/movie-actor.routes";
import movieGenreRoutes from "./routes/movie-genre.routes";
import movie_routes from "./routes/movie.routes";
import notificationRoutes from "./routes/notification.routes";
import rating_routes from "./routes/rating.routes";
import review_routes from "./routes/review.routes";
import user_routes from "./routes/user.routes";
import watchList_routes from "./routes/watchlist.routes";
import wishList_routes from "./routes/wishlist.routes";

const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  credentials: true,
  maxAge: 86400,
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

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Sunucu ${port} portunda çalışıyor...`);
});
