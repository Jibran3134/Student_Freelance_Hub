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
import styles from "./styles/payments-table.module.css";

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

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return styles.statusPaid;
      case "pending":
        return styles.statusPending;
      case "failed":
        return styles.statusFailed;
      default:
        return styles.statusUnknown;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Payments</h3>
        <div className={styles.loading}>Loading payments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Payments</h3>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Payments</h3>
      {payments.length === 0 ? (
        <div className={styles.noPayments}>
          <p className={styles.noPaymentsTitle}>
            No payments found
          </p>
          <p className={styles.noPaymentsText}>
            Payment history will appear here once transactions are recorded.
          </p>
        </div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Payment ID</th>
                <th className={styles.th}>Job ID</th>
                <th className={styles.th}>Amount</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td className={styles.td}>
                    <span className={styles.paymentId}>
                      {payment.paymentId || payment.id}
                    </span>
                  </td>
                  <td className={styles.td}>
                    <span className={styles.paymentId}>
                      {payment.jobId || "N/A"}
                    </span>
                  </td>
                  <td className={styles.td}>{formatAmount(payment.amount)}</td>
                  <td className={styles.td}>
                    <span className={`${styles.statusBadge} ${getStatusClass(payment.status)}`}>
                      {payment.status || "Unknown"}
                    </span>
                  </td>
                  <td className={styles.td}>{formatDate(payment.date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

