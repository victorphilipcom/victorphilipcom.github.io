// sidebar.js (debug version)
(function() {
  // Debug: script loaded
  alert('☝️ sidebar.js loaded');

  function initSidebar() {
    // Debug: init running
    alert('✅ initSidebar running');

    // Identify current script element
    const currentScript = document.currentScript || (() => {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    // Determine data URL
    const baseUrl = currentScript.src
      ? currentScript.src.slice(0, currentScript.src.lastIndexOf('/') + 1)
      : '';
    const dataUrl = currentScript.dataset.jsonUrl || (baseUrl + 'example_holding.json');
    console.log('Fetching data from', dataUrl);

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
      #top-pick-sidebar { position: fixed; top: 70vh; right: 0; width: 280px;
        background: #fafafa; border-left: 1px solid #ddd; padding: 15px;
        box-shadow: -2px 0 5px rgba(0,0,0,0.1); line-height: 1.5;
        font-family: sans-serif; display: none; z-index: 10000;
      }
      #top-pick-sidebar.visible { display: block; }
      /* ... other styles ... */
    `;
    document.head.appendChild(style);

    // Create sidebar
    const sidebar = document.createElement('aside');
    sidebar.id = 'top-pick-sidebar';
    sidebar.innerHTML = `
      <h2>One Top Pick For You</h2>
      <img class="logo" src="" alt="Company logo">
      <div class="company-name"></div>
      <div class="full-name"></div>
      <div class="rank"></div>
      <p class="description">Loading...</p>
      <p class="custom-description"></p>
      <a id="more-link" href="https://victorphilip.com/Rankings" class="cta-button" target="_top" rel="noopener noreferrer">
        Want more…?
      </a>
    `;
    try {
      document.body.appendChild(sidebar);
    } catch (e) {
      console.error('Append sidebar to body failed, trying document.documentElement:', e);
      try {
        document.documentElement.appendChild(sidebar);
      } catch (e2) {
        console.error('Append sidebar to documentElement failed:', e2);
      }
    }
    // Debug: sidebar appended
    alert('🆕 Sidebar element appended with id: ' + sidebar.id);

    // Force display for testing
    sidebar.style.display = 'block';

    // Debug: skip scroll logic for now

    // Fetch and populate data
    fetch(dataUrl)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => {
        alert('📥 Data received: ' + JSON.stringify(data).slice(0,100));
        if (!Array.isArray(data) || !data.length) throw new Error('No data');
        const top = data.reduce((best, c) => c.rank < best.rank ? c : best, data[0]);
        const ticker = top.baseTicker.split(':')[0];
        let logoUrl = '';
        if (typeof top.logo === 'string') logoUrl = top.logo;
        else if (Array.isArray(top.logo) && top.logo[0]) {
          const f = top.logo[0];
          logoUrl = f.thumbnails?.small?.url || f.url || '';
        }
        sidebar.querySelector('.logo').src = logoUrl;
        sidebar.querySelector('.logo').alt = `${ticker} logo`;
        sidebar.querySelector('.company-name').textContent = ticker;
        sidebar.querySelector('.full-name').textContent = top.name || '';
        sidebar.querySelector('.rank').textContent = `Overall Rank: ${parseFloat(top.rank).toFixed(1)}`;
        sidebar.querySelector('.description').textContent =
          `At Victor Philip, we believe in evaluating companies from ALL sides. ${top.name || ticker} ` +
          `scores high on stable growth, valuation, ROIC, balance‐sheet strength, cash‐flow, sentiment and momentum.`;
        const words = (top.description || '').split(/\s+/);
        sidebar.querySelector('.custom-description').textContent = words.slice(0, Math.ceil(words.length/2)).join(' ') + '…';
      })
      .catch(err => {
        console.error('Sidebar error:', err);
        alert('❌ Sidebar error: ' + err.message);
        sidebar.querySelector('.description').textContent = 'Unable to load top pick.';
        sidebar.querySelector('.custom-description').textContent = '';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
