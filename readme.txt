=== Book It Fast ===
Contributors: bookitfast
Donate link: https://bookitfast.app/
Tags: short term rental, str, holiday rental, vacation rental, booking
Requires at least: 5.0
Tested up to: 7.0
Requires PHP: 7.4
Stable tag: 1.2.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WordPress site with Book It Fast to display booking calendars and manage property reservations.

== Description ==

Book It Fast integrates your WordPress website with the Book It Fast booking platform (https://bookitfast.app), a Software as a Service (SaaS) solution that provides comprehensive property booking and reservation management functionality.

**External Service Integration:**
This plugin connects to the Book It Fast API service to provide:
* Property availability checking and calendar display
* Secure payment processing through integrated payment gateways
* Gift certificate creation, validation, and redemption
* Booking data synchronization and management
* Real-time reservation updates

**Data Transmission:**
When users interact with booking forms, the following data is transmitted to Book It Fast servers:
* Customer details (name, email, phone, address) for booking purposes
* Payment information for secure transaction processing
* Booking preferences and special requests
* Gift certificate information when applicable

**Service Terms and Privacy:**
* Book It Fast Terms of Service: https://bookitfast.app/terms-of-service
* Book It Fast Privacy Policy: https://bookitfast.app/privacy-policy
* Data is processed according to Book It Fast's privacy policy and applicable data protection laws

**Key Features:**

* Multi-property booking calendar display
* Gift certificate management system
* Secure payment processing via Book It Fast service
* Real-time availability updates
* Customizable booking forms
* Admin dashboard for account management
* Gutenberg blocks for easy content integration
* Sensitive REST endpoints accept requests only from the same origin for added security

**Prerequisites:**
* Active Book It Fast account required (sign up at https://bookitfast.app)
* Valid API credentials for service authentication

**Source Code:**
The complete source code for this plugin is available at: https://github.com/acewebsa/bookitfast-wp-plugin

All JavaScript and CSS files in the `build/` directory are compiled from source files in the `src/` directory using @wordpress/scripts and webpack. Build instructions and development setup details are available in the GitHub repository.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/bookitfast` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Navigate to Book It Fast in your WordPress admin menu.
4. Go to Login Settings and enter your Book It Fast account credentials.
5. Configure data sharing preferences in the plugin settings.
6. Once authenticated, you can use the Book It Fast blocks in the Gutenberg editor to display booking calendars on your pages and posts.

== Frequently Asked Questions ==

= Do I need a Book It Fast account to use this plugin? =

Yes, you need an active Book It Fast account to use this plugin. You can sign up at https://bookitfast.app

= What data is shared with Book It Fast? =

When customers make bookings, their contact information, booking details, and payment data are securely transmitted to Book It Fast for processing. This data is handled according to Book It Fast's privacy policy.

= How do I connect my WordPress site to Book It Fast? =

After installing and activating the plugin, go to Book It Fast > Login Settings in your WordPress admin and enter your Book It Fast account credentials.

= Can I display multiple properties on one page? =

Yes, the plugin supports multi-property displays. You can configure which properties to show when adding the booking block to your page.

= Is payment processing secure? =

Yes, all payment processing is handled securely through encrypted connections and follows WordPress security best practices.

== Screenshots ==

1. Admin dashboard showing login settings
2. Booking calendar block in the Gutenberg editor
3. Frontend booking calendar display

== Changelog ==

= 1.2.0 =
* New: BIF Availability Calendar block — a month grid showing booked vs. free nights for a single property, sourced live from the booking engine. Configurable property, months shown, optional month scrolling (browse up to 24 months with prev/next arrows), booked and available colours, available-cell fill, and a legend.
* New: /property-availability-calendar REST endpoint (property_id + months) that proxies the booking engine's booked/available date ranges.
* New: "Hero with Booking Search" block pattern — a full-width hero with the BIF Availability Search built in, ready to drop onto a homepage (set the search's target booking page in the block settings).
* Changed: Block display names are now consistently prefixed "BIF" — BIF Availability (was Book It Fast Availability), BIF Gift Certificate (was Book It Fast Gift Certificate), plus BIF Availability Calendar and BIF Availability Search.

= 1.1.0 =
* New: Configurable visual style per booking surface — Search Form, Available Properties, Booking Summary, Your Details, and Terms can each be set to one of five new design directions (Quiet Ledger, Warm Itemised, Editorial Receipt, Stacked & Removable, Two-Column Ledger).
* New: Search form supports an editable Check-out date that automatically derives the number of nights, with the classic Nights selector still available.
* New: Property image now appears in the booking summary thumbnail (Quiet Ledger direction) when available.
* New: Helpful in-place error message when no properties are configured or no check-in date is selected, replacing the previous silent fail.
* Improved: Search Form Style dropdown is now consolidated — Default (Stacked), Horizontal (Check-In & Nights), and all five new directions live in a single editor control.
* Improved: Available Properties Style dropdown is now consolidated — Card List, Grid Tiles, Compact Rows, and all five new directions in one editor control. Label renamed for clarity.
* Improved: Button text colour, button colour, and button icon are now reflected correctly in the block editor preview for every search-form variant.
* Improved: Date pickers and night selectors in the new search-form directions now have proper padding, hover states, and custom dropdown chevrons (no more browser-default chrome).
* Improved: Spacing below the search form so the booking flow no longer feels cramped against the property list.
* Security: Major dependency upgrade — @wordpress/scripts bumped to 32.x, @wordpress/icons bumped to 13.x, plus an overrides block in package.json that force-resolves seventeen flagged transitive dependencies (including axios, lodash, minimatch, tar, fast-uri, basic-ftp, immutable, svgo, webpack-dev-server, ws, postcss). Down from 42 reported vulnerabilities to 3 dev-only residuals.

= 1.0.5 =
* Redesigned stacked (default) search layout with modern aesthetic
* Replaced emoji icons with clean SVG icons throughout
* Added configurable corner radius for search box styling
* Improved typography with uppercase labels and refined spacing
* Enhanced iOS date picker compatibility
* Added glass-morphism effects and subtle shadows for modern look

= 1.0.4 =
* Fixed currency display to use correct API field (order_currency)
* Added visual feedback - discount code button turns green when text is entered

= 1.0.3 =
* Added dynamic currency support - currency now automatically syncs from your Book It Fast organization settings
* Payment buttons now display correct currency symbol (AUD$, USD$, GBP£, EUR€, etc.)
* Currency automatically updates on admin dashboard page refresh
* All payment processing now uses organization-specific currency

= 1.0.2 =
* Included modal for when there is a basic booking condition

= 1.0.1 =
* Fix for including the optional extras in summary when selected


= 1.0.0 =
* Stable Version
* Improved style editing and options

= 0.1.0 =
* Initial release
* Book It Fast account integration
* Multi-property booking calendar blocks
* Gift certificate functionality
* Secure payment processing
* Admin dashboard for account management
* Block for adding availability on your page
* Block for adding gift certificate purchases on your page

== Upgrade Notice ==

= 1.1.0 =
Adds five new visual layouts per booking surface, an editable check-out date with auto-derived nights, and a major dependency upgrade that patches the bulk of reported security advisories. Recommended for all sites.

= 0.1.0 =
Initial release of the Book It Fast WordPress plugin.


