import React, { useState, useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { getHistory, getWatchList } from "../services/firebaseService";
import MovieGrid from "../components/MovieGrid";
import { toast } from "react-toastify";

// TMDB genre IDs
const GENRE_IDS = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  "TV Movie": 10770,
  Thriller: 53,
  War: 10752,
  Western: 37,
};

const RecommendationPage = () => {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watchedMovies, setWatchedMovies] = useState(new Set());
  const [watchlistedMovies, setWatchlistedMovies] = useState(new Set());

  useEffect(() => {
    if (currentUser) {
      loadUserData();
    }
  }, [currentUser]);

  const loadUserData = async () => {
    try {
      // Get user's history and watchlist
      const [history, watchlist] = await Promise.all([
        getHistory(currentUser.uid),
        getWatchList(currentUser.uid),
      ]);

      // Set watched and watchlisted movies
      setWatchedMovies(new Set(history.map((movie) => movie.movieId)));
      setWatchlistedMovies(new Set(watchlist.map((movie) => movie.movieId)));

      // Extract genres from history for recommendations
      const genreCounts = {};
      history.forEach((movie) => {
        movie.genres?.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });

      // Get top genres and fetch recommendations
      await loadRecommendations(genreCounts);
    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load recommendations");
      setLoading(false);
    }
  };

  const loadRecommendations = async (genreCounts) => {
    try {
      // Get top 3 genres
      const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => GENRE_IDS[genre])
        .filter(Boolean);

      // If no history, fetch popular movies
      if (topGenres.length === 0) {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=0f61e80373984a58eaf5df8af972bef8&language=en-US&page=1`
        );
        const data = await response.json();
        const formattedMovies = formatMovies(data.results);
        setMovies(formattedMovies);
        return;
      }

      // Fetch movies for each genre
      const moviePromises = topGenres.map((genreId) =>
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=0f61e80373984a58eaf5df8af972bef8&with_genres=${genreId}&sort_by=popularity.desc&page=1`
        ).then((res) => res.json())
      );

      const results = await Promise.all(moviePromises);

      // Combine and format all movies
      const allMovies = results.flatMap((result) =>
        formatMovies(result.results)
      );

      // Shuffle and limit to 12 movies
      const shuffledMovies = allMovies
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);

      setMovies(shuffledMovies);
    } catch (error) {
      console.error("Error loading recommendations:", error);
      toast.error("Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  const formatMovies = (movies) => {
    return movies.map((movie) => ({
      id: movie.id,
      title: movie.title,
      poster: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
      synopsis: movie.overview,
      year: movie.release_date?.split("-")[0],
      genres: movie.genre_ids
        ?.map((id) =>
          Object.keys(GENRE_IDS).find((key) => GENRE_IDS[key] === id)
        )
        .filter(Boolean),
    }));
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">Recommended For You</h2>
      <MovieGrid
        movies={movies}
        watchedMovies={watchedMovies}
        watchlistedMovies={watchlistedMovies}
      />
    </Container>
  );
};

export default RecommendationPage;
