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
import styles from "./styles/student-reviews.module.css";

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
      <div className={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`${styles.star} ${star <= rating ? styles.starFilled : styles.starEmpty}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {showAverageRating && totalRatings > 0 && (
        <div className={styles.averageRatingContainer}>
          <div className={styles.averageRating}>
            ★ {averageRating.toFixed(1)} / 5
          </div>
          <div className={styles.averageRatingText}>Average Rating</div>
          <div className={styles.totalRatings}>
            Based on {totalRatings} review{totalRatings !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      <h3 className={styles.title}>
        Reviews {totalRatings > 0 && `(${totalRatings})`}
      </h3>

      {reviews.length === 0 ? (
        <div className={styles.noReviews}>
          <p className={styles.noReviewsTitle}>
            No reviews yet
          </p>
          <p className={styles.noReviewsText}>
            This student hasn't received any ratings yet.
          </p>
        </div>
      ) : (
        <div>
          {reviews.map((review) => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewerInfo}>
                  <div className={styles.reviewerName}>{review.reviewerName}</div>
                  <div className={styles.reviewDate}>
                    {formatDate(review.date)}
                  </div>
                </div>
                <div className={styles.reviewRating}>
                  {renderStars(review.rating)}
                  <span className={styles.ratingValue}>{review.rating}/5</span>
                </div>
              </div>
              {review.comment && (
                <div className={styles.reviewComment}>{review.comment}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

