import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import logo from "../logo.png";
import "./styles/navbar.css";

export default function Navbar() {
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser?.uid) {
      setUnreadCount(0);
      return;
    }

    const notifQuery = query(
      collection(db, "notifications"),
      where("userId", "==", currentUser.uid),
      where("read", "==", false)
    );

    const unsubscribe = onSnapshot(notifQuery, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

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
          <a href="#/notifications" className="navbar-link navbar-bell">
            🔔
            {unreadCount > 0 && <span className="navbar-badge">{unreadCount}</span>}
          </a>
        </div>
      </div>
    </nav>
  );
}


