import React, { useEffect, useState } from "react";
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
  const [jobIdInput, setJobIdInput] = useState(jobId || "");
  const [receiverIdInput, setReceiverIdInput] = useState(receiverId || "");
  const [amountInput, setAmountInput] = useState(amount ? String(amount) : "");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (jobId) setJobIdInput(jobId);
    if (receiverId) setReceiverIdInput(receiverId);
    if (amount) setAmountInput(String(amount));
  }, [jobId, receiverId, amount]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const resolvedJobId = jobId || jobIdInput.trim();
    const resolvedReceiver = receiverId || receiverIdInput.trim();
    const resolvedAmount = amount || amountInput;

    const newErrors = {};
    if (!senderId) {
      newErrors.sender = "Please log in to raise a dispute.";
    }
    if (!resolvedJobId) {
      newErrors.jobId = "Job ID is required.";
    }
    if (!resolvedReceiver) {
      newErrors.receiverId = "Receiver ID is required.";
    }
    if (!resolvedAmount || Number(resolvedAmount) <= 0) {
      newErrors.amount = "Enter a valid amount.";
    }
    if (!explanation.trim()) {
      newErrors.explanation = "Please describe the issue.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setStatus({
        type: "error",
        message: "Please fix the highlighted fields.",
      });
      return;
    }
    setErrors({});

    try {
      setSubmitting(true);
      await raiseDispute({
        jobId: resolvedJobId,
        senderId,
        receiverId: resolvedReceiver,
        amount: resolvedAmount,
        reason,
        explanation,
      });
      if (!jobId) setJobIdInput("");
      if (!receiverId) setReceiverIdInput("");
      if (!amount) setAmountInput("");
      setExplanation("");
      setReason(defaultReasons[0]);
      setStatus({ type: "success", message: "Dispute submitted successfully." });
      onSubmitted?.();
    } catch (error) {
      console.error("Dispute Error:", error);
      let errorMessage = "Unable to raise dispute.";

      if (error.code === "permission-denied") {
        errorMessage = "Permission denied. Please ensure you are logged in and authorized.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setStatus({
        type: "error",
        message: errorMessage,
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
        {!jobId && (
          <>
            <label htmlFor="dispute-job-id">Job ID</label>
            <input
              id="dispute-job-id"
              className={`dispute-input ${errors.jobId ? "input-error" : ""
                }`}
              value={jobIdInput}
              onChange={(event) => setJobIdInput(event.target.value)}
              placeholder="Enter job reference"
            />
            {errors.jobId && <span className="error-text">{errors.jobId}</span>}
          </>
        )}

        {!receiverId && (
          <>
            <label htmlFor="dispute-receiver-id">
              Freelancer / Receiver ID
            </label>
            <input
              id="dispute-receiver-id"
              className={`dispute-input ${errors.receiverId ? "input-error" : ""
                }`}
              value={receiverIdInput}
              onChange={(event) => setReceiverIdInput(event.target.value)}
              placeholder="Enter the other party's user ID"
            />
            {errors.receiverId && (
              <span className="error-text">{errors.receiverId}</span>
            )}
          </>
        )}

        {!amount && (
          <>
            <label htmlFor="dispute-amount">Amount (USD)</label>
            <input
              type="number"
              min="1"
              step="0.01"
              id="dispute-amount"
              className={`dispute-input ${errors.amount ? "input-error" : ""
                }`}
              value={amountInput}
              onChange={(event) => setAmountInput(event.target.value)}
              placeholder="Amount in dispute"
            />
            {errors.amount && (
              <span className="error-text">{errors.amount}</span>
            )}
          </>
        )}

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
          className={`dispute-textarea ${errors.explanation ? "input-error" : ""
            }`}
          placeholder="Describe the issue in detail..."
          value={explanation}
          onChange={(event) => setExplanation(event.target.value)}
          required
        />
        {errors.explanation && (
          <span className="error-text">{errors.explanation}</span>
        )}

        <div className="dispute-actions">
          <button
            className="primary-btn"
            type="submit"
            disabled={submitting}
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


