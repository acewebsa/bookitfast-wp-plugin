=== Book It Fast ===
Contributors: bookitfast
Donate link: https://bookitfast.app/
Tags: booking, calendar, reservation, property, management, bnb, short term rental, str, holiday rental, vacation rental, holiday house
Requires at least: 5.0
Tested up to: 6.8
Requires PHP: 7.4
Stable tag: 1.0.0
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

= 0.1.0 =
Initial release of the Book It Fast WordPress plugin.


