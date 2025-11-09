import React from "react";

export default function PostPage() {
  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    wrapper: {
      position: "relative",
      zIndex: 2,
      maxWidth: "800px",
      margin: "0 auto",
      padding: "4rem 1.5rem",
      textAlign: "center",
    },
    heading: {
      fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: "0.5rem",
      background: "linear-gradient(90deg, #F9FAFB 0%, #D1D5DB 20%, #8B5CF6 50%, #D1D5DB 80%, #F9FAFB 100%)",
      backgroundSize: "300% 100%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "textShimmer 10s ease-in-out infinite",
    },
    subline: {
      color: "#9CA3AF",
      marginBottom: "3rem",
      lineHeight: 1.6,
      fontSize: "1.1rem",
    },
    buttonContainer: {
      display: "flex",
      gap: "1.5rem",
      justifyContent: "center",
      flexWrap: "wrap",
      marginTop: "2rem",
    },
    button: {
      flex: "1",
      minWidth: "280px",
      padding: "2rem 2.5rem",
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#E5E7EB",
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      cursor: "pointer",
      transition: "all 0.3s ease",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      textDecoration: "none",
      display: "block",
    },
    buttonTitle: {
      fontSize: "1.3rem",
      fontWeight: 700,
      marginBottom: "0.5rem",
      color: "#F9FAFB",
    },
    buttonDescription: {
      fontSize: "0.95rem",
      color: "#9CA3AF",
      lineHeight: 1.5,
    },
  };

  return (
    <>
      <style>
        {`
          @keyframes textShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div style={styles.page}>
        <main style={styles.wrapper}>
          <h1 style={styles.heading}>What would you like to post?</h1>
          <p style={styles.subline}>Choose whether you want to offer a freelance service or post a project that needs freelancers.</p>
          
          <div style={styles.buttonContainer}>
            <a 
              href="#/post-service" 
              style={styles.button}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.borderColor = "#8B5CF6";
                e.target.style.boxShadow = "0 12px 32px rgba(139,92,246,0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.borderColor = "rgba(255,255,255,0.06)";
                e.target.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
              }}
            >
              <div style={styles.buttonTitle}>Post Freelance Service</div>
              <div style={styles.buttonDescription}>Offer your skills and services to clients</div>
            </a>
            
            <a 
              href="#/post-project" 
              style={styles.button}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-4px)";
                e.target.style.borderColor = "#8B5CF6";
                e.target.style.boxShadow = "0 12px 32px rgba(139,92,246,0.3)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.borderColor = "rgba(255,255,255,0.06)";
                e.target.style.boxShadow = "0 8px 24px rgba(0,0,0,0.35)";
              }}
            >
              <div style={styles.buttonTitle}>Post Project</div>
              <div style={styles.buttonDescription}>Post a project and find freelancers to work on it</div>
            </a>
          </div>
        </main>
      </div>
    </>
  );
}


