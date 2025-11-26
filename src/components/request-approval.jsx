import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, doc, getDoc, updateDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import "../components/styles/request-approval.css";

export default function RequestApproval() {
    const [currentUser, setCurrentUser] = useState(null);
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);

    // Get request ID from URL hash
    const requestId = window.location.hash.split("/")[2];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!requestId) {
            setError("No request ID provided");
            setLoading(false);
            return;
        }

        const fetchRequest = async () => {
            try {
                const requestDoc = await getDoc(doc(db, "requests", requestId));
                if (requestDoc.exists()) {
                    setRequest({ id: requestDoc.id, ...requestDoc.data() });
                } else {
                    setError("Request not found");
                }
            } catch (err) {
                console.error("Error fetching request:", err);
                setError("Failed to load request");
            } finally {
                setLoading(false);
            }
        };

        fetchRequest();
    }, [requestId]);

    const handleAccept = async () => {
        if (!currentUser || !request) return;

        setActionLoading(true);
        try {
            // Update request status to accepted
            await updateDoc(doc(db, "requests", request.id), {
                status: "accepted",
                acceptedAt: serverTimestamp(),
            });

            // Create notification for requester
            await addDoc(collection(db, "notifications"), {
                userId: request.requesterId,
                type: "accepted",
                title: "Request Accepted!",
                message: `Your request for "${request.projectTitle}" has been accepted!`,
                projectId: request.projectId,
                requestId: request.id,
                read: false,
                timestamp: serverTimestamp(),
                targetPath: "#/home",
            });

            alert("Request accepted successfully!");
            window.location.hash = "#/home";
        } catch (err) {
            console.error("Error accepting request:", err);
            alert("Failed to accept request. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!currentUser || !request) return;

        setActionLoading(true);
        try {
            // Update request status to rejected
            await updateDoc(doc(db, "requests", request.id), {
                status: "rejected",
                rejectedAt: serverTimestamp(),
            });

            // Optionally notify requester
            await addDoc(collection(db, "notifications"), {
                userId: request.requesterId,
                type: "rejected",
                title: "Request Declined",
                message: `Your request for "${request.projectTitle}" was declined.`,
                projectId: request.projectId,
                requestId: request.id,
                read: false,
                timestamp: serverTimestamp(),
                targetPath: "#/home",
            });

            alert("Request rejected.");
            window.location.hash = "#/home";
        } catch (err) {
            console.error("Error rejecting request:", err);
            alert("Failed to reject request. Please try again.");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="approval-page">
                <div className="approval-card">
                    <p>Loading request...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="approval-page">
                <div className="approval-card">
                    <h2>Error</h2>
                    <p>{error}</p>
                    <button className="btn-secondary" onClick={() => window.location.hash = "#/home"}>
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!request) {
        return null;
    }

    return (
        <div className="approval-page">
            <div className="approval-card">
                <div className="approval-header">
                    <h1>Request Approval</h1>
                    <span className={`status-badge status-${request.status}`}>
                        {request.status}
                    </span>
                </div>

                <div className="approval-body">
                    <div className="info-section">
                        <h3>Project Details</h3>
                        <p><strong>Title:</strong> {request.projectTitle}</p>
                        <p><strong>Type:</strong> {request.projectType}</p>
                        <p><strong>Deadline:</strong> {new Date(request.deadline).toLocaleDateString()}</p>
                    </div>

                    <div className="info-section">
                        <h3>Requester Information</h3>
                        <p><strong>Name:</strong> {request.requesterName}</p>
                        <p><strong>Requester ID:</strong> {request.requesterId}</p>
                    </div>

                    <div className="info-section">
                        <h3>Request Info</h3>
                        <p><strong>Sent:</strong> {request.createdAt?.toDate ? request.createdAt.toDate().toLocaleString() : "N/A"}</p>
                        <p><strong>Status:</strong> {request.status}</p>
                    </div>
                </div>

                {request.status === "pending" && (
                    <div className="approval-actions">
                        <button
                            className="btn-reject"
                            onClick={handleReject}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : "❌ Reject"}
                        </button>
                        <button
                            className="btn-accept"
                            onClick={handleAccept}
                            disabled={actionLoading}
                        >
                            {actionLoading ? "Processing..." : "✅ Accept"}
                        </button>
                    </div>
                )}

                {request.status !== "pending" && (
                    <div className="approval-info">
                        <p>This request has already been {request.status}.</p>
                        <button className="btn-secondary" onClick={() => window.location.hash = "#/home"}>
                            Back to Home
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
