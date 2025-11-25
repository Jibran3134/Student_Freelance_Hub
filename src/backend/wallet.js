import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  runTransaction,
} from "firebase/firestore";
import {
  ensurePositiveAmount,
  validateWithdrawalPayload,
} from "./validators";

const WALLET_COLLECTION = "wallets";
const TRANSACTIONS_COLLECTION = "transactions";

const getWalletRef = (userId) => doc(db, WALLET_COLLECTION, userId);

export async function getWalletBalance(userId) {
  if (!userId) throw new Error("Missing userId");
  const walletRef = getWalletRef(userId);
  const walletSnap = await getDoc(walletRef);

  if (!walletSnap.exists()) {
    await setDoc(walletRef, {
      userId,
      balance: 0,
      updatedAt: serverTimestamp(),
    });
    return 0;
  }

  const data = walletSnap.data();
  return Number(data.balance) || 0;
}

export async function addCredits(userId, amount) {
  if (!userId) throw new Error("Missing userId");

  const numericAmount = ensurePositiveAmount(amount);

  const walletRef = getWalletRef(userId);
  await setDoc(
    walletRef,
    {
      userId,
      balance: increment(numericAmount),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  await createTransaction("credit", {
    amount: numericAmount,
    userId,
    participants: [userId],
    description: "Wallet top-up",
  });

  return getWalletBalance(userId);
}

export async function createTransaction(type, data) {
  const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);
  const docData = {
    type,
    timestamp: serverTimestamp(),
    participants: data?.participants || [],
    ...data,
  };
  return addDoc(transactionsRef, docData);
}

export async function getTransactions(userId) {
  if (!userId) throw new Error("Missing userId");
  const transactionsRef = collection(db, TRANSACTIONS_COLLECTION);
  const q = query(
    transactionsRef,
    where("participants", "array-contains", userId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => {
      const timeA = a.timestamp?.toMillis
        ? a.timestamp.toMillis()
        : a.timestamp?.seconds
        ? a.timestamp.seconds * 1000
        : 0;
      const timeB = b.timestamp?.toMillis
        ? b.timestamp.toMillis()
        : b.timestamp?.seconds
        ? b.timestamp.seconds * 1000
        : 0;
      return timeB - timeA;
    });
}

export async function requestWithdrawal(userId, amount, method, details) {
  if (!userId) throw new Error("Missing userId");

  const currentBalance = await getWalletBalance(userId);
  const numericAmount = validateWithdrawalPayload({
    amount,
    balance: currentBalance,
    method,
    accountDetails: details,
  });

  const walletRef = getWalletRef(userId);

  await runTransaction(db, async (transaction) => {
    const walletSnapshot = await transaction.get(walletRef);
    const balance = walletSnapshot.exists()
      ? Number(walletSnapshot.data().balance) || 0
      : 0;

    if (balance < numericAmount) {
      throw new Error("Insufficient balance for withdrawal.");
    }

    transaction.set(
      walletRef,
      {
        userId,
        balance: balance - numericAmount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  await createTransaction("withdrawal", {
    userId,
    amount: numericAmount,
    participants: [userId],
    description: `Withdrawal via ${method}`,
  });

  const withdrawRef = collection(db, "withdraw_requests");
  const docData = {
    userId,
    amount: numericAmount,
    method,
    accountDetails: details,
    status: "completed",
    timestamp: serverTimestamp(),
  };
  return addDoc(withdrawRef, docData);
}


