import React from "react";
import { Card, Button } from "react-bootstrap";

const recommendations = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi, Thriller",
    synopsis:
      "A mind-bending thriller that keeps you on the edge of your seat.",
    poster: "https://via.placeholder.com/100x150",
  },
  {
    id: 2,
    title: "The Matrix",
    genre: "Action, Sci-Fi",
    synopsis: "A virtual reality adventure that redefines reality itself.",
    poster: "https://via.placeholder.com/100x150",
  },
];

const RecommendationList = () => {
  return (
    <div className="recommendation-list mt-4">
      {recommendations.map((movie) => (
        <Card key={movie.id} className="mb-3 bg-dark text-white">
          <Card.Body className="d-flex">
            <img src={movie.poster} alt={movie.title} />
            <div className="ms-3">
              <Card.Title>{movie.title}</Card.Title>
              <Card.Text>Genre: {movie.genre}</Card.Text>
              <Card.Text>{movie.synopsis}</Card.Text>
              <Button variant="success">Watch Together</Button>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default RecommendationList;
