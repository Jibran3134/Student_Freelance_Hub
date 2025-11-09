
import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
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

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
      padding: "2rem 1rem",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    content: {
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      padding: "2.5rem",
      marginBottom: "2rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
    },
    profilePicture: {
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "5px solid #8B5CF6",
      boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
      marginBottom: "1.5rem",
    },
    name: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#F9FAFB",
      marginBottom: "0.5rem",
    },
    email: {
      fontSize: "1rem",
      color: "#9CA3AF",
      marginBottom: "1.5rem",
    },
    actionButtons: {
      display: "flex",
      gap: "1rem",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: "12px",
      fontSize: "0.95rem",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      color: "#ffffff",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
    },
    secondaryButton: {
      background: "rgba(255,255,255,0.03)",
      color: "#8B5CF6",
      border: "1px solid #8B5CF6",
    },
    mainContent: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "2rem",
    },
    card: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      padding: "2rem",
    },
    cardTitle: {
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#F3F4F6",
      marginBottom: "1.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    skillsList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
    },
    skillTag: {
      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      color: "#ffffff",
      padding: "0.5rem 1rem",
      borderRadius: "20px",
      fontSize: "0.875rem",
      fontWeight: 600,
    },
    educationText: {
      fontSize: "1rem",
      color: "#D1D5DB",
      lineHeight: "1.6",
    },
    portfolioGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
      gap: "1.5rem",
      marginTop: "1rem",
    },
    portfolioItem: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px",
      overflow: "hidden",
      transition: "all 0.3s ease",
      cursor: "pointer",
    },
    portfolioImage: {
      width: "100%",
      height: "180px",
      objectFit: "cover",
    },
    portfolioContent: {
      padding: "1rem",
    },
    portfolioTitle: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#F3F4F6",
      marginBottom: "0.5rem",
    },
    portfolioDescription: {
      fontSize: "0.875rem",
      color: "#9CA3AF",
      lineHeight: "1.5",
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "#6B7280",
    },
    icon: {
      width: "24px",
      height: "24px",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.content, textAlign: "center", padding: "4rem 1rem" }}>
          <p style={{ fontSize: "1.2rem", color: "#9CA3AF" }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header Section */}
        <div style={styles.header}>
          <img
            src={profileData.profilePicture}
            alt="Profile"
            style={styles.profilePicture}
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
              style={{ ...styles.button, ...styles.primaryButton }}
              onClick={() => (window.location.hash = "#/update-profile")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.4)";
              }}
            >
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </button>
            <button
              style={{ ...styles.button, ...styles.secondaryButton }}
              onClick={() => (window.location.hash = "#/upload-portfolio")}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Portfolio
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={styles.mainContent}>
          {/* Skills Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Skills
            </h2>
            <div style={styles.skillsList}>
              {profileData.skills.map((skill, index) => (
                <span key={index} style={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education Card */}
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>
              <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v9M4 9v9a2 2 0 002 2h12a2 2 0 002-2V9" />
              </svg>
              Education
            </h2>
            <p style={styles.educationText}>{profileData.education}</p>
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
            <div style={styles.portfolioGrid}>
              {profileData.portfolioItems.map((item) => (
                <div
                  key={item.id}
                  style={styles.portfolioItem}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "0 10px 25px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={styles.portfolioImage}
                  />
                  <div style={styles.portfolioContent}>
                    <h3 style={styles.portfolioTitle}>{item.title}</h3>
                    <p style={styles.portfolioDescription}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
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
