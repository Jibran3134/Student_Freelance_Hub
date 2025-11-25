import React from "react";
import logo from "../logo.png";
import "./styles/navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#/" className="navbar-brand">
          <img src={logo} alt="Student Freelance Hub logo" className="navbar-logo" />
          Student Freelance Hub
        </a>
        <div className="navbar-links">
          <a href="#/home" className="navbar-link">Home</a>
          <a href="#/browse" className="navbar-link">Browse</a>
          <a href="#/profile" className="navbar-link">Profile</a>
          <a href="#/users" className="navbar-link">Users</a>
          <a href="#/post" className="navbar-link">Post</a>
          <a href="#/wallet" className="navbar-link">Wallet</a>
          <a href="#/transactions" className="navbar-link">Transactions</a>
          <a href="#/disputes" className="navbar-link">Disputes</a>
          <a href="#/contact" className="navbar-link">Contact Us</a>
          <a href="#/manage" className="navbar-link">Manage</a>
        </div>
      </div>
    </nav>
  );
}


