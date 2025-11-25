import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "../../styles/disputes.css";
import { auth } from "../../firebase";
import { getUserDisputes } from "../../backend/disputes";

export default function DisputeCenter() {
  const [user, setUser] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          setLoading(true);
          const data = await getUserDisputes(currentUser.uid);
          setDisputes(data);
        } catch (err) {
          setError(err.message || "Failed to load disputes.");
        } finally {
          setLoading(false);
        }
      } else {
        setDisputes([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const formatAmount = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(value) || 0);

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "Date unavailable";
    const date = timestamp.toDate
      ? timestamp.toDate()
      : timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : null;
    return date
      ? date.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Date unavailable";
  };

  if (!user) {
    return (
      <div className="dispute-page">
        <div className="dispute-content">
          <div className="dispute-card">
            <h2>Dispute Center</h2>
            <p>Please log in to view your disputes.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dispute-page">
      <div className="dispute-content">
        <div className="dispute-card">
          <h2>Dispute Center</h2>
          <p className="muted">
            Track every dispute you have opened. Admins will review submissions
            and update their status here.
          </p>
        </div>

        <div className="dispute-card">
          <h3>Your Disputes</h3>
          {loading && <p className="muted">Loading disputes...</p>}
          {error && <p className="dispute-status error">{error}</p>}
          {!loading && disputes.length === 0 && (
            <p className="muted">
              You have not raised any disputes yet. If an issue occurs with a
              job, submit a dispute from the job view.
            </p>
          )}
          {!loading && disputes.length > 0 && (
            <div className="dispute-list">
              {disputes.map((dispute) => (
                <div key={dispute.id} className="dispute-item">
                  <div className="dispute-header">
                    <div>
                      <strong>Job:</strong> {dispute.jobId || "Unknown"}
                    </div>
                    <span className={`badge ${dispute.status || "open"}`}>
                      {dispute.status || "open"}
                    </span>
                  </div>
                  <p className="muted">
                    Raised on {formatTimestamp(dispute.createdAt)} • Amount:{" "}
                    {formatAmount(dispute.amount)}
                  </p>
                  <div className="dispute-details">
                    <p>
                      <strong>Reason:</strong> {dispute.reason || "N/A"}
                    </p>
                    <p>{dispute.explanation || "No explanation provided."}</p>
                    <p className="muted">
                      Support resolution actions will appear here once an admin
                      reviews this dispute.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


