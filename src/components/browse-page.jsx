import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import styles from "./styles/browse-page.module.css";

export default function BrowsePage() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "projects", "services"
  const [filterCategory, setFilterCategory] = useState("");

  // Dummy Projects Data - Cleared
  const dummyProjects = [];

  // Dummy Services Data - Cleared
  const dummyServices = [];

  const categories = [
    "Web Development",
    "Mobile App Development",
    "Graphic Design",
    "UI/UX Design",
    "Content Writing",
    "Copywriting",
    "Video Editing",
    "Photo Editing",
    "Digital Marketing",
    "SEO Services",
    "Social Media Management",
    "Data Entry",
    "Virtual Assistant",
    "Translation",
    "Tutoring",
    "Music Production",
    "Voice Over",
    "3D Modeling",
    "Animation",
    "Logo Design",
    "Branding",
    "Other",
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch projects from Firebase
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const projectsData = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "project",
          ...doc.data(),
        }));
        // Merge Firebase projects with dummy projects
        setProjects([...dummyProjects, ...projectsData]);

        // Fetch services from Firebase
        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "service",
          ...doc.data(),
        }));
        // Merge Firebase services with dummy services
        setServices([...dummyServices, ...servicesData]);
      } catch (error) {
        console.error("Error fetching data:", error);
        // If Firebase fails, still show dummy data
        setProjects(dummyProjects);
        setServices(dummyServices);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getDisplayItems = () => {
    let items = [];
    if (activeTab === "all") {
      items = [...projects, ...services];
    } else if (activeTab === "projects") {
      items = projects;
    } else if (activeTab === "services") {
      items = services;
    }

    if (filterCategory) {
      items = items.filter((item) => item.category === filterCategory);
    }

    return items;
  };

  const formatPrice = (item) => {
    if (item.type === "project") {
      if (item.paymentType === "volunteer") {
        return "Volunteer / Credit-based";
      }
      if (item.budgetMin && item.budgetMax) {
        return `${item.budgetMin} - ${item.budgetMax} ${item.currency || "PKR"}`;
      }
      return "Price not specified";
    } else {
      // Service
      if (item.pricingType === "single") {
        return item.singlePrice || "Price not specified";
      } else {
        // Tier pricing
        const prices = [];
        if (item.basicPrice) prices.push(`Basic: ${item.basicPrice}`);
        if (item.standardPrice) prices.push(`Standard: ${item.standardPrice}`);
        if (item.premiumPrice) prices.push(`Premium: ${item.premiumPrice}`);
        return prices.length > 0 ? prices.join(" | ") : "Price not specified";
      }
    }
  };

  const displayItems = getDisplayItems();

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Browse Projects & Services</h1>
          <p className={styles.subline}>Discover amazing opportunities and services from talented freelancers</p>
        </div>

        <div className={styles.filters}>
          <button
            className={`${styles.tabButton} ${activeTab === "all" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All ({projects.length + services.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "projects" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("projects")}
          >
            Projects ({projects.length})
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "services" ? styles.tabButtonActive : ""}`}
            onClick={() => setActiveTab("services")}
          >
            Services ({services.length})
          </button>
          <select
            className={styles.categorySelect}
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loading}>Loading projects and services...</div>
        ) : displayItems.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>No items found</div>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {displayItems.map((item) => (
              <div key={item.id} className={styles.card}>
                <div
                  className={`${styles.badge} ${item.type === "project" ? styles.badgeProject : styles.badgeService
                    }`}
                >
                  {item.type === "project" ? "Project" : "Service"}
                </div>
                <h3 className={styles.cardTitle}>
                  {item.type === "project" ? item.projectTitle : item.title}
                </h3>
                {item.category && <div className={styles.cardCategory}>📁 {item.category}</div>}
                <p className={styles.cardDescription}>
                  {item.description || "No description available."}
                </p>
                <div className={styles.cardPrice}>{formatPrice(item)}</div>
                <div className={styles.cardMeta}>
                  {item.type === "project" ? (
                    <>
                      {item.personName && <div>👤 {item.personName}</div>}
                      {item.deadline && (
                        <div>📅 Deadline: {new Date(item.deadline).toLocaleDateString()}</div>
                      )}
                      {item.requiredSkills && <div>🛠️ Skills: {item.requiredSkills}</div>}
                    </>
                  ) : (
                    <>
                      {item.userName && <div>👤 {item.userName}</div>}
                      {item.completionTime && <div>⏱️ {item.completionTime}</div>}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}