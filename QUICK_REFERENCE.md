# ALHA Website - Quick Reference Guide

## 📄 Page Structure

### index.html (Marketing Home)
```
Loader → Portal → Home Page

Sections:
├─ #home (hero + categories + stats)
├─ #menu (3 story articles + quote)
├─ #blog (3 blog cards)
└─ #contact (form + info)

Features:
• Premium arc navigator (left side)
• Three.js animations
• Cart badge (links to menu.html)
• Smooth scroll between sections
```

### menu.html (Shopping Page)
```
Loader → Portal → Menu Page

Views:
├─ Landing (category selection)
├─ Events Category (bulk products)
└─ Small Quantity (individual products)

Features:
• Cart sidebar (slides from right)
• URL parameters (?category=events|small)
• Back to Home button
• Add to cart functionality
```

---

## 🔗 Key Links

### From index.html:
| Element | Destination |
|---------|------------|
| Nav: Menu | menu.html |
| Nav: Events | menu.html?category=events |
| Hero CTA | menu.html |
| Events Card | menu.html?category=events |
| Small Qty Card | menu.html?category=small |
| Story CTA 1 | menu.html?category=events |
| Story CTA 2 | menu.html?category=events |
| Story CTA 3 | menu.html?category=small |
| Cart Badge | menu.html |

### From menu.html:
| Element | Destination |
|---------|------------|
| Nav: Home | index.html#home |
| Nav: About | index.html#blog |
| Nav: Contact | index.html#contact |
| Back Button | index.html |
| Cart Badge | Opens sidebar |

---

## 🛒 Cart System

**Storage:** `localStorage` → key: `alha_cart`

**Badge Sync:** Updates every 500ms on index.html

**Data Structure:**
```javascript
[{
  id: 'product_id',
  name: 'Product Name',
  image: 'image.png',
  quantity: 2,
  type: 'events|small',
  price: 250,      // small only
  subtotal: 500    // small only
}]
```

**Functions:**
- `addToCart(id, type)` - Add item
- `removeFromCart(index)` - Remove item
- `openCart()` - Show sidebar
- `closeCart()` - Hide sidebar
- `updateCartBadge()` - Sync badge

---

## 📦 Products

### Events Category (6 products)
No individual pricing • "Price on request"
1. Macaron Tower
2. Wedding Dessert Table
3. Custom Artisan Cupcakes
4. Luxury Dessert Bar
5. Signature Cookie Platters
6. Elegant Pudding Cups

### Small Quantity (6 products)
Individual pricing displayed
1. Signature Chocolate Chip Cookie - ₹150
2. Mango Pudding Cup - ₹250
3. Jamun Delight - ₹300
4. Red Velvet Cupcake - ₹180
5. Classic Pudding Cup - ₹220
6. Premium Chocolate Cupcake - ₹200

---

## 🎨 Design System

**Colors:**
```css
--primary: #6b1126    /* Burgundy */
--gold: #c9973a        /* Rich gold */
--gold-lt: #e8c06a     /* Light gold */
--cream: #faf6ee       /* Warm cream */
--bg: #f5f0e8          /* Off-white */
--text: #2a1a1a        /* Dark brown */
```

**Fonts:**
- Headings: Cormorant Garamond
- Body: Jost
- Loader: Abril Fatface

**Breakpoints:**
- Desktop: >768px
- Tablet: 769px-1024px
- Mobile: <768px

---

## ⚙️ Key Features

### index.html
✓ Single-page scroll
✓ Arc navigator (4 sections)
✓ Three.js hero + quote
✓ Counter animations
✓ 3D card tilt
✓ Reveal animations
✓ Cart badge sync

### menu.html
✓ Product browsing
✓ Category switching
✓ Quantity selector
✓ Add to cart
✓ Cart sidebar
✓ Item removal
✓ Total calculation
✓ URL parameters

### Shared
✓ Same nav/footer
✓ Same loader/portal
✓ Same cursor
✓ Same colors/fonts
✓ localStorage cart
✓ Responsive design

---

## 🚀 User Flows

**Flow 1: Browse → Shop → Cart**
```
index.html
  → Click category card
    → menu.html?category=X
      → Add items to cart
        → Cart sidebar opens
          → Review/remove items
            → Checkout
```

**Flow 2: Home → Menu → Back**
```
index.html
  → Click "Menu" nav
    → menu.html (landing)
      → Choose category
        → Browse products
          → Click "Back to Home"
            → index.html (cart badge shows count)
```

**Flow 3: Badge Sync**
```
menu.html (add 3 items)
  → Badge shows "3"
    → Navigate to index.html
      → Badge still shows "3"
        → Click badge
          → Returns to menu.html
            → Cart sidebar opens with 3 items
```

---

## 🐛 Troubleshooting

**Cart not syncing?**
- Check localStorage key: `alha_cart`
- Verify JSON format
- Check console for errors

**Badge not updating?**
- index.html syncs every 500ms
- Refresh if needed
- Check `updateCartBadge()` function

**Navigation not working?**
- Verify file paths
- Check href values
- Ensure files in same directory

**Cart sidebar not opening?**
- Check `.active` class on overlay/sidebar
- Verify event listeners attached
- Check z-index values

**Products not showing?**
- Verify URL parameter
- Check `showCategory()` function
- Inspect product data array

---

## 📝 Quick Edits

**Add a product:**
```javascript
// In menu.html products object
events: [
  { id: 'e7', name: 'New Product', image: 'new.png' }
]
```

**Change colors:**
```css
/* Update CSS variables in :root */
--primary: #6b1126;
```

**Update cart total:**
```javascript
// In renderCart() function
const total = cart.reduce((sum, item) => 
  sum + (item.subtotal || 0), 0
);
```

**Modify badge sync interval:**
```javascript
// Change 500ms to desired interval
setInterval(syncCartBadges, 500);
```

---

## ✅ Final Checklist

- [x] index.html single-page scroll working
- [x] menu.html category switching working
- [x] Cart add/remove working
- [x] Cart sidebar opening/closing
- [x] Badge syncing between pages
- [x] Navigation between pages smooth
- [x] URL parameters working
- [x] Back button returning home
- [x] Responsive on all devices
- [x] No console errors
- [x] localStorage persisting
- [x] All links functional

---

**Ready for deployment!** 🎉
