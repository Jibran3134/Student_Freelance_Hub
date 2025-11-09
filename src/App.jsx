import React, { useEffect, useState } from "react";
import LandingPage from "./components/landing-page";
import Navbar from "./components/navbar";
import HomePage from "./components/home-page";
import ProfilePage from "./components/profile-page";
import UsersPage from "./components/users-page";
import PostPage from "./components/post-page";
import PostServicePage from "./components/post-service-page";
import PostProjectPage from "./components/post-project-page";
import ContactPage from "./components/contact-page";
import Login from "./components/login";
import Register from "./components/register";
import AdminDashboard from "./components/admin-dashboard";
import BrowsePage from "./components/browse-page";

 function App() {
  const [route, setRoute] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const isLanding = route === "#/" || route === "";

  const renderPage = () => {
    switch (route) {
      case "#/home":
        return <HomePage />;
      case "#/profile":
        return <ProfilePage />;
      case "#/users":
        return <UsersPage />;
      case "#/post":
        return <PostPage />;
      case "#/post-service":
        return <PostServicePage />;
      case "#/post-project":
        return <PostProjectPage />;
      case "#/contact":
        return <ContactPage />;
      case "#/login":
        return <Login />;
      case "#/register":
        return <Register />;
      case "#/manage":
        return <AdminDashboard />;
      case "#/browse":
        return <BrowsePage />;
      case "#/":
      default:
        return <LandingPage />;
    }
  };

  return (
    <div>
      {!isLanding && <Navbar />}
      {renderPage()}
    </div>
  );
}

export default App;
