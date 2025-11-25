import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import TransactionHistory from "./TransactionHistory";
import "../../styles/transactions.css";

export default function TransactionPage() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;

    if (!user) {
        return (
            <div className="transactions-container">
                <div className="empty-state">
                    <h2>Please log in to view your transaction history.</h2>
                </div>
            </div>
        );
    }

    return <TransactionHistory userId={user.uid} />;
}
