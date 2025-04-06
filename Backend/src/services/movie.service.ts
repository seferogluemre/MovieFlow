import prisma from "src/config/database";
import { CreateMovieType } from "src/validators/movie.validation";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

export class MovieService {
  static async index() {
    const movies = await prisma.movie.findMany({});
    return movies.map((movie) => ({
      ...movie,
      posterImage: movie.posterImage
        ? `${BASE_URL}/posters/${movie.posterImage}`
        : null,
    }));
  }

  static async create(body: CreateMovieType) {
    const movie = await prisma.movie.create({
      data: {
        title: body.title,
        description: body.description,
        director: body.director,
        duration: Number(body.duration),
        releaseYear: Number(body.releaseYear),
        ageRating: body.ageRating,
        posterImage: String(body.posterImage),
      },
      select: {
        id: true,
        title: true,
        description: true,
        director: true,
        duration: true,
        ageRating: true,
        posterImage: true,
        releaseYear: true,
      },
    });

    return {
      ...movie,
      posterImage: movie.posterImage
        ? `${BASE_URL}/posters/${movie.posterImage}`
        : null,
    };
  }

  static async get(id: number) {
    const movie = await prisma.movie.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        director: true,
        duration: true,
        ageRating: true,
        posterImage: true,
        releaseYear: true,
        genres: true, // Film türlerini dahil et
        actors: true, // Film oyuncularını dahil et
        reviews: true, // Film yorumlarını dahil et
        ratings: true, // Film puanlarını dahil et
        watchlist: true, // Watchlist ilişkisini dahil et
        wishlist: true, // Wishlist ilişkisini dahil et
        library: true, // Library ilişkisini dahil et
      },
    });

    if (movie) {
      return {
        ...movie,
        posterImage: movie.posterImage
          ? `${BASE_URL}/posters/${movie.posterImage}`
          : null,
      };
    }

    return movie;
  }
}
