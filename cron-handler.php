<?php
/**
 * ANALIZADOR Analizador Web Simple
 *
 * @package ANALIZADOR\Cron
 */
if (!current_user_can('manage_options')) {
    wp_die(__('Permission denied.', 'analizador-store-visitor-data'));
}

if (false !== wp_next_scheduled('store_visitor_data_cron_job')) {
    $redirect_url = add_query_arg(array('page' => 'analizador-settings', 'message' => 'queued'), admin_url('options-general.php'));
    wp_redirect($redirect_url);
    exit;
}

$result = wp_schedule_single_event(time(), 'store_visitor_data_cron_job');
if ($result) {
    $redirect_url = add_query_arg(array('page' => 'analizador-settings', 'message' => 'success'), admin_url('options-general.php'));
    wp_redirect($redirect_url);
    exit;
} else {
    $redirect_url = add_query_arg(array('page' => 'analizador-settings', 'message' => 'error'), admin_url('options-general.php'));
    wp_redirect($redirect_url);
    exit;
}
