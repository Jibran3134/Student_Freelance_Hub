import React, { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./styles/firebase-pages.css";

const defaultAvatar =
  "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&h=200&fit=crop&crop=faces&auto=format";

export default function FirebaseProfilePage() {
  const [currentUser, setCurrentUser] = useState(() => auth.currentUser);
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    const userRef = doc(db, "users", currentUser.uid);
    const ownerEmail = currentUser.email ? currentUser.email.toLowerCase() : "";
    if (!ownerEmail) {
      setListings([]);
      setLoading(false);
      return;
    }

    const listingsQuery = query(
      collection(db, "projectsServices"),
      where("ownerEmail", "==", ownerEmail)
    );

    const unsubscribeProfile = onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data());
        } else {
          setProfile({
            name: currentUser.displayName || "Anonymous user",
            email: currentUser.email,
            profilePicture: defaultAvatar,
          });
        }
      },
      (err) => {
        console.error("Failed to load profile", err);
        setError(err.message || "Unable to load profile");
      }
    );

    const unsubscribeListings = onSnapshot(
      listingsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
        data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setListings(data);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to load listings", err);
        setError(err.message || "Unable to load listings");
        setLoading(false);
      }
    );

    return () => {
      unsubscribeProfile();
      unsubscribeListings();
    };
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="firebase-page firebase-profile-page">
        <div className="firebase-card firebase-profile-shell">
          <h1>Profile</h1>
          <p className="firebase-lead">Sign in to manage your services.</p>
          <div className="firebase-actions">
            <button
              type="button"
              className="firebase-btn primary"
              onClick={() => (window.location.hash = "#/login")}
            >
              Go to login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="firebase-page firebase-profile-page">
      <div className="firebase-card firebase-profile-shell">
        <h1>Your Firebase Profile</h1>
        <p className="firebase-lead">Live data pulled directly from Firestore.</p>

        {loading && <div className="firebase-empty">Loading your data…</div>}
        {error && <div className="firebase-error">{error}</div>}

        {!loading && (
          <>
            <div className="firebase-profile-header">
              <img
                src={profile?.profilePicture || defaultAvatar}
                alt="Profile"
                className="firebase-profile-avatar"
              />
              <div>
                <h2>{profile?.name || currentUser.email}</h2>
                <p>{profile?.email || currentUser.email}</p>
                <p className="firebase-profile-meta">
                  UID: <span>{currentUser.uid}</span>
                </p>
              </div>
            </div>

            <div className="firebase-actions" style={{ justifyContent: "flex-start" }}>
              <button
                type="button"
                className="firebase-btn secondary"
                onClick={() => (window.location.hash = "#/update-profile")}
              >
                Edit profile
              </button>
              <button
                type="button"
                className="firebase-btn primary"
                onClick={() => (window.location.hash = "#/firebase-add")}
              >
                + Post service
              </button>
            </div>

            <div className="firebase-divider" />

            <h2 className="firebase-subheading">Your posted services</h2>
            {listings.length === 0 ? (
              <div className="firebase-empty">You haven&apos;t posted any services yet.</div>
            ) : (
              <div className="firebase-profile-grid">
                {listings.map((item) => (
                  <div key={item.id} className="firebase-profile-card">
                    <p className="firebase-chip">{item.category || "Uncategorized"}</p>
                    <h3>{item.title}</h3>
                    <p className="firebase-profile-description">
                      {item.description?.slice(0, 120) || "No description provided."}
                      {item.description && item.description.length > 120 && "…"}
                    </p>
                    <div className="firebase-profile-meta">
                      <span>💰 {item.price ? `${item.price.toLocaleString()} PKR` : "N/A"}</span>
                      <span>
                        📅 {item.date ? new Date(item.date).toLocaleDateString() : "No date"}
                      </span>
                    </div>
                    <div className="firebase-actions" style={{ justifyContent: "flex-start" }}>
                      <button
                        type="button"
                        className="firebase-btn secondary"
                        onClick={() => (window.location.hash = `#/firebase-edit/${item.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="firebase-btn danger"
                        onClick={() => (window.location.hash = `#/firebase-delete/${item.id}`)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

