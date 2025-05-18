// Глобальные переменные
let currentBreakdownLabel = null; 
let mainChart;
let stockChart;

// Объекты данных - теперь на английском
const mainData = {
  labels: ['House', 'Car', 'Stocks', 'Crypto', 'Bank Deposit', 'Cash'], 
  datasets: [{ 
    data: [0,0,0,0,0,0], 
    backgroundColor: ['#a259ff','#f1c40f','#3498db','#2ecc71','#95a5a6', '#fd7e14'], 
    borderWidth: 0 
  }]
};

// breakdownDataMap будет ЗАПОЛНЯТЬСЯ из Excel или иметь дефолтные значения, если Excel не загружен
// Дефолтные значения тоже теперь на английском, если они используются до загрузки
let breakdownDataMap = {
  'House': { 
    data: [
      { name: 'Palo Alto Townhouse', value: 320000, notes: '2105 Townhouse Ln, Palo Alto, CA 94303. Good entry to market.'},
      { name: 'Detroit Loft', value: 180000, notes: 'Unit 3D, The Assembly, Detroit, MI. Cash flow positive.'}
    ],
    colors: ['#a259ff', '#95a5a6'], total: '$0' // Total будет пересчитан
  },
  'Car': { 
    data: [
      { name: 'Toyota Camry', value: 20000, notes: '2021. Good condition.'}, 
      { name: 'BMW X5', value: 18000, notes: '2018. Moderate demand.'}, 
      { name: 'Old Chevrolet Impala', value: 2500, notes: '2004. For sale.'}
    ],
    colors: ['#f39c12', '#2980b9', '#e74c3c'], total: '$0'
  },
  'Stocks': { 
    data: [
      { name: 'Apple Inc.', value: 50000, notes: 'AAPL - Strong ecosystem.'}, 
      { name: 'Microsoft Corp.', value: 45000, notes: 'MSFT - Azure & AI dominant.'}, 
      { name: 'Nvidia Corp.', value: 40000, notes: 'NVDA - AI leader.'},
      { name: 'Amazon.com Inc.', value: 30000, notes: 'AMZN - AWS strong.'}, 
      { name: 'Alphabet Inc. (Google)', value: 25000, notes: 'GOOGL - Search leader.'}, 
      { name: 'Nikola Corp', value: 2000, notes: 'NKLA - High risk EV.'} 
    ],
    colors: ['#e74c3c', '#e67e22', '#17a2b8', '#3498db', '#2ecc71', '#a259ff'], 
    total: '$0'
  },
  'Crypto': { 
    data: [ 
      { name: 'Bitcoin', value: 75000, notes: 'BTC - Market leader.'}, 
      { name: 'Ethereum', value: 50000, notes: 'ETH - Strong ecosystem.' },
      { name: 'Solana', value: 15000, notes: 'SOL - Fast L1, volatile.' },
      { name: 'Chainlink', value: 10000, notes: 'LINK - Oracle network.' }
    ], 
    liveAdvice: [ 
        { name: 'Bitcoin', currentPrice: '$65,123', change: '+1.52%', trend: 'Uptrend 📈. Monitor volume.'}, 
        { name: 'Ethereum', currentPrice: '$3,450', change: '+0.88%', trend: 'Stable sideways. Watch for breakout.'}
    ], 
    colors: ['#f39c12', '#8e44ad', '#20c997', '#6610f2'], 
    total: '$0' 
  },
  'Bank Deposit': { 
    data: [ 
      { name: 'Ally Bank Savings', value: 120000, notes: 'Ally Bank - 4.20% APY' }, 
      { name: 'Marcus CD', value: 80000, notes: 'Marcus by Goldman Sachs - 5.00% APY (1-year)' } 
    ],
    colors: ['#16a085', '#27ae60'], total: '$0'
  },
  'Cash': { 
    data: [
      { name: 'USD Wallet & Checking', value: 40000, notes: 'Emergency fund & liquidity'},
      { name: 'EUR Savings (Wise)', value: 19500, notes: 'For travel and diversification'}
    ],
    colors: ['#fd7e14', '#ffc107'],
    total: '$0'
  }
};

initializeChartData(); 

