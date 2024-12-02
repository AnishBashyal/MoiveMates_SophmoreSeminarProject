import React from "react";
import { Button } from "react-bootstrap";

const RecommendationButton = ({ onGenerateRecommendations }) => {
  return (
    <Button variant="primary" onClick={onGenerateRecommendations}>
      Generate Shared Recommendations
    </Button>
  );
};

export default RecommendationButton;
