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
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async (currentUser) => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch user profile from Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setProfileData((prev) => ({
            ...prev,
            name: userData.name || "",
            email: currentUser.email || userData.email || "",
            skills: userData.skills || [],
            education: userData.education || "",
            profilePicture: userData.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
          }));
        } else {
          // If profile doesn't exist, use email from auth
          setProfileData((prev) => ({
            ...prev,
            email: currentUser.email || "",
          }));
        }

        // Fetch portfolio items from Firestore
        const portfolioQuery = query(
          collection(db, "portfolio"),
          where("userId", "==", currentUser.uid)
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
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserData(currentUser);
      } else {
        setLoading(false);
        // Redirect to login if not authenticated
        window.location.hash = "#/login";
      }
    });

    // Also fetch data when component mounts or route changes
    const currentUser = auth.currentUser;
    if (currentUser) {
      fetchUserData(currentUser);
    }

    return () => unsubscribe();
  }, []); // Re-fetch when component mounts

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <p className={styles.loadingText}>Loading profile...</p>
        </div>
      </div>
    );
  }

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
          <h1 style={styles.name}>{profileData.name}</h1>
          <p style={styles.email}>{profileData.email}</p>
          {user && (
            <div style={{ marginBottom: "1.5rem" }}>
              <AverageRating studentId={user.uid} size="large" />
            </div>
          )}
          <div style={styles.actionButtons}>
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
        <div style={{ ...styles.card, marginTop: "2rem" }}>
          <h2 style={styles.cardTitle}>
            <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                  <img
                    src={item.image}
                    alt={item.title}
                    className={styles.portfolioImage}
                  />
                  <div className={styles.portfolioContent}>
                    <h3 className={styles.portfolioTitle}>{item.title}</h3>
                    <p className={styles.portfolioDescription}>{item.description}</p>
                  </div>
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
