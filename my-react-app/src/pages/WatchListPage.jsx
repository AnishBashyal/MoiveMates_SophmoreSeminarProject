import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Container,
  Row,
  Col,
  Spinner,
  Badge,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import {
  getWatchList,
  addToHistory,
  removeFromWatchList,
  getHistory,
} from "../services/firebaseService";
import { toast } from "react-toastify";
import RatingDialog from "../components/RatingDialog";

const WatchListPage = () => {
  const { currentUser } = useAuth();
  const [watchList, setWatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [watchedMovies, setWatchedMovies] = useState(new Set());

  useEffect(() => {
    loadWatchList();
  }, [currentUser]);

  const loadWatchList = async () => {
    try {
      const list = await getWatchList(currentUser.uid);

      // Check which movies are already in history
      const historyList = await getHistory(currentUser.uid);
      const watchedIds = new Set(historyList.map((movie) => movie.movieId));
      setWatchedMovies(watchedIds);

      setWatchList(list);
    } catch (error) {
      toast.error("Failed to load watch list");
    } finally {
      setLoading(false);
    }
  };

  const handleWatchNow = async (movie) => {
    try {
      await addToHistory(currentUser.uid, movie);
      setWatchedMovies((prev) => new Set([...prev, movie.movieId]));
      setSelectedMovie(movie);
      setShowRating(true);
      toast.success("Marked as watched!");
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleRemove = async (movieId) => {
    try {
      await removeFromWatchList(currentUser.uid, movieId);
      setWatchList((prevList) =>
        prevList.filter((movie) => movie.movieId !== movieId)
      );
      toast.success("Removed from watch list");
    } catch (error) {
      toast.error("Failed to remove from watch list");
    }
  };

  const handleRatingSubmit = async (rating) => {
    try {
      // Add rating submission logic here
      toast.success("Rating submitted successfully!");
      setShowRating(false);
    } catch (error) {
      toast.error("Failed to submit rating");
    }
  };

  // Sort watchlist to show unwatched movies first
  const sortedWatchList = [...watchList].sort((a, b) => {
    const isAWatched = watchedMovies.has(a.movieId);
    const isBWatched = watchedMovies.has(b.movieId);

    if (isAWatched && !isBWatched) return 1;
    if (!isAWatched && isBWatched) return -1;
    return 0;
  });

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
      <h2 className="mb-4">My Watch List</h2>
      {watchList.length === 0 ? (
        <p>Your watch list is empty</p>
      ) : (
        <Row>
          {sortedWatchList.map((movie) => (
            <Col
              key={movie.movieId}
              xs={12}
              sm={6}
              md={4}
              lg={3}
              className="mb-4"
            >
              <Card className="h-100">
                <Card.Img
                  variant="top"
                  src={`https://image.tmdb.org/t/p/w500${movie.poster}`}
                  alt={movie.title}
                  style={{ height: "400px", objectFit: "cover" }}
                />
                <Card.Body className="d-flex flex-column">
                  <Card.Title>{movie.title}</Card.Title>
                  <Card.Text className="text-muted mb-2">
                    {movie.year}
                  </Card.Text>
                  <div className="mb-2">
                    {movie.genres?.map((genre, index) => (
                      <Badge key={index} bg="secondary" className="me-1 mb-1">
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <Card.Text className="small mb-3">
                    {movie.synopsis?.length > 100
                      ? `${movie.synopsis.substring(0, 100)}...`
                      : movie.synopsis}
                  </Card.Text>
                  <div className="mt-auto">
                    {watchedMovies.has(movie.movieId) ? (
                      <Button variant="success" disabled className="w-100">
                        Watched! ✓
                      </Button>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          onClick={() => handleWatchNow(movie)}
                          className="w-50"
                        >
                          Watch Now
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleRemove(movie.movieId)}
                          className="w-50"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <RatingDialog
        show={showRating}
        onHide={() => setShowRating(false)}
        onSubmit={handleRatingSubmit}
        movieTitle={selectedMovie?.title}
      />
    </Container>
  );
};

export default WatchListPage;
