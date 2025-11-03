//Work is needed
import React from "react";

export default function ProfilePage() {
  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)", color: "#E5E7EB" }}>
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "3rem 1.5rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "0.75rem" }}>Profile</h1>
        <p style={{ color: "#9CA3AF" }}>Your profile information will appear here.</p>
      </main>
    </div>
  );
}


