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

    let manuallyClosed = false,
        toggleCollapsed = false;

    // Inject styles (including collapse styles)
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
        position: fixed; top:50%; right:0;
        width:320px; background:#fafafa; border-left:1px solid #ddd;
        padding:20px; box-shadow:-3px 0 8px rgba(0,0,0,0.2);
        line-height:1.5; display:none;
        transform: translateY(-50%);
        animation: slideIn 0.4s ease forwards;
      }
      #top-pick-sidebar.show { display:block; }
      #top-pick-sidebar .close-btn { position:absolute; top:8px; right:8px;
        background:transparent; border:none; font-size:20px; cursor:pointer; color:#666;
      }
      /* ... other sidebar styles omitted for brevity ... */

      #top-pick-toggle {
        position: fixed; top:50%; right:0;
        background:#87cefa; color:#fff; padding:10px 14px;
        border-radius:4px 0 0 4px; cursor:pointer; display:none;
        font-size:14px; transition: width .3s ease, padding .3s ease;
        transform: translateY(-50%);
      }
      #top-pick-toggle.show { display:block; }
      /* collapse state: 24px wide handle */
      #top-pick-toggle.collapsed {
        width:24px !important;
        padding-left:0 !important; padding-right:0 !important;
        overflow:hidden;
      }
      /* show a little arrow or dot on the collapsed handle */
      #top-pick-toggle.collapsed::after {
        content:'►';
        display:block;
        position:absolute; left:4px; top:50%;
        transform:translateY(-50%);
        font-size:14px;
      }
      #top-pick-toggle:not(.collapsed)::after { content:''; }
    `;
    document.head.appendChild(style);

    // Create toggle button
    const toggle = document.createElement('button');
    toggle.id = 'top-pick-toggle';
    toggle.textContent = '🔥 Top Pick';
    document.body.appendChild(toggle);

    // Create sidebar container (markup omitted for brevity)
    const sidebar = document.createElement('aside');
    sidebar.id = 'top-pick-sidebar';
    sidebar.innerHTML = `…`;  
    document.body.appendChild(sidebar);

    // realistic timestamp
    const stampEl = sidebar.querySelector('.timestamp');
    const now = new Date();
    const offset = Math.floor(Math.random()*51)+10;
    const ts = new Date(now - offset*60000);
    stampEl.textContent = `Updated: ${ts.toLocaleTimeString()}`;

    // Single click handler for the toggle
    toggle.addEventListener('click', e => {
      const sidebarShowing = sidebar.classList.contains('show');
      // if not showing, and toggle not collapsed, and click in left 24px → collapse
      if (!sidebarShowing && !toggleCollapsed && e.offsetX < 24) {
        toggleCollapsed = true;
        manuallyClosed = true;            // prevent auto‐open
        toggle.classList.add('collapsed');
        return;
      }
      // otherwise: open sidebar
      sidebar.classList.add('show');
      toggle.classList.remove('show','collapsed');
      toggleCollapsed = false;
      manuallyClosed = false;
    });

    // close‐button hides sidebar and shows toggle (expanded)
    sidebar.querySelector('.close-btn').addEventListener('click', () => {
      sidebar.classList.remove('show');
      toggle.classList.add('show');
      toggleCollapsed = false;
      manuallyClosed = true;
    });

    // scroll trigger
    function checkScroll() {
      const ratio = window.scrollY /
        (document.documentElement.scrollHeight - window.innerHeight);
      if (ratio >= 0.3 && !manuallyClosed) {
        sidebar.classList.add('show');
        toggle.classList.remove('show','collapsed');
        toggleCollapsed = false;
      }
    }
    window.addEventListener('scroll', checkScroll);
    checkScroll();

    // Fetch and populate JSON…
    // (your existing fetch(…) code here)
  }

  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded', initSidebar);
  } else initSidebar();
})();
