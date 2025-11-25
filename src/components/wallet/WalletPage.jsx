import React, { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
} from "firebase/firestore";
import { auth, db } from "../../firebase";
import { addCredits, getWalletBalance } from "../../backend/wallet";
import { saveCard, getSavedCards } from "../../backend/cards";
import WithdrawRequest from "./WithdrawRequest";
import WithdrawHistory from "./WithdrawHistory";
import "../../styles/wallet.css";

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  // Card form state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVC, setCardCVC] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [saveCardForLater, setSaveCardForLater] = useState(false);
  const [selectedSavedCard, setSelectedSavedCard] = useState("");
  const [savedCards, setSavedCards] = useState([]);
  const [useNewCard, setUseNewCard] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [cardErrors, setCardErrors] = useState({});

  useEffect(() => {
    let walletUnsubscribe;
    let transactionUnsubscribe;

    const authUnsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      walletUnsubscribe?.();
      transactionUnsubscribe?.();

      if (currentUser) {
        const walletBalance = await getWalletBalance(currentUser.uid);
        setBalance(walletBalance);
        walletUnsubscribe = subscribeToWallet(currentUser.uid);
        transactionUnsubscribe = subscribeToTransactions(currentUser.uid);
        // Load saved cards
        try {
          const cards = await getSavedCards(currentUser.uid);
          setSavedCards(cards);
          if (cards.length > 0) {
            setUseNewCard(false);
            setSelectedSavedCard(cards[0].id);
          }
        } catch (error) {
          console.error("Error loading saved cards:", error);
        }
      } else {
        setTransactions([]);
        setBalance(0);
        setSavedCards([]);
      }
      setLoading(false);
    });

    return () => {
      authUnsubscribe();
      walletUnsubscribe?.();
      transactionUnsubscribe?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribeToWallet = (userId) => {
    const walletRef = doc(db, "wallets", userId);
    return onSnapshot(walletRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setBalance(Number(data.balance) || 0);
      } else {
        setBalance(0);
      }
    });
  };

  const subscribeToTransactions = (userId) => {
    const transactionsRef = collection(db, "transactions");
    const transactionsQuery = query(
      transactionsRef,
      where("participants", "array-contains", userId)
    );
    return onSnapshot(transactionsQuery, (snapshot) => {
      const mapped = snapshot.docs
        .map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }))
        .sort((a, b) => {
          const dateA = a.timestamp?.toDate
            ? a.timestamp.toDate().getTime()
            : a.timestamp?.seconds
            ? a.timestamp.seconds * 1000
            : 0;
          const dateB = b.timestamp?.toDate
            ? b.timestamp.toDate().getTime()
            : b.timestamp?.seconds
            ? b.timestamp.seconds * 1000
            : 0;
          return dateB - dateA;
        });
      setTransactions(mapped);
    });
  };

  // Card validation functions
  const validateCardNumber = (number) => {
    const cleaned = number.replace(/\s/g, "");
    if (!cleaned) return "Card number is required";
    if (!/^\d+$/.test(cleaned)) return "Card number must contain only digits";
    if (cleaned.length < 13 || cleaned.length > 19) return "Card number must be between 13 and 19 digits";
    // Luhn algorithm check
    let sum = 0;
    let isEven = false;
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    if (sum % 10 !== 0) return "Invalid card number";
    return "";
  };

  const validateExpiry = (expiry) => {
    if (!expiry) return "Expiry date is required";
    const match = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!match) return "Expiry must be in MM/YY format";
    const month = parseInt(match[1]);
    const year = parseInt("20" + match[2]);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (month < 1 || month > 12) return "Invalid month";
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "Card has expired";
    }
    return "";
  };

  const validateCVC = (cvc) => {
    if (!cvc) return "CVC is required";
    if (!/^\d+$/.test(cvc)) return "CVC must contain only digits";
    if (cvc.length < 3 || cvc.length > 4) return "CVC must be 3 or 4 digits";
    return "";
  };

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19); // Max 16 digits + 3 spaces
  };

  const formatExpiry = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    const error = validateCardNumber(formatted);
    setCardErrors((prev) => ({ ...prev, cardNumber: error }));
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setCardExpiry(formatted);
    const error = validateExpiry(formatted);
    setCardErrors((prev) => ({ ...prev, expiry: error }));
  };

  const handleCVCChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCardCVC(value);
    const error = validateCVC(value);
    setCardErrors((prev) => ({ ...prev, cvc: error }));
  };

  const validateCardForm = () => {
    const errors = {};
    if (useNewCard) {
      errors.cardNumber = validateCardNumber(cardNumber);
      errors.expiry = validateExpiry(cardExpiry);
      errors.cvc = validateCVC(cardCVC);
      if (!cardholderName.trim()) {
        errors.cardholderName = "Cardholder name is required";
      }
    }
    setCardErrors(errors);
    return Object.values(errors).every((err) => !err);
  };

  const handleAddCredits = async (event) => {
    event.preventDefault();
    if (!user) {
      setStatus({ type: "error", message: "Please log in to use the wallet." });
      return;
    }

    if (!topUpAmount || Number(topUpAmount) <= 0) {
      setStatus({ type: "error", message: "Please enter a valid amount." });
      return;
    }

    if (!validateCardForm()) {
      setStatus({ type: "error", message: "Please fix card form errors." });
      return;
    }

    // Show confirmation
    setShowConfirmation(true);
  };

  const confirmTopUp = async () => {
    if (!user) return;

    try {
      setProcessing(true);
      setShowConfirmation(false);
      
      // Save card if requested and using new card
      if (useNewCard && saveCardForLater) {
        const cardNumberCleaned = cardNumber.replace(/\s/g, "");
        const last4 = cardNumberCleaned.slice(-4);
        const maskedNumber = "**** **** **** " + last4;
        const [expiryMonth, expiryYear] = cardExpiry.split("/");
        
        await saveCard(user.uid, {
          last4,
          expiryMonth,
          expiryYear: "20" + expiryYear,
          cardholderName,
          maskedNumber,
        });
      }

      // Process payment (mock - in real app, this would call payment gateway)
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Add credits to wallet
      const updatedBalance = await addCredits(user.uid, topUpAmount);
      setBalance(updatedBalance);
      
      // Reset form
      setTopUpAmount("");
      setCardNumber("");
      setCardExpiry("");
      setCardCVC("");
      setCardholderName("");
      setSaveCardForLater(false);
      setCardErrors({});
      
      setStatus({
        type: "success",
        message: "Credits added successfully!",
      });
      
      // Reload saved cards
      const cards = await getSavedCards(user.uid);
      setSavedCards(cards);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to add credits.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const cancelTopUp = () => {
    setShowConfirmation(false);
  };

  const formatCurrency = (value) =>
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
      ? date.toLocaleString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Date unavailable";
  };

  if (loading) {
    return (
      <div className="wallet-page">
        <div className="wallet-content">
          <div className="wallet-card">
            <p className="wallet-subtitle">Loading wallet...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="wallet-page">
        <div className="wallet-content">
          <div className="wallet-card">
            <h2>Wallet</h2>
            <p className="wallet-subtitle">
              Please log in to view and manage your wallet.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-page">
      <div className="wallet-content">
        <div className="wallet-grid">
          <div className="wallet-card">
            <p className="wallet-subtitle">Current Balance</p>
            <p className="wallet-balance">{formatCurrency(balance)}</p>
            <p className="wallet-subtitle">
              Use your credits to hire freelancers or receive payments.
            </p>
          </div>
          <div className="wallet-card">
            <h3>Add Credits</h3>
            <form className="wallet-form" onSubmit={handleAddCredits}>
              <div>
                <label className="wallet-label">Amount (USD)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  value={topUpAmount}
                  onChange={(event) => setTopUpAmount(event.target.value)}
                  className="wallet-input"
                  placeholder="Enter amount"
                  required
                />
              </div>

              {savedCards.length > 0 && (
                <div>
                  <label className="wallet-label">Payment Method</label>
                  <div className="card-option-group">
                    <label className="card-option">
                      <input
                        type="radio"
                        name="cardOption"
                        checked={!useNewCard}
                        onChange={() => setUseNewCard(false)}
                      />
                      <span>Use Saved Card</span>
                    </label>
                    <label className="card-option">
                      <input
                        type="radio"
                        name="cardOption"
                        checked={useNewCard}
                        onChange={() => setUseNewCard(true)}
                      />
                      <span>Use New Card</span>
                    </label>
                  </div>
                </div>
              )}

              {!useNewCard && savedCards.length > 0 && (
                <div>
                  <label className="wallet-label">Select Card</label>
                  <select
                    className="wallet-input"
                    value={selectedSavedCard}
                    onChange={(e) => setSelectedSavedCard(e.target.value)}
                  >
                    {savedCards.map((card) => (
                      <option key={card.id} value={card.id}>
                        {card.maskedNumber} - Expires {card.expiryMonth}/{card.expiryYear.slice(-2)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {useNewCard && (
                <>
                  <div>
                    <label className="wallet-label">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      className={`wallet-input ${cardErrors.cardholderName ? "input-error" : ""}`}
                      placeholder="Name on card"
                      required
                    />
                    {cardErrors.cardholderName && (
                      <span className="error-text">{cardErrors.cardholderName}</span>
                    )}
                  </div>

                  <div>
                    <label className="wallet-label">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className={`wallet-input ${cardErrors.cardNumber ? "input-error" : ""}`}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                    {cardErrors.cardNumber && (
                      <span className="error-text">{cardErrors.cardNumber}</span>
                    )}
                  </div>

                  <div className="card-row">
                    <div className="card-col">
                      <label className="wallet-label">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        className={`wallet-input ${cardErrors.expiry ? "input-error" : ""}`}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                      {cardErrors.expiry && (
                        <span className="error-text">{cardErrors.expiry}</span>
                      )}
                    </div>
                    <div className="card-col">
                      <label className="wallet-label">CVC</label>
                      <input
                        type="text"
                        value={cardCVC}
                        onChange={handleCVCChange}
                        className={`wallet-input ${cardErrors.cvc ? "input-error" : ""}`}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                      {cardErrors.cvc && (
                        <span className="error-text">{cardErrors.cvc}</span>
                      )}
                    </div>
                  </div>

                  <label className="save-card-option">
                    <input
                      type="checkbox"
                      checked={saveCardForLater}
                      onChange={(e) => setSaveCardForLater(e.target.checked)}
                    />
                    <span>Save this card for future payments</span>
                  </label>
                </>
              )}

              <button
                className="primary-btn"
                type="submit"
                disabled={processing || !topUpAmount}
              >
                {processing ? "Processing..." : "Continue to Payment"}
              </button>
              {status.message && (
                <div className={`wallet-status ${status.type}`}>
                  {status.message}
                </div>
              )}
            </form>

            {showConfirmation && (
              <div className="confirmation-overlay">
                <div className="confirmation-modal">
                  <h3>Confirm Payment</h3>
                  <div className="confirmation-details">
                    <p><strong>Amount:</strong> {formatCurrency(topUpAmount)}</p>
                    {useNewCard ? (
                      <>
                        <p><strong>Card:</strong> **** **** **** {cardNumber.replace(/\s/g, "").slice(-4)}</p>
                        <p><strong>Cardholder:</strong> {cardholderName}</p>
                      </>
                    ) : (
                      savedCards.find((c) => c.id === selectedSavedCard) && (
                        <p><strong>Card:</strong> {savedCards.find((c) => c.id === selectedSavedCard).maskedNumber}</p>
                      )
                    )}
                  </div>
                  <div className="confirmation-actions">
                    <button
                      className="secondary-btn"
                      onClick={cancelTopUp}
                      disabled={processing}
                    >
                      Cancel
                    </button>
                    <button
                      className="primary-btn"
                      onClick={confirmTopUp}
                      disabled={processing}
                    >
                      {processing ? "Processing..." : "Confirm Payment"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="wallet-grid">
          <WithdrawRequest
            userId={user.uid}
            balance={balance}
          />
          <WithdrawHistory userId={user.uid} />
        </div>

        <div className="wallet-transactions">
          <h3>Transaction History</h3>
          {transactions.length === 0 ? (
            <div className="empty-state">
              No transactions yet. Fund your wallet or receive payments to see
              history here.
            </div>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div className="transaction-meta">
                    <span className="transaction-type">
                      {transaction.type?.replace("_", " ") || "transaction"}
                    </span>
                    <span className="transaction-description">
                      {transaction.description ||
                        "Wallet movement recorded for your account."}
                    </span>
                    <span className="transaction-date">
                      {formatTimestamp(transaction.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`transaction-amount ${
                      transaction.type === "credit" ||
                      transaction.receiverId === user.uid
                        ? "positive"
                        : "negative"
                    }`}
                  >
                    {transaction.type === "credit" ||
                    transaction.receiverId === user.uid
                      ? "+"
                      : "-"}
                    {formatCurrency(transaction.amount)}
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


