import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

/**
 * RateStudent Component
 * Allows a student to rate another student after a completed job
 * 
 * Props:
 * - studentId: The ID of the student being rated (required) - maps to reviewedStudentId
 * - jobId: The ID of the completed job (required)
 * - reviewerId: Optional - will use auth.currentUser.uid if not provided
 * - onRatingSubmitted: Optional callback function called after successful submission
 */
export default function RateStudent({ studentId, jobId = "general", reviewerId, onRatingSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [hasRated, setHasRated] = useState(false);
  const [currentReviewerId, setCurrentReviewerId] = useState(null);

  // Check if current user has already rated this job/student
  useEffect(() => {
    const checkExistingRating = async () => {
      if (!auth.currentUser || !studentId) return;

      const currentUserId = auth.currentUser.uid;
      setCurrentReviewerId(currentUserId);

      try {
        const ratingsRef = collection(db, "ratings");
        const q = query(
          ratingsRef,
          where("jobId", "==", jobId),
          where("reviewedStudentId", "==", studentId),
          where("reviewerId", "==", currentUserId)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setHasRated(true);
          const existingRating = querySnapshot.docs[0].data();
          setRating(existingRating.rating);
          setComment(existingRating.comment || "");
          setMessage({
            type: "info",
            text: jobId === "general"
              ? "You have already reviewed this profile. You can update your review."
              : "You have already rated this job. You can update your rating.",
          });
        }
      } catch (error) {
        console.error("Error checking existing rating:", error);
      }
    };

    checkExistingRating();
  }, [jobId, studentId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!auth.currentUser) {
      setMessage({ type: "error", text: "Please log in to submit a rating." });
      return;
    }

    if (rating === 0) {
      setMessage({ type: "error", text: "Please select a rating." });
      return;
    }

    if (!studentId) {
      setMessage({
        type: "error",
        text: "Missing required information (student ID).",
      });
      return;
    }

    setIsSubmitting(true);
    setMessage({ type: "", text: "" });

    try {
      const currentUserId = auth.currentUser.uid;

      // Check again for existing rating to update or create new
      const ratingsRef = collection(db, "ratings");
      const q = query(
        ratingsRef,
        where("jobId", "==", jobId),
        where("reviewedStudentId", "==", studentId),
        where("reviewerId", "==", currentUserId)
      );
      const querySnapshot = await getDocs(q);

      const ratingData = {
        jobId,
        reviewedStudentId: studentId, // Using reviewedStudentId as per requirements
        reviewerId: reviewerId || currentUserId,
        rating,
        comment: comment.trim(),
        timestamp: serverTimestamp(),
      };

      if (!querySnapshot.empty) {
        // Update existing rating
        const existingRatingDoc = querySnapshot.docs[0];
        const ratingDocRef = doc(db, "ratings", existingRatingDoc.id);
        await updateDoc(ratingDocRef, {
          rating,
          comment: comment.trim(),
          timestamp: serverTimestamp(),
        });
      } else {
        // Create new rating
        await addDoc(ratingsRef, ratingData);
      }

      setMessage({
        type: "success",
        text: "Review submitted successfully!",
      });
      setHasRated(true);

      // Reset form after a delay
      setTimeout(() => {
        setComment("");
        setMessage({ type: "", text: "" });
      }, 3000);

      // Call optional callback
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      setMessage({
        type: "error",
        text: "Failed to submit rating. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    container: {
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "2rem",
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    },
    title: {
      fontSize: "1.5rem",
      fontWeight: 700,
      marginBottom: "1.5rem",
      color: "#E5E7EB",
    },
    starContainer: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "1.5rem",
      justifyContent: "center",
    },
    star: {
      fontSize: "2rem",
      cursor: "pointer",
      transition: "transform 0.2s",
      color: "#FFD700",
    },
    starHover: {
      transform: "scale(1.2)",
    },
    starEmpty: {
      color: "#6B7280",
    },
    textarea: {
      width: "100%",
      minHeight: "120px",
      padding: "0.75rem",
      marginBottom: "1rem",
      background: "rgba(0, 0, 0, 0.3)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      borderRadius: "8px",
      color: "#E5E7EB",
      fontSize: "1rem",
      fontFamily: "inherit",
      resize: "vertical",
    },
    button: {
      width: "100%",
      padding: "0.75rem 1.5rem",
      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: isSubmitting ? "not-allowed" : "pointer",
      opacity: isSubmitting ? 0.6 : 1,
      transition: "all 0.3s ease",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
    },
    message: {
      padding: "0.75rem",
      borderRadius: "8px",
      marginBottom: "1rem",
      textAlign: "center",
    },
    messageSuccess: {
      background: "rgba(34, 197, 94, 0.2)",
      color: "#86efac",
      border: "1px solid rgba(34, 197, 94, 0.3)",
    },
    messageError: {
      background: "rgba(239, 68, 68, 0.2)",
      color: "#fca5a5",
      border: "1px solid rgba(239, 68, 68, 0.3)",
    },
    messageInfo: {
      background: "rgba(59, 130, 246, 0.2)",
      color: "#93c5fd",
      border: "1px solid rgba(59, 130, 246, 0.3)",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      color: "#D1D5DB",
      fontSize: "0.9rem",
      fontWeight: 600,
    },
  };

  if (!auth.currentUser) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#9CA3AF", textAlign: "center" }}>
          Please log in to rate this student.
        </p>
      </div>
    );
  }

  if (auth.currentUser.uid === studentId) {
    return (
      <div style={styles.container}>
        <p style={{ color: "#9CA3AF", textAlign: "center" }}>
          You cannot rate yourself.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>
        {hasRated ? "Update Your Rating" : "Rate This Student"}
      </h3>

      {message.text && (
        <div
          style={{
            ...styles.message,
            ...(message.type === "success"
              ? styles.messageSuccess
              : message.type === "error"
                ? styles.messageError
                : styles.messageInfo),
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div>
          <label style={styles.label}>Rating (1-5 stars)</label>
          <div style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                style={{
                  ...styles.star,
                  ...(star <= (hoveredRating || rating)
                    ? {}
                    : styles.starEmpty),
                  ...(star <= hoveredRating ? styles.starHover : {}),
                }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setRating(star);
                  }
                }}
                aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
          {rating > 0 && (
            <p style={{ textAlign: "center", color: "#9CA3AF", marginTop: "0.5rem" }}>
              {rating} star{rating !== 1 ? "s" : ""} selected
            </p>
          )}
        </div>

        <div>
          <label htmlFor="comment" style={styles.label}>
            Comment (Optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience..."
            style={styles.textarea}
            maxLength={500}
          />
          <p style={{ fontSize: "0.85rem", color: "#6B7280", textAlign: "right" }}>
            {comment.length}/500
          </p>
        </div>

        <button type="submit" disabled={isSubmitting} style={styles.button}>
          {isSubmitting
            ? "Submitting..."
            : hasRated
              ? "Update Rating"
              : "Submit Rating"}
        </button>
      </form>
    </div>
  );
}

