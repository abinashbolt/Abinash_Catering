-- ==========================================================
-- Abinash Catering — Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard -> SQL Editor -> New Query
-- ==========================================================

-- Enable UUID generation (Supabase usually has this already)
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------
-- 1. MENU ITEMS
-- ----------------------------------------------------------
create table if not exists menu_items (
    id uuid primary key default gen_random_uuid(),
    name text not null default '',
    name_tamil text not null default '',
    description text not null default '',
    category text not null,
    menu_section text not null default '',
    image_url text not null default '',
    is_available boolean not null default true,
    display_order integer not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_menu_items_category on menu_items (category);
create index if not exists idx_menu_items_available on menu_items (is_available);
create index if not exists idx_menu_items_section on menu_items (menu_section);
create index if not exists idx_menu_items_order on menu_items (display_order);

-- Logical uniqueness: the same dish name can repeat across different
-- menu-card sections (e.g. "சாம்பார்" appears in many sections), but not
-- twice within the same section. This lets menu_seed.sql be re-run safely.
create unique index if not exists idx_menu_items_section_tamil_unique
    on menu_items (menu_section, name_tamil);

-- ----------------------------------------------------------
-- 2. GALLERY
-- ----------------------------------------------------------
create table if not exists gallery (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    category text not null,
    image_url text not null,
    description text not null default '',
    created_at timestamptz not null default now()
);

create index if not exists idx_gallery_category on gallery (category);

-- ----------------------------------------------------------
-- 3. TESTIMONIALS
-- ----------------------------------------------------------
create table if not exists testimonials (
    id uuid primary key default gen_random_uuid(),
    customer_name text not null,
    event_type text not null default '',
    review text not null,
    rating integer not null default 5 check (rating between 1 and 5),
    image_url text not null default '',
    created_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- 4. BOOKINGS / ENQUIRIES
-- ----------------------------------------------------------
create table if not exists bookings (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null,
    email text not null default '',
    event_type text not null,
    event_date date,
    event_time text not null default '',
    guest_count integer,
    location text not null default '',
    food_preference text not null default '',
    preferred_menu text not null default '',
    additional_requirements text not null default '',
    -- Catering menu selection (added for the catering-combo booking flow)
    meal_type text not null default '',          -- Breakfast / Lunch / Dinner
    selected_menu text not null default '',       -- menu_section of the chosen combo, e.g. "Lunch Menu 4"
    menu_type text not null default 'original'
        check (menu_type in ('original','customized')),
    included_items jsonb not null default '[]',   -- items kept from the base combo
    added_items jsonb not null default '[]',       -- dishes added from the master food list
    removed_items jsonb not null default '[]',     -- dishes removed from the base combo
    status text not null default 'pending'
        check (status in ('pending','contacted','confirmed','completed','cancelled')),
    created_at timestamptz not null default now()
);

create index if not exists idx_bookings_status on bookings (status);
create index if not exists idx_bookings_created on bookings (created_at desc);

-- ----------------------------------------------------------
-- 5. CONTACT MESSAGES
-- ----------------------------------------------------------
create table if not exists contact_messages (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    phone text not null default '',
    email text not null default '',
    message text not null,
    created_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- 6. ADMIN USERS (optional — the app defaults to .env credentials,
--    but this table lets you manage admins from Supabase instead)
-- ----------------------------------------------------------
create table if not exists admin_users (
    id uuid primary key default gen_random_uuid(),
    username text not null unique,
    password_hash text not null,
    created_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- MENU SEED DATA
-- The real Abinash Catering menu (transcribed from the physical
-- menu card) lives in database/menu_seed.sql — run that file
-- after this one. It is safe to re-run (upsert on menu_section +
-- name_tamil), so it will never create duplicate rows.
-- ----------------------------------------------------------

-- ----------------------------------------------------------
-- SEED DATA (optional — sample rows so the site isn't empty
-- on first run; delete or edit these freely from /admin)
-- ----------------------------------------------------------
insert into gallery (title, category, image_url, description) values
('Traditional Banana Leaf Meal', 'Traditional Meals', '/static/images/gallery/banana-leaf.jpg', 'A complete South Indian meal served on a banana leaf.'),
('Wedding Reception Buffet', 'Weddings', '/static/images/gallery/wedding-buffet.jpg', 'Live buffet counters set up for a wedding reception.'),
('Corporate Event Setup', 'Events', '/static/images/gallery/corporate-event.jpg', 'Elegant food counters arranged for a corporate gathering.'),
('Live Dosa Counter', 'Buffet', '/static/images/gallery/live-dosa-counter.jpg', 'Fresh dosas made live for guests.'),
('Festival Sweets Spread', 'Food', '/static/images/gallery/sweets-spread.jpg', 'An assortment of traditional festive sweets.')
on conflict do nothing;

insert into testimonials (customer_name, event_type, review, rating, image_url) values
('Priya & Karthik', 'Wedding', 'Abinash Catering made our wedding feast unforgettable — every dish tasted like home.', 5, ''),
('Suresh Kumar', 'Corporate Event', 'Punctual, professional, and the food was consistently excellent for all three days of our conference.', 5, ''),
('Lakshmi Narayanan', 'Birthday Function', 'Our guests are still talking about the biryani. Thank you for making the day so special!', 5, '')
on conflict do nothing;
