-- ============================================================
-- AASHA BHAVAN — Complete Database Schema (Supabase / PostgreSQL)
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────────────
-- 1. DONATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE donations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name          TEXT,
  donor_email         TEXT,
  donor_phone         TEXT,
  amount_paise        BIGINT NOT NULL,          -- in paise (₹ × 100)
  cause               TEXT DEFAULT 'general',   -- 'general' | 'education' | 'medical' | 'food' | 'infrastructure'
  frequency           TEXT DEFAULT 'one-time',  -- 'one-time' | 'monthly'
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id   TEXT,
  razorpay_signature  TEXT,
  payment_status      TEXT DEFAULT 'pending',   -- 'pending' | 'paid' | 'failed' | 'refunded'
  receipt_80g_url     TEXT,
  receipt_sent        BOOLEAN DEFAULT FALSE,
  donor_pan           TEXT,                     -- optional PAN for 80G
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_donations_email ON donations(donor_email);
CREATE INDEX idx_donations_status ON donations(payment_status);
CREATE INDEX idx_donations_created ON donations(created_at DESC);

-- ──────────────────────────────────────────────────────────────
-- 2. VOLUNTEERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE volunteers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT NOT NULL,
  availability TEXT,               -- 'weekends' | 'weekdays' | 'evenings'
  skills       TEXT,
  message      TEXT,
  status       TEXT DEFAULT 'pending',  -- 'pending' | 'approved' | 'active' | 'rejected'
  approved_at  TIMESTAMPTZ,
  notes        TEXT,               -- admin internal notes
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_volunteers_status ON volunteers(status);

-- ──────────────────────────────────────────────────────────────
-- 3. CONTACT MESSAGES
-- ──────────────────────────────────────────────────────────────
CREATE TABLE contact_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  email      TEXT,
  phone      TEXT,
  intent     TEXT DEFAULT 'other',  -- 'donate' | 'volunteer' | 'goods' | 'sponsor' | 'csr' | 'other'
  message    TEXT,
  is_read    BOOLEAN DEFAULT FALSE,
  handled_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_read ON contact_messages(is_read);
CREATE INDEX idx_messages_created ON contact_messages(created_at DESC);

-- ──────────────────────────────────────────────────────────────
-- 4. RESIDENTS (anonymized for website display)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE residents (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name             TEXT NOT NULL,         -- nickname/first name only
  type                     TEXT NOT NULL,         -- 'child' | 'elder'
  age                      INT,
  grade                    TEXT,                  -- for children
  admission_year           INT,
  short_bio                TEXT,
  needs                    TEXT,
  monthly_sponsorship_amount INT DEFAULT 1000,    -- in rupees
  is_sponsored             BOOLEAN DEFAULT FALSE,
  is_featured              BOOLEAN DEFAULT FALSE,
  is_active                BOOLEAN DEFAULT TRUE,
  photo_url                TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_residents_type ON residents(type);
CREATE INDEX idx_residents_featured ON residents(is_featured);

-- ──────────────────────────────────────────────────────────────
-- 5. SPONSORSHIPS (donor <-> resident link)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE sponsorships (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resident_id              UUID REFERENCES residents(id) ON DELETE SET NULL,
  donor_name               TEXT,
  donor_email              TEXT,
  donor_phone              TEXT,
  amount_monthly           INT NOT NULL,
  razorpay_subscription_id TEXT,
  is_active                BOOLEAN DEFAULT TRUE,
  started_at               TIMESTAMPTZ DEFAULT NOW(),
  ended_at                 TIMESTAMPTZ
);

CREATE INDEX idx_sponsorships_resident ON sponsorships(resident_id);
CREATE INDEX idx_sponsorships_email ON sponsorships(donor_email);

-- ──────────────────────────────────────────────────────────────
-- 6. GALLERY PHOTOS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE gallery_photos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url         TEXT NOT NULL,
  caption     TEXT,
  category    TEXT DEFAULT 'activity', -- 'children' | 'elderly' | 'activity' | 'event'
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order  INT DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 7. EVENTS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  event_date    DATE NOT NULL,
  start_time    TIME,
  end_time      TIME,
  event_type    TEXT DEFAULT 'open-day', -- 'open-day' | 'volunteer' | 'drive' | 'celebration'
  description   TEXT,
  max_attendees INT,
  is_public     BOOLEAN DEFAULT TRUE,
  is_cancelled  BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date);

