const fs = require('fs');

let idx = fs.readFileSync('index.html', 'utf8');

const jsStart = idx.indexOf('9. MENU SPA LOGIC & CART');
const jsCartStart = idx.indexOf('// Cart logic');

if (jsStart !== -1 && jsCartStart > jsStart) {
  // Go back to the comment start
  const blockStart = idx.lastIndexOf('/* ════', jsStart);
  if (blockStart !== -1) {
    const cartLogicJS = `/* ════════════════════════════════════════════════════════
   9. GLOBAL CART LOGIC
════════════════════════════════════════════════════════ */
(function() {
  `;
    idx = idx.substring(0, blockStart) + cartLogicJS + idx.substring(jsCartStart);
    fs.writeFileSync('index.html', idx);
    console.log("Fixed index.html JS block");
  }
}
