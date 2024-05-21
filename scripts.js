jQuery(document).ready(function($) {
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

    const chartOptions = {
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

    const ctx = document.getElementById('canvas').getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [
                {
                    label: 'Pageviews',
                    data: chartData.pageviewsData,
                    borderColor: 'rgba(255, 177, 160, 1)',
                    backgroundColor: 'rgba(255, 87, 51, 0.9)',
                    borderWidth: 1
                },
                {
                    label: 'Visitors',
                    data: chartData.visitorsData,
                    borderColor: 'rgba(0, 135, 218, 1)',
                    backgroundColor: 'rgba(82, 187, 252, 0.9)',
                    borderWidth: 1
                }
            ]
        },
        options: chartOptions
    });
};
    dataChart.chartService(7); 
});

