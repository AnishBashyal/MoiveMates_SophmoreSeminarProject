// src/components/MovieCarousel.jsx

import React, { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";

const MovieCarousel = () => {
  const [movies, setMovies] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/top_movies");

        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }

        const data = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    };

    fetchMovies();
  }, []);

  return (
    <Carousel>
      {movies.map((movie) => (
        <Carousel.Item key={movie.id}>
          <img
            className="d-block w-100"
            src={movie.poster}
            alt={movie.title}
            style={imageStyle}
          />
          <Carousel.Caption>
            <h3>{movie.title}</h3>
            <p>{movie.synopsis}</p>
          </Carousel.Caption>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

const imageStyle = {
  height: "600px",
  objectFit: "cover",
};

export default MovieCarousel;
