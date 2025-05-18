// Глобальные переменные
let currentBreakdownLabel = null; 
let mainChart;
let stockChart;

// Объекты данных
const mainData = {
  labels: ['House', 'Car', 'Stocks', 'Crypto', 'Bank Deposit', 'Cash'], 
  datasets: [{ 
    data: [0,0,0,0,0,0], 
    backgroundColor: ['#a259ff','#f1c40f','#3498db','#2ecc71','#95a5a6', '#fd7e14'], 
    borderWidth: 0 
  }]
};

const breakdownDataMap = {
  'House': { // ~500,000
    data: [
      { name: 'Primary Home – Palo Alto (Townhouse)', value: 320000, address: '2105 Townhouse Ln, Palo Alto, CA 94303', shortSummary: 'Palo Alto Townhouse: Good entry. 🏠', detailedSummary: 'A modest townhouse located at 2105 Townhouse Ln, Palo Alto, CA 94303. Provides an entry into the desirable Palo Alto market. Area benefits from excellent schools and proximity to tech companies. Potential for steady value increase.' },
      { name: 'Rental Condo – Detroit (Downtown Loft)', value: 180000, address: 'Loft 3D, The Assembly, Detroit, MI 48226', shortSummary: 'Detroit Loft Rental: Cash flow positive. 🏙️', detailedSummary: 'Rental loft in Detroit\'s revitalizing downtown. Affordable investment with good rental yields ($1,500/month). Property taxes are notable, but overall cash-flow positive. Monitor local economic trends.'}
    ],
    colors: ['#a259ff', '#95a5a6'], total: ''
  },
  'Car': { // ~40,500
    data: [ 
      { name: 'Toyota Camry (2021)', value: 20000, model: 'Camry', year: 2021, shortSummary: 'Toyota Camry (2021): High demand. 🚗 Price: $19k-$21.5k.', detailedSummary: 'Model: Camry, Year: 2021. Market estimate: $19,000 - $21,500. Known for reliability and resale value.'}, 
      { name: 'BMW X5 (2018)', value: 18000, model: 'X5', year: 2018, shortSummary: 'BMW X5 (2018): Moderate demand. Price: $17k-$20k.', detailedSummary: 'Model: X5, Year: 2018. Market estimate: $17,000 - $20,000. Moderate demand for luxury SUVs.'}, 
      { name: 'Chevrolet Impala (2004)', value: 2500, model: 'Impala', year: 2004, shortSummary: 'Chevrolet Impala (2004): Low liquidity. SELL. 📉', detailedSummary: 'Model: Impala, Year: 2004. Value: $1,500 - $3,000. Low liquidity, high mileage expected. Recommend selling.'}
    ],
    colors: ['#f39c12', '#2980b9', '#e74c3c'], total: ''
  },
  'Stocks': { // ~150,000 -> increased to ~200,000
    data: [
      { name: 'Apple (AAPL)', value: 50000, symbol: 'AAPL', shortSummary: 'AAPL: Strong ecosystem. HOLD. 🍏', detailedSummary: 'Apple reported strong iPhone sales. Vision Pro reviews mixed. AI Action: Hold. Watch Vision Pro adoption & services.' }, 
      { name: 'Microsoft (MSFT)', value: 45000, symbol: 'MSFT', shortSummary: 'MSFT: Azure & AI dominant. BUY. ☁️', detailedSummary: 'Azure growth impressive. AI (Copilot) focus. Activision integrated. AI Action: Buy on dips.' }, 
      { name: 'Nvidia (NVDA)', value: 40000, symbol: 'NVDA', shortSummary: 'NVDA: AI leader, high growth. HOLD/BUY. 🚀', detailedSummary: 'Nvidia is a dominant force in AI chips and GPUs. Strong growth in data center and gaming segments. Valuation is high, reflecting growth expectations. AI Action: Hold for long-term growth, consider buying on significant dips if you believe in continued AI expansion.' },
      { name: 'Amazon (AMZN)', value: 30000, symbol: 'AMZN', shortSummary: 'AMZN: AWS strong, e-comm steady. HOLD. 📦', detailedSummary: 'AWS profit driver. E-commerce steady. Ads growing. AI Action: Hold. Monitor margins & AWS growth.' }, 
      { name: 'Google (GOOGL)', value: 25000, symbol: 'GOOGL', shortSummary: 'GOOGL: Search leader, AI advancing. HOLD. 🔍', detailedSummary: 'Search dominant. GCP gaining share. AI (Gemini) priority. AI Action: Hold. Watch competition.' }, 
      { name: 'Mullen Automotive (MULN)', value: 10000, symbol: 'MULN', shortSummary: 'MULN: Highly speculative. High risk. SELL. 📉', detailedSummary: 'Mullen Automotive (MULN): EV company with financial challenges and stock volatility. AI Action: SELL. High-risk, speculative. Reallocate capital.' } 
    ],
    colors: ['#e74c3c', '#e67e22', '#17a2b8', '#3498db', '#2ecc71', '#a259ff'], 
    total: ''
  },
  'Crypto': { // ~100,000 -> increased to ~150,000
    data: [ 
      { name: 'Bitcoin (BTC)', value: 75000, symbol: 'BTC', shortSummary: 'BTC: Market leader, post-halving potential. HOLD. 📈', detailedSummary: 'Bitcoin leading cryptocurrency. Halving event typically bullish. Regulatory clarity evolving. AI Action: Hold. Monitor. Consider DCA for long term.'}, 
      { name: 'Ethereum (ETH)', value: 50000, symbol: 'ETH', shortSummary: 'ETH: Strong ecosystem, L2 growth. HOLD. 🔗', detailedSummary: 'Ethereum "Merge" successful. L2 solutions scaling network. Strong DeFi/NFT ecosystem. AI Action: Hold. Watch L2 adoption and staking.' },
      { name: 'Solana (SOL)', value: 15000, symbol: 'SOL', shortSummary: 'SOL: Fast L1, ecosystem active. VOLATILE. ⚡', detailedSummary: 'Solana: High transaction speed, growing ecosystem. Past outages a concern. Highly volatile. AI Action: Speculative HOLD. Small allocation.' },
      { name: 'Chainlink (LINK)', value: 10000, symbol: 'LINK', shortSummary: 'LINK: Oracle network, key infra. HOLD. ⛓️', detailedSummary: 'Chainlink provides decentralized oracle services, crucial for connecting smart contracts with real-world data. Wide adoption. AI Action: Hold. Key infrastructure play in Web3.' }
    ], 
    liveAdvice: [ 
        { name: 'Bitcoin', currentPrice: '$65,123', change: '+1.52%', trend: 'Uptrend 📈. Monitor volume.'}, 
        { name: 'Ethereum', currentPrice: '$3,450', change: '+0.88%', trend: 'Stable  sideways. Watch for breakout.'}
    ], 
    colors: ['#f39c12', '#8e44ad', '#20c997', '#6610f2'], 
    total: '' 
  },
  'Bank Deposit': { // ~150,000 -> increased to ~200,000
    data: [ 
      { name: 'High-Yield Savings (Ally Bank)', value: 120000, bankName: 'Ally Bank', currentRate: '4.20% APY', shortSummary: 'Ally Savings (4.20%): Good for liquid cash. 💰', detailedSummary: 'Held at Ally Bank. Current rate of 4.20% APY is competitive for liquid funds. FDIC insured.' }, 
      { name: 'CD (Marcus by Goldman Sachs)', value: 80000, bankName: 'Marcus by Goldman Sachs', currentRate: '5.00% APY (1-year CD)', shortSummary: 'Marcus CD (5.00%): Strong fixed rate. 🔒', detailedSummary: '1-year CD at Marcus, offering 5.00% APY. Good for locking in rate for funds not needed immediately.' } 
    ],
    colors: ['#16a085', '#27ae60'], total: ''
  },
  'Cash': { // ~59,500 -> Total around ~1,100,000
    data: [
      { name: 'USD Physical & Checking', value: 40000, currency: 'USD', shortSummary: 'USD Cash: Liquidity/emergencies. 💵', detailedSummary: 'Physical USD and checking account balance for immediate liquidity and emergency preparedness. Does not earn significant interest.'},
      { name: 'EUR Savings (Wise Account)', value: 19500, currency: 'EUR', shortSummary: 'EUR Cash (Wise): Travel/diversification. 💶', detailedSummary: 'Euros in Wise multi-currency account for travel and currency diversification. Check for interest offered on EUR balances.'}
    ],
    colors: ['#fd7e14', '#ffc107'],
    total: ''
  }
};

