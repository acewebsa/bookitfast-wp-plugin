# Book It Fast Plugin - Publishing Guide

This guide outlines how to prepare and deploy the Book It Fast WordPress plugin to another site.

## 🏗️ Build Process

Before packaging, ensure all assets are built:

```bash
# Install dependencies (if not already installed)
npm install

# Build production assets
npm run build

# Optional: WordPress-specific tasks
npm run i18n        # Generate translation files
npm run readme      # Convert readme.txt to README.md
```

## 📦 Files to Include in Distribution

### ✅ Required Files & Folders

**Core Plugin Files:**

- `bookitfast.php` - Main plugin file
- `readme.txt` - WordPress plugin readme
- `index.php` - Security file (if exists)

**PHP Includes:**

- `includes/` - All PHP files
    - `includes/admin-menu.php`
    - `includes/api.php`
    - `includes/blocks.php`
    - `includes/gift-certificate.php`

**Built Assets:**

- `build/` - All compiled JavaScript and CSS files
    - `build/editor.js`
    - `build/editor.css`
    - `build/frontend.js`
    - `build/frontend.css`
    - `build/gift-certificate.js`
    - `build/gift-certificate-frontend.js`
    - `build/*.asset.php` files

**Static Assets:**

- `assets/` - CSS and JavaScript files
    - `assets/editor.css`
    - `assets/frontend.css`
    - `assets/frontend.js`
    - `assets/admin.css`
    - `assets/js/` (if any)

**Components (if used in frontend):**

- `components/` - React components used in frontend
    - `components/MultiEmbedForm.js`

### ❌ Files to EXCLUDE from Distribution

**Development Files:**

- `src/` - Source files (these get compiled into build/)
- `node_modules/` - NPM dependencies
- `package.json` - NPM configuration
- `package-lock.json` - NPM lock file
- `webpack.config.js` - Webpack configuration (extends @wordpress/scripts)
- `Gruntfile.js` - Grunt configuration (used for WordPress i18n tasks)

**Development Tools:**

- `.git/` - Git repository
- `.gitignore` - Git ignore file
- `publish.md` - This publishing guide
- `phpunit.xml.dist` - Testing configuration
- `tests/` - Test files
- `bin/` - Development scripts
- `releases/` - Release folders (for development organization only)

**Temporary Files:**

- Any `.log` files
- Any `.tmp` files
- Any editor temporary files

## 📁 Release Management

### Folder Structure:

```
bookitfast/
├── releases/
│   ├── 0.1.0/
│   │   ├── bookitfast/          # Plugin folder (ready to zip)
│   │   │   ├── bookitfast.php
│   │   │   ├── readme.txt
│   │   │   ├── includes/
│   │   │   ├── build/
│   │   │   ├── assets/
│   │   │   └── components/
│   │   ├── bookitfast-0.1.0.zip # Distribution ZIP
│   │   └── release-notes.md     # Optional: specific release notes
│   ├── 0.1.1/
│   │   ├── bookitfast/
│   │   ├── bookitfast-0.1.1.zip
│   │   └── release-notes.md
│   └── latest/                  # Symlink to current version
├── src/                         # Development source files
├── node_modules/                # Dev dependencies
├── package.json                 # Dev config
├── publish.md                   # This publishing guide
└── ... (other dev files)
```

### Release Process:

1. **Prepare Version:**

    ```bash
    # Create release folder
    mkdir releases/0.1.0
    mkdir releases/0.1.0/bookitfast
    ```

2. **Copy Distribution Files:**

    ```bash
    # Copy all required files (see checklist above)
    cp bookitfast.php releases/0.1.0/bookitfast/
    cp readme.txt releases/0.1.0/bookitfast/
    cp -r includes/ releases/0.1.0/bookitfast/
    cp -r build/ releases/0.1.0/bookitfast/
    cp -r assets/ releases/0.1.0/bookitfast/
    cp -r components/ releases/0.1.0/bookitfast/
    ```

3. **Create ZIP:**

    ```bash
    cd releases/0.1.0/
    zip -r bookitfast-0.1.0.zip bookitfast/
    cd ../../
    ```

4. **Test & Distribute:**
    - Test the ZIP file on a clean WordPress install
    - Upload `bookitfast-0.1.0.zip` to target sites

## 📋 Distribution Checklist

### Pre-Build Steps:

- [ ] Pull latest changes from git
- [ ] Update version number in `bookitfast.php`
- [ ] Update changelog in `readme.txt`
- [ ] Test plugin functionality locally

### Build Steps:

- [ ] Run `npm install` (if dependencies changed)
- [ ] Run `npm run build` (uses @wordpress/scripts)
- [ ] Verify `build/` folder contains all compiled assets
- [ ] Test that built assets work correctly
- [ ] Optional: Run `npm run i18n` for translation files

### Package Steps:

- [ ] Create release folder: `releases/[VERSION]/`
- [ ] Create plugin folder: `releases/[VERSION]/bookitfast/`
- [ ] Copy all required files (see list above)
- [ ] Verify no development files included
- [ ] Create ZIP: `bookitfast-[VERSION].zip`

### Final Steps:

- [ ] Test ZIP extraction and folder structure
- [ ] Test installation on staging site
- [ ] Verify all functionality works
- [ ] Document any configuration needed
- [ ] Update latest release reference

## 🗂️ Folder Structure for Distribution

```
bookitfast/
├── bookitfast.php
├── readme.txt
├── includes/
│   ├── admin-menu.php
│   ├── api.php
│   ├── blocks.php
│   └── gift-certificate.php
├── build/
│   ├── editor.js
│   ├── editor.css
│   ├── frontend.js
│   ├── frontend.css
│   ├── gift-certificate.js
│   ├── gift-certificate-frontend.js
│   └── *.asset.php
├── assets/
│   ├── editor.css
│   ├── frontend.css
│   ├── frontend.js
│   ├── admin.css
│   └── js/
└── components/
    └── MultiEmbedForm.js
```

## 🚀 Deployment Instructions

### For WordPress Admin Upload:

1. Zip the `bookitfast/` folder
2. Go to WordPress Admin → Plugins → Add New → Upload Plugin
3. Upload the ZIP file
4. Activate the plugin

### For FTP/Manual Upload:

1. Extract the ZIP file
2. Upload the `bookitfast/` folder to `/wp-content/plugins/`
3. Go to WordPress Admin → Plugins
4. Activate "Book It Fast"

### For WordPress.org Distribution:

1. Follow WordPress.org plugin submission guidelines
2. Ensure all files follow WordPress coding standards
3. Include proper plugin headers and documentation

## ⚙️ Post-Installation Configuration

After installing on a new site, users need to:

1. **Login Setup:**

    - Go to WordPress Admin → Book It Fast → Login Settings
    - Enter Book It Fast account credentials
    - Verify connection is successful

2. **API Configuration:**

    - Plugin should auto-set API URL to `https://bookitfast.app`
    - Verify in the debug information if needed

3. **Test Functionality:**
    - Check that admin dashboard loads user information
    - Test Gutenberg blocks work properly
    - Verify booking calendar displays correctly

## 🔧 Troubleshooting

**Common Issues:**

- **"Failed to fetch user information"**: Check login credentials and API connectivity
- **Blocks not loading**: Verify build assets are included and properly enqueued
- **Styling issues**: Ensure CSS files are included and loading

**Debug Mode:**

- Enable WordPress debug logging: `WP_DEBUG = true` and `WP_DEBUG_LOG = true`
- Check error logs for detailed information
- Use browser developer tools to check for JavaScript errors

## 📝 Version Management

**Before Each Release:**

1. Update version in `bookitfast.php` header
2. Update `readme.txt` changelog
3. Tag the release in git
4. Test thoroughly on clean WordPress installation
5. Create release notes

**Version Numbering:**

- Use semantic versioning: `MAJOR.MINOR.PATCH`
- Current version: Check `bookitfast.php` header

**Git Integration:**

```bash
# Tag the release
git tag v0.1.0
git push origin v0.1.0

# Create release branch (optional)
git checkout -b release/0.1.0
git push origin release/0.1.0
```

## 🛠️ Automation Ideas

**Build Script Example:**

```bash
#!/bin/bash
# build-release.sh

VERSION=$1
if [ -z "$VERSION" ]; then
  echo "Usage: ./build-release.sh 0.1.0"
  exit 1
fi

echo "Building release $VERSION..."

# Build assets
npm run build

# Generate translation files (optional)
npm run i18n

# Create release directory
mkdir -p "releases/$VERSION/bookitfast"

# Copy files
cp bookitfast.php "releases/$VERSION/bookitfast/"
cp readme.txt "releases/$VERSION/bookitfast/"
cp -r includes/ "releases/$VERSION/bookitfast/"
cp -r build/ "releases/$VERSION/bookitfast/"
cp -r assets/ "releases/$VERSION/bookitfast/"
cp -r components/ "releases/$VERSION/bookitfast/"

# Create ZIP
cd "releases/$VERSION"
zip -r "bookitfast-$VERSION.zip" bookitfast/
cd ../..

echo "Release $VERSION created successfully!"
echo "Files available in: releases/$VERSION/"
```

## 🎯 Pro Tips

1. **Add releases/ to .gitignore** - Don't commit built releases to git
2. **Version consistency**: Ensure version matches across all files
3. **Testing matrix**: Test on different WordPress versions
4. **Documentation**: Keep release notes for each version
5. **Backup strategy**: Always keep previous working versions
6. **Security**: Scan files before distribution
7. **Performance**: Optimize assets for production builds
