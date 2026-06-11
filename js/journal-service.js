/**
 * Journal/Blog Service with Supabase Integration
 * ===============================================
 * This service manages journal posts, categories, and tags with Supabase backend.
 * 
 * Features:
 * - Fetch published posts with pagination
 * - Filter by category and tags
 * - CRUD operations for admin users
 * - Featured post management
 * - Search functionality
 */

class JournalService {
    constructor() {
        this.postsPerPage = 6;
    }

    /**
     * Get all published posts with optional filtering
     * @param {Object} options - Filter options
     * @param {string} options.category - Filter by category slug
     * @param {string} options.tag - Filter by tag slug
     * @param {boolean} options.featured - Get only featured posts
     * @param {number} options.limit - Limit number of results
     * @param {number} options.offset - Offset for pagination
     */
    async getPosts(options = {}) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                console.warn('Supabase client not available');
                return { data: [], error: 'Supabase not configured' };
            }

            let query = supabaseClient
                .from('journal_posts')
                .select(`
                    id,
                    title,
                    slug,
                    excerpt,
                    content,
                    featured_image_url,
                    author_name,
                    is_featured,
                    read_time_minutes,
                    published_at,
                    created_at,
                    journal_categories (
                        id,
                        name,
                        slug
                    ),
                    journal_post_tags (
                        journal_tags (
                            id,
                            name,
                            slug
                        )
                    )
                `)
                .eq('is_published', true)
                .order('published_at', { ascending: false });

            // Apply filters
            if (options.featured) {
                query = query.eq('is_featured', true);
            }

            if (options.category) {
                query = query.eq('journal_categories.slug', options.category);
            }

            // Apply pagination
            if (options.limit) {
                query = query.limit(options.limit);
            }
            if (options.offset) {
                query = query.range(options.offset, options.offset + (options.limit || this.postsPerPage) - 1);
            }

            const { data, error } = await query;

            if (error) {
                console.error('Error fetching posts:', error);
                return { data: [], error };
            }

            // Transform data to flatten tags
            const posts = data.map(post => ({
                ...post,
                category: post.journal_categories,
                tags: post.journal_post_tags?.map(pt => pt.journal_tags) || [],
                journal_categories: undefined,
                journal_post_tags: undefined
            }));

            return { data: posts, error: null };
        } catch (error) {
            console.error('Exception fetching posts:', error);
            return { data: [], error: error.message };
        }
    }

    /**
     * Get a single post by slug
     * @param {string} slug - Post slug
     */
    async getPostBySlug(slug) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('journal_posts')
                .select(`
                    id,
                    title,
                    slug,
                    excerpt,
                    content,
                    featured_image_url,
                    author_name,
                    is_featured,
                    read_time_minutes,
                    published_at,
                    created_at,
                    updated_at,
                    journal_categories (
                        id,
                        name,
                        slug
                    ),
                    journal_post_tags (
                        journal_tags (
                            id,
                            name,
                            slug
                        )
                    )
                `)
                .eq('slug', slug)
                .eq('is_published', true)
                .single();

            if (error) {
                console.error('Error fetching post:', error);
                return { data: null, error };
            }

            // Transform data
            const post = {
                ...data,
                category: data.journal_categories,
                tags: data.journal_post_tags?.map(pt => pt.journal_tags) || []
            };

            return { data: post, error: null };
        } catch (error) {
            console.error('Exception fetching post:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Get all categories
     */
    async getCategories() {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: [], error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('journal_categories')
                .select('*')
                .order('name');

            return { data: data || [], error };
        } catch (error) {
            console.error('Exception fetching categories:', error);
            return { data: [], error: error.message };
        }
    }

    /**
     * Get all tags
     */
    async getTags() {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: [], error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('journal_tags')
                .select('*')
                .order('name');

            return { data: data || [], error };
        } catch (error) {
            console.error('Exception fetching tags:', error);
            return { data: [], error: error.message };
        }
    }

    /**
     * Search posts by title or content
     * @param {string} searchTerm - Search term
     */
    async searchPosts(searchTerm) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: [], error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('journal_posts')
                .select(`
                    id,
                    title,
                    slug,
                    excerpt,
                    featured_image_url,
                    author_name,
                    read_time_minutes,
                    published_at,
                    journal_categories (
                        name,
                        slug
                    )
                `)
                .eq('is_published', true)
                .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`)
                .order('published_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('Error searching posts:', error);
                return { data: [], error };
            }

            return { data: data || [], error: null };
        } catch (error) {
            console.error('Exception searching posts:', error);
            return { data: [], error: error.message };
        }
    }

    // =====================================================
    // ADMIN FUNCTIONS (Require Authentication)
    // =====================================================

    /**
     * Create a new post (Admin only)
     * @param {Object} postData - Post data
     */
    async createPost(postData) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            // Generate slug from title if not provided
            if (!postData.slug) {
                postData.slug = this.generateSlug(postData.title);
            }

            const { data, error } = await supabaseClient
                .from('journal_posts')
                .insert([postData])
                .select()
                .single();

            if (error) {
                console.error('Error creating post:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception creating post:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Update an existing post (Admin only)
     * @param {string} postId - Post ID
     * @param {Object} updates - Fields to update
     */
    async updatePost(postId, updates) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { data, error } = await supabaseClient
                .from('journal_posts')
                .update(updates)
                .eq('id', postId)
                .select()
                .single();

            if (error) {
                console.error('Error updating post:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception updating post:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Delete a post (Admin only)
     * @param {string} postId - Post ID
     */
    async deletePost(postId) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const { error } = await supabaseClient
                .from('journal_posts')
                .delete()
                .eq('id', postId);

            if (error) {
                console.error('Error deleting post:', error);
                return { data: null, error };
            }

            return { data: { success: true }, error: null };
        } catch (error) {
            console.error('Exception deleting post:', error);
            return { data: null, error: error.message };
        }
    }

    /**
     * Add tags to a post (Admin only)
     * @param {string} postId - Post ID
     * @param {Array<string>} tagIds - Array of tag IDs
     */
    async addTagsToPost(postId, tagIds) {
        try {
            if (!supabaseClient || typeof supabaseClient.from !== 'function') {
                return { data: null, error: 'Supabase not configured' };
            }

            const postTags = tagIds.map(tagId => ({
                post_id: postId,
                tag_id: tagId
            }));

            const { data, error } = await supabaseClient
                .from('journal_post_tags')
                .insert(postTags);

            if (error) {
                console.error('Error adding tags to post:', error);
                return { data: null, error };
            }

            return { data, error: null };
        } catch (error) {
            console.error('Exception adding tags to post:', error);
            return { data: null, error: error.message };
        }
    }

    // =====================================================
    // UTILITY FUNCTIONS
    // =====================================================

    /**
     * Generate URL-friendly slug from title
     * @param {string} title - Post title
     */
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
            .trim();
    }

    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Calculate estimated read time
     * @param {string} content - Post content
     */
    calculateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.trim().split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }
}

// Create global instance
const journalService = new JournalService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { JournalService, journalService };
}

// Made with Bob
