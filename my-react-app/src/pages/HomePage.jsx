import React from "react";
import { Container, Button } from "react-bootstrap";
import MovieCarousel from "../components/MovieCarousel";

const HomePage = () => {
  return (
    <div style={outerContainerStyle}>
      <Container className="text-center">
        <h1 className="display-4">Movie Mates</h1>
        <p className="lead">Find movies faster!</p>

        <div className="mt-5">
          <MovieCarousel />
        </div>
      </Container>
    </div>
  );
};

const outerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  backgroundColor: "#f8f9fa",
};

export default HomePage;
