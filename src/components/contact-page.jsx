import React, { useState } from "react";
import logo from "../logo.png";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ submitting: false, success: null, error: null });

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
    },
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
    navBrand: {
      color: "#F9FAFB",
      fontWeight: 700,
      fontSize: "1.25rem",
      textDecoration: "none",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    logo: {
      width: "24px",
      height: "24px",
      display: "inline-block",
      objectFit: "contain",
    },
    navLinks: {
      display: "flex",
      gap: "1.5rem",
      alignItems: "center",
    },
    navLink: {
      color: "#9CA3AF",
      textDecoration: "none",
      fontSize: "0.95rem",
      fontWeight: 500,
      transition: "color 0.2s ease",
    },
    wrapper: {
      position: "relative",
      zIndex: 2,
      maxWidth: "600px",
      margin: "0 auto",
      padding: "4rem 1.5rem",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    heading: {
      fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: "0.5rem",
      textAlign: "center",
      background: "linear-gradient(90deg, #F9FAFB 0%, #D1D5DB 20%, #8B5CF6 50%, #D1D5DB 80%, #F9FAFB 100%)",
      backgroundSize: "300% 100%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "textShimmer 10s ease-in-out infinite",
    },
    subline: {
      color: "#9CA3AF",
      marginBottom: "2.5rem",
      lineHeight: 1.6,
      textAlign: "center",
    },
    card: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      padding: "2rem",
    },
    label: {
      display: "block",
      color: "#D1D5DB",
      fontWeight: 600,
      fontSize: "0.95rem",
      marginBottom: "0.35rem",
    },
    input: {
      width: "100%",
      background: "#0f0d19",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#E5E7EB",
      padding: "0.75rem 0.9rem",
      borderRadius: "10px",
      outline: "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      marginBottom: "1.25rem",
      fontSize: "1rem",
    },
    textarea: {
      width: "100%",
      background: "#0f0d19",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#E5E7EB",
      padding: "0.75rem 0.9rem",
      borderRadius: "10px",
      outline: "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      minHeight: "160px",
      resize: "vertical",
      marginBottom: "1.5rem",
      fontSize: "1rem",
      fontFamily: "inherit",
    },
    buttonPrimary: {
      width: "100%",
      padding: "0.85rem 1.35rem",
      fontSize: "1rem",
      fontWeight: 600,
      color: "#111827",
      background: "#F9FAFB",
      border: "1px solid #E5E7EB",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    statusMessage: {
      marginTop: "1rem",
      padding: "0.75rem",
      borderRadius: "8px",
      fontSize: "0.9rem",
    },
  };

  function updateField(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ submitting: true, success: null, error: null });

    try {
      // API INTEGRATION: Replace the below with your real API call
      // Example:
      // const res = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // if (!res.ok) throw new Error('Request failed');
      // const data = await res.json();

      await new Promise((r) => setTimeout(r, 800)); // mock latency - remove when API is connected
      setStatus({ submitting: false, success: "Message sent successfully.", error: null });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ submitting: false, success: null, error: "Something went wrong. Please try again." });
    }
  }

  return (
    <>
      <style>
        {`
          @keyframes textShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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

          a:hover {
            color: #E5E7EB !important;
          }
        `}
      </style>

      <div style={styles.page}>
        {/* MAIN CONTENT */}
        <main style={styles.wrapper}>
          <h1 style={styles.heading}>Contact Us</h1>
          <p style={styles.subline}>We'd love to hear from you. Share your ideas, questions, or feedback.</p>

          <section style={styles.card}>
            <form onSubmit={handleSubmit}>
              <label htmlFor="name" style={styles.label}>Name</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Jane Doe"
                value={formData.name}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="email" style={styles.label}>Email</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="jane@example.com"
                value={formData.email}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="message" style={styles.label}>Message</label>
              <textarea
                id="message"
                name="message"
                placeholder="Write your message..."
                value={formData.message}
                onChange={updateField}
                style={styles.textarea}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <button
                type="submit"
                disabled={status.submitting}
                style={{ ...styles.buttonPrimary, opacity: status.submitting ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!status.submitting) e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; }}
              >
                {status.submitting ? "Sending..." : "Submit"}
              </button>

              {/* API INTEGRATION: success and error messages driven by your API response */}
              {status.success && (
                <div style={{ ...styles.statusMessage, background: "rgba(196, 241, 196, 0.15)", color: "#C4F1C4", border: "1px solid rgba(196, 241, 196, 0.3)" }}>
                  {status.success}
                </div>
              )}
              {status.error && (
                <div style={{ ...styles.statusMessage, background: "rgba(252, 165, 165, 0.15)", color: "#FCA5A5", border: "1px solid rgba(252, 165, 165, 0.3)" }}>
                  {status.error}
                </div>
              )}
            </form>
          </section>
        </main>
      </div>
    </>
  );
}
