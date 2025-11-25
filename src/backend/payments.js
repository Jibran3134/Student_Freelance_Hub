import { db } from "../firebase";
import {
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { createTransaction } from "./wallet";

const WALLET_COLLECTION = "wallets";

export async function releasePayment(jobId, payerId, receiverId, amount) {
  const numericAmount = Number(amount);
  if (!jobId || !payerId || !receiverId) {
    throw new Error("Missing payment parameters");
  }

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Amount must be greater than zero");
  }

  const payerRef = doc(db, WALLET_COLLECTION, payerId);
  const receiverRef = doc(db, WALLET_COLLECTION, receiverId);

  await runTransaction(db, async (transaction) => {
    const payerSnapshot = await transaction.get(payerRef);
    const currentPayerBalance = payerSnapshot.exists()
      ? Number(payerSnapshot.data().balance) || 0
      : 0;

    if (currentPayerBalance < numericAmount) {
      throw new Error("Insufficient employer balance");
    }

    const receiverSnapshot = await transaction.get(receiverRef);
    const currentReceiverBalance = receiverSnapshot.exists()
      ? Number(receiverSnapshot.data().balance) || 0
      : 0;

    transaction.set(
      payerRef,
      {
        userId: payerId,
        balance: currentPayerBalance - numericAmount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    transaction.set(
      receiverRef,
      {
        userId: receiverId,
        balance: currentReceiverBalance + numericAmount,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  });

  await createTransaction("payment_release", {
    jobId,
    payerId,
    receiverId,
    amount: numericAmount,
    participants: [payerId, receiverId],
    description: `Released payment for job ${jobId}`,
  });

  return true;
}


