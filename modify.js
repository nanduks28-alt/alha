const fs = require('fs');

// ──────────────────────────────────────────────
// INDEX.HTML MODIFICATIONS
// ──────────────────────────────────────────────
let idx = fs.readFileSync('index.html', 'utf8');

// 1. Revert Nav links
idx = idx.replace('<li><a href="#" class="active" data-target="home">Home</a></li>\n      <li><a href="#" data-target="menu">Menu</a></li>\n      <li><a href="#" data-target="home">Events</a></li>\n      <li><a href="#" data-target="home">About</a></li>\n      <li><a href="#" data-target="home">Contact</a></li>', 
'<li><a href="index.html" class="active">Home</a></li>\n      <li><a href="menu.html">Menu</a></li>\n      <li><a href="menu.html?category=events">Events</a></li>\n      <li><a href="#">About</a></li>\n      <li><a href="#">Contact</a></li>');

// 2. Remove view-home wrappers
idx = idx.replace('<div id="view-home" class="spa-view active">\n  <!-- ── HERO', '  <!-- ── HERO');
idx = idx.replace('</main>\n  </div><!-- /#view-home -->', '</main>');

// 3. Move category cards and remove view-menu
const menuHtmlStart = idx.indexOf('<div id="view-menu"');
const menuHtmlEnd = idx.indexOf('</div><!-- /#view-menu -->') + '</div><!-- /#view-menu -->'.length;
idx = idx.substring(0, menuHtmlStart) + idx.substring(menuHtmlEnd);

// Insert menu-categories right after hero-band
const heroEnd = '</section>';
const heroEndIndex = idx.indexOf(heroEnd, idx.indexOf('id="hero-band"'));
const insertionPoint = heroEndIndex + heroEnd.length;

const categoryCardsHtml = `
  <section id="menu-categories-section">
    <div class="menu-categories">
      <a href="menu.html?category=events" class="category-card" data-category="events">
        <img src="events1.jpeg" alt="Events Category">
        <h3>Events (Bulk Orders)</h3>
      </a>
      <a href="menu.html?category=small" class="category-card" data-category="small">
        <img src="events3.jpeg" alt="Small Quantity Category">
        <h3>Small Quantity Orders</h3>
      </a>
    </div>
  </section>
`;
idx = idx.substring(0, insertionPoint) + categoryCardsHtml + idx.substring(insertionPoint);

// 4. Remove unused CSS from style block
const cssStart = idx.indexOf('/* ═══════════════════════════ SPA ROUTING ═══ */');
const cssEnd = idx.indexOf('.add-to-cart-btn:hover { background: var(--gold); color: var(--bg-dark); }') + '.add-to-cart-btn:hover { background: var(--gold); color: var(--bg-dark); }'.length;

const newCss = `    /* ═══════════════════════════ MENU CATEGORY CARDS (Home Page) ═══ */
    #menu-categories-section {
      padding: clamp(80px, 10vh, 120px) clamp(24px, 6vw, 80px);
      background: var(--bg);
    }
    .menu-categories {
      display: flex; gap: 40px; justify-content: center; flex-wrap: wrap;
    }
    .category-card {
      flex: 1; min-width: 300px; max-width: 500px; aspect-ratio: 4/3;
      position: relative; overflow: hidden; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 10px 30px rgba(42,26,26,.05);
      border: 1px solid rgba(201,151,58,.2); transition: transform 0.4s;
      text-decoration: none;
    }
    .category-card:hover { transform: translateY(-5px); }
    .category-card::before {
      content:''; position:absolute; inset:0;
      background: linear-gradient(180deg, rgba(26,15,15,0) 0%, rgba(26,15,15,0.7) 100%);
      z-index: 1; transition: opacity 0.4s;
    }
    .category-card:hover::before { opacity: 0.9; }
    .category-card img {
      position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
      transition: transform 0.6s ease;
    }
    .category-card:hover img { transform: scale(1.05); }
    .category-card h3 {
      position: relative; z-index: 2; font-family: 'Cormorant Garamond', serif;
      font-size: clamp(30px, 4vw, 48px); font-weight: 300; color: var(--cream);
      text-align: center; pointer-events: none; margin: 0;
    }`;
if (cssStart !== -1 && cssEnd > cssStart) {
  idx = idx.substring(0, cssStart) + newCss + idx.substring(cssEnd);
}

// 5. Cleanup JS block
const jsStart = idx.indexOf('/* ════════════════════════════════════════════════════════\n   9. MENU SPA LOGIC & CART');
const jsCartStart = idx.indexOf('// Cart logic');

const cartLogicJS = `/* ════════════════════════════════════════════════════════
   9. GLOBAL CART LOGIC
════════════════════════════════════════════════════════ */
(function() {
  `;
