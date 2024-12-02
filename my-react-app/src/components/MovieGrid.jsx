import React, { useState, useEffect } from "react";
import { Row, Col, Card, Button, Badge } from "react-bootstrap";
import {
  addToWatchList,
  getWatchList,
  getHistory,
} from "../services/firebaseService";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";

const MovieGrid = ({ movies }) => {
  const { currentUser } = useAuth();
  const [watchlistedMovies, setWatchlistedMovies] = useState(new Set());
  const [watchedMovies, setWatchedMovies] = useState(new Set());

  useEffect(() => {
    if (currentUser) {
      loadUserMovieStates();
    }
  }, [currentUser]);

  const loadUserMovieStates = async () => {
    try {
      // Get watchlist
      const watchlist = await getWatchList(currentUser.uid);
      const watchlistIds = new Set(watchlist.map((movie) => movie.movieId));
      setWatchlistedMovies(watchlistIds);

      // Get watched movies
      const history = await getHistory(currentUser.uid);
      const watchedIds = new Set(history.map((movie) => movie.movieId));
      setWatchedMovies(watchedIds);
    } catch (error) {
      console.error("Error loading movie states:", error);
    }
  };

  const handleWatchLater = async (movie) => {
    try {
      const movieData = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster,
        overview: movie.synopsis,
        release_date: movie.year,
        genres: movie.genres || [],
      };

      await addToWatchList(currentUser.uid, movieData);
      setWatchlistedMovies((prev) => new Set([...prev, movie.id]));
      toast.success("Added to watch list!");
    } catch (error) {
      toast.error("Failed to add to watch list");
    }
  };

  return (
    <Row>
      {movies.map((movie) => (
        <Col key={movie.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Img
              variant="top"
              src={movie.poster}
              alt={movie.title}
              style={{ height: "400px", objectFit: "cover" }}
            />
            <Card.Body>
              <Card.Title>{movie.title}</Card.Title>
              <Card.Text className="text-muted">{movie.year}</Card.Text>
              <div className="mb-2">
                {movie.genres?.map((genre, index) => (
                  <Badge key={index} bg="secondary" className="me-1 mb-1">
                    {genre}
                  </Badge>
                ))}
              </div>
              <Card.Text>{movie.synopsis}</Card.Text>
              <div className="mt-auto">
                {watchedMovies.has(movie.id) ? (
                  <Button variant="success" disabled className="w-100">
                    Watched! ✓
                  </Button>
                ) : watchlistedMovies.has(movie.id) ? (
                  <Button variant="info" disabled className="w-100">
                    In Watchlist ✓
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => handleWatchLater(movie)}
                    className="w-100"
                  >
                    Watch Later
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default MovieGrid;
