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
    const [showModal, setShowModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    // Dummy Projects Data
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
        {
            id: "dummy-proj-4",
            type: "project",
            personName: "David Martinez",
            projectTitle: "Content Writing for Tech Blog",
            description: "Looking for skilled content writers to create engaging articles about technology trends, software reviews, and industry insights. Must have SEO knowledge and tech background.",
            category: "Content Writing",
            paymentType: "fixed",
            budgetMin: "5000",
            budgetMax: "8000",
            currency: "PKR",
            deadline: "2024-03-10",
        },
        {
            id: "dummy-proj-5",
            type: "project",
            personName: "Lisa Anderson",
            projectTitle: "Video Editing for YouTube Channel",
            description: "Need a professional video editor to edit weekly YouTube videos. Work includes color correction, audio mixing, adding graphics, and creating thumbnails. Long-term collaboration opportunity.",
            category: "Video Editing",
            paymentType: "hourly",
            budgetMin: "15",
            budgetMax: "25",
            currency: "USD",
            deadline: "2024-02-20",
        },
        {
            id: "dummy-proj-6",
            type: "project",
            personName: "Robert Taylor",
            projectTitle: "UI/UX Design for SaaS Platform",
            description: "Looking for a talented UI/UX designer to create user-friendly interfaces for a SaaS platform. Must create wireframes, prototypes, and design systems. Experience with Figma required.",
            category: "UI/UX Design",
            paymentType: "fixed",
            budgetMin: "30000",
            budgetMax: "50000",
            currency: "PKR",
            deadline: "2024-03-25",
        },
    ];

    // Dummy Services Data
    const dummyServices = [
        {
            id: "dummy-serv-1",
            type: "service",
            userName: "Alex Thompson",
            title: "Full-Stack Web Development Services",
            description: "Professional web development services using modern technologies. I specialize in React, Node.js, and MongoDB. I can build responsive websites, web applications, and RESTful APIs. Fast delivery and clean code guaranteed.",
            category: "Web Development",
            pricingType: "tier",
            basicPrice: "20000 PKR",
            standardPrice: "35000 PKR",
            premiumPrice: "50000 PKR",
            basicDescription: "Basic website with 5 pages, contact form, responsive design",
            standardDescription: "Custom web app with database, authentication, admin panel",
            premiumDescription: "Full-stack application with advanced features, API integration, deployment",
            completionTime: "1-2 weeks",
        },
        {
            id: "dummy-serv-2",
            type: "service",
            userName: "Jessica Park",
            title: "Professional Logo Design & Branding",
            description: "Creative logo design and complete branding solutions. I create unique, memorable logos that represent your brand identity. Package includes logo variations, color palette, and brand guidelines document.",
            category: "Logo Design",
            pricingType: "single",
            singlePrice: "12000 PKR",
            completionTime: "3-5 days",
        },
        {
            id: "dummy-serv-3",
            type: "service",
            userName: "Ryan Mitchell",
            title: "Mobile App Development (iOS & Android)",
            description: "Expert mobile app development for both iOS and Android platforms. I use React Native to create cross-platform apps with native performance. Services include UI/UX design, development, testing, and App Store deployment.",
            category: "Mobile App Development",
            pricingType: "tier",
            basicPrice: "40000 PKR",
            standardPrice: "70000 PKR",
            premiumPrice: "100000 PKR",
            basicDescription: "Simple app with basic features, single platform",
            standardDescription: "Cross-platform app with advanced features, backend integration",
            premiumDescription: "Complex app with custom features, payment integration, push notifications, both stores",
            completionTime: "3-4 weeks",
        },
        {
            id: "dummy-serv-4",
            type: "service",
            userName: "Sophie Brown",
            title: "SEO Optimization & Digital Marketing",
            description: "Comprehensive SEO services to improve your website's search engine rankings. Includes keyword research, on-page optimization, content strategy, link building, and monthly performance reports. Increase your organic traffic significantly.",
            category: "SEO Services",
            pricingType: "tier",
            basicPrice: "8000 PKR/month",
            standardPrice: "15000 PKR/month",
            premiumPrice: "25000 PKR/month",
            basicDescription: "Basic SEO audit, keyword research, on-page optimization",
            standardDescription: "Complete SEO strategy, content creation, link building, monthly reports",
            premiumDescription: "Full SEO management, PPC campaigns, social media integration, analytics",
            completionTime: "Ongoing monthly service",
        },
        {
            id: "dummy-serv-5",
            type: "service",
            userName: "Daniel Kim",
            title: "Video Editing & Post-Production",
            description: "Professional video editing services for YouTube, social media, commercials, and corporate videos. Services include color grading, audio enhancement, motion graphics, and thumbnail design. Quick turnaround times.",
            category: "Video Editing",
            pricingType: "single",
            singlePrice: "5000 PKR per video",
            completionTime: "2-3 days per video",
        },
        {
            id: "dummy-serv-6",
            type: "service",
            userName: "Maya Patel",
            title: "Content Writing & Copywriting",
            description: "Expert content writer specializing in tech, business, and marketing content. I create SEO-optimized blog posts, website copy, product descriptions, and social media content. Native English speaker with 5+ years experience.",
            category: "Content Writing",
            pricingType: "tier",
            basicPrice: "2000 PKR per article",
            standardPrice: "4000 PKR per article",
            premiumPrice: "6000 PKR per article",
            basicDescription: "500-800 word article, basic SEO, 1 revision",
            standardDescription: "1000-1500 word article, advanced SEO, 2 revisions, images",
            premiumDescription: "2000+ word article, comprehensive research, unlimited revisions, graphics",
            completionTime: "1-2 days per article",
        },
        {
            id: "dummy-serv-7",
            type: "service",
            userName: "Chris Wilson",
            title: "UI/UX Design & Prototyping",
            description: "User-centered design services for web and mobile applications. I create intuitive interfaces, user flows, wireframes, and interactive prototypes using Figma. Focus on usability and beautiful aesthetics.",
            category: "UI/UX Design",
            pricingType: "tier",
            basicPrice: "15000 PKR",
            standardPrice: "28000 PKR",
            premiumPrice: "45000 PKR",
            basicDescription: "Wireframes and basic mockups for 5 screens",
            standardDescription: "Complete UI design, interactive prototype, design system",
            premiumDescription: "Full UX research, user testing, complete design system, developer handoff",
            completionTime: "1-2 weeks",
        },
        {
            id: "dummy-serv-8",
            type: "service",
            userName: "Olivia Davis",
            title: "Social Media Management",
            description: "Complete social media management for your business. I handle content creation, posting schedules, community engagement, and analytics across Instagram, Facebook, Twitter, and LinkedIn. Grow your online presence effectively.",
            category: "Social Media Management",
            pricingType: "tier",
            basicPrice: "10000 PKR/month",
            standardPrice: "20000 PKR/month",
            premiumPrice: "35000 PKR/month",
            basicDescription: "3 posts per week, basic engagement, monthly report",
            standardDescription: "Daily posts, content creation, community management, analytics",
            premiumDescription: "Full strategy, paid ads management, influencer outreach, detailed analytics",
            completionTime: "Ongoing monthly service",
        },
    ];

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

    const handleSendRequest = async () => {
        if (!currentUser) {
            alert("Please login to send requests");
            return;
        }
        setActionLoading(true);
        try {
            // Get owner ID - from the project/service data
            // For now, we'll use a placeholder since we need to add owner field to project/service documents
            // In a real scenario, each project/service should have an ownerId field
            const ownerId = selectedItem.ownerId || selectedItem.userId || "unknown";

            await addDoc(collection(db, "sentRequests"), {
                userId: currentUser.uid,
                userName: currentUser.displayName || currentUser.email?.split("@")[0] || "Anonymous",
                ownerId: ownerId, // The person who owns the project/service
                itemId: selectedItem.id,
                itemType: selectedItem.type,
                title: selectedItem.type === "project" ? selectedItem.projectTitle : selectedItem.title,
                category: selectedItem.category,
                status: "pending",
                createdAt: serverTimestamp(),
            });
            alert("Request sent successfully!");
            setShowModal(false);
            window.location.hash = "#/home";
        } catch (error) {
            console.error("Error sending request:", error);
            alert("Failed to send request");
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
                            <div key={item.id} className={styles.card} onClick={() => { setSelectedItem(item); setShowModal(true); }}>
                                <div
                                    className={`${styles.badge} ${item.type === "project" ? styles.badgeProject : styles.badgeService
                                        }`}
                                >
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
                                <button className={styles.btnSendRequest} onClick={handleSendRequest} disabled={actionLoading}>
                                    {actionLoading ? "Loading..." : "📤 Send Request"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
