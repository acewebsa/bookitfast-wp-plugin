<?php
/**
 * Availability Calendar block (#2).
 *
 * A month-grid showing booked vs. free nights for a SINGLE property, sourced
 * from the Book It Fast booking engine via the
 * `/property-availability-calendar` API (the same lean booked/available range
 * payload used by the availability block). Booked nights are struck through;
 * free nights are selectable. Server-side render (the API is called + cached in
 * PHP, the bearer token never reaches the client). Pure vanilla JS on the front
 * end — no React/build needed.
 *
 * Configurable: property, months shown, booked colour, available colour,
 * show legend.
 *
 * @package Bookitfast
 */

if (!defined('ABSPATH')) {
    exit;
}

function bookitfast_register_availability_calendar_block() {
    register_block_type('bookitfast/availability-calendar', array(
        'attributes' => array(
            'heading'        => array('type' => 'string',  'default' => ''),
            'propertyId'     => array('type' => 'number',  'default' => 0),
            'months'         => array('type' => 'number',  'default' => 2),
            'navigate'       => array('type' => 'boolean', 'default' => false),
            'loadMonths'     => array('type' => 'number',  'default' => 12),
            'bookedColor'    => array('type' => 'string',  'default' => ''),
            'availableColor' => array('type' => 'string',  'default' => ''),
            'fillAvailable'  => array('type' => 'boolean', 'default' => false),
            'showLegend'     => array('type' => 'boolean', 'default' => true),
            'align'          => array('type' => 'string',  'default' => ''),
        ),
        'render_callback' => 'bookitfast_render_availability_calendar_block',
    ));
}
add_action('init', 'bookitfast_register_availability_calendar_block');

/**
 * Fetch the property-availability-calendar payload for one property, cached.
 *
 * Returns the decoded array (property_name + booked/available ranges) or null.
 * The bearer token is used server-side only.
 */
function bookitfast_calendar_api_data($property_id, $months) {
    $property_id = (int) $property_id;
    if ($property_id <= 0) {
        return null;
    }
    $months    = max(1, min(24, (int) $months));
    $cache_key = 'bif_pac_' . $property_id . '_' . $months;

    $cached = get_transient($cache_key);
    if (is_array($cached)) {
        return $cached;
    }
    if ('neg' === $cached) {
        return null; // brief negative cache
    }

    $token   = function_exists('bookitfast_get_token') ? bookitfast_get_token() : '';
    $api_url = get_option('bookitfast_api_url');
    if (!$api_url) {
        return null;
    }
    $test_mode = defined('BOOKITFAST_TEST_MODE') ? BOOKITFAST_TEST_MODE : WP_DEBUG;

    $endpoint = add_query_arg(
        array('property_id' => $property_id, 'months' => $months),
        "$api_url/api/property-availability-calendar"
    );
    $response = wp_remote_get($endpoint, array(
        'timeout'   => 15,
        'headers'   => array('Authorization' => 'Bearer ' . $token),
        'sslverify' => !$test_mode,
    ));

    if (is_wp_error($response) || 200 !== (int) wp_remote_retrieve_response_code($response)) {
        set_transient($cache_key, 'neg', 5 * MINUTE_IN_SECONDS);
        return null;
    }
    $data = json_decode(wp_remote_retrieve_body($response), true);
    if (!is_array($data)) {
        set_transient($cache_key, 'neg', 5 * MINUTE_IN_SECONDS);
        return null;
    }
    set_transient($cache_key, $data, HOUR_IN_SECONDS);
    return $data;
}

/**
 * Expand an array of {start_date, end_date} ranges into a YYYY-MM-DD => true set.
 * end_date is treated as EXCLUSIVE (the check-out day stays free), matching the
 * booking engine's range payload.
 */
