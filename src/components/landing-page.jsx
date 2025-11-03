import React from "react";
import logo from "../logo.png";

export default function LandingPage() {
  const title = "Grow beyond the classroom, freelance your way";

  const styles = {
    // Fixed background layer
    fixedLayer: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 0,
      pointerEvents: "none",
    },
    fixedOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "radial-gradient(600px 300px at 15% 20%, rgba(124, 58, 237, 0.18), transparent 60%)," +
        "radial-gradient(800px 400px at 85% 60%, rgba(99, 102, 241, 0.12), transparent 60%)",
      zIndex: 0,
    },
    fixedCircle1: {
      position: "fixed",
      width: "480px",
      height: "480px",
      borderRadius: "50%",
      background: "linear-gradient(145deg, rgba(139,92,246,0.08), rgba(17,24,39,0.0))",
      top: "-180px",
      left: "-180px",
      zIndex: 0,
      filter: "blur(2px)",
    },
    fixedCircle2: {
      position: "fixed",
      width: "360px",
      height: "360px",
      borderRadius: "50%",
      background: "linear-gradient(225deg, rgba(109,40,217,0.08), rgba(17,24,39,0.0))",
      bottom: "-140px",
      right: "-140px",
      zIndex: 0,
      filter: "blur(1.5px)",
    },
    // Page background matching hero
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
    },

    // Container to center everything
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "100vh",
      width: "100%",
      background: "transparent",
      color: "#E5E7EB", // gray-200
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      overflow: "hidden",
      position: "relative",
      zIndex: 2,
      padding: "4rem 2rem 6rem",
      boxSizing: "border-box",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },

    // Background overlay accents
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      background:
        "radial-gradient(600px 300px at 15% 20%, rgba(124, 58, 237, 0.18), transparent 60%)," +
        "radial-gradient(800px 400px at 85% 60%, rgba(99, 102, 241, 0.12), transparent 60%)",
      zIndex: 1,
      pointerEvents: "none",
    },

    // Decorative circles
    decorativeCircle1: {
      position: "absolute",
      width: "480px",
      height: "480px",
      borderRadius: "50%",
      background: "linear-gradient(145deg, rgba(139,92,246,0.08), rgba(17,24,39,0.0))",
      top: "-180px",
      left: "-180px",
      zIndex: 1,
      filter: "blur(2px)",
    },

    decorativeCircle2: {
      position: "absolute",
      width: "360px",
      height: "360px",
      borderRadius: "50%",
      background: "linear-gradient(225deg, rgba(109,40,217,0.08), rgba(17,24,39,0.0))",
      bottom: "-140px",
      right: "-140px",
      zIndex: 1,
      filter: "blur(1.5px)",
    },

    // Content wrapper
    contentWrapper: {
      position: "relative",
      zIndex: 2,
      textAlign: "center",
      maxWidth: "1200px",
      padding: "2rem",
    },

    // Title and subtitle
    title: {
      fontSize: "clamp(2.2rem, 7vw, 4.5rem)",
      fontWeight: 800,
      textTransform: "none",
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      margin: "0 0 1rem 0",
      background: "linear-gradient(90deg, #F9FAFB 0%, #D1D5DB 20%, #8B5CF6 50%, #D1D5DB 80%, #F9FAFB 100%)",
      backgroundSize: "300% 100%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "textShimmer 8s ease-in-out infinite",
    },

    subtitle: {
      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
      fontWeight: 400,
      color: "#A3A3A3",
      marginTop: "0.5rem",
      letterSpacing: "0.01em",
      lineHeight: 1.7,
    },

    // Buttons
    buttonRow: {
      display: "flex",
      gap: "1rem",
      marginTop: "2rem",
      justifyContent: "center",
    },
    buttonPrimary: {
      padding: "0.875rem 1.5rem",
      fontSize: "1rem",
      fontWeight: 600,
      color: "#111827",
      background: "#F9FAFB",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    buttonSecondary: {
      padding: "0.875rem 1.5rem",
      fontSize: "1rem",
      fontWeight: 600,
      color: "#E5E7EB",
      background: "transparent",
      border: "1px solid rgba(229,231,235,0.25)",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },

    // Gray accent bars
    accentBar: {
      position: "absolute",
      width: "120px",
      height: "2px",
      background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
      borderRadius: "1px",
      animation: "slideAcross 10s linear infinite",
      zIndex: 1,
    },

    // Sections
    section: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "4rem 1.5rem",
      color: "#D1D5DB",
    },
    heading: {
      fontSize: "clamp(1.6rem, 3vw, 2.25rem)",
      fontWeight: 700,
      color: "#F5F6F7",
      marginBottom: "0.75rem",
      letterSpacing: "-0.01em",
      textAlign: "center",
    },
    subline: {
      fontSize: "0.95rem",
      color: "#9CA3AF",
      textAlign: "center",
      marginBottom: "2rem",
    },
    cardsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: "1.25rem",
    },
    card: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      overflow: "hidden",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    },
    cardHover: {
      transform: "translateY(-4px)",
      boxShadow: "0 16px 36px rgba(0,0,0,0.45)",
    },
    cardImage: {
      width: "100%",
      height: "220px",
      objectFit: "cover",
      display: "block",
      filter: "grayscale(10%)",
    },
    cardBody: {
      padding: "1rem 1rem 1.25rem",
    },
    cardTitle: {
      color: "#F3F4F6",
      fontWeight: 700,
      fontSize: "1.1rem",
      marginBottom: "0.35rem",
    },
    cardText: {
      color: "#A1A1AA",
      fontSize: "0.95rem",
      lineHeight: 1.6,
    },

    footer: {
      background: "#0a0911",
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "2.5rem 1.5rem",
      color: "#9CA3AF",
    },
    footerInner: {
      maxWidth: "1200px",
      margin: "0 auto",
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
    },
    footerLinks: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
    },
  };

  return (
    <>
      <style>
        {`
          @keyframes textShimmer {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }
          @keyframes slideAcross {
            0% {
              left: -100px;
              opacity: 0;
            }
            50% {
              opacity: 1;
            }
            100% {
              left: calc(100% + 100px);
              opacity: 0;
            }
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html, body, #root {
            min-height: 100%;
            background: linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%);
            color: #E5E7EB;
            overflow-x: hidden;
            background-attachment: fixed;
            background-size: cover;
            background-position: center top;
          }

          img, video {
            max-width: 100%;
            height: auto;
            display: block;
          }

          @media (max-width: 900px) {
            .cardsGrid3 {
              grid-template-columns: 1fr 1fr !important;
            }
          }
          @media (max-width: 640px) {
            .cardsGrid3 {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
      {/* FIXED BACKGROUND ELEMENTS */}
      <div style={styles.fixedLayer}>
        <div style={styles.fixedOverlay}></div>
        <div style={styles.fixedCircle1}></div>
        <div style={styles.fixedCircle2}></div>
      </div>

      {/* HERO */}
      <div style={styles.container}>
        
        <div style={styles.contentWrapper}>
          <h1 style={styles.title}>{title}</h1>
          <p style={styles.subtitle}>Find real clients, ship real work, build a portfolio that wins.</p>
          <div style={styles.buttonRow}>
            <button
              style={styles.buttonPrimary}
              onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
              onMouseLeave={(e) => (e.target.style.transform = "translateY(0)")}
              onClick={() => { window.location.hash = "#/register"; }}
            >
              Sign Up
            </button>
            <button
              style={styles.buttonSecondary}
              onMouseEnter={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.borderColor = "rgba(229,231,235,0.45)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.borderColor = "rgba(229,231,235,0.25)";
              }}
              onClick={() => { window.location.hash = "#/login"; }}
            >
              Login
            </button>
          </div>
        </div>

        <div style={{...styles.accentBar, top: "22%", animationDelay: "0s"}}></div>
        <div style={{...styles.accentBar, top: "58%", animationDelay: "4s"}}></div>
        <div style={{...styles.accentBar, top: "82%", animationDelay: "2s"}}></div>
      </div>

      {/* FEATURE CARDS */}
      <section style={styles.section}>
        <h2 style={styles.heading}>Explore</h2>
        <p style={styles.subline}>What peers are building and where you can stand out</p>
        <div className="cardsGrid3" style={{...styles.cardsGrid}}>
          <article style={styles.card} onMouseEnter={(e)=>{e.currentTarget.style.transform = styles.cardHover.transform; e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;}} onMouseLeave={(e)=>{e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.card.boxShadow;}}>
            <img style={styles.cardImage} alt="Featured projects" src="https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1400&auto=format&fit=crop" />
            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>Featured projects</div>
              <div style={styles.cardText}>Hand-picked builds from students shipping production-ready work.</div>
            </div>
          </article>
          <article style={styles.card} onMouseEnter={(e)=>{e.currentTarget.style.transform = styles.cardHover.transform; e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;}} onMouseLeave={(e)=>{e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.card.boxShadow;}}>
            <img style={styles.cardImage} alt="Top rated students" src="https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=1400&auto=format&fit=crop" />
            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>Top rated students</div>
              <div style={styles.cardText}>Rising talent consistently earning great feedback from clients.</div>
            </div>
          </article>
          <article style={styles.card} onMouseEnter={(e)=>{e.currentTarget.style.transform = styles.cardHover.transform; e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;}} onMouseLeave={(e)=>{e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.card.boxShadow;}}>
            <img style={styles.cardImage} alt="Testimonials" src="https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?q=80&w=1400&auto=format&fit=crop" />
            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>Testimonials</div>
              <div style={styles.cardText}>Hear from teams that hired students for real-world projects.</div>
            </div>
          </article>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section style={{...styles.section, paddingTop: "2rem"}}>
        <h2 style={styles.heading}>Success Stories</h2>
        <p style={styles.subline}>Real Student win</p>
        <div className="cardsGrid3" style={{...styles.cardsGrid}}>
          <article style={styles.card} onMouseEnter={(e)=>{e.currentTarget.style.transform = styles.cardHover.transform; e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;}} onMouseLeave={(e)=>{e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.card.boxShadow;}}>
            <img style={styles.cardImage} alt="Testimonial 1" src="https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1400&auto=format&fit=crop" />
            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>“Landed my first paid client.”</div>
              <div style={styles.cardText}>“Shipped an MVP in two weeks and got a long-term contract.”</div>
            </div>
          </article>
          <article style={styles.card} onMouseEnter={(e)=>{e.currentTarget.style.transform = styles.cardHover.transform; e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;}} onMouseLeave={(e)=>{e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.card.boxShadow;}}>
            <img style={styles.cardImage} alt="Testimonial 2" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1400&auto=format&fit=crop" />
            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>“Portfolio made the difference.”</div>
              <div style={styles.cardText}>“The work I did here directly led to three interviews.”</div>
            </div>
          </article>
          <article style={styles.card} onMouseEnter={(e)=>{e.currentTarget.style.transform = styles.cardHover.transform; e.currentTarget.style.boxShadow = styles.cardHover.boxShadow;}} onMouseLeave={(e)=>{e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = styles.card.boxShadow;}}>
            <img style={styles.cardImage} alt="Testimonial 3" src="https://images.unsplash.com/photo-1554151228-14d9def656e4?q=80&w=1400&auto=format&fit=crop" />
            <div style={styles.cardBody}>
              <div style={styles.cardTitle}>“Built confidence with real users.”</div>
              <div style={styles.cardText}>“Nothing beats the feedback loop from actual clients.”</div>
            </div>
          </article>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={styles.footer}>
        <div style={styles.footerInner}>
          <div style={{color: "#E5E7EB", fontWeight: 600}}>CampusFreelance</div>
          <nav style={styles.footerLinks}>
            <a href="#" style={{color: "#9CA3AF", textDecoration: "none"}}>About</a>
            <a href="#" style={{color: "#9CA3AF", textDecoration: "none"}}>Contact</a>
            <a href="#" style={{color: "#9CA3AF", textDecoration: "none"}}>Admin</a>
            <a href="#" style={{color: "#9CA3AF", textDecoration: "none"}}>Policy</a>
          </nav>
          <div style={{color: "#6B7280", fontSize: "0.9rem"}}>© {new Date().getFullYear()} All rights reserved.</div>
        </div>
      </footer>
    </>
  );
/*
*/
}