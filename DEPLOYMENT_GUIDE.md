# Account Deletion Page - Quick Deployment Guide

## 🚀 Quick Start (5 Minutes)

### 1. Prepare Files
- All files are ready in the `account-deletion/` folder
- Add your logo to `images/logo.png` (optional - page works without it)

### 2. Create GitHub Repository
```bash
# Create a new repository on GitHub
# Name: upasthiti-account-deletion
# Make it PUBLIC
```

### 3. Upload Files
- Upload all files from `account-deletion/` folder to your repository
- Or use Git:
```bash
cd account-deletion
git init
git add .
git commit -m "Initial commit: Account deletion page"
git remote add origin https://github.com/[your-username]/upasthiti-account-deletion.git
git push -u origin main
```

### 4. Enable GitHub Pages
1. Go to repository **Settings** → **Pages**
2. **Source**: `Deploy from a branch`
3. **Branch**: `main` / `root`
4. Click **Save**

### 5. Get Your URL
Your page will be available at:
```
https://[your-username].github.io/upasthiti-account-deletion/
```

### 6. Update Footer Links (Optional)
Edit `index.html` and replace:
```html
https://your-username.github.io/upasthiti-privacy-policy/
```
With your actual privacy policy URL.

### 7. Add to Google Play Console
1. Go to **Google Play Console**
2. Select your app → **App Content** → **Data Safety**
3. Under **Data deletion**, add:
   ```
   https://[your-username].github.io/upasthiti-account-deletion/
   ```

## ✅ Verification Checklist

After deployment, verify:

- [ ] Page loads without errors
- [ ] All sections are visible (no login required to view)
- [ ] Login form works
- [ ] Re-authentication works
- [ ] Deletion confirmation works
- [ ] Mobile responsive
- [ ] Footer links work (if updated)

## 🔧 Firebase Configuration

The Firebase config is already set up. If you need to change it:

1. Edit `index.html`
2. Find `firebaseConfig` object
3. Update with your Firebase project details

**Note**: The API key is public and safe - it's restricted by Firebase Console settings.

## 📱 Testing

Test the complete flow:
1. Visit the page (should load without login)
2. Read the information sections
3. Log in with test account
4. Re-authenticate
5. Confirm deletion (type "DELETE" + checkbox)
6. Confirm in modal
7. Verify account is deleted

## 🆘 Common Issues

### Page Not Loading
- Check GitHub Pages is enabled
- Verify repository is public
- Wait 1-2 minutes after enabling Pages

### Firebase Errors
- Check internet connection
- Verify Firebase project is active
- Check browser console for specific errors

### Deletion Not Working
- Verify Firestore rules allow deletion
- Check Storage rules allow deletion
- Ensure user is properly authenticated

## 📞 Need Help?

Contact: teamupasthiti@gmail.com

---

**Ready to deploy!** Follow the steps above and your account deletion page will be live in minutes.

