jQuery(document).ready(function($) {
let chartTypes = ['line', 'bar', 'radar']; 
let currentChartTypeIndex = 0;

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

function setCookie(name, value, days) {
    let expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + days);
    let cookieValue = name + "=" + value + ";expires=" + expirationDate.toUTCString() + ";path=/";
    document.cookie = cookieValue;
}

let storedChartType = getCookie('currentChartType');
if (storedChartType) {
    let storedChartTypeIndex = chartTypes.indexOf(storedChartType);
    if (storedChartTypeIndex !== -1) {
        currentChartTypeIndex = storedChartTypeIndex;
    }
}

function toggleChartType() {
    currentChartTypeIndex = (currentChartTypeIndex + 1) % chartTypes.length; 
    let newChartType = chartTypes[currentChartTypeIndex]; 
    
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
        periodData.pageviews.data.sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());
        periodData.visitors.data.sort((a, b) => new Date(a.value).getTime() - new Date(b.value).getTime());

        for (const item of periodData.pageviews.data) {
            const date = new Date(item.value);
            const dayOfMonth = date.getUTCDate();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const monthName = monthNames[date.getUTCMonth()];
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





dataChart.pageService = (days) => {
    const dataLast = {
        prepareLastData: function (data, period) {
            const pageData = this.preparePageStats(data); // Obtenemos las páginas para cada período

            // Verificamos si el período seleccionado existe en el objeto de datos
            if (!pageData.hasOwnProperty(period)) {
                console.error("El período seleccionado no es válido.");
                return null;
            }

            // Devolvemos la página correspondiente al período seleccionado
            return pageData[period].data;
        },


        preparePageStats: function(statsData) {
            const pageStats = {
                "7_days": statsData["7_days"].page,
                "15_days": statsData["15_days"].page,
                "30_days": statsData["30_days"].page
            };
            return pageStats;
        },
        pageService: function(days) {
            let lastData = null;
            const lastDataFor7Days = this.prepareLastData(statsData, "7_days");
            const lastDataFor15Days = this.prepareLastData(statsData, "15_days");
            const lastDataFor30Days = this.prepareLastData(statsData, "30_days");

            if (days === 7) {
                lastData = lastDataFor7Days;
            } else if (days === 15) {
                lastData = lastDataFor15Days;
            } else if (days === 30) {
                lastData = lastDataFor30Days;
            } else {
                console.error("Número de días no válido."); 
                return;
            }
            
            const container = document.getElementById('page-rating');
            container.innerHTML = ""; // Limpiar el contenido anterior
            
            lastData.forEach(function(item) {
                const row = document.createElement('tr'); // Crear una fila
                const pageCell = document.createElement('td'); // Crear una celda para la página
                const visitsCell = document.createElement('td'); // Crear una celda para las visitas

                pageCell.textContent = item.value.substring(0, 64); // Establecer el valor de la página
                visitsCell.textContent = item.count; // Establecer el valor de las visitas

                row.appendChild(pageCell); // Añadir la celda de página a la fila
                row.appendChild(visitsCell); // Añadir la celda de visitas a la fila

                container.appendChild(row); // Añadir la fila al contenedor de la tabla
            });
        }
    };
    
    if (days === 7) {
            dataLast.pageService(7);
        } else if (days === 15) {
            dataLast.pageService(15);
        } else if (days === 30) {
            dataLast.pageService(30);
        } else {
            console.error("Número de días no válido."); 
          return;
    }
};

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
    let storedChartTypeIndex = chartTypes.indexOf(storedChartType);
    if (storedChartTypeIndex !== -1) {
        currentChartTypeIndex = storedChartTypeIndex;
    }
}
let initialChartType = chartTypes[currentChartTypeIndex];
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
    dataChart.pageService(7)
    dataChart.chartService(7); 
    $('#changeChartTypeButton').on('click', function() {
        toggleChartType();
       
    });
});

