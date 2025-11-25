import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import "../../styles/withdraw.css";

const formatDate = (timestamp) => {
  if (!timestamp) return "Date unavailable";
  const date = timestamp.toDate
    ? timestamp.toDate()
    : timestamp.seconds
    ? new Date(timestamp.seconds * 1000)
    : null;
  if (!date) return "Date unavailable";
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function WithdrawHistory({ userId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const withdrawalsRef = collection(db, "withdraw_requests");
    const withdrawalsQuery = query(
      withdrawalsRef,
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      withdrawalsQuery,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          .sort((a, b) => {
            const timeA = a.timestamp?.toDate
              ? a.timestamp.toDate().getTime()
              : a.timestamp?.seconds
              ? a.timestamp.seconds * 1000
              : 0;
            const timeB = b.timestamp?.toDate
              ? b.timestamp.toDate().getTime()
              : b.timestamp?.seconds
              ? b.timestamp.seconds * 1000
              : 0;
            return timeB - timeA;
          });
        setRequests(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load withdrawal history.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return (
    <div className="withdraw-card">
      <h3>Withdrawal Requests</h3>

      {loading && <p className="withdraw-subtitle">Loading history...</p>}
      {error && <p className="withdraw-status error">{error}</p>}

      {!loading && requests.length === 0 && (
        <p className="withdraw-subtitle">
          No withdrawals yet. Once you cash out, the details will appear here.
        </p>
      )}

      {!loading && requests.length > 0 && (
        <div className="withdraw-history-list">
          {requests.map((request) => (
            <div key={request.id} className="withdraw-history-item">
              <div>
                <p className="withdraw-history-amount">
                  ${Number(request.amount || 0).toFixed(2)}
                </p>
                <p className="withdraw-history-method">
                  {request.method || "Method not specified"}
                </p>
              </div>
              <div className="withdraw-history-meta">
                <span className={`badge ${request.status || "pending"}`}>
                  {request.status || "pending"}
                </span>
                <span className="withdraw-history-date">
                  {formatDate(request.timestamp)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
