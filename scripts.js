jQuery(document).ready(function($) {
    console.log('Mi Widget de Escritorio está activo.');
 function prepareChartData(data) {
    const labels = [];
    const pageviewsData = [];
    const visitorsData = [];
    const last7Days = data["7_days"];

    last7Days.pageviews.data.sort((a, b) => new Date(a.value) - new Date(b.value));
    last7Days.visitors.data.sort((a, b) => new Date(a.value) - new Date(b.value));
    for (const item of last7Days.pageviews.data) {
        const date = new Date(item.value);
        const dayOfMonth = date.getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const monthName = monthNames[date.getMonth()];
        labels.push(`${dayOfMonth}/${monthName}`);
        pageviewsData.push(parseInt(item.count));
    }

    for (const item of last7Days.visitors.data) {
        visitorsData.push(parseInt(item.count));
    }

    return { labels, pageviewsData, visitorsData };
}

const chartData = prepareChartData(statsData);

const chartOptions = {
    plugins: {
        title: {
            display: true,
            text: 'Pageviews and Visitors for the Last 7 Days'
        }
    },
    scales: {
        y: {
            stacked: false
        }
    }
};

const ctx = document.getElementById('canvas').getContext('2d');

const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: chartData.labels,
        datasets: [{
            label: 'Pageviews',
            data: chartData.pageviewsData,
            borderColor: 'rgba(255, 177, 160, 1)',
            backgroundColor: 'rgba(255, 87, 51, 0.9)',
            borderWidth: 1
        }, {
            label: 'Visitors',
            data: chartData.visitorsData,
            borderColor: 'rgba(0, 135, 218, 1)',
            backgroundColor: 'rgba(82, 187, 252, 0.9)',
            borderWidth: 1
        }]
    },
    options: chartOptions
});
         
});

