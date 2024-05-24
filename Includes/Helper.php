<?php 

/**
 * ANALIZADOR Analizador Web Simple
 * Analizador
 *
 * @package       ANALIZADOR
 * @author        Villalba Juan Manuel Pedro
 * @license       gplv3
 * @version       1.0.1
 *
 * @package ANALIZADOR\Includes
 */
namespace ANALIZADOR\Includes;
 
if ( ! defined( 'ABSPATH' ) ) exit; 

class Analizador_Plugin_Helper {
    public static function get_phrase( $str ) {
        return __((string) $str); 
    }
}

class Helper extends Analizador_Plugin_Helper {
    public function get_button( $label, $type = 'primary' ) {
        return '<button class="btn btn-' . esc_attr( $type ) . '">' . esc_html( $label ) . '</button>';
    }

    public function create_website($token, $home_url) {
       $create_response = wp_remote_post('https://analizador.ar/api/v1/websites', array(
            'headers' => array(
                'Content-Type' => 'application/x-www-form-urlencoded',
                'Authorization' => 'Bearer ' . $token
            ),
            'body' => array(
                'url' => $home_url,
                'privacy' => 1, 
                'email' => 1, 
                'exclude_bots' => 1
            )
        ));

        if (is_wp_error($create_response)) {
            return new WP_Error('create_error', self::get_phrase( 'Error of create website.' ));
        } else {
            $message_success = 'Website ' . esc_html($home_url) . ' create success, please refresh page.';
            return self::get_phrase( $message_success );
        }
    }

    public function get_api_data($url, $token) {
        $response = wp_remote_get($url, array(
            'headers' => array(
                'Accept' => 'application/json',
                'Authorization' => 'Bearer ' . $token
            )
        ));

        if (is_wp_error($response)) {
            return new WP_Error('api_error', self::get_phrase('Error get data.'));
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('json_error', self::get_phrase('Error decode response JSON.'));
        }

        return $data;
    }
}


