import React from "react";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import Logo from "./Logo";

const NavigationBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>
          <Logo /> Movie Mates
        </Navbar.Brand>
        <Nav className="me-auto">
          <Nav.Link href="/top-picks">Top Picks</Nav.Link>
          <Nav.Link href="/watchlist">Watch List</Nav.Link>
          <Nav.Link href="/friends">Friends</Nav.Link>
          <Nav.Link href="/search">Search</Nav.Link>
        </Nav>
        <div className="d-flex">
          {currentUser ? (
            <>
              <span className="text-light me-3 d-flex align-items-center">
                {currentUser.email}
              </span>
              <Button variant="outline-light" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline-light"
                className="me-2"
                onClick={() => navigate("/login")}
              >
                Sign in
              </Button>
              <Button variant="light" onClick={() => navigate("/signup")}>
                Register
              </Button>
            </>
          )}
        </div>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
