import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const DISPUTES_COLLECTION = "disputes";

export async function raiseDispute(data) {
  const {
    jobId,
    senderId,
    receiverId,
    amount,
    reason,
    explanation,
  } = data || {};

  if (!jobId || !senderId || !receiverId) {
    throw new Error("Missing dispute identifiers");
  }

  const numericAmount = Number(amount) || 0;

  const disputesRef = collection(db, DISPUTES_COLLECTION);
  const payload = {
    jobId,
    senderId,
    receiverId,
    amount: numericAmount,
    reason: reason || "Other",
    explanation: explanation || "",
    status: "open",
    createdAt: serverTimestamp(),
  };

  return addDoc(disputesRef, payload);
}

export async function getUserDisputes(userId) {
  if (!userId) throw new Error("Missing userId");
  const disputesRef = collection(db, DISPUTES_COLLECTION);
  const disputesQuery = query(disputesRef, where("senderId", "==", userId));
  const snapshot = await getDocs(disputesQuery);
  return snapshot.docs
    .map((docSnapshot) => ({
      id: docSnapshot.id,
      ...docSnapshot.data(),
    }))
    .sort((a, b) => {
      const dateA = a.createdAt?.toDate
        ? a.createdAt.toDate().getTime()
        : a.createdAt?.seconds
        ? a.createdAt.seconds * 1000
        : 0;
      const dateB = b.createdAt?.toDate
        ? b.createdAt.toDate().getTime()
        : b.createdAt?.seconds
        ? b.createdAt.seconds * 1000
        : 0;
      return dateB - dateA;
    });
}


