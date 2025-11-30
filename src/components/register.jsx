
import React, { useState } from "react";
import { auth, db, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getRandomProfileImage } from "../constants";
import "./styles/register.css";

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (!/^[a-zA-Z0-9]+$/.test(formData.password)) {
      newErrors.password = "Password must contain only letters and numbers";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const registerUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        skills: [],
        education: "",
        profilePicture: getRandomProfileImage(formData.name),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      console.log("Registered and profile created:", user.email);
      // Redirect to login
      window.location.hash = "#/login";
    } catch (error) {
      console.error("Registration Error:", error);
      let errorMessage = "Failed to register. Please try again.";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use. Please login.";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak.";
      } else if (error.code === "permission-denied") {
        errorMessage = "Account created, but profile setup failed. Please contact support or check database rules.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ submit: errorMessage });
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

      // Check if user profile exists
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create new profile
        const userName = user.displayName || "User";
        await setDoc(docRef, {
          name: userName,
          email: user.email,
          skills: [],
          education: "",
          profilePicture: user.photoURL || getRandomProfileImage(userName),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }

      console.log(`Social login success with ${providerName}`);
      window.location.hash = "#/profile";
    } catch (error) {
      console.error("Social login error:", error);
      let errorMessage = "Failed to login with Google.";

      if (error.code === "permission-denied") {
        errorMessage = "Login successful, but profile access failed. Please contact support or check database rules.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1 className="register-title">Signup</h1>
        <p className="register-subtitle">Join the Students Freelance Hub community</p>

        <div className="register-social-buttons">
          <button
            type="button"
            className="register-social-button"
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

        <div className="register-divider">
          <div className="register-divider-line"></div>
          <span className="register-divider-text">or signup with email</span>
          <div className="register-divider-line"></div>
        </div>

        <form onSubmit={registerUser} className="register-form">
          <div className="register-input-group">
            <label className="register-label" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={`register-input ${errors.name ? "has-error" : ""}`}
            />
            {errors.name && <span className="register-error">{errors.name}</span>}
          </div>

          <div className="register-input-group">
            <label className="register-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`register-input ${errors.email ? "has-error" : ""}`}
            />
            {errors.email && <span className="register-error">{errors.email}</span>}
          </div>

          <div className="register-input-group">
            <label className="register-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              className={`register-input ${errors.password ? "has-error" : ""}`}
            />
            {errors.password && <span className="register-error">{errors.password}</span>}
          </div>

          <div className="register-input-group">
            <label className="register-label" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`register-input ${errors.confirmPassword ? "has-error" : ""}`}
            />
            {errors.confirmPassword && (
              <span className="register-error">{errors.confirmPassword}</span>
            )}
          </div>

          {errors.submit && (
            <div className="register-submit-error">{errors.submit}</div>
          )}

          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Signup"}
          </button>
        </form>

        <div className="register-login-link">
          Already have an account?{" "}
          <span
            className="register-login-button"
            onClick={() => (window.location.hash = "#/login")}
          >
            Login
          </span>
        </div>
      </div>
    </div>
  );
}
