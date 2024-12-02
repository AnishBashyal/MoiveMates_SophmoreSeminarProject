import React, { useState, useEffect } from "react";
import {
  Container,
  Form,
  Button,
  ListGroup,
  Card,
  Row,
  Col,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useAuth } from "../contexts/AuthContext";
import { searchUserByEmail, getHistory } from "../services/firebaseService";
import { toast } from "react-toastify";
import MovieGrid from "../components/MovieGrid";

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
  Thriller: 53,
  War: 10752,
  Western: 37,
};

const FriendsPage = () => {
  const { currentUser } = useAuth();
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  // Group states
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState(new Set());
  const [groupName, setGroupName] = useState("");
  const [groupMovies, setGroupMovies] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    console.log("Searching for:", searchEmail); // Debug log

    if (!searchEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      console.log("Calling searchUserByEmail..."); // Debug log
      const user = await searchUserByEmail(searchEmail);
      console.log("Search result:", user); // Debug log

      if (!user) {
        toast.error("User not found");
        setSearchResult(null);
        return;
      }

      if (user.uid === currentUser.uid) {
        toast.error("You can't add yourself as a friend");
        setSearchResult(null);
        return;
      }

      // Check if already in friends list
      if (friends.some((friend) => friend.uid === user.uid)) {
        toast.error("Already in your friends list");
        setSearchResult(null);
        return;
      }

      setSearchResult(user);
      toast.success("User found!");
    } catch (error) {
      console.error("Search error:", error); // Debug log
      toast.error("Error searching for user");
      setSearchResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = () => {
    if (!searchResult) return;

    // Add friend to local state
    setFriends((prev) => [...prev, searchResult]);
    setSearchResult(null);
    setSearchEmail("");
    toast.success("Friend added successfully!");
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.size === 0) {
      toast.error("Please enter a group name and select friends");
      return;
    }

    setLoadingRecommendations(true);
    try {
      // Get history for current user and selected friends
      const userIds = [...selectedFriends, currentUser.uid];
      const historiesPromises = userIds.map((uid) => getHistory(uid));
      const histories = await Promise.all(historiesPromises);

      // Combine and count genres
      const genreCounts = {};
      histories.flat().forEach((movie) => {
        movie.genres?.forEach((genre) => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      });

      // Get top 3 genres
      const topGenres = Object.entries(genreCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([genre]) => GENRE_IDS[genre])
        .filter(Boolean);

      // Fetch movies for each genre
      const moviePromises = topGenres.map((genreId) =>
        fetch(
          `https://api.themoviedb.org/3/discover/movie?api_key=&with_genres=${genreId}&sort_by=popularity.desc&page=1`
        ).then((res) => res.json())
      );

      const results = await Promise.all(moviePromises);

      // Combine and format movies
      const allMovies = results.flatMap((result) =>
        result.results.map((movie) => ({
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
        }))
      );

      // Shuffle and limit to 12 movies
      const shuffledMovies = allMovies
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);

      setGroupMovies(shuffledMovies);
      setShowCreateGroup(false);
      toast.success("Group recommendations generated!");
    } catch (error) {
      console.error("Error generating recommendations:", error);
      toast.error("Failed to generate recommendations");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Friends & Group Recommendations</h2>

      {/* Search Form */}
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Form.Group className="mb-3">
              <Form.Label>Search Friend by Email</Form.Label>
              <div className="d-flex gap-2">
                <Form.Control
                  type="email"
                  placeholder="Enter email address"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
                <Button type="submit" disabled={loading} className="px-4">
                  {loading ? (
                    <Spinner animation="border" size="sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  ) : (
                    "Search"
                  )}
                </Button>
              </div>
            </Form.Group>
          </Form>

          {searchResult && (
            <div className="mt-3">
              <h5>Search Result:</h5>
              <ListGroup>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>{searchResult.email}</div>
                  <Button variant="primary" size="sm" onClick={handleAddFriend}>
                    Add Friend
                  </Button>
                </ListGroup.Item>
              </ListGroup>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Friends List and Group Creation */}
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">My Friends</h5>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowCreateGroup(true)}
                  disabled={friends.length === 0}
                >
                  Create Group
                </Button>
              </div>
              {friends.length === 0 ? (
                <p className="text-muted">No friends added yet</p>
              ) : (
                <ListGroup>
                  {friends.map((friend) => (
                    <ListGroup.Item
                      key={friend.uid}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>{friend.email}</div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Group Recommendations */}
      {groupMovies.length > 0 && (
        <div className="mt-4">
          <h3 className="mb-4">Group Recommendations</h3>
          <MovieGrid movies={groupMovies} />
        </div>
      )}

      {/* Create Group Modal */}
      <Modal show={showCreateGroup} onHide={() => setShowCreateGroup(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Group Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Select Friends</Form.Label>
              <ListGroup>
                {friends.map((friend) => (
                  <ListGroup.Item
                    key={friend.uid}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>{friend.email}</div>
                    <Form.Check
                      type="checkbox"
                      onChange={(e) => {
                        const newSelected = new Set(selectedFriends);
                        if (e.target.checked) {
                          newSelected.add(friend.uid);
                        } else {
                          newSelected.delete(friend.uid);
                        }
                        setSelectedFriends(newSelected);
                      }}
                    />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateGroup(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCreateGroup}
            disabled={loadingRecommendations}
          >
            {loadingRecommendations
              ? "Generating..."
              : "Create & Get Recommendations"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FriendsPage;
