import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../logo.png";
import "./styles/navbar.css";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch all notifications for the user
    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Sort client-side
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  const toggleNotifications = (e) => {
    e.preventDefault();
    setShowNotifications(!showNotifications);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.navbar-bell-container')) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showNotifications]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#/" className="navbar-brand">
          <img src={logo} alt="Student Freelance Hub logo" className="navbar-logo" />
          Student Freelance Hub
        </a>
        <div className="navbar-links">
          <a href="#/home" className="navbar-link">Home</a>
          <a href="#/browse" className="navbar-link">Browse</a>
          <a href="#/profile" className="navbar-link">Profile</a>
          <a href="#/users" className="navbar-link">Users</a>
          <a href="#/post" className="navbar-link">Post</a>
          <a href="#/wallet" className="navbar-link">Wallet</a>
          <a href="#/transactions" className="navbar-link">Transactions</a>
          <a href="#/disputes" className="navbar-link">Disputes</a>
          <a href="#/contact" className="navbar-link">Contact Us</a>
          <a href="#/manage" className="navbar-link">Manage</a>

          <div className="navbar-bell-container">
            <a href="#/notifications" className="navbar-link navbar-bell" onClick={toggleNotifications}>
              🔔
              {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
            </a>

            {showNotifications && (
              <div className="notifications-dropdown">
                <div className="notifications-header">
                  <h3>Notifications</h3>
                </div>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="notification-empty">No notifications</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`notification-item-dropdown ${notif.type}`}>
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">
                          {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


