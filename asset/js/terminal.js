/* ==================== */
/* TERMINAL MODAL       */
/* ==================== */

function openTerminalModal() {
  const modal = document.getElementById('terminalModal');
  const content = modal ? modal.querySelector('.modal-content') : null;
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.opacity = '0';
    if (content) content.style.transform = 'scale(0.9) translateY(20px)';
    document.body.style.overflow = 'hidden';
    initTerminalWidgets();
    requestAnimationFrame(() => {
      modal.style.transition = 'opacity 0.3s ease';
      if (content) content.style.transition = 'transform 0.3s ease';
      modal.style.opacity = '1';
      if (content) content.style.transform = 'scale(1) translateY(0)';
    });
  }
}

function closeTerminalModal() {
  const modal = document.getElementById('terminalModal');
  const content = modal ? modal.querySelector('.modal-content') : null;
  if (modal) {
    modal.style.opacity = '0';
    if (content) content.style.transform = 'scale(0.95) translateY(20px)';
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
      modal.style.opacity = '';
      if (content) content.style.transform = '';
      modal.style.transition = '';
      if (content) content.style.transition = '';
    }, 300);
  }
}

// Tutup modal saat klik di luar konten
document.addEventListener('click', function(e) {
  const modal = document.getElementById('terminalModal');
  if (modal && e.target === modal) {
    closeTerminalModal();
  }
});

// Tutup modal dengan tombol ESC
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeTerminalModal();
  }
});

/* ==================== */
/* TERMINAL WIDGETS     */
/* ==================== */

let tvWidget = null;
let widgetsInitialized = false;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector('script[src="' + src + '"]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function initTerminalWidgets() {
  if (widgetsInitialized) return;
  widgetsInitialized = true;

  // Load TradingView script
  await loadScript('https://s3.tradingview.com/tv.js');

  // TradingView Chart
  loadTradingViewChart('PEPPERSTONE:XAUUSD', '240');

  // Economic Calendar
  loadEconomicCalendar();
}

function loadTradingViewChart(symbol, interval) {
  const container = document.getElementById('tradingview_chart');
  if (!container) return;
  container.innerHTML = '';

  tvWidget = new TradingView.widget({
    autosize: true,
    symbol: symbol,
    interval: interval,
    timezone: "Etc/UTC",
    theme: "dark",
    style: "1",
    locale: "en",
    toolbar_bg: "#1C1C1E",
    enable_publishing: false,
    hide_side_toolbar: false,
    allow_symbol_change: true,
    hidevolume: true,
    container_id: "tradingview_chart",
    studies: [
      { id: "MAExp@tv-basicstudies", inputs: { length: 50 }, overrides: { "plot.color": "#0000FF", "plot.linewidth": 2 } },
      { id: "MAExp@tv-basicstudies", inputs: { length: 200 }, overrides: { "plot.color": "#FF0000", "plot.linewidth": 2 } }
    ],
    overrides: {
      "mainSeriesProperties.volumeStyle.visibility": false,
      "volumePaneSize": "tiny"
    },
    withdateranges: true,
    details: true,
    hotlist: true,
    calendar: true
  });
}

function loadEconomicCalendar() {
  const container = document.getElementById('economic_calendar');
  if (!container) return;
  container.innerHTML = '';

  const script = document.createElement('script');
  script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
  script.async = true;
  script.innerHTML = JSON.stringify({
    width: "100%",
    height: "100%",
    colorTheme: "dark",
    isTransparent: false,
    locale: "en",
    importanceFilter: "0,1",
    currencyFilter: "USD,EUR,GBP,JPY,CHF,CAD,AUD,NZD"
  });
  container.appendChild(script);
}

function toggleCalendar() {
  const panel = document.getElementById('calendarPanel');
  if (panel) {
    panel.classList.toggle('collapsed');
  }
}

/* ==================== */
/* DRAGGABLE & RESIZABLE */
/* ==================== */

(function() {
  const modal = document.getElementById('terminalModal');
  if (!modal) return;

  const container = modal.querySelector('.terminal-container');
  if (!container) return;

  const header = container.querySelector('.terminal-header');
  const resizeHandle = container.querySelector('.terminal-resize-handle');
  let isDragging = false;
  let isResizing = false;
  let startX, startY, startLeft, startTop, startWidth, startHeight;

  // Center the container initially (reset to flexbox-centered state)
  function centerContainer() {
    container.style.position = '';
    container.style.left = '';
    container.style.top = '';
    container.style.transform = '';
    container.style.width = '';
    container.style.height = '';
    container.dataset.centered = 'true';
  }

  // On first open, center it
  const _origOpen = window.openTerminalModal;
  window.openTerminalModal = function() {
    _origOpen();
    requestAnimationFrame(() => {
      centerContainer();
    });
  };

  // Dragging
  if (header) {
    header.style.cursor = 'grab';
    header.addEventListener('mousedown', function(e) {
      if (e.target.closest('.terminal-close') || e.target.closest('.terminal-dots')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;

      // Get current pixel position using getBoundingClientRect
      const rect = container.getBoundingClientRect();
      const parent = container.offsetParent || document.body;
      const parentRect = parent.getBoundingClientRect();

      // Switch to absolute positioning with exact pixel values
      container.style.position = 'absolute';
      startLeft = rect.left - parentRect.left;
      startTop = rect.top - parentRect.top;
      container.style.left = startLeft + 'px';
      container.style.top = startTop + 'px';
      container.style.transform = 'none';
      container.dataset.centered = 'false';

      header.style.cursor = 'grabbing';
      e.preventDefault();
    });
  }

  // Resizing
  if (resizeHandle) {
    resizeHandle.addEventListener('mousedown', function(e) {
      isResizing = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = container.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      e.preventDefault();
      e.stopPropagation();
    });
  }

  document.addEventListener('mousemove', function(e) {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      container.style.left = (startLeft + dx) + 'px';
      container.style.top = (startTop + dy) + 'px';
    }
    if (isResizing) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      let newWidth = startWidth + dx;
      let newHeight = startHeight + dy;
      // Min/Max constraints
      newWidth = Math.max(700, Math.min(newWidth, window.innerWidth - 40));
      newHeight = Math.max(400, Math.min(newHeight, window.innerHeight - 40));
      container.style.width = newWidth + 'px';
      container.style.height = newHeight + 'px';
    }
  });

  document.addEventListener('mouseup', function() {
    if (isDragging && header) {
      header.style.cursor = 'grab';
    }
    isDragging = false;
    isResizing = false;
  });
})();
