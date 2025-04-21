// sidebar.js
(function() {
  function initSidebar() {
    // Identify current script
    const currentScript = document.currentScript || (() => {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();
    const baseUrl = currentScript.src
      ? currentScript.src.slice(0, currentScript.src.lastIndexOf('/') + 1)
      : '';
    const dataUrl = currentScript.dataset.jsonUrl || baseUrl + 'example_holding.json';

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
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
        z-index: 10000;
        max-height: calc(100vh - 40px);
        overflow-y: auto;
        font-family: sans-serif;
        display: none; /* hidden until scroll threshold */
      }
      /* Preserve all other styles (h2, .logo, .cta-button, etc.) */
    `;
    document.head.appendChild(style);

    // Build sidebar
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
      <a id="more-link" href="https://victorphilip.com/Rankings" class="cta-button" target="_top" rel="noopener noreferrer">Want more…?</a>
    `;
    document.body.appendChild(sidebar);

    // Show sidebar after scrolling 30% of viewport height
    function onScroll() {
      if (window.scrollY > window.innerHeight * 0.3) {
        sidebar.style.display = 'block';
      } else {
        sidebar.style.display = 'none';
      }
    }
    window.addEventListener('scroll', onScroll);
    // Initial check
    onScroll();

    // Fetch data and populate content
    fetch(dataUrl)
      .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) throw new Error('No holdings');
        const top = data.reduce((best, c) => c.rank < best.rank ? c : best, data[0]);
        const ticker = top.baseTicker.split(':')[0];
        let logo = '';
        if (typeof top.logo === 'string') logo = top.logo;
        else if (Array.isArray(top.logo) && top.logo[0]) {
          const f = top.logo[0];
          logo = f.thumbnails?.small?.url || f.url || '';
        }
        sidebar.querySelector('.logo').src = logo;
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
