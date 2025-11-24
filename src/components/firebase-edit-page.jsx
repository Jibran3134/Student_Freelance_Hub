import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc, Timestamp, updateDoc, serverTimestamp } from "firebase/firestore";
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

export default function FirebaseEditPage({ itemId }) {
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const fetchDoc = async () => {
      if (!itemId) {
        setError("Missing document id");
        setLoading(false);
        return;
      }

      try {
        const ref = doc(db, "projectsServices", itemId);
        const snapshot = await getDoc(ref);
        if (!snapshot.exists()) {
          setError("Document not found");
          setFormData(null);
        } else {
          const data = snapshot.data();
          if (auth?.currentUser?.uid && auth.currentUser.uid !== data.userId) {
            setError("You can only edit your own items.");
          }
          setFormData({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "",
            price: data.price ?? "",
            images: (data.images || []).join(", "),
            date: data.date || "",
            userId: data.userId || "",
            ownerEmail: data.ownerEmail || "",
          });
        }
      } catch (err) {
        console.error("Failed to load document for edit", err);
        setError(err.message || "Unable to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [itemId]);

  const isValid = useMemo(() => {
    if (!formData) return false;
    return (
      formData.title.trim() &&
      formData.description.trim() &&
      formData.category &&
      formData.price &&
      formData.date
    );
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

    const currentUser = auth?.currentUser;
    const canEdit =
      (!!currentUser?.uid && currentUser.uid === formData.userId) ||
      (!!currentUser?.email &&
        formData.ownerEmail &&
        currentUser.email.toLowerCase() === formData.ownerEmail.toLowerCase());
    if (!canEdit) {
      setError("Only the owner can update this record.");
      return;
    }

    setSaving(true);
    try {
      const normalizedTitle = formData.title.trim();
      const normalizedDescription = formData.description.trim();
      const priceNumber = Number(formData.price);
      const imageArray = formData.images
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

      const ref = doc(db, "projectsServices", itemId);
      await updateDoc(ref, {
        title: normalizedTitle,
        titleLowercase: normalizedTitle.toLowerCase(),
        description: normalizedDescription,
        category: formData.category,
        price: priceNumber,
        priceBucket: getPriceBucket(priceNumber),
        images: imageArray,
        date: formData.date,
        dateTimestamp: Timestamp.fromDate(new Date(formData.date)),
        keywords: buildKeywords(normalizedTitle, normalizedDescription),
        ownerEmail:
          formData.ownerEmail?.toLowerCase() || currentUser?.email?.toLowerCase() || "",
        updatedAt: serverTimestamp(),
      });

      setToast("Document updated successfully!");
      setTimeout(() => {
        setToast("");
        window.location.hash = "#/profile";
      }, 1200);
    } catch (err) {
      console.error("Failed to update document", err);
      setError(err.message || "Unable to update document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="firebase-page firebase-profile-page">
      <div className="firebase-card firebase-profile-shell">
        <h1>Edit Project / Service</h1>
        <p className="firebase-lead">Fields are pre-filled from Firestore and updated in-place.</p>

        {loading && <div className="firebase-empty">Loading document…</div>}
        {error && <div className="firebase-error">{error}</div>}

        {!loading && formData && (
          <form className="firebase-form" onSubmit={handleSubmit}>
            <div className="firebase-field">
              <label htmlFor="title">Title</label>
              <input id="title" name="title" value={formData.title} onChange={handleChange} />
            </div>

            <div className="firebase-field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="firebase-field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="firebase-field">
              <label htmlFor="price">Price (PKR)</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
              />
            </div>

            <div className="firebase-field">
              <label htmlFor="images">Image URLs (comma separated)</label>
              <input
                id="images"
                name="images"
                value={formData.images}
                onChange={handleChange}
              />
            </div>

            <div className="firebase-field">
              <label htmlFor="date">Delivery / Due Date</label>
              <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
            </div>

            <div className="firebase-actions">
              <button
                type="button"
                className="firebase-btn secondary"
                onClick={() => window.location.hash = `#/firebase-detail/${itemId}`}
              >
                Cancel
              </button>
              <button type="submit" className="firebase-btn primary" disabled={!isValid || saving}>
                {saving ? "Updating…" : "Update document"}
              </button>
            </div>
          </form>
        )}

        {toast && <div className="firebase-toast success">{toast}</div>}
      </div>
    </div>
  );
}

