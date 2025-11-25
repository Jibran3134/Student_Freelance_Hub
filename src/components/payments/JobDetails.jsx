import React, { useState } from "react";
import ReleasePayment from "./ReleasePayment";
import RaiseDispute from "../disputes/RaiseDispute";
import "../../styles/payments.css";

const defaultJob = {
  jobId: "JOB-4581",
  payerId: "employer-demo-01",
  receiverId: "freelancer-demo-09",
  amount: 250,
};

export default function JobDetails() {
  const [jobDetails, setJobDetails] = useState(defaultJob);
  const [lastAction, setLastAction] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setJobDetails((prev) => ({
      ...prev,
      [name]: name === "amount" ? Number(value) : value,
    }));
  };

  return (
    <div className="job-details-page">
      <div className="job-details-content">
        <div className="job-card">
          <h2>Completed Job</h2>
          <p className="job-subtitle">
            Track payout and dispute actions once work is delivered.
          </p>

          <div className="job-info-grid">
            <label>
              Job ID
              <input
                type="text"
                name="jobId"
                value={jobDetails.jobId}
                onChange={handleChange}
                className="job-input"
              />
            </label>
            <label>
              Employer (payer) ID
              <input
                type="text"
                name="payerId"
                value={jobDetails.payerId}
                onChange={handleChange}
                className="job-input"
              />
            </label>
            <label>
              Freelancer (receiver) ID
              <input
                type="text"
                name="receiverId"
                value={jobDetails.receiverId}
                onChange={handleChange}
                className="job-input"
              />
            </label>
            <label>
              Agreed amount (USD)
              <input
                type="number"
                min="1"
                step="0.01"
                name="amount"
                value={jobDetails.amount}
                onChange={handleChange}
                className="job-input"
              />
            </label>
          </div>

          <div className="job-status-row">
            <span className="badge completed">Completed</span>
            {lastAction && <span className="job-last-action">{lastAction}</span>}
          </div>
        </div>

        <div className="job-actions-grid">
          <ReleasePayment
            jobId={jobDetails.jobId}
            payerId={jobDetails.payerId}
            receiverId={jobDetails.receiverId}
            amount={jobDetails.amount}
            onSuccess={() => setLastAction("Payment released successfully.")}
          />
          <RaiseDispute
            jobId={jobDetails.jobId}
            senderId={jobDetails.payerId}
            receiverId={jobDetails.receiverId}
            amount={jobDetails.amount}
            onSubmitted={() => setLastAction("Dispute raised for this job.")}
          />
        </div>
      </div>
    </div>
  );
}


