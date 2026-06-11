/**
 * Shopping Cart Service with Supabase Integration
 * ================================================
 * This service manages the shopping cart functionality with Supabase backend.
 * It maintains backward compatibility with localStorage while adding database persistence.
 * 
 * Features:
 * - Session-based cart for anonymous users
 * - Automatic sync between localStorage and Supabase
 * - Fallback to localStorage if Supabase is unavailable
 * - Cart migration when user logs in (future feature)
 */

class CartService {
    constructor() {
        this.STORAGE_KEY = 'alha_cart';
        this.SESSION_KEY = 'alha_session_id';
        this.sessionId = this.getOrCreateSessionId();
        this.syncInProgress = false;
    }

    /**
     * Get or create a unique session ID for anonymous users
     */
    getOrCreateSessionId() {
        let sessionId = localStorage.getItem(this.SESSION_KEY);
        if (!sessionId) {
            sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem(this.SESSION_KEY, sessionId);
        }
        return sessionId;
    }

    /**
     * Get all cart items
     * Tries Supabase first, falls back to localStorage
     */
    async getCart() {
        try {
            // Try to get from Supabase
            if (supabaseClient && typeof supabaseClient.from === 'function') {
                const { data, error } = await supabaseClient
                    .from('cart_items')
                    .select(`
                        id,
                        quantity,
                        created_at,
                        products (
                            id,
                            name,
                            description,
                            category,
                            price,
                            image_url
                        )
                    `)
                    .eq('session_id', this.sessionId);

                if (!error && data) {
                    // Transform Supabase data to match localStorage format
                    const cart = data.map(item => ({
                        id: item.products.id,
                        name: item.products.name,
                        image: item.products.image_url,
                        quantity: item.quantity,
                        type: item.products.category,
                        price: item.products.price,
                        subtotal: item.products.price ? item.quantity * item.products.price : null,
                        cartItemId: item.id // Store the cart_items table ID for updates
                    }));

                    // Sync to localStorage
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
                    return cart;
                }
            }
        } catch (error) {
            console.warn('Failed to fetch cart from Supabase, using localStorage:', error);
        }

        // Fallback to localStorage
        return this.getLocalCart();
    }

    /**
     * Get cart from localStorage only
     */
    getLocalCart() {
        try {
            const cart = localStorage.getItem(this.STORAGE_KEY);
            return cart ? JSON.parse(cart) : [];
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return [];
        }
    }

    /**
     * Add item to cart
     */
    async addToCart(productId, quantity = 1, productData = null) {
        try {
            // If we have Supabase client, add to database
            if (supabaseClient && typeof supabaseClient.from === 'function') {
                // Check if item already exists in cart
                const { data: existing } = await supabaseClient
                    .from('cart_items')
                    .select('id, quantity')
                    .eq('session_id', this.sessionId)
                    .eq('product_id', productId)
                    .single();

                if (existing) {
                    // Update quantity
                    const { error } = await supabaseClient
                        .from('cart_items')
                        .update({ quantity: existing.quantity + quantity })
                        .eq('id', existing.id);

                    if (error) throw error;
                } else {
                    // Insert new item
                    const { error } = await supabaseClient
                        .from('cart_items')
                        .insert({
                            session_id: this.sessionId,
                            product_id: productId,
                            quantity: quantity
                        });

                    if (error) throw error;
                }

                // Refresh cart from database
                return await this.getCart();
            }
        } catch (error) {
            console.warn('Failed to add to Supabase cart, using localStorage:', error);
        }

        // Fallback to localStorage
        return this.addToLocalCart(productId, quantity, productData);
    }

    /**
     * Add item to localStorage cart
     */
    addToLocalCart(productId, quantity, productData) {
        const cart = this.getLocalCart();
        const existingIndex = cart.findIndex(item => item.id === productId);

        if (existingIndex >= 0) {
            cart[existingIndex].quantity += quantity;
            if (cart[existingIndex].price) {
                cart[existingIndex].subtotal = cart[existingIndex].quantity * cart[existingIndex].price;
            }
        } else if (productData) {
            cart.push({
                id: productId,
                name: productData.name,
                image: productData.image,
                quantity: quantity,
                type: productData.type,
                price: productData.price,
                subtotal: productData.price ? quantity * productData.price : null
            });
        }

        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        return cart;
    }

    /**
     * Update item quantity
     */
    async updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            return await this.removeFromCart(productId);
        }

        try {
            if (supabaseClient && typeof supabaseClient.from === 'function') {
                const { error } = await supabaseClient
                    .from('cart_items')
                    .update({ quantity })
                    .eq('session_id', this.sessionId)
                    .eq('product_id', productId);

                if (!error) {
                    return await this.getCart();
                }
            }
        } catch (error) {
            console.warn('Failed to update quantity in Supabase:', error);
        }

        // Fallback to localStorage
        const cart = this.getLocalCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (item.price) {
                item.subtotal = item.quantity * item.price;
            }
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        }
        return cart;
    }

    /**
     * Remove item from cart
     */
    async removeFromCart(productId) {
        try {
            if (supabaseClient && typeof supabaseClient.from === 'function') {
                const { error } = await supabaseClient
                    .from('cart_items')
                    .delete()
                    .eq('session_id', this.sessionId)
                    .eq('product_id', productId);

                if (!error) {
                    return await this.getCart();
                }
            }
        } catch (error) {
            console.warn('Failed to remove from Supabase cart:', error);
        }

        // Fallback to localStorage
        const cart = this.getLocalCart();
        const filtered = cart.filter(item => item.id !== productId);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
        return filtered;
    }

    /**
     * Clear entire cart
     */
    async clearCart() {
        try {
            if (supabaseClient && typeof supabaseClient.from === 'function') {
                const { error } = await supabaseClient
                    .from('cart_items')
                    .delete()
                    .eq('session_id', this.sessionId);

                if (!error) {
                    localStorage.removeItem(this.STORAGE_KEY);
                    return [];
                }
            }
        } catch (error) {
            console.warn('Failed to clear Supabase cart:', error);
        }

        // Fallback to localStorage
        localStorage.removeItem(this.STORAGE_KEY);
        return [];
    }

    /**
     * Get cart item count
     */
    async getCartCount() {
        const cart = await this.getCart();
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }

    /**
     * Get cart total (only for items with prices)
     */
    async getCartTotal() {
        const cart = await this.getCart();
        return cart.reduce((sum, item) => sum + (item.subtotal || 0), 0);
    }

    /**
     * Sync localStorage cart to Supabase
     * Useful for migrating existing carts when Supabase is first set up
     */
    async syncLocalCartToSupabase() {
        if (this.syncInProgress) return;
        this.syncInProgress = true;

        try {
            const localCart = this.getLocalCart();
            if (localCart.length === 0) {
                this.syncInProgress = false;
                return;
            }

            if (supabaseClient && typeof supabaseClient.from === 'function') {
                // Clear existing Supabase cart for this session
                await supabaseClient
                    .from('cart_items')
                    .delete()
                    .eq('session_id', this.sessionId);

                // Insert all items from localStorage
                const itemsToInsert = localCart.map(item => ({
                    session_id: this.sessionId,
                    product_id: item.id,
                    quantity: item.quantity
                }));

                const { error } = await supabaseClient
                    .from('cart_items')
                    .insert(itemsToInsert);

                if (error) {
                    console.error('Failed to sync cart to Supabase:', error);
                } else {
                    console.log('✅ Cart synced to Supabase successfully');
                }
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        } finally {
            this.syncInProgress = false;
        }
    }
}

// Create global instance
const cartService = new CartService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CartService, cartService };
}

// Made with Bob
