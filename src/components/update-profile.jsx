import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./styles/update-profile.module.css";

const ADMIN_EMAILS = [
  "alishba11@gmail.com",
  "jibran22@gmail.com",
  "umar33@gmail.com",
  "abdullah44@gmail.com"
];

export default function UpdateProfile() {
  const [formData, setFormData] = useState({
    name: "",
    skills: [],
    education: "",
    profilePicture: null,
    profilePicturePreview: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
    visibility: "public",
    availability: "online"
  });
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [targetUserId, setTargetUserId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async (currentUser) => {
      if (!currentUser) {
        window.location.hash = "#/login";
        return;
      }

      // Check for UID in URL (for admin editing)
      const hash = window.location.hash;
      const queryIndex = hash.indexOf("?");
      let targetUid = currentUser.uid;
      let isAdmin = false;

      if (queryIndex !== -1) {
        const params = new URLSearchParams(hash.substring(queryIndex));
        const uidParam = params.get("uid");
        if (uidParam) {
          // Check if current user is admin
          if (ADMIN_EMAILS.includes(currentUser.email)) {
            targetUid = uidParam;
            isAdmin = true;
          } else {
            // Non-admin trying to edit someone else
            alert("Unauthorized access");
            window.location.hash = "#/profile";
            return;
          }
        }
      }

      setTargetUserId(targetUid);

      try {
        const userDocRef = doc(db, "users", targetUid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFormData((prev) => ({
            ...prev,
            name: userData.name || "",
            skills: userData.skills || [],
            education: userData.education || "",
            profilePicturePreview: userData.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
            visibility: userData.visibility || "public",
            availability: userData.availability || "online"
          }));
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchProfileData(user);
      } else {
        window.location.hash = "#/login";
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSkillAdd = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!formData.skills.includes(skillInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, skillInput.trim()],
        }));
      }
      setSkillInput("");
    }
  };

  const handleSkillRemove = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Image size must be less than 5MB",
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Please select an image file",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePicture: file,
          profilePicturePreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      if (errors.profilePicture) {
        setErrors((prev) => ({ ...prev, profilePicture: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.skills.length === 0) {
      newErrors.skills = "At least one skill is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const confirmSave = window.confirm("Are you sure you want to save these changes?");
    if (!confirmSave) return;

    const user = auth.currentUser;
    if (!user) {
      window.location.hash = "#/login";
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      let profilePictureUrl = formData.profilePicturePreview;

      if (formData.profilePicture) {
        const fileToUpload = formData.profilePicture instanceof File
          ? formData.profilePicture
          : null;

        if (fileToUpload) {
          const timestamp = Date.now();
          const fileName = `${timestamp}_${fileToUpload.name}`;
          const imageRef = ref(storage, `profile-pictures/${user.uid}/${fileName}`);

          const snapshot = await uploadBytes(imageRef, fileToUpload);
          profilePictureUrl = await getDownloadURL(snapshot.ref);
        }
      }

      const userDocRef = doc(db, "users", targetUserId);

      const updateData = {
        name: formData.name,
        skills: formData.skills,
        education: formData.education,
        profilePicture: profilePictureUrl,
        visibility: formData.visibility,
        availability: formData.availability,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(userDocRef, updateData);

      alert("Profile updated successfully!");
      // Redirect back to the profile we were editing
      if (targetUserId === user.uid) {
        window.location.hash = "#/profile";
      } else {
        window.location.hash = `#/profile?uid=${targetUserId}`;
      }
      // Reload to reflect changes
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage = error.message || "Failed to save profile.";
      setErrors({ submit: errorMessage });
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.hash = "#/profile";
  };

  if (loading && !formData.name) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p style={{ textAlign: 'center', color: '#fff' }}>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>Update Profile</h1>

          <form onSubmit={handleSave} className={styles.form}>
            {/* Profile Picture Upload */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Profile Picture</label>
              <div className={styles.imageUpload}>
                <img
                  src={formData.profilePicturePreview}
                  alt="Profile Preview"
                  className={styles.imagePreview}
                />
                <label htmlFor="profilePicture" className={styles.fileInputLabel}>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    className={styles.icon}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {formData.profilePicture ? "Change Image" : "Choose Image"}
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleImageChange}
                  className={styles.fileInput}
                />
                {formData.profilePicture && (
                  <p className={styles.fileSelected}>
                    ✓ File selected: {formData.profilePicture.name} ({(formData.profilePicture.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                {errors.profilePicture && (
                  <span className={styles.error}>{errors.profilePicture}</span>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            {/* Visibility Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="visibility">
                Profile Visibility
              </label>
              <select
                id="visibility"
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="public">Public (Everyone)</option>
                <option value="students">Students Only (Logged In)</option>
                <option value="private">Private (Only Me)</option>
              </select>
            </div>

            {/* Availability Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="availability">
                Availability Status
              </label>
              <select
                id="availability"
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className={styles.select}
              >
                <option value="online">Online</option>
                <option value="busy">Busy</option>
                <option value="dnd">Do Not Disturb</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Skills Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="skills">
                Skills
              </label>
              <div className={styles.skillsContainer}>
                <input
                  type="text"
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillAdd}
                  placeholder="Type a skill and press Enter"
                  className={`${styles.input} ${errors.skills ? styles.inputError : ""}`}
                />
                {formData.skills.length > 0 && (
                  <div className={styles.skillsList}>
                    {formData.skills.map((skill, index) => (
                      <span key={index} className={styles.skillTag}>
                        {skill}
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleSkillRemove(skill)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.skills && <span className={styles.error}>{errors.skills}</span>}
              </div>
            </div>

            {/* Education Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="education">
                Education
              </label>
              <textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Enter your education details"
                className={`${styles.textarea} ${errors.education ? styles.textareaError : ""}`}
              />
              {errors.education && (
                <span className={styles.error}>{errors.education}</span>
              )}
            </div>

            {errors.submit && (
              <div className={styles.submitError}>{errors.submit}</div>
            )}

            {/* Action Buttons */}
            <div className={styles.buttons}>
              <button
                type="button"
                className={`${styles.button} ${styles.secondaryButton}`}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`${styles.button} ${styles.primaryButton} ${loading ? styles.buttonDisabled : ""}`}
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
