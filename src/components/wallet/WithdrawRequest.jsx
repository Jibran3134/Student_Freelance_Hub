import React, { useState } from "react";
import { requestWithdrawal } from "../../backend/wallet";
import "../../styles/withdraw.css";

const withdrawalMethods = ["Bank Transfer"];

export default function WithdrawRequest({ userId, balance, onRequestCreated }) {
  const [amount, setAmount] = useState("");
  const [accountDetails, setAccountDetails] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const resetStatus = () => setStatus({ type: "", message: "" });

  const validate = () => {
    const err = {};
    const amt = Number(amount);
    if (!amount || amt <= 0) {
      err.amount = "Enter a valid withdrawal amount";
    } else if (amt > Number(balance)) {
      err.amount = "Amount exceeds balance";
    }
    if (!accountDetails || accountDetails.trim().length < 4) {
      err.accountDetails = "Enter a valid bank account number (min 4 chars)";
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!userId) {
      setStatus({
        type: "error",
        message: "Please log in to submit a withdrawal request.",
      });
      return;
    }
    if (!validate()) return;
    try {
      resetStatus();
      setSubmitting(true);
      await requestWithdrawal(userId, amount, "Bank Transfer", accountDetails);
      setAmount("");
      setAccountDetails("");
      setStatus({
        type: "success",
        message: "Withdrawal processed successfully.",
      });
      setErrors({});
      onRequestCreated?.();
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to submit withdrawal request.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="withdraw-card">
      <h3>Withdraw Funds</h3>
      <p className="withdraw-subtitle">
        Current Balance: <strong>${Number(balance || 0).toFixed(2)}</strong>
      </p>
      <p className="withdraw-subtitle">
        Funds are deducted immediately after you confirm the withdrawal.
      </p>
      <form className="withdraw-form" onSubmit={handleSubmit}>
        <div className="withdraw-field">
          <label>Amount (USD)</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter amount to withdraw"
            required
          />
          {errors.amount && (
            <span className="error-message">{errors.amount}</span>
          )}
        </div>
        <div className="withdraw-field">
          <label>Bank Account Number</label>
          <input
            type="text"
            value={accountDetails}
            onChange={(event) => setAccountDetails(event.target.value)}
            placeholder="Enter your bank account number"
            required
          />
          {errors.accountDetails && (
            <span className="error-message">{errors.accountDetails}</span>
          )}
        </div>
        <button
          type="submit"
          className="primary-btn"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Withdraw"}
        </button>
      </form>
      {status.message && (
        <div className={`withdraw-status ${status.type}`}>
          {status.message}
        </div>
      )}
    </div>
  );
}
