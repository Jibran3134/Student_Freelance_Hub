import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import "./styles/post-service-page.css";

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

export default function PostServicePage() {
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
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

  function updateField(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ submitting: true, success: null, error: null });

    try {
      if (!formData.email.trim()) {
        throw new Error("Email is required to track your services.");
      }
      const normalizedEmail = normalizeEmail(formData.email);

      // Save to Firebase Firestore
      await addDoc(collection(db, "services"), {
        ...formData,
        ownerId: auth?.currentUser?.uid || "",
        createdAt: serverTimestamp(),
      });

      const normalizedTitle = formData.title.trim();
      const normalizedDescription = formData.description.trim();
      const priceSource =
        formData.pricingType === "single"
          ? formData.singlePrice
          : formData.basicPrice || formData.standardPrice || formData.premiumPrice;
      const priceNumber = Number((priceSource || "0").toString().replace(/[^0-9.]/g, ""));
      const today = new Date().toISOString().split("T")[0];

      await addDoc(collection(db, "projectsServices"), {
        title: normalizedTitle,
        titleLowercase: normalizedTitle.toLowerCase(),
        description: normalizedDescription,
        category: formData.category,
        price: priceNumber,
        priceBucket: getPriceBucket(priceNumber),
        pricingType: formData.pricingType,
        singlePrice: formData.singlePrice,
        basicPrice: formData.basicPrice,
        standardPrice: formData.standardPrice,
        premiumPrice: formData.premiumPrice,
        completionTime: formData.completionTime,
        date: today,
        dateTimestamp: Timestamp.fromDate(new Date()),
        ownerEmail: normalizedEmail,
        ownerId: auth?.currentUser?.uid || "",
        userId: auth?.currentUser?.uid || "",
        keywords: buildKeywords(normalizedTitle, normalizedDescription),
        images: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStatus({ submitting: false, success: "Service posted successfully!", error: null });
      // Reset form
      setFormData({
        userName: "",
        email: auth?.currentUser?.email || "",
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
    <div className="post-service-page">
      <main className="post-service-wrapper">
        <h1 className="post-service-heading">Post Freelance Service</h1>
        <p className="post-service-subline">Share your skills and services with potential clients.</p>

        <section className="post-service-card">
          <form onSubmit={handleSubmit}>
            <label htmlFor="userName" className="post-service-label">Your Name</label>
            <input
              id="userName"
              name="userName"
              type="text"
              placeholder="John Doe"
              value={formData.userName}
              onChange={updateField}
              className="post-service-input"
              required
            />

            <label htmlFor="email" className="post-service-label">Your Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={updateField}
              className="post-service-input"
              required
            />

            <label htmlFor="title" className="post-service-label">Service Title</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Professional Web Development Services"
              value={formData.title}
              onChange={updateField}
              className="post-service-input"
              required
            />

            <label htmlFor="category" className="post-service-label">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={updateField}
              className="post-service-select"
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <label htmlFor="description" className="post-service-label">Detailed Description</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe your service in detail. What do you offer? What makes you unique?"
              value={formData.description}
              onChange={updateField}
              className="post-service-textarea"
              required
            />

            <label className="post-service-label">Pricing & Packages</label>
            <div className="post-service-radio-group">
              <label className="post-service-radio-option">
                <input
                  type="radio"
                  id="single"
                  name="pricingType"
                  value="single"
                  checked={formData.pricingType === "single"}
                  onChange={updateField}
                  className="post-service-radio-input"
                />
                <span className="post-service-radio-label">Single Price</span>
              </label>
              <label className="post-service-radio-option">
                <input
                  type="radio"
                  id="tier"
                  name="pricingType"
                  value="tier"
                  checked={formData.pricingType === "tier"}
                  onChange={updateField}
                  className="post-service-radio-input"
                />
                <span className="post-service-radio-label">Tier Packages (Basic, Standard, Premium)</span>
              </label>
            </div>

            {formData.pricingType === "single" ? (
              <>
                <label htmlFor="singlePrice" className="post-service-label">Price</label>
                <input
                  id="singlePrice"
                  name="singlePrice"
                  type="text"
                  placeholder="e.g., 5000 PKR or $50"
                  value={formData.singlePrice}
                  onChange={updateField}
                  className="post-service-input"
                  required
                />
              </>
            ) : (
              <div className="post-service-tier">
                <div className="post-service-tier-title">Basic Package</div>
                <div className="post-service-tier-row">
                  <input
                    name="basicPrice"
                    type="text"
                    placeholder="Price (e.g., 3000 PKR)"
                    value={formData.basicPrice}
                    onChange={updateField}
                    className="post-service-input"
                    required
                  />
                  <textarea
                    name="basicDescription"
                    placeholder="What's included in Basic package"
                    value={formData.basicDescription}
                    onChange={updateField}
                    className="post-service-tier-textarea"
                    required
                  />
                </div>

                <div className="post-service-tier-title">Standard Package</div>
                <div className="post-service-tier-row">
                  <input
                    name="standardPrice"
                    type="text"
                    placeholder="Price (e.g., 5000 PKR)"
                    value={formData.standardPrice}
                    onChange={updateField}
                    className="post-service-input"
                    required
                  />
                  <textarea
                    name="standardDescription"
                    placeholder="What's included in Standard package"
                    value={formData.standardDescription}
                    onChange={updateField}
                    className="post-service-tier-textarea"
                    required
                  />
                </div>

                <div className="post-service-tier-title">Premium Package</div>
                <div className="post-service-tier-row">
                  <input
                    name="premiumPrice"
                    type="text"
                    placeholder="Price (e.g., 8000 PKR)"
                    value={formData.premiumPrice}
                    onChange={updateField}
                    className="post-service-input"
                    required
                  />
                  <textarea
                    name="premiumDescription"
                    placeholder="What's included in Premium package"
                    value={formData.premiumDescription}
                    onChange={updateField}
                    className="post-service-tier-textarea"
                    required
                  />
                </div>
              </div>
            )}

            <label htmlFor="completionTime" className="post-service-label">Expected Completion Time</label>
            <input
              id="completionTime"
              name="completionTime"
              type="text"
              placeholder="e.g., 3-5 days, 1 week, 2 weeks"
              value={formData.completionTime}
              onChange={updateField}
              className="post-service-input"
              required
            />

            <button
              type="submit"
              disabled={status.submitting}
              className="post-service-button-primary"
            >
              {status.submitting ? "Posting..." : "Post Service"}
            </button>

            <a href="#/post" className="post-service-button-secondary">
              Back
            </a>

            {status.success && (
              <div className="post-service-status success">
                {status.success}
              </div>
            )}
            {status.error && (
              <div className="post-service-status error">
                {status.error}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}



