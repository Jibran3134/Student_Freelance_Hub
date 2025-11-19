import React, { useState } from "react";
import styles from "./styles/admin-dashboard.module.css";

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
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>Manage users, posts, and view reports</p>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{reports.totalUsers}</div>
            <div className={styles.statLabel}>Total Users</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{reports.activeUsers}</div>
            <div className={styles.statLabel}>Active Users</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{reports.totalPosts}</div>
            <div className={styles.statLabel}>Total Posts</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{reports.newUsersThisMonth}</div>
            <div className={styles.statLabel}>New This Month</div>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "users" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("users")}
          >
            Manage Users
          </button>
          <button
            className={`${styles.tab} ${activeTab === "posts" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            Manage Posts
          </button>
        </div>

        {activeTab === "users" && (
          <div className={styles.card}>
            <h2 className={styles.sectionHeading}>User Management</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Name</th>
                  <th className={styles.th}>Email</th>
                  <th className={styles.th}>Role</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Join Date</th>
                  <th className={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className={styles.td}>{user.id}</td>
                    <td className={styles.td}>{user.name}</td>
                    <td className={styles.td}>{user.email}</td>
                    <td className={styles.td}>{user.role}</td>
                    <td className={styles.td}>
                      <span
                        className={`${styles.badge} ${
                          user.status === "Active" ? styles.badgeActive : styles.badgeInactive
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className={styles.td}>{user.joinDate}</td>
                    <td className={styles.td}>
                      <button className={styles.button} onClick={() => handleDeleteUser(user.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "posts" && (
          <div className={styles.card}>
            <h2 className={styles.sectionHeading}>Post Management</h2>
            <table className={styles.table}>
                <thead>
                  <tr>
                  <th className={styles.th}>ID</th>
                  <th className={styles.th}>Title</th>
                  <th className={styles.th}>Author</th>
                  <th className={styles.th}>Date</th>
                  <th className={styles.th}>Status</th>
                  <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td className={styles.td}>{post.id}</td>
                    <td className={styles.td}>{post.title}</td>
                    <td className={styles.td}>{post.author}</td>
                    <td className={styles.td}>{post.date}</td>
                    <td className={styles.td}>
                      <span className={`${styles.badge} ${styles.badgeActive}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <button className={styles.button} onClick={() => handleDeletePost(post.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
        )}

      </div>
    </div>
  );
}