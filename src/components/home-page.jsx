import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, deleteDoc, doc, updateDoc, addDoc, serverTimestamp, orderBy } from "firebase/firestore";
import "./styles/home-page.css";

export default function HomePage() {
  const [userName, setUserName] = useState("Student");
  const [currentUser, setCurrentUser] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [enrolledProjects, setEnrolledProjects] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [loadingReceivedRequests, setLoadingReceivedRequests] = useState(true);
  const [loadingEnrolled, setLoadingEnrolled] = useState(true);

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUserName(user.displayName || user.email?.split("@")[0] || "Student");
      }
    });
    return () => unsubscribe();
  }, []);

  // Notifications listener
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([]);
      setLoadingNotifications(false);
      return;
    }
    const q = query(collection(db, "notifications"), where("userId", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      // Sort in client-side to avoid Firestore index requirement
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setNotifications(notifs);
      setLoadingNotifications(false);
    });
    return () => unsub();
  }, [currentUser?.uid]);

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

  // Enrolled Projects listener (projects user is working on)
  useEffect(() => {
    if (!currentUser?.uid) {
      setEnrolledProjects([]);
      setLoadingEnrolled(false);
      return;
    }
    const q = query(collection(db, "enrolledProjects"), where("workerId", "==", currentUser.uid));
    const unsub = onSnapshot(q, (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setEnrolledProjects(projects);
      setLoadingEnrolled(false);
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

  const handleAcceptRequest = async (requestId, request) => {
    try {
      // Create enrolled project for the requester
      await addDoc(collection(db, "enrolledProjects"), {
        workerId: request.userId, // Person who sent the request
        workerName: request.userName,
        ownerId: currentUser.uid, // Person who posted the project
        ownerName: currentUser.displayName || currentUser.email?.split("@")[0] || "Project Owner",
        ownerPhone: currentUser.phoneNumber || "+92 300 0000000", // TODO: Get from user profile
        projectId: request.itemId,
        title: request.title,
        category: request.category,
        itemType: request.itemType,
        status: "in-progress",
        progress: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
        createdAt: serverTimestamp(),
      });

      // Send notification to the requester
      await addDoc(collection(db, "notifications"), {
        userId: request.userId,
        message: `Your request for "${request.title}" has been ACCEPTED!`,
        type: "success",
        createdAt: serverTimestamp(),
        read: false
      });

      // Delete the request from sentRequests (so it moves from "Sent" to "Enrolled")
      await deleteDoc(doc(db, "sentRequests", requestId));

      alert("Request accepted! Project moved to worker's enrolled projects.");
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept request: " + error.message);
    }
  };

  const handleRejectRequest = async (requestId, request) => {
    if (window.confirm("Reject this request? This will permanently remove it.")) {
      try {
        // Send notification to the requester BEFORE deleting
        await addDoc(collection(db, "notifications"), {
          userId: request.userId,
          message: `Your request for "${request.title}" has been REJECTED.`,
          type: "error",
          createdAt: serverTimestamp(),
          read: false
        });

        // Delete the request completely
        await deleteDoc(doc(db, "sentRequests", requestId));
        alert("Request rejected and removed");
      } catch (error) {
        console.error("Error rejecting request:", error);
        alert("Failed to reject request");
      }
    }
  };

  const handleTurnIn = (projectId) => {
    // TODO: Implement turn in functionality
    alert(`Turn in functionality for project ${projectId} will be implemented in backend`);
  };

  const handleWhatsAppContact = (phoneOrUserId, projectTitle) => {
    // For now, use a placeholder phone number
    // TODO: Fetch actual phone number from user profile based on userId
    const phoneNumber = phoneOrUserId?.includes('+') ? phoneOrUserId : '+92 300 0000000';
    const message = encodeURIComponent(`Hi! I'm interested in discussing "${projectTitle}" with you.`);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\s+/g, '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
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
          {/* Column 1 - Enrolled Projects */}
          <div>
            <div className="section-title-small">💼 Enrolled Projects ({enrolledProjects.length})</div>
            {loadingEnrolled ? (
              <div className="empty-state-small"><p>Loading...</p></div>
            ) : enrolledProjects.length === 0 ? (
              <div className="empty-state-small">
                <p>No enrolled projects</p>
                <button className="action-btn-secondary-small" onClick={() => window.location.hash = '#/browse'}>Browse</button>
              </div>
            ) : (
              <div className="bookmarks-list">
                {enrolledProjects.map((project) => (
                  <div key={project.id} className="enrolled-card">
                    <div className="enrolled-header">
                      <h4 className="bookmark-title-small">{project.title}</h4>
                      <span className="progress-badge">{project.progress}%</span>
                    </div>
                    <p className="bookmark-category-small">📁 {project.category}</p>
                    <p className="enrolled-owner">Client: {project.ownerName}</p>
                    <p className="enrolled-deadline">⏰ Due: {new Date(project.deadline).toLocaleDateString()}</p>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                    </div>
                    <div className="enrolled-actions">
                      <button className="turn-in-btn" onClick={() => handleTurnIn(project.id)}>
                        📋 Turn In
                      </button>
                      <button className="whatsapp-btn" onClick={() => handleWhatsAppContact(project.ownerPhone, project.title)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                        </svg>
                      </button>
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
                        <>
                          <div className="request-actions">
                            <button className="accept-btn" onClick={() => handleAcceptRequest(req.id, req)}>✓ Accept</button>
                            <button className="reject-btn" onClick={() => handleRejectRequest(req.id, req)}>✗ Reject</button>
                          </div>
                          <button
                            className="whatsapp-btn-full"
                            onClick={() => handleWhatsAppContact(req.userId, req.title)}
                            style={{ marginTop: '0.5rem', width: '100%' }}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Contact via WhatsApp
                          </button>
                        </>
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

        {/* Bottom Section - Opportunities, Bookmarks, and Trending Skills */}
        <div className="bottom-section-3col">
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

          {/* Middle - Bookmarks */}
          <div className="bookmarks-section">
            <div className="section-title">📌 Bookmarks ({bookmarks.length})</div>
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
                  <div key={bk.id} className="bookmark-card">
                    <div className="bookmark-header">
                      <h4 className="bookmark-title">{bk.title}</h4>
                      <button className="delete-btn" onClick={() => handleDeleteBookmark(bk.id)}>×</button>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      <p className="bookmark-category">📁 {bk.category}</p>
                      <span className="bookmark-type">{bk.itemType}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
