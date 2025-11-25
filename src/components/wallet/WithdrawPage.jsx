import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import WithdrawRequest from "./WithdrawRequest";
import "../../styles/withdraw.css";

export default function WithdrawPage() {
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
            <div className="withdraw-container">
                <div className="withdraw-header">
                    <h2>Please log in to request a withdrawal.</h2>
                </div>
            </div>
        );
    }

    return <WithdrawRequest userId={user.uid} />;
}
