import React from "react";
import logo from "../logo.png";

export default function Navbar() {
  const styles = {
    navbar: {
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(14, 10, 23, 0.85)",
      backdropFilter: "blur(10px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "1rem 1.5rem",
    },
    navInner: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    brand: {
      color: "#F9FAFB",
      fontWeight: 700,
      fontSize: "1.1rem",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    logo: {
      width: "22px",
      height: "22px",
      objectFit: "contain",
    },
    links: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
    },
    link: {
      color: "#9CA3AF",
      textDecoration: "none",
      fontSize: "0.95rem",
      fontWeight: 500,
      transition: "color 0.2s ease",
    },
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.navInner}>
        <a href="#/" style={styles.brand}>
          <img src={logo} alt="Student Freelance Hub logo" style={styles.logo} />
          Student Freelance Hub
        </a>
        <div style={styles.links}>
          <a href="#/home" style={styles.link}>Home</a>
          <a href="#/browse" style={styles.link}>Browse</a>
          <a href="#/profile" style={styles.link}>Profile</a>
          <a href="#/users" style={styles.link}>Users</a>
          <a href="#/post" style={styles.link}>Post</a>
          <a href="#/contact" style={styles.link}>Contact Us</a>
          <a href="#/manage" style={styles.link}>Manage</a>
        </div>
      </div>
    </nav>
  );
}


