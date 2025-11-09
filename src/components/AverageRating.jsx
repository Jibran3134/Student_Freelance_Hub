import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";

/**
 * AverageRating Component
 * Displays the average rating for a specific student
 * Automatically updates when new ratings are added
 * 
 * Props:
 * - studentId: The ID of the student whose average rating to display (required)
 * - showTotalCount: Whether to show total number of ratings (default: true)
 * - size: Size of the rating display - "small", "medium", or "large" (default: "medium")
 */
export default function AverageRating({
  studentId,
  showTotalCount = true,
  size = "medium",
}) {
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    // Set up real-time listener for updates using onSnapshot
    const ratingsRef = collection(db, "ratings");
    const q = query(ratingsRef, where("reviewedStudentId", "==", studentId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const reviews = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (reviews.length > 0) {
          const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
          const average = sum / reviews.length;
          setAverageRating(average);
          setTotalRatings(reviews.length);
        } else {
          setAverageRating(0);
          setTotalRatings(0);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error in rating listener:", error);
        setAverageRating(0);
        setTotalRatings(0);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  const sizeStyles = {
    small: {
      fontSize: "1.2rem",
      starSize: "1rem",
      textSize: "0.85rem",
    },
    medium: {
      fontSize: "1.8rem",
      starSize: "1.3rem",
      textSize: "1rem",
    },
    large: {
      fontSize: "2.5rem",
      starSize: "1.8rem",
      textSize: "1.2rem",
    },
  };

  const currentSize = sizeStyles[size] || sizeStyles.medium;

  const styles = {
    container: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.75rem",
      flexWrap: "wrap",
    },
    rating: {
      fontSize: currentSize.fontSize,
      fontWeight: 700,
      color: "#FFD700",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    star: {
      fontSize: currentSize.starSize,
      color: "#FFD700",
    },
    text: {
      fontSize: currentSize.textSize,
      color: "#9CA3AF",
    },
    loading: {
      fontSize: currentSize.textSize,
      color: "#6B7280",
    },
  };

  if (loading) {
    return <span style={styles.loading}>Loading rating...</span>;
  }

  if (totalRatings === 0) {
    return (
      <div style={styles.container}>
        <span style={styles.text}>No ratings yet</span>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.rating}>
        <span style={styles.star}>★</span>
        <span>{averageRating.toFixed(1)}</span>
        <span style={{ color: "#6B7280", fontSize: "0.7em" }}>/ 5</span>
      </div>
      {showTotalCount && (
        <span style={styles.text}>
          ({totalRatings} review{totalRatings !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}

