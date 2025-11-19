import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import styles from "./styles/average-rating.module.css";

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

  const getSizeClass = (sizeType) => {
    const sizeMap = {
      small: "Small",
      medium: "Medium",
      large: "Large",
    };
    return sizeMap[size] || sizeMap.medium;
  };

  const ratingSizeClass = `rating${getSizeClass(size)}`;
  const starSizeClass = `star${getSizeClass(size)}`;
  const textSizeClass = `text${getSizeClass(size)}`;

  if (loading) {
    return <span className={`${styles.loading} ${styles[textSizeClass]}`}>Loading rating...</span>;
  }

  if (totalRatings === 0) {
    return (
      <div className={styles.container}>
        <span className={`${styles.text} ${styles[textSizeClass]}`}>No ratings yet</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.rating} ${styles[ratingSizeClass]}`}>
        <span className={`${styles.star} ${styles[starSizeClass]}`}>★</span>
        <span>{averageRating.toFixed(1)}</span>
        <span className={styles.ratingFraction}>/ 5</span>
      </div>
      {showTotalCount && (
        <span className={`${styles.text} ${styles[textSizeClass]}`}>
          ({totalRatings} review{totalRatings !== 1 ? "s" : ""})
        </span>
      )}
    </div>
  );
}

