import React, { useEffect, useState } from "react";
import { db, auth } from "../../firebase";
import { collection, query, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import styles from "../../styles/admin-dashboard.module.css";

const ADMIN_EMAILS = [
    "alishba11@gmail.com",
    "jibran22@gmail.com",
    "umar33@gmail.com",
    "abdullah44@gmail.com"
];

export default function AdminDisputes() {
    const [disputes, setDisputes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminAndFetch = async () => {
            const user = auth.currentUser;
            if (!user || !ADMIN_EMAILS.includes(user.email)) {
                setError("Access denied. Admin only.");
                setLoading(false);
                return;
            }
            setIsAdmin(true);
            await fetchDisputes();
        };

        checkAdminAndFetch();
    }, []);

    const fetchDisputes = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, "disputes"));
            const snapshot = await getDocs(q);

            const disputesList = await Promise.all(snapshot.docs.map(async (docSnap) => {
                const data = docSnap.data();
                // Fetch sender and receiver names for better context
                let senderName = "Unknown";
                let receiverName = "Unknown";

                try {
                    if (data.senderId) {
                        const senderDoc = await getDoc(doc(db, "users", data.senderId));
                        if (senderDoc.exists()) senderName = senderDoc.data().name;
                    }
                    if (data.receiverId) {
                        const receiverDoc = await getDoc(doc(db, "users", data.receiverId));
                        if (receiverDoc.exists()) receiverName = receiverDoc.data().name;
                    }
                } catch (e) {
                    console.error("Error fetching user details", e);
                }

                return {
                    id: docSnap.id,
                    ...data,
                    senderName,
                    receiverName
                };
            }));

            // Sort by date (newest first)
            disputesList.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setDisputes(disputesList);
        } catch (err) {
            console.error("Error fetching disputes:", err);
            setError("Failed to load disputes.");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (disputeId, newStatus) => {
        if (!window.confirm(`Are you sure you want to mark this dispute as ${newStatus}?`)) return;

        try {
            await updateDoc(doc(db, "disputes", disputeId), {
                status: newStatus,
                resolvedAt: new Date().toISOString(),
                resolvedBy: auth.currentUser.email
            });

            // Refresh list
            setDisputes(prev => prev.map(d =>
                d.id === disputeId ? { ...d, status: newStatus } : d
            ));

            alert(`Dispute marked as ${newStatus}`);
        } catch (err) {
            console.error("Error updating dispute:", err);
            alert("Failed to update dispute status");
        }
    };

    if (loading) return <div className={styles.loading}>Loading disputes...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    return (
        <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Dispute Resolution</h2>

            {disputes.length === 0 ? (
                <p className={styles.emptyState}>No disputes found.</p>
            ) : (
                <div className={styles.tableContainer}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Raised By</th>
                                <th>Against</th>
                                <th>Reason</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {disputes.map((dispute) => (
                                <tr key={dispute.id}>
                                    <td>
                                        {dispute.createdAt?.seconds
                                            ? new Date(dispute.createdAt.seconds * 1000).toLocaleDateString()
                                            : "N/A"}
                                    </td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <span className={styles.userName}>{dispute.senderName}</span>
                                            <span className={styles.userEmail}>ID: {dispute.senderId?.slice(0, 5)}...</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.userCell}>
                                            <span className={styles.userName}>{dispute.receiverName}</span>
                                            <span className={styles.userEmail}>ID: {dispute.receiverId?.slice(0, 5)}...</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.reasonCell}>
                                            <strong>{dispute.reason}</strong>
                                            <p className={styles.explanation}>{dispute.explanation}</p>
                                        </div>
                                    </td>
                                    <td>${dispute.amount}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[dispute.status] || styles.default}`}>
                                            {dispute.status}
                                        </span>
                                    </td>
                                    <td>
                                        {dispute.status === "open" && (
                                            <div className={styles.actionButtons}>
                                                <button
                                                    className={styles.approveButton}
                                                    onClick={() => handleStatusChange(dispute.id, "resolved")}
                                                    title="Resolve in favor of sender"
                                                >
                                                    Resolve
                                                </button>
                                                <button
                                                    className={styles.rejectButton}
                                                    onClick={() => handleStatusChange(dispute.id, "dismissed")}
                                                    title="Dismiss dispute"
                                                >
                                                    Dismiss
                                                </button>
                                            </div>
                                        )}
                                        {dispute.status !== "open" && (
                                            <span className={styles.resolvedText}>
                                                {dispute.status}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