function bookitfast_calendar_expand_ranges($ranges) {
    $set = array();
    if (!is_array($ranges)) {
        return $set;
    }
    foreach ($ranges as $r) {
        if (!is_array($r)) {
            continue;
        }
        $start = isset($r['start_date']) ? $r['start_date'] : (isset($r['start']) ? $r['start'] : null);
        $end   = isset($r['end_date']) ? $r['end_date'] : (isset($r['end']) ? $r['end'] : null);
        if (!$start) {
            continue;
        }
        $cur  = strtotime($start);
        $last = $end ? (strtotime($end) - DAY_IN_SECONDS) : $cur; // DTEND-style exclusive.
        $guard = 0;
        while ($cur !== false && $cur <= $last && $guard < 800) {
            $set[gmdate('Y-m-d', $cur)] = true;
            $cur += DAY_IN_SECONDS;
            $guard++;
        }
    }
    return $set;
}

/**
 * Render a single month grid.
 */
function bookitfast_calendar_render_month($year, $month, $booked_set, $today_ts, $start_of_week) {
    $first         = strtotime(sprintf('%04d-%02d-01', $year, $month));
    $days_in_month = (int) gmdate('t', $first);
    $first_dow     = (int) gmdate('w', $first); // 0 = Sun.
    $lead          = ($first_dow - $start_of_week + 7) % 7;

    global $wp_locale;
    $dow = array();
    for ($d = 0; $d < 7; $d++) {
        $idx = ($start_of_week + $d) % 7;
        $dow[] = $wp_locale ? $wp_locale->get_weekday_initial($wp_locale->get_weekday($idx)) : substr(gmdate('D', strtotime("Sunday +$idx days")), 0, 1);
    }

    ob_start(); ?>
    <div class="bif-cal__month">
        <div class="bif-cal__month-label"><?php echo esc_html(date_i18n('F Y', $first)); ?></div>
        <div class="bif-cal__grid" role="grid">
            <?php foreach ($dow as $dn) : ?><span class="bif-cal__dow"><?php echo esc_html($dn); ?></span><?php endforeach; ?>
            <?php for ($b = 0; $b < $lead; $b++) : ?><span class="bif-cal__pad" aria-hidden="true"></span><?php endfor; ?>
            <?php for ($day = 1; $day <= $days_in_month; $day++) :
                $date      = sprintf('%04d-%02d-%02d', $year, $month, $day);
                $ts        = strtotime($date);
                $is_past   = $ts < $today_ts;
                $is_booked = isset($booked_set[$date]);
                $cls = 'bif-cal__day';
                if ($is_past) {
                    $cls .= ' is-past';
                } elseif ($is_booked) {
                    $cls .= ' is-booked';
                } else {
                    $cls .= ' is-free';
                }
                $disabled = ($is_past || $is_booked);
                ?>
                <button type="button" class="<?php echo esc_attr($cls); ?>" data-date="<?php echo esc_attr($date); ?>"<?php echo $disabled ? ' disabled aria-disabled="true"' : ''; ?>>
                    <span><?php echo esc_html($day); ?></span>
                </button>
            <?php endfor; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

function bookitfast_render_availability_calendar_block($attributes) {
    $heading     = isset($attributes['heading']) ? $attributes['heading'] : '';
    $property_id = isset($attributes['propertyId']) ? (int) $attributes['propertyId'] : 0;
    $months      = isset($attributes['months']) ? max(1, min(12, (int) $attributes['months'])) : 2;
    $navigate    = !empty($attributes['navigate']);
    $load_months = isset($attributes['loadMonths']) ? max(1, min(24, (int) $attributes['loadMonths'])) : 12;
    $booked_col  = (isset($attributes['bookedColor']) && $attributes['bookedColor']) ? sanitize_text_field($attributes['bookedColor']) : '';
    $free_col    = (isset($attributes['availableColor']) && $attributes['availableColor']) ? sanitize_text_field($attributes['availableColor']) : '';
    $fill_free   = !empty($attributes['fillAvailable']);
    $legend      = !isset($attributes['showLegend']) || $attributes['showLegend'];
    $align       = (isset($attributes['align']) && $attributes['align']) ? ' align' . sanitize_html_class($attributes['align']) : '';

    // When navigation is on, render the full browsable range and reveal `months`
    // per view; otherwise just render the `months` to display.
    $render_count = $navigate ? max($load_months, $months) : $months;
    $fetch_months = $navigate ? max($load_months, $months) : $months;

    $data       = $property_id ? bookitfast_calendar_api_data($property_id, $fetch_months) : null;
    $booked_set = ($data && isset($data['booked'])) ? bookitfast_calendar_expand_ranges($data['booked']) : array();

    $today_ts      = strtotime(current_time('Y-m-d'));
    $start_of_week = (int) get_option('start_of_week', 1);

    $classes = 'bif-cal' . $align;
    if ($navigate)  { $classes .= ' bif-cal--nav'; }
    if ($fill_free) { $classes .= ' bif-cal--fill-free'; }

    $vars = '';
    if ($booked_col) { $vars .= '--bif-cal-booked:' . $booked_col . ';'; }
    if ($free_col)   { $vars .= '--bif-cal-free:' . $free_col . ';'; }
    if ($navigate)   { $vars .= '--bif-cal-per-view:' . $months . ';'; }

    // Build the month grids once.
    ob_start();
    $cursor = strtotime(gmdate('Y-m-01', $today_ts));
    for ($i = 0; $i < $render_count; $i++) {
        // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- helper returns escaped markup.
        echo bookitfast_calendar_render_month((int) gmdate('Y', $cursor), (int) gmdate('n', $cursor), $booked_set, $today_ts, $start_of_week);
        $cursor = strtotime('+1 month', $cursor);
    }
    $months_html = ob_get_clean();

    ob_start(); ?>
    <div class="<?php echo esc_attr($classes); ?>" style="<?php echo esc_attr($vars); ?>">
        <?php if ($heading) : ?><h3 class="bif-cal__title"><?php echo esc_html($heading); ?></h3><?php endif; ?>
        <?php if (!$property_id) : ?>
            <p class="bif-cal__note"><?php echo esc_html__('Select a property in the block settings to show live availability.', 'bookitfast'); ?></p>
        <?php endif; ?>
        <?php if ($legend) : ?>
            <div class="bif-cal__legend">
                <span class="bif-cal__legend-item"><span class="bif-cal__swatch bif-cal__swatch--free"></span><?php echo esc_html__('Available', 'bookitfast'); ?></span>
                <span class="bif-cal__legend-item"><span class="bif-cal__swatch bif-cal__swatch--booked"></span><?php echo esc_html__('Booked', 'bookitfast'); ?></span>
            </div>
        <?php endif; ?>
        <?php if ($navigate) : ?>
            <div class="bif-cal__viewport">
                <button type="button" class="bif-cal__nav bif-cal__nav--prev" aria-label="<?php echo esc_attr__('Previous months', 'bookitfast'); ?>">&lsaquo;</button>
                <?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped month markup. ?>
                <div class="bif-cal__months"><?php echo $months_html; ?></div>
                <button type="button" class="bif-cal__nav bif-cal__nav--next" aria-label="<?php echo esc_attr__('Next months', 'bookitfast'); ?>">&rsaquo;</button>
            </div>
        <?php else : ?>
            <?php // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- escaped month markup. ?>
            <div class="bif-cal__months"><?php echo $months_html; ?></div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

function bookitfast_availability_calendar_assets() {
    $js  = BOOKITFAST_PATH . 'assets/availability-calendar.js';
    $css = BOOKITFAST_PATH . 'assets/availability-calendar.css';
    wp_enqueue_script('bookitfast-availability-calendar', BOOKITFAST_URL . 'assets/availability-calendar.js', array(), file_exists($js) ? filemtime($js) : '1.0.0', true);
    wp_enqueue_style('bookitfast-availability-calendar', BOOKITFAST_URL . 'assets/availability-calendar.css', array(), file_exists($css) ? filemtime($css) : '1.0.0');
}
add_action('wp_enqueue_scripts', 'bookitfast_availability_calendar_assets');

function bookitfast_availability_calendar_editor_assets() {
    $js = BOOKITFAST_PATH . 'assets/availability-calendar-editor.js';
    wp_enqueue_script(
        'bookitfast-availability-calendar-editor',
        BOOKITFAST_URL . 'assets/availability-calendar-editor.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-server-side-render', 'wp-api-fetch'),
        file_exists($js) ? filemtime($js) : '1.0.0',
        true
    );
    bookitfast_availability_calendar_assets();
}
add_action('enqueue_block_editor_assets', 'bookitfast_availability_calendar_editor_assets');
