import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaStar } from "react-icons/fa";

const RatingDialog = ({ show, onHide, onSubmit, movieTitle }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  const handleSubmit = () => {
    onSubmit(rating);
    setRating(0);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Rate "{movieTitle}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-center mb-3">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <FaStar
                key={ratingValue}
                size={30}
                className="mx-1"
                style={{ cursor: "pointer" }}
                color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(rating)}
              />
            );
          })}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!rating}>
          Submit Rating
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RatingDialog;
