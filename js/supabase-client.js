/**
 * Supabase Client Configuration
 * =============================
 * This file initializes the Supabase client for the ALHA food website.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create a .env file in the root directory (copy from .env.example)
 * 2. Add your Supabase URL and anon key to the .env file
 * 3. Include this script in your HTML files before other Supabase-dependent scripts
 * 
 * USAGE:
 * The supabaseClient object will be available globally and can be used
 * throughout your application to interact with Supabase.
 */

// Environment configuration loader
// This function reads environment variables from a .env file
// In production, you might want to use a build tool to inject these values
const loadEnvConfig = async () => {
  try {
    // Try to fetch .env file (works if served via HTTP server)
    const response = await fetch('/.env');
    if (response.ok) {
      const text = await response.text();
      const config = {};
      text.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            config[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
      return config;
    }
  } catch (error) {
    console.warn('Could not load .env file via fetch. Using inline configuration.');
  }
  
  // Fallback: Return empty config (will use inline values below)
  return {};
};

// Initialize Supabase client
let supabaseClient = null;

(async function initSupabase() {
  // Load environment configuration
  const envConfig = await loadEnvConfig();
  
  // Get Supabase credentials from environment or use placeholders
  // IMPORTANT: Replace these with your actual credentials in the .env file
  let SUPABASE_URL = envConfig.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
  const SUPABASE_ANON_KEY = envConfig.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';
  
  // Clean up URL - remove trailing slashes and /rest/v1/ if present
  if (SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
    SUPABASE_URL = SUPABASE_URL.replace(/\/rest\/v1\/?$/, '').replace(/\/$/, '');
  }
  
  // Validate configuration
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    console.error('⚠️ SUPABASE CONFIGURATION MISSING ⚠️');
    console.error('Please follow these steps:');
    console.error('1. Copy .env.example to .env');
    console.error('2. Add your Supabase URL and anon key to .env');
    console.error('3. Reload the page');
    console.error('');
    console.error('Get your credentials from: https://app.supabase.com/project/_/settings/api');
    
    // Create a mock client that logs warnings
    supabaseClient = createMockClient();
    return;
  }
  
  // Initialize the real Supabase client
  try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    
    console.log('✅ Supabase client initialized successfully');
    
    // Test connection
    const { data, error } = await supabaseClient.from('journal_posts').select('count', { count: 'exact', head: true });
    if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist yet
      console.warn('⚠️ Supabase connection test failed:', error.message);
      console.warn('Make sure you have run the database migrations.');
    } else {
      console.log('✅ Supabase connection test successful');
    }
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    supabaseClient = createMockClient();
  }
})();

// Mock client for development when credentials are not configured
function createMockClient() {
  const mockWarning = (operation) => {
    console.warn(`⚠️ Supabase ${operation} called but client is not configured. Please add your credentials to .env file.`);
    return Promise.resolve({ data: null, error: { message: 'Supabase not configured' } });
  };
  
  return {
    from: (table) => ({
      select: () => mockWarning('SELECT'),
      insert: () => mockWarning('INSERT'),
      update: () => mockWarning('UPDATE'),
      delete: () => mockWarning('DELETE'),
      upsert: () => mockWarning('UPSERT')
    }),
    auth: {
      signIn: () => mockWarning('SIGN_IN'),
      signOut: () => mockWarning('SIGN_OUT'),
      signUp: () => mockWarning('SIGN_UP'),
      getSession: () => mockWarning('GET_SESSION')
    },
    storage: {
      from: () => ({
        upload: () => mockWarning('UPLOAD'),
        download: () => mockWarning('DOWNLOAD')
      })
    }
  };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabaseClient };
}

// Made with Bob
