import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

/**
 * PaymentsTable Component
 * Displays all payments for a specific student in a table format
 * 
 * Props:
 * - studentId: The ID of the student whose payments to display (required)
 */
export default function PaymentsTable({ studentId }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) {
      setLoading(false);
      return;
    }

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);

        const paymentsRef = collection(db, "payments");
        
        // Try with orderBy first, fallback to without orderBy if index doesn't exist
        let querySnapshot;
        try {
          const q = query(
            paymentsRef,
            where("studentId", "==", studentId),
            orderBy("date", "desc")
          );
          querySnapshot = await getDocs(q);
        } catch (indexError) {
          // If index doesn't exist, fetch without orderBy and sort in JavaScript
          console.log("Index not found, fetching without orderBy:", indexError);
          const q = query(
            paymentsRef,
            where("studentId", "==", studentId)
          );
          querySnapshot = await getDocs(q);
        }

        const paymentsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by date descending if we didn't use orderBy
        paymentsData.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate().getTime() : 
                       a.date?.seconds ? a.date.seconds * 1000 : 0;
          const dateB = b.date?.toDate ? b.date.toDate().getTime() : 
                       b.date?.seconds ? b.date.seconds * 1000 : 0;
          return dateB - dateA; // Descending order (newest first)
        });

        setPayments(paymentsData);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError("Failed to load payments. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();

    // Set up real-time listener for updates
    const paymentsRef = collection(db, "payments");
    const q = query(paymentsRef, where("studentId", "==", studentId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const paymentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort by date descending
        paymentsData.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate().getTime() : 
                       a.date?.seconds ? a.date.seconds * 1000 : 0;
          const dateB = b.date?.toDate ? b.date.toDate().getTime() : 
                       b.date?.seconds ? b.date.seconds * 1000 : 0;
          return dateB - dateA;
        });

        setPayments(paymentsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error in payments listener:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [studentId]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    try {
      let dateObj;
      if (date.toDate) {
        dateObj = date.toDate();
      } else if (date.seconds) {
        dateObj = new Date(date.seconds * 1000);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        return "Invalid date";
      }
      return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(dateObj);
    } catch (err) {
      return "Invalid date";
    }
  };

  const formatAmount = (amount) => {
    if (typeof amount === "number") {
      return `$${amount.toFixed(2)}`;
    }
    return amount || "N/A";
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "#10b981"; // green
      case "pending":
        return "#f59e0b"; // yellow/amber
      case "failed":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const styles = {
    container: {
      maxWidth: "1000px",
      margin: "2rem auto",
      padding: "2rem",
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
    tableContainer: {
      overflowX: "auto",
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      minWidth: "600px",
    },
    thead: {
      background: "rgba(255, 255, 255, 0.05)",
    },
    th: {
      padding: "1rem",
      textAlign: "left",
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#9CA3AF",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    },
    td: {
      padding: "1rem",
      borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
      color: "#D1D5DB",
      fontSize: "0.95rem",
    },
    statusBadge: {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "12px",
      fontSize: "0.875rem",
      fontWeight: 600,
      textTransform: "capitalize",
    },
    noPayments: {
      textAlign: "center",
      padding: "3rem",
      color: "#9CA3AF",
    },
    paymentId: {
      fontFamily: "monospace",
      fontSize: "0.85rem",
      color: "#8B5CF6",
    },
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Payments</h3>
        <div style={styles.loading}>Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Payments</h3>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Payments</h3>
      {payments.length === 0 ? (
        <div style={styles.noPayments}>
          <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
            No payments found
          </p>
          <p style={{ fontSize: "0.9rem" }}>
            Payment history will appear here once transactions are recorded.
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Payment ID</th>
                <th style={styles.th}>Job ID</th>
                <th style={styles.th}>Amount</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td style={styles.td}>
                    <span style={styles.paymentId}>
                      {payment.paymentId || payment.id}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.paymentId}>
                      {payment.jobId || "N/A"}
                    </span>
                  </td>
                  <td style={styles.td}>{formatAmount(payment.amount)}</td>
                  <td style={styles.td}>
                    <span
                      style={{
                        ...styles.statusBadge,
                        background: `${getStatusColor(payment.status)}20`,
                        color: getStatusColor(payment.status),
                      }}
                    >
                      {payment.status || "Unknown"}
                    </span>
                  </td>
                  <td style={styles.td}>{formatDate(payment.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

