import React, { useEffect, useState } from "react";

const MovieDetailPage = () => {
  const [movie, setMovie] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Sabit URL'ye fetch isteği atıyoruz
        const response = await fetch("http://localhost:3000/api/movies/1");

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
    return <div>Loading...</div>; // Veri yüklenene kadar loading mesajı
  }
  console.log(movie.posterImage);
  return (
    <div>
      <h1>{movie.title}</h1>
      <p>{movie.description}</p>
      <p>Release Year: {movie.releaseYear}</p>
      <p>Duration: {movie.duration} mins</p>
      {movie.posterImage && (
        <img src={`${movie.posterImage}`} alt={`${movie.title} Poster`} />
      )}
    </div>
  );
};

export default MovieDetailPage;
