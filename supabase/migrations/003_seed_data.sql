-- =====================================================
-- ALHA Food Website - Seed Data
-- =====================================================
-- This migration populates the database with initial sample data
-- for testing and development purposes.
-- =====================================================

-- =====================================================
-- SEED JOURNAL CATEGORIES
-- =====================================================

INSERT INTO journal_categories (name, slug, description) VALUES
    ('Events', 'events', 'Coverage of weddings, corporate events, and celebrations'),
    ('Recipes', 'recipes', 'Detailed recipes and baking techniques'),
    ('Stories', 'stories', 'Behind-the-scenes stories and sourcing journeys'),
    ('Behind the Scenes', 'behind-the-scenes', 'A look into our kitchen and team')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEED JOURNAL TAGS
-- =====================================================

INSERT INTO journal_tags (name, slug) VALUES
    ('Weddings', 'weddings'),
    ('Corporate', 'corporate'),
    ('Seasonal', 'seasonal'),
    ('Techniques', 'techniques'),
    ('Ingredients', 'ingredients'),
    ('Team', 'team')
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- SEED JOURNAL POSTS
-- =====================================================

-- Get category IDs for reference
DO $$
DECLARE
    cat_events UUID;
    cat_recipes UUID;
    cat_stories UUID;
    cat_bts UUID;
    tag_weddings UUID;
    tag_corporate UUID;
    tag_seasonal UUID;
    tag_techniques UUID;
    tag_ingredients UUID;
    tag_team UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO cat_events FROM journal_categories WHERE slug = 'events';
    SELECT id INTO cat_recipes FROM journal_categories WHERE slug = 'recipes';
    SELECT id INTO cat_stories FROM journal_categories WHERE slug = 'stories';
    SELECT id INTO cat_bts FROM journal_categories WHERE slug = 'behind-the-scenes';
    
    -- Get tag IDs
    SELECT id INTO tag_weddings FROM journal_tags WHERE slug = 'weddings';
    SELECT id INTO tag_corporate FROM journal_tags WHERE slug = 'corporate';
    SELECT id INTO tag_seasonal FROM journal_tags WHERE slug = 'seasonal';
    SELECT id INTO tag_techniques FROM journal_tags WHERE slug = 'techniques';
    SELECT id INTO tag_ingredients FROM journal_tags WHERE slug = 'ingredients';
    SELECT id INTO tag_team FROM journal_tags WHERE slug = 'team';

    -- Insert featured post
    INSERT INTO journal_posts (
        title, slug, excerpt, content, featured_image_url, 
        author_name, category_id, is_featured, is_published, 
        read_time_minutes, published_at
    ) VALUES (
        'A Grand Wedding at the Ritz: How We Crafted 800 Desserts in One Elegant Evening',
        'grand-wedding-ritz-800-desserts',
        'When the Al-Rashidi family commissioned ALHA for their daughter''s celebration, we knew this would be a defining moment. Six tiers of saffron-infused choux, 1200 gold-dusted macarons, and a dessert table that stretched twelve metres became the talk of Dubai''s social calendar.',
        E'# A Grand Wedding at the Ritz\n\nWhen the Al-Rashidi family approached us six months before their daughter''s wedding, they had one request: create something unforgettable.\n\n## The Challenge\n\nEight hundred guests. A twelve-metre dessert table. And a timeline that would make most pastry chefs nervous.\n\n## Our Approach\n\nWe started with a tasting session that lasted four hours. The family wanted traditional Middle Eastern flavors elevated with French technique. We delivered:\n\n- Six-tier croquembouche infused with saffron and cardamom\n- 1,200 gold-dusted macarons in rose, pistachio, and date flavors\n- Individual kunafa cups with clotted cream\n- Miniature baklava towers\n\n## The Result\n\nThe dessert table became the centerpiece of the evening. Guests couldn''t stop photographing it. The bride''s mother cried when she saw it. And we received five new wedding bookings that night.\n\nThis is why we do what we do.',
        'events1.jpeg',
        'Alha Rashida',
        cat_events,
        true,
        true,
        8,
        NOW() - INTERVAL '5 days'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Insert regular posts
    INSERT INTO journal_posts (
        title, slug, excerpt, content, featured_image_url,
        author_name, category_id, is_published, read_time_minutes, published_at
    ) VALUES
    (
        'The Art of the Croquembouche',
        'art-of-croquembouche',
        'Building a towering croquembouche is equal parts architecture and artistry. Each choux puff must be perfectly golden, each thread of caramel precisely spun to create that signature lattice structure that makes guests gasp.',
        E'# The Art of the Croquembouche\n\nThe croquembouche is the crown jewel of French pastry...',
        'events2.jpeg',
        'Alha Rashida',
        cat_recipes,
        true,
        5,
        NOW() - INTERVAL '10 days'
    ),
    (
        'Sourcing Saffron from Kashmir',
        'sourcing-saffron-kashmir',
        'We travel to the valleys of Kashmir each autumn to source the world''s finest saffron for our signature desserts. The journey from flower to flavor is a story of patience, tradition, and uncompromising quality.',
        E'# Sourcing Saffron from Kashmir\n\nEvery autumn, we make the journey to Kashmir...',
        'events3.jpeg',
        'Khalid Farhan',
        cat_stories,
        true,
        6,
        NOW() - INTERVAL '15 days'
    ),
    (
        'An Intimate Garden Wedding in Jumeirah',
        'intimate-garden-wedding-jumeirah',
        'Forty guests, a canopy of fairy lights, and a dessert table that looked like a Monet painting. Here''s how we brought romance and elegance to this intimate celebration with pastel mille-feuille and lavender-infused éclairs.',
        E'# An Intimate Garden Wedding\n\nNot every wedding needs to be grand...',
        'events1.jpeg',
        'Sana Mir',
        cat_events,
        true,
        5,
        NOW() - INTERVAL '20 days'
    ),
    (
        'Mastering the Perfect Gulab Jamun',
        'mastering-perfect-gulab-jamun',
        'The secret to gulab jamun that melts on your tongue lies in the khoya-to-flour ratio and the temperature of your syrup. We share the technique our head chef learned from her grandmother in Kerala, refined over three decades.',
        E'# Mastering the Perfect Gulab Jamun\n\nGulab jamun is deceptively simple...',
        'events2.jpeg',
        'Alha Rashida',
        cat_recipes,
        true,
        7,
        NOW() - INTERVAL '25 days'
    ),
    (
        '5 AM in the Kitchen: A Day with Our Pastry Team',
        '5am-kitchen-day-with-pastry-team',
        'Before the city wakes, our kitchen is already alive with the scent of caramelizing sugar and fresh vanilla. Follow our head pastry chef through the rituals, precision, and quiet magic that make ALHA what it is.',
        E'# 5 AM in the Kitchen\n\nThe alarm goes off at 4:30 AM...',
        'events3.jpeg',
        'Khalid Farhan',
        cat_bts,
        true,
        7,
        NOW() - INTERVAL '30 days'
    ),
    (
        'Finding Wild Honey in the Nilgiris',
        'finding-wild-honey-nilgiris',
        'Deep in the Nilgiri hills, we source raw wild honey from tribal beekeepers who''ve harvested from ancient hives for generations. This golden nectar brings a floral complexity to our desserts that no commercial honey can match.',
        E'# Finding Wild Honey in the Nilgiris\n\nThe journey to source our honey...',
        'events1.jpeg',
        'Sana Mir',
        cat_stories,
        true,
        6,
        NOW() - INTERVAL '35 days'
    )
    ON CONFLICT (slug) DO NOTHING;

END $$;

-- =====================================================
-- SEED PRODUCTS (Sample Menu Items)
-- =====================================================

INSERT INTO products (name, description, category, price, image_url, is_available) VALUES
    -- Events/Bulk Orders (price on request)
    ('Wedding Dessert Table', 'Complete dessert table setup for 100+ guests with custom design', 'events', NULL, 'events1.jpeg', true),
    ('Corporate Event Package', 'Branded desserts and catering for corporate events', 'events', NULL, 'events2.jpeg', true),
    ('Croquembouche Tower', 'Classic French tower of choux pastry with caramel', 'events', NULL, 'events3.jpeg', true),
    ('Custom Cake (Multi-tier)', 'Bespoke multi-tier celebration cake', 'events', NULL, 'events1.jpeg', true),
    
    -- Small Quantity Orders (with prices)
    ('Assorted Macarons Box (12)', 'Box of 12 French macarons in assorted flavors', 'small', 180.00, 'cookie.png', true),
    ('Gulab Jamun (6 pieces)', 'Traditional Indian sweet in rose syrup', 'small', 120.00, 'jamun.png', true),
    ('Mango Mousse Cup', 'Light mango mousse with fresh fruit', 'small', 85.00, 'mango.png', true),
    ('Chocolate Cupcakes (6)', 'Rich chocolate cupcakes with ganache', 'small', 150.00, 'cupcake.png', true),
    ('Artisan Cookie Box (12)', 'Assorted handcrafted cookies', 'small', 140.00, 'cookie.png', true),
    ('Mini Éclairs (6)', 'Classic French éclairs with various fillings', 'small', 160.00, 'cup.png', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE journal_posts IS 'Sample blog posts have been added for testing';
COMMENT ON TABLE products IS 'Sample products have been added for both events and small quantity categories';

-- Made with Bob
