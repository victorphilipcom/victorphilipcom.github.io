// sidebar.js
(function() {
  function initSidebar() {
    const currentScript = document.currentScript || (() => {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    const baseUrl = currentScript.src
      ? currentScript.src.replace(/sidebar\.js.*$/, '')
      : '';
    const dataUrl = currentScript.dataset.jsonUrl || baseUrl + 'example_holding.json';

    let manuallyClosed = false;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { opacity: 0; transform: translateX(100%) translateY(-50%); }
        to   { opacity: 1; transform: translateX(0) translateY(-50%); }
      }
      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      #top-pick-sidebar, #top-pick-toggle { font-family: sans-serif; z-index: 10000; }
      #top-pick-sidebar {
        position: fixed;
        top: 50%;
        right: 0;
        width: 320px;
        background: #fafafa;
        border-left: 1px solid #ddd;
        padding: 20px;
        box-shadow: -3px 0 8px rgba(0,0,0,0.2);
        line-height: 1.5;
        display: none;
        transform: translateY(-50%);
        animation: slideIn 0.4s ease forwards;
      }
      #top-pick-sidebar.show { display: block; }
      #top-pick-sidebar .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: transparent;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #666;
      }
      #top-pick-sidebar h2 { margin: 0 0 10px; font-size: 20px; color: #333; }
      #top-pick-sidebar .logo { display: block; max-height: 50px; margin-bottom: 10px; }
      #top-pick-sidebar .company-name { font-weight: bold; font-size: 18px; }
      #top-pick-sidebar .full-name { font-size: 15px; color: #555; margin-bottom: 8px; }
      #top-pick-sidebar .rank { color: #333; margin: 10px 0; font-weight: 600; }
      #top-pick-sidebar .description,
      #top-pick-sidebar .custom-description {
        font-size: 14px; color: #444; margin-bottom: 10px;
      }
      #top-pick-sidebar .custom-description { margin-top: 5px; font-size: 13px; }
      #top-pick-sidebar .timestamp {
        font-size: 12px; color: #888; text-align: right; margin-top: 8px;
      }
      .cta-button {
        display: block;
        width: 100%;
        padding: 12px 0;
        margin-top: 12px;
        text-align: center;
        font-weight: 600;
        color: #fff;
        background-color: #87cefa;
        border-radius: 4px;
        text-decoration: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        animation: pulse 2s infinite;
      }
      .cta-button:hover { background-color: #000; animation-play-state: paused; }
      #top-pick-toggle {
        position: fixed;
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        background: #87cefa;
        color: #fff;
        padding: 10px 14px;
        border-radius: 4px 0 0 4px;
        cursor: pointer;
        display: none;
        font-size: 14px;
      }
      #top-pick-toggle.show { display: block; }
    `;
    document.head.appendChild(style);

    // Create toggle button
    const toggle = document.createElement('button');
    toggle.id = 'top-pick-toggle';
    toggle.textContent = 'Top Pick';
    document.body.appendChild(toggle);

    // Create sidebar container
    const sidebar = document.createElement('aside');
    sidebar.id = 'top-pick-sidebar';
    sidebar.innerHTML = `
      <button class="close-btn" aria-label="Close sidebar">×</button>
      <h2>🔥 Top Investment Alert</h2>
      <img class="logo" src="" alt="Company logo">
      <div class="company-name"></div>
      <div class="full-name"></div>
      <div class="rank"></div>
      <p class="description"></p>
      <p class="custom-description"></p>
      <a id="more-link" href="https://victorphilip.com/Rankings" class="cta-button" target="_top" rel="noopener noreferrer">Unlock Full Analysis</a>
      <div class="timestamp">Updated: --</div>
    `;
    document.body.appendChild(sidebar);

    // Generate realistic timestamp
    const stampEl = sidebar.querySelector('.timestamp');
    const now = new Date();
    const offsetMinutes = Math.floor(Math.random() * 51) + 10;
    const ts = new Date(now.getTime() - offsetMinutes * 60000);
    stampEl.textContent = `Updated: ${ts.toLocaleDateString()} ${ts.toLocaleTimeString()}`;

    // Manual toggle
    toggle.addEventListener('click', () => {
      sidebar.classList.add('show');
      toggle.classList.remove('show');
      manuallyClosed = false;
    });
    sidebar.querySelector('.close-btn').addEventListener('click', () => {
      sidebar.classList.remove('show');
      toggle.classList.add('show');
      manuallyClosed = true;
    });

    // Scroll trigger
    function checkScroll() {
      const ratio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (ratio >= 0.15 && !manuallyClosed) {
        sidebar.classList.add('show');
        toggle.classList.remove('show');
      }
    }
    window.addEventListener('scroll', checkScroll);
    checkScroll();

    // Fetch and populate
    fetch(dataUrl)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => {
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
        sidebar.querySelector('.rank').textContent = `Rank: ${parseFloat(top.rank).toFixed(1)}`;
        sidebar.querySelector('.description').textContent =
          `We constantly monitor market leaders. ${top.name || ticker} stands out in growth, valuation, ROIC, and momentum.`;
        const words = (top.description || '').split(/\s+/);
        sidebar.querySelector('.custom-description').textContent = words.slice(0, Math.ceil(words.length/2)).join(' ') + '…';
      })
      .catch(err => {
        console.error('Sidebar error:', err);
        sidebar.innerHTML = '<p>Unable to load top pick at this time.</p>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
