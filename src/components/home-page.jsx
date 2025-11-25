import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./styles/home-page.css";

export default function HomePage() {
  const [userName, setUserName] = useState("Student");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
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
          {/* Feed */}
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

          {/* Sidebar */}
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
