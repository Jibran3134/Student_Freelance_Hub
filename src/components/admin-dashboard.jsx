import React, { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  
  // Mock data - API INTEGRATION: Replace with real API calls
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Student", status: "Active", joinDate: "2024-01-15" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Freelancer", status: "Active", joinDate: "2024-02-20" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", role: "Student", status: "Inactive", joinDate: "2024-03-10" },
  ]);

  const [posts] = useState([
    { id: 1, title: "Web Development Project", author: "John Doe", date: "2024-04-15", status: "Active" },
    { id: 2, title: "Mobile App Design", author: "Jane Smith", date: "2024-04-18", status: "Active" },
    { id: 3, title: "Logo Design Request", author: "Bob Johnson", date: "2024-04-20", status: "Active" },
  ]);

  const [reports] = useState({
    totalUsers: 150,
    activeUsers: 120,
    totalPosts: 45,
    activePosts: 42,
    newUsersThisMonth: 25,
  });

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "2rem 1.5rem",
    },
    header: {
      marginBottom: "2rem",
    },
    title: {
      fontSize: "clamp(1.8rem, 3vw, 2.5rem)",
      fontWeight: 800,
      letterSpacing: "-0.02em",
      marginBottom: "0.5rem",
      background: "linear-gradient(90deg, #F9FAFB 0%, #D1D5DB 20%, #8B5CF6 50%, #D1D5DB 80%, #F9FAFB 100%)",
      backgroundSize: "300% 100%",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
      animation: "textShimmer 10s ease-in-out infinite",
    },
    subtitle: {
      color: "#9CA3AF",
      fontSize: "0.95rem",
    },
    tabs: {
      display: "flex",
      gap: "0.5rem",
      marginBottom: "2rem",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    tab: {
      padding: "0.75rem 1.5rem",
      background: "transparent",
      border: "none",
      borderBottom: "2px solid transparent",
      color: "#9CA3AF",
      fontSize: "0.95rem",
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    tabActive: {
      color: "#F9FAFB",
      borderBottomColor: "#8B5CF6",
    },
    card: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
      padding: "1.5rem",
      marginBottom: "1.5rem",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1rem",
      marginBottom: "2rem",
    },
    statCard: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px",
      padding: "1.25rem",
      textAlign: "center",
    },
    statValue: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#F9FAFB",
      marginBottom: "0.25rem",
    },
    statLabel: {
      color: "#9CA3AF",
      fontSize: "0.9rem",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      padding: "0.75rem",
      color: "#D1D5DB",
      fontWeight: 600,
      fontSize: "0.9rem",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
    },
    td: {
      padding: "0.75rem",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      color: "#E5E7EB",
      fontSize: "0.9rem",
    },
    badge: {
      display: "inline-block",
      padding: "0.25rem 0.75rem",
      borderRadius: "12px",
      fontSize: "0.8rem",
      fontWeight: 600,
    },
    badgeActive: {
      background: "rgba(34, 197, 94, 0.2)",
      color: "#4ADE80",
    },
    badgeInactive: {
      background: "rgba(239, 68, 68, 0.2)",
      color: "#F87171",
    },
    button: {
      padding: "0.5rem 1rem",
      background: "rgba(239, 68, 68, 0.2)",
      border: "1px solid rgba(239, 68, 68, 0.3)",
      borderRadius: "8px",
      color: "#F87171",
      fontSize: "0.85rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.2s ease",
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem",
      color: "#9CA3AF",
    },
  };

  const handleDeleteUser = (userId) => {
    // API INTEGRATION: Replace with actual delete API call
    // Example: await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    console.log("Delete user:", userId);
    alert(`User ${userId} would be deleted (API integration needed)`);
  };

  const handleDeletePost = (postId) => {
    // API INTEGRATION: Replace with actual delete API call
    // Example: await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    console.log("Delete post:", postId);
    alert(`Post ${postId} would be deleted (API integration needed)`);
  };

  return (
    <>
      <style>
        {`
          @keyframes textShimmer {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div style={styles.page}>
        <div style={styles.container}>
          <div style={styles.header}>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>Manage users, posts, and view reports</p>
          </div>

          {/* Stats Overview */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{reports.totalUsers}</div>
              <div style={styles.statLabel}>Total Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{reports.activeUsers}</div>
              <div style={styles.statLabel}>Active Users</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{reports.totalPosts}</div>
              <div style={styles.statLabel}>Total Posts</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statValue}>{reports.newUsersThisMonth}</div>
              <div style={styles.statLabel}>New This Month</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === "users" ? styles.tabActive : {}) }}
              onClick={() => setActiveTab("users")}
            >
              Manage Users
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === "posts" ? styles.tabActive : {}) }}
              onClick={() => setActiveTab("posts")}
            >
              Manage Posts
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === "reports" ? styles.tabActive : {}) }}
              onClick={() => setActiveTab("reports")}
            >
              Reports
            </button>
          </div>

          {/* Users Tab */}
          {activeTab === "users" && (
            <div style={styles.card}>
              <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "#F9FAFB" }}>
                User Management
              </h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Join Date</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td style={styles.td}>{user.id}</td>
                      <td style={styles.td}>{user.name}</td>
                      <td style={styles.td}>{user.email}</td>
                      <td style={styles.td}>{user.role}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...(user.status === "Active" ? styles.badgeActive : styles.badgeInactive) }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={styles.td}>{user.joinDate}</td>
                      <td style={styles.td}>
                        <button
                          style={styles.button}
                          onClick={() => handleDeleteUser(user.id)}
                          onMouseEnter={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.3)"; }}
                          onMouseLeave={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.2)"; }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* API INTEGRATION: Replace mock data with real API call to fetch users */}
            </div>
          )}

          {/* Posts Tab */}
          {activeTab === "posts" && (
            <div style={styles.card}>
              <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem", fontWeight: 700, color: "#F9FAFB" }}>
                Post Management
              </h2>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Title</th>
                    <th style={styles.th}>Author</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td style={styles.td}>{post.id}</td>
                      <td style={styles.td}>{post.title}</td>
                      <td style={styles.td}>{post.author}</td>
                      <td style={styles.td}>{post.date}</td>
                      <td style={styles.td}>
                        <span style={{ ...styles.badge, ...styles.badgeActive }}>
                          {post.status}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={styles.button}
                          onClick={() => handleDeletePost(post.id)}
                          onMouseEnter={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.3)"; }}
                          onMouseLeave={(e) => { e.target.style.background = "rgba(239, 68, 68, 0.2)"; }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* API INTEGRATION: Replace mock data with real API call to fetch posts */}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div style={styles.card}>
              <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem", fontWeight: 700, color: "#F9FAFB" }}>
                Reports & Analytics
              </h2>
              <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{reports.totalUsers}</div>
                  <div style={styles.statLabel}>Total Users</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{reports.activeUsers}</div>
                  <div style={styles.statLabel}>Active Users</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{reports.totalPosts}</div>
                  <div style={styles.statLabel}>Total Posts</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{reports.activePosts}</div>
                  <div style={styles.statLabel}>Active Posts</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>{reports.newUsersThisMonth}</div>
                  <div style={styles.statLabel}>New Users (This Month)</div>
                </div>
                <div style={styles.statCard}>
                  <div style={styles.statValue}>
                    {Math.round((reports.activeUsers / reports.totalUsers) * 100)}%
                  </div>
                  <div style={styles.statLabel}>User Activity Rate</div>
                </div>
              </div>
              {/* API INTEGRATION: Replace mock data with real API call to fetch reports/analytics */}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