function initializeChartData() {
  if (typeof mainData === 'undefined' || typeof breakdownDataMap === 'undefined') { return; }
  
  mainData.labels.forEach((label, index) => {
    const category = breakdownDataMap[label];
    if (category && category.data) {
      const categorySum = category.data.reduce((sum, item) => sum + (item.value || 0) , 0);
      category.total = '$' + categorySum.toLocaleString();
      if (!mainData.datasets[0]) mainData.datasets[0] = { data: new Array(mainData.labels.length).fill(0) };
      if (mainData.datasets[0].data.length !== mainData.labels.length) {
          mainData.datasets[0].data = new Array(mainData.labels.length).fill(0);
      }
      mainData.datasets[0].data[index] = categorySum;
    } else if (mainData.datasets[0] && mainData.datasets[0].data) {
      mainData.datasets[0].data[index] = 0;
      if (!breakdownDataMap[label]) {
        const bgColorIndex = mainData.labels.indexOf(label);
        const defaultColor = (mainData.datasets[0].backgroundColor && mainData.datasets[0].backgroundColor[bgColorIndex]) ? mainData.datasets[0].backgroundColor[bgColorIndex] : '#cccccc';
        breakdownDataMap[label] = { data: [], colors: [defaultColor], total: '$0' };
      } else {
        breakdownDataMap[label].total = '$0';
      }
    }
  });
  updateTotalAssets(); 
}