initializeChartData(); 

function initializeChartData() {
  if (typeof mainData === 'undefined' || typeof breakdownDataMap === 'undefined') { return; }
  Object.keys(breakdownDataMap).forEach(categoryKey => {
    const category = breakdownDataMap[categoryKey];
    if (!category || !category.data) { console.warn(`Category or data missing for key: ${categoryKey}`); return; }
    const categorySum = category.data.reduce((sum, item) => sum + item.value, 0);
    category.total = '$' + categorySum.toLocaleString();
    const mainDataIndex = mainData.labels.indexOf(categoryKey);
    if (mainDataIndex !== -1) {
      if (!mainData.datasets[0]) mainData.datasets[0] = { data: new Array(mainData.labels.length).fill(0) };
      if (mainData.datasets[0].data.length < mainData.labels.length) {
          mainData.datasets[0].data = new Array(mainData.labels.length).fill(0);
      }
      mainData.datasets[0].data[mainDataIndex] = categorySum;
    }
  });
  updateTotalAssets(); 
}

function updateCategoryBreakdown() {
  const legendList = document.getElementById('legendList');
  if (!legendList) return;
  
  legendList.innerHTML = ''; // Очищаем и перестраиваем легенду каждый раз
  mainData.labels.forEach((label, i) => {
      const value = (mainData.datasets && mainData.datasets[0] && mainData.datasets[0].data && typeof mainData.datasets[0].data[i] !== 'undefined') ? mainData.datasets[0].data[i] : 0;
      const colorHex = (mainData.datasets && mainData.datasets[0] && mainData.datasets[0].backgroundColor && mainData.datasets[0].backgroundColor[i]) ? mainData.datasets[0].backgroundColor[i] : '#ccc';
      const li = document.createElement('li');
      li.innerHTML = `<span class="dot" style="background-color:${colorHex}"></span>${label} – $${value.toLocaleString()}`;
      legendList.appendChild(li);
  });
}

