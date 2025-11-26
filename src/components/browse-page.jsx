import React, { useEffect, useMemo, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./styles/browse-page.module.css";

export default function BrowsePage() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [filterCategory, setFilterCategory] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const dummyProjects = [
    {
      id: "dummy-proj-1",
      type: "project",
      personName: "Sarah Johnson",
      projectTitle: "E-commerce Website Development",
      description: "Looking for an experienced developer to build a modern e-commerce platform with payment integration, inventory management, and admin dashboard. Must have experience with React and Node.js.",
      category: "Web Development",
      paymentType: "fixed",
      budgetMin: "50000",
      budgetMax: "80000",
      currency: "PKR",
      deadline: "2024-03-15",
    },
    {
      id: "dummy-proj-2",
      type: "project",
      personName: "Michael Chen",
      projectTitle: "Mobile App for Food Delivery",
      description: "Need a talented team to develop a food delivery mobile app for both iOS and Android. Features include real-time tracking, payment gateway, and restaurant management system.",
      category: "Mobile App Development",
      paymentType: "hourly",
      budgetMin: "25",
      budgetMax: "40",
      currency: "USD",
      deadline: "2024-04-01",
    },
    {
      id: "dummy-proj-3",
      type: "project",
      personName: "Emma Williams",
      projectTitle: "Brand Identity Design Package",
      description: "Seeking a creative graphic designer to develop a complete brand identity including logo, color palette, typography, and brand guidelines for a new tech startup.",
      category: "Graphic Design",
      paymentType: "fixed",
      budgetMin: "15000",
      budgetMax: "25000",
      currency: "PKR",
      deadline: "2024-02-28",
    },
  ];

  const dummyServices = [
    {
      id: "dummy-serv-1",
      type: "service",
      userName: "Alex Thompson",
      title: "Full-Stack Web Development Services",
      description: "Professional web development services using modern technologies. I specialize in React, Node.js, and MongoDB.",
      category: "Web Development",
      pricingType: "tier",
      basicPrice: "20000 PKR",
      standardPrice: "35000 PKR",
      premiumPrice: "50000 PKR",
    },
    {
      id: "dummy-serv-2",
      type: "service",
      userName: "Jessica Park",
      title: "Professional Logo Design & Branding",
      description: "Creative logo design and complete branding solutions.",
      category: "Logo Design",
      pricingType: "single",
      singlePrice: "12000 PKR",
    },
  ];

  const categories = ["Web Development", "Mobile App Development", "Graphic Design", "UI/UX Design", "Content Writing", "Video Editing", "Logo Design", "Other"];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const projectsData = projectsSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "project",
          ...doc.data(),
        }));
        setProjects([...dummyProjects, ...projectsData]);

        const servicesSnapshot = await getDocs(collection(db, "services"));
        const servicesData = servicesSnapshot.docs.map((doc) => ({
          id: doc.id,
          type: "service",
          ...doc.data(),
        }));
        setServices([...dummyServices, ...servicesData]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setProjects(dummyProjects);
        setServices(dummyServices);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBookmark = async () => {
    if (!currentUser) {
      alert("Please login to bookmark items");
      return;
    }
    setActionLoading(true);
    try {
      await addDoc(collection(db, "bookmarks"), {
        userId: currentUser.uid,
        itemId: selectedItem.id,
        itemType: selectedItem.type,
        title: selectedItem.type === "project" ? selectedItem.projectTitle : selectedItem.title,
        category: selectedItem.category,
        createdAt: serverTimestamp(),
      });
      alert("Bookmarked successfully!");
      setShowModal(false);
      window.location.hash = "#/home";
    } catch (error) {
      console.error("Error bookmarking:", error);
      alert("Failed to bookmark");
    } finally {
      setActionLoading(false);
    }
  };

  const getDisplayItems = useMemo(() => {
    let items = [];
    if (activeTab === "all") items = [...projects, ...services];
    else if (activeTab === "projects") items = projects;
    else if (activeTab === "services") items = services;

    if (filterCategory) items = items.filter((item) => item.category === filterCategory);

    if (searchKeyword.trim()) {
      const needle = searchKeyword.trim().toLowerCase();
      items = items.filter((item) => {
        const title = (item.projectTitle || item.title || "").toLowerCase();
        const description = (item.description || "").toLowerCase();
        return title.includes(needle) || description.includes(needle);
      });
    }

    return items;
  }, [activeTab, filterCategory, searchKeyword, projects, services]);

  const formatPrice = (item) => {
    if (item.type === "project") {
      if (item.budgetMin && item.budgetMax) {
        return `${item.budgetMin} - ${item.budgetMax} ${item.currency || "PKR"}`;
      }
      return "Price not specified";
    } else {
      if (item.pricingType === "single") return item.singlePrice || "Price not specified";
      const prices = [];
      if (item.basicPrice) prices.push(`Basic: ${item.basicPrice}`);
      if (item.standardPrice) prices.push(`Std: ${item.standardPrice}`);
      if (item.premiumPrice) prices.push(`Premium: ${item.premiumPrice}`);
      return prices.length > 0 ? prices.join(" | ") : "Price not specified";
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.heading}>Browse Projects & Services</h1>
          <p className={styles.subline}>Discover amazing opportunities</p>
        </div>

        <div className={styles.filters}>
          <button className={`${styles.tabButton} ${activeTab === "all" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("all")}>
            All ({projects.length + services.length})
          </button>
          <button className={`${styles.tabButton} ${activeTab === "projects" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("projects")}>
            Projects ({projects.length})
          </button>
          <button className={`${styles.tabButton} ${activeTab === "services" ? styles.tabButtonActive : ""}`} onClick={() => setActiveTab("services")}>
            Services ({services.length})
          </button>
          <select className={styles.categorySelect} value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input className={styles.searchInput} type="search" placeholder="Search..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} />
        </div>

        {loading ? (
          <div className={styles.loading}>Loading...</div>
        ) : getDisplayItems.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyTitle}>No items found</div>
            <p>Try adjusting your filters</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {getDisplayItems.map((item) => (
              <div key={item.id} className={styles.card} onClick={() => { setSelectedItem(item); setShowModal(true); }} style={{ cursor: 'pointer' }}>
                <div className={`${styles.badge} ${item.type === "project" ? styles.badgeProject : styles.badgeService}`}>
                  {item.type === "project" ? "Project" : "Service"}
                </div>
                <h3 className={styles.cardTitle}>{item.type === "project" ? item.projectTitle : item.title}</h3>
                {item.category && <div className={styles.cardCategory}>📁 {item.category}</div>}
                <p className={styles.cardDescription}>{item.description || "No description"}</p>
                <div className={styles.cardPrice}>{formatPrice(item)}</div>
                <div className={styles.cardMeta}>
                  {item.type === "project" ? (
                    <>
                      {item.personName && <div>👤 {item.personName}</div>}
                      {item.deadline && <div>📅 {new Date(item.deadline).toLocaleDateString()}</div>}
                    </>
                  ) : (
                    <>{item.userName && <div>👤 {item.userName}</div>}</>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && selectedItem && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modalDialog} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>{selectedItem.type === "project" ? selectedItem.projectTitle : selectedItem.title}</h2>
                <button className={styles.modalClose} onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.modalBadge}>{selectedItem.type === "project" ? "Project" : "Service"}</div>
                {selectedItem.category && <p><strong>Category:</strong> {selectedItem.category}</p>}
                <p><strong>Description:</strong></p>
                <p>{selectedItem.description}</p>
                <p><strong>Price:</strong> {formatPrice(selectedItem)}</p>
                {selectedItem.type === "project" && selectedItem.deadline && (
                  <p><strong>Deadline:</strong> {new Date(selectedItem.deadline).toLocaleDateString()}</p>
                )}
              </div>
              <div className={styles.modalFooter}>
                <button className={styles.btnBookmark} onClick={handleBookmark} disabled={actionLoading}>
                  {actionLoading ? "Loading..." : "📌 Bookmark"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}