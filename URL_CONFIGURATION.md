# URL Configuration Guide

## 🔗 Setting Up Privacy Policy and Terms URLs

The account deletion pages need to link to your Privacy Policy and Terms of Service pages. These URLs are configured in a central location for easy updates.

## 📝 Configuration File

Edit the file: **`js/config.js`**

Update these URLs with your actual GitHub Pages URLs:

```javascript
const CONFIG = {
    // Privacy Policy URL (update with your GitHub username)
    PRIVACY_POLICY_URL: 'https://your-username.github.io/upasthiti-privacy-policy/',
    
    // Terms of Service URL
    TERMS_URL: 'https://your-username.github.io/upasthiti-privacy-policy/terms.html',
    
    // Contact Email
    CONTACT_EMAIL: 'teamupasthiti@gmail.com'
};
```

## 🚀 Quick Setup

### Step 1: Find Your Privacy Policy URL

If your privacy policy is hosted on GitHub Pages, your URLs will be:
- **Privacy Policy**: `https://[your-github-username].github.io/upasthiti-privacy-policy/`
- **Terms of Service**: `https://[your-github-username].github.io/upasthiti-privacy-policy/terms.html`

### Step 2: Update config.js

1. Open `account-deletion/js/config.js`
2. Replace `your-username` with your actual GitHub username
3. Save the file

**Example:**
If your GitHub username is `johnsmith`, update to:
```javascript
PRIVACY_POLICY_URL: 'https://johnsmith.github.io/upasthiti-privacy-policy/',
TERMS_URL: 'https://johnsmith.github.io/upasthiti-privacy-policy/terms.html',
```

### Step 3: Verify Links

After updating, all footer links on these pages will automatically use the correct URLs:
- `index.html`
- `login.html`
- `reauth.html`
- `confirm.html`
- `success.html`

## ✅ Features

- **Centralized Configuration**: Update URLs in one place
- **Automatic Updates**: All pages use the same URLs
- **External Links**: Links open in new tabs (`target="_blank"`)
- **Security**: Links use `rel="noopener noreferrer"` for security

## 🔍 Testing

After updating the URLs:

1. Open any account deletion page
2. Scroll to the footer
3. Click "Privacy Policy" - should open your privacy policy page
4. Click "Terms of Service" - should open your terms page
5. Verify both links work correctly

## 🔄 Reverse Links

The Privacy Policy and Terms pages also link back to the Account Deletion page:

1. Open Privacy Policy page
2. Scroll to footer
3. Click "Delete Account" - should open account deletion page
4. Same for Terms of Service page

**Note**: You also need to update `privacy-policy-website/js/config.js` with your account deletion URL.

## 📞 Need Help?

If you need assistance:
- **Email**: teamupasthiti@gmail.com
- Check your GitHub Pages repository settings
- Verify your privacy policy repository is public

---

**Note**: Make sure your privacy policy repository is deployed and accessible before updating these URLs.

