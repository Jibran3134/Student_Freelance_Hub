import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import "../../styles/transactions.css";
import { auth } from "../../firebase";
import {
  fetchCombinedTransactions,
} from "../../backend/transactions";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "credit", label: "Credits" },
  { key: "payment", label: "Payments" },
  { key: "withdrawal", label: "Withdrawals" },
];

const filterTransaction = (item, filterKey) => {
  if (filterKey === "all") return true;
  if (filterKey === "credit") return item.type === "credit";
  if (filterKey === "withdrawal") return item.type === "withdrawal";
  if (filterKey === "payment") {
    return (
      item.type === "payment_release" ||
      item.type === "payment" ||
      item.type === "transaction"
    );
  }
  return true;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value) || 0);

const formatDate = (timestamp) => {
  if (!timestamp) return "Date unavailable";
  return timestamp.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function TransactionHistory() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setStatus({ type: "", message: "" });
        const data = await fetchCombinedTransactions(currentUser.uid);
        setTransactions(data);
      } catch (error) {
        setStatus({
          type: "error",
          message: error.message || "Failed to load transactions.",
        });
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <div className="transactions-page">
        <div className="transactions-card">
          <h2>Transaction History</h2>
          <p>Please log in to view your transactions.</p>
        </div>
      </div>
    );
  }

  const filteredTransactions = transactions.filter((item) =>
    filterTransaction(item, filter)
  );

  return (
    <div className="transactions-page">
      <div className="transactions-header">
        <div>
          <h2>Transaction History</h2>
          <p className="muted">
            Track every credit, payment, and withdrawal across your wallet.
          </p>
        </div>
        <div className="transaction-filters">
          {FILTERS.map((item) => (
            <button
              key={item.key}
              className={`filter-btn ${
                filter === item.key ? "active" : ""
              }`}
              onClick={() => setFilter(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {status.message && (
        <div className={`transactions-status ${status.type}`}>
          {status.message}
        </div>
      )}

      {loading ? (
        <div className="transactions-card">
          <p>Loading transactions...</p>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="transactions-card">
          <p className="muted">
            No transactions found for this filter selection.
          </p>
        </div>
      ) : (
        <div className="transactions-list">
          {filteredTransactions.map((item) => (
            <div key={item.id} className="transaction-row">
              <div>
                <p className="transaction-type-text">
                  {item.type.replace("_", " ")}
                  {item.type.toLowerCase().includes("dispute") && (
                    <span className="transactions-badge dispute-badge">Dispute</span>
                  )}
                </p>
                <p className="transaction-description">
                  {item.description || "No description available"}
                </p>
              </div>
              <div className="transaction-meta">
                <span className={`transactions-badge ${item.status || "completed"}`}>
                  {item.status || "completed"}
                </span>
                <span className="transaction-date">
                  {formatDate(item.timestamp)}
                </span>
              </div>
              <div
                className={`transaction-amount ${
                  item.direction === "in" ? "positive" : "negative"
                }`}
              >
                {item.direction === "in" ? "+" : "-"}
                {formatCurrency(item.amount)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
