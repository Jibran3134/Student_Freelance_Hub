import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function BrowsePage() {
  const [projects, setProjects] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); // "all", "projects", "services"
  const [filterCategory, setFilterCategory] = useState("");

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
      requiredSkills: "React, Node.js, MongoDB, Stripe API",
      numberOfFreelancers: "2",
      preferredCommunication: "Slack",
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
      requiredSkills: "React Native, Firebase, Google Maps API",
      numberOfFreelancers: "3",
      preferredCommunication: "Discord",
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
      requiredSkills: "Adobe Illustrator, Photoshop, Branding",
      numberOfFreelancers: "1",
      preferredCommunication: "Email",
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
      requiredSkills: "SEO, Technical Writing, WordPress",
      numberOfFreelancers: "2",
      preferredCommunication: "WhatsApp",
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
      requiredSkills: "Premiere Pro, After Effects, Photoshop",
      numberOfFreelancers: "1",
      preferredCommunication: "Zoom",
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
      requiredSkills: "Figma, User Research, Prototyping",
      numberOfFreelancers: "1",
      preferredCommunication: "Microsoft Teams",
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

  const styles = {
    page: {
      minHeight: "100vh",
      width: "100%",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
      paddingBottom: "3rem",
    },
    container: {
      maxWidth: "1400px",
      margin: "0 auto",
      padding: "2rem 1.5rem",
    },
    header: {
      textAlign: "center",
      marginBottom: "3rem",
    },
    heading: {
      fontSize: "clamp(2rem, 4vw, 3rem)",
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
    subline: {
      color: "#9CA3AF",
      fontSize: "1.1rem",
    },
    filters: {
      display: "flex",
      gap: "1rem",
      marginBottom: "2rem",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    tabButton: {
      padding: "0.75rem 1.5rem",
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      color: "#D1D5DB",
      cursor: "pointer",
      fontSize: "0.95rem",
      fontWeight: 500,
      transition: "all 0.2s ease",
    },
    tabButtonActive: {
      background: "rgba(139,92,246,0.2)",
      borderColor: "#8B5CF6",
      color: "#F9FAFB",
    },
    categorySelect: {
      padding: "0.75rem 1rem",
      background: "#0f0d19",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "8px",
      color: "#E5E7EB",
      fontSize: "0.95rem",
      cursor: "pointer",
      outline: "none",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
      gap: "1.5rem",
      marginTop: "2rem",
    },
    card: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "14px",
      padding: "1.5rem",
      transition: "all 0.3s ease",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      height: "100%",
    },
    cardHover: {
      transform: "translateY(-4px)",
      borderColor: "rgba(139,92,246,0.3)",
      boxShadow: "0 8px 24px rgba(139,92,246,0.15)",
    },
    badge: {
      display: "inline-block",
      padding: "0.35rem 0.75rem",
      borderRadius: "6px",
      fontSize: "0.75rem",
      fontWeight: 600,
      marginBottom: "1rem",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    },
    badgeProject: {
      background: "rgba(59, 130, 246, 0.2)",
      color: "#93C5FD",
      border: "1px solid rgba(59, 130, 246, 0.3)",
    },
    badgeService: {
      background: "rgba(16, 185, 129, 0.2)",
      color: "#6EE7B7",
      border: "1px solid rgba(16, 185, 129, 0.3)",
    },
    cardTitle: {
      fontSize: "1.25rem",
      fontWeight: 700,
      marginBottom: "0.75rem",
      color: "#F9FAFB",
      lineHeight: 1.3,
    },
    cardCategory: {
      fontSize: "0.85rem",
      color: "#9CA3AF",
      marginBottom: "0.75rem",
    },
    cardDescription: {
      fontSize: "0.9rem",
      color: "#D1D5DB",
      lineHeight: 1.6,
      marginBottom: "1rem",
      flexGrow: 1,
      display: "-webkit-box",
      WebkitLineClamp: 3,
      WebkitBoxOrient: "vertical",
      overflow: "hidden",
    },
    cardPrice: {
      fontSize: "1.1rem",
      fontWeight: 700,
      color: "#8B5CF6",
      marginBottom: "0.5rem",
    },
    cardMeta: {
      fontSize: "0.85rem",
      color: "#9CA3AF",
      marginTop: "auto",
      paddingTop: "1rem",
      borderTop: "1px solid rgba(255,255,255,0.06)",
    },
    loading: {
      textAlign: "center",
      padding: "4rem",
      color: "#9CA3AF",
      fontSize: "1.1rem",
    },
    empty: {
      textAlign: "center",
      padding: "4rem",
      color: "#9CA3AF",
    },
    emptyTitle: {
      fontSize: "1.5rem",
      fontWeight: 600,
      marginBottom: "0.5rem",
      color: "#D1D5DB",
    },
  };

  const displayItems = getDisplayItems();

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
            <h1 style={styles.heading}>Browse Projects & Services</h1>
            <p style={styles.subline}>Discover amazing opportunities and services from talented freelancers</p>
          </div>

          <div style={styles.filters}>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "all" ? styles.tabButtonActive : {}),
              }}
              onClick={() => setActiveTab("all")}
              onMouseEnter={(e) => {
                if (activeTab !== "all") {
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "all") {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }
              }}
            >
              All ({projects.length + services.length})
            </button>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "projects" ? styles.tabButtonActive : {}),
              }}
              onClick={() => setActiveTab("projects")}
              onMouseEnter={(e) => {
                if (activeTab !== "projects") {
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "projects") {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }
              }}
            >
              Projects ({projects.length})
            </button>
            <button
              style={{
                ...styles.tabButton,
                ...(activeTab === "services" ? styles.tabButtonActive : {}),
              }}
              onClick={() => setActiveTab("services")}
              onMouseEnter={(e) => {
                if (activeTab !== "services") {
                  e.target.style.background = "rgba(255,255,255,0.08)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "services") {
                  e.target.style.background = "rgba(255,255,255,0.05)";
                }
              }}
            >
              Services ({services.length})
            </button>
            <select
              style={styles.categorySelect}
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
            <div style={styles.loading}>Loading projects and services...</div>
          ) : displayItems.length === 0 ? (
            <div style={styles.empty}>
              <div style={styles.emptyTitle}>No items found</div>
              <p>Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  style={styles.card}
                  onMouseEnter={(e) => {
                    Object.assign(e.currentTarget.style, styles.cardHover);
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      ...styles.badge,
                      ...(item.type === "project"
                        ? styles.badgeProject
                        : styles.badgeService),
                    }}
                  >
                    {item.type === "project" ? "Project" : "Service"}
                  </div>
                  <h3 style={styles.cardTitle}>
                    {item.type === "project"
                      ? item.projectTitle
                      : item.title}
                  </h3>
                  {item.category && (
                    <div style={styles.cardCategory}>
                      📁 {item.category}
                    </div>
                  )}
                  <p style={styles.cardDescription}>
                    {item.description || "No description available."}
                  </p>
                  <div style={styles.cardPrice}>{formatPrice(item)}</div>
                  <div style={styles.cardMeta}>
                    {item.type === "project" ? (
                      <>
                        {item.personName && <div>👤 {item.personName}</div>}
                        {item.deadline && (
                          <div>📅 Deadline: {new Date(item.deadline).toLocaleDateString()}</div>
                        )}
                        {item.requiredSkills && (
                          <div>🛠️ Skills: {item.requiredSkills}</div>
                        )}
                      </>
                    ) : (
                      <>
                        {item.userName && <div>👤 {item.userName}</div>}
                        {item.completionTime && (
                          <div>⏱️ {item.completionTime}</div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

