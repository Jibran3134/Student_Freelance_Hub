# Firebase Storage Rules Configuration

## IMPORTANT: Configure These Rules in Firebase Console

Your images are not uploading because Firebase Storage needs permission rules.

### How to Fix:

1. Go to: https://console.firebase.google.com/
2. Select your project: "student-s-freelance-hub"
3. Click "Storage" in the left sidebar
4. Click the "Rules" tab
5. Replace the existing rules with the code below:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload their own profile pictures
    match /profile-pictures/{userId}/{allPaths=**} {
      allow read: if true;  // Anyone can view profile pictures
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload their own cover photos
    match /cover-photos/{userId}/{allPaths=**} {
      allow read: if true;  // Anyone can view cover photos
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to upload portfolio items
    match /portfolio/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Click "Publish" to save the rules

### What These Rules Do:

- **profile-pictures**: Users can only upload to their own folder (userId)
- **cover-photos**: Users can only upload to their own folder (userId)
- **portfolio**: Users can only upload to their own folder (userId)
- **read: if true**: Anyone can VIEW the images (public access)
- **write: if request.auth != null**: Only logged-in users can upload
- **request.auth.uid == userId**: Users can only upload to their own folder

### After Publishing:

1. Refresh your app
2. Try uploading an image again
3. Check the browser console (F12) for any error messages
4. The upload should work within 5 seconds!

---

## Troubleshooting

If images still don't upload after configuring rules:

1. **Check Browser Console** (Press F12):
   - Look for error messages in red
   - Share the error message with me

2. **Verify Firebase Storage is Enabled**:
   - In Firebase Console > Storage
   - Make sure Storage is initialized (not showing "Get Started")

3. **Check File Size**:
   - Maximum file size: 5MB
   - Supported formats: JPG, PNG, GIF, WEBP

4. **Check Internet Connection**:
   - Uploads require stable internet
   - Large files may take 2-3 seconds

---

## Current Upload Flow:

1. User selects image → Preview shows immediately
2. User clicks "Save Changes" → Upload starts
3. Upload completes (2-3 sec) → URL saved to database
4. Redirect to profile → Image displays

**Total Time: ~3-5 seconds**
