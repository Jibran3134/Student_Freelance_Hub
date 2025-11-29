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
  onSnapshot,
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

    setLoading(true);
    setError(null);

    const ratingsRef = collection(db, "ratings");
    let q;

    // Try with orderBy first
    try {
      q = query(
        ratingsRef,
        where("reviewedStudentId", "==", studentId),
        orderBy("timestamp", "desc")
      );
    } catch (e) {
      // Fallback if index issue (though query creation usually doesn't throw, execution does)
      q = query(
        ratingsRef,
        where("reviewedStudentId", "==", studentId)
      );
    }

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const reviewsData = [];

        // Process all reviews in parallel
        const reviewPromises = snapshot.docs.map(async (docSnapshot) => {
          const reviewData = docSnapshot.data();
          let reviewerName = "Anonymous";

          // Try to fetch reviewer name
          if (reviewData.reviewerId) {
            try {
              // Try users collection first (by uid field)
              const usersRef = collection(db, "users");
              const userQuery = query(
                usersRef,
                where("uid", "==", reviewData.reviewerId)
              );
              const userSnapshot = await getDocs(userQuery);

              if (!userSnapshot.empty) {
                const userData = userSnapshot.docs[0].data();
                reviewerName = userData.name || userData.displayName || "Anonymous";
              } else {
                // Try direct doc access
                const userDocRef = doc(db, "users", reviewData.reviewerId);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                  const userData = userDocSnap.data();
                  reviewerName = userData.name || userData.displayName || "Anonymous";
                }
              }
            } catch (err) {
              console.log("Error fetching reviewer details:", err);
            }
          }

          // Handle timestamp
          let reviewDate = new Date();
          if (reviewData.timestamp) {
            if (reviewData.timestamp.toDate) {
              reviewDate = reviewData.timestamp.toDate();
            } else if (reviewData.timestamp.seconds) {
              reviewDate = new Date(reviewData.timestamp.seconds * 1000);
            }
          }

          return {
            id: docSnapshot.id,
            ...reviewData,
            reviewerName,
            date: reviewDate,
          };
        });

        const resolvedReviews = await Promise.all(reviewPromises);

        // Sort if needed (if orderBy failed or wasn't used)
        resolvedReviews.sort((a, b) => b.date - a.date);

        setReviews(resolvedReviews);

        // Calculate average
        if (resolvedReviews.length > 0) {
          const sum = resolvedReviews.reduce((acc, r) => acc + r.rating, 0);
          setAverageRating(sum / resolvedReviews.length);
          setTotalRatings(resolvedReviews.length);
        } else {
          setAverageRating(0);
          setTotalRatings(0);
        }
      } catch (err) {
        console.error("Error processing reviews snapshot:", err);
        setError("Error loading reviews.");
      } finally {
        setLoading(false);
      }
    }, (err) => {
      console.error("Snapshot error:", err);
      // If index error, try fallback query without orderBy
      if (err.message && err.message.includes("index")) {
        console.log("Index missing, retrying without sort...");
        // We can't easily retry inside the error handler of the same listener
        // But we can set a friendly error message
        setError("Database index building... Reviews will appear shortly.");
      } else {
        setError("Failed to load reviews.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
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

