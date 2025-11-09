import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: null,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        window.location.hash = "#/login";
      }
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentItem((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Portfolio image selected:", file.name, "Size:", file.size, "Type:", file.type);
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          image: "Image size must be less than 10MB",
        }));
        return;
      }
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({
          ...prev,
          image: "Please select an image file",
        }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log("Portfolio image read successfully");
        setCurrentItem((prev) => ({
          ...prev,
          image: file,
          imagePreview: reader.result,
        }));
      };
      reader.onerror = () => {
        console.error("Error reading portfolio image file");
        setErrors((prev) => ({
          ...prev,
          image: "Error reading image file",
        }));
      };
      reader.readAsDataURL(file);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    } else {
      console.log("No portfolio image file selected");
    }
  };

  const validateItem = () => {
    const newErrors = {};
    
    if (!currentItem.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!currentItem.description.trim()) {
      newErrors.description = "Description is required";
    }
    
    // Image is now optional - removed the required validation
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddItem = () => {
    if (!validateItem()) {
      return;
    }
    
    const newItem = {
      id: Date.now(),
      title: currentItem.title,
      description: currentItem.description,
      image: currentItem.image || null, // Allow null if no image
      imagePreview: currentItem.imagePreview || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&auto=format", // Default AI-generated image
    };
    
    setPortfolioItems((prev) => [...prev, newItem]);
    setCurrentItem({
      title: "",
      description: "",
      image: null,
      imagePreview: null,
    });
    setErrors({});
    // Reset file input
    const fileInput = document.getElementById("portfolioImage");
    if (fileInput) fileInput.value = "";
  };

  const handleRemoveItem = (id) => {
    setPortfolioItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSaveAll = async () => {
    if (portfolioItems.length === 0) {
      setErrors({ submit: "Please add at least one portfolio item" });
      return;
    }

    if (!user) {
      window.location.hash = "#/login";
      return;
    }
    
    // Confirmation alert before saving
    const confirmSave = window.confirm(`Are you sure you want to upload ${portfolioItems.length} portfolio item(s)?`);
    if (!confirmSave) {
      return; // User cancelled, don't proceed
    }
    
    setLoading(true);
    setErrors({}); // Clear previous errors
    
    console.log("=== Starting Portfolio Upload ===");
    console.log("Portfolio Items:", portfolioItems);
    console.log("User:", user.uid);
    
    try {
      let uploadedCount = 0;
      // Upload each portfolio item
      for (let i = 0; i < portfolioItems.length; i++) {
        const item = portfolioItems[i];
        console.log(`\nProcessing item ${i + 1}/${portfolioItems.length}:`, item.title);
        console.log("Item image:", item.image);
        console.log("Is File?", item.image instanceof File);
        
        let imageUrl = item.imagePreview || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&auto=format";

        // Upload image to Firebase Storage if it's a file
        if (item.image && item.image instanceof File) {
          const fileToUpload = item.image;
          
          console.log(`Uploading portfolio image ${i + 1}/${portfolioItems.length}:`, {
            name: fileToUpload.name,
            size: fileToUpload.size,
            type: fileToUpload.type
          });
          
          try {
            const timestamp = Date.now();
            const fileName = `${timestamp}_${fileToUpload.name}`;
            const imageRef = ref(storage, `portfolio/${user.uid}/${fileName}`);
            
            console.log("Storage reference created:", imageRef.fullPath);
            
            // Upload the file
            const snapshot = await uploadBytes(imageRef, fileToUpload);
            console.log("Upload successful! Snapshot:", snapshot);
            
            // Get download URL
            imageUrl = await getDownloadURL(snapshot.ref);
            console.log("Image URL obtained:", imageUrl);
          } catch (uploadError) {
            console.error(`Error uploading image for item ${i + 1}:`, uploadError);
            throw new Error(`Failed to upload image for "${item.title}": ${uploadError.message}`);
          }
        } else {
          // No image file - use placeholder or existing preview URL
          console.log(`No image file for item "${item.title}", using placeholder or preview URL`);
          if (!item.imagePreview || item.imagePreview.startsWith('data:')) {
            // If it's a data URL (local preview) and no file, use placeholder
            imageUrl = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop&auto=format";
          }
        }

        // Save portfolio item to Firestore
        console.log("Saving portfolio item to Firestore with image URL:", imageUrl);
        const portfolioData = {
          userId: user.uid,
          title: item.title,
          description: item.description,
          image: imageUrl,
          createdAt: new Date().toISOString(),
        };
        
        console.log("Portfolio data:", portfolioData);
        
        await addDoc(collection(db, "portfolio"), portfolioData);
        uploadedCount++;
        console.log(`✓ Portfolio item ${uploadedCount} saved successfully`);
      }

      console.log(`\n=== All ${uploadedCount} portfolio items saved successfully! ===`);
      alert(`Successfully uploaded ${uploadedCount} portfolio item(s)!`);
      // Force a page reload to refresh the profile data
      window.location.hash = "#/profile";
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      console.error("=== Error saving portfolio items ===", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      const errorMessage = error.message || "Failed to save portfolio items. Please try again.";
      setErrors({ submit: errorMessage });
      alert(`Error: ${errorMessage}\n\nCheck the browser console for more details.`);
    } finally {
      setLoading(false);
    }
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
      maxWidth: "1200px",
      margin: "0 auto",
    },
    header: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      padding: "2rem",
      marginBottom: "2rem",
      textAlign: "center",
    },
    title: {
      fontSize: "2rem",
      fontWeight: 700,
      color: "#F9FAFB",
      marginBottom: "0.5rem",
    },
    subtitle: {
      fontSize: "1rem",
      color: "#9CA3AF",
    },
    mainContent: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 400px), 1fr))",
      gap: "2rem",
    },
    formCard: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      padding: "2rem",
    },
    previewCard: {
      background: "linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "20px",
      boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
      padding: "2rem",
      maxHeight: "calc(100vh - 200px)",
      overflowY: "auto",
    },
    sectionTitle: {
      fontSize: "1.5rem",
      fontWeight: 700,
      color: "#F3F4F6",
      marginBottom: "1.5rem",
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
      border: "1px dashed rgba(255,255,255,0.2)",
      borderRadius: "12px",
      padding: "2rem",
      textAlign: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "rgba(255,255,255,0.02)",
    },
    imageUploadHover: {
      borderColor: "#8B5CF6",
      background: "rgba(255,255,255,0.04)",
    },
    imagePreview: {
      width: "100%",
      maxHeight: "200px",
      objectFit: "cover",
      borderRadius: "12px",
      marginTop: "1rem",
    },
    fileInput: {
      display: "none",
    },
    fileInputLabel: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.5rem",
      cursor: "pointer",
    },
    addButton: {
      padding: "0.875rem 1.5rem",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: 600,
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
      background: "linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)",
      color: "#ffffff",
      boxShadow: "0 4px 15px rgba(139, 92, 246, 0.4)",
    },
    itemsList: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
    },
    itemCard: {
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: "12px",
      overflow: "hidden",
      transition: "all 0.3s ease",
    },
    itemImage: {
      width: "100%",
      height: "150px",
      objectFit: "cover",
    },
    itemContent: {
      padding: "1rem",
    },
    itemHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "0.5rem",
    },
    itemTitle: {
      fontSize: "1rem",
      fontWeight: 600,
      color: "#F3F4F6",
      flex: 1,
    },
    removeButton: {
      background: "#e53e3e",
      color: "#ffffff",
      border: "none",
      borderRadius: "6px",
      width: "28px",
      height: "28px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "1.2rem",
      fontWeight: 700,
      transition: "all 0.3s ease",
    },
    itemDescription: {
      fontSize: "0.875rem",
      color: "#9CA3AF",
      lineHeight: "1.5",
    },
    emptyState: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "#6B7280",
    },
    actionButtons: {
      display: "flex",
      gap: "1rem",
      marginTop: "2rem",
      paddingTop: "2rem",
      borderTop: "2px solid #e2e8f0",
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
        <div style={styles.header}>
          <h1 style={styles.title}>Upload Portfolio</h1>
          <p style={styles.subtitle}>
            Showcase your best work to potential clients
          </p>
        </div>

        <div style={styles.mainContent}>
          {/* Form Section */}
          <div style={styles.formCard}>
            <h2 style={styles.sectionTitle}>Add New Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddItem();
              }}
              style={styles.form}
            >
              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="title">
                  Project Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentItem.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  style={{
                    ...styles.input,
                    ...(errors.title ? { borderColor: "#e53e3e" } : {}),
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.title ? "#e53e3e" : "rgba(255,255,255,0.1)")}
                />
                {errors.title && <span style={styles.error}>{errors.title}</span>}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentItem.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project..."
                  style={{
                    ...styles.textarea,
                    ...(errors.description ? { borderColor: "#e53e3e" } : {}),
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#8B5CF6")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = errors.description ? "#e53e3e" : "rgba(255,255,255,0.1)")}
                />
                {errors.description && (
                  <span style={styles.error}>{errors.description}</span>
                )}
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Project Image</label>
                <div
                  style={styles.imageUpload}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#8B5CF6";
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <label htmlFor="portfolioImage" style={styles.fileInputLabel}>
                    <svg
                      width="48"
                      height="48"
                      fill="none"
                      stroke="#667eea"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span style={{ color: "#8B5CF6", fontWeight: 600 }}>
                      {currentItem.image ? "Change Image" : "Click to upload image"}
                    </span>
                    <span style={{ fontSize: "0.875rem", color: "#9CA3AF" }}>
                      PNG, JPG up to 10MB
                    </span>
                  </label>
                  <input
                    type="file"
                    id="portfolioImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                  />
                  {currentItem.imagePreview && (
                    <img
                      src={currentItem.imagePreview}
                      alt="Preview"
                      style={styles.imagePreview}
                    />
                  )}
                  {currentItem.image && (
                    <p style={{ fontSize: "0.875rem", color: "#10B981", marginTop: "0.5rem" }}>
                      ✓ File selected: {currentItem.image.name} ({(currentItem.image.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                {errors.image && <span style={styles.error}>{errors.image}</span>}
              </div>

              <button
                type="submit"
                style={styles.addButton}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(139, 92, 246, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(139, 92, 246, 0.4)";
                }}
              >
                Add to Portfolio
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div style={styles.previewCard}>
            <h2 style={styles.sectionTitle}>
              Portfolio Items ({portfolioItems.length})
            </h2>
            {portfolioItems.length > 0 ? (
              <div style={styles.itemsList}>
                {portfolioItems.map((item) => (
                  <div key={item.id} style={styles.itemCard}>
                    <img
                      src={item.imagePreview}
                      alt={item.title}
                      style={styles.itemImage}
                    />
                    <div style={styles.itemContent}>
                      <div style={styles.itemHeader}>
                        <h3 style={styles.itemTitle}>{item.title}</h3>
                        <button
                          type="button"
                          style={styles.removeButton}
                          onClick={() => handleRemoveItem(item.id)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = "#c53030";
                            e.currentTarget.style.transform = "scale(1.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#e53e3e";
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        >
                          ×
                        </button>
                      </div>
                      <p style={styles.itemDescription}>{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.emptyState}>
                <p>No items added yet. Add your first project above!</p>
              </div>
            )}

            {portfolioItems.length > 0 && (
              <div style={styles.actionButtons}>
                <button
                  type="button"
                  style={{ ...styles.button, ...styles.secondaryButton }}
                  onClick={() => (window.location.hash = "#/profile")}
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
                  type="button"
                  style={{
                    ...styles.button,
                    ...styles.primaryButton,
                    ...(loading ? styles.buttonDisabled : {}),
                  }}
                  onClick={handleSaveAll}
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
                  {loading ? "Saving..." : `Save ${portfolioItems.length} Item${portfolioItems.length > 1 ? "s" : ""}`}
                </button>
              </div>
            )}

            {errors.submit && (
              <div style={styles.submitError}>{errors.submit}</div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

