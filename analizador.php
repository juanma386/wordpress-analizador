<?php
/**
 * Analizador
 *
 * @package       ANALIZADOR
 * @author        Villalba Juan Manuel Pedro
 * @license       gplv2
 * @version       1.0.0
 *
 * @wordpress-plugin
 * Plugin Name:   Analizador
 * Plugin URI:    https://analizador.ar
 * Description:   Analizador Web Simple
 * Version:       1.0.0
 * Author:        Villalba Juan Manuel Pedro
 * Author URI:    https://hexome.cloud/
 * Text Domain:   analizador
 * Domain Path:   /languages
 * License:       GPLv2
 * License URI:   https://www.gnu.org/licenses/gpl-2.0.html
 *
 * You should have received a copy of the GNU General Public License
 * along with Analizador. If not, see <https://www.gnu.org/licenses/gpl-2.0.html/>.
 */

if ( ! defined( 'ABSPATH' ) ) exit;



add_action('wp_dashboard_setup', 'analizador_setup_widget_desktop');

function analizador_setup_widget_desktop() {
    wp_add_dashboard_widget(
        'analizador_setup_widget_desktop',
        'Escritorio Analizador', 
        'analizador_setup_widget' 
    );
}


add_action('admin_init', function(){
    $token = get_option('analizador_key_token', '');
    $website_id = get_option('analizador_website_id', '');
    if (is_admin() && $token && $website_id):
        add_action('admin_enqueue_scripts', function () {
                        wp_enqueue_script(
                            'chart',
                            'https://cdn.jsdelivr.net/npm/chart.js/dist/chart.umd.min.js',
                            array(),
                            null,
                            true
                        );
        });


        $pageviews_7_days = get_option('analizador_stats_7_days_pageviews', []);
        $visitors_7_days = get_option('analizador_stats_7_days_visitors', []);
        $pageviews_15_days = get_option('analizador_stats_15_days_pageviews', []);
        $visitors_15_days = get_option('analizador_stats_15_days_visitors', []);
        $pageviews_30_days = get_option('analizador_stats_30_days_pageviews', []);
        $visitors_30_days = get_option('analizador_stats_30_days_visitors', []);

        

        echo '<script>
            var statsData = {
                "7_days": {
                    "pageviews": ' . json_encode($pageviews_7_days) . ',
                    "visitors": ' . json_encode($visitors_7_days) . '
                },
                "15_days": {
                    "pageviews": ' . json_encode($pageviews_15_days) . ',
                    "visitors": ' . json_encode($visitors_15_days) . '
                },
                "30_days": {
                    "pageviews": ' . json_encode($pageviews_30_days) . ',
                    "visitors": ' . json_encode($visitors_30_days) . '
                }
            };
        </script>
        ';
    endif;
});


function analizador_setup_widget() {
    $token = get_option('analizador_key_token', '');
    $website_id = get_option('analizador_website_id', '');

    if ($website_id) {
        echo '<p>El Token esta activo y el identificador esta almacenado listo.</p>';
        echo '<div data-website-id="' . esc_attr($website_id) . '" id="analizador-website-id">
        <canvas id="canvas" width="640" height="480"></canvas>
        </div>';
        return;
    }

    if (!$token) {
        echo '<p>No se ha configurado el Analizador Key Token. Por favor, configúralo <a href="' . admin_url('options-general.php?page=analizador-settings') . '">aquí</a>.</p>';
        return;
    }

    $home_url = get_home_url();
    $parsed_url = parse_url($home_url);
    $site_url = $parsed_url['host'];

    $response = wp_remote_get('https://analizador.ar/api/v1/websites?search=' . urlencode($site_url), array(
        'headers' => array(
            'Accept' => 'application/json',
            'Authorization' => 'Bearer ' . $token
        )
    ));

    if (is_wp_error($response)) {
        echo '<p>Error al obtener los datos.</p>';
        return;
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    $site_exists = false;

    if (isset($data['data']) && is_array($data['data'])) {
        echo '<ul>';
        foreach ($data['data'] as $site) {
            echo '<li><a href="http://' . esc_html($site['url']) . '" target="_blank">' . esc_html($site['url']) . '</a></li>';
            if ($site['url'] === $site_url) {
                $site_exists = true;
                if ($site_exists) {
                    update_option('analizador_website_id', sanitize_text_field($site['id']));
                }
            }
        }
        echo '</ul>';
    } else {
        echo '<p>No se encontraron sitios web.</p>';
    }

    if (!$site_exists) {
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
            echo '<p>Error al crear el sitio web.</p>';
        } else {
            echo '<p>El sitio web ' . esc_html($site_url) . ' ha sido creado.</p>';
        }
    }
}

