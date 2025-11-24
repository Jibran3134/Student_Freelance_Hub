import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import "./styles/post-project-page.css";

const normalizeEmail = (email) => email.trim().toLowerCase();

const getPriceBucket = (price) => {
  if (!price && price !== 0) return "unspecified";
  if (price < 5000) return "budget";
  if (price < 20000) return "standard";
  return "premium";
};

const buildKeywords = (title = "", description = "") => {
  const tokens = new Set();
  const pushTokens = (text) => {
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter(Boolean)
      .forEach((word) => tokens.add(word));
  };
  pushTokens(title);
  pushTokens(description);
  return Array.from(tokens).slice(0, 30);
};

export default function PostProjectPage() {
  const [formData, setFormData] = useState({
    personName: "",
    email: "",
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

  useEffect(() => {
    if (auth?.currentUser?.email) {
      setFormData((prev) => ({ ...prev, email: auth.currentUser.email }));
    }
  }, []);

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
      if (!formData.email.trim()) {
        throw new Error("Email is required to track your projects.");
      }
      const normalizedEmail = normalizeEmail(formData.email);

      // Save to Firebase Firestore
      await addDoc(collection(db, "projects"), {
        ...formData,
        createdAt: serverTimestamp(),
      });

      const normalizedTitle = formData.projectTitle.trim();
      const normalizedDescription = formData.description.trim();
      const priceNumber = Number(formData.budgetMax || formData.budgetMin || 0);
      const deadlineDate = formData.deadline ? Timestamp.fromDate(new Date(formData.deadline)) : null;

      await addDoc(collection(db, "projectsServices"), {
        title: normalizedTitle,
        titleLowercase: normalizedTitle.toLowerCase(),
        description: normalizedDescription,
        category: formData.category,
        price: priceNumber,
        priceBucket: getPriceBucket(priceNumber),
        paymentType: formData.paymentType,
        budgetMin: formData.budgetMin,
        budgetMax: formData.budgetMax,
        currency: formData.currency,
        deadline: formData.deadline,
        date: formData.deadline,
        dateTimestamp: deadlineDate,
        requiredSkills: formData.requiredSkills,
        numberOfFreelancers: formData.numberOfFreelancers,
        preferredCommunication: formData.preferredCommunication,
        personName: formData.personName,
        ownerEmail: normalizedEmail,
        userId: auth?.currentUser?.uid || "",
        keywords: buildKeywords(normalizedTitle, normalizedDescription),
        images: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      setStatus({ submitting: false, success: "Project posted successfully!", error: null });
      // Reset form
      setFormData({
        personName: "",
        email: auth?.currentUser?.email || "",
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

            <label htmlFor="email" className="post-project-label">Your Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
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

