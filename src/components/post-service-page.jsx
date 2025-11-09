import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PostServicePage() {
  const [formData, setFormData] = useState({
    userName: "",
    title: "",
    category: "",
    description: "",
    pricingType: "single", // "single" or "tier"
    singlePrice: "",
    basicPrice: "",
    standardPrice: "",
    premiumPrice: "",
    basicDescription: "",
    standardDescription: "",
    premiumDescription: "",
    completionTime: "",
  });
  const [status, setStatus] = useState({ submitting: false, success: null, error: null });

  const categories = [
    "Web Development",
    "Mobile App Development",
    "Graphic Design",
    "UI/UX Design",
    "Content Writing",
    "Copywriting",
    "Video Editing",
    "Photo Editing",
    "Digital Marketing",
    "SEO Services",
    "Social Media Management",
    "Data Entry",
    "Virtual Assistant",
    "Translation",
    "Tutoring",
    "Music Production",
    "Voice Over",
    "3D Modeling",
    "Animation",
    "Logo Design",
    "Branding",
    "Other",
  ];

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
    },
    wrapper: {
      position: "relative",
      zIndex: 2,
      maxWidth: "700px",
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
      marginTop: "1rem",
    },
    labelFirst: {
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
    select: {
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
      cursor: "pointer",
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
      minHeight: "140px",
      resize: "vertical",
      marginBottom: "1.25rem",
      fontSize: "1rem",
      fontFamily: "inherit",
    },
    radioGroup: {
      display: "flex",
      gap: "1.5rem",
      marginBottom: "1.25rem",
      flexWrap: "wrap",
    },
    radioOption: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      cursor: "pointer",
    },
    radioInput: {
      cursor: "pointer",
    },
    radioLabel: {
      color: "#D1D5DB",
      fontSize: "0.95rem",
      cursor: "pointer",
    },
    tierContainer: {
      marginTop: "1rem",
      padding: "1.5rem",
      background: "rgba(139,92,246,0.05)",
      border: "1px solid rgba(139,92,246,0.2)",
      borderRadius: "10px",
      marginBottom: "1.25rem",
    },
    tierTitle: {
      color: "#D1D5DB",
      fontWeight: 600,
      fontSize: "0.95rem",
      marginBottom: "1rem",
    },
    tierRow: {
      marginBottom: "1rem",
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
      marginTop: "1rem",
    },
    buttonSecondary: {
      width: "100%",
      padding: "0.85rem 1.35rem",
      fontSize: "1rem",
      fontWeight: 600,
      color: "#E5E7EB",
      background: "transparent",
      border: "1px solid rgba(255,255,255,0.2)",
      borderRadius: "10px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginTop: "0.5rem",
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
      // Save to Firebase Firestore
      await addDoc(collection(db, "services"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      
      setStatus({ submitting: false, success: "Service posted successfully!", error: null });
      // Reset form
      setFormData({
        userName: "",
        title: "",
        category: "",
        description: "",
        pricingType: "single",
        singlePrice: "",
        basicPrice: "",
        standardPrice: "",
        premiumPrice: "",
        basicDescription: "",
        standardDescription: "",
        premiumDescription: "",
        completionTime: "",
      });
    } catch (err) {
      console.error("Error posting service:", err);
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
        `}
      </style>
      <div style={styles.page}>
        <main style={styles.wrapper}>
          <h1 style={styles.heading}>Post Freelance Service</h1>
          <p style={styles.subline}>Share your skills and services with potential clients.</p>

          <section style={styles.card}>
            <form onSubmit={handleSubmit}>
              <label htmlFor="userName" style={styles.labelFirst}>Your Name</label>
              <input
                id="userName"
                name="userName"
                type="text"
                placeholder="John Doe"
                value={formData.userName}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="title" style={styles.label}>Service Title</label>
              <input
                id="title"
                name="title"
                type="text"
                placeholder="e.g., Professional Web Development Services"
                value={formData.title}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="category" style={styles.label}>Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={updateField}
                style={styles.select}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <label htmlFor="description" style={styles.label}>Detailed Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your service in detail. What do you offer? What makes you unique?"
                value={formData.description}
                onChange={updateField}
                style={styles.textarea}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label style={styles.label}>Pricing & Packages</label>
              <div style={styles.radioGroup}>
                <div style={styles.radioOption}>
                  <input
                    type="radio"
                    id="single"
                    name="pricingType"
                    value="single"
                    checked={formData.pricingType === "single"}
                    onChange={updateField}
                    style={styles.radioInput}
                  />
                  <label htmlFor="single" style={styles.radioLabel}>Single Price</label>
                </div>
                <div style={styles.radioOption}>
                  <input
                    type="radio"
                    id="tier"
                    name="pricingType"
                    value="tier"
                    checked={formData.pricingType === "tier"}
                    onChange={updateField}
                    style={styles.radioInput}
                  />
                  <label htmlFor="tier" style={styles.radioLabel}>Tier Packages (Basic, Standard, Premium)</label>
                </div>
              </div>

              {formData.pricingType === "single" ? (
                <>
                  <label htmlFor="singlePrice" style={styles.label}>Price</label>
                  <input
                    id="singlePrice"
                    name="singlePrice"
                    type="text"
                    placeholder="e.g., 5000 PKR or $50"
                    value={formData.singlePrice}
                    onChange={updateField}
                    style={styles.input}
                    onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                    onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                    required
                  />
                </>
              ) : (
                <div style={styles.tierContainer}>
                  <div style={styles.tierTitle}>Basic Package</div>
                  <div style={styles.tierRow}>
                    <input
                      name="basicPrice"
                      type="text"
                      placeholder="Price (e.g., 3000 PKR)"
                      value={formData.basicPrice}
                      onChange={updateField}
                      style={styles.input}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                    <textarea
                      name="basicDescription"
                      placeholder="What's included in Basic package"
                      value={formData.basicDescription}
                      onChange={updateField}
                      style={{...styles.textarea, minHeight: "80px", marginBottom: "1rem"}}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                  </div>

                  <div style={styles.tierTitle}>Standard Package</div>
                  <div style={styles.tierRow}>
                    <input
                      name="standardPrice"
                      type="text"
                      placeholder="Price (e.g., 5000 PKR)"
                      value={formData.standardPrice}
                      onChange={updateField}
                      style={styles.input}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                    <textarea
                      name="standardDescription"
                      placeholder="What's included in Standard package"
                      value={formData.standardDescription}
                      onChange={updateField}
                      style={{...styles.textarea, minHeight: "80px", marginBottom: "1rem"}}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                  </div>

                  <div style={styles.tierTitle}>Premium Package</div>
                  <div style={styles.tierRow}>
                    <input
                      name="premiumPrice"
                      type="text"
                      placeholder="Price (e.g., 8000 PKR)"
                      value={formData.premiumPrice}
                      onChange={updateField}
                      style={styles.input}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                    <textarea
                      name="premiumDescription"
                      placeholder="What's included in Premium package"
                      value={formData.premiumDescription}
                      onChange={updateField}
                      style={{...styles.textarea, minHeight: "80px", marginBottom: "0"}}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required
                    />
                  </div>
                </div>
              )}

              <label htmlFor="completionTime" style={styles.label}>Expected Completion Time</label>
              <input
                id="completionTime"
                name="completionTime"
                type="text"
                placeholder="e.g., 3-5 days, 1 week, 2 weeks"
                value={formData.completionTime}
                onChange={updateField}
                style={styles.input}
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
                {status.submitting ? "Posting..." : "Post Service"}
              </button>

              <a
                href="#/post"
                style={styles.buttonSecondary}
                onMouseEnter={(e) => { e.target.style.borderColor = "#8B5CF6"; e.target.style.background = "rgba(139,92,246,0.1)"; }}
                onMouseLeave={(e) => { e.target.style.borderColor = "rgba(255,255,255,0.2)"; e.target.style.background = "transparent"; }}
              >
                Back
              </a>

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


