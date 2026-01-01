# ⚠️ QUICK FIX: Update Footer URLs

## 🔧 Problem
Footer links are not working because they contain placeholder URLs with `your-username`.

## ✅ Solution: Replace URLs in HTML Files

### For Account Deletion Pages:

**Find and Replace in ALL these files:**
- `index.html`
- `login.html`
- `reauth.html`
- `confirm.html`
- `success.html`

**Find:**
```
https://your-username.github.io/upasthiti-privacy-policy/
https://your-username.github.io/upasthiti-privacy-policy/terms.html
```

**Replace with:**
```
https://[YOUR-ACTUAL-GITHUB-USERNAME].github.io/upasthiti-privacy-policy/
https://[YOUR-ACTUAL-GITHUB-USERNAME].github.io/upasthiti-privacy-policy/terms.html
```

**Example:** If your GitHub username is `johnsmith`, replace with:
```
https://johnsmith.github.io/upasthiti-privacy-policy/
https://johnsmith.github.io/upasthiti-privacy-policy/terms.html
```

### For Privacy Policy & Terms Pages:

**Find and Replace in:**
- `privacy-policy-website/index.html`
- `privacy-policy-website/terms.html`

**Find:**
```
https://your-username.github.io/upasthiti-account-deletion/
```

**Replace with:**
```
https://[YOUR-ACTUAL-GITHUB-USERNAME].github.io/upasthiti-account-deletion/
```

**Example:** If your GitHub username is `johnsmith`, replace with:
```
https://johnsmith.github.io/upasthiti-account-deletion/
```

## 🚀 Quick Steps

1. **Open each HTML file** listed above
2. **Press Ctrl+H** (or Cmd+H on Mac) to open Find & Replace
3. **Find:** `your-username`
4. **Replace:** `[YOUR-ACTUAL-GITHUB-USERNAME]`
5. **Replace All**
6. **Save the file**

## ✅ Verify

After updating:
1. Open any HTML file in a browser
2. Scroll to footer
3. Click the links - they should work now!

---

**Note**: The links now have working URLs directly in the HTML, so they'll work even if JavaScript fails to load.

