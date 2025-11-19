import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";

/**
 * StudentReviews Component
 * Displays all reviews for a specific student
 * 
 * Props:
 * - studentId: The ID of the student whose reviews to display (required)
 * - showAverageRating: Whether to show average rating at the top (default: true)
 */
export default function StudentReviews({
  studentId,
  showAverageRating = true,
}) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);

        const ratingsRef = collection(db, "ratings");
        
        // Try with orderBy first, fallback to without orderBy if index doesn't exist
        let querySnapshot;
        try {
          const q = query(
            ratingsRef,
            where("reviewedStudentId", "==", studentId),
            orderBy("timestamp", "desc")
          );
          querySnapshot = await getDocs(q);
        } catch (indexError) {
          // If index doesn't exist, fetch without orderBy and sort in JavaScript
          console.log("Index not found, fetching without orderBy:", indexError);
          const q = query(
            ratingsRef,
            where("reviewedStudentId", "==", studentId)
          );
          querySnapshot = await getDocs(q);
        }
        
        const reviewsData = [];

        // Fetch reviewer names from users collection (if available)
        for (const doc of querySnapshot.docs) {
          const reviewData = doc.data();
          let reviewerName = "Anonymous";

          // Try to fetch reviewer name from users collection
          try {
            const usersRef = collection(db, "users");
            const userQuery = query(
              usersRef,
              where("uid", "==", reviewData.reviewerId)
            );
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              reviewerName =
                userData.name ||
                userData.displayName ||
                userData.email?.split("@")[0] ||
                "Anonymous";
            } else {
              // Try direct document access using reviewerId as document ID
              const userDocRef = doc(db, "users", reviewData.reviewerId);
              const userDocSnap = await getDoc(userDocRef);
              if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                reviewerName =
                  userData.name ||
                  userData.displayName ||
                  userData.email?.split("@")[0] ||
                  "Anonymous";
              }
            }
          } catch (err) {
            // If users collection doesn't exist or has different structure,
            // fall back to reviewerId or anonymous
            console.log("Could not fetch reviewer name:", err);
          }

          // Handle timestamp conversion
          let reviewDate = new Date();
          if (reviewData.timestamp) {
            if (reviewData.timestamp.toDate) {
              reviewDate = reviewData.timestamp.toDate();
            } else if (reviewData.timestamp.seconds) {
              reviewDate = new Date(reviewData.timestamp.seconds * 1000);
            } else if (reviewData.timestamp instanceof Date) {
              reviewDate = reviewData.timestamp;
            }
          }

          reviewsData.push({
            id: doc.id,
            ...reviewData,
            reviewerName,
            date: reviewDate,
          });
        }

        // Sort by date descending if we didn't use orderBy
        reviewsData.sort((a, b) => {
          const dateA = a.date.getTime ? a.date.getTime() : 0;
          const dateB = b.date.getTime ? b.date.getTime() : 0;
          return dateB - dateA; // Descending order (newest first)
        });

        setReviews(reviewsData);

        // Calculate average rating
        if (reviewsData.length > 0) {
          const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
          const average = sum / reviewsData.length;
          setAverageRating(average);
          setTotalRatings(reviewsData.length);
        } else {
          setAverageRating(0);
          setTotalRatings(0);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        // Check if it's a permission error or index error
        if (err.code === "permission-denied") {
          setError("You don't have permission to view reviews.");
        } else if (err.code === "failed-precondition") {
          // This usually means the index doesn't exist, but we should have handled it
          setError("Please wait while we set up the database. Try refreshing the page.");
        } else if (err.message && err.message.includes("index")) {
          setError("Database index is being created. Please try again in a moment.");
        } else {
          setError("Failed to load reviews. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [studentId]);

  const formatDate = (date) => {
    if (!date) return "Date not available";
    try {
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (err) {
      return "Invalid date";
    }
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: "flex", gap: "0.25rem" }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            style={{
              color: star <= rating ? "#FFD700" : "#6B7280",
              fontSize: "1.2rem",
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const styles = {
    container: {
      maxWidth: "800px",
      margin: "2rem auto",
      padding: "2rem",
    },
    averageRatingContainer: {
      textAlign: "center",
      padding: "2rem",
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      marginBottom: "2rem",
    },
    averageRating: {
      fontSize: "3rem",
      fontWeight: 700,
      color: "#FFD700",
      marginBottom: "0.5rem",
    },
    averageRatingText: {
      fontSize: "1.2rem",
      color: "#9CA3AF",
      marginBottom: "0.5rem",
    },
    totalRatings: {
      fontSize: "0.9rem",
      color: "#6B7280",
    },
    title: {
      fontSize: "1.8rem",
      fontWeight: 700,
      marginBottom: "1.5rem",
      color: "#E5E7EB",
    },
    loading: {
      textAlign: "center",
      padding: "2rem",
      color: "#9CA3AF",
    },
    error: {
      textAlign: "center",
      padding: "2rem",
      color: "#fca5a5",
      background: "rgba(239, 68, 68, 0.1)",
      borderRadius: "12px",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    noReviews: {
      textAlign: "center",
      padding: "3rem",
      color: "#9CA3AF",
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    },
    reviewCard: {
      padding: "1.5rem",
      marginBottom: "1rem",
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      transition: "transform 0.2s, box-shadow 0.2s",
    },
    reviewHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "1rem",
      flexWrap: "wrap",
      gap: "1rem",
    },
    reviewerInfo: {
      flex: 1,
    },
    reviewerName: {
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#E5E7EB",
      marginBottom: "0.25rem",
    },
    reviewDate: {
      fontSize: "0.85rem",
      color: "#6B7280",
    },
    reviewRating: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    ratingValue: {
      fontSize: "1.1rem",
      fontWeight: 600,
      color: "#FFD700",
    },
    reviewComment: {
      color: "#D1D5DB",
      lineHeight: "1.6",
      fontSize: "0.95rem",
      marginTop: "1rem",
      paddingTop: "1rem",
      borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {showAverageRating && totalRatings > 0 && (
        <div style={styles.averageRatingContainer}>
          <div style={styles.averageRating}>
            ★ {averageRating.toFixed(1)} / 5
          </div>
          <div style={styles.averageRatingText}>Average Rating</div>
          <div style={styles.totalRatings}>
            Based on {totalRatings} review{totalRatings !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      <h3 style={styles.title}>
        Reviews {totalRatings > 0 && `(${totalRatings})`}
      </h3>

      {reviews.length === 0 ? (
        <div style={styles.noReviews}>
          <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            No reviews yet
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            This student hasn't received any ratings yet.
          </p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review.id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.reviewerInfo}>
                  <div style={styles.reviewerName}>{review.reviewerName}</div>
                  <div style={styles.reviewDate}>
                    {formatDate(review.date)}
                  </div>
                </div>
                <div style={styles.reviewRating}>
                  {renderStars(review.rating)}
                  <span style={styles.ratingValue}>{review.rating}/5</span>
                </div>
              </div>
              {review.comment && (
                <div style={styles.reviewComment}>{review.comment}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

