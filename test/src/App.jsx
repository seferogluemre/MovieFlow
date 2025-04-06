import React, { useEffect, useState } from "react";
import "./App.css";

const MovieDetailPage = () => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Sabit URL'ye fetch isteği atıyoruz
        const response = await fetch("http://localhost:3000/api/movies/2");

        if (response.ok) {
          const data = await response.json(); // JSON olarak yanıtı çözümleyin
          setMovie(data.data); // Veriyi state'e kaydediyoruz
        } else {
          console.error("Failed to fetch movie data");
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
      }
    };

    fetchMovie();
  }, []); // component mount olduğunda sadece bir kere çalışır

  if (!movie) {
    return <div>Loading...</div>;
  }
  console.log(movie.posterImage);
  return (
    <div>
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>
      <p>{movie.ageRating}</p>
      <p>{movie.releaseYear}</p>
      {movie.posterImage && (
        <img
          src={`${movie.posterImage}`}
          className="profile"
          alt={`${movie.title} Poster`}
        />
      )}
    </div>
  );
};

export default MovieDetailPage;
