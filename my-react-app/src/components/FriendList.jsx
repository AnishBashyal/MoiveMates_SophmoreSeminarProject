import React from "react";
import { ListGroup } from "react-bootstrap";

const FriendList = ({ friends }) => {
  return (
    <ListGroup variant="flush">
      {friends.map((friend, index) => (
        <ListGroup.Item key={index}>{friend}</ListGroup.Item>
      ))}
    </ListGroup>
  );
};

export default FriendList;
