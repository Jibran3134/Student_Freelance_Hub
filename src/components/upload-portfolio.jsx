import React, { useState, useEffect } from "react";
import { auth, db, storage } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import styles from "./styles/upload-portfolio.module.css";

export default function UploadPortfolio() {
  const [portfolioItems, setPortfolioItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    title: "",
    description: "",
    image: null,
    imagePreview: null,
    visibility: "public",
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
      visibility: currentItem.visibility || "public",
    };

    setPortfolioItems((prev) => [...prev, newItem]);
    setCurrentItem({
      title: "",
      description: "",
      image: null,
      imagePreview: null,
      visibility: "public",
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
          visibility: item.visibility || "public",
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

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Upload Portfolio</h1>
          <p className={styles.subtitle}>
            Showcase your best work to potential clients
          </p>
        </div>

        <div className={styles.mainContent}>
          {/* Form Section */}
          <div className={styles.formCard}>
            <h2 className={styles.sectionTitle}>Add New Item</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddItem();
              }}
              className={styles.form}
            >
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="title">
                  Project Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={currentItem.title}
                  onChange={handleInputChange}
                  placeholder="Enter project title"
                  className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
                />
                {errors.title && <span className={styles.error}>{errors.title}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={currentItem.description}
                  onChange={handleInputChange}
                  placeholder="Describe your project..."
                  className={`${styles.textarea} ${errors.description ? styles.textareaError : ""}`}
                />
                {errors.description && (
                  <span className={styles.error}>{errors.description}</span>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="visibility">
                  Visibility
                </label>
                <select
                  id="visibility"
                  name="visibility"
                  value={currentItem.visibility}
                  onChange={handleInputChange}
                  className={styles.input} // Reusing input style for consistency
                  style={{ height: 'auto', padding: '0.75rem' }}
                >
                  <option value="public">Public (Everyone)</option>
                  <option value="private">Private (Only Me)</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>Project Image</label>
                <div className={styles.imageUpload}>
                  <label htmlFor="portfolioImage" className={styles.fileInputLabel}>
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
                    className={styles.fileInput}
                  />
                  {currentItem.imagePreview && (
                    <img
                      src={currentItem.imagePreview}
                      alt="Preview"
                      className={styles.imagePreview}
                    />
                  )}
                  {currentItem.image && (
                    <p className={styles.fileSelected}>
                      ✓ File selected: {currentItem.image.name} ({(currentItem.image.size / 1024).toFixed(2)} KB)
                    </p>
                  )}
                </div>
                {errors.image && <span className={styles.error}>{errors.image}</span>}
              </div>

              <button
                type="submit"
                className={styles.addButton}
              >
                Add to Portfolio
              </button>
            </form>
          </div>

          {/* Preview Section */}
          <div className={styles.previewCard}>
            <h2 className={styles.sectionTitle}>
              Portfolio Items ({portfolioItems.length})
            </h2>
            {portfolioItems.length > 0 ? (
              <div className={styles.itemsList}>
                {portfolioItems.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <img
                      src={item.imagePreview}
                      alt={item.title}
                      className={styles.itemImage}
                    />
                    <div className={styles.itemContent}>
                      <div className={styles.itemHeader}>
                        <h3 className={styles.itemTitle}>{item.title}</h3>
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          ×
                        </button>
                      </div>
                      <p className={styles.itemDescription}>{item.description}</p>
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: item.visibility === 'public' ? '#d1fae5' : '#fee2e2',
                        color: item.visibility === 'public' ? '#065f46' : '#991b1b',
                        marginTop: '0.5rem',
                        display: 'inline-block'
                      }}>
                        {item.visibility === 'public' ? 'Public' : 'Private'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <p>No items added yet. Add your first project above!</p>
              </div>
            )}

            {portfolioItems.length > 0 && (
              <div className={styles.actionButtons}>
                <button
                  type="button"
                  className={`${styles.button} ${styles.secondaryButton}`}
                  onClick={() => (window.location.hash = "#/profile")}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${styles.button} ${styles.primaryButton} ${loading ? styles.buttonDisabled : ""}`}
                  onClick={handleSaveAll}
                  disabled={loading}
                >
                  {loading ? "Saving..." : `Save ${portfolioItems.length} Item${portfolioItems.length > 1 ? "s" : ""}`}
                </button>
              </div>
            )}

            {errors.submit && (
              <div className={styles.submitError}>{errors.submit}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

