// ===== 导入必要的库 =====
// ECharts 世界地图
const echartsScript = document.createElement('script');
echartsScript.src = 'https://cdn.jsdelivr.net/npm/echarts@5.4.3/dist/echarts.min.js';
document.head.appendChild(echartsScript);

// CountUp.js
const countUpScript = document.createElement('script');
countUpScript.src = 'https://cdn.jsdelivr.net/npm/countup.js@2.6.2/dist/countUp.min.js';
document.head.appendChild(countUpScript);

echartsScript.onload = () => {
  initDashboard();
};

function initDashboard() {
  // ========== 实时人口大数字显示替代线图 ==========// 1. 实时人口计数器
  let total = 8000000000;
  let births = 0;
  let deaths = 0;
  const birthRate = 18.5 / 1000;
  const deathRate = 7.5 / 1000;
  const yearlyGrowth = total * (birthRate - deathRate);
  const perSecondGrowth = yearlyGrowth / 365 / 24 / 3600;

  function updateLivePopulation() {
    total += perSecondGrowth;
    births += birthRate * total / (365 * 24 * 3600);
    deaths += deathRate * total / (365 * 24 * 3600);

    document.getElementById("totalPopulation").innerText = Math.floor(total).toLocaleString();
    document.getElementById("birthsToday").innerText = Math.floor(births).toLocaleString();
    document.getElementById("deathsToday").innerText = Math.floor(deaths).toLocaleString();
    document.getElementById("netGrowth").innerText = Math.floor(births - deaths).toLocaleString();
  }
  setInterval(updateLivePopulation, 1000);

  // 2. 世界人口历史图表
  const historyCtx = document.getElementById('historyChart').getContext('2d');
  fetch('/data/global.csv')
    .then(res => res.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').slice(1);
      const years = [];
      const populations = [];
      rows.forEach(row => {
        const [year, population] = row.split(',');
        years.push(year);
        populations.push(parseFloat(population));
      });

      new Chart(historyCtx, {
        type: 'line',
        data: {
          labels: years,
          datasets: [{
            label: 'World Population (Billion)',
            data: populations,  
            borderColor: '#ffd100',
            borderWidth: 2,
            fill: false,
            tension: 0.1
          }]
          
        },
        options: {
          responsive: true,
          scales: {
            x: { ticks: { color: '#ccc' } },
            y: {
              ticks: {
                color: '#ccc',
                callback: function(value) {
                  return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 });
                }
              }
            }
          },
          plugins: {
            legend: { labels: { color: '#fff' } },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const val = context.raw;
                  return `${context.dataset.label}: ${val.toFixed(2)} B`;
                }
              }
            }
          }
        }
        
      });
    });

  // 3. 饼图（按大陆）
  const pieCtx = document.getElementById('continentPieChart').getContext('2d');
  fetch('/data/continent.csv')
    .then(res => res.text())
    .then(csvText => {
      const rows = csvText.trim().split('\n').slice(1);
      const labels = [];
      const values = [];
      rows.forEach(row => {
        const [continent, population] = row.split(',');
        labels.push(continent);
        values.push(parseFloat(population));
      });

      new Chart(pieCtx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#ffd700', '#ffa500', '#ff8c00', '#ff4500', '#ff6347']
          }]
        },
        options: {
          plugins: {
            legend: { labels: { color: '#fff' } }
          }
        }
      });
    });

  // 4. 热力图（ECharts）
  const heatmap = echarts.init(document.getElementById('heatmap'));
  const mapOption = {
    tooltip: {
      trigger: 'item',
      formatter: function (params) {
        return `${params.name}<br/>Population: ${params.value?.toLocaleString() || 'N/A'}`;
      },
      backgroundColor: '#333',
      textStyle: { color: '#fff' }
    },
    visualMap: {
      min: 0,
      max: 1500000000,
      left: 'left',
      bottom: '5%',
      text: ['High', 'Low'],
      inRange: { color: ['#00ffff', '#58508d', '#bc5090', '#ff6361', '#ffa600'] },
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'map',
      map: 'world',
      roam: true,
      emphasis: { label: { show: false } },
      data: []
    }]
  };

  fetch('https://code.highcharts.com/mapdata/custom/world.geo.json')
    .then(res => res.json())
    .then(geoJson => {
      echarts.registerMap('world', geoJson);
      fetch('/data/country-by-population.json')
        .then(res => res.json())
        .then(data => {
          mapOption.series[0].data = data.map(item => ({
            name: item.country,
            value: item.population
          }));
          heatmap.setOption(mapOption);
        });
    });

  // 5. 模拟器图
  const simCtx = document.getElementById('simulatorChart').getContext('2d');
  let simChart = new Chart(simCtx, {
    type: 'line',
    data: { labels: [], datasets: [{ label: 'Simulated Pop (B)', data: [], borderColor: '#ffd100' }] },
    options: {
      scales: { x: { ticks: { color: '#ccc' } }, y: { ticks: { color: '#ccc' } } },
      plugins: { legend: { labels: { color: '#fff' } } }
    }
  });

  function updateSimulation() {
    const birth = parseFloat(document.getElementById("birthRate").value);
    const death = parseFloat(document.getElementById("deathRate").value);
    let pop = parseFloat(document.getElementById("basePop").value);
    const years = 50;
    const data = [];
    for (let i = 0; i < years; i++) {
      const newBorn = pop * birth / 1000;
      const dead = pop * death / 1000;
      pop += (newBorn - dead);
      data.push(pop.toFixed(2));
    }
    simChart.data.labels = Array.from({ length: years }, (_, i) => 2025 + i);
    simChart.data.datasets[0].data = data;
    simChart.update();
  }

  document.getElementById("birthRate").addEventListener("input", updateSimulation);
  document.getElementById("deathRate").addEventListener("input", updateSimulation);
  document.getElementById("basePop").addEventListener("input", updateSimulation);
  updateSimulation();

  // 6. 全屏按钮
  document.getElementById("fullscreenBtn").addEventListener("click", () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  });
}