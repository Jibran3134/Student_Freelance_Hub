import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc } from "firebase/firestore";
import "./styles/home-page.css";

export default function HomePage() {
  const [userName, setUserName] = useState("Student");
  const [currentUser, setCurrentUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingReceivedRequests, setLoadingReceivedRequests] = useState(true);

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

  // Received Requests listener (requests sent to current user's projects)
  useEffect(() => {
    if (!currentUser?.uid) {
      setReceivedRequests([]);
      setLoadingReceivedRequests(false);
      return;
    }
    const q = query(collection(db, "sentRequests"), where("ownerId", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const reqs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReceivedRequests(reqs);
      setLoadingReceivedRequests(false);
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

  const handleAcceptRequest = async (requestId) => {
    try {
      await updateDoc(doc(db, "sentRequests", requestId), {
        status: "accepted"
      });
      alert("Request accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    if (window.confirm("Reject this request?")) {
      try {
        await updateDoc(doc(db, "sentRequests", requestId), {
          status: "rejected"
        });
        alert("Request rejected");
      } catch (error) {
        console.error("Error rejecting request:", error);
        alert("Failed to reject request");
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

        <div className="content-layout-4col">
          {/* Column 1 - Bookmarks */}
          <div>
            <div className="section-title-small">📌 Bookmarks ({bookmarks.length})</div>
            {loadingBookmarks ? (
              <div className="empty-state-small"><p>Loading...</p></div>
            ) : bookmarks.length === 0 ? (
              <div className="empty-state-small">
                <p>No bookmarks yet</p>
                <button className="action-btn-secondary-small" onClick={() => window.location.hash = '#/browse'}>Browse</button>
              </div>
            ) : (
              <div className="bookmarks-list">
                {bookmarks.map((bk) => (
                  <div key={bk.id} className="bookmark-card-small">
                    <div className="bookmark-header">
                      <h4 className="bookmark-title-small">{bk.title}</h4>
                      <button className="delete-btn" onClick={() => handleDeleteBookmark(bk.id)}>×</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <p className="bookmark-category-small">📁 {bk.category}</p>
                      <span className="bookmark-type-small">{bk.itemType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2 - Requests Sent */}
          <div>
            <div className="section-title-small">📤 Sent ({sentRequests.length})</div>
            {loadingRequests ? (
              <div className="empty-state-small"><p>Loading...</p></div>
            ) : sentRequests.length === 0 ? (
              <div className="empty-state-small">
                <p>No requests sent</p>
                <button className="action-btn-secondary-small" onClick={() => window.location.hash = '#/browse'}>Browse</button>
              </div>
            ) : (
              <div className="bookmarks-list">
                {sentRequests.map((req) => (
                  <div key={req.id} className="bookmark-card-small">
                    <div className="bookmark-header">
                      <h4 className="bookmark-title-small">{req.title}</h4>
                      <button className="delete-btn" onClick={() => handleCancelRequest(req.id)}>×</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <p className="bookmark-category-small">📁 {req.category}</p>
                      <span className="bookmark-type-small">{req.itemType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 3 - Requests Received */}
          <div>
            <div className="section-title-small">📥 Received ({receivedRequests.length})</div>
            {loadingReceivedRequests ? (
              <div className="empty-state-small"><p>Loading...</p></div>
            ) : receivedRequests.length === 0 ? (
              <div className="empty-state-small">
                <p>No requests received</p>
              </div>
            ) : (
              <div className="bookmarks-list">
                {receivedRequests.map((req) => (
                  <div key={req.id} className="bookmark-card-small">
                    <div className="bookmark-header">
                      <h4 className="bookmark-title-small">{req.title}</h4>
                    </div>
                    <div style={{ marginTop: '0.5rem' }}>
                      <p className="bookmark-category-small">📁 {req.category}</p>
                      <p className="request-sender-small">From: {req.userName || 'Unknown'}</p>
                      {(!req.status || req.status === 'pending') && (
                        <div className="request-actions">
                          <button className="accept-btn" onClick={() => handleAcceptRequest(req.id)}>✓ Accept</button>
                          <button className="reject-btn" onClick={() => handleRejectRequest(req.id)}>✗ Reject</button>
                        </div>
                      )}
                      {req.status === 'accepted' && <span className="status-badge status-accepted">Accepted</span>}
                      {req.status === 'rejected' && <span className="status-badge status-rejected">Rejected</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 4 - Quick Actions */}
          <div>
            <div className="section-title-small">⚡ Quick Actions</div>
            <div className="sidebar-card-small">
              <button className="action-btn-primary-small" onClick={() => window.location.hash = '#/post-service'}>+ Post Service</button>
              <button className="action-btn-secondary-small" onClick={() => window.location.hash = '#/browse'}>🔍 Find Work</button>
            </div>
          </div>
        </div>

        {/* Opportunities and Trending Skills - Side by Side */}
        <div className="bottom-section">
          {/* Left - Recommended Opportunities */}
          <div className="opportunities-section">
            <div className="section-title">
              Recommended Opportunities
              <button className="view-all-btn" onClick={() => window.location.hash = '#/browse'}>View All →</button>
            </div>
            <div className="opportunities-list">
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

          {/* Right - Trending Skills */}
          <div className="trending-skills-section">
            <div className="section-title">Trending Skills</div>
            <div className="skills-grid">
              {["React Native", "TypeScript", "UI Design", "SEO", "Content Writing", "Video Editing", "Python", "Figma", "Node.js", "Digital Marketing", "Data Analysis", "WordPress"].map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
