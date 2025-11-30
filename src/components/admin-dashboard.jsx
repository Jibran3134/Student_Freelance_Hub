import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import styles from "./styles/admin-dashboard.module.css";

const ADMIN_EMAILS = [
  "alishba11@gmail.com",
  "jibran22@gmail.com",
  "umar33@gmail.com",
  "abdullah44@gmail.com"
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalPosts: 0,
    activePosts: 0,
    newUsersThisMonth: 0,
  });

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      const user = auth.currentUser;

      // 1. Security Check
      if (!user || !ADMIN_EMAILS.includes(user.email)) {
        // Redirect non-admins
        window.location.hash = "#/login";
        return;
      }

      setLoading(true);
      try {
        // 2. Fetch Users
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(u => !u.deletedByAdmin); // Exclude deleted users

        setUsers(usersList);

        // 3. Fetch Posts (Projects & Services)
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const servicesSnapshot = await getDocs(collection(db, "services"));

        const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, type: 'Project', ...doc.data() }));
        const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, type: 'Service', ...doc.data() }));

        const allPosts = [...projects, ...services];
        setPosts(allPosts);

        // 4. Calculate Stats
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const newUsers = usersList.filter(u => {
          if (!u.createdAt) return false;
          const created = new Date(u.createdAt);
          return created >= firstDayOfMonth;
        }).length;

        setReports({
          totalUsers: usersList.length,
          activeUsers: usersList.length,
          totalPosts: allPosts.length,
          activePosts: allPosts.length,
          newUsersThisMonth: newUsers
        });

      } catch (error) {
        console.error("Error fetching admin data:", error);
        alert("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth state to ensure user is loaded before checking
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkAdminAndFetchData();
      } else {
        window.location.hash = "#/login";
      }
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? They will be blocked from logging in.")) {
      return;
    }

    try {
      // Soft delete in Firestore
      await updateDoc(doc(db, "users", userId), {
        deletedByAdmin: true
      });

      // Update local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      setReports(prev => ({
        ...prev,
        totalUsers: prev.totalUsers - 1,
        activeUsers: prev.activeUsers - 1
      }));

      alert("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  const handleDeletePost = async (postId, type) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      const collectionName = type === 'Project' ? 'projects' : 'services';
      await deleteDoc(doc(db, collectionName, postId));

      setPosts(prev => prev.filter(p => p.id !== postId));
      setReports(prev => ({
        ...prev,
        totalPosts: prev.totalPosts - 1,
        activePosts: prev.activePosts - 1
      }));

      alert("Post deleted successfully.");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post.");
    }
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div style={{ color: 'white', textAlign: 'center', padding: '2rem' }}>
            Loading Dashboard...
          </div>
        </div>
      </div>
    );
  }

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
            <div style={{ overflowX: 'auto' }}>
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
                      <td className={styles.td}>{user.id.substring(0, 8)}...</td>
                      <td className={styles.td}>{user.name || "Anonymous"}</td>
                      <td className={styles.td}>{user.email || "No Email"}</td>
                      <td className={styles.td}>{user.visibility === 'students' ? 'Student' : 'Public User'}</td>
                      <td className={styles.td}>
                        <span
                          className={`${styles.badge} ${user.availability === "online" ? styles.badgeActive : styles.badgeInactive
                            }`}
                        >
                          {user.availability || "Unknown"}
                        </span>
                      </td>
                      <td className={styles.td}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td className={styles.td}>
                        <button className={styles.button} onClick={() => handleDeleteUser(user.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="7" className={styles.td} style={{ textAlign: 'center' }}>No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "posts" && (
          <div className={styles.card}>
            <h2 className={styles.sectionHeading}>Post Management</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.th}>ID</th>
                    <th className={styles.th}>Title</th>
                    <th className={styles.th}>Type</th>
                    <th className={styles.th}>Date</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id}>
                      <td className={styles.td}>{post.id.substring(0, 8)}...</td>
                      <td className={styles.td}>{post.title || post.projectTitle || "Untitled"}</td>
                      <td className={styles.td}>{post.type}</td>
                      <td className={styles.td}>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "N/A"}</td>
                      <td className={styles.td}>
                        <span className={`${styles.badge} ${styles.badgeActive}`}>
                          Active
                        </span>
                      </td>
                      <td className={styles.td}>
                        <button className={styles.button} onClick={() => handleDeletePost(post.id, post.type)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {posts.length === 0 && (
                    <tr>
                      <td colSpan="6" className={styles.td} style={{ textAlign: 'center' }}>No posts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}