// sidebar.js
(function() {
  function initSidebar() {
    // Get current script element
    const currentScript = document.currentScript || (function() {
      const scripts = document.getElementsByTagName('script');
      return scripts[scripts.length - 1];
    })();

    // Derive base URL from script src
    const baseUrl = currentScript.src
      ? currentScript.src.substring(0, currentScript.src.lastIndexOf('/') + 1)
      : '';

    // Allow overriding JSON URL via data attribute
    const dataUrl = currentScript.dataset.jsonUrl || (baseUrl + 'example_holding.json');

    // Inject styles with initial hidden state and positioned at 70vh
    const style = document.createElement('style');
    style.textContent = `
      #top-pick-sidebar {
        position: fixed;
        top: 70vh;          /* Start at 70% of viewport height */
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
        visibility: hidden; /* hidden until scroll threshold */
        opacity: 0;
        transition: opacity 0.3s ease, visibility 0.3s ease;
      }
      #top-pick-sidebar.visible {
        visibility: visible;
        opacity: 1;
      }
    `;
    document.head.appendChild(style);

    // Create sidebar element
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
    document.body.appendChild(sidebar);

    // Show sidebar when scrolled past 30% of scrollable height
    function checkScroll() {
      const scrollTop = window.scrollY;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 0 && scrollTop >= scrollable * 0.3) {
        sidebar.classList.add('visible');
      } else {
        sidebar.classList.remove('visible');
      }
    }
    // Listen and initial check
    window.addEventListener('scroll', checkScroll);
    checkScroll();

    // Fetch and populate
    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (!Array.isArray(data) || !data.length) throw new Error('No holdings data');
        const top = data.reduce((best, c) => c.rank < best.rank ? c : best, data[0]);
        const ticker = top.baseTicker.split(':')[0];

        // Resolve logo URL
        let logoUrl = '';
        if (typeof top.logo === 'string' && top.logo) {
          logoUrl = top.logo;
        } else if (Array.isArray(top.logo) && top.logo[0]) {
          const f = top.logo[0];
          logoUrl = f.thumbnails?.small?.url || f.url || '';
        }

        // Populate
        sidebar.querySelector('.logo').src = logoUrl;
        sidebar.querySelector('.logo').alt = `${ticker} logo`;
        sidebar.querySelector('.company-name').textContent = ticker;
        sidebar.querySelector('.full-name').textContent = top.name || '';
        sidebar.querySelector('.rank').textContent = `Overall Rank: ${parseFloat(top.rank).toFixed(1)}`;
        sidebar.querySelector('.description').textContent =
          `At Victor Philip, we believe in evaluating companies from ALL sides. ${top.name || ticker} ` +
          `scores high on stable growth, valuation, ROIC, balance‐sheet strength, cash‐flow, sentiment and momentum.`;

        // Truncate description
        const words = (top.description || '').split(/\s+/);
        sidebar.querySelector('.custom-description').textContent =
          words.slice(0, Math.ceil(words.length / 2)).join(' ') + '…';
      })
      .catch(err => {
        console.error('❌ Sidebar error:', err);
        sidebar.querySelector('.description').textContent = 'Unable to load top pick.';
        sidebar.querySelector('.custom-description').textContent = '';
      });
  }

  // Initialize after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else {
    initSidebar();
  }
})();
