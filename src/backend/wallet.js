import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";

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

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

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


