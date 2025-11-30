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
import UpdateProfile from "./components/update-profile";
import UploadPortfolio from "./components/upload-portfolio";
import WalletPage from "./components/wallet/WalletPage";
import DisputeCenter from "./components/disputes/DisputeCenter";
import TransactionHistory from "./components/transactions/TransactionHistory";
import FirebaseAddPage from "./components/firebase-add-page";
import FirebaseListingPage from "./components/firebase-listing-page";
import FirebaseDetailPage from "./components/firebase-detail-page";
import FirebaseEditPage from "./components/firebase-edit-page";
import FirebaseDeletePage from "./components/firebase-delete-page";
import FirebaseProfilePage from "./components/firebase-profile-page";
import NotificationsScreen from "./components/notifications-screen";
import RequestApproval from "./components/request-approval";


function App() {
  const [route, setRoute] = useState(window.location.hash || "#/");

  useEffect(() => {
    const onHashChange = () => setRoute(window.location.hash || "#/");
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const isLanding = route === "#/" || route === "";

  const renderPage = () => {
    if (route.startsWith("#/firebase-detail/")) {
      const id = decodeURIComponent(route.replace("#/firebase-detail/", ""));
      return <FirebaseDetailPage itemId={id} />;
    }

    if (route.startsWith("#/firebase-edit/")) {
      const id = decodeURIComponent(route.replace("#/firebase-edit/", ""));
      return <FirebaseEditPage itemId={id} />;
    }

    if (route.startsWith("#/firebase-delete/")) {
      const id = decodeURIComponent(route.replace("#/firebase-delete/", ""));
      return <FirebaseDeletePage itemId={id} />;
    }

    if (route.startsWith("#/request-approval/")) {
      return <RequestApproval />;
    }

    if (route.startsWith("#/profile")) {
      return <ProfilePage />;
    }

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
      case "#/firebase-add":
        return <FirebaseAddPage />;
      case "#/firebase-list":
        return <FirebaseListingPage />;
      case "#/firebase-profile":
        return <FirebaseProfilePage />;
      case "#/notifications":
        return <NotificationsScreen />;
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
