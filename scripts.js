jQuery(document).ready(function($) {
// Definición de los tipos de visualización de gráficos disponibles
// Definición de los tipos de visualización de gráficos disponibles
let chartTypes = ['line', 'bar', 'radar']; 
let currentChartTypeIndex = 0;

// Función para obtener el valor de una cookie
function getCookie(name) {
    let cookieName = name + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookieArray = decodedCookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return null;
}

// Función para establecer el valor de una cookie
function setCookie(name, value, days) {
    let expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    let cookieValue = name + "=" + value + ";expires=" + expirationDate.toUTCString() + ";path=/";
    document.cookie = cookieValue;
}

// Obtén el tipo de gráfico almacenado en la cookie
let storedChartType = getCookie('currentChartType');
// Si hay un tipo de gráfico almacenado, cárgalo
if (storedChartType) {
    // Busca el índice del tipo de gráfico almacenado
    let storedChartTypeIndex = chartTypes.indexOf(storedChartType);
    // Si se encuentra el tipo de gráfico almacenado, actualiza el índice actual
    if (storedChartTypeIndex !== -1) {
        currentChartTypeIndex = storedChartTypeIndex;
    }
}

// Función para cambiar el tipo de visualización del gráfico
function toggleChartType() {
    currentChartTypeIndex = (currentChartTypeIndex + 1) % chartTypes.length; 
    let newChartType = chartTypes[currentChartTypeIndex]; 
    
    // Almacena el nuevo tipo de gráfico en una cookie que expira en 365 días
    setCookie('currentChartType', newChartType, 365);

    if (window.myChart) {
        if (window.myChart.config.type === 'radar') {
            window.myChart.config.options.scales = null;
        }
        let chartData = window.myChart.config.data;
        let chartOptions = window.myChart.config.options;

        window.myChart.destroy();

        let ctx = document.getElementById('canvas').getContext('2d');
        window.myChart = new Chart(ctx, {
            type: newChartType,
            data: chartData,
            options: chartOptions
        });
    }
     if (window.myChart.config.type === 'radar') { window.document.location.reload(); }
}




function prepareChartData(data, period) {
    const labels = [];
    const pageviewsData = [];
    const visitorsData = [];
    let periodData = null;

    if (data[period] && data[period].pageviews && data[period].pageviews.data && data[period].visitors && data[period].visitors.data) {
        periodData = data[period];
        periodData.pageviews.data.sort((a, b) => new Date(a.value) - new Date(b.value));
        periodData.visitors.data.sort((a, b) => new Date(a.value) - new Date(b.value));

        for (const item of periodData.pageviews.data) {
            const date = new Date(item.value);
            const dayOfMonth = date.getDate();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthName = monthNames[date.getMonth()];
            labels.push(`${dayOfMonth}/${monthName}`);
            pageviewsData.push(parseInt(item.count));
        }

        for (const item of periodData.visitors.data) {
            visitorsData.push(parseInt(item.count));
        }
    } else {
        console.error(`Datos insuficientes para el periodo ${period}.`);
    }

    return { labels, pageviewsData, visitorsData };
}

dataChart.chartService = (days) => {
    let chartData = null;
    const chartDataFor7Days = prepareChartData(statsData, "7_days");
    const chartDataFor15Days = prepareChartData(statsData, "15_days");
    const chartDataFor30Days = prepareChartData(statsData, "30_days");
    
    
    if (days === 7) {
        chartData = chartDataFor7Days;
    } else if (days === 15) {
        chartData = chartDataFor15Days;
    } else if (days === 30) {
        chartData = chartDataFor30Days;
    } else {
        console.error("Número de días no válido."); 
        return;
    }


    

    const ctx = document.getElementById('canvas').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }

    if (storedChartType) {
    // Busca el índice del tipo de gráfico almacenado
    let storedChartTypeIndex = chartTypes.indexOf(storedChartType);
    // Si se encuentra el tipo de gráfico almacenado, actualiza el índice actual
    if (storedChartTypeIndex !== -1) {
        currentChartTypeIndex = storedChartTypeIndex;
    }
}

// Crea el gráfico utilizando el tipo de gráfico almacenado o el tipo predeterminado
let initialChartType = chartTypes[currentChartTypeIndex];



    // Configura opciones específicas para el gráfico de radar
if (initialChartType === 'radar') {
    window.chartOptions = {
        plugins: {
            title: {
                display: true,
                text: 'Pageviews and Visitors for the Last ' + days + ' Days'
            }
        },
        scales: {
        r: {
            grid: {
                circular: true
            }
        }
    }
    };
} else {
    window.chartOptions = {
        plugins: {
            title: {
                display: true,
                text: 'Pageviews and Visitors for the Last ' + days + ' Days'
            }
        },
        scales: {
            y: {
                stacked: false
            }
        }
    };
    
}

const chartOptions = window.chartOptions;



window.myChart = new Chart(ctx, {
    type: initialChartType,
    data: {
        labels: chartData.labels,
        datasets: [
            {
                label: 'Visitors',
                data: chartData.visitorsData,
                borderColor: 'rgba(0, 135, 218, 1)',
                backgroundColor: 'rgba(82, 187, 252, 0.9)',
                borderWidth: 1
            },
            {
                label: 'Pageviews',
                data: chartData.pageviewsData,
                borderColor: 'rgba(255, 177, 160, 1)',
                backgroundColor: 'rgba(255, 87, 51, 0.9)',
                borderWidth: 1
            }
        ]
    },
    options: chartOptions
});
};
    dataChart.chartService(7); 
    $('#changeChartTypeButton').on('click', function() {
        toggleChartType();
    });
});