function updateTotalAssets() {
  let total = 0;
  Object.keys(breakdownDataMap).forEach(categoryKey => {
    const category = breakdownDataMap[categoryKey];
    if (category && category.data) { // Добавлена проверка
        total += category.data.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
    }
  });
  const formatted = '$' + total.toLocaleString();
  const totalStrongElement = document.querySelector('.total strong');
  const mainTotalDivElement = document.getElementById('mainTotal');
  if (totalStrongElement) totalStrongElement.innerText = formatted;
  if (mainTotalDivElement) mainTotalDivElement.innerText = formatted;
}

function createPercentageDoughnut(ctx, labels, dataValues, colors, chartWidth, chartHeight, onClickHandler = null) {
  if (typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined' || !ctx) { return null; }
  if (!ctx.canvas) { return null;}
  
  ctx.canvas.width = chartWidth; ctx.canvas.height = chartHeight;
  ctx.canvas.style.width = `${chartWidth}px`; ctx.canvas.style.height = `${chartHeight}px`;
  try {
    return new Chart(ctx, {
      type: 'doughnut',
      data: { labels: labels, datasets: [{ data: dataValues, backgroundColor: colors, borderWidth: 0 }] },
      options: { onClick: onClickHandler, responsive: false, maintainAspectRatio: false, plugins: { legend: { display: false }, datalabels: { color: '#fff', font: { weight: 'bold' }, formatter: (v, c) => { const ds = c.chart.data.datasets[0]; if (!ds || !ds.data) return "ERR%"; const t = ds.data.reduce((s, val) => s + (Number(val) || 0), 0); return t === 0 ? '0%' : (v / t * 100).toFixed(0) + '%'; }}}},
      plugins: [ChartDataLabels]
    });
  } catch (e) { console.error("Chart creation error:", e); return null; }
}

let editPopupOverlayGlobal, editNameInputGlobal, editValueInputGlobal, editPopupSaveBtnGlobal, editPopupCancelBtnGlobal;
let deleteConfirmPopupOverlayGlobal, deleteConfirmMessageGlobal, confirmDeleteActualBtnGlobal, cancelDeleteConfirmBtnGlobal;
let currentEditSaveCallback = null; 
let currentDeleteConfirmCallback = null;

function openCustomEditPopup(itemName, itemValue, onSaveCallback) {
    if (!editPopupOverlayGlobal) { console.error("Edit popup overlay not found by JS variable (editPopupOverlayGlobal)."); return; }
    if (!editNameInputGlobal || !editValueInputGlobal) { console.error("Edit popup input elements not found by JS variables."); return; }
    editNameInputGlobal.value = itemName;
    editValueInputGlobal.value = itemValue;
    currentEditSaveCallback = onSaveCallback;
    editPopupOverlayGlobal.style.display = "flex";
}

function openDeleteConfirmPopup(itemName, onDeleteConfirm) {
    if (!deleteConfirmPopupOverlayGlobal) { console.error("Delete confirm popup overlay not found by JS variable."); return; }
    if (!deleteConfirmMessageGlobal) { console.error("Delete confirm message element not found by JS variable."); return; }
    deleteConfirmMessageGlobal.textContent = `Are you sure you want to delete "${itemName}"? This action cannot be undone.`;
    currentDeleteConfirmCallback = onDeleteConfirm;
    deleteConfirmPopupOverlayGlobal.style.display = "flex";
}

function updateAiAssistant(categoryLabel) {
  const aiDynamicDiv = document.getElementById('aiDynamicRecommendations');
  const aiGeneralAdviceP = document.getElementById('aiGeneralAdvice');
  if (!aiDynamicDiv || !aiGeneralAdviceP) { return; }

  let htmlContent = '';
  if (!categoryLabel) {
    aiGeneralAdviceP.style.display = 'block';
    htmlContent = `<p>Select a category from the main chart to see specific AI recommendations.</p>`;
  } else {
    aiGeneralAdviceP.style.display = 'none';
    htmlContent = `<h3>AI Insights for ${categoryLabel}</h3>`;
    const category = breakdownDataMap[categoryLabel];
    if (category && category.data) {
      category.data.forEach((item, index) => {
        htmlContent += `
          <div class="ai-item">
            <p class="ai-short-summary"><strong>${item.name}:</strong> ${item.shortSummary || 'N/A'} 
              <button class="show-details-btn" data-category="${categoryLabel}" data-index="${index}">Details</button>
            </p>
            <div class="ai-detailed-summary" id="details-${categoryLabel.replace(/\s+/g, '-')}-${index}" style="display:none;">
              <p>${item.detailedSummary || 'No detailed information available.'}</p>
            </div>
          </div>`;
      });
      if (categoryLabel === 'Crypto' && category.liveAdvice) {
        htmlContent += `<h4>Live Crypto Prices:</h4>`;
        category.liveAdvice.forEach(advice => { htmlContent += `<p><strong>${advice.name}:</strong> ${advice.currentPrice} (${advice.change}) – ${advice.trend}</p>`; });
      }
    } else { htmlContent += `<p>No specific advice available for ${categoryLabel}.</p>`; }
  }
  aiDynamicDiv.innerHTML = htmlContent;

  aiDynamicDiv.querySelectorAll('.show-details-btn').forEach(btn => {
    btn.onclick = (e) => {
      const cat = e.target.dataset.category;
      const itemIdx = e.target.dataset.index;
      const detailsDiv = document.getElementById(`details-${cat.replace(/\s+/g, '-')}-${itemIdx}`);
      if (detailsDiv) {
        const isVisible = detailsDiv.style.display === 'block';
        detailsDiv.style.display = isVisible ? 'none' : 'block';
        e.target.textContent = isVisible ? 'Details' : 'Hide';
      }
    };
  });
}

function showBreakdown(label) {
  currentBreakdownLabel = label; 
  const categoryDetails = breakdownDataMap[label];
  const breakdownCardEl = document.getElementById('breakdownCard');
  const stockTotalEl = document.getElementById('stockTotal');
  const stockChartCanvasEl = document.getElementById('stockChart');
  const legendContainer = breakdownCardEl ? breakdownCardEl.querySelector('ul.legend > ul.legend') : null;

  if (!categoryDetails || !categoryDetails.data) { if (breakdownCardEl) breakdownCardEl.classList.remove('visible'); updateAiAssistant(null); return; }
  if (!stockChartCanvasEl) { updateAiAssistant(null); return; }
  const stockChartCtx = stockChartCanvasEl.getContext('2d');
  if (!stockChartCtx) { updateAiAssistant(null); return; }

  if (stockChart) { try { stockChart.destroy(); } catch (e) {} }
  
  const itemValues = categoryDetails.data.map(item => item.value);
  const itemNames = categoryDetails.data.map(item => item.name);
  stockChart = createPercentageDoughnut(stockChartCtx, itemNames, itemValues, categoryDetails.colors, 320, 320); 
  
  if (!stockChart) { if (breakdownCardEl) breakdownCardEl.classList.remove('visible'); updateAiAssistant(label); return; }
  if (stockTotalEl) stockTotalEl.innerText = categoryDetails.total;
  if (!legendContainer) { updateAiAssistant(label); return; }
  legendContainer.innerHTML = ''; 

  categoryDetails.data.forEach((item, i) => {
    const color = categoryDetails.colors[i % categoryDetails.colors.length];
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="dot" style="background-color:${color}"></span>
      <span class="legend-item-text">${item.name} – $${item.value.toLocaleString()}</span>
      <img class="edit-btn" data-index="${i}" title="Edit" width="20" height="20" style="cursor:pointer;margin-left:auto;" src="icon_edit_dark_final.png">
      <img class="delete-btn" data-index="${i}" title="Delete" width="20" height="20" style="cursor:pointer;margin-left:6px;" src="icon_delete_dark_final.png">`;
    legendContainer.appendChild(li);
  });

  legendContainer.querySelectorAll('.edit-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      if (!currentBreakdownLabel || !breakdownDataMap[currentBreakdownLabel] || !breakdownDataMap[currentBreakdownLabel].data) { return; }
      const itemToEdit = breakdownDataMap[currentBreakdownLabel].data[idx];
      if (itemToEdit) {
        openCustomEditPopup(itemToEdit.name, itemToEdit.value, (newName, newValueFloat) => { 
            itemToEdit.name = newName; itemToEdit.value = newValueFloat; 
            const category = breakdownDataMap[currentBreakdownLabel];
            const sum = category.data.reduce((s, current) => s + current.value, 0);
            category.total = '$' + sum.toLocaleString();
            const mainIdx = mainData.labels.indexOf(currentBreakdownLabel);
            if(mainIdx !== -1) mainData.datasets[0].data[mainIdx] = sum;
            if(mainChart) mainChart.update();
            updateTotalAssets(); updateCategoryBreakdown(); showBreakdown(currentBreakdownLabel);
          });
      }
    };
  });

  legendContainer.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => {
      const idx = parseInt(btn.dataset.index);
      if (!currentBreakdownLabel || !breakdownDataMap[currentBreakdownLabel] || !breakdownDataMap[currentBreakdownLabel].data) { return; }
      const category = breakdownDataMap[currentBreakdownLabel];
      const itemToDelete = category.data[idx];
      if (itemToDelete) {
        openDeleteConfirmPopup(itemToDelete.name, () => { 
            category.data.splice(idx, 1); 
            const sum = category.data.reduce((s, current) => s + current.value, 0);
            category.total = '$' + sum.toLocaleString();
            const mainIdx = mainData.labels.indexOf(currentBreakdownLabel);
            if(mainIdx !== -1) mainData.datasets[0].data[mainIdx] = sum;
            if(mainChart) mainChart.update();
            updateTotalAssets(); updateCategoryBreakdown(); showBreakdown(currentBreakdownLabel);
        });
      }
    };
  });

  if (breakdownCardEl) breakdownCardEl.classList.add('visible');
  updateAiAssistant(label); 
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: Script starting.");
    if (typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined') {
        document.body.innerHTML = "<p style='color:red;'>Error: Chart.js library failed to load.</p>"; return;
    }

    // Инициализация попапа редактирования
    editPopupOverlayGlobal = document.getElementById("editPopupOverlay"); 
    if (editPopupOverlayGlobal) {
        editNameInputGlobal = editPopupOverlayGlobal.querySelector("#editName"); 
        editValueInputGlobal = editPopupOverlayGlobal.querySelector("#editValue");
        editPopupSaveBtnGlobal = editPopupOverlayGlobal.querySelector("#saveEditBtn"); 
        editPopupCancelBtnGlobal = editPopupOverlayGlobal.querySelector("#cancelEditBtn"); 
        
        if (editPopupSaveBtnGlobal && editPopupCancelBtnGlobal && editNameInputGlobal && editValueInputGlobal) {
            editPopupSaveBtnGlobal.addEventListener("click", () => {
                const name = editNameInputGlobal.value.trim();
                const val = parseFloat(editValueInputGlobal.value.replace(/,/g, ''));
                if (name && !isNaN(val) && currentEditSaveCallback) currentEditSaveCallback(name, val);
                editPopupOverlayGlobal.style.display = "none"; currentEditSaveCallback = null;
            });
            editPopupCancelBtnGlobal.addEventListener("click", () => {
                editPopupOverlayGlobal.style.display = "none"; currentEditSaveCallback = null;
            });
            console.log("Edit popup listeners attached."); 
        } else { console.warn("Some Edit popup controls missing inside #editPopupOverlay."); }
    } else { console.warn("Edit popup overlay missing (#editPopupOverlay)."); }

    // Инициализация попапа подтверждения удаления
    deleteConfirmPopupOverlayGlobal = document.getElementById("deleteConfirmPopupOverlay");
    if (deleteConfirmPopupOverlayGlobal) {
        deleteConfirmMessageGlobal = deleteConfirmPopupOverlayGlobal.querySelector("#deleteConfirmMessage");
        confirmDeleteActualBtnGlobal = deleteConfirmPopupOverlayGlobal.querySelector("#confirmDeleteBtn"); 
        cancelDeleteConfirmBtnGlobal = deleteConfirmPopupOverlayGlobal.querySelector("#cancelDeleteBtn");  
        
        if (confirmDeleteActualBtnGlobal && cancelDeleteConfirmBtnGlobal && deleteConfirmMessageGlobal) {
            confirmDeleteActualBtnGlobal.addEventListener("click", () => {
                if (currentDeleteConfirmCallback) currentDeleteConfirmCallback();
                deleteConfirmPopupOverlayGlobal.style.display = "none";
                currentDeleteConfirmCallback = null;
            });
            cancelDeleteConfirmBtnGlobal.addEventListener("click", () => {
                deleteConfirmPopupOverlayGlobal.style.display = "none";
                currentDeleteConfirmCallback = null;
            });
            console.log("Delete confirm popup listeners attached.");
        } else { console.warn("Some Delete confirm popup controls missing inside #deleteConfirmPopupOverlay."); }
    } else { console.warn("Delete confirm popup overlay missing (#deleteConfirmPopupOverlay)."); }


    const mainChartCanvas = document.getElementById('mainChart');
    if (!mainChartCanvas) { console.error("FATAL: Main chart canvas element (#mainChart) not found!"); return;}
    const mainChartCtx = mainChartCanvas.getContext('2d');
    if (!mainChartCtx) { console.error("FATAL: Failed to get 2D context for main chart canvas!"); return;}
    
    const mainChartClickHandler = (e, elements) => { 
        if (elements && elements.length > 0 && elements[0]) {
            const clickedIndex = elements[0].index;
            if (mainData && mainData.labels && typeof mainData.labels[clickedIndex] !== 'undefined') {
                showBreakdown(mainData.labels[clickedIndex]); 
            }
        }
    };
    
    if (mainData && mainData.datasets && mainData.datasets.length > 0 && mainData.datasets[0] && mainData.datasets[0].data && (mainData.datasets[0].data.some(d => d !== 0) || mainData.datasets[0].data.length === mainData.labels.length) ) {
        mainChart = createPercentageDoughnut(
          mainChartCtx, mainData.labels, mainData.datasets[0].data, 
          mainData.datasets[0].backgroundColor, 320, 320, 
          mainChartClickHandler 
        );
        if (!mainChart) console.error("FATAL: Main chart could not be created.");
        else console.log("DOMContentLoaded: Main chart instance created.");
    } else { 
        console.error("FATAL: Main chart data is missing or empty for initialization.");
        const mainChartContainer = mainChartCanvas.parentElement;
        if(mainChartContainer) mainChartContainer.innerHTML = "<p style='color:red;'>Error: Main chart data setup failed.</p>";
    }

    updateCategoryBreakdown(); 
    updateAiAssistant(null); 
    
    const initialCategory = 'Stocks'; 
    if (breakdownDataMap && breakdownDataMap[initialCategory]) {
        showBreakdown(initialCategory); 
    } else {
        const firstKey = breakdownDataMap ? Object.keys(breakdownDataMap)[0] : null;
        if (firstKey) { showBreakdown(firstKey); }
    }
    console.log("DOMContentLoaded: Script finished.");
});