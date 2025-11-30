import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { deleteUser, signOut } from "firebase/auth";
import { updateDoc } from "firebase/firestore";
import styles from "./styles/profile-page.module.css";
import AverageRating from "./AverageRating";
import StudentReviews from "./StudentReviews";
import RateStudent from "./RateStudent";
import PaymentsTable from "./PaymentsTable";

const ADMIN_EMAILS = [
  "alishba11@gmail.com",
  "jibran22@gmail.com",
  "umar33@gmail.com",
  "abdullah44@gmail.com"
];

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    skills: [],
    education: "",
    profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
    portfolioItems: [],
    availability: "online",
    visibility: "public"
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUserData = async (currentUser) => {

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

      setTargetUserId(targetUid);

      const isOwn = currentUser && currentUser.uid === targetUid;
      const isUserAdmin = currentUser && ADMIN_EMAILS.includes(currentUser.email);

      setIsOwnProfile(isOwn);
      setIsAdmin(isUserAdmin);

      try {
        // Fetch User Data
        const userDocRef = doc(db, "users", targetUid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();

          // Fetch Portfolio Items
          const portfolioQuery = query(
            collection(db, "portfolio"),
            where("userId", "==", targetUid)
          );
          const portfolioSnapshot = await getDocs(portfolioQuery);
          const portfolioItems = portfolioSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));


          setProfileData({
            ...userData,
            portfolioItems: portfolioItems,
            profilePicture: userData.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format"
          });
        } else if (isUserAdmin && isOwn) {
          // If admin doesn't have a profile doc, just show default view
          // This allows admins to use the site without creating a student profile
          setProfileData({
            name: "Admin User",
            email: currentUser.email,
            skills: [],
            education: "",
            profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
            portfolioItems: [],
            availability: "online",
            visibility: "public"
          });
        } else {
          setError("User not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };


    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchUserData(user);
    });

    return () => unsubscribe();
  }, []);

  const handleDeletePortfolioItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this portfolio item?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "portfolio", itemId));
      setProfileData(prev => ({
        ...prev,
        portfolioItems: prev.portfolioItems.filter(item => item.id !== itemId)
      }));
      alert("Portfolio item deleted successfully");
    } catch (err) {
      console.error("Error deleting item:", err);
      alert("Failed to delete item");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.hash = "#/login";
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to log out");
    }
  };

  const handleDeleteProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    // Check if user signed in recently (within last 5 minutes)
    // This is to ensure deleteUser() doesn't fail with 'auth/requires-recent-login'
    // after we've already deleted the Firestore data.
    const lastSignInTime = new Date(user.metadata.lastSignInTime).getTime();
    const currentTime = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    if (currentTime - lastSignInTime > fiveMinutes) {
      alert("For security reasons, you must have recently signed in to delete your account. Please Logout and Login again, then try deleting immediately.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete your profile? This action cannot be undone and will remove all your data.")) {
      return;
    }

    try {
      // Delete User Data from Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // Delete Portfolio Items
      const portfolioQuery = query(
        collection(db, "portfolio"),
        where("userId", "==", user.uid)
      );
      const portfolioSnapshot = await getDocs(portfolioQuery);
      const deletePromises = portfolioSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete User Auth
      await deleteUser(user);

      alert("Profile deleted successfully.");
      window.location.hash = "#/";
    } catch (err) {
      console.error("Error deleting profile:", err);
      if (err.code === 'auth/requires-recent-login') {
        alert("For security reasons, please log out and log in again to delete your account.");
      } else {
        alert("Failed to delete profile: " + err.message);
      }
    }
  };

  const handleAdminDeleteUser = async () => {
    if (!window.confirm("ADMIN ACTION: Are you sure you want to delete this user? They will be blocked from logging in.")) {
      return;
    }

    try {
      // Mark user as deletedByAdmin in Firestore
      // We don't delete the doc immediately so we can show the specific message on login
      await updateDoc(doc(db, "users", targetUserId), {
        deletedByAdmin: true
      });

      // Optionally delete their portfolio items or other data here if needed
      // For now, we just mark them as deleted so they can't login

      alert("User has been deleted by admin.");
      window.location.hash = "#/users"; // Redirect to users list or home
    } catch (err) {
      console.error("Error deleting user:", err);
      alert("Failed to delete user: " + err.message);
    }
  };

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
          <div className={styles.emptyState}>{error}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.emptyState}>{error}</div>
        </div>
      </div>
    );
  }

  // Privacy Check
  if (!isOwnProfile && !isAdmin && profileData.visibility === 'private') {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={styles.emptyState}>
              <h2 className={styles.title}>Private Profile</h2>
              <p>This user's profile is set to private.</p>
            </div>
          </div>
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
            alt={profileData.name}
            className={styles.profilePicture}
          />
          <h1 className={styles.name}>{profileData.name || "Anonymous"}</h1>
          <p className={styles.email}>{profileData.email}</p>

          {/* Availability Badge */}
          <div style={{ marginBottom: '1rem' }}>
            <span style={{
              padding: '0.25rem 0.75rem',
              borderRadius: '9999px',
              backgroundColor: profileData.availability === 'online' ? '#10b981' : '#ef4444',
              color: 'white',
              fontSize: '0.875rem'
            }}>
              {profileData.availability === 'online' ? 'Online' : 'Busy'}
            </span>
          </div>

          <div className={styles.actionButtons}>
            {isOwnProfile || isAdmin ? (
              <>
                <button
                  className={`${styles.button} ${styles.primaryButton}`}
                  onClick={() => window.location.hash = `#/update-profile${!isOwnProfile ? `?uid=${targetUserId}` : ''}`}
                >
                  Edit Profile
                </button>
                {isOwnProfile && (
                  <button
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={() => window.location.hash = "#/upload-portfolio"}
                  >
                    Add Portfolio
                  </button>
                )}
                {isOwnProfile && (
                  <button
                    className={`${styles.button} ${styles.secondaryButton}`}
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                )}
                {(isOwnProfile || isAdmin) && (
                  <button
                    className={`${styles.button}`}
                    style={{ backgroundColor: '#ef4444', color: 'white', border: 'none' }}
                    onClick={isOwnProfile ? handleDeleteProfile : handleAdminDeleteUser}
                  >
                    {isOwnProfile ? "Delete Profile" : "Delete User (Admin)"}
                  </button>
                )}
              </>
            ) : (
              <button className={`${styles.button} ${styles.primaryButton}`}>
                Contact Me
              </button>
            )}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className={styles.mainContent}>
          {/* Left Column: Skills & Education */}
          <div>
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Skills</h2>
              <div className={styles.skillsList}>
                {profileData.skills && profileData.skills.length > 0 ? (
                  profileData.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>{skill}</span>
                  ))
                ) : (
                  <p style={{ color: '#9CA3AF' }}>No skills listed</p>
                )}
              </div>
            </div>

            <div className={`${styles.card} ${styles.sectionMargin}`}>
              <h2 className={styles.cardTitle}>Education</h2>
              <p className={styles.educationText}>
                {profileData.education || "No education details added"}
              </p>
            </div>

            {/* Rating Section */}
            {targetUserId && (
              <div className={`${styles.card} ${styles.sectionMargin}`}>
                <h2 className={styles.cardTitle}>Rating</h2>
                <AverageRating studentId={targetUserId} />
              </div>
            )}
          </div>

          {/* Right Column: Portfolio */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Portfolio</h2>
            {profileData.portfolioItems && profileData.portfolioItems.length > 0 ? (
              <div className={styles.portfolioGrid}>
                {profileData.portfolioItems.map((item) => (
                  <div key={item.id} className={styles.portfolioItem}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className={styles.portfolioImage}
                    />
                    <div className={styles.portfolioContent}>
                      <h3 className={styles.portfolioTitle}>{item.title}</h3>
                      <p className={styles.portfolioDescription}>{item.description}</p>
                      {isOwnProfile && (
                        <button
                          className={styles.deleteButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePortfolioItem(item.id);
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No portfolio items yet.</p>
                {isOwnProfile && <p>Upload your first project!</p>}
              </div>
            )}
          </div>
        </div>

        {/* Rate Student Section */}
        {targetUserId && !isOwnProfile && (
          <RateStudent studentId={targetUserId} />
        )}

        {/* Reviews Section */}
        {targetUserId && (
          <div style={{ marginTop: "2rem" }}>
            <StudentReviews studentId={targetUserId} />
          </div>
        )}

        {/* Payments Table Section */}
        {targetUserId && isOwnProfile && (
          <div style={{ marginTop: "2rem" }}>
            <PaymentsTable studentId={targetUserId} />
          </div>
        )}
      </div>
    </div>
  );
}
