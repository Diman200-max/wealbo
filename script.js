
const mainChartCtx = document.getElementById('mainChart').getContext('2d');
const stockChartCtx = document.getElementById('stockChart').getContext('2d');
const breakdownCard = document.getElementById('breakdownCard');
const stockTotal = document.getElementById('stockTotal');
const legendList = breakdownCard.querySelector('.legend');

const mainData = {
  labels: ['House', 'Car', 'Stocks', 'Crypto', 'Bank Deposit'],
  datasets: [{
    data: [97740, 48870, 65160, 32580, 48870],
    backgroundColor: ['#a259ff', '#f1c40f', '#3498db', '#2ecc71', '#95a5a6'],
    borderWidth: 0
  }]
};

const breakdownDataMap = {
  'House': {
    data: [60000, 37740],
    labels: ['Primary Home (Palo Alto)', 'Rental Property'],
    colors: ['#a259ff', '#95a5a6'],
    total: '$97,740'
  },
  'Car': {
    data: [20000, 18000, 10870],
    labels: ['Toyota Corolla', 'BMW i8 (low liquidity)', 'Tesla Model 3'],
    colors: ['#f39c12', '#2980b9', '#e74c3c'],
    total: '$48,870'
  },
  'Stocks': {
    data: [16660, 10630, 9448, 8722, 7493, 10207],
    labels: ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta', 'Other'],
    colors: ['#e74c3c', '#e67e22', '#3498db', '#2ecc71', '#95a5a6', '#a259ff'],
    total: '$65,160'
  },
  'Crypto': {
    data: [25000, 7580],
    labels: ['Bitcoin', 'Ethereum'],
    colors: ['#f39c12', '#8e44ad'],
    total: '$32,580'
  },
  'Bank Deposit': {
    data: [20000, 28870],
    labels: ['Savings', 'Fixed Deposit'],
    colors: ['#16a085', '#27ae60'],
    total: '$48,870'
  }
};

function createPercentageDoughnut(ctx, labels, data, colors, onClickHandler = null) {
  return new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      onClick: onClickHandler,
      plugins: {
        datalabels: {
          color: '#fff',
          font: { weight: 'bold' },
          formatter: (value, context) => {
            const total = context.chart.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
            const percentage = (value / total * 100).toFixed(0);
            return percentage + '%';
          }
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

let mainChart = createPercentageDoughnut(
  mainChartCtx,
  mainData.labels,
  mainData.datasets[0].data,
  mainData.datasets[0].backgroundColor,
  (e, elements) => {
    if (elements.length > 0) {
      const index = elements[0].index;
      const label = mainData.labels[index];
      showBreakdown(label);
    updateAIContent(label);
    }
  }
);

let stockChart;

function showBreakdown(label) {
  const breakdown = breakdownDataMap[label];
  if (!breakdown) return;

  if (stockChart) stockChart.destroy();

  stockChart = createPercentageDoughnut(
    stockChartCtx,
    breakdown.labels,
    breakdown.data,
    breakdown.colors
  );

  stockTotal.innerText = breakdown.total;

  legendList.innerHTML = '';
  breakdown.labels.forEach((name, i) => {
    const color = breakdown.colors[i];
    const value = breakdown.data[i].toLocaleString();
    const li = document.createElement('li');
    li.innerHTML = `<span class="dot" style="background-color:${color}"></span>${name} – $${value}`;
    legendList.appendChild(li);
  });

  breakdownCard.classList.add('visible');
}


const aiCard = document.getElementById('aiCard');

function updateAIContent(label) {
  const aiContent = {
    'House': `
      <h2>AI Assistant</h2>
      <p><strong>House (Silicon Valley, Palo Alto):</strong> Property prices in this area are increasing steadily. 
      It is advisable to hold the asset, consider refinancing your mortgage, and potentially rent it out for steady passive income.</p>
    `,
    'Car': `
      <h2>AI Assistant</h2>
      <p><strong>Car Assets:</strong> Consider reviewing the liquidity of your car investments. 
      For example, Toyota and Tesla maintain strong resale value, while some luxury models like BMW i8 may face depreciation due to limited market demand.</p>
    `,
    'Stocks': `
      <h2>AI Assistant</h2>
      <p><strong>Stock Portfolio:</strong> Stay informed about market trends. Apple, Microsoft, and Google continue to show solid performance, 
      but monitor volatility in tech stocks. Diversification is key.</p>
    `,
    'Crypto': `
      <h2>AI Assistant</h2>
      <p><strong>Crypto (Bitcoin & Ethereum):</strong> Bitcoin shows long-term potential, though short-term trends may be volatile. 
      Consider dollar-cost averaging (DCA) and monitor regulatory news. Ethereum remains central to DeFi and NFTs, but faces network cost concerns.</p>
      <h3>Live Crypto Advice</h3>
      <p><strong>Bitcoin:</strong> $103,492 (−0.72%) – Downtrend 📉. Monitor closely.</p>
      <p><strong>Ethereum:</strong> $2,598.24 (−3.63%) – Weak ⚠️. Avoid buying now.</p>
    `,
    'Bank Deposit': `
      <h2>AI Assistant</h2>
      <p><strong>Bank Deposits:</strong> Ensure your savings are allocated across safe and insured accounts. 
      Consider optimizing returns by using high-yield savings or short-term CDs depending on liquidity needs.</p>
    `
  };

  aiCard.innerHTML = aiContent[label] || '<h2>AI Assistant</h2><p>No advice available.</p>';
}
