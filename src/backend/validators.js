export function ensurePositiveAmount(value, label = "Amount") {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    throw new Error(`${label} must be greater than zero.`);
  }
  return numericValue;
}

export function ensureBalanceAvailable(balance, amount) {
  const numericBalance = Number(balance) || 0;
  if (numericBalance < amount) {
    throw new Error("Insufficient balance for this operation.");
  }
}

export function validateWithdrawalPayload({
  amount,
  balance,
  method,
  accountDetails,
}) {
  const normalizedAmount = ensurePositiveAmount(amount, "Withdrawal amount");

  ensureBalanceAvailable(balance, normalizedAmount);

  if (!method || !method.trim()) {
    throw new Error("Please select a withdrawal method.");
  }

  if (!accountDetails || !accountDetails.trim()) {
    throw new Error("Account number / wallet ID is required.");
  }

  if (accountDetails.length < 4) {
    throw new Error("Account details must be at least 4 characters long.");
  }

  return normalizedAmount;
}

export function normalizeString(value) {
  return (value || "").trim();
}

export function validateWithdrawal(amount, balance, method, details) {
    const numericAmount = Number(amount);
    const errors = {};

    if (!numericAmount || numericAmount <= 0) {
        errors.amount = "Amount must be greater than zero";
    } else if (numericAmount > balance) {
        errors.amount = "Insufficient balance";
    }

    if (!method) {
        errors.method = "Payment method is required";
    }

    if (!details || !details.trim()) {
        errors.details = "Account details are required";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
}

export function validateTransactionAmount(amount) {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return "Amount must be valid and greater than zero";
    }
    return null;
}
