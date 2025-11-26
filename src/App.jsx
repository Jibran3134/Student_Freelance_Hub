import React, { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
import UpdateProfile from "./components/update-profile";
import UploadPortfolio from "./components/upload-portfolio";
import WalletPage from "./components/wallet/WalletPage";
import DisputeCenter from "./components/disputes/DisputeCenter";
import TransactionHistory from "./components/transactions/TransactionHistory";

function App() {
  const [route, setRoute] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);

    // Self-healing: Check if logged-in user has visibility field
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (!userData.visibility) {
              console.log("Migrating user to public visibility...");
              await updateDoc(userDocRef, {
                visibility: "public"
              });
            }
          }
        } catch (error) {
          console.error("Error checking user visibility:", error);
        }
      }
    });

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      unsubscribeAuth();
    };
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
      case "#/update-profile":
        return <UpdateProfile />;
      case "#/upload-portfolio":
        return <UploadPortfolio />;
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
      case "#/wallet":
        return <WalletPage />;
      case "#/disputes":
        return <DisputeCenter />;
      case "#/transactions":
        return <TransactionHistory />;
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
