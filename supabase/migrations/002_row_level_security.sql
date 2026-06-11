-- =====================================================
-- ALHA Food Website - Row Level Security (RLS) Policies
-- =====================================================
-- This migration sets up Row Level Security policies for all tables.
-- These policies control who can read, insert, update, and delete data.
-- 
-- IMPORTANT: These policies are designed to work with Supabase Auth.
-- Until authentication is fully implemented, some operations may be restricted.
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_post_tags ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

-- Anyone can view available products (public read access)
CREATE POLICY "Anyone can view available products"
    ON products FOR SELECT
    USING (is_available = true);

-- Authenticated users with admin role can manage products
-- NOTE: This will work once you set up authentication and user roles
CREATE POLICY "Admins can insert products"
    ON products FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

CREATE POLICY "Admins can update products"
    ON products FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

CREATE POLICY "Admins can delete products"
    ON products FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- =====================================================
-- CART ITEMS POLICIES
-- =====================================================

-- Users can view their own cart items (by session_id or user_id)
CREATE POLICY "Users can view their own cart items"
    ON cart_items FOR SELECT
    USING (
        session_id = current_setting('app.session_id', true) OR
        user_id = auth.uid()
    );

-- Users can insert items to their own cart
CREATE POLICY "Users can add items to their cart"
    ON cart_items FOR INSERT
    WITH CHECK (
        session_id = current_setting('app.session_id', true) OR
        user_id = auth.uid()
    );

-- Users can update their own cart items
CREATE POLICY "Users can update their cart items"
    ON cart_items FOR UPDATE
    USING (
        session_id = current_setting('app.session_id', true) OR
        user_id = auth.uid()
    );

-- Users can delete their own cart items
CREATE POLICY "Users can delete their cart items"
    ON cart_items FOR DELETE
    USING (
        session_id = current_setting('app.session_id', true) OR
        user_id = auth.uid()
    );

-- =====================================================
-- ORDERS POLICIES
-- =====================================================

-- Users can view their own orders
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (
        user_id = auth.uid() OR
        customer_email = auth.jwt() ->> 'email'
    );

-- Anyone can create an order (for guest checkout)
CREATE POLICY "Anyone can create orders"
    ON orders FOR INSERT
    WITH CHECK (true);

-- Admins can view all orders
CREATE POLICY "Admins can view all orders"
    ON orders FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Admins can update orders
CREATE POLICY "Admins can update orders"
    ON orders FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- =====================================================
-- ORDER ITEMS POLICIES
-- =====================================================

-- Users can view items from their own orders
CREATE POLICY "Users can view their order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_items.order_id
            AND (orders.user_id = auth.uid() OR orders.customer_email = auth.jwt() ->> 'email')
        )
    );

-- Anyone can insert order items (during checkout)
CREATE POLICY "Anyone can create order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

-- Admins can view all order items
CREATE POLICY "Admins can view all order items"
    ON order_items FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- =====================================================
-- JOURNAL POSTS POLICIES
-- =====================================================

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts"
    ON journal_posts FOR SELECT
    USING (is_published = true);

-- Admins can view all posts (including drafts)
CREATE POLICY "Admins can view all posts"
    ON journal_posts FOR SELECT
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Admins can create posts
CREATE POLICY "Admins can create posts"
    ON journal_posts FOR INSERT
    WITH CHECK (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Admins can update posts
CREATE POLICY "Admins can update posts"
    ON journal_posts FOR UPDATE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- Admins can delete posts
CREATE POLICY "Admins can delete posts"
    ON journal_posts FOR DELETE
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- =====================================================
-- JOURNAL CATEGORIES POLICIES
-- =====================================================

-- Anyone can view categories
CREATE POLICY "Anyone can view categories"
    ON journal_categories FOR SELECT
    USING (true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories"
    ON journal_categories FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- =====================================================
-- JOURNAL TAGS POLICIES
-- =====================================================

-- Anyone can view tags
CREATE POLICY "Anyone can view tags"
    ON journal_tags FOR SELECT
    USING (true);

-- Admins can manage tags
CREATE POLICY "Admins can manage tags"
    ON journal_tags FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- =====================================================
-- JOURNAL POST TAGS POLICIES
-- =====================================================

-- Anyone can view post-tag relationships
CREATE POLICY "Anyone can view post tags"
    ON journal_post_tags FOR SELECT
    USING (true);

-- Admins can manage post-tag relationships
CREATE POLICY "Admins can manage post tags"
    ON journal_post_tags FOR ALL
    USING (
        auth.jwt() ->> 'role' = 'admin' OR
        auth.jwt() ->> 'user_role' = 'admin'
    );

-- =====================================================
-- HELPER FUNCTIONS FOR SESSION-BASED CART
-- =====================================================

-- Function to set session ID for anonymous users
-- This should be called from your application before cart operations
CREATE OR REPLACE FUNCTION set_session_id(session_id TEXT)
RETURNS void AS $$
BEGIN
    PERFORM set_config('app.session_id', session_id, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- NOTES FOR FUTURE AUTHENTICATION SETUP
-- =====================================================

-- When you're ready to implement authentication:
-- 
-- 1. Set up Supabase Auth in your project
-- 2. Create a user_roles table or add a role column to auth.users metadata
-- 3. Update the admin policies to check against your actual role system
-- 4. Consider adding more granular permissions (e.g., editor, viewer roles)
-- 
-- Example user metadata structure:
-- {
--   "role": "admin",
--   "user_role": "admin",
--   "permissions": ["manage_products", "manage_orders", "manage_posts"]
-- }
-- 
-- To set user metadata in Supabase:
-- UPDATE auth.users 
-- SET raw_user_meta_data = raw_user_meta_data || '{"user_role": "admin"}'::jsonb
-- WHERE email = 'admin@alha.in';

-- Made with Bob
