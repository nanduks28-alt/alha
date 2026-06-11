# HTML Integration Instructions

## 🎯 Quick Guide: Adding Supabase to Your HTML Files

Follow these simple steps to integrate Supabase into your existing HTML files.

---

## 📝 Step-by-Step Instructions

### Step 1: Add Supabase CDN Script

Add this script tag in the `<head>` section of both `index.html` and `menu.html`, **after** the existing Three.js script but **before** the closing `</head>` tag:

```html
<!-- Existing Three.js script -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>

<!-- ADD THIS: Supabase Client Library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

### Step 2: Add Service Scripts

Add these script tags **before** the closing `</body>` tag in both `index.html` and `menu.html`, **before** your existing inline scripts:

```html
<!-- ADD THESE: Supabase Services -->
<script src="js/supabase-client.js"></script>
<script src="js/products-service.js"></script>
<script src="js/cart-service.js"></script>
<script src="js/orders-service.js"></script>
<script src="js/journal-service.js"></script>

<!-- Your existing inline scripts will be here -->
<script>
  // Existing code...
</script>

</body>
</html>
```

---

## 📄 Complete Example for index.html

Here's where to add the scripts in `index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond..." rel="stylesheet" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
  
  <!-- Existing Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  
  <!-- ✅ ADD THIS: Supabase Client -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <style>
    /* Your existing styles */
  </style>
</head>
<body>
  
  <!-- Your existing HTML content -->
  
  <!-- ✅ ADD THESE: Supabase Services (before existing scripts) -->
  <script src="js/supabase-client.js"></script>
  <script src="js/products-service.js"></script>
  <script src="js/cart-service.js"></script>
  <script src="js/orders-service.js"></script>
  <script src="js/journal-service.js"></script>
  
  <!-- Your existing inline scripts -->
  <script>
    // Existing JavaScript code...
  </script>
  
</body>
</html>
```

---

## 📄 Complete Example for menu.html

Same structure for `menu.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond..." rel="stylesheet" />
  
  <!-- Existing Three.js -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
  
  <!-- ✅ ADD THIS: Supabase Client -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
  
  <style>
    /* Your existing styles */
  </style>
</head>
<body>
  
  <!-- Your existing HTML content -->
  
  <!-- ✅ ADD THESE: Supabase Services (before existing scripts) -->
  <script src="js/supabase-client.js"></script>
  <script src="js/products-service.js"></script>
  <script src="js/cart-service.js"></script>
  <script src="js/orders-service.js"></script>
  <script src="js/journal-service.js"></script>
  
  <!-- Your existing inline scripts -->
  <script>
    // Existing JavaScript code...
  </script>
  
</body>
</html>
```

---

## ⚠️ Important Notes

### Script Order Matters!

The scripts must be loaded in this order:

1. **Supabase CDN** (in `<head>`)
2. **supabase-client.js** (initializes the client)
3. **Service files** (depend on supabase-client)
4. **Your existing scripts** (can now use the services)

### Why This Order?

- The Supabase CDN provides the `supabase` global object
- `supabase-client.js` creates the `supabaseClient` instance
- Service files use `supabaseClient` to interact with the database
- Your existing code can now use the service objects

---

## ✅ Verification

After adding the scripts, open your website and check the browser console (F12). You should see:

```
✅ Supabase client initialized successfully
✅ Supabase connection test successful
```

If you see warnings about "Supabase not configured", that's normal - it means you need to add your credentials to the `.env` file.

---

## 🔄 No Code Changes Needed

**Good news**: You don't need to modify your existing JavaScript code! The services are designed to work alongside your current implementation:

- **Cart functions** will automatically use Supabase when available
- **Existing localStorage** cart continues to work as a fallback
- **No breaking changes** to your current functionality

---

## 🎨 Optional: Using the Services

If you want to explicitly use the Supabase services in your code, here are some examples:

### Load Products from Database

```javascript
// In your existing menu.html script
async function loadProductsFromSupabase() {
    const { data: eventsProducts } = await productsService.getProductsByCategory('events');
    const { data: smallProducts } = await productsService.getProductsByCategory('small');
    
    // Use the products to populate your UI
    console.log('Events products:', eventsProducts);
    console.log('Small products:', smallProducts);
}

// Call when page loads
loadProductsFromSupabase();
```

### Load Journal Posts

```javascript
// In your existing index.html script
async function loadJournalPosts() {
    const { data: posts } = await journalService.getPosts({ limit: 6 });
    
    // Use the posts to populate your blog section
    console.log('Journal posts:', posts);
}

// Call when page loads
loadJournalPosts();
```

### Enhanced Cart with Supabase

```javascript
// Your existing addToCart function can stay the same!
// The cartService will automatically sync to Supabase

// Or use the service directly:
async function addItemToCart(productId, quantity) {
    const product = await productsService.getProductById(productId);
    await cartService.addToCart(productId, quantity, product.data);
    
    // Update UI
    updateCartBadge();
}
```

---

## 🚀 Next Steps

1. ✅ Add the script tags as shown above
2. ✅ Create your `.env` file with Supabase credentials
3. ✅ Run the database migrations
4. ✅ Test the integration
5. ✅ Optionally update your code to use the services

---

## 📚 Need Help?

- See `SUPABASE_SETUP_GUIDE.md` for complete setup instructions
- See `INTEGRATION_SUMMARY.md` for feature overview
- Check browser console for error messages
- Verify script paths are correct

---

**That's it!** Just add these script tags and you're ready to go. 🎉