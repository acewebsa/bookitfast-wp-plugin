<?php

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
 * Display the main Book It Fast page.
 */
function bookitfast_main_page() {
	$token = bookitfast_get_token();

	if (!$token) {
		echo '<div class="wrap">';
		echo '<h1>Book It Fast</h1>';
		echo '<p style="color: red;">You are not logged in. Please go to <a href="' . admin_url('admin.php?page=bookitfast-login-settings') . '">Login Settings</a> to log in.</p>';
		echo '</div>';
		return;
	}

	$user_data = bookitfast_fetch_user_data($token);

	if (is_wp_error($user_data)) {
		echo '<div class="wrap">';
		echo '<h1>Book It Fast</h1>';
		echo '<p style="color: red;">Failed to fetch user information: ' . esc_html($user_data->get_error_message()) . '</p>';
		echo '</div>';
		return;
	}

	echo '<div class="wrap">';
	echo '<h1>Welcome, ' . esc_html($user_data['name']) . '</h1>';
	echo '<p>Email: ' . esc_html($user_data['email']) . '</p>';
	echo '<h2>Properties</h2>';
	echo '<p>You can manage your properties using the Gutenberg block on the front end.</p>';
	echo '</div>';
}

/**
 * Display the login settings page.
 */
function bookitfast_api_login_settings_page() {
	?>
	<div class="wrap">
		<h1>Book It Fast API Login Settings</h1>
		<form method="post">
			<?php
			if ($_POST) {
				$email = sanitize_email($_POST['email']);
				$password = sanitize_text_field($_POST['password']);
				$token = bookitfast_api_authenticate($email, $password);

				if (is_wp_error($token)) {
					echo '<p style="color: red;">' . esc_html($token->get_error_message()) . '</p>';
				} else {
					bookitfast_store_token($token);
					echo '<p style="color: green;">Login successful! Token stored securely.</p>';
				}
			}
			?>
			<table class="form-table">
				<tr valign="top">
					<th scope="row"><label for="email">Email</label></th>
					<td><input type="email" name="email" id="email" required class="regular-text"></td>
				</tr>
				<tr valign="top">
					<th scope="row"><label for="password">Password</label></th>
					<td><input type="password" name="password" id="password" required class="regular-text"></td>
				</tr>
			</table>
			<?php submit_button('Login'); ?>
		</form>
	</div>
	<?php
}
