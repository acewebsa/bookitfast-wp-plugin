# BookItFast WordPress Plugin - Publishing Guide

## 📦 **Distribution Zip Contents**

### ✅ **Files & Folders TO INCLUDE:**

#### **Essential Plugin Files**

- `bookitfast.php` - Main plugin file with headers and activation logic
- `readme.txt` - WordPress plugin repository description and metadata

#### **Compiled Assets** (from `npm run build`)

- `build/` folder **ENTIRE CONTENTS**:
    - `build/editor.js` + `build/editor.asset.php` - Block editor functionality
    - `build/frontend.js` + `build/frontend.asset.php` - Frontend booking form
    - `build/gift-certificate-frontend.js` + `build/gift-certificate-frontend.asset.php` - Gift certificate form
    - `build/gift-certificate.js` + `build/gift-certificate.asset.php` - Gift certificate block editor
    - `build/editor.css` + `build/editor-rtl.css` - Editor styles
    - `build/frontend.css` + `build/frontend-rtl.css` - Frontend styles
    - `build/gift-certificate-frontend.css` + `build/gift-certificate-frontend-rtl.css` - GC styles

#### **PHP Backend Functionality**

- `includes/` folder **ENTIRE CONTENTS**:
    - `includes/admin-menu.php` - WordPress admin interface
    - `includes/api.php` - REST API endpoints and booking logic
    - `includes/blocks.php` - Gutenberg block registration and rendering
    - `includes/gift-certificate.php` - Gift certificate functionality
    - `includes/components/` - Any PHP component files (if present)

#### **Optional (if present)**

- `languages/` folder - Translation files (.po, .pot, .mo files)

---

### ❌ **Files & Folders TO EXCLUDE:**

#### **Development Source Code**

- `src/` folder - React/JavaScript source files (compiled into `build/`)
- `assets/` folder - CSS/JS source files (compiled into `build/`)
- `components/` folder - React component source files

#### **Node.js Development**

- `node_modules/` folder - NPM dependencies
- `package.json` - NPM configuration
- `package-lock.json` - NPM lock file
- `webpack.config.js` - Build configuration

#### **Development Tools**

- `bin/` folder - Development scripts
- `tests/` folder - PHPUnit tests
- `phpunit.xml.dist` - Testing configuration

#### **Documentation & Meta**

- `publish.md` - **THIS FILE** (publishing instructions)
- `.git/` folder - Git repository
- `.gitignore` - Git ignore rules

#### **Backup/Release Folders**

- `bundle/` folder - Previous bundles
- `releases/` folder - Version archives

---

## 🚀 **Step-by-Step Publishing Process**

### **1. Pre-Publishing Checklist**

- [ ] All features tested and working
- [ ] Gift certificate functionality fully tested (both scenarios)
- [ ] Frontend styles loading correctly
- [ ] No console errors in browser
- [ ] API endpoints responding correctly

### **2. Build Assets**

```bash
npm run build
```

**Verify:** Check that `build/` folder contains all expected files with recent timestamps.

### **3. Version Management**

- [ ] Update version in `bookitfast.php` header:
    ```php
    * Version: X.X.X
    ```
- [ ] Update version in `readme.txt`:
    ```
    Stable tag: X.X.X
    ```
- [ ] Add changelog entry to `readme.txt`

### **4. Create Distribution Zip**

#### **Method 1: Manual Selection**

1. Create new folder: `bookitfast-vX.X.X/`
2. Copy files following the inclusion list above
3. Compress folder to `bookitfast-vX.X.X.zip`

#### **Method 2: Command Line (Windows)**

```powershell
# Create temporary directory
mkdir temp-build
cd temp-build

# Copy required files
copy ..\bookitfast.php .
copy ..\readme.txt .
xcopy ..\build build\ /E /I
xcopy ..\includes includes\ /E /I
xcopy ..\languages languages\ /E /I

# Create zip
Compress-Archive -Path * -DestinationPath ..\bookitfast-vX.X.X.zip

# Cleanup
cd ..
rmdir temp-build /S /Q
```

### **5. Quality Assurance Testing**

- [ ] Install zip on clean WordPress site
- [ ] Test booking form functionality
- [ ] Test gift certificate redemption (both scenarios)
- [ ] Verify all styles load correctly
- [ ] Test in Gutenberg block editor
- [ ] Check for PHP errors in debug log

### **6. File Size Verification**

- **Target:** Under 5MB (preferably under 2MB)
- **Current estimate:** ~500KB-1MB (very reasonable)

---

## 📂 **Final Zip Structure**

```
bookitfast-vX.X.X.zip
├── bookitfast.php
├── readme.txt
├── build/
│   ├── editor.js
│   ├── editor.asset.php
│   ├── editor.css
│   ├── editor-rtl.css
│   ├── frontend.js
│   ├── frontend.asset.php
│   ├── frontend.css
│   ├── frontend-rtl.css
│   ├── gift-certificate-frontend.js
│   ├── gift-certificate-frontend.asset.php
│   ├── gift-certificate-frontend.css
│   ├── gift-certificate-frontend-rtl.css
│   ├── gift-certificate.js
│   └── gift-certificate.asset.php
├── includes/
│   ├── admin-menu.php
│   ├── api.php
│   ├── blocks.php
│   ├── gift-certificate.php
│   └── components/ (if exists)
└── languages/ (if exists)
```

---

## 🔧 **Troubleshooting Common Issues**

### **Missing Styles on Frontend**

- ✅ **Fixed:** `includes/blocks.php` now references `build/` folder instead of `assets/`
- **Test:** Check browser network tab for 404 errors on CSS files

### **JavaScript Errors**

- **Check:** All `.asset.php` files are included in zip
- **Check:** WordPress dependencies are properly loaded

### **Gift Certificate Issues**

- **Test both scenarios:** Full coverage (order_payable_now = 0) and partial coverage
- **Verify:** API responses match expected format
- **Check:** Weekly discount logic working correctly

---

## 📋 **Release Checklist**

### **Before Creating Zip:**

- [ ] `npm run build` completed successfully
- [ ] Version numbers updated in both files
- [ ] Changelog updated
- [ ] All features tested

### **Zip Creation:**

- [ ] Only includes files from inclusion list
- [ ] Excludes all development files
- [ ] Proper folder structure maintained
- [ ] File size under 5MB

### **Post-Creation Testing:**

- [ ] Install on clean WordPress site
- [ ] Test booking form end-to-end
- [ ] Test gift certificate redemption
- [ ] Verify no console errors
- [ ] Check all styles load correctly

### **Distribution:**

- [ ] Upload to WordPress.org (if applicable)
- [ ] Tag release in Git repository
- [ ] Update documentation if needed

---

## 🎯 **Key Success Metrics**

- ✅ **Booking form works end-to-end**
- ✅ **Gift certificates handle both scenarios correctly**
- ✅ **Frontend styles load properly**
- ✅ **No JavaScript console errors**
- ✅ **Proper WordPress coding standards**
- ✅ **Clean, minimal file size**

---

**Last Updated:** $(date)
**Plugin Version:** Check `bookitfast.php` for current version
**WordPress Compatibility:** 5.0+ (uses Gutenberg blocks)
