<?php
/**
 * Availability Search block.
 *
 * A lightweight "find your stay" search form (check-in + check-out) that
 * redirects (GET) to a chosen booking page with `?start=DD-MM-YYYY&nights=N`.
 * The Book It Fast Multi-Embed booking form on that page reads those params and
 * pre-fills itself. Pure vanilla JS on the front end — no React/build needed.
 *
 * @package Bookitfast
 */

if (!defined('ABSPATH')) {
    exit;
}

function bookitfast_register_availability_search_block() {
    register_block_type('bookitfast/availability-search', array(
        'attributes' => array(
            'heading'       => array('type' => 'string', 'default' => 'Find your stay'),
            'targetUrl'     => array('type' => 'string', 'default' => ''),
            'buttonText'    => array('type' => 'string', 'default' => 'Search'),
            'checkinLabel'  => array('type' => 'string', 'default' => 'Check-in'),
            'checkoutLabel' => array('type' => 'string', 'default' => 'Check-out'),
            'pickerStyle'   => array('type' => 'string', 'default' => 'range'),
            'align'         => array('type' => 'string', 'default' => ''),
        ),
        'render_callback' => 'bookitfast_render_availability_search_block',
    ));
}
add_action('init', 'bookitfast_register_availability_search_block');

function bookitfast_render_availability_search_block($attributes) {
    $heading  = isset($attributes['heading']) ? $attributes['heading'] : '';
    $target   = isset($attributes['targetUrl']) ? trim($attributes['targetUrl']) : '';
    $btn      = isset($attributes['buttonText']) ? $attributes['buttonText'] : 'Search';
    $ci_label = isset($attributes['checkinLabel']) ? $attributes['checkinLabel'] : 'Check-in';
    $co_label = isset($attributes['checkoutLabel']) ? $attributes['checkoutLabel'] : 'Check-out';
    $align    = (isset($attributes['align']) && $attributes['align']) ? ' align' . sanitize_html_class($attributes['align']) : '';
    $today    = current_time('Y-m-d');
    $picker   = isset($attributes['pickerStyle']) ? $attributes['pickerStyle'] : 'range';
    if (! in_array($picker, array('fields', 'nights', 'range'), true)) {
        $picker = 'range';
    }

    ob_start(); ?>
    <form class="bif-search<?php echo esc_attr($align); ?>" method="get" action="<?php echo esc_url($target ? $target : '#'); ?>" data-target="<?php echo esc_url($target); ?>">
        <?php if ($heading) : ?><h3 class="bif-search__title"><?php echo esc_html($heading); ?></h3><?php endif; ?>
        <div class="bif-search__row">
            <?php if ('fields' === $picker) : ?>
                <label class="bif-search__field">
                    <span><?php echo esc_html($ci_label); ?></span>
                    <input type="date" class="bif-search__checkin" min="<?php echo esc_attr($today); ?>" required>
                </label>
                <label class="bif-search__field">
                    <span><?php echo esc_html($co_label); ?></span>
                    <input type="date" class="bif-search__checkout" min="<?php echo esc_attr($today); ?>" required>
                </label>
            <?php elseif ('nights' === $picker) : ?>
                <label class="bif-search__field">
                    <span><?php echo esc_html($ci_label); ?></span>
                    <input type="date" class="bif-search__checkin" min="<?php echo esc_attr($today); ?>" required>
                </label>
                <label class="bif-search__field">
                    <span><?php echo esc_html__('Nights', 'bookitfast'); ?></span>
                    <select class="bif-search__nights">
                        <?php for ($n = 1; $n <= 30; $n++) : ?>
                            <option value="<?php echo esc_attr($n); ?>"><?php echo esc_html($n . ' ' . _n('night', 'nights', $n, 'bookitfast')); ?></option>
                        <?php endfor; ?>
                    </select>
                </label>
            <?php else : ?>
                <div class="bif-search__field bif-search__daterange">
                    <input type="text" class="bif-search__range-input" placeholder="<?php echo esc_attr__('Select your dates', 'bookitfast'); ?>" readonly aria-haspopup="dialog">
                    <input type="hidden" class="bif-search__start">
                    <input type="hidden" class="bif-search__end">
                </div>
            <?php endif; ?>
            <button type="submit" class="bif-search__go"><?php echo esc_html($btn); ?></button>
        </div>
        <p class="bif-search__error" role="alert" hidden></p>
    </form>
    <?php
    return ob_get_clean();
}

function bookitfast_availability_search_assets() {
    $js  = BOOKITFAST_PATH . 'assets/availability-search.js';
    $css = BOOKITFAST_PATH . 'assets/availability-search.css';
    wp_enqueue_script('bookitfast-availability-search', BOOKITFAST_URL . 'assets/availability-search.js', array(), file_exists($js) ? filemtime($js) : '1.0.0', true);
    wp_enqueue_style('bookitfast-availability-search', BOOKITFAST_URL . 'assets/availability-search.css', array(), file_exists($css) ? filemtime($css) : '1.0.0');
}
add_action('wp_enqueue_scripts', 'bookitfast_availability_search_assets');

function bookitfast_availability_search_editor_assets() {
    $js = BOOKITFAST_PATH . 'assets/availability-search-editor.js';
    wp_enqueue_script(
        'bookitfast-availability-search-editor',
        BOOKITFAST_URL . 'assets/availability-search-editor.js',
        array('wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components', 'wp-i18n', 'wp-server-side-render'),
        file_exists($js) ? filemtime($js) : '1.0.0',
        true
    );
    bookitfast_availability_search_assets();
}
add_action('enqueue_block_editor_assets', 'bookitfast_availability_search_editor_assets');
