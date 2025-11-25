import React, { useState } from "react";
import "../../styles/payments.css";
import { releasePayment } from "../../backend/payments";

export default function ReleasePayment({
  jobId,
  payerId,
  receiverId,
  amount,
  onSuccess,
}) {
  const [status, setStatus] = useState({ type: "", message: "" });
  const [processing, setProcessing] = useState(false);

  const handleRelease = async () => {
    try {
      setProcessing(true);
      setStatus({ type: "", message: "" });
      await releasePayment(jobId, payerId, receiverId, amount);
      setStatus({
        type: "success",
        message: "Payment released successfully.",
      });
      onSuccess?.();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to release payment.",
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="release-payment-card">
      <h3>Release Payment</h3>
      <p>
        Funds will be transferred from the employer wallet to the freelancer for
        job <span className="payment-highlight">{jobId || "N/A"}</span>.
      </p>
      <p>
        Amount to release:{" "}
        <span className="payment-highlight">
          {new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
          }).format(Number(amount) || 0)}
        </span>
      </p>
      <div className="release-actions">
        <button
          className="primary-btn"
          onClick={handleRelease}
          disabled={processing}
        >
          {processing ? "Releasing..." : "Release Payment"}
        </button>
        {status.message && (
          <span className={`status-message ${status.type}`}>
            {status.message}
          </span>
        )}
      </div>
      <p className="secondary-text">
        Once released, funds cannot be pulled back unless a dispute is raised.
      </p>
    </div>
  );
}


