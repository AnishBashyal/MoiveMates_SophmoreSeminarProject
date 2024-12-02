import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.jpg";

const Logo = () => {
  const logoStyle = {
    height: "40px", // Adjust this height as needed
    width: "auto",
    marginRight: "15px",
  };

  return (
    <Link to="/">
      <img src={logo} alt="Movie Mates Logo" style={logoStyle} />
    </Link>
  );
};

export default Logo;
