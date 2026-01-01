# Cross-Linking Guide

## 🔗 Complete URL Configuration for All Pages

This guide helps you configure URLs so users can navigate between Privacy Policy, Terms of Service, and Account Deletion pages seamlessly.

## 📋 Configuration Files

### 1. Account Deletion Pages

**File**: `account-deletion/js/config.js`

```javascript
const CONFIG = {
    PRIVACY_POLICY_URL: 'https://your-username.github.io/upasthiti-privacy-policy/',
    TERMS_URL: 'https://your-username.github.io/upasthiti-privacy-policy/terms.html',
    CONTACT_EMAIL: 'teamupasthiti@gmail.com'
};
```

**What it does**: Sets footer links on all account deletion pages (index, login, reauth, confirm, success)

### 2. Privacy Policy Website

**File**: `privacy-policy-website/js/config.js`

```javascript
const CONFIG = {
    ACCOUNT_DELETION_URL: 'https://your-username.github.io/upasthiti-account-deletion/',
    CONTACT_EMAIL: 'teamupasthiti@gmail.com'
};
```

**What it does**: Sets "Delete Account" link in footer of Privacy Policy and Terms pages

## 🔄 Link Structure

### From Account Deletion Pages → Privacy Policy & Terms

All account deletion pages have footer links to:
- ✅ Privacy Policy
- ✅ Terms of Service

### From Privacy Policy & Terms → Account Deletion

Both Privacy Policy and Terms pages have footer links to:
- ✅ Privacy Policy (self)
- ✅ Terms of Service
- ✅ **Delete Account** (new)

## 🚀 Setup Instructions

### Step 1: Deploy Both Websites

1. **Privacy Policy Website**
   - Repository: `upasthiti-privacy-policy`
   - URL: `https://your-username.github.io/upasthiti-privacy-policy/`

2. **Account Deletion Website**
   - Repository: `upasthiti-account-deletion`
   - URL: `https://your-username.github.io/upasthiti-account-deletion/`

### Step 2: Update Account Deletion Config

Edit `account-deletion/js/config.js`:

```javascript
PRIVACY_POLICY_URL: 'https://your-username.github.io/upasthiti-privacy-policy/',
TERMS_URL: 'https://your-username.github.io/upasthiti-privacy-policy/terms.html',
```

### Step 3: Update Privacy Policy Config

Edit `privacy-policy-website/js/config.js`:

```javascript
ACCOUNT_DELETION_URL: 'https://your-username.github.io/upasthiti-account-deletion/',
```

### Step 4: Test All Links

1. **From Account Deletion Pages:**
   - Go to any account deletion page
   - Click "Privacy Policy" in footer → Should open privacy policy
   - Click "Terms of Service" in footer → Should open terms

2. **From Privacy Policy:**
   - Go to privacy policy page
   - Click "Delete Account" in footer → Should open account deletion page
   - Click "Terms of Service" in footer → Should open terms

3. **From Terms of Service:**
   - Go to terms page
   - Click "Delete Account" in footer → Should open account deletion page
   - Click "Privacy Policy" in footer → Should open privacy policy

## ✅ Complete Navigation Flow

```
Privacy Policy Page
    ↓
    [Footer Links]
    ├── Privacy Policy (self)
    ├── Terms of Service
    └── Delete Account → Account Deletion Page

Terms of Service Page
    ↓
    [Footer Links]
    ├── Privacy Policy
    ├── Terms of Service (self)
    └── Delete Account → Account Deletion Page

Account Deletion Pages (all)
    ↓
    [Footer Links]
    ├── Privacy Policy → Privacy Policy Page
    └── Terms of Service → Terms Page
```

## 🎯 Benefits

- ✅ **Easy Access**: Users can access account deletion from legal pages
- ✅ **Google Play Compliance**: Account deletion accessible from privacy policy
- ✅ **User-Friendly**: Clear navigation between related pages
- ✅ **Centralized Config**: Update URLs in one place per website
- ✅ **Consistent Experience**: Same footer structure across all pages

## 📝 Quick Reference

| Page | Footer Links |
|------|-------------|
| Privacy Policy | Privacy Policy, Terms, **Delete Account** |
| Terms of Service | Privacy Policy, Terms, **Delete Account** |
| Account Deletion (all) | Privacy Policy, Terms |

---

**Status**: ✅ **COMPLETE - All pages cross-linked with proper configuration**

