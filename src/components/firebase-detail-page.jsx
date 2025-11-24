import React, { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./styles/firebase-pages.css";

export default function FirebaseDetailPage({ itemId }) {
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!itemId) {
      setError("Invalid document id");
      setLoading(false);
      return;
    }

    const ref = doc(db, "projectsServices", itemId);
    const unsubscribe = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Document not found");
          setItem(null);
        } else {
          setItem({ id: snapshot.id, ...snapshot.data() });
          setError("");
        }
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load detail", err);
        setError(err.message || "Unable to load item");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [itemId]);

  const userUid = auth?.currentUser?.uid;
  const userEmail = auth?.currentUser?.email?.toLowerCase();
  const ownerEmail = item?.ownerEmail?.toLowerCase();
  const isOwner =
    !!item &&
    ((userUid && userUid === item.userId) || (userEmail && ownerEmail && userEmail === ownerEmail));

  const navigateTo = (hash) => {
    window.location.hash = hash;
  };

  return (
    <div className="firebase-page firebase-profile-page">
      <div className="firebase-card firebase-profile-shell">
        <h1>Project / Service Details</h1>
        <p className="firebase-lead">Live Firestore view for a single document.</p>

        {loading && <div className="firebase-empty">Loading document…</div>}
        {error && <div className="firebase-error">{error}</div>}

        {!loading && item && (
          <>
            <div className="firebase-meta" style={{ marginBottom: "1rem" }}>
              <span className="firebase-chip">{item.category || "Uncategorized"}</span>
              <span className="firebase-chip">
                💰 {item.price ? `${item.price.toLocaleString()} PKR` : "Not set"}
              </span>
              <span className="firebase-chip">{item.date ? `📅 ${item.date}` : "No date"}</span>
              <span className="firebase-chip">👤 {item.userId || "Unknown user"}</span>
            </div>

            <h2>{item.title}</h2>
            <p>{item.description}</p>

            {!!item.images?.length && (
              <div className="firebase-image-grid">
                {item.images.map((url) => (
                  <img key={url} src={url} alt={item.title} />
                ))}
              </div>
            )}

            {isOwner && (
              <div className="firebase-actions" style={{ justifyContent: "flex-start" }}>
                <button
                  type="button"
                  className="firebase-btn primary"
                  onClick={() => navigateTo(`#/firebase-edit/${item.id}`)}
                >
                  Edit item
                </button>
                <button
                  type="button"
                  className="firebase-btn danger"
                  onClick={() => navigateTo(`#/firebase-delete/${item.id}`)}
                >
                  Delete item
                </button>
              </div>
            )}

            {!isOwner && (
              <p className="firebase-error">
                You are viewing someone else&apos;s listing. Sign in as the owner to edit/delete.
              </p>
            )}
          </>
        )}

        <div className="firebase-actions" style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className="firebase-btn secondary"
            onClick={() => navigateTo("#/profile")}
          >
            Back to profile
          </button>
        </div>
      </div>
    </div>
  );
}

