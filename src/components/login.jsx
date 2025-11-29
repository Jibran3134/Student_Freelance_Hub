import React, { useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, deleteUser, signInWithPopup } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import "./styles/login.css";

const ADMIN_EMAILS = [
  "alishba11@gmail.com",
  "jibran22@gmail.com",
  "umar33@gmail.com",
  "abdullah44@gmail.com"
];

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (!/^[a-zA-Z0-9]+$/.test(password)) {
      newErrors.password = "Password must contain only letters and numbers";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", userCred.user.email);

      // Check if user is Admin
      if (ADMIN_EMAILS.includes(userCred.user.email)) {
        // Admins bypass all validation checks
        window.location.hash = "#/profile";
        return;
      }

      // Check if profile exists
      const userDocRef = doc(db, "users", userCred.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();

        // Check if deleted by admin
        if (userData.deletedByAdmin) {
          alert("You have been deleted by the admin.");

          // Delete the auth user so they can't login again and must re-register
          await deleteUser(userCred.user);

          window.location.hash = "#/register";
          return;
        }

        window.location.hash = "#/profile";
      } else {
        // Profile missing, auto-create it
        await setDoc(userDocRef, {
          name: userCred.user.displayName || "User",
          email: userCred.user.email,
          skills: [],
          education: "",
          profilePicture: userCred.user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        window.location.hash = "#/profile";
      }
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (providerName) => {
    setLoading(true);
    try {
      const provider = googleProvider;
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user is Admin
      if (ADMIN_EMAILS.includes(user.email)) {
        window.location.hash = "#/profile";
        return;
      }

      // Check if profile exists
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const userData = docSnap.data();
        if (userData.deletedByAdmin) {
          alert("You have been deleted by the admin.");
          await deleteUser(user);
          window.location.hash = "#/register";
          return;
        }
      } else {
        // Auto-create profile if it doesn't exist (Sign Up via Login)
        await setDoc(docRef, {
          name: user.displayName || "User",
          email: user.email,
          skills: [],
          education: "",
          profilePicture: user.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      console.log(`Social login success with ${providerName}`);
      window.location.hash = "#/profile";
    } catch (error) {
      console.error("Social login error:", error);
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Placeholder for forgot password implementation
    console.log("Forgot password clicked");
    alert("Forgot password functionality will be implemented here");
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Login</h1>
        <p className="login-subtitle">Login to your account to continue</p>

        <div className="login-social-buttons">
          <button
            type="button"
            className="login-social-button"
            onClick={() => handleSocialLogin("Google")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>

        </div>

        <div className="login-divider">
          <div className="login-divider-line"></div>
          <span className="login-divider-text">or login with email</span>
          <div className="login-divider-line"></div>
        </div>

        <form onSubmit={loginUser} className="login-form">
          <div className="login-input-group">
            <label className="login-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`login-input ${errors.email ? "has-error" : ""}`}
            />
            {errors.email && <span className="login-error">{errors.email}</span>}
          </div>

          <div className="login-input-group">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`login-input ${errors.password ? "has-error" : ""}`}
            />
            {errors.password && <span className="login-error">{errors.password}</span>}
          </div>

          <div className="login-forgot">
            <span
              className="login-forgot-button"
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </span>
          </div>

          {errors.submit && (
            <div className="login-submit-error">{errors.submit}</div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="login-signup">
          Don't have an account?{" "}
          <span
            className="login-signup-button"
            onClick={() => (window.location.hash = "#/register")}
          >
            Signup
          </span>
        </div>
      </div>
    </div>
  );
}
