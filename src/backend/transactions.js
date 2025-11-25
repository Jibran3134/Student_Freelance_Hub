import { db } from "../firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const TRANSACTIONS_COLLECTION = "transactions";
const WITHDRAWALS_COLLECTION = "withdraw_requests";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate();
  }
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000);
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return null;
};

const buildTransactionRecord = (docSnapshot, userId) => {
  const data = docSnapshot.data();
  const timestamp = formatTimestamp(data.timestamp);
  const direction =
    data.receiverId && data.receiverId === userId
      ? "in"
      : data.payerId && data.payerId === userId
      ? "out"
      : data.userId === userId && data.type === "credit"
      ? "in"
      : "out";

  return {
    id: docSnapshot.id,
    type: data.type || "transaction",
    amount: Number(data.amount) || 0,
    timestamp,
    description: data.description || "",
    jobId: data.jobId || "",
    direction,
    source: "transaction",
    status: data.status || "completed",
  };
};

const buildWithdrawalRecord = (docSnapshot) => {
  const data = docSnapshot.data();
  const timestamp = formatTimestamp(data.timestamp);
  return {
    id: docSnapshot.id,
    type: "withdrawal",
    amount: Number(data.amount) || 0,
    timestamp,
    description: `${data.method || "Withdrawal"} request`,
    jobId: data.jobId || "",
    direction: "out",
    source: "withdrawal",
    status: data.status || "pending",
    method: data.method,
  };
};

export async function fetchUserTransactions(userId) {
  if (!userId) throw new Error("Missing userId");

  const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);
  const transactionsQuery = query(
    transactionsRef,
    where("participants", "array-contains", userId)
  );

  const snapshot = await getDocs(transactionsQuery);
  return snapshot.docs
    .map((doc) => buildTransactionRecord(doc, userId))
    .sort((a, b) => {
      const timeA = a.timestamp ? a.timestamp.getTime() : 0;
      const timeB = b.timestamp ? b.timestamp.getTime() : 0;
      return timeB - timeA;
    });
}

export async function fetchUserWithdrawals(userId) {
  if (!userId) throw new Error("Missing userId");

  const withdrawalsRef = collection(db, WITHDRAWALS_COLLECTION);
  const withdrawalQuery = query(
    withdrawalsRef,
    where("userId", "==", userId)
  );

  const snapshot = await getDocs(withdrawalQuery);
  return snapshot.docs
    .map((doc) => buildWithdrawalRecord(doc))
    .sort((a, b) => {
      const timeA = a.timestamp ? a.timestamp.getTime() : 0;
      const timeB = b.timestamp ? b.timestamp.getTime() : 0;
      return timeB - timeA;
    });
}

export async function fetchCombinedTransactions(userId) {
  const [transactions, withdrawals] = await Promise.all([
    fetchUserTransactions(userId),
    fetchUserWithdrawals(userId),
  ]);

  const combined = [...transactions, ...withdrawals].sort((a, b) => {
    const timeA = a.timestamp ? a.timestamp.getTime() : 0;
    const timeB = b.timestamp ? b.timestamp.getTime() : 0;
    return timeB - timeA;
  });

  return combined;
}
