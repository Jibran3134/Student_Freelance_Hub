import React, { useEffect, useMemo, useState } from "react";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  startAt,
  endAt,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import "./styles/firebase-pages.css";

const priceOptions = [
  { value: "", label: "Any price" },
  { value: "budget", label: "Budget (< 5k PKR)" },
  { value: "standard", label: "Standard (5k - 20k PKR)" },
  { value: "premium", label: "Premium (20k+ PKR)" },
  { value: "unspecified", label: "Not specified" },
];

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

export default function FirebaseListingPage() {
  const [filters, setFilters] = useState({
    category: "",
    priceBucket: "",
    date: "",
    search: "",
  });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    const colRef = collection(db, "projectsServices");
    const constraints = [];

    if (filters.category) constraints.push(where("category", "==", filters.category));
    if (filters.priceBucket) constraints.push(where("priceBucket", "==", filters.priceBucket));
    if (filters.date) constraints.push(where("date", "==", filters.date));

    let q;
    if (filters.search.trim()) {
      const searchValue = filters.search.trim().toLowerCase();
      q = query(
        colRef,
        ...constraints,
        orderBy("titleLowercase"),
        startAt(searchValue),
        endAt(`${searchValue}\uf8ff`)
      );
    } else {
      q = query(colRef, ...constraints, orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error("Failed to fetch listing", err);
        setError(err.message || "Unable to load items");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [filters]);

  const filteredItems = useMemo(() => {
    if (!filters.search.trim()) return items;
    const needle = filters.search.trim().toLowerCase();
    return items.filter((item) => item.titleLowercase?.startsWith(needle));
  }, [filters.search, items]);

  const resetFilters = () => {
    setFilters({
      category: "",
      priceBucket: "",
      date: "",
      search: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  return (
    <div className="firebase-page firebase-profile-page">
      <div className="firebase-card firebase-profile-shell">
        <h1>Projects & Services</h1>
        <p className="firebase-lead">
          Real-time Firestore feed with category, price, date filters and prefix search.
        </p>

        <div className="firebase-form" style={{ marginBottom: "1.5rem" }}>
          <div className="firebase-field">
            <label htmlFor="search">Search by title</label>
            <input
              id="search"
              name="search"
              placeholder="Type to filter…"
              value={filters.search}
              onChange={handleChange}
            />
          </div>

          <div className="firebase-field">
            <label htmlFor="category">Category</label>
            <select id="category" name="category" value={filters.category} onChange={handleChange}>
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="firebase-field">
            <label htmlFor="priceBucket">Price range</label>
            <select
              id="priceBucket"
              name="priceBucket"
              value={filters.priceBucket}
              onChange={handleChange}
            >
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="firebase-field">
            <label htmlFor="date">Exact date</label>
            <input id="date" name="date" type="date" value={filters.date} onChange={handleChange} />
          </div>

          <div className="firebase-actions">
            <button type="button" className="firebase-btn secondary" onClick={resetFilters}>
              Clear filters
            </button>
            <button
              type="button"
              className="firebase-btn primary"
              onClick={() => navigateTo("#/firebase-add")}
            >
              + Add new
            </button>
          </div>
        </div>

        {loading && <div className="firebase-empty">Loading Firestore data…</div>}
        {error && <div className="firebase-error">{error}</div>}
        {!loading && !filteredItems.length && (
          <div className="firebase-empty">No records match the selected filters.</div>
        )}

        {!loading && filteredItems.length > 0 && (
          <div className="firebase-list">
            {filteredItems.map((item) => (
              <div key={item.id} className="firebase-list-item">
                <div className="firebase-meta">
                  <span className="firebase-chip">{item.category || "Uncategorized"}</span>
                  <span className="firebase-chip">
                    💰 {item.price ? `${item.price.toLocaleString()} PKR` : "Not set"}
                  </span>
                  {item.date && <span className="firebase-chip">📅 {item.date}</span>}
                </div>

                <h3>{item.title}</h3>
                <p>{item.description}</p>

                <div className="firebase-actions" style={{ justifyContent: "flex-start" }}>
                  <button
                    type="button"
                    className="firebase-btn secondary"
                    onClick={() => navigateTo(`#/firebase-detail/${item.id}`)}
                  >
                    View details
                  </button>
                  <button
                    type="button"
                    className="firebase-btn primary"
                    onClick={() => navigateTo(`#/firebase-edit/${item.id}`)}
                  >
                    Quick edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

