/**
 * Products Service with Supabase Integration
 * ===========================================
 * This service manages product data from Supabase.
 * 
 * Features:
 * - Fetch products by category
 * - Product search
 * - CRUD operations for admin users
 */

class ProductsService {
    constructor() {
        this.categories = {
            EVENTS: 'events',
            SMALL: 'small'
        };
    }

    /**
     * Get all products with optional filtering
     * @param {Object} options - Filter options
     * @param {string} options.category - Filter by category ('events' or 'small')
     * @param {boolean} options.availableOnly - Get only available products
     */
    async getProducts(options = {}) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                console.warn('Supabase client not available, returning empty array');
                return { data: [], error: 'Supabase not configured' };
            }

            let query = supabaseClient
                .from('products')
                .select('*')
                .order('name');

            // Apply filters
            if (options.category) {
                query = query.eq('category', options.category);
            }

            if (options.availableOnly !== false) {
                query = query.eq('is_available', true);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching products:', error);
                return { data: [], error };
            }

            return { data: data || [], error: null };
        } catch (error) {
            console.error('Exception fetching products:', error);
            return { data: [], error: error.message };
        }
    }

    /**
     * Get a single product by ID
     * @param {string} productId - Product ID
     */
    async getProductById(productId) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('id', productId)
                .single();

            if (error) {
                console.error('Error fetching product:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception fetching product:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Get products by category
     * @param {string} category - Category ('events' or 'small')
     */
    async getProductsByCategory(category) {
        return await this.getProducts({ category, availableOnly: true });
    }

    /**
     * Search products by name or description
     * @param {string} searchTerm - Search term
     */
    async searchProducts(searchTerm) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: [], error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('products')
                .select('*')
                .eq('is_available', true)
                .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
                .order('name')
                .limit(20);

            if (error) {
                console.error('Error searching products:', error);
                return { data: [], error };
            }

            return { data: data || [], error: null };
        } catch (error) {
            console.error('Exception searching products:', error);
            return { data: [], error: error.message };
        }
    }

    // =====================================================
    // ADMIN FUNCTIONS (Require Authentication)
    // =====================================================

    /**
     * Create a new product (Admin only)
     * @param {Object} productData - Product data
     */
    async createProduct(productData) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('products')
                .insert([productData])
                .select()
                .single();

            if (error) {
                console.error('Error creating product:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception creating product:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Update an existing product (Admin only)
     * @param {string} productId - Product ID
     * @param {Object} updates - Fields to update
     */
    async updateProduct(productId, updates) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('products')
                .update(updates)
                .eq('id', productId)
                .select()
                .single();

            if (error) {
                console.error('Error updating product:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception updating product:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Delete a product (Admin only)
     * @param {string} productId - Product ID
     */
    async deleteProduct(productId) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { error } = await supabaseClient
                .from('products')
                .delete()
                .eq('id', productId);

            if (error) {
                console.error('Error deleting product:', error);
                return { data: null, error };
            }

            return { data: { success: true }, error: null };
        } catch (error) {
            console.error('Exception deleting product:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Toggle product availability (Admin only)
     * @param {string} productId - Product ID
     * @param {boolean} isAvailable - Availability status
     */
    async toggleAvailability(productId, isAvailable) {
        return await this.updateProduct(productId, { is_available: isAvailable });
    }

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    /**
     * Format price for display
     * @param {number} price - Price value
     */
    formatPrice(price) {
        if (price === null || price === undefined) {
            return 'Price on request';
        }
        return `₹${price.toFixed(2)}`;
    }

    /**
     * Check if product has price
     * @param {Object} product - Product object
     */
    hasPrice(product) {
        return product.price !== null && product.price !== undefined;
    }
}

// Create global instance
const productsService = new ProductsService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ProductsService, productsService };
}

// Made with Bob
