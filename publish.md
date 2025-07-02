# BookItFast WordPress Plugin - Publishing Guide

## 📦 **WordPress.org Submission Requirements**

### 🎨 **Required Assets for WordPress.org**

You need to create the following images and place them in the `wp-org-assets/` folder:

#### **Plugin Icons** (Required)

- `wp-org-assets/icon-128x128.png` - 128x128 pixels
- `wp-org-assets/icon-256x256.png` - 256x256 pixels
- **Format:** PNG with transparent background
- **Content:** Simple, recognizable icon representing booking/calendar functionality

#### **Plugin Banners** (Required)

- `wp-org-assets/banner-772x250.png` - 772x250 pixels (standard banner)
- `wp-org-assets/banner-1544x500.png` - 1544x500 pixels (high-resolution banner)
- **Format:** PNG or JPG
- **Content:** Plugin name, brief description, and attractive visual

#### **Screenshots** (Recommended)

Place in `wp-org-assets/` folder:

- `wp-org-assets/screenshot-1.png` - Booking form in Gutenberg editor
- `wp-org-assets/screenshot-2.png` - Frontend booking form
- `wp-org-assets/screenshot-3.png` - Gift certificate form
- `wp-org-assets/screenshot-4.png` - Admin dashboard
- **Format:** PNG or JPG
- **Size:** 1200x900 pixels recommended
- **Content:** Clear, well-lit screenshots showing plugin functionality

### 📋 **Image Creation Checklist**

- [ ] `wp-org-assets/icon-128x128.png` - Plugin icon (128x128)
- [ ] `wp-org-assets/icon-256x256.png` - Plugin icon (256x256)
- [ ] `wp-org-assets/banner-772x250.png` - Standard banner
- [ ] `wp-org-assets/banner-1544x500.png` - High-res banner
- [ ] `wp-org-assets/screenshot-1.png` - Editor view
- [ ] `wp-org-assets/screenshot-2.png` - Frontend form
- [ ] `wp-org-assets/screenshot-3.png` - Gift certificate
- [ ] `wp-org-assets/screenshot-4.png` - Admin dashboard

---

## 📦 **Distribution Zip Contents**

### ✅ **Files & Folders TO INCLUDE:**

#### **Essential Plugin Files**

- `bookitfast.php` - Main plugin file with headers and activation logic
- `readme.txt` - WordPress plugin repository description and metadata
- `uninstall.php` - Plugin cleanup when deleted

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

#### **Internationalization**

- `languages/` folder **ENTIRE CONTENTS**:
    - `languages/bookitfast.pot` - Translation template file
    - Any `.po` and `.mo` translation files

#### **WordPress.org Assets** (for submission only)

- `wp-org-assets/` folder **ENTIRE CONTENTS** (only for WordPress.org submission)

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

### **1. Create Required Assets**

#### **Plugin Icons**

Create two identical icons at different sizes:

- Simple, clean design representing booking/calendar
- Transparent background (PNG format)
- Colors that work well on both light and dark backgrounds
- Avoid text in the icon (use symbols/graphics only)

#### **Plugin Banners**

Create two identical banners at different sizes:

- Include plugin name "BookItFast"
- Brief tagline: "Easy Holiday Rental Booking"
- Attractive background with booking/travel theme
- Professional typography and layout

#### **Screenshots**

Take high-quality screenshots showing:

1. Gutenberg editor with booking form block
2. Frontend booking form in action
3. Gift certificate purchase form
4. WordPress admin dashboard view

### **2. Update readme.txt**

Ensure your `readme.txt` contains:

- [ ] Contributors (must be actual WordPress.org usernames)
- [ ] Tags (10 max, relevant keywords)
- [ ] Requires at least: 5.0
- [ ] Tested up to: (latest WordPress version)
- [ ] Stable tag: (current version)
- [ ] License: GPL v2 or later
- [ ] Detailed description
- [ ] Installation instructions
- [ ] Frequently Asked Questions
- [ ] Screenshots section
- [ ] Changelog

### **3. Pre-Publishing Checklist**

- [ ] All required assets created and placed in `wp-org-assets/`
- [ ] All features tested and working
- [ ] Gift certificate functionality fully tested (both scenarios)
- [ ] Frontend styles loading correctly
- [ ] No console errors in browser
- [ ] API endpoints responding correctly
- [ ] Plugin passes WordPress Plugin Check

### **4. Build Assets**

```bash
npm run build
```

**Verify:** Check that `build/` folder contains all expected files with recent timestamps.

### **5. Version Management**

- [ ] Update version in `bookitfast.php` header:
    ```php
    * Version: X.X.X
    ```
- [ ] Update version in `readme.txt`:
    ```
    Stable tag: X.X.X
    ```
- [ ] Add changelog entry to `readme.txt`

### **6. Create Distribution Zip**

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
copy ..\uninstall.php .
xcopy ..\build build\ /E /I
xcopy ..\includes includes\ /E /I
xcopy ..\languages languages\ /E /I

# For WordPress.org submission, also include:
xcopy ..\wp-org-assets wp-org-assets\ /E /I

# Create zip
Compress-Archive -Path * -DestinationPath ..\bookitfast-vX.X.X.zip

# Cleanup
cd ..
rmdir temp-build /S /Q
```

### **7. Quality Assurance Testing**

- [ ] Install zip on clean WordPress site
- [ ] Test booking form functionality
- [ ] Test gift certificate redemption (both scenarios)
- [ ] Verify all styles load correctly
- [ ] Test in Gutenberg block editor
- [ ] Check for PHP errors in debug log
- [ ] Run through WordPress Plugin Check

### **8. WordPress.org Submission**

1. Create account at WordPress.org
2. Submit plugin at: https://wordpress.org/plugins/developers/add/
3. Upload your plugin zip file
4. Wait for automated review (usually 1-2 days)
5. Address any feedback from review team
6. Once approved, your plugin will be live

---

## 📂 **Final Distribution Zip Structure**

```
bookitfast-vX.X.X.zip
├── bookitfast.php
├── readme.txt
├── uninstall.php
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
├── languages/
│   └── bookitfast.pot
└── wp-org-assets/ (for WordPress.org submission only)
    ├── icon-128x128.png
    ├── icon-256x256.png
    ├── banner-772x250.png
    ├── banner-1544x500.png
    ├── screenshot-1.png
    ├── screenshot-2.png
    ├── screenshot-3.png
    └── screenshot-4.png
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

### **WordPress.org Review Common Issues**

- **Security:** Ensure all user inputs are sanitized
- **Internationalization:** Use `__()` functions for translatable strings
- **Coding Standards:** Follow WordPress PHP coding standards
- **Accessibility:** Ensure forms are accessible
- **Performance:** Optimize database queries and asset loading

---

## 📋 **Complete Release Checklist**

### **Assets Creation:**

- [ ] Plugin icons created (128x128 and 256x256)
- [ ] Plugin banners created (772x250 and 1544x500)
- [ ] Screenshots taken and optimized
- [ ] All assets placed in `wp-org-assets/` folder

### **Code Preparation:**

- [ ] `npm run build` completed successfully
- [ ] Version numbers updated in both files
- [ ] Changelog updated in readme.txt
- [ ] All features tested
- [ ] WordPress Plugin Check passed

### **Zip Creation:**

- [ ] Only includes files from inclusion list
- [ ] Excludes all development files
- [ ] Proper folder structure maintained
- [ ] File size under 5MB
- [ ] `uninstall.php` included

### **Post-Creation Testing:**

- [ ] Install on clean WordPress site
- [ ] Test booking form end-to-end
- [ ] Test gift certificate redemption
- [ ] Verify no console errors
- [ ] Check all styles load correctly

### **WordPress.org Submission:**

- [ ] WordPress.org account created
- [ ] Plugin submitted for review
- [ ] All assets uploaded to SVN repository
- [ ] Review feedback addressed
- [ ] Plugin approved and live

---

## 🎯 **WordPress.org Guidelines Compliance**

### **Required Standards:**

- ✅ **Security:** All user inputs sanitized
- ✅ **Internationalization:** Translation-ready
- ✅ **Accessibility:** Forms are accessible
- ✅ **Performance:** Optimized loading
- ✅ **Coding Standards:** WordPress PHP standards
- ✅ **GPL License:** Compatible licensing

### **Success Metrics:**

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
**WordPress.org Submission:** Ready for review
