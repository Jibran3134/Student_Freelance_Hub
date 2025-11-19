import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import "./styles/post-project-page.css";

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
    <div className="post-project-page">
      <main className="post-project-wrapper">
        <h1 className="post-project-heading">Post Project</h1>
        <p className="post-project-subline">Post your project and find talented freelancers to work on it.</p>

        <section className="post-project-card">
          <form onSubmit={handleSubmit}>
            <label htmlFor="personName" className="post-project-label">Your Name</label>
            <input
              id="personName"
              name="personName"
              type="text"
              placeholder="John Doe"
              value={formData.personName}
              onChange={updateField}
              className="post-project-input"
              required
            />

            <label htmlFor="projectTitle" className="post-project-label">Project Title</label>
            <input
              id="projectTitle"
              name="projectTitle"
              type="text"
              placeholder="e.g., E-commerce Website Development"
              value={formData.projectTitle}
              onChange={updateField}
              className="post-project-input"
              required
            />

            <label htmlFor="description" className="post-project-label">Project Brief Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your project in detail. What do you need? What are the requirements?"
              value={formData.description}
              onChange={updateField}
              className="post-project-textarea"
              required
            />

            <label htmlFor="category" className="post-project-label">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={updateField}
              className="post-project-select"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label className="post-project-label">Payment Type</label>
            <div className="post-project-radio-group">
              <label className="post-project-radio-option">
                <input
                  type="radio"
                  id="fixed"
                  name="paymentType"
                  value="fixed"
                  checked={formData.paymentType === "fixed"}
                  onChange={updateField}
                  className="post-project-radio-input"
                />
                <span className="post-project-radio-label">Fixed Price</span>
              </label>
              <label className="post-project-radio-option">
                <input
                  type="radio"
                  id="hourly"
                  name="paymentType"
                  value="hourly"
                  checked={formData.paymentType === "hourly"}
                  onChange={updateField}
                  className="post-project-radio-input"
                />
                <span className="post-project-radio-label">Hourly Rate</span>
              </label>
              <label className="post-project-radio-option">
                <input
                  type="radio"
                  id="volunteer"
                  name="paymentType"
                  value="volunteer"
                  checked={formData.paymentType === "volunteer"}
                  onChange={updateField}
                  className="post-project-radio-input"
                />
                <span className="post-project-radio-label">Volunteer / Credit-based</span>
              </label>
            </div>

            {formData.paymentType !== "volunteer" && (
              <>
                <label className="post-project-label">Budget Range</label>
                <div className="post-project-budget">
                  <input
                    name="budgetMin"
                    type="number"
                    placeholder="Min"
                    value={formData.budgetMin}
                    onChange={updateField}
                    className="post-project-budget-input"
                    required
                  />
                  <span className="post-project-budget-separator">–</span>
                  <input
                    name="budgetMax"
                    type="number"
                    placeholder="Max"
                    value={formData.budgetMax}
                    onChange={updateField}
                    className="post-project-budget-input"
                    required
                  />
                  <select
                    name="currency"
                    value={formData.currency}
                    onChange={updateField}
                    className="post-project-currency"
                  >
                    <option value="PKR">PKR</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                </div>
              </>
            )}

            <label htmlFor="deadline" className="post-project-label">Deadline</label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              value={formData.deadline}
              onChange={updateField}
              className="post-project-input"
              required
            />

            <label htmlFor="requiredSkills" className="post-project-label">Required Skills</label>
            <input
              id="requiredSkills"
              name="requiredSkills"
              type="text"
              placeholder="e.g., React, Node.js, MongoDB, UI/UX Design"
              value={formData.requiredSkills}
              onChange={updateField}
              className="post-project-input"
              required
            />

            <label htmlFor="numberOfFreelancers" className="post-project-label">Number of Freelancers</label>
            <input
              id="numberOfFreelancers"
              name="numberOfFreelancers"
              type="number"
              min="1"
              placeholder="1"
              value={formData.numberOfFreelancers}
              onChange={updateField}
              className="post-project-input"
              required
            />

            <label htmlFor="preferredCommunication" className="post-project-label">Preferred Communication</label>
            <select
              id="preferredCommunication"
              name="preferredCommunication"
              value={formData.preferredCommunication}
              onChange={updateField}
              className="post-project-select"
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
              className="post-project-button-primary"
            >
              {status.submitting ? "Posting..." : "Post Project"}
            </button>

            <a href="#/post" className="post-project-button-secondary">
              Back
            </a>

            {status.success && (
              <div className="post-project-status success">
                {status.success}
              </div>
            )}
            {status.error && (
              <div className="post-project-status error">
                {status.error}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
