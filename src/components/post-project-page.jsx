import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function PostProjectPage() {
  const [formData, setFormData] = useState({
    personName: "",
    projectTitle: "",
    description: "",
    category: "",
    paymentType: "fixed", // "fixed", "hourly", "volunteer"
    budgetMin: "",
    budgetMax: "",
    currency: "PKR",
    deadline: "",
    requiredSkills: "",
    numberOfFreelancers: "1",
    preferredCommunication: "",
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

  const communicationOptions = [
    "Email",
    "Phone",
    "WhatsApp",
    "Slack",
    "Discord",
    "Zoom",
    "Microsoft Teams",
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
    budgetContainer: {
      display: "flex",
      gap: "1rem",
      alignItems: "center",
      marginBottom: "1.25rem",
    },
    budgetInput: {
      flex: "1",
      background: "#0f0d19",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#E5E7EB",
      padding: "0.75rem 0.9rem",
      borderRadius: "10px",
      outline: "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      fontSize: "1rem",
    },
    currencySelect: {
      background: "#0f0d19",
      border: "1px solid rgba(255,255,255,0.08)",
      color: "#E5E7EB",
      padding: "0.75rem 0.9rem",
      borderRadius: "10px",
      outline: "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      fontSize: "1rem",
      cursor: "pointer",
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
      await addDoc(collection(db, "projects"), {
        ...formData,
        createdAt: serverTimestamp(),
      });
      
      setStatus({ submitting: false, success: "Project posted successfully!", error: null });
      // Reset form
      setFormData({
        personName: "",
        projectTitle: "",
        description: "",
        category: "",
        paymentType: "fixed",
        budgetMin: "",
        budgetMax: "",
        currency: "PKR",
        deadline: "",
        requiredSkills: "",
        numberOfFreelancers: "1",
        preferredCommunication: "",
      });
    } catch (err) {
      console.error("Error posting project:", err);
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
          <h1 style={styles.heading}>Post Project</h1>
          <p style={styles.subline}>Post your project and find talented freelancers to work on it.</p>

          <section style={styles.card}>
            <form onSubmit={handleSubmit}>
              <label htmlFor="personName" style={styles.labelFirst}>Your Name</label>
              <input
                id="personName"
                name="personName"
                type="text"
                placeholder="John Doe"
                value={formData.personName}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="projectTitle" style={styles.label}>Project Title</label>
              <input
                id="projectTitle"
                name="projectTitle"
                type="text"
                placeholder="e.g., E-commerce Website Development"
                value={formData.projectTitle}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="description" style={styles.label}>Project Brief Description</label>
              <textarea
                id="description"
                name="description"
                placeholder="Describe your project in detail. What do you need? What are the requirements?"
                value={formData.description}
                onChange={updateField}
                style={styles.textarea}
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

              <label style={styles.label}>Payment Type</label>
              <div style={styles.radioGroup}>
                <div style={styles.radioOption}>
                  <input
                    type="radio"
                    id="fixed"
                    name="paymentType"
                    value="fixed"
                    checked={formData.paymentType === "fixed"}
                    onChange={updateField}
                    style={styles.radioInput}
                  />
                  <label htmlFor="fixed" style={styles.radioLabel}>Fixed Price</label>
                </div>
                <div style={styles.radioOption}>
                  <input
                    type="radio"
                    id="hourly"
                    name="paymentType"
                    value="hourly"
                    checked={formData.paymentType === "hourly"}
                    onChange={updateField}
                    style={styles.radioInput}
                  />
                  <label htmlFor="hourly" style={styles.radioLabel}>Hourly Rate</label>
                </div>
                <div style={styles.radioOption}>
                  <input
                    type="radio"
                    id="volunteer"
                    name="paymentType"
                    value="volunteer"
                    checked={formData.paymentType === "volunteer"}
                    onChange={updateField}
                    style={styles.radioInput}
                  />
                  <label htmlFor="volunteer" style={styles.radioLabel}>Volunteer / Credit-based</label>
                </div>
              </div>

              {formData.paymentType !== "volunteer" && (
                <>
                  <label style={styles.label}>Budget Range</label>
                  <div style={styles.budgetContainer}>
                    <input
                      name="budgetMin"
                      type="number"
                      placeholder="Min"
                      value={formData.budgetMin}
                      onChange={updateField}
                      style={styles.budgetInput}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required={formData.paymentType !== "volunteer"}
                    />
                    <span style={{ color: "#9CA3AF" }}>–</span>
                    <input
                      name="budgetMax"
                      type="number"
                      placeholder="Max"
                      value={formData.budgetMax}
                      onChange={updateField}
                      style={styles.budgetInput}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                      required={formData.paymentType !== "volunteer"}
                    />
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={updateField}
                      style={styles.currencySelect}
                      onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                      onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                    >
                      <option value="PKR">PKR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </>
              )}

              <label htmlFor="deadline" style={styles.label}>Deadline</label>
              <input
                id="deadline"
                name="deadline"
                type="date"
                value={formData.deadline}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="requiredSkills" style={styles.label}>Required Skills</label>
              <input
                id="requiredSkills"
                name="requiredSkills"
                type="text"
                placeholder="e.g., React, Node.js, MongoDB, UI/UX Design"
                value={formData.requiredSkills}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="numberOfFreelancers" style={styles.label}>Number of Freelancers</label>
              <input
                id="numberOfFreelancers"
                name="numberOfFreelancers"
                type="number"
                min="1"
                placeholder="1"
                value={formData.numberOfFreelancers}
                onChange={updateField}
                style={styles.input}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              />

              <label htmlFor="preferredCommunication" style={styles.label}>Preferred Communication</label>
              <select
                id="preferredCommunication"
                name="preferredCommunication"
                value={formData.preferredCommunication}
                onChange={updateField}
                style={styles.select}
                onFocus={(e)=>{ e.target.style.borderColor = "#8B5CF6"; e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.2)"; }}
                onBlur={(e)=>{ e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
                required
              >
                <option value="">Select preferred communication method</option>
                {communicationOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <button
                type="submit"
                disabled={status.submitting}
                style={{ ...styles.buttonPrimary, opacity: status.submitting ? 0.7 : 1 }}
                onMouseEnter={(e) => { if (!status.submitting) e.target.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; }}
              >
                {status.submitting ? "Posting..." : "Post Project"}
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


