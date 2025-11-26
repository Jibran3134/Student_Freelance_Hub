import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import styles from "./styles/profile-page.module.css";
import AverageRating from "./AverageRating";
import StudentReviews from "./StudentReviews";
import PaymentsTable from "./PaymentsTable";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    skills: [],
    education: "",
    profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
    portfolioItems: [],
    availability: "online"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setError(null);

      // Parse UID from URL hash (e.g., #/profile?uid=xyz)
      const hash = window.location.hash;
      const queryIndex = hash.indexOf("?");
      let targetUid = null;

      if (queryIndex !== -1) {
        const params = new URLSearchParams(hash.substring(queryIndex));
        targetUid = params.get("uid");
      }

      const currentUser = auth.currentUser;

      // If no UID in URL, use current user
      if (!targetUid) {
        if (currentUser) {
          targetUid = currentUser.uid;
        } else {
          // Not logged in and no target UID -> Login
          window.location.hash = "#/login";
          return;
        }
      }

      // Determine if viewing own profile
      const isOwn = currentUser && currentUser.uid === targetUid;
      setIsOwnProfile(isOwn);
      setUser(currentUser);

      try {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, "users", targetUid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfileData((prev) => ({
            ...prev,
            name: userData.name || "Anonymous User",
            email: userData.email || "",
            skills: userData.skills || [],
            education: userData.education || "",
            profilePicture: userData.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
            availability: userData.availability || "online"
          }));
        } else {
          setError("User not found.");
          setLoading(false);
          return;
        }

        // Fetch portfolio items
        const portfolioQuery = query(
          collection(db, "portfolio"),
          where("userId", "==", targetUid)
        );
        const portfolioSnapshot = await getDocs(portfolioQuery);
        const portfolioItems = portfolioSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProfileData((prev) => ({
          ...prev,
          portfolioItems: portfolioItems,
        }));

      } catch (err) {
        console.error("Error fetching user data:", err);
        if (err.code === 'permission-denied') {
          setError("This profile is private or restricted.");
        } else {
          setError("Failed to load profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchUserData();
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <p className={styles.loadingText}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.card} style={{ textAlign: 'center', padding: '3rem' }}>
            <h2 className={styles.cardTitle}>{error}</h2>
            <p style={{ color: '#9ca3af' }}>You may not have permission to view this profile.</p>
            <button
              className={`${styles.button} ${styles.primaryButton}`}
              style={{ marginTop: '1rem', maxWidth: '200px', marginInline: 'auto' }}
              onClick={() => window.location.hash = "#/home"}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getAvailabilityColor = (status) => {
    switch (status) {
      case "online": return "#10b981";
      case "busy": return "#ef4444";
      case "dnd": return "#f59e0b";
      case "offline": return "#6b7280";
      default: return "#10b981";
    }
  };

  const getAvailabilityLabel = (status) => {
    switch (status) {
      case "online": return "Online";
      case "busy": return "Busy";
      case "dnd": return "Do Not Disturb";
      case "offline": return "Offline";
      default: return "Online";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Header Section */}
        <div className={styles.header}>
          <img
            src={profileData.profilePicture}
            alt="Profile"
            className={styles.profilePicture}
          />
          <h1 className={styles.name}>{profileData.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: getAvailabilityColor(profileData.availability || 'online'),
              display: 'inline-block'
            }}></span>
            <span style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
              {getAvailabilityLabel(profileData.availability || 'online')}
            </span>
          </div>
          <p className={styles.email}>{profileData.email}</p>
          {user && (
            <div style={{ marginBottom: "1.5rem" }}>
              <AverageRating studentId={user ? user.uid : ""} size="large" />
            </div>
          )}
          <div className={styles.actionButtons}>
            {isOwnProfile && (
              <>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => (window.location.hash = "#/update-profile")}
                >
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
                <button
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={() => (window.location.hash = "#/upload-portfolio")}
                >
                  <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Portfolio
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainContent}>
          {/* Skills Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Skills
            </h2>
            <div className={styles.skillsList}>
              {profileData.skills.map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9" />
              </svg>
              Education
            </h2>
            <p className={styles.educationText}>{profileData.education}</p>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className={styles.card} style={{ marginTop: "2rem" }}>
          <h2 className={styles.cardTitle}>
            <svg className={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Portfolio
          </h2>
          {profileData.portfolioItems.length > 0 ? (
            <div className={styles.portfolioGrid}>
              {profileData.portfolioItems.map((item) => (
                <div
                  key={item.id}
                  className={styles.portfolioItem}
                >
                  {item.visibility === 'private' && !isOwnProfile ? (
                    <div className={styles.lockedItem}>
                      <div className={styles.lockedIcon}>
                        <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p>Private Project</p>
                    </div>
                  ) : (
                    <>
                      <img
                        src={item.image}
                        alt={item.title}
                        className={styles.portfolioImage}
                      />
                      <div className={styles.portfolioContent}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <h3 className={styles.portfolioTitle}>{item.title}</h3>
                          {item.visibility === 'private' && (
                            <span style={{ fontSize: '0.7rem', background: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>Private</span>
                          )}
                        </div>
                        <p className={styles.portfolioDescription}>{item.description}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No portfolio items yet. Upload your first project!</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        {user && (
          <div style={{ marginTop: "2rem" }}>
            <StudentReviews studentId={user.uid} />
          </div>
        )}

        {/* Payments Table Section */}
        {user && (
          <div style={{ marginTop: "2rem" }}>
            <PaymentsTable studentId={user.uid} />
          </div>
        )}
      </div>
    </div>
  );
}