function updateCategoryBreakdown() {
  const legendList = document.getElementById('legendList');
  if (!legendList) return;
  legendList.innerHTML = ''; 
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
    if (category && category.data) { 
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

function getSimulatedAiInsight(category, item) {
    const assetName = item.name || "Unnamed Asset";
    const value = item.value || 0;
    let notes = item.notes || ""; // Используем заметки из item

    let shortSummary = `${assetName}: $${value.toLocaleString()}`;
    let detailedSummary = `Asset: ${assetName}, Current Value: $${value.toLocaleString()}. `;
    let aiAction = "Monitor market conditions.";
    let specificDetails = {}; // Для хранения извлеченных деталей

    const positiveSentiments = ["shows strong potential.", "is on an upward trend.", "has favorable market conditions.", "is a solid holding."];
    const neutralSentiments = ["is currently stable.", "shows mixed signals.", "requires careful monitoring.", "is a hold for now."];
    const negativeSentiments = ["faces some headwinds.", "is in a slight downturn.", "carries notable risk.", "should be reviewed for potential sale."];
    const newsSnippets = [ "Recent sector analysis suggests growth.", "Market volatility might impact this asset.", "New regulations could affect its value.", "Competitor actions are creating pressure.", "Positive economic indicators are beneficial." ];
    const randomNews = newsSnippets[Math.floor(Math.random() * newsSnippets.length)];

    if (category === "Stocks") {
        const tickerMatch = notes.match(/\b([A-Z]{2,5})\b/i);
        if (tickerMatch) specificDetails.symbol = tickerMatch[0].toUpperCase();
        shortSummary = `${assetName} (${specificDetails.symbol || 'N/A'}): `;
        const sentimentRoll = Math.random();
        if (assetName.toLowerCase().includes("mullen") || assetName.toLowerCase().includes("nikola")) {
            shortSummary += "High Risk 📉";
            detailedSummary += `${randomNews} ${negativeSentiments[Math.floor(Math.random() * negativeSentiments.length)]}`;
            aiAction = "SELL. Highly speculative with poor outlook.";
        } else if (sentimentRoll < 0.6) { 
            shortSummary += "Positive Outlook 📈";
            detailedSummary += `${randomNews} ${positiveSentiments[Math.floor(Math.random() * positiveSentiments.length)]}`;
            aiAction = "HOLD or consider BUYING on dips.";
        } else { 
            shortSummary += "Stable/Monitor 📊";
            detailedSummary += `${randomNews} ${neutralSentiments[Math.floor(Math.random() * neutralSentiments.length)]}`;
            aiAction = "HOLD and monitor closely.";
        }
        detailedSummary += ` AI Action: ${aiAction}`;
    } else if (category === "Crypto") {
        const tickerMatch = notes.match(/\b([A-Z]{2,5})\b/i);
        if (tickerMatch) specificDetails.symbol = tickerMatch[0].toUpperCase();
        shortSummary = `${assetName} (${specificDetails.symbol || 'N/A'}): Volatile ⚡`;
        detailedSummary += `${randomNews} Cryptocurrencies are inherently volatile. ${neutralSentiments[Math.floor(Math.random() * neutralSentiments.length)]}`;
        aiAction = "HOLD with caution. Long-term potential but high risk.";
        detailedSummary += ` AI Action: ${aiAction}`;
    } else if (category === "House") {
        shortSummary = `${assetName}: Real Estate 🏡`;
        if (notes) specificDetails.address = notes; // Предполагаем, что все заметки - это адрес
        detailedSummary += `Location: ${specificDetails.address || 'N/A'}. ${randomNews} Real estate in this area ${positiveSentiments[Math.floor(Math.random() * positiveSentiments.length)]}`;
        aiAction = assetName.toLowerCase().includes("rental") || (notes && notes.toLowerCase().includes("rent")) ? "Monitor rental market and consider rent adjustments." : "HOLD for long-term appreciation.";
        detailedSummary += ` AI Action: ${aiAction}`;
    } else if (category === "Car") {
        const yearMatch = notes.match(/\b(19\d{2}|20\d{2})\b/);
        if (yearMatch) specificDetails.year = yearMatch[0];
        shortSummary = `${assetName} (${specificDetails.year || 'N/A'}): Depreciation asset 🚗`;
        detailedSummary += `Year: ${specificDetails.year || 'N/A'}. ${randomNews} Vehicles typically depreciate. `;
        aiAction = (specificDetails.year && parseInt(specificDetails.year) < 2010) ? "Consider selling if maintenance is high." : "Maintain well to preserve value.";
        detailedSummary += ` AI Action: ${aiAction}`;
    } else if (category === "Bank Deposit") {
        const rateMatch = notes.match(/(\d+(\.\d+)?%\s*(APY)?)/i);
        if (rateMatch) specificDetails.rate = rateMatch[0].toUpperCase();
        // Простое извлечение имени банка из начала названия актива
        const bankNameMatch = assetName.match(/^([a-zA-Z\s]+Bank|[A-Z\s]+Credit Union)/i);
        if(bankNameMatch) specificDetails.bankName = bankNameMatch[0].trim(); else specificDetails.bankName = "Undisclosed Bank";

        shortSummary = `${assetName} (${specificDetails.bankName || 'N/A'}): ${specificDetails.rate || 'N/A'} 💰`;
        detailedSummary += `Deposit at ${specificDetails.bankName} with rate ${specificDetails.rate || 'N/A'}. ${randomNews} `;
        aiAction = (specificDetails.rate && parseFloat(specificDetails.rate) < 2.0) ? "Seek higher yield savings options." : "Stable, low-return asset.";
        detailedSummary += ` AI Action: ${aiAction}`;
    } else if (category === "Cash") {
        const currencyMatch = notes.match(/\b(USD|EUR|GBP)\b/i);
        if(currencyMatch) specificDetails.currency = currencyMatch[0].toUpperCase();
        shortSummary = `${assetName} (${specificDetails.currency || 'N/A'}): Liquidity 💵`;
        detailedSummary += `Cash holding. ${randomNews} Good for emergencies but loses value to inflation.`;
        aiAction = "Maintain for liquidity, consider investing excess.";
        detailedSummary += ` AI Action: ${aiAction}`;
    } else {
        detailedSummary += notes ? ` Notes: ${notes}. ${randomNews}` : randomNews;
    }
    
    // Добавляем извлеченные детали к объекту item, чтобы они были доступны в updateAiAssistant
    Object.assign(item, specificDetails);

    return { shortSummary, detailedSummary };
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
        // Генерируем shortSummary и detailedSummary на лету для каждого item
        const insight = getSimulatedAiInsight(categoryLabel, item); 

        htmlContent += `
          <div class="ai-item">
            <p class="ai-short-summary"><strong>${item.name}:</strong> ${insight.shortSummary} 
              <button class="show-details-btn" data-category="${categoryLabel}" data-index="${index}">Details</button>
            </p>
            <div class="ai-detailed-summary" id="details-${categoryLabel.replace(/\s+/g, '-')}-${index}" style="display:none;">
              <p>${insight.detailedSummary}</p>`;
        // Можно добавить вывод item.symbol, item.address и т.д. если они были извлечены и сохранены в item
        if (item.symbol) htmlContent += `<p><em>Ticker/Symbol:</em> ${item.symbol}</p>`;
        if (item.address) htmlContent += `<p><em>Address:</em> ${item.address}</p>`;
        if (item.year && categoryLabel === 'Car') htmlContent += `<p><em>Year:</em> ${item.year}</p>`;
        if (item.bankName && categoryLabel === 'Bank Deposit') htmlContent += `<p><em>Bank:</em> ${item.bankName} (${item.rate || 'N/A'})</p>`;
        htmlContent += `</div></div>`;
      });
      if (categoryLabel === 'Crypto' && category.liveAdvice) {
        htmlContent += `<h4>Live Crypto Prices:</h4>`;
        category.liveAdvice.forEach(advice => { htmlContent += `<p><strong>${advice.name}:</strong> ${advice.currentPrice} (${advice.change}) – ${advice.trend}</p>`; });
      }
    } else { htmlContent += `<p>No specific breakdown data available for ${categoryLabel}.</p>`; }
  }
  aiDynamicDiv.innerHTML = htmlContent;
  aiDynamicDiv.querySelectorAll('.show-details-btn').forEach(btn => {
    btn.onclick = (e) => {
      const cat = e.target.dataset.category; const itemIdx = e.target.dataset.index;
      const detailsDiv = document.getElementById(`details-${cat.replace(/\s+/g, '-')}-${itemIdx}`);
      if (detailsDiv) { const isVisible = detailsDiv.style.display === 'block'; detailsDiv.style.display = isVisible ? 'none' : 'block'; e.target.textContent = isVisible ? 'Details' : 'Hide'; }
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
      <span class="legend-item-text">${item.name} – $${(item.value || 0).toLocaleString()}</span>
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
            const sum = category.data.reduce((s, current) => s + (current.value || 0), 0);
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
            const sum = category.data.reduce((s, current) => s + (current.value || 0), 0);
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

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) { return; }
    const fileName = file.name.toLowerCase();
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) { 
        parseExcelFile(file);
    } else if (file.type.startsWith('image/')) {
        alert("OCR processing for images is a separate feature and not connected to this upload button yet.");
    } else {
        alert("Unsupported file type. Please upload an Excel (.xlsx, .xls, .csv) file.");
    }
    event.target.value = '';
}

