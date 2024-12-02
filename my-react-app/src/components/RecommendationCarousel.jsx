import React from "react";
import { Carousel, Card, Button } from "react-bootstrap";

const movies = [
  {
    id: 1,
    title: "Inception",
    genre: "Sci-Fi",
    rating: "PG-13",
    synopsis: "A mind-bending thriller about dream infiltration.",
    poster: "https://via.placeholder.com/200x300",
  },
  {
    id: 2,
    title: "Memento",
    genre: "Thriller",
    rating: "R",
    synopsis: "A story about memory and revenge.",
    poster: "https://via.placeholder.com/200x300",
  },
  // Add more movie data here
];

const RecommendationCarousel = () => {
  return (
    <Carousel>
      {movies.map((movie) => (
        <Carousel.Item key={movie.id}>
          <Card className="text-center bg-dark text-white">
            <Card.Img
              variant="top"
              src={movie.poster}
              alt={movie.title}
              style={{ width: "200px", height: "300px", margin: "auto" }}
            />
            <Card.Body>
              <Card.Title>{movie.title}</Card.Title>
              <Card.Text>
                Genre: {movie.genre} | Rating: {movie.rating}
              </Card.Text>
              <Card.Text>{movie.synopsis}</Card.Text>
              <div className="d-flex justify-content-around">
                <Button variant="primary">Watch Now</Button>
                <Button variant="secondary">Watch Later</Button>
              </div>
            </Card.Body>
          </Card>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default RecommendationCarousel;
