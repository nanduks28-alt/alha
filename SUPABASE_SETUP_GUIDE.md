# ALHA Food Website - Supabase Integration Setup Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Initial Setup](#initial-setup)
4. [Database Migration](#database-migration)
5. [Frontend Integration](#frontend-integration)
6. [Testing the Integration](#testing-the-integration)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## 🎯 Overview

This guide will help you complete the Supabase integration for the ALHA food website. The integration includes:

- **Shopping Cart**: Database-backed cart with localStorage fallback
- **Products Management**: Menu items for events and small quantity orders
- **Orders System**: Complete order creation and tracking
- **Journal/Blog**: Full CRUD operations for blog posts
- **Authentication Ready**: RLS policies prepared for future auth implementation

---

## 📦 Prerequisites

Before you begin, ensure you have:

1. ✅ A Supabase account (sign up at https://supabase.com)
2. ✅ A Supabase project created
3. ✅ Your Supabase project URL and anon key
4. ✅ A local web server to test (e.g., Live Server in VS Code)

---

## 🚀 Initial Setup

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://app.supabase.com
2. Click on your project
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** (e.g., `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public key** (starts with `eyJ...`)

### Step 2: Configure Environment Variables

1. In the root directory of your project, create a `.env` file:
   ```bash
   # Copy the example file
   cp .env.example .env
   ```

2. Open `.env` and add your credentials:
   ```env
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_anon_key_here
   ```

3. **Important**: The `.env` file is already in `.gitignore` to prevent committing credentials.

### Step 3: Add Supabase CDN Script

Add the Supabase JavaScript client to your HTML files. Add this line in the `<head>` section of both `index.html` and `menu.html`, **before** any other custom scripts:

```html
<!-- Supabase Client Library -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

<!-- Supabase Configuration -->
<script src="js/supabase-client.js"></script>

<!-- Service Files -->
<script src="js/products-service.js"></script>
<script src="js/cart-service.js"></script>
<script src="js/orders-service.js"></script>
<script src="js/journal-service.js"></script>
```

---

## 🗄️ Database Migration

### Step 1: Run the Migrations

You have two options to run the database migrations:

#### Option A: Using Supabase Dashboard (Recommended for beginners)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_row_level_security.sql`
   - `supabase/migrations/003_seed_data.sql`
5. Click **Run** for each migration

#### Option B: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-id

# Run migrations
supabase db push
```

### Step 2: Verify Database Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see the following tables:
   - ✅ `products`
   - ✅ `cart_items`
   - ✅ `orders`
   - ✅ `order_items`
   - ✅ `journal_posts`
   - ✅ `journal_categories`
   - ✅ `journal_tags`
   - ✅ `journal_post_tags`

3. Check that sample data was inserted:
   - Open the `products` table - should have ~10 sample products
   - Open the `journal_posts` table - should have ~6 sample posts

---

## 🎨 Frontend Integration

### Shopping Cart Integration

The cart system is already integrated and will work automatically once Supabase is configured. It features:

- **Automatic sync** between localStorage and Supabase
- **Fallback to localStorage** if Supabase is unavailable
- **Session-based carts** for anonymous users

**No code changes needed** - the existing cart functionality will automatically use Supabase when available.

### Journal/Blog Integration

To display journal posts from Supabase, you can use the journal service:

```javascript
// Example: Load and display journal posts
async function loadJournalPosts() {
    const { data: posts, error } = await journalService.getPosts({
        limit: 6
    });
    
    if (error) {
        console.error('Error loading posts:', error);
        return;
    }
    
    // Render posts in your UI
    posts.forEach(post => {
        console.log(post.title, post.excerpt);
    });
}

// Call when page loads
loadJournalPosts();
```

### Products Integration

To load products from Supabase instead of hardcoded data:

```javascript
// Example: Load products by category
async function loadProducts(category) {
    const { data: products, error } = await productsService.getProductsByCategory(category);
    
    if (error) {
        console.error('Error loading products:', error);
        return;
    }
    
    // Render products in your UI
    products.forEach(product => {
        console.log(product.name, product.price);
    });
}

// Load events products
loadProducts('events');

// Load small quantity products
loadProducts('small');
```

---

## 🧪 Testing the Integration

### Test 1: Verify Supabase Connection

1. Open your website in a browser
2. Open the browser console (F12)
3. You should see:
   ```
   ✅ Supabase client initialized successfully
   ✅ Supabase connection test successful
   ```

### Test 2: Test Cart Functionality

1. Add an item to the cart
2. Open Supabase dashboard → Table Editor → `cart_items`
3. You should see the cart item in the database
4. The item should also be in localStorage as a backup

### Test 3: Test Journal Posts

Open the browser console and run:

```javascript
// Test fetching posts
journalService.getPosts().then(result => {
    console.log('Posts:', result.data);
});

// Test fetching categories
journalService.getCategories().then(result => {
    console.log('Categories:', result.data);
});
```

### Test 4: Test Products

Open the browser console and run:

```javascript
// Test fetching products
productsService.getProducts().then(result => {
    console.log('Products:', result.data);
});
```

---

## 🔧 Troubleshooting

### Issue: "Supabase not configured" warnings

**Solution**: 
- Verify your `.env` file has the correct credentials
- Make sure you're serving the site via HTTP (not file://)
- Check browser console for specific error messages

### Issue: CORS errors

**Solution**:
- Supabase allows all origins by default for the anon key
- If you see CORS errors, check your Supabase project settings
- Ensure you're using the correct project URL

### Issue: "Table does not exist" errors

**Solution**:
- Run all three migration files in order
- Check the SQL Editor in Supabase for any error messages
- Verify tables exist in Table Editor

### Issue: Cart items not syncing

**Solution**:
- Check browser console for errors
- Verify RLS policies are enabled (they should be from migration)
- Try clearing localStorage and testing again

### Issue: Cannot insert/update data

**Solution**:
- RLS policies are enabled by default
- For testing, you can temporarily disable RLS on specific tables
- For production, set up authentication and admin roles

---

## 🎯 Next Steps

### 1. Set Up Authentication (Optional but Recommended)

To enable admin features and user accounts:

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable Email authentication or social providers
3. Create an admin user:
   ```sql
   -- Run in SQL Editor
   UPDATE auth.users 
   SET raw_user_meta_data = raw_user_meta_data || '{"user_role": "admin"}'::jsonb
   WHERE email = 'your-admin@email.com';
   ```

### 2. Customize RLS Policies

The current RLS policies allow:
- ✅ Anyone can view published content
- ✅ Anyone can add to cart and create orders
- ❌ Only admins can manage products and posts

To customize, edit `supabase/migrations/002_row_level_security.sql` and re-run.

### 3. Add Image Upload

To enable image uploads for products and blog posts:

1. In Supabase dashboard, go to **Storage**
2. Create buckets: `product-images` and `blog-images`
3. Set appropriate policies for public read access
4. Update your admin forms to use Supabase Storage

### 4. Set Up Real-time Subscriptions (Optional)

For real-time cart updates across devices:

```javascript
// Subscribe to cart changes
const subscription = supabaseClient
    .channel('cart-changes')
    .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'cart_items' },
        (payload) => {
            console.log('Cart updated:', payload);
            // Refresh cart UI
        }
    )
    .subscribe();
```

### 5. Implement Order Confirmation Emails

Use Supabase Edge Functions or a service like SendGrid to send order confirmation emails.

### 6. Add Analytics

Track user behavior and cart abandonment using Supabase's built-in analytics or integrate with Google Analytics.

---

## 📚 Additional Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Supabase JavaScript Client**: https://supabase.com/docs/reference/javascript
- **Row Level Security Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Supabase Storage**: https://supabase.com/docs/guides/storage

---

## 🆘 Support

If you encounter issues:

1. Check the browser console for error messages
2. Review the Supabase logs in your dashboard
3. Verify all migration files ran successfully
4. Ensure your `.env` file has correct credentials

---

## ✅ Checklist

Before going live, ensure:

- [ ] All migrations have been run successfully
- [ ] Sample data is visible in Supabase tables
- [ ] Supabase client initializes without errors
- [ ] Cart functionality works (add, update, remove items)
- [ ] Journal posts load from database
- [ ] Products load from database
- [ ] Orders can be created
- [ ] RLS policies are enabled
- [ ] `.env` file is in `.gitignore`
- [ ] Production credentials are secure

---

**Congratulations! Your Supabase integration is complete.** 🎉

The website now has a fully functional backend with database persistence, ready for production use.