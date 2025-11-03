import React from "react";

export default function HomePage() {
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    main: {
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "3rem 1.5rem",
      textAlign: "center",
    },
    h1: {
      fontSize: "clamp(1.8rem, 4vw, 2.5rem)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: "0.75rem",
    },
    p: {
      color: "#9CA3AF",
    },
  };
  return (
    <div style={styles.page}>
      <main style={styles.main}>
        <h1 style={styles.h1}>Home</h1>
        <p style={styles.p}>Welcome to Student Freelance Hub.</p>
      </main>
    </div>
  );
}


