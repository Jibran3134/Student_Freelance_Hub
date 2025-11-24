import React, { useEffect, useState } from "react";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./styles/firebase-pages.css";

export default function FirebaseDeletePage({ itemId }) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
          setItem(null);
        } else {
          setItem({ id: snapshot.id, ...snapshot.data() });
        }
      } catch (err) {
        console.error("Failed to load document for deletion", err);
        setError(err.message || "Unable to load document");
      } finally {
        setLoading(false);
      }
    };

    fetchDoc();
  }, [itemId]);

  const userUid = auth?.currentUser?.uid;
  const userEmail = auth?.currentUser?.email?.toLowerCase();
  const itemOwnerEmail = item?.ownerEmail?.toLowerCase();
  const canDelete =
    !!item &&
    ((userUid && userUid === item.userId) ||
      (userEmail && itemOwnerEmail && userEmail === itemOwnerEmail));

  const handleDelete = async () => {
    if (!item) return;
    if (!canDelete) {
      setError("You can only delete items you created.");
      return;
    }

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "projectsServices", item.id));
      window.location.hash = "#/firebase-list";
    } catch (err) {
      console.error("Failed to delete document", err);
      setError(err.message || "Unable to delete document");
    } finally {
      setDeleting(false);
      setShowModal(false);
    }
  };

  return (
    <div className="firebase-page firebase-profile-page">
      <div className="firebase-card firebase-profile-shell">
        <h1>Delete Project / Service</h1>
        <p className="firebase-lead">Clean Firestore deletes with confirmation modal.</p>

        {loading && <div className="firebase-empty">Loading document…</div>}
        {error && <div className="firebase-error">{error}</div>}

        {!loading && item && (
          <>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <div className="firebase-meta">
              <span className="firebase-chip">{item.category || "Uncategorized"}</span>
              <span className="firebase-chip">
                💰 {item.price ? `${item.price.toLocaleString()} PKR` : "Not set"}
              </span>
              <span className="firebase-chip">📅 {item.date || "No date"}</span>
            </div>

            {!canDelete && (
              <p className="firebase-error" style={{ marginTop: "1rem" }}>
                You must be the owner to delete this item.
              </p>
            )}

            <div className="firebase-actions" style={{ marginTop: "1.5rem" }}>
              <button
                type="button"
                className="firebase-btn secondary"
                onClick={() => (window.location.hash = `#/firebase-detail/${itemId}`)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="firebase-btn danger"
                disabled={!canDelete}
                onClick={() => setShowModal(true)}
              >
                Delete item
              </button>
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div className="firebase-modal-backdrop">
          <div className="firebase-modal">
            <h3>Confirm deletion</h3>
            <p>Are you sure you want to delete “{item?.title}”? This cannot be undone.</p>
            <div className="firebase-actions" style={{ justifyContent: "center", marginTop: "1.5rem" }}>
              <button
                type="button"
                className="firebase-btn secondary"
                onClick={() => setShowModal(false)}
                disabled={deleting}
              >
                Keep item
              </button>
              <button
                type="button"
                className="firebase-btn danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