if (jsStart !== -1 && jsCartStart > jsStart) {
  idx = idx.substring(0, jsStart) + cartLogicJS + idx.substring(jsCartStart);
}

fs.writeFileSync('index.html', idx);


// ──────────────────────────────────────────────
// MENU.HTML MODIFICATIONS
// ──────────────────────────────────────────────
let menu = fs.readFileSync('menu.html', 'utf8');

// 1. Remove Home content from menu.html
const heroStartMenu = menu.indexOf('<div id="view-home"');
const heroEndMenu = menu.indexOf('</div><!-- /#view-home -->') + '</div><!-- /#view-home -->'.length;
if (heroStartMenu !== -1 && heroEndMenu > heroStartMenu) {
  menu = menu.substring(0, heroStartMenu) + menu.substring(heroEndMenu);
}

// 2. Remove spa-view class and style from #view-menu
menu = menu.replace('<div id="view-menu" class="spa-view">', '<div id="view-menu">');
menu = menu.replace('/* ═══════════════════════════ SPA ROUTING ═══ */\n    .spa-view { display: none; opacity: 0; transition: opacity 0.4s ease; }\n    .spa-view.active { display: block; opacity: 1; animation: fadeIn 0.4s ease forwards; }\n    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }\n\n', '');

// 3. Revert Nav links
menu = menu.replace('<li><a href="#" class="active" data-target="home">Home</a></li>\n      <li><a href="#" data-target="menu">Menu</a></li>\n      <li><a href="#" data-target="home">Events</a></li>\n      <li><a href="#" data-target="home">About</a></li>\n      <li><a href="#" data-target="home">Contact</a></li>', 
'<li><a href="index.html">Home</a></li>\n      <li><a href="menu.html" class="active">Menu</a></li>\n      <li><a href="menu.html?category=events">Events</a></li>\n      <li><a href="#">About</a></li>\n      <li><a href="#">Contact</a></li>');

// 4. Update JS logic in menu.html
const jsMenuStart = menu.indexOf('  // Elements inside Menu');
const jsMenuEnd = menu.indexOf('  // Mock Products Data');

const newMenuJS = `  // Elements inside Menu
  const menuLanding = document.getElementById('menu-landing');
  const sectionEvents = document.getElementById('section-events');
  const sectionSmall = document.getElementById('section-small');
  const menuBackBtn = document.getElementById('menu-back');
  const menuMainTitle = document.getElementById('menu-main-title');
  const gridEvents = document.getElementById('grid-events');
  const gridSmall = document.getElementById('grid-small');

  function showMenuLanding() {
    menuLanding.style.display = 'flex';
    sectionEvents.style.display = 'none';
    sectionSmall.style.display = 'none';
    menuBackBtn.style.display = 'none';
    menuMainTitle.textContent = 'Our Offerings';
    window.history.replaceState({}, '', 'menu.html');
  }

  function showCategory(category) {
    menuLanding.style.display = 'none';
    menuBackBtn.style.display = 'block';
    
    if(category === 'events') {
      sectionEvents.style.display = 'block';
      sectionSmall.style.display = 'none';
      menuMainTitle.textContent = 'Events (Bulk Orders)';
    } else {
      sectionSmall.style.display = 'block';
      sectionEvents.style.display = 'none';
      menuMainTitle.textContent = 'Small Quantity Orders';
    }
  }

  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.getAttribute('data-category');
      window.history.pushState({}, '', 'menu.html?category=' + cat);
      showCategory(cat);
    });
  });
  
  menuBackBtn.addEventListener('click', showMenuLanding);
  
  // Handle URL params on load
  const urlParams = new URLSearchParams(window.location.search);
  const categoryParam = urlParams.get('category');
  if (categoryParam === 'events' || categoryParam === 'small') {
    showCategory(categoryParam);
  } else {
    showMenuLanding();
  }

`;

if (jsMenuStart !== -1 && jsMenuEnd > jsMenuStart) {
  menu = menu.substring(0, jsMenuStart) + newMenuJS + menu.substring(jsMenuEnd);
}

// Remove the old nav routing block in menu.html
const navListenerStart = menu.indexOf('// Navigation');
const navListenerEnd = menu.indexOf('function showMenuLanding()');
if (navListenerStart !== -1 && navListenerEnd > navListenerStart) {
  menu = menu.substring(0, navListenerStart) + menu.substring(navListenerEnd);
}

// Ensure the #view-home references in JS are completely removed from menu.html
menu = menu.replace("const viewHome = document.getElementById('view-home');\n", "");
menu = menu.replace("const viewMenu = document.getElementById('view-menu');\n", "");
menu = menu.replace("const navLinks = document.querySelectorAll('.nav-links a');\n", "");

fs.writeFileSync('menu.html', menu);
console.log("Done modifying index.html and menu.html");