function parseExcelFile(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {type: 'array'});
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {header:1}); 
            processExcelData(jsonData);
        } catch (error) { console.error("Error processing Excel file:", error); alert("Error processing Excel file.");}
    };
    reader.onerror = function(ex) { console.error("FileReader error:", ex); alert("Error reading file.");};
    reader.readAsArrayBuffer(file);
}

function processExcelData(excelData) {
    if (!excelData || excelData.length < 2) { alert("Excel file is empty or has an invalid format."); return; }

    const headers = excelData[0].map(h => h ? h.toString().trim().toLowerCase() : '');
    const categoryIndex = headers.indexOf('category');
    const assetNameIndex = headers.indexOf('asset name');
    const valueIndex = headers.indexOf('value');
    const notesIndex = headers.indexOf('notes (optional - for extra details like ticker, address, bank, year, etc.)');

    if (categoryIndex === -1 || assetNameIndex === -1 || valueIndex === -1) {
        alert("Required columns (Category, Asset Name, Value) not found in Excel. Please use the template.");
        return;
    }

    const newTempBreakdownData = {};
    const newMainDataLabelsSet = new Set(); 

    for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i];
        if (!row || row.length === 0 || !row[categoryIndex]) continue; 

        let category = row[categoryIndex].toString().trim();
        const originalMainDataLabels = ['House', 'Car', 'Stocks', 'Crypto', 'Bank Deposit', 'Cash'];
        const matchedLabel = originalMainDataLabels.find(lbl => lbl.toLowerCase() === category.toLowerCase());
        if (matchedLabel) { category = matchedLabel; } 
        else { category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(); }

        const assetName = row[assetNameIndex] ? row[assetNameIndex].toString().trim() : `Asset ${i}`;
        const assetValue = parseFloat(row[valueIndex]);
        const notes = notesIndex !== -1 && row[notesIndex] ? row[notesIndex].toString().trim() : '';
        
        if (isNaN(assetValue)) { console.warn(`Skipping row ${i+1} due to invalid value`); continue; }
        newMainDataLabelsSet.add(category); 

        if (!newTempBreakdownData[category]) {
            const existingMainDataCatIndex = mainData.labels.indexOf(category);
            let colorForNewCategory = (existingMainDataCatIndex !== -1 && mainData.datasets[0].backgroundColor[existingMainDataCatIndex]) ?
                                     mainData.datasets[0].backgroundColor[existingMainDataCatIndex] :
                                     '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
            newTempBreakdownData[category] = { data: [], colors: [colorForNewCategory], total: '' };
        }

        const assetObject = { name: assetName, value: assetValue, notes: notes };
        
        // Заполняем объект assetObject извлеченными данными для использования в getSimulatedAiInsight
        if (notes) {
            if (category === "Stocks" || category === "Crypto") {
                const tickerMatch = notes.match(/\b([A-Z]{2,5})\b/i); 
                if (tickerMatch) assetObject.symbol = tickerMatch[0].toUpperCase();
            } else if (category === "House") {
                assetObject.address = notes; 
            } else if (category === "Car") {
                const yearMatch = notes.match(/\b(19\d{2}|20\d{2})\b/);
                if (yearMatch) assetObject.year = yearMatch[0];
                // Пытаемся извлечь модель, если она не часть основного имени актива
                if (assetName.toLowerCase().includes(notes.toLowerCase())) { 
                    // Если assetName уже содержит заметку (например, "Toyota Camry 2021")
                    // то модель, вероятно, часть assetName.
                    // Эта логика может быть сложной и зависит от формата assetName.
                } else {
                    // Если заметки - это чисто модель
                     // assetObject.model = notes; // Это было бы слишком просто, но для примера
                }

            } else if (category === "Bank Deposit") {
                const rateMatch = notes.match(/(\d+(\.\d+)?%\s*(APY)?)/i);
                if (rateMatch) assetObject.rate = rateMatch[0];
                const bankNameMatch = notes.match(/^([a-zA-Z\s]+Bank|[A-Z\s]+Credit Union|[a-zA-Z\s]+Financial)/i);
                if(bankNameMatch) assetObject.bankName = bankNameMatch[0].trim();
            } else if (category === "Cash") {
                 const currencyMatch = notes.match(/\b(USD|EUR|GBP)\b/i);
                 if(currencyMatch) assetObject.currency = currencyMatch[0].toUpperCase();
            }
        }
        
        newTempBreakdownData[category].data.push(assetObject);
        if (newTempBreakdownData[category].colors.length < newTempBreakdownData[category].data.length) {
             newTempBreakdownData[category].colors.push('#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0'));
        }
    }
    
    mainData.labels = Array.from(newMainDataLabelsSet);
    const originalColors = ['#a259ff','#f1c40f','#3498db','#2ecc71','#95a5a6', '#fd7e14']; 
    mainData.datasets[0].backgroundColor = mainData.labels.map((label) => {
        const originalMainDataIndex = ['House', 'Car', 'Stocks', 'Crypto', 'Bank Deposit', 'Cash'].indexOf(label);
        if(originalMainDataIndex !== -1 && originalColors[originalMainDataIndex]){
            return originalColors[originalMainDataIndex];
        }
        return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    });
    mainData.datasets[0].data = new Array(mainData.labels.length).fill(0);

    breakdownDataMap = newTempBreakdownData; 

    initializeChartData(); 
    updateCategoryBreakdown(); 

    if (mainChart) {
        mainChart.data.labels = mainData.labels;
        mainChart.data.datasets[0].data = mainData.datasets[0].data;
        mainChart.data.datasets[0].backgroundColor = mainData.datasets[0].backgroundColor;
        mainChart.update();
    }

    const firstUploadedCategory = Object.keys(breakdownDataMap)[0];
    if (firstUploadedCategory) {
        showBreakdown(firstUploadedCategory);
    } else {
        if(document.getElementById('breakdownCard')) document.getElementById('breakdownCard').classList.remove('visible');
        updateAiAssistant(null);
    }
    alert("Assets successfully updated from Excel file!");
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded: Script starting.");
    if (typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined') {
        document.body.innerHTML = "<p style='color:red;'>Error: Chart.js library failed to load.</p>"; return;
    }

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

    const fileUploadInput = document.getElementById('uploadFile');
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', handleFileUpload);
    } else {
        console.warn("File upload input (#uploadFile) not found.");
    }

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
    
    const initialCategory = Object.keys(breakdownDataMap).length > 0 && breakdownDataMap['Stocks'] ? 'Stocks' : (Object.keys(breakdownDataMap).length > 0 ? Object.keys(breakdownDataMap)[0] : null);
    if (initialCategory && breakdownDataMap[initialCategory]) {
        showBreakdown(initialCategory); 
    } else {
       console.warn(`No initial category to display in breakdown or breakdownDataMap is empty.`);
    }
    console.log("DOMContentLoaded: Script finished.");
});