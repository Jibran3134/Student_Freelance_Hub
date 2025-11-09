import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UpdateProfile() {
  const [formData, setFormData] = useState({
    name: "John Doe",
    skills: ["React", "Node.js", "UI/UX Design", "JavaScript"],
    education: "Bachelor of Science in Computer Science - University of Technology",
    profilePicture: null,
    profilePicturePreview: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
  });
  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfileData = async (user) => {
      if (!user) {
        window.location.hash = "#/login";
        return;
      }

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
            profilePicturePreview: userData.profilePicture || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=faces&auto=format",
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

      // Upload profile picture to Firebase Storage if a new one was selected
      if (formData.profilePicture) {
        // Check if it's a File object or if we need to handle it differently
        const fileToUpload = formData.profilePicture instanceof File 
          ? formData.profilePicture 
          : null;
        
        if (fileToUpload) {
          console.log("Uploading profile picture...", {
            name: fileToUpload.name,
            size: fileToUpload.size,
            type: fileToUpload.type
          });
          
          try {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${fileToUpload.name}`;
            const imageRef = ref(storage, `profile-pictures/${user.uid}/${fileName}`);
            
            console.log("Storage reference created:", imageRef.fullPath);
            
            // Upload the file
            const snapshot = await uploadBytes(imageRef, fileToUpload);
            console.log("Upload successful! Snapshot:", snapshot);
            
            // Get download URL
            profilePictureUrl = await getDownloadURL(snapshot.ref);
            console.log("Profile picture URL obtained:", profilePictureUrl);
          } catch (uploadError) {
            console.error("Error during image upload:", uploadError);
            throw new Error(`Failed to upload image: ${uploadError.message}`);
          }
        } else {
          console.log("No file to upload, using existing preview URL");
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
        profilePicture: profilePictureUrl,
        updatedAt: new Date().toISOString(),
      };
      
      console.log("Update data:", updateData);
      
      await updateDoc(userDocRef, updateData);
      console.log("Profile updated successfully in Firestore!");

      // Show success message briefly, then redirect
      alert("Profile updated successfully!");
      // Force a page reload to refresh the profile data
      window.location.hash = "#/profile";
      setTimeout(() => window.location.reload(), 500);
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

  const styles = {
    container: {
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0e0a17 0%, #171228 60%, #130f20 100%)",
      padding: "2rem 1rem",
      color: "#E5E7EB",
      fontFamily: "'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    content: {
      maxWidth: "800px",
      margin: "0 auto",
    },
    card: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
      padding: "3rem",
    },
    title: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#F9FAFB",
      marginBottom: "2rem",
      textAlign: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
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
    textarea: {
      padding: "0.875rem 1rem",
      border: "1px solid rgba(255,255,255,0.1)",
      borderRadius: "12px",
      fontSize: "1rem",
      transition: "all 0.3s ease",
      outline: "none",
      fontFamily: "inherit",
      resize: "vertical",
      minHeight: "100px",
      background: "rgba(255,255,255,0.03)",
      color: "#E5E7EB",
    },
    error: {
      color: "#e53e3e",
      fontSize: "0.875rem",
      marginTop: "0.25rem",
    },
    imageUpload: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
    },
    imagePreview: {
      width: "150px",
      height: "150px",
      borderRadius: "50%",
      objectFit: "cover",
      border: "5px solid #8B5CF6",
      boxShadow: "0 8px 20px rgba(139, 92, 246, 0.3)",
    },
    fileInput: {
      display: "none",
    },
    fileInputLabel: {
      padding: "0.75rem 1.5rem",
      borderRadius: "12px",
      fontSize: "0.95rem",
      fontWeight: 600,
      border: "1px solid #8B5CF6",
      background: "rgba(255,255,255,0.03)",
      color: "#8B5CF6",
      cursor: "pointer",
      transition: "all 0.3s ease",
      display: "inline-block",
    },
    skillsContainer: {
      display: "flex",
      flexDirection: "column",
      gap: "0.75rem",
    },
    skillsList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "0.75rem",
    },
    skillTag: {
      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      color: "#ffffff",
      padding: "0.5rem 1rem",
      borderRadius: "20px",
      fontSize: "0.875rem",
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    removeButton: {
      background: "rgba(255, 255, 255, 0.3)",
      border: "none",
      borderRadius: "50%",
      width: "20px",
      height: "20px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#ffffff",
      fontSize: "0.75rem",
      fontWeight: 700,
    },
    buttons: {
      display: "flex",
      gap: "1rem",
      marginTop: "1rem",
    },
    button: {
      flex: 1,
      padding: "0.875rem 1.5rem",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    primaryButton: {
      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      color: "#ffffff",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
    },
    secondaryButton: {
      background: "rgba(255,255,255,0.03)",
      color: "#8B5CF6",
      border: "1px solid #8B5CF6",
    },
    buttonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed",
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
      <div style={styles.content}>
        <div style={styles.card}>
          <h1 style={styles.title}>Update Profile</h1>

          <form onSubmit={handleSave} style={styles.form}>
            {/* Profile Picture Upload */}
            <div style={styles.inputGroup}>
              <label style={styles.label}>Profile Picture</label>
              <div style={styles.imageUpload}>
                <img
                  src={formData.profilePicturePreview}
                  alt="Profile Preview"
                  style={styles.imagePreview}
                />
                <label htmlFor="profilePicture" style={styles.fileInputLabel}>
                  <svg
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ display: "inline-block", marginRight: "0.5rem", verticalAlign: "middle" }}
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
                  style={styles.fileInput}
                />
                {formData.profilePicture && (
                  <p style={{ fontSize: "0.875rem", color: "#10B981", marginTop: "0.5rem" }}>
                    ✓ File selected: {formData.profilePicture.name} ({(formData.profilePicture.size / 1024).toFixed(2)} KB)
                  </p>
                )}
                {errors.profilePicture && (
                  <span style={styles.error}>{errors.profilePicture}</span>
                )}
              </div>
            </div>

            {/* Name Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  ...styles.input,
                  ...(errors.name ? { borderColor: "#e53e3e" } : {}),
                }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = errors.name ? "#e53e3e" : "rgba(255,255,255,0.1)")}
              />
              {errors.name && <span style={styles.error}>{errors.name}</span>}
            </div>

            {/* Skills Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="skills">
                Skills
              </label>
              <div style={styles.skillsContainer}>
                <input
                  type="text"
                  id="skills"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={handleSkillAdd}
                  placeholder="Type a skill and press Enter"
                  style={{
                    ...styles.input,
                    ...(errors.skills ? { borderColor: "#e53e3e" } : {}),
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.skills ? "#e53e3e" : "rgba(255,255,255,0.1)")}
                />
                {formData.skills.length > 0 && (
                  <div style={styles.skillsList}>
                    {formData.skills.map((skill, index) => (
                      <span key={index} style={styles.skillTag}>
                        {skill}
                        <button
                          type="button"
                          style={styles.removeButton}
                          onClick={() => handleSkillRemove(skill)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.skills && <span style={styles.error}>{errors.skills}</span>}
              </div>
            </div>

            {/* Education Field */}
            <div style={styles.inputGroup}>
              <label style={styles.label} htmlFor="education">
                Education
              </label>
              <textarea
                id="education"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="Enter your education details"
                style={{
                  ...styles.textarea,
                  ...(errors.education ? { borderColor: "#e53e3e" } : {}),
                }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
              onBlur={(e) => (e.currentTarget.style.borderColor = errors.education ? "#e53e3e" : "rgba(255,255,255,0.1)")}
              />
              {errors.education && (
                <span style={styles.error}>{errors.education}</span>
              )}
            </div>

            {errors.submit && (
              <div style={styles.submitError}>{errors.submit}</div>
            )}

            {/* Action Buttons */}
            <div style={styles.buttons}>
              <button
                type="button"
                style={{ ...styles.button, ...styles.secondaryButton }}
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
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
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

