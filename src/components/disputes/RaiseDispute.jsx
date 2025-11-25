import React, { useState } from "react";
import "../../styles/disputes.css";
import { raiseDispute } from "../../backend/disputes";

const defaultReasons = [
  "Late delivery",
  "Quality issues",
  "Unresponsive freelancer",
  "Payment disagreement",
  "Other",
];

export default function RaiseDispute({
  jobId,
  senderId,
  receiverId,
  amount,
  onSubmitted,
}) {
  const [reason, setReason] = useState(defaultReasons[0]);
  const [explanation, setExplanation] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!jobId || !senderId || !receiverId) {
      setStatus({
        type: "error",
        message: "Missing dispute details. Please refresh and try again.",
      });
      return;
    }
    try {
      setSubmitting(true);
      await raiseDispute({
        jobId,
        senderId,
        receiverId,
        amount,
        reason,
        explanation,
      });
      setExplanation("");
      setReason(defaultReasons[0]);
      setStatus({ type: "success", message: "Dispute has been submitted." });
      onSubmitted?.();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Unable to raise dispute.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dispute-card">
      <h3>Raise a Dispute</h3>
      <p className="muted">
        If something didn’t go as planned, tell us what happened so the support
        team can review it.
      </p>
      <form className="dispute-form" onSubmit={handleSubmit}>
        <label htmlFor="dispute-reason">Reason</label>
        <select
          id="dispute-reason"
          className="dispute-select"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
        >
          {defaultReasons.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <label htmlFor="dispute-description">Description</label>
        <textarea
          id="dispute-description"
          className="dispute-textarea"
          placeholder="Describe the issue in detail..."
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          required
        />

        <div className="dispute-actions">
          <button
            className="primary-btn"
            type="submit"
            disabled={submitting || !explanation.trim()}
          >
            {submitting ? "Submitting..." : "Submit Dispute"}
          </button>
          {status.message && (
            <span className={`dispute-status ${status.type}`}>
              {status.message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}


