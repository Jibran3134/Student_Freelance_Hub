import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import styles from "./styles/users-page.module.css";

const ADMIN_EMAILS = [
  "alishba11@gmail.com",
  "jibran22@gmail.com",
  "umar33@gmail.com",
  "abdullah44@gmail.com"
];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    setLoading(true);

    let q;
    const usersRef = collection(db, "users");

    if (currentUser && ADMIN_EMAILS.includes(currentUser.email)) {
      // Admin sees all users
      q = query(usersRef);
    } else if (currentUser) {
      q = query(usersRef, where("visibility", "in", ["public", "students"]));
    } else {
      q = query(usersRef, where("visibility", "==", "public"));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const usersList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .filter((user) => !user.deletedByAdmin); // Filter out deleted users
        setUsers(usersList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError("Failed to load profiles. Please try again later.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const handleCardClick = (userId) => {
    window.location.hash = `#/profile?uid=${userId}`;
  };

  const getAvailabilityColor = (status) => {
    switch (status) {
      case "online": return "#10b981"; // Green
      case "busy": return "#ef4444";   // Red
      case "dnd": return "#f59e0b";    // Amber
      case "offline": return "#6b7280"; // Gray
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

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading profiles...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Explore Portfolios</h1>
        <p className={styles.subtitle}>
          Discover talented students and their work.
        </p>
      </div>

      {error ? (
        <div className={styles.error}>{error}</div>
      ) : users.length === 0 ? (
        <div className={styles.empty}>
          <p>No profiles found.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '1rem', color: '#6b7280' }}>
            Note: Private profiles are hidden.
            <br />
            If you don't see your profile, please <strong>log in</strong> and go to <strong>Update Profile</strong> to set your visibility to Public.
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {users.map((user) => (
            <div
              key={user.id}
              className={styles.card}
              onClick={() => handleCardClick(user.id)}
            >
              <div className={styles.cardHeader}>
                <img
                  src={
                    user.profilePicture ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format"
                  }
                  alt={user.name}
                  className={styles.avatar}
                />
                <div className={styles.userInfo}>
                  <h3 className={styles.userName}>{user.name || "Anonymous"}</h3>
                  <span className={styles.visibilityBadge}>
                    {user.visibility === "public" ? "Public" : user.visibility === "students" ? "Student Only" : "Private"}
                  </span>
                </div>
              </div>

              <div className={styles.cardBody}>
                {user.skills && user.skills.length > 0 ? (
                  <div className={styles.skills}>
                    {user.skills.slice(0, 3).map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                      </span>
                    ))}
                    {user.skills.length > 3 && (
                      <span className={styles.moreSkills}>+{user.skills.length - 3}</span>
                    )}
                  </div>
                ) : (
                  <p className={styles.noSkills}>No skills listed</p>
                )}

                <p className={styles.education}>
                  {user.education ? (
                    <>
                      <span className={styles.icon}>🎓</span> {user.education.substring(0, 30)}{user.education.length > 30 ? "..." : ""}
                    </>
                  ) : (
                    "Education not specified"
                  )}
                </p>

                <p style={{ fontSize: '0.85rem', color: getAvailabilityColor(user.availability), marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getAvailabilityColor(user.availability) }}></span>
                  {getAvailabilityLabel(user.availability)}
                </p>
              </div>

              <div className={styles.cardFooter}>
                <button className={styles.viewButton}>View Profile</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
