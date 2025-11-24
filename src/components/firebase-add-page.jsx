import React, { useEffect, useMemo, useState } from "react";
import { addDoc, collection, serverTimestamp, Timestamp } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./styles/firebase-pages.css";

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

const initialState = {
  title: "",
  description: "",
  category: "",
  price: "",
  images: "",
  date: "",
  userId: "",
  ownerEmail: "",
};

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

export default function FirebaseAddPage() {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (auth?.currentUser?.uid) {
      setFormData((prev) => ({
        ...prev,
        userId: auth.currentUser.uid,
        ownerEmail: auth.currentUser.email || prev.ownerEmail,
      }));
    }
  }, []);

  const isValid = useMemo(() => {
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.category &&
      formData.price &&
      formData.date &&
      formData.userId &&
      formData.ownerEmail.trim()
    );
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!formData.title.trim()) nextErrors.title = "Title is required";
    if (!formData.description.trim()) nextErrors.description = "Description is required";
    if (!formData.category) nextErrors.category = "Choose a category";
    if (!formData.price || Number(formData.price) <= 0) nextErrors.price = "Enter a valid price";
    if (!formData.date) nextErrors.date = "Select a delivery date";
    if (!formData.userId) nextErrors.userId = "User ID required";
    if (!formData.ownerEmail.trim()) nextErrors.ownerEmail = "Email required";
    return nextErrors;
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...initialState,
      userId: auth?.currentUser?.uid || prev.userId,
      ownerEmail: auth?.currentUser?.email || prev.ownerEmail,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;

    setSubmitting(true);
    try {
      const normalizedTitle = formData.title.trim();
      const normalizedDescription = formData.description.trim();
      const priceNumber = Number(formData.price);
      const imageArray = formData.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      await addDoc(collection(db, "projectsServices"), {
        title: normalizedTitle,
        titleLowercase: normalizedTitle.toLowerCase(),
        description: normalizedDescription,
        category: formData.category,
        price: priceNumber,
        priceBucket: getPriceBucket(priceNumber),
        images: imageArray,
        date: formData.date,
        dateTimestamp: Timestamp.fromDate(new Date(formData.date)),
        userId: formData.userId,
        ownerEmail: formData.ownerEmail.trim().toLowerCase(),
        keywords: buildKeywords(normalizedTitle, normalizedDescription),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setToast("Project / Service saved successfully!");
      resetForm();
      setTimeout(() => {
        setToast("");
        window.location.hash = "#/firebase-list";
      }, 1200);
    } catch (err) {
      console.error("Failed to save document", err);
      setErrors({ firebase: err.message || "Unable to save. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="firebase-page firebase-profile-page">
      <div className="firebase-card firebase-profile-shell">
        <h1>Add Project / Service</h1>
        <p className="firebase-lead">
          Add a new entry to Firestore. Required fields help us run filtered queries later.
        </p>

        <form className="firebase-form" onSubmit={handleSubmit}>
          <div className="firebase-field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              placeholder="e.g., Full-stack Web App"
              value={formData.title}
              onChange={handleChange}
            />
            {errors.title && <span className="firebase-error">{errors.title}</span>}
          </div>

          <div className="firebase-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Describe the scope, requirements, or deliverables…"
              value={formData.description}
              onChange={handleChange}
            />
            {errors.description && <span className="firebase-error">{errors.description}</span>}
          </div>

          <div className="firebase-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}>
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && <span className="firebase-error">{errors.category}</span>}
          </div>

          <div className="firebase-field">
            <label htmlFor="price">Price (PKR)</label>
            <input
              id="price"
              name="price"
              type="number"
              min="0"
              placeholder="Enter a number e.g. 15000"
              value={formData.price}
              onChange={handleChange}
            />
            {errors.price && <span className="firebase-error">{errors.price}</span>}
          </div>

          <div className="firebase-field">
            <label htmlFor="images">Image URLs (comma separated)</label>
            <input
              id="images"
              name="images"
              placeholder="https://link-one.com, https://link-two.com"
              value={formData.images}
              onChange={handleChange}
            />
          </div>

          <div className="firebase-field">
            <label htmlFor="date">Delivery / Due Date</label>
            <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
            {errors.date && <span className="firebase-error">{errors.date}</span>}
          </div>

          <div className="firebase-field">
            <label htmlFor="userId">User ID</label>
            <input
              id="userId"
              name="userId"
              placeholder="Auto-filled from auth or enter manually"
              value={formData.userId}
              onChange={handleChange}
            />
            {errors.userId && <span className="firebase-error">{errors.userId}</span>}
          </div>

          <div className="firebase-field">
            <label htmlFor="ownerEmail">Email</label>
            <input
              id="ownerEmail"
              name="ownerEmail"
              type="email"
              placeholder="you@example.com"
              value={formData.ownerEmail}
              onChange={handleChange}
            />
            {errors.ownerEmail && <span className="firebase-error">{errors.ownerEmail}</span>}
          </div>

          {errors.firebase && <div className="firebase-error">{errors.firebase}</div>}

          <div className="firebase-actions">
            <button
              type="button"
              className="firebase-btn secondary"
              onClick={() => {
                resetForm();
                setErrors({});
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="firebase-btn primary"
              disabled={!isValid || submitting}
            >
              {submitting ? "Saving…" : "Save to Firestore"}
            </button>
          </div>
        </form>

        {toast && <div className="firebase-toast">{toast}</div>}
      </div>
    </div>
  );
}

