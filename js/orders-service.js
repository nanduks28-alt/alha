/**
 * Orders Service with Supabase Integration
 * =========================================
 * This service manages order creation and management with Supabase backend.
 * 
 * Features:
 * - Create orders from cart
 * - Track order status
 * - Order history for users
 * - Admin order management
 */

class OrdersService {
    constructor() {
        this.orderStatuses = {
            PENDING: 'pending',
            CONFIRMED: 'confirmed',
            PREPARING: 'preparing',
            READY: 'ready',
            DELIVERED: 'delivered',
            CANCELLED: 'cancelled'
        };
    }

    /**
     * Create a new order from cart
     * @param {Object} orderData - Order information
     * @param {string} orderData.customerName - Customer name
     * @param {string} orderData.customerEmail - Customer email
     * @param {string} orderData.customerPhone - Customer phone
     * @param {string} orderData.deliveryAddress - Delivery address (optional)
     * @param {string} orderData.orderNotes - Order notes (optional)
     * @param {Array} cartItems - Array of cart items
     */
    async createOrder(orderData, cartItems) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => {
                return sum + (item.subtotal || 0);
            }, 0);

            // Create order
            const { data: order, error: orderError } = await supabaseClient
                .from('orders')
                .insert([{
                    customer_name: orderData.customerName,
                    customer_email: orderData.customerEmail,
                    customer_phone: orderData.customerPhone,
                    delivery_address: orderData.deliveryAddress || null,
                    order_notes: orderData.orderNotes || null,
                    total_amount: totalAmount > 0 ? totalAmount : null,
                    status: this.orderStatuses.PENDING
                }])
                .select()
                .single();

            if (orderError) {
                console.error('Error creating order:', orderError);
                return { data: null, error: orderError };
            }

            // Create order items
            const orderItems = cartItems.map(item => ({
                order_id: order.id,
                product_id: item.id,
                product_name: item.name,
                quantity: item.quantity,
                unit_price: item.price || null,
                subtotal: item.subtotal || null
            }));

            const { error: itemsError } = await supabaseClient
                .from('order_items')
                .insert(orderItems);

            if (itemsError) {
                console.error('Error creating order items:', itemsError);
                // Rollback: delete the order
                await supabaseClient.from('orders').delete().eq('id', order.id);
                return { data: null, error: itemsError };
            }

            // Clear the cart after successful order
            if (cartService) {
                await cartService.clearCart();
            }

            return { data: order, error: null };
        } catch (error) {
            console.error('Exception creating order:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Get order by ID
     * @param {string} orderId - Order ID
     */
    async getOrderById(orderId) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('orders')
                .select(`
                    *,
                    order_items (
                        id,
                        product_name,
                        quantity,
                        unit_price,
                        subtotal,
                        products (
                            id,
                            name,
                            image_url,
                            category
                        )
                    )
                `)
                .eq('id', orderId)
                .single();

            if (error) {
                console.error('Error fetching order:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception fetching order:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Get order by order number
     * @param {string} orderNumber - Order number (e.g., ALHA-20260611-0001)
     */
    async getOrderByNumber(orderNumber) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('orders')
                .select(`
                    *,
                    order_items (
                        id,
                        product_name,
                        quantity,
                        unit_price,
                        subtotal,
                        products (
                            id,
                            name,
                            image_url,
                            category
                        )
                    )
                `)
                .eq('order_number', orderNumber)
                .single();

            if (error) {
                console.error('Error fetching order:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception fetching order:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Get orders by customer email
     * @param {string} email - Customer email
     */
    async getOrdersByEmail(email) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: [], error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('orders')
                .select('*')
                .eq('customer_email', email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching orders:', error);
                return { data: [], error };
            }

            return { data: data || [], error: null };
        } catch (error) {
            console.error('Exception fetching orders:', error);
            return { data: [], error: error.message };
        }
    }

    // =====================================================
    // ADMIN FUNCTIONS (Require Authentication)
    // =====================================================

    /**
     * Get all orders with optional filtering (Admin only)
     * @param {Object} options - Filter options
     * @param {string} options.status - Filter by status
     * @param {number} options.limit - Limit number of results
     * @param {number} options.offset - Offset for pagination
     */
    async getAllOrders(options = {}) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: [], error: 'Supabase not configured' };
            }

            let query = supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            if (options.status) {
                query = query.eq('status', options.status);
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching all orders:', error);
                return { data: [], error };
            }

            return { data: data || [], error: null };
        } catch (error) {
            console.error('Exception fetching all orders:', error);
            return { data: [], error: error.message };
        }
    }

    /**
     * Update order status (Admin only)
     * @param {string} orderId - Order ID
     * @param {string} status - New status
     */
    async updateOrderStatus(orderId, status) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            // Validate status
            if (!Object.values(this.orderStatuses).includes(status)) {
                return { data: null, error: 'Invalid order status' };
            }

            const { data, error } = await supabaseClient
                .from('orders')
                .update({ status })
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                console.error('Error updating order status:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception updating order status:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Update order details (Admin only)
     * @param {string} orderId - Order ID
     * @param {Object} updates - Fields to update
     */
    async updateOrder(orderId, updates) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('orders')
                .update(updates)
                .eq('id', orderId)
                .select()
                .single();

            if (error) {
                console.error('Error updating order:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception updating order:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Delete an order (Admin only)
     * @param {string} orderId - Order ID
     */
    async deleteOrder(orderId) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { error } = await supabaseClient
                .from('orders')
                .delete()
                .eq('id', orderId);

            if (error) {
                console.error('Error deleting order:', error);
                return { data: null, error };
            }

            return { data: { success: true }, error: null };
        } catch (error) {
            console.error('Exception deleting order:', error);
            return { data: null, error: error.message };
        }
    }

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    /**
     * Format order status for display
     * @param {string} status - Order status
     */
    formatStatus(status) {
        const statusMap = {
            pending: 'Pending',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            ready: 'Ready for Pickup/Delivery',
            delivered: 'Delivered',
            cancelled: 'Cancelled'
        };
        return statusMap[status] || status;
    }

    /**
     * Get status color for UI
     * @param {string} status - Order status
     */
    getStatusColor(status) {
        const colorMap = {
            pending: '#f59e0b',
            confirmed: '#3b82f6',
            preparing: '#8b5cf6',
            ready: '#10b981',
            delivered: '#059669',
            cancelled: '#ef4444'
        };
        return colorMap[status] || '#6b7280';
    }

    /**
     * Validate order data before submission
     * @param {Object} orderData - Order data to validate
     */
    validateOrderData(orderData) {
        const errors = [];

        if (!orderData.customerName || orderData.customerName.trim().length < 2) {
            errors.push('Customer name is required (minimum 2 characters)');
        }

        if (!orderData.customerEmail || !this.isValidEmail(orderData.customerEmail)) {
            errors.push('Valid email address is required');
        }

        if (!orderData.customerPhone || orderData.customerPhone.trim().length < 10) {
            errors.push('Valid phone number is required (minimum 10 digits)');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Create global instance
const ordersService = new OrdersService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OrdersService, ordersService };
}

// Made with Bob
