import React from "react";
import { Form, Button } from "react-bootstrap";

const FriendSearch = ({ onAddFriend }) => {
  const [username, setUsername] = React.useState("");

  const handleAddFriend = () => {
    if (username.trim()) {
      onAddFriend(username);
      setUsername("");
    }
  };

  return (
    <div className="friend-search">
      <Form.Control
        type="text"
        placeholder="Search friends by username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="mb-2"
      />
      <Button variant="primary" onClick={handleAddFriend}>
        Add Friend
      </Button>
    </div>
  );
};

export default FriendSearch;