add_action('admin_menu', 'analizador_settings_page');

function analizador_settings_page() {
    add_options_page(
        'Configuración de Analizador',
        'Analizador Settings',
        'manage_options',
        'analizador-settings',
        'analizador_settings_page_html'
    );
}

function analizador_settings_page_html() {
    if (!current_user_can('manage_options')) {
        return;
    }

    if (isset($_POST['analizador_key_token'])) {
        update_option('analizador_key_token', sanitize_text_field($_POST['analizador_key_token']));
        echo '<div class="updated"><p>Token guardado con éxito.</p></div>';
    }

    $token = get_option('analizador_key_token', '');

    ?>
    <div class="wrap">
        <h1>Configuración del Analizador</h1>
        <form method="POST">
            <table class="form-table">
                <tr valign="top">
                    <th scope="row">Analizador Key Token</th>
                    <td><input type="text" name="analizador_key_token" value="<?php echo esc_attr($token); ?>" class="regular-text" /></td>
                </tr>
            </table>
            <?php submit_button('Guardar Token'); ?>
        </form>
    </div>
    <?php
}

add_action('admin_init', 'verificar_analizador_key_token');

function verificar_analizador_key_token() {
    if (is_admin() && !isset($_GET['page']) || $_GET['page'] !== 'analizador-settings') {
        $token = get_option('analizador_key_token', '');
        if (!$token) {
            wp_redirect(admin_url('options-general.php?page=analizador-settings'));
            exit;
        }
    }
}





function conditionally_add_script($plugin_slug) {

  
  $token = get_option('analizador_key_token', '');

if ($token) {
    add_action( 'wp_footer', function() {
        if ( !is_admin() ) {
        ?>
        <script data-host="https://analizador.ar" data-dnt="false" src="https://analizador.ar/js/script.js" id="ZwSg9rf6GA" async defer></script>
        <?php
      } 
    });
  }
}

add_action( 'init', 'conditionally_add_script' );

add_action( 'wp_loaded', 'schedule_store_visitor_data_cron' );

function schedule_store_visitor_data_cron() {
    if ( ! wp_next_scheduled( 'store_visitor_data_cron_job' ) ) {
        wp_schedule_event( time(), 'daily', 'store_visitor_data_cron_job' );
    }
}

add_action( 'store_visitor_data_cron_job', 'store_visitor_data' );

function store_visitor_data() {
    $token = get_option( 'analizador_key_token', '' );
    
    if ( ! $token ) {
        return;
    }

    $site_id = get_option( 'analizador_website_id', '' );

    if ( ! $site_id ) {
        return;
    }

    $periods = array(
        '7_days' => '-7 days',
        '15_days' => '-15 days',
        '30_days' => '-30 days',
    );

     $metrics = ['pageviews', 'visitors'];

    foreach ( $periods as $period => $interval ) {
        foreach ($metrics as $metric) {
            $from_date = date( 'Y-m-d', strtotime( $interval ) );
            $to_date = date( 'Y-m-d' );
            $last_update = get_option( "analizador_stats_{$period}_{$metric}_last_update", 0 );
            $update_limit = ( strpos( $period, 'days' ) !== false ) ? 3 : 24;

            if ( current_time( 'timestamp' ) - $last_update >= HOUR_IN_SECONDS / $update_limit ) {
             $stats = wp_remote_get("https://analizador.ar/api/v1/stats/{$site_id}?from={$from_date}&to={$to_date}&name={$metric}", [
                    'headers' => [
                        'Accept' => 'application/json',
                        'Authorization' => 'Bearer ' . $token
                    ]
            ]);

                if ( ! is_wp_error( $stats ) && $stats['response']['code'] === 200 ) {
                    $stats_body = wp_remote_retrieve_body( $stats );
                    $stats_data = json_decode( $stats_body, true );

                    update_option( "analizador_stats_{$period}_{$metric}", $stats_data );

                    update_option( "analizador_stats_{$period}_{$metric}_last_update", current_time( 'timestamp' ) );
                }
            }
        }
    }

}



add_action('admin_enqueue_scripts', 'agregar_estilos_y_scripts');

function agregar_estilos_y_scripts() {
    wp_enqueue_style('mi_widget_estilos', plugin_dir_url(__FILE__) . 'styles.css');
    wp_enqueue_script('mi_widget_scripts', plugin_dir_url(__FILE__) . 'scripts.js', array('jquery'), null, true);
}


?>
