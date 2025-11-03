import React, { useEffect, useState } from "react";
import LandingPage from "./components/landing-page";
import Navbar from "./components/navbar";
import HomePage from "./components/home-page";
import ProfilePage from "./components/profile-page";
import UsersPage from "./components/users-page";
import PostPage from "./components/post-page";
import ContactPage from "./components/contact-page";
import Login from "./components/login";
import Register from "./components/register";

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
      case "#/contact":
        return <ContactPage />;
      case "#/login":
        return <Login />;
      case "#/register":
        return <Register />;
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
