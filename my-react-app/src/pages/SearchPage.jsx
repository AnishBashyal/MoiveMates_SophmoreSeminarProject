import React, { useState } from "react";
import { Container } from "react-bootstrap";
import SearchBar from "../components/SearchBar";
import MovieGrid from "../components/MovieGrid";

const SearchPage = () => {
  const [movies, setMovies] = useState([]);

  const handleSearch = async (searchParams) => {
    const { query, genre, year, rating } = searchParams;
    const url = `http://127.0.0.1:5000/search_movies?query=${query}&genre=${genre}&year=${year}&rating=${rating}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error fetching data");

      const data = await response.json();
      setMovies(data);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  return (
    <Container className="my-5">
      <h2 className="text-center mb-4">Find your movie</h2>
      <SearchBar onSearch={handleSearch} />
      <MovieGrid movies={movies} />
    </Container>
  );
};

export default SearchPage;