-- ──────────────────────────────────────────────────────────────
-- 8. EVENT REGISTRATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE event_registrations (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id     UUID REFERENCES events(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  email        TEXT,
  phone        TEXT,
  attendees    INT DEFAULT 1,
  registered_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 9. NEWSLETTER SUBSCRIBERS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  subscribed    BOOLEAN DEFAULT TRUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ
);

-- ──────────────────────────────────────────────────────────────
-- 10. GOODS DONATIONS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE goods_donations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name    TEXT NOT NULL,
  donor_phone   TEXT NOT NULL,
  donor_email   TEXT,
  items         TEXT NOT NULL,          -- description of items
  quantity       TEXT,
  pickup_needed  BOOLEAN DEFAULT FALSE,
  pickup_address TEXT,
  preferred_date DATE,
  status         TEXT DEFAULT 'pending', -- 'pending' | 'confirmed' | 'received'
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────────────
-- 11. ACTIVITY FEED (for real-time ticker)
-- ──────────────────────────────────────────────────────────────
CREATE TABLE activity_feed (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       TEXT NOT NULL, -- 'donation' | 'event' | 'milestone' | 'birthday'
  message    TEXT NOT NULL,
  icon       TEXT DEFAULT '❤️',
  color_type TEXT DEFAULT 'k', -- 'k' (kids/saffron) | 'e' (elder/purple) | 'g' (general/teal)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_created ON activity_feed(created_at DESC);

-- ──────────────────────────────────────────────────────────────
-- 12. ORG SETTINGS
-- ──────────────────────────────────────────────────────────────
CREATE TABLE org_settings (
  key   TEXT PRIMARY KEY,
  value TEXT,
  label TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO org_settings (key, value, label) VALUES
  ('org_name', 'Aasha Bhavan', 'Organisation Name'),
  ('tagline', 'Home of Hope', 'Tagline'),
  ('founded_year', '2008', 'Founded Year'),
  ('phone', '+91 98480 XXXXX', 'Phone Number'),
  ('email', 'care@aashabhavanhyderabad.org', 'Email'),
  ('address', 'Plot 47, Banjara Hills Road No.12', 'Address'),
  ('city', 'Hyderabad, Telangana 500034', 'City'),
  ('children_count', '68', 'Children Count'),
  ('elders_count', '47', 'Elders Count'),
  ('ngo_reg', 'AP/2008/0XXXXX', 'NGO Registration Number'),
  ('80g_number', 'AAATA0000A/2021-22', '80G Certificate Number'),
  ('fcra_number', '010XXXXXX', 'FCRA Number'),
  ('emergency_appeal_text', 'Medical Fund for 12 Elderly Residents', 'Emergency Appeal Title'),
  ('emergency_appeal_goal', '180000', 'Emergency Appeal Goal (₹)'),
  ('emergency_appeal_raised', '120600', 'Emergency Appeal Raised (₹)');

-- ──────────────────────────────────────────────────────────────
-- SAMPLE DATA (seed for testing)
-- ──────────────────────────────────────────────────────────────
INSERT INTO activity_feed (type, message, icon, color_type) VALUES
  ('donation', 'Ramesh donated ₹2,000 for children''s books', '❤️', 'k'),
  ('event', 'Medical camp for 47 elderly — all attended', '🏥', 'e'),
  ('milestone', '6 children cleared Class 10 with distinction', '🎓', 'k'),
  ('event', 'TCS volunteers spent Sunday with our elders', '🤝', 'g'),
  ('event', 'Birthday celebrated for 4 children this week', '🎂', 'k');

INSERT INTO residents (display_name, type, age, grade, admission_year, short_bio, needs, monthly_sponsorship_amount, is_featured) VALUES
  ('Arjun', 'child', 9, 'Class 4', 2020, 'Loves cricket and drawing', 'School fees & books', 1200, TRUE),
  ('Priya', 'child', 13, 'Class 8', 2017, 'Aspiring doctor, topped her class', 'Tuition support', 1500, TRUE),
  ('Ravi', 'child', 7, 'Class 2', 2022, 'Full of energy, loves singing', 'Monthly sponsorship', 1000, FALSE),
  ('Kavitha', 'child', 15, 'Class 10', 2014, 'Board exams, passionate about computers', 'Higher studies support', 2000, TRUE),
  ('Lakshmi Amma', 'elder', 74, NULL, 2019, 'Retired teacher, teaches Kannada', 'Monthly medication', 800, TRUE),
  ('Subramaniam Garu', 'elder', 82, NULL, 2016, 'Former engineer, loves chess', 'Physiotherapy', 1200, TRUE),
  ('Vimala Devi', 'elder', 68, NULL, 2021, 'Cooks sweets for children', 'Diabetic care', 900, FALSE),
  ('Krishnaswamy Garu', 'elder', 78, NULL, 2018, 'Tells stories every evening', 'Cardiac care', 1500, TRUE);

-- ──────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ──────────────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE goods_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_settings ENABLE ROW LEVEL SECURITY;

-- Public read access for display data
CREATE POLICY "Public can read active residents" ON residents FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Public can read gallery" ON gallery_photos FOR SELECT USING (TRUE);
CREATE POLICY "Public can read events" ON events FOR SELECT USING (is_public = TRUE AND is_cancelled = FALSE);
CREATE POLICY "Public can read activity feed" ON activity_feed FOR SELECT USING (TRUE);
CREATE POLICY "Public can read org settings" ON org_settings FOR SELECT USING (TRUE);

-- Public can insert (for forms)
CREATE POLICY "Anyone can submit contact" ON contact_messages FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can register volunteer" ON volunteers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can subscribe newsletter" ON newsletter_subscribers FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can register event" ON event_registrations FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Anyone can log goods donation" ON goods_donations FOR INSERT WITH CHECK (TRUE);

-- Service role has full access (for server-side API routes)
-- These use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS automatically

-- ──────────────────────────────────────────────────────────────
-- STORAGE BUCKETS (run in Supabase Dashboard > Storage)
-- ──────────────────────────────────────────────────────────────
-- CREATE BUCKET receipts (private, 10MB max, pdf only)
-- CREATE BUCKET gallery (public, 5MB max, image only)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('receipts', 'receipts', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
