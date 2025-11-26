import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import "./styles/home-page.css";

export default function HomePage() {
  const [userName, setUserName] = useState("Student");
  const [currentUser, setCurrentUser] = useState(null);
  const [sentRequests, setSentRequests] = useState([]);
  const [enrolledProjects, setEnrolledProjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        if (user.displayName) {
          setUserName(user.displayName);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }
      } else {
        setUserName("Student");
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to bookmarks
  useEffect(() => {
    if (!currentUser?.uid) {
      setBookmarks([]);
      setLoadingBookmarks(false);
      return;
    }

    const bookmarksQuery = query(
      collection(db, "bookmarks"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(bookmarksQuery, (snapshot) => {
      const bks = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBookmarks(bks);
      setLoadingBookmarks(false);
    }, (error) => {
      console.error("Error fetching bookmarks:", error);
      setLoadingBookmarks(false);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Listen to sent requests (pending status)
  useEffect(() => {
    if (!currentUser?.uid) {
      setSentRequests([]);
      return;
    }

    const sentQuery = query(
      collection(db, "requests"),
      where("requesterId", "==", currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(sentQuery, (snapshot) => {
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSentRequests(requests);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Listen to enrolled projects (accepted status)
  useEffect(() => {
    if (!currentUser?.uid) {
      setEnrolledProjects([]);
      return;
    }

    const enrolledQuery = query(
      collection(db, "requests"),
      where("requesterId", "==", currentUser.uid),
      where("status", "==", "accepted")
    );

    const unsubscribe = onSnapshot(enrolledQuery, (snapshot) => {
      const projects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEnrolledProjects(projects);
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // Handle Turn In Work
  const handleTurnIn = async (projectId) => {
    if (!window.confirm("Are you sure you want to turn in this work? This will mark the project as completed.")) return;

    try {
      await updateDoc(doc(db, "requests", projectId), {
        status: "completed",
        completedAt: serverTimestamp(),
      });
      window.alert("Work turned in successfully! Redirecting to wallet...");
      window.location.hash = "#/wallet";
    } catch (error) {
      console.error("Error turning in work:", error);
      window.alert("Failed to turn in work. Please try again.");
    }
  };

  // Calculate countdown
  const getCountdown = (deadlineStr) => {
    if (!deadlineStr) return "No deadline";
    try {
      const deadline = new Date(deadlineStr);
      const now = new Date();
      const diff = deadline - now;

      if (diff < 0) return "Expired";

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

      return `${days}d ${hours}h remaining`;
    } catch {
      return "Invalid deadline";
    }
  };

  // Mock data
  const stats = [
    { label: "Active Projects", value: "3", change: "+1 this week" },
    { label: "Total Earnings", value: "$1,250", change: "+$450 this month" },
    { label: "Proposals Sent", value: "12", change: "4 pending" },
    { label: "Profile Views", value: "84", change: "+12% vs last week" },
  ];

  const opportunities = [
    {
      id: 1,
      title: "E-commerce Website Redesign",
      client: "TechFlow Inc.",
      budget: "$500 - $1k",
      tags: ["React", "CSS", "UX/UI"],
      time: "2h ago",
    },
    {
      id: 2,
      title: "Mobile App Logo Design",
      client: "StartUp X",
      budget: "$200 Fixed",
      tags: ["Figma", "Illustrator", "Branding"],
      time: "5h ago",
    },
    {
      id: 3,
      title: "Python Script for Data Scraping",
      client: "DataCorp",
      budget: "$30/hr",
      tags: ["Python", "Selenium", "Data"],
      time: "1d ago",
    },
  ];

  return (
    <div className="home-page">
      <div className="home-container">
        {/* Hero */}
        <header className="hero-header">
          <h1 className="welcome-title">
            Welcome back, <span className="gradient-text">{userName}</span>
          </h1>
          <p className="subtitle">
            Here's what's happening with your projects today. You have <span className="highlight">3 active projects</span> and <span className="highlight">4 new messages</span>.
          </p>
        </header>

        {/* Stats Grid */}
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

        {/* Main Content */}
        <div className="content-layout">
          {/* Left Column - Bookmarks */}
          <div>
            <div className="section-title">
              📌 Bookmarks ({bookmarks.length})
            </div>
            {loadingBookmarks ? (
              <div className="empty-state">
                <p>Loading bookmarks...</p>
              </div>
            ) : bookmarks.length === 0 ? (
              <div className="empty-state">
                <p>No bookmarks yet.</p>
              </div>
            ) : (
              <div className="bookmarks-list">
                {bookmarks.map((bookmark) => (
                  <div key={bookmark.id} className="bookmark-card">
                    <div className="bookmark-header">
                      <h4 className="bookmark-title">{bookmark.title}</h4>
                      <span className="bookmark-type">{bookmark.itemType}</span>
                    </div>
                    <p className="bookmark-category">{bookmark.category}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Center Column - Feed */}
          <div>
            {/* Enrolled Projects Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="section-title">
                ✅ Enrolled Projects ({enrolledProjects.length})
              </div>
              {enrolledProjects.length === 0 ? (
                <div className="empty-state">
                  <p>No enrolled projects yet. Send requests to get started!</p>
                </div>
              ) : (
                <div className="requests-list">
                  {enrolledProjects.map((project) => (
                    <div key={project.id} className="request-card">
                      <div className="request-header">
                        <h3 className="request-title">{project.projectTitle}</h3>
                        <span className="status-badge status-accepted">Accepted</span>
                      </div>
                      <p className="request-type">Type: {project.projectType}</p>
                      <div className="countdown-timer">
                        ⏱️ {getCountdown(project.deadline)}
                      </div>
                      <button
                        className="action-btn-primary"
                        style={{ marginTop: '1rem', width: '100%', fontSize: '0.9rem' }}
                        onClick={() => handleTurnIn(project.id)}
                      >
                        ✅ Turn In Work
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests Section */}
            <div style={{ marginBottom: '2rem' }}>
              <div className="section-title">
                📤 Sent Requests ({sentRequests.length})
              </div>
              {sentRequests.length === 0 ? (
                <div className="empty-state">
                  <p>No pending requests. Go to Browse page to send requests!</p>
                  <button className="action-btn-secondary" onClick={() => window.location.hash = '#/browse'}>
                    Browse Projects
                  </button>
                </div>
              ) : (
                <div className="requests-list">
                  {sentRequests.map((request) => (
                    <div key={request.id} className="request-card">
                      <div className="request-header">
                        <h3 className="request-title">{request.projectTitle}</h3>
                        <span className="status-badge status-pending">Pending</span>
                      </div>
                      <p className="request-meta">Sent to: {request.projectOwnerId}</p>
                      <p className="request-type">{request.projectType}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommended Opportunities */}
            <div>
              <div className="section-title">
                Recommended Opportunities
                <button className="view-all-btn">View All &rarr;</button>
              </div>

              <div>
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

          {/* Right Column - Sidebar */}
          <div>
            <div className="sidebar-card">
              <h3 className="sidebar-title">Quick Actions</h3>
              <button className="action-btn-primary" onClick={() => window.location.hash = '#/post-service'}>
                <span>+</span> Post a Service
              </button>
              <button className="action-btn-secondary" onClick={() => window.location.hash = '#/browse'}>
                <span>🔍</span> Find Work
              </button>
            </div>

            <div>
              <h3 className="sidebar-title">Trending Skills</h3>
              <div>
                {["React Native", "TypeScript", "UI Design", "SEO", "Content Writing", "Video Editing"].map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
