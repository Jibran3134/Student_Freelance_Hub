import React, { useState } from "react";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

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
      const user = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in:", user.user.email);
      // Redirect to profile or home
      window.location.hash = "#/profile";
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Placeholder for social login implementation
    console.log(`Social login with ${provider}`);
  };

  const handleForgotPassword = () => {
    // Placeholder for forgot password implementation
    console.log("Forgot password clicked");
    alert("Forgot password functionality will be implemented here");
  };

  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
      padding: "2rem 1rem",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    card: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      padding: "3rem",
      width: "100%",
      maxWidth: "440px",
      animation: "fadeInUp 0.6s ease-out",
    },
    title: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#F9FAFB",
      marginBottom: "0.5rem",
      textAlign: "center",
    },
    subtitle: {
      fontSize: "0.95rem",
      color: "#9CA3AF",
      textAlign: "center",
      marginBottom: "2rem",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.25rem",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#D1D5DB",
    },
    input: {
      padding: "0.875rem 1rem",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
      fontFamily: "inherit",
      background: "rgba(255,255,255,0.03)",
      color: "#E5E7EB",
    },
    error: {
      color: "#e53e3e",
      fontSize: "0.875rem",
      marginTop: "0.25rem",
    },
    forgotPassword: {
      textAlign: "right",
      marginTop: "-0.5rem",
    },
    forgotPasswordLink: {
      color: "#8B5CF6",
      fontSize: "0.875rem",
      fontWeight: 600,
      textDecoration: "none",
      cursor: "pointer",
      transition: "color 0.3s ease",
    },
    button: {
      padding: "0.875rem 1.5rem",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      color: "#ffffff",
      marginTop: "0.5rem",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
    },
    divider: {
      display: "flex",
      alignItems: "center",
      margin: "1.5rem 0",
      color: "#6B7280",
      fontSize: "0.875rem",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "rgba(255,255,255,0.1)",
    },
    dividerText: {
      padding: "0 1rem",
    },
    socialButtons: {
      display: "flex",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    socialButton: {
      flex: 1,
      padding: "0.75rem",
      borderRadius: "12px",
      border: "1px solid rgba(255,255,255,0.1)",
      background: "rgba(255,255,255,0.03)",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontSize: "0.875rem",
      fontWeight: 600,
      color: "#D1D5DB",
    },
    signupLink: {
      textAlign: "center",
      marginTop: "1.5rem",
      fontSize: "0.875rem",
      color: "#9CA3AF",
    },
    signupLinkText: {
      color: "#8B5CF6",
      fontWeight: 600,
      textDecoration: "none",
      cursor: "pointer",
    },
    submitError: {
      color: "#e53e3e",
      fontSize: "0.875rem",
      textAlign: "center",
      marginTop: "0.5rem",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to your account to continue</p>

        <div style={styles.socialButtons}>
          <button
            type="button"
            style={styles.socialButton}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
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
          <button
            type="button"
            style={styles.socialButton}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
            onClick={() => handleSocialLogin("GitHub")}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>
        </div>

        <div style={styles.divider}>
          <div style={styles.dividerLine}></div>
          <span style={styles.dividerText}>or sign in with email</span>
          <div style={styles.dividerLine}></div>
        </div>

        <form onSubmit={loginUser} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              style={{
                ...styles.input,
                ...(errors.email ? { borderColor: "#e53e3e" } : {}),
              }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = errors.email ? "#e53e3e" : "rgba(255,255,255,0.1)")}
            />
            {errors.email && <span style={styles.error}>{errors.email}</span>}
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label} htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
              style={{
                ...styles.input,
                ...(errors.password ? { borderColor: "#e53e3e" } : {}),
              }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
            onBlur={(e) => (e.currentTarget.style.borderColor = errors.password ? "#e53e3e" : "rgba(255,255,255,0.1)")}
            />
            {errors.password && <span style={styles.error}>{errors.password}</span>}
          </div>

          <div style={styles.forgotPassword}>
            <span
              style={styles.forgotPasswordLink}
              onClick={handleForgotPassword}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#A78BFA")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#8B5CF6")}
            >
              Forgot Password?
            </span>
          </div>

          {errors.submit && (
            <div style={styles.submitError}>{errors.submit}</div>
          )}

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.4)";
              }
            }}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div style={styles.signupLink}>
          Don't have an account?{" "}
          <span
            style={styles.signupLinkText}
            onClick={() => (window.location.hash = "#/register")}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#764ba2")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#667eea")}
          >
            Sign Up
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
