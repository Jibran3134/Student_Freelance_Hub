import React, { useEffect, useMemo, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { auth, db } from "../firebase";
import "./styles/notifications-page.css";

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "Just now";
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  } catch {
    return "Just now";
  }
};

export default function NotificationsScreen() {
  const [currentUser, setCurrentUser] = useState(() => auth.currentUser);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => setCurrentUser(user));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      orderBy("timestamp", "desc")
    );
    const unsubscribe = onSnapshot(
      notifQuery,
      (snapshot) => {
        setNotifications(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Failed to load notifications", error);
        setNotifications([]);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, [currentUser?.uid]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications]
  );

  const markAsReadAndNavigate = async (notification) => {
    try {
      if (!notification.read) {
        await updateDoc(doc(db, "notifications", notification.id), { read: true });
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    } finally {
      if (notification.targetPath) {
        window.location.hash = notification.targetPath;
      } else if (notification.type === "message" && notification.chatPath) {
        window.location.hash = notification.chatPath;
      } else {
        window.location.hash = "#/profile";
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="notifications-page">
        <div className="notifications-card">
          <h1>Notifications</h1>
          <p className="notifications-subtitle">Sign in to see your latest updates.</p>
          <button type="button" className="notifications-btn" onClick={() => (window.location.hash = "#/login")}>
            Go to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-card">
        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>
            <p className="notifications-subtitle">
              Stay up to date with messages, updates, and alerts from Student Freelance Hub.
            </p>
          </div>
          <span className="notifications-pill">{unreadCount} unread</span>
        </div>

        {loading ? (
          <div className="notifications-empty">Loading notifications…</div>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">No notifications yet</div>
        ) : (
          <ul className="notifications-list">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`notifications-item ${notification.read ? "" : "notifications-item-unread"}`}
                onClick={() => markAsReadAndNavigate(notification)}
              >
                <div className="notifications-item-header">
                  <span className={`notifications-type notifications-type-${notification.type || "alert"}`}>
                    {notification.type || "alert"}
                  </span>
                  <time>{formatTimestamp(notification.timestamp)}</time>
                </div>
                <h3>{notification.title || "Notification"}</h3>
                <p>{notification.message || "You have a new update."}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

