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

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #top-pick-sidebar, #top-pick-toggle { font-family: sans-serif; z-index: 10000; }
      #top-pick-sidebar {
        position: fixed;
        top: 70vh;
        right: 0;
        width: 280px;
        background: #fafafa;
        border-left: 1px solid #ddd;
        padding: 15px;
        box-shadow: -2px 0 5px rgba(0,0,0,0.1);
        line-height: 1.5;
        display: none;
      }
      #top-pick-sidebar.show { display: block; }
      #top-pick-sidebar .close-btn {
        position: absolute;
        top: 8px;
        right: 8px;
        background: transparent;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
      }
      #top-pick-sidebar h2 { margin: 0 0 10px; font-size: 18px; color: #333; }
      #top-pick-sidebar .logo { display: block; max-height: 40px; margin-bottom: 10px; }
      #top-pick-sidebar .company-name { font-weight: bold; font-size: 16px; }
      #top-pick-sidebar .full-name { font-size: 14px; color: #666; }
      #top-pick-sidebar .rank { color: #555; margin: 10px 0; }
      #top-pick-sidebar .description, #top-pick-sidebar .custom-description {
        font-size: 14px; color: #444;
      }
      #top-pick-sidebar .custom-description { margin-top: 10px; font-size: 13px; }
      .cta-button {
        display: block;
        width: 100%;
        padding: 12px 0;
        margin-top: 10px;
        text-align: center;
        font-weight: 600;
        color: #fff;
        background-color: #87cefa;
        border-radius: 4px;
        text-decoration: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.15);
        transition: background-color 0.2s ease;
      }
      .cta-button:hover { background-color: #000; }
      #top-pick-toggle {
        position: fixed;
        top: 70vh;
        right: 0;
        transform: translateX(100%);
        background: #87cefa;
        color: #fff;
        padding: 8px 12px;
        border-radius: 4px 0 0 4px;
        cursor: pointer;
        display: none;
      }
      #top-pick-toggle.show { display: block; transform: translateX(0); }
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
      <h2>One Top Pick For You</h2>
      <img class="logo" src="" alt="Company logo">
      <div class="company-name"></div>
      <div class="full-name"></div>
      <div class="rank"></div>
      <p class="description"></p>
      <p class="custom-description"></p>
      <a id="more-link" href="https://victorphilip.com/Rankings" class="cta-button" target="_top" rel="noopener noreferrer">Want more…?</a>
    `;
    document.body.appendChild(sidebar);

    // Toggle behavior
    toggle.addEventListener('click', () => {
      sidebar.classList.add('show');
      toggle.classList.remove('show');
    });
    sidebar.querySelector('.close-btn').addEventListener('click', () => {
      sidebar.classList.remove('show');
      toggle.classList.add('show');
    });

    // Scroll trigger: show/hide toggle
    function checkScroll() {
      const ratio = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      if (ratio >= 0.3) toggle.classList.add('show');
      else toggle.classList.remove('show');
    }
    window.addEventListener('scroll', checkScroll);
    checkScroll(); // initial check

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
        sidebar.querySelector('.rank').textContent = `Overall Rank: ${parseFloat(top.rank).toFixed(1)}`;
        sidebar.querySelector('.description').textContent =
          `At Victor Philip, we believe in evaluating companies from ALL sides. ${top.name || ticker} ` +
          `scores high on stable growth, valuation, ROIC, balance‐sheet strength, cash‐flow, sentiment and momentum.`;
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
