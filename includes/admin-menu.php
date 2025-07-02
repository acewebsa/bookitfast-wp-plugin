<?php

// Prevent direct access
if (!defined('ABSPATH')) {
	exit;
}

/**
 * Register the admin menu for Book It Fast.
 */
add_action('admin_menu', function () {
	add_menu_page(
		'Book It Fast',                 // Page title
		'Book It Fast',                 // Menu title
		'manage_options',               // Capability
		'bookitfast-main',              // Menu slug
		'bookitfast_main_page',         // Callback function
		'dashicons-calendar-alt',       // Icon
		20                              // Position
	);

	add_submenu_page(
		'bookitfast-main',
		'Login Settings',               // Subpage title
		'Login Settings',               // Submenu title
		'manage_options',
		'bookitfast-login-settings',
		'bookitfast_api_login_settings_page' // Callback to login settings
	);
});

/**
 * Enqueue admin styles for Book It Fast
 */
add_action('admin_enqueue_scripts', function ($hook) {
	if (strpos($hook, 'bookitfast') !== false) {
		wp_enqueue_style('bookitfast-admin-styles', plugins_url('assets/admin.css', dirname(__FILE__)), array(), '1.0.0');
	}
});

/**
 * Display the main Book It Fast page.
 */
function bookitfast_main_page()
{
	$token = bookitfast_get_token();

	if (!$token) {
		echo '<div class="wrap">';
		echo '<h1>Book It Fast</h1>';
		echo '<div class="notice notice-warning"><p><strong>You are not logged in.</strong> Please go to <a href="' . esc_url(admin_url('admin.php?page=bookitfast-login-settings')) . '">Login Settings</a> to log in with your Book It Fast account.</p></div>';
		echo '</div>';
		return;
	}

	$user_data = bookitfast_fetch_user_data($token);

	if (is_wp_error($user_data)) {
		echo '<div class="wrap">';
		echo '<h1>Book It Fast</h1>';
		echo '<div class="notice notice-error"><p><strong>Failed to fetch user information:</strong> ' . esc_html($user_data->get_error_message()) . '</p></div>';
		echo '</div>';
		return;
	}

	echo '<div class="wrap">';
	echo '<h1>Welcome, ' . esc_html($user_data['name']) . '</h1>';
	echo '<div class="card">';
	echo '<p><strong>Email:</strong> ' . esc_html($user_data['email']) . '</p>';
	echo '</div>';
	echo '<h2>Properties</h2>';
	echo '<div class="card">';
	echo '<p>You can manage your properties using the Gutenberg block on the front end.</p>';
	echo '</div>';
	echo '</div>';
}

/**
 * Display the login settings page.
 */
function bookitfast_api_login_settings_page()
{
	$current_token = bookitfast_get_token();
?>
	<div class="wrap">
		<h1><?php echo esc_html(get_admin_page_title()); ?></h1>

		<div class="bookitfast-admin-container">
			<?php if (!$current_token): ?>
				<div class="notice notice-info">
					<h3>🚀 Welcome to Book It Fast!</h3>
					<p><strong>To get started, you'll need a Book It Fast account.</strong></p>
					<p>📝 <strong>Don't have an account yet?</strong> <a href="https://bookitfast.app/admin/register" target="_blank" class="button button-secondary">Create Account at Book It Fast</a></p>
					<p>🌐 Visit <a href="https://bookitfast.app" target="_blank">https://bookitfast.app</a> to sign up and manage your properties.</p>
				</div>
			<?php else: ?>
				<div class="notice notice-success">
					<p>✅ <strong>You are successfully logged in!</strong> Your booking calendar is ready to use.</p>
				</div>
			<?php endif; ?>

			<div class="bookitfast-login-card">
				<h2><?php echo $current_token ? 'Update Login Credentials' : 'Login to Your Book It Fast Account'; ?></h2>

				<?php if (!$current_token): ?>
					<p class="description">Enter your Book It Fast account credentials to connect your WordPress site with your booking calendar.</p>
				<?php endif; ?>

				<form method="post" class="bookitfast-login-form">
					<?php wp_nonce_field('bookitfast_login', 'bookitfast_login_nonce'); ?>
					<?php
					if (isset($_POST['bookitfast_login_nonce']) && wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['bookitfast_login_nonce'])), 'bookitfast_login')) {
						if (isset($_POST['email']) && isset($_POST['password'])) {
							$email = sanitize_email(wp_unslash($_POST['email']));
							$password = sanitize_text_field(wp_unslash($_POST['password']));
							$token = bookitfast_api_authenticate($email, $password);

							if (is_wp_error($token)) {
								echo '<div class="notice notice-error inline"><p><strong>Login failed:</strong> ' . esc_html($token->get_error_message()) . '</p></div>';
							} else {
								bookitfast_store_token($token);
								echo '<div class="notice notice-success inline"><p><strong>Success!</strong> Login successful! Your token has been stored securely.</p></div>';
								echo '<script>setTimeout(function() { window.location.reload(); }, 2000);</script>';
							}
						}
					}
					?>

					<table class="form-table" role="presentation">
						<tbody>
							<tr>
								<th scope="row">
									<label for="email">Email Address</label>
								</th>
								<td>
									<input type="email" name="email" id="email" required class="regular-text" placeholder="your-email@example.com">
									<p class="description">The email address for your Book It Fast account.</p>
								</td>
							</tr>
							<tr>
								<th scope="row">
									<label for="password">Password</label>
								</th>
								<td>
									<input type="password" name="password" id="password" required class="regular-text" placeholder="Your account password">
									<p class="description">Your Book It Fast account password.</p>
								</td>
							</tr>
						</tbody>
					</table>

					<p class="submit">
						<?php submit_button($current_token ? 'Update Login' : 'Connect Account', 'primary', 'submit', false); ?>
						<?php if ($current_token): ?>
							<a href="<?php echo esc_url(admin_url('admin.php?page=bookitfast-main')); ?>" class="button button-secondary" style="margin-left: 10px;">Back to Dashboard</a>
						<?php endif; ?>
					</p>
				</form>
			</div>

			<div class="bookitfast-help-section">
				<h3>Need Help?</h3>
				<ul>
					<li>📧 <strong>Forgot your password?</strong> <a href="https://bookitfast.app/password/reset" target="_blank">Reset it here</a></li>
					<li>📖 <strong>Need support?</strong> Visit our <a href="https://blog.bookitfast.app/" target="_blank">support blog</a></li>
					<li>🏠 <strong>Manage properties:</strong> Log into your <a href="https://bookitfast.app/dashboard" target="_blank">Book It Fast dashboard</a></li>
					<li>📝 <strong>New to Book It Fast?</strong> <a href="https://bookitfast.app/admin/register" target="_blank">Create your account</a></li>
				</ul>
			</div>
		</div>
	</div>
<?php
}
