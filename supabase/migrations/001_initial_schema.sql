-- =====================================================
-- ALHA Food Website - Initial Database Schema
-- =====================================================
-- This migration creates all the necessary tables for:
-- 1. Products (menu items)
-- 2. Shopping Cart
-- 3. Orders
-- 4. Journal/Blog Posts
-- 5. Categories and Tags
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
-- Stores all menu items (both events/bulk and small quantity)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('events', 'small')),
    price DECIMAL(10, 2), -- NULL for "price on request" items
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster category queries
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_available ON products(is_available);

-- =====================================================
-- CART ITEMS TABLE
-- =====================================================
-- Stores shopping cart items (can be session-based or user-based)
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255), -- For anonymous users
    user_id UUID, -- For authenticated users (future use)
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure either session_id or user_id is present
    CONSTRAINT cart_items_session_or_user CHECK (
        (session_id IS NOT NULL AND user_id IS NULL) OR
        (session_id IS NULL AND user_id IS NOT NULL)
    )
);

-- Indexes for cart queries
CREATE INDEX idx_cart_items_session ON cart_items(session_id);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
CREATE INDEX idx_cart_items_product ON cart_items(product_id);

-- Unique constraint: one product per session/user
CREATE UNIQUE INDEX idx_cart_items_unique_session_product 
    ON cart_items(session_id, product_id) 
    WHERE session_id IS NOT NULL;

CREATE UNIQUE INDEX idx_cart_items_unique_user_product 
    ON cart_items(user_id, product_id) 
    WHERE user_id IS NOT NULL;

-- =====================================================
-- ORDERS TABLE
-- =====================================================
-- Stores completed orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID, -- For authenticated users (future use)
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    delivery_address TEXT,
    order_notes TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled')
    ),
    total_amount DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for order queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =====================================================
-- ORDER ITEMS TABLE
-- =====================================================
-- Stores individual items within an order
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL, -- Snapshot of product name at time of order
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2), -- Snapshot of price at time of order
    subtotal DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for order items queries
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =====================================================
-- JOURNAL CATEGORIES TABLE
-- =====================================================
-- Stores blog/journal categories
CREATE TABLE IF NOT EXISTS journal_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JOURNAL POSTS TABLE
-- =====================================================
-- Stores blog/journal articles
CREATE TABLE IF NOT EXISTS journal_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image_url TEXT,
    author_name VARCHAR(255) DEFAULT 'ALHA Team',
    category_id UUID REFERENCES journal_categories(id) ON DELETE SET NULL,
    is_featured BOOLEAN DEFAULT false,
    is_published BOOLEAN DEFAULT false,
    read_time_minutes INTEGER DEFAULT 5,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for journal queries
CREATE INDEX idx_journal_posts_published ON journal_posts(is_published, published_at DESC);
CREATE INDEX idx_journal_posts_featured ON journal_posts(is_featured);
CREATE INDEX idx_journal_posts_category ON journal_posts(category_id);
CREATE INDEX idx_journal_posts_slug ON journal_posts(slug);

-- =====================================================
-- JOURNAL TAGS TABLE
-- =====================================================
-- Stores tags for journal posts
CREATE TABLE IF NOT EXISTS journal_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- JOURNAL POST TAGS (Junction Table)
-- =====================================================
-- Many-to-many relationship between posts and tags
CREATE TABLE IF NOT EXISTS journal_post_tags (
    post_id UUID NOT NULL REFERENCES journal_posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES journal_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (post_id, tag_id)
);

-- Indexes for tag queries
CREATE INDEX idx_journal_post_tags_post ON journal_post_tags(post_id);
CREATE INDEX idx_journal_post_tags_tag ON journal_post_tags(tag_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at
    BEFORE UPDATE ON cart_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_posts_updated_at
    BEFORE UPDATE ON journal_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := 'ALHA-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

-- Trigger to auto-generate order number
CREATE TRIGGER generate_order_number_trigger
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE products IS 'Stores all menu items including events/bulk orders and small quantity items';
COMMENT ON TABLE cart_items IS 'Stores shopping cart items for both anonymous and authenticated users';
COMMENT ON TABLE orders IS 'Stores completed customer orders';
COMMENT ON TABLE order_items IS 'Stores individual items within each order';
COMMENT ON TABLE journal_posts IS 'Stores blog/journal articles and posts';
COMMENT ON TABLE journal_categories IS 'Stores categories for organizing journal posts';
COMMENT ON TABLE journal_tags IS 'Stores tags for journal posts';
COMMENT ON TABLE journal_post_tags IS 'Junction table for many-to-many relationship between posts and tags';

-- Made with Bob
