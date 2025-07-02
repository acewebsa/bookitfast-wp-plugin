<?php

/**
 * Plugin uninstall file
 *
 * @package BookItFast
 */

// If uninstall not called from WordPress, then exit.
if (! defined('WP_UNINSTALL_PLUGIN')) {
    exit;
}

// Delete plugin options
delete_option('bookitfast_settings');
delete_option('bookitfast_api_key');
delete_option('bookitfast_endpoint');

// Clean up any custom database tables or data if needed
// global $wpdb;
// $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}bookitfast_data" );

// Clear any cached data
wp_cache_flush();
