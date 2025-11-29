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
    bio: "",
    profilePicture: null,
    profilePicturePreview: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
    coverPhoto: null,
    coverPhotoPreview: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=60",
    visibility: "public",
    availability: "online"
  });
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [targetUserId, setTargetUserId] = useState(null);

  useEffect(() => {
    const fetchProfileData = async (user) => {
      if (!user) {
        window.location.hash = "#/login";
        return;
      }

      // Check for UID in URL (for admin editing)
      const hash = window.location.hash;
      const queryIndex = hash.indexOf("?");
      let targetUid = user.uid;

      if (queryIndex !== -1) {
        const params = new URLSearchParams(hash.substring(queryIndex));
        const uidParam = params.get("uid");
        if (uidParam) {
          // Check if current user is admin
          if (ADMIN_EMAILS.includes(user.email)) {
            targetUid = uidParam;
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
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          setFormData((prev) => ({
            ...prev,
            name: userData.name || "",
            skills: userData.skills || [],
            education: userData.education || "",
            bio: userData.bio || "",
            profilePicturePreview: userData.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
            coverPhotoPreview: userData.coverPhoto || "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1000&auto=format&fit=crop&q=60",
            visibility: userData.visibility || "public",
            availability: userData.availability || "online"
          }));
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
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
      console.log("File selected:", file.name, "Size:", file.size, "Type:", file.type);
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
        console.log("File read successfully, setting preview");
        setFormData((prev) => ({
          ...prev,
          profilePicture: file,
          profilePicturePreview: reader.result,
        }));
      };
      reader.onerror = () => {
        console.error("Error reading file");
        setErrors((prev) => ({
          ...prev,
          profilePicture: "Error reading image file",
        }));
      };
      reader.readAsDataURL(file);
      if (errors.profilePicture) {
        setErrors((prev) => ({ ...prev, profilePicture: "" }));
      }
    } else {
      console.log("No file selected");
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          coverPhoto: "Image size must be less than 5MB",
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          coverPhoto: "Please select an image file",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          coverPhoto: file,
          coverPhotoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
      if (errors.coverPhoto) {
        setErrors((prev) => ({ ...prev, coverPhoto: "" }));
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

    // Confirmation alert before saving
    const confirmSave = window.confirm("Are you sure you want to save these changes?");
    if (!confirmSave) {
      return; // User cancelled, don't proceed
    }

    const user = auth.currentUser;
    if (!user) {
      window.location.hash = "#/login";
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    console.log("=== Starting Profile Save ===");
    console.log("Form Data:", formData);
    console.log("Profile Picture File:", formData.profilePicture);
    console.log("Is File?", formData.profilePicture instanceof File);
    console.log("File Type:", typeof formData.profilePicture);

    try {
      let profilePictureUrl = formData.profilePicturePreview;
      let coverPhotoUrl = formData.coverPhotoPreview;

      // Upload profile picture if changed
      if (formData.profilePicture && formData.profilePicture instanceof File) {
        try {
          const timestamp = Date.now();
          const fileName = `${timestamp}_${formData.profilePicture.name}`;
          const imageRef = ref(storage, `profile-pictures/${targetUserId}/${fileName}`);

          console.log("Uploading profile picture...", fileName);
          const snapshot = await uploadBytes(imageRef, formData.profilePicture);
          profilePictureUrl = await getDownloadURL(snapshot.ref);
          console.log("Profile picture uploaded successfully:", profilePictureUrl);
        } catch (uploadError) {
          console.error("Profile picture upload failed:", uploadError);
          alert(`Failed to upload profile picture: ${uploadError.message}\n\nPlease check Firebase Storage rules.`);
          throw uploadError;
        }
      }

      // Upload cover photo if changed
      if (formData.coverPhoto && formData.coverPhoto instanceof File) {
        try {
          const timestamp = Date.now();
          const fileName = `cover_${timestamp}_${formData.coverPhoto.name}`;
          const imageRef = ref(storage, `cover-photos/${targetUserId}/${fileName}`);

          console.log("Uploading cover photo...", fileName);
          const snapshot = await uploadBytes(imageRef, formData.coverPhoto);
          coverPhotoUrl = await getDownloadURL(snapshot.ref);
          console.log("Cover photo uploaded successfully:", coverPhotoUrl);
        } catch (uploadError) {
          console.error("Cover photo upload failed:", uploadError);
          alert(`Failed to upload cover photo: ${uploadError.message}\n\nPlease check Firebase Storage rules.`);
          throw uploadError;
        }
      } else {
        console.log("No profile picture selected, keeping existing URL");
      }

      // Update user profile in Firestore
      console.log("Updating Firestore profile with URL:", profilePictureUrl);
      const userDocRef = doc(db, "users", user.uid);

      const updateData = {
        name: formData.name,
        skills: formData.skills,
        education: formData.education,
        bio: formData.bio,
        profilePicture: profilePictureUrl,
        coverPhoto: coverPhotoUrl,
        visibility: formData.visibility,
        availability: formData.availability,
        updatedAt: new Date().toISOString(),
      };

      console.log("Updating profile with data:", updateData);
      await updateDoc(userDocRef, updateData);
      console.log("Profile updated successfully in Firestore!");

      // Show success message briefly, then redirect
      alert("Profile updated successfully!");
      // Redirect back to the profile we were editing
      if (targetUserId === user.uid) {
        window.location.hash = "#/profile";
      } else {
        window.location.hash = `#/profile?uid=${targetUserId}`;
      }
    } catch (error) {
      console.error("=== Error saving profile ===", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      const errorMessage = error.message || "Failed to save profile. Please try again.";
      setErrors({ submit: errorMessage });
      alert(`Error: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    window.location.hash = "#/profile";
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>Update Profile</h1>

          <form onSubmit={handleSave} className={styles.form}>
            {/* Cover Photo Upload */}
            <div className={styles.inputGroup}>
              <label className={styles.label}>Cover Photo</label>
              <div className={styles.imageUpload}>
                <img
                  src={formData.coverPhotoPreview}
                  alt="Cover Preview"
                  style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                />
                <label htmlFor="coverPhoto" className={styles.fileInputLabel}>
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
                  {formData.coverPhoto ? "Change Cover" : "Choose Cover"}
                </label>
                <input
                  type="file"
                  id="coverPhoto"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className={styles.fileInput}
                />
                {formData.coverPhoto && (
                  <p className={styles.fileSelected}>
                    ✓ File selected: {formData.coverPhoto.name} ({(formData.coverPhoto.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                {errors.coverPhoto && (
                  <span className={styles.error}>{errors.coverPhoto}</span>
                )}
              </div>
            </div>

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

            {/* Bio Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className={`${styles.textarea} ${errors.bio ? styles.textareaError : ""}`}
                rows="3"
              />
              {errors.bio && (
                <span className={styles.error}>{errors.bio}</span>
              )}
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

