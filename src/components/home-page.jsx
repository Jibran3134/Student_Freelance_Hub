import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import "./styles/home-page.css";

export default function HomePage() {
  const [userName, setUserName] = useState("Student");
  const [currentUser, setCurrentUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUserName(user.displayName || user.email?.split("@")[0] || "Student");
      }
    });
    return () => unsubscribe();
  }, []);

  // Bookmarks listener
  useEffect(() => {
    if (!currentUser?.uid) {
      setBookmarks([]);
      setLoadingBookmarks(false);
      return;
    }
    const q = query(collection(db, "bookmarks"), where("userId", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const bks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setBookmarks(bks);
      setLoadingBookmarks(false);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  // Sent Requests listener
  useEffect(() => {
    if (!currentUser?.uid) {
      setSentRequests([]);
      setLoadingRequests(false);
      return;
    }
    const q = query(collection(db, "sentRequests"), where("userId", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setSentRequests(reqs);
      setLoadingRequests(false);
    });
    return () => unsub();
  }, [currentUser?.uid]);

  const handleDeleteBookmark = async (bookmarkId) => {
    if (window.confirm("Remove this bookmark?")) {
      try {
        await deleteDoc(doc(db, "bookmarks", bookmarkId));
      } catch (error) {
        console.error("Error deleting bookmark:", error);
        alert("Failed to delete bookmark");
      }
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (window.confirm("Cancel this request?")) {
      try {
        await deleteDoc(doc(db, "sentRequests", requestId));
      } catch (error) {
        console.error("Error canceling request:", error);
        alert("Failed to cancel request");
      }
    }
  };

  const stats = [
    { label: "Active Projects", value: "3", change: "+1 this week" },
    { label: "Total Earnings", value: "$1,250", change: "+$450 this month" },
    { label: "Proposals Sent", value: "12", change: "4 pending" },
    { label: "Profile Views", value: "84", change: "+12% vs last week" },
  ];

  const opportunities = [
    { id: 1, title: "E-commerce Website Redesign", client: "TechFlow Inc.", budget: "$500 - $1k", tags: ["React", "CSS", "UX/UI"], time: "2h ago" },
    { id: 2, title: "Mobile App Logo Design", client: "StartUp X", budget: "$200 Fixed", tags: ["Figma", "Illustrator", "Branding"], time: "5h ago" },
    { id: 3, title: "Python Script for Data Scraping", client: "DataCorp", budget: "$30/hr", tags: ["Python", "Selenium", "Data"], time: "1d ago" },
  ];

  return (
    <div className="home-page">
      <div className="home-container">
        <header className="hero-header">
          <h1 className="welcome-title">
            Welcome back, <span className="gradient-text">{userName}</span>
          </h1>
          <p className="subtitle">
            Here's what's happening with your projects today. You have <span className="highlight">3 active projects</span> and <span className="highlight">4 new messages</span>.
          </p>
        </header>

        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-header">
                <span className="change-badge">{stat.change}</span>
              </div>
              <h3 className="stat-label">{stat.label}</h3>
              <p className="stat-value">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="content-layout">
          {/* Left Column - Bookmarks */}
          <div>
            <div className="section-title">📌 Bookmarked ({bookmarks.length})</div>
            {loadingBookmarks ? (
              <div className="empty-state"><p>Loading...</p></div>
            ) : bookmarks.length === 0 ? (
              <div className="empty-state">
                <p>No bookmarks yet</p>
                <button className="action-btn-secondary" onClick={() => window.location.hash = '#/browse'}>Browse</button>
              </div>
            ) : (
              <div className="bookmarks-list">
                {bookmarks.map((bk) => (
                  <div key={bk.id} className="bookmark-card">
                    <div className="bookmark-header">
                      <h4 className="bookmark-title">{bk.title}</h4>
                      <button className="delete-btn" onClick={() => handleDeleteBookmark(bk.id)}>×</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="bookmark-category">📁 {bk.category}</p>
                      <span className="bookmark-type">{bk.itemType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Trending Skills */}
            <div style={{ marginTop: '2rem' }}>
              <h3 className="sidebar-title">Trending Skills</h3>
              {["React Native", "TypeScript", "UI Design", "SEO", "Content Writing", "Video Editing"].map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>

          {/* Middle Column - Requests Sent */}
          <div>
            <div className="section-title">📤 Requests Sent ({sentRequests.length})</div>
            {loadingRequests ? (
              <div className="empty-state"><p>Loading...</p></div>
            ) : sentRequests.length === 0 ? (
              <div className="empty-state">
                <p>No requests sent yet</p>
                <button className="action-btn-secondary" onClick={() => window.location.hash = '#/browse'}>Browse</button>
              </div>
            ) : (
              <div className="bookmarks-list">
                {sentRequests.map((req) => (
                  <div key={req.id} className="bookmark-card">
                    <div className="bookmark-header">
                      <h4 className="bookmark-title">{req.title}</h4>
                      <button className="delete-btn" onClick={() => handleCancelRequest(req.id)}>×</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p className="bookmark-category">📁 {req.category}</p>
                      <span className="bookmark-type">{req.itemType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Quick Actions, Opportunities, Trending Skills */}
          <div>
            {/* Quick Actions */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Quick Actions</h3>
              <button className="action-btn-primary" onClick={() => window.location.hash = '#/post-service'}>+ Post Service</button>
              <button className="action-btn-secondary" onClick={() => window.location.hash = '#/browse'}>🔍 Find Work</button>
            </div>

            {/* Recommended Opportunities */}
            <div style={{ marginTop: '2rem' }}>
              <div className="section-title">
                Recommended Opportunities
                <button className="view-all-btn" onClick={() => window.location.hash = '#/browse'}>View All →</button>
              </div>
              {opportunities.map((job) => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <div>
                      <h3 className="job-title">{job.title}</h3>
                      <p className="job-meta">{job.client} • {job.time}</p>
                    </div>
                    <span className="budget-badge">{job.budget}</span>
                  </div>
                  <div className="tags-container">
                    {job.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
