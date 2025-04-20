// sidebar.js
(function() {
  // Create and inject styles
  const style = document.createElement('style');
  style.textContent = `
    #top-pick-sidebar {
      position: fixed;
      top: 20px;
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
    }
    #top-pick-sidebar h2 { margin-top: 0; font-size: 18px; color: #333; }
    #top-pick-sidebar .logo { display: block; max-height: 40px; margin-bottom: 10px; }
    #top-pick-sidebar .company-name { font-weight: bold; font-size: 16px; }
    #top-pick-sidebar .full-name { font-size: 14px; color: #666; }
    #top-pick-sidebar .rank { color: #555; margin: 10px 0; }
    #top-pick-sidebar .description { font-size: 14px; color: #444; }
    #top-pick-sidebar .custom-description { font-size: 13px; color: #444; margin-top: 10px; }
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
  `;
  document.head.appendChild(style);

  // Create sidebar markup
  const sidebar = document.createElement('aside');
  sidebar.id = 'top-pick-sidebar';
  sidebar.innerHTML = `
    <h2>One Top Pick For You</h2>
    <img class="logo" src="" alt="Company logo">
    <div class="company-name"></div>
    <div class="full-name"></div>
    <div class="rank"></div>
    <p class="description"></p>
    <p class="custom-description"></p>
    <a id="more-link" href="https://victorphilip.com/Rankings" class="cta-button" target="_top" rel="noopener noreferrer">
      Want more…?
    </a>
  `;
  document.body.appendChild(sidebar);

  // Fetch and populate data
  fetch('example_holding.json')
    .then(res => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
    .then(data => {
      if (!Array.isArray(data) || !data.length) throw new Error('No holdings data');
      const top = data.reduce((best, c) => c.rank < best.rank ? c : best, data[0]);
      const ticker = top.baseTicker.split(':')[0];
      let logoUrl = '';
      if (typeof top.logo === 'string' && top.logo) {
        logoUrl = top.logo;
      } else if (Array.isArray(top.logo) && top.logo[0]) {
        const f = top.logo[0];
        logoUrl = f.thumbnails?.small?.url || f.url || '';
      }
      sidebar.querySelector('img.logo').src = logoUrl;
      sidebar.querySelector('img.logo').alt = `${ticker} logo`;
      sidebar.querySelector('.company-name').textContent = ticker;
      sidebar.querySelector('.full-name').textContent = top.name || '';
      sidebar.querySelector('.rank').textContent = `Overall Rank: ${parseFloat(top.rank).toFixed(1)}`;
      sidebar.querySelector('.description').textContent =
        `At Victor Philip, we believe in evaluating companies from ALL sides. ${top.name || ticker} ` +
        `scores high on stable growth, valuation, ROIC, balance‐sheet strength, cash‐flow, sentiment and momentum.`;
      const fullDesc = top.description || '';
      const words = fullDesc.split(/\s+/);
      const truncated = words.slice(0, Math.ceil(words.length/2)).join(' ');
      sidebar.querySelector('.custom-description').textContent = truncated + '…';
    })
    .catch(err => {
      console.error('❌ Sidebar error:', err);
      sidebar.innerHTML = '<p>Unable to load top pick at this time.</p>';
    });
})();
