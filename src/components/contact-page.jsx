import React, { useState } from "react";
import "./styles/contact-page.css";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState({ submitting: false, success: null, error: null });

  function updateField(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus({ submitting: true, success: null, error: null });

    try {
      // API INTEGRATION: Replace the below with your real API call
      // Example:
      // const res = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // if (!res.ok) throw new Error('Request failed');
      // const data = await res.json();

      await new Promise((r) => setTimeout(r, 800)); // mock latency - remove when API is connected
      setStatus({ submitting: false, success: "Message sent successfully.", error: null });
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus({ submitting: false, success: null, error: "Something went wrong. Please try again." });
    }
  }

  return (
    <div className="contact-page">
      <main className="contact-wrapper">
        <h1 className="contact-heading">Contact Us</h1>
        <p className="contact-subline">We'd love to hear from you. Share your ideas, questions, or feedback.</p>

        <section className="contact-card">
          <form onSubmit={handleSubmit}>
            <label htmlFor="name" className="contact-label">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={formData.name}
              onChange={updateField}
              className="contact-input"
              required
            />

            <label htmlFor="email" className="contact-label">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="jane@example.com"
              value={formData.email}
              onChange={updateField}
              className="contact-input"
              required
            />

            <label htmlFor="message" className="contact-label">Message</label>
            <textarea
              id="message"
              name="message"
              placeholder="Write your message..."
              value={formData.message}
              onChange={updateField}
              className="contact-textarea"
              required
            />

            <button
              type="submit"
              disabled={status.submitting}
              className="contact-button"
            >
              {status.submitting ? "Sending..." : "Submit"}
            </button>

            {status.success && (
              <div className="contact-status success">
                {status.success}
              </div>
            )}
            {status.error && (
              <div className="contact-status error">
                {status.error}
              </div>
            )}
          </form>
        </section>
      </main>
    </div>
  );
}
