'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface Resident {
  id: string; name: string; age: number; type: 'child' | 'elder';
  grade?: string; year: number; bio: string; amount: number; sponsored: boolean;
}
interface TickerItem { id: number; text: string; type: 'k' | 'e' | 'g'; icon: string; }
interface EventItem {
  id: string; title: string; day: string; month: string; time: string;
  type: 'open-day' | 'volunteer' | 'drive' | 'celebration'; desc: string; spots: number;
}
interface AmountOption { value: string; label: string; impact: string; }

// ─── STATIC DATA ─────────────────────────────────────────────────────────────
const TICKER_ITEMS: TickerItem[] = [
  { id: 1, text: 'Ramesh donated ₹2,000 for children\'s books', type: 'k', icon: '❤️' },
  { id: 2, text: 'Medical camp for 47 elderly — all attended', type: 'e', icon: '🏥' },
  { id: 3, text: '6 children cleared Class 10 with distinction', type: 'k', icon: '🎓' },
  { id: 4, text: 'TCS volunteers spent Sunday with our elders', type: 'g', icon: '🤝' },
  { id: 5, text: 'Birthday celebrated for 4 children this week', type: 'k', icon: '🎂' },
  { id: 6, text: 'Priya sponsored for higher education — ₹1,500/mo', type: 'k', icon: '✨' },
  { id: 7, text: 'New yoga mat donations — elders say thank you!', type: 'e', icon: '🧘' },
  { id: 8, text: 'Annual day prep underway — children rehearsing', type: 'g', icon: '🎭' },
];

const CHILDREN: Resident[] = [
  { id: 'c1', name: 'Arjun', age: 9, type: 'child', grade: 'Class 4', year: 2020, bio: 'Loves cricket and drawing. Needs sponsor for school fees & books.', amount: 1200, sponsored: false },
  { id: 'c2', name: 'Priya', age: 13, type: 'child', grade: 'Class 8', year: 2017, bio: 'Aspiring doctor. Topped her class last year. Needs tuition support.', amount: 1500, sponsored: false },
  { id: 'c3', name: 'Ravi', age: 7, type: 'child', grade: 'Class 2', year: 2022, bio: 'Mischievous and full of energy. Loves singing. Looking for monthly sponsor.', amount: 1000, sponsored: false },
  { id: 'c4', name: 'Kavitha', age: 15, type: 'child', grade: 'Class 10', year: 2014, bio: 'Board exams this year. Passionate about computers. Needs higher-study support.', amount: 2000, sponsored: true },
  { id: 'c5', name: 'Rahul', age: 11, type: 'child', grade: 'Class 6', year: 2019, bio: 'Talented at painting. Wants to be an artist. Monthly education fund needed.', amount: 1200, sponsored: false },
  { id: 'c6', name: 'Meena', age: 8, type: 'child', grade: 'Class 3', year: 2021, bio: 'Bright student, loves storytelling. School supplies sponsorship needed.', amount: 800, sponsored: false },
  { id: 'c7', name: 'Suresh', age: 16, type: 'child', grade: 'Class 11', year: 2012, bio: 'Eldest in the home. Mentors younger children. Needs college entrance coaching.', amount: 2500, sponsored: false },
  { id: 'c8', name: 'Lakshmi', age: 10, type: 'child', grade: 'Class 5', year: 2020, bio: 'Class topper and dance enthusiast. Monthly sponsor for arts training needed.', amount: 1000, sponsored: false },
];

const ELDERS: Resident[] = [
  { id: 'e1', name: 'Lakshmi Amma', age: 74, type: 'elder', year: 2019, bio: 'Retired teacher. Teaches children Kannada. Needs support for monthly medication.', amount: 800, sponsored: false },
  { id: 'e2', name: 'Subramaniam Garu', age: 82, type: 'elder', year: 2016, bio: 'Former civil engineer. Loves chess. Requires monthly physiotherapy.', amount: 1200, sponsored: false },
  { id: 'e3', name: 'Vimala Devi', age: 68, type: 'elder', year: 2021, bio: 'Cooks festival sweets for the children. Requires diabetic care support.', amount: 900, sponsored: true },
  { id: 'e4', name: 'Krishnaswamy Garu', age: 78, type: 'elder', year: 2018, bio: 'Tells stories to children every evening. Needs cardiac care assistance.', amount: 1500, sponsored: false },
  { id: 'e5', name: 'Saradha Amma', age: 71, type: 'elder', year: 2020, bio: 'Former school principal. Still guides children with homework every day.', amount: 700, sponsored: false },
  { id: 'e6', name: 'Rangaiah Garu', age: 85, type: 'elder', year: 2015, bio: 'Oldest resident. Writes poetry for the children. Needs full-time nursing care.', amount: 2000, sponsored: false },
  { id: 'e7', name: 'Padma Devi', age: 66, type: 'elder', year: 2022, bio: 'Teaches classical music to children on weekends. Needs blood pressure medication.', amount: 600, sponsored: false },
  { id: 'e8', name: 'Gopala Rao', age: 79, type: 'elder', year: 2017, bio: 'Former farmer. Maintains the garden with children. Requires knee treatment.', amount: 1100, sponsored: false },
];

const AMOUNTS: AmountOption[] = [
  { value: '500', label: '₹500', impact: '1 week meals for a child' },
  { value: '1000', label: '₹1,000', impact: "Child's school fee (month)" },
  { value: '2500', label: '₹2,500', impact: "Elder's full monthly care" },
  { value: '5000', label: '₹5,000', impact: 'Sponsor 4 kids for a month' },
  { value: '10000', label: '₹10,000', impact: 'Full month ops support' },
  { value: 'custom', label: 'Custom', impact: 'Any amount helps' },
];

const EVENTS: EventItem[] = [
  { id: 'ev1', title: 'Open House — Visit Our Home', day: '01', month: 'Jun', time: '10:00 AM – 2:00 PM', type: 'open-day', desc: 'Come meet our children and elders. Tour the facility, share a meal, and see your impact firsthand.', spots: 12 },
  { id: 'ev2', title: 'Weekend Volunteer Drive', day: '08', month: 'Jun', time: '9:00 AM – 4:00 PM', type: 'volunteer', desc: 'Spend a Saturday with us. Activities include teaching, cooking, gardening, and recreation.', spots: 20 },
  { id: 'ev3', title: 'Monsoon Essentials Drive', day: '15', month: 'Jun', time: 'Drop-off anytime', type: 'drive', desc: 'Bring raincoats, umbrellas, waterproof footwear, and medicines to prepare for the monsoon season.', spots: 0 },
  { id: 'ev4', title: 'Annual Day Celebration', day: '21', month: 'Jun', time: '5:00 PM – 8:00 PM', type: 'celebration', desc: 'Our children perform music, dance, and drama. Join us for a joyful evening with the whole family.', spots: 50 },
  { id: 'ev5', title: 'CSR Partnership Meetup', day: '28', month: 'Jun', time: '3:00 PM – 5:00 PM', type: 'open-day', desc: 'For corporate partners interested in CSR initiatives. Discuss ongoing and new partnership models.', spots: 8 },
  { id: 'ev6', title: 'Medical Volunteer Camp', day: '05', month: 'Jul', time: '9:00 AM – 1:00 PM', type: 'volunteer', desc: 'Doctors and nurses volunteer for free health check-ups for all 115 residents.', spots: 15 },
];

// Impact calculator helper
function calcImpact(amount: number): { text: string; sub: string } {
  if (amount >= 10000) return { text: 'Full month of operations', sub: 'Covers meals, medicines & care for all 115 residents for an entire month' };
  if (amount >= 5000) return { text: `${Math.floor(amount / 1200)} children sponsored`, sub: 'Complete monthly care — education, food, healthcare & emotional support' };
  if (amount >= 2500) return { text: `${Math.floor(amount / 80)} days of meals`, sub: 'Fresh, nutritious breakfast, lunch, dinner & snacks for every resident' };
  if (amount >= 1000) return { text: `${Math.floor(amount / 200)} school uniforms`, sub: 'Quality uniforms giving children the dignity and confidence to learn' };
  if (amount >= 500) return { text: `${Math.floor(amount / 167)} weeks of meals`, sub: 'Three nutritious meals every day, made with love by our kitchen team' };
  return { text: `${Math.floor(amount / 50)} wholesome meals`, sub: 'Every single rupee goes directly to nourishing a child or elder today' };
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function HomePage() {
  // Modal & donation state
  const [modalOpen, setModalOpen] = useState(false);
  const [donationSuccess, setDonationSuccess] = useState(false);
  const [selectedAmt, setSelectedAmt] = useState('500');
  const [customAmt, setCustomAmt] = useState('');
  const [donFreq, setDonFreq] = useState<'once' | 'monthly'>('once');
  const [cause, setCause] = useState('Where needed most');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [donating, setDonating] = useState(false);

  // UI state
  const [residentTab, setResidentTab] = useState<'kids' | 'elder'>('kids');
  const [lightbox, setLightbox] = useState<{ icon: string; caption: string } | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [tickerIdx, setTickerIdx] = useState(0);

  // Advanced feature state
  const [calcAmount, setCalcAmount] = useState(2500);
  const [counters, setCounters] = useState({ children: 0, elders: 0, educated: 0, donors: 0 });
  const [countersStarted, setCountersStarted] = useState(false);
  const [nlEmail, setNlEmail] = useState('');
  const [nlSent, setNlSent] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', intent: 'Donate money', message: '' });
  const [contactSent, setContactSent] = useState(false);
  const [contactSending, setContactSending] = useState(false);
  const [helpAmtActive, setHelpAmtActive] = useState<string>('₹500');
  const [volTypeActive, setVolTypeActive] = useState<string>('Weekends');
  const [goodsTypeActive, setGoodsTypeActive] = useState<string>('Clothes');
  const [registeredEvents, setRegisteredEvents] = useState<Set<string>>(new Set());
  const [galleryPhotos, setGalleryPhotos] = useState<Array<{ id: string; url: string; caption: string; category: string; is_featured: boolean }> | null>(null);

  const impactRef = useRef<HTMLDivElement>(null);

  // ─── EFFECTS ───────────────────────────────────────────────────────────────
  // Fetch gallery from Supabase
  useEffect(() => {
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => { if (d.photos?.length) setGalleryPhotos(d.photos); })
      .catch(() => {}); // fall back to static on error
  }, []);

  // Ticker rotation
  useEffect(() => {
    const t = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_ITEMS.length), 3500);
    return () => clearInterval(t);
  }, []);

  // Counter animation on scroll into view
  useEffect(() => {
    const el = impactRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersStarted) {
          setCountersStarted(true);
          const targets = { children: 68, elders: 47, educated: 340, donors: 5200 };
          const dur = 2000;
          const start = Date.now();
          const tick = () => {
            const p = Math.min((Date.now() - start) / dur, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setCounters({
              children: Math.floor(targets.children * e),
              elders: Math.floor(targets.elders * e),
              educated: Math.floor(targets.educated * e),
              donors: Math.floor(targets.donors * e),
            });
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [countersStarted]);

  // Active section detection
  useEffect(() => {
    const ids = ['about', 'impact', 'residents', 'programs', 'help', 'gallery', 'events', 'contact'];
    const obs = new IntersectionObserver(
      entries => { entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }); },
      { threshold: 0.4 }
    );
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  // ─── HELPERS ───────────────────────────────────────────────────────────────
  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenu(false);
  }, []);

  const displayAmt = selectedAmt === 'custom' ? (parseInt(customAmt) || 0) : parseInt(selectedAmt);

  const openModal = useCallback((amount?: string) => {
    if (amount) setSelectedAmt(amount);
    setDonationSuccess(false);
    setModalOpen(true);
  }, []);

  // ─── DONATION HANDLER ──────────────────────────────────────────────────────
  const handleDonate = useCallback(async () => {
    const amount = displayAmt;
    if (!amount || amount < 1) return;
    setDonating(true);
    try {
      const res = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, cause, frequency: donFreq, donorName, donorEmail, donorPhone }),
      });
      const order = await res.json();
      if (!order.id) throw new Error('Order creation failed');

      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY';
      // @ts-ignore
      const rzp = new window.Razorpay({
        key: rzpKey,
        order_id: order.id,
        amount: order.amount,
        currency: 'INR',
        name: 'Aasha Bhavan',
        description: `${donFreq === 'monthly' ? 'Monthly ' : ''}Donation — ${cause}`,
        image: '/logo.png',
        prefill: { name: donorName, email: donorEmail, contact: donorPhone },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          await fetch('/api/donations/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, orderId: order.id, amount, cause, frequency: donFreq, donorName, donorEmail, donorPhone }),
          });
          setDonationSuccess(true);
        },
        modal: { ondismiss: () => setDonating(false) },
        theme: { color: '#E8860A' },
      });
      rzp.open();
    } catch {
      alert('Payment gateway not configured yet. Please contact us directly at care@aashabhavanhyderabad.org');
    } finally {
      setDonating(false);
    }
  }, [displayAmt, cause, donFreq, donorName, donorEmail, donorPhone]);

  // ─── CONTACT HANDLER ───────────────────────────────────────────────────────
  const handleContact = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSending(true);
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      setContactSent(true);
    } finally {
      setContactSending(false);
    }
  }, [contactForm]);

  // ─── NEWSLETTER HANDLER ────────────────────────────────────────────────────
  const handleNl = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/newsletter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: nlEmail }),
    });
    setNlSent(true);
  }, [nlEmail]);

  const impact = calcImpact(calcAmount);
  const tickerItem = TICKER_ITEMS[tickerIdx];

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── ANNOUNCEMENT BAR ─────────────────────────────────────────────── */}
      <div className="ann-bar">
        <span className="ann-badge">
          <i className="ti ti-heart-filled" style={{ fontSize: 11 }}></i> Urgent
        </span>
        <strong>Winter drive underway</strong> — Warm clothes, blankets &amp; medicines needed for 40+ elders.
        <span className="ann-cta" onClick={() => openModal()}>Donate Now →</span>
      </div>

      {/* ── NAVIGATION ───────────────────────────────────────────────────── */}
      <nav className="nav">
        <div className="logo" onClick={() => scrollTo('home')}>
          <div className="logo-mark"><i className="ti ti-home-heart"></i></div>
          <div>
            <div className="logo-name">Aasha Bhavan</div>
            <div className="logo-sub">Home of Hope · Est. 2008</div>
          </div>
        </div>
        <div className="nav-links">
          {['about', 'residents', 'programs', 'help', 'gallery', 'contact'].map(id => (
            <button key={id} className={`nl ${activeSection === id ? 'active' : ''}`} onClick={() => scrollTo(id)}>
              {id === 'about' ? 'About Us' : id === 'residents' ? 'Our Family' : id === 'programs' ? 'Programs' : id === 'help' ? 'How to Help' : id.charAt(0).toUpperCase() + id.slice(1)}
            </button>
          ))}
        </div>
        <div className="nav-cta">
          <button className="btn-outline" onClick={() => scrollTo('contact')}>
            <i className="ti ti-phone"></i> Get in Touch
          </button>
          <button className="btn-primary" onClick={() => openModal()}>
            <i className="ti ti-heart"></i> Donate
          </button>
          <button className="hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
            <span></span><span></span><span></span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileMenu ? 'open' : ''}`}>
        {['about', 'residents', 'programs', 'help', 'gallery', 'contact'].map(id => (
          <button key={id} className="mobile-nl" onClick={() => scrollTo(id)}>
            {id === 'about' ? 'About Us' : id === 'residents' ? 'Our Family' : id === 'programs' ? 'Programs' : id === 'help' ? 'How to Help' : id.charAt(0).toUpperCase() + id.slice(1)}
          </button>
        ))}
        <button className="btn-primary mt-4" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { openModal(); setMobileMenu(false); }}>
          <i className="ti ti-heart"></i> Donate Now
        </button>
      </div>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="hero" id="home">
        <div className="hero-bg"></div>
        <div className="hero-bg-dots"></div>
        <div className="hero-inner">
          <div className="fade-up">
            <div className="hero-pill">
              <span className="live-dot"></span>
              Registered NGO · Hyderabad, Telangana
            </div>
            <h1>
              Every child deserves a <span className="h1-c">home</span>,<br />
              every elder deserves <span className="h1-e">dignity</span>
            </h1>
            <p className="hero-desc">
              Aasha Bhavan has been a sanctuary of love and care since 2008 — nurturing children without families and providing compassionate support to our beloved elders.
            </p>
            <div className="hero-actions">
              <button className="btn-hero-donate" onClick={() => openModal()}>
                <i className="ti ti-heart-filled"></i> Donate Today
              </button>
              <button className="btn-hero-vol" onClick={() => scrollTo('help')}>
                <i className="ti ti-users"></i> Volunteer With Us
              </button>
            </div>
            <div className="hero-trust">
              <div className="ht-item"><i className="ti ti-shield-check" style={{ color: 'var(--teal)' }}></i> FCRA Certified</div>
              <div className="ht-item"><i className="ti ti-receipt-tax" style={{ color: 'var(--teal)' }}></i> 80G Tax Benefit</div>
              <div className="ht-item"><i className="ti ti-award" style={{ color: 'var(--teal)' }}></i> Govt. Recognized</div>
            </div>
          </div>
          <div className="fade-up fade-up-2">
            <div className="hero-cards">
              <div className="hcard">
                <div className="hcard-icon kids"><i className="ti ti-friends"></i></div>
                <div>
                  <div className="hcard-label kids">Children's Wing</div>
                  <div className="hcard-title">Loving home for orphaned children</div>
                  <div className="hcard-desc">Education, healthcare, nutrition &amp; emotional support — every child here has a future.</div>
                  <div className="hcard-stat">
                    <div className="hcs"><div className="hcs-val">68</div><div className="hcs-lbl">Children</div></div>
                    <div className="hcs"><div className="hcs-val">4–17</div><div className="hcs-lbl">Age Range</div></div>
                    <div className="hcs"><div className="hcs-val">100%</div><div className="hcs-lbl">In School</div></div>
                  </div>
                </div>
              </div>
              <div className="hcard">
                <div className="hcard-icon elder"><i className="ti ti-user-heart"></i></div>
                <div>
                  <div className="hcard-label elder">Elderly Wing</div>
                  <div className="hcard-title">Dignity &amp; care for our elders</div>
                  <div className="hcard-desc">Medical care, companionship, yoga &amp; wholesome meals — our elders live with joy.</div>
                  <div className="hcard-stat">
                    <div className="hcs"><div className="hcs-val">47</div><div className="hcs-lbl">Elders</div></div>
                    <div className="hcs"><div className="hcs-val">60–95</div><div className="hcs-lbl">Age Range</div></div>
                    <div className="hcs"><div className="hcs-val">24/7</div><div className="hcs-lbl">Medical</div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-bottom-bar">
          <div className="hbb-lbl"><i className="ti ti-clock"></i>&nbsp; Live Activity</div>
          <div className="ticker-wrap">
            <div key={tickerIdx} className={`tick-chip ${tickerItem.type}`}>
              {tickerItem.icon} {tickerItem.text}
            </div>
          </div>
        </div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────── */}
      <section className="section section-white" id="about">
        <div className="about-grid">
          <div>
            <div className="sec-eyebrow ey-saffron">Our Story</div>
            <h2 className="sec-h2">A family built on<br />love &amp; compassion</h2>
            <p className="about-story">
              Aasha Bhavan was founded in 2008 by <strong>Sri. Venkata Rao</strong> and a small group of volunteers who believed that no child should grow up without love, and no elder should spend their final years in loneliness.
            </p>
            <p className="about-story">
              What began as a small shelter with 8 children has grown into a thriving community of 115 souls — children finding their wings and elders sharing their wisdom — living together as one large, joyful family.
            </p>
            <div className="about-quote">
              "When the children sing with the grandparents, and the grandparents smile with tears of joy, we know our work is complete."
            </div>
            <div className="about-pillars">
              {[
                { bg: 'var(--saffron-l)', color: 'var(--saffron-d)', icon: 'ti-heart', title: 'Unconditional Care', desc: 'Every resident is treated as our own family member, without exception.' },
                { bg: 'var(--purple-l)', color: 'var(--purple-d)', icon: 'ti-school', title: 'Education First', desc: 'All 68 children are enrolled in quality schools — free of cost.' },
                { bg: 'var(--teal-l)', color: 'var(--teal)', icon: 'ti-stethoscope', title: 'Health & Wellness', desc: 'On-site nurse, monthly doctor visits, and a yoga instructor for elders.' },
                { bg: 'var(--rose-l)', color: 'var(--rose)', icon: 'ti-shield-check', title: 'Transparent Impact', desc: 'Annual audited reports published. Every rupee accounted for.' },
              ].map(p => (
                <div key={p.title} className="pillar">
                  <div className="pillar-icon" style={{ background: p.bg, color: p.color }}>
                    <i className={`ti ${p.icon}`}></i>
                  </div>
                  <div className="pillar-text"><h4>{p.title}</h4><p>{p.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="about-photo-stack">
              <div className="aphoto aphoto-main">
                <div className="photo-placeholder kids"><i className="ti ti-friends" style={{ fontSize: 72 }}></i></div>
              </div>
              <div className="aphoto aphoto-accent">
                <div className="photo-placeholder elder"><i className="ti ti-users" style={{ fontSize: 52 }}></i></div>
              </div>
              <div className="aphoto-badge">
                <i className="ti ti-calendar-event" style={{ color: 'var(--saffron)', fontSize: 18 }}></i>
                <div>
                  <strong style={{ fontSize: 13, color: 'var(--gray6)' }}>Est. 2008</strong><br />
                  <span style={{ fontSize: 11, color: 'var(--gray4)' }}>17 Years of Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ─────────────────────────────────────────────────── */}
      <div className="impact-bg" id="impact" ref={impactRef}>
        <div className="impact-head">
          <div className="sec-eyebrow ey-teal" style={{ justifyContent: 'center', color: '#A3EDCC' }}>Our Impact</div>
          <h2 className="sec-h2" style={{ color: '#fff', fontSize: 30 }}>Numbers that speak from the heart</h2>
          <p className="sec-desc" style={{ color: 'rgba(255,255,255,.6)', margin: '0 auto' }}>Every figure here represents a real life touched, a story of hope, and the generosity of thousands of donors like you.</p>
        </div>
        <div className="impact-grid">
          {[
            { icon: 'ti-friends', val: counters.children, label: 'Children in our care today', sub: '↑ 8 new admissions this year' },
            { icon: 'ti-user-heart', val: counters.elders, label: 'Elderly residents living with dignity', sub: 'Average age: 72 years' },
            { icon: 'ti-school', val: counters.educated, unit: '+', label: 'Children educated since 2008', sub: '12 completed college' },
            { icon: 'ti-heart-filled', val: counters.donors, unit: '+', label: 'Donors & volunteers supported us', sub: 'Across India & abroad' },
          ].map((s, i) => (
            <div key={i} className="impact-stat">
              <div className="is-icon"><i className={`ti ${s.icon}`}></i></div>
              <div>
                <span className="is-val">{s.val.toLocaleString('en-IN')}</span>
                {s.unit && <span className="is-unit">{s.unit}</span>}
              </div>
              <div className="is-label">{s.label}</div>
              <div className="is-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── EMERGENCY APPEAL ─────────────────────────────────────────────── */}
      <div className="emergency-section">
        <div className="emergency-inner">
          <div>
            <div className="emergency-badge"><i className="ti ti-alert-triangle" style={{ fontSize: 12 }}></i> Urgent Appeal</div>
            <div className="emergency-title">Medical Fund for 12 Elderly Residents</div>
            <p className="emergency-desc">
              12 of our elders need urgent medical attention — cardiac check-ups, diabetes management, and physiotherapy. We need ₹1.8 lakhs by June 30th. Every rupee counts.
            </p>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ width: '67%' }}></div>
            </div>
            <div className="progress-meta">
              <span><strong>₹1,20,600</strong> raised of ₹1,80,000</span>
              <span>9 days left</span>
            </div>
          </div>
          <button className="btn-emergency" onClick={() => { setCause('Elderly Medical Care'); openModal(); }}>
            <i className="ti ti-heart-filled"></i> Donate to This Appeal
          </button>
        </div>
      </div>

      {/* ── RESIDENTS ────────────────────────────────────────────────────── */}
      <section className="section section-alt" id="residents">
        <div className="text-center mb-8">
          <div className="sec-eyebrow ey-saffron" style={{ justifyContent: 'center' }}>Our Family</div>
          <h2 className="sec-h2">Meet our beloved residents</h2>
          <p className="sec-desc" style={{ margin: '0 auto' }}>Each person here has a unique story. Sponsor a child's education or an elder's monthly care — become part of their story.</p>
        </div>
        <div className="residents-tabs" style={{ justifyContent: 'center' }}>
          <button className={`rtab ${residentTab === 'kids' ? 'active-k' : ''}`} onClick={() => setResidentTab('kids')}>
            <span className="rtab-dot" style={{ background: 'var(--saffron-m)' }}></span>
            <i className="ti ti-friends" style={{ fontSize: 15 }}></i> Children's Wing <span style={{ fontSize: 11, opacity: .6, marginLeft: 4 }}>68 residents</span>
          </button>
          <button className={`rtab ${residentTab === 'elder' ? 'active-e' : ''}`} onClick={() => setResidentTab('elder')}>
            <span className="rtab-dot" style={{ background: 'var(--purple-m)' }}></span>
            <i className="ti ti-user-heart" style={{ fontSize: 15 }}></i> Elderly Wing <span style={{ fontSize: 11, opacity: .6, marginLeft: 4 }}>47 residents</span>
          </button>
        </div>
        <div className="residents-grid">
          {(residentTab === 'kids' ? CHILDREN : ELDERS).map(r => (
            <div key={r.id} className="rcard">
              <div className={`rcard-img ${r.type === 'child' ? 'kids-bg' : 'elder-bg'}`}>
                <i className={`ti ${r.type === 'child' ? 'ti-user-circle' : 'ti-user'}`} style={{ fontSize: 52, color: r.type === 'child' ? 'var(--saffron-m)' : 'var(--purple-m)' }}></i>
                <span className={`rcard-badge ${r.type === 'child' ? 'kids' : 'elder'}`}>Age {r.age}</span>
              </div>
              <div className="rcard-body">
                <div className="rcard-name">{r.name}</div>
                <div className="rcard-age">{r.type === 'child' ? `${r.grade} · Admitted ${r.year}` : `Resident since ${r.year}`}</div>
                <div className="rcard-need">{r.bio}</div>
                <div className="rcard-sponsor">
                  {r.sponsored ? (
                    <span className="rcard-sponsored-tag"><i className="ti ti-circle-check" style={{ fontSize: 11 }}></i> Sponsored</span>
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--gray4)' }}>₹{r.amount.toLocaleString('en-IN')}/month</span>
                  )}
                  {!r.sponsored && (
                    <button className={`btn-sponsor ${r.type === 'child' ? 'k' : 'e'}`} onClick={() => openModal(String(r.amount))}>
                      {r.type === 'child' ? 'Sponsor' : 'Support'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="btn-outline" onClick={() => openModal()} style={{ padding: '10px 28px', borderRadius: 10 }}>
            View All Residents &amp; Sponsor →
          </button>
        </div>
      </section>

      {/* ── PROGRAMS ─────────────────────────────────────────────────────── */}
      <section className="section section-white" id="programs">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 36, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="sec-eyebrow ey-purple">What We Do</div>
            <h2 className="sec-h2">Programs that transform lives</h2>
            <p className="sec-desc">From classrooms to caregiving — every program runs daily, 365 days a year.</p>
          </div>
        </div>
        <div className="programs-grid">
          {[
            { bg: 'var(--saffron-l)', color: 'var(--saffron-d)', icon: 'ti-school', title: 'Education Support', desc: 'All children enrolled in quality schools. Daily homework help, tuition classes, and annual exam preparation by trained volunteers.', tags: ['School Enrollment', 'Tuition', 'Skill Training'] },
            { bg: 'var(--purple-l)', color: 'var(--purple-d)', icon: 'ti-stethoscope', title: 'Medical & Health', desc: 'Resident nurse provides daily care. Monthly doctor visits, annual health check-ups, and emergency care for all 115 residents.', tags: ['On-site Nurse', 'Doctor Visits', 'Medicines'] },
            { bg: 'var(--teal-l)', color: 'var(--teal)', icon: 'ti-yoga', title: 'Wellness & Yoga', desc: 'Dedicated yoga instructor for elders every morning. Children practice mindfulness and physical education. Counseling available for all.', tags: ['Daily Yoga', 'Counseling', 'Recreation'] },
            { bg: 'var(--earth-l)', color: 'var(--earth)', icon: 'ti-tools', title: 'Vocational Training', desc: 'Teenagers (16+) receive hands-on training in tailoring, computers, and small business management for independent lives.', tags: ['Tailoring', 'Computers', 'Life Skills'] },
            { bg: 'var(--rose-l)', color: 'var(--rose)', icon: 'ti-music', title: 'Arts & Culture', desc: 'Weekly music, dance, and art classes. Elders teach traditional crafts and stories. Every festival celebrated together.', tags: ['Music', 'Dance', 'Festivals'] },
            { bg: '#E6F1FB', color: '#185FA5', icon: 'ti-bowl-spoon', title: 'Nutrition & Meals', desc: 'Three nutritious meals and two snacks every day. Special diets for diabetic and cardiac elders. Festival feasts with love.', tags: ['3 Meals/Day', 'Special Diets', 'Nutrition'] },
          ].map(p => (
            <div key={p.title} className="prog-card">
              <div className="prog-icon" style={{ background: p.bg, color: p.color }}><i className={`ti ${p.icon}`}></i></div>
              <div className="prog-title">{p.title}</div>
              <div className="prog-desc">{p.desc}</div>
              <div className="prog-tags">{p.tags.map(t => <span key={t} className="prog-tag">{t}</span>)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW TO HELP ──────────────────────────────────────────────────── */}
      <section className="section section-alt" id="help">
        <div className="text-center mb-8">
          <div className="sec-eyebrow ey-saffron" style={{ justifyContent: 'center' }}>Make a Difference</div>
          <h2 className="sec-h2">How you can help</h2>
          <p className="sec-desc" style={{ margin: '0 auto' }}>Whether it's money, time, or goods — every contribution changes a life.</p>
        </div>
        <div className="help-grid">
          <div className="help-card donate">
            <div className="help-icon"><i className="ti ti-heart-filled"></i></div>
            <div className="help-title">Donate Money</div>
            <div className="help-desc">Your donation directly funds meals, medicines, education, and day-to-day care for our 115 residents. 80G tax exemption available.</div>
            <div className="help-amounts">
              {['₹500', '₹1,000', '₹2,500', '₹5,000'].map(a => (
                <div key={a} className={`amt-chip ${helpAmtActive === a ? 'active' : ''}`} onClick={() => setHelpAmtActive(a)}>{a}</div>
              ))}
            </div>
            <button className="btn-help d" onClick={() => openModal(helpAmtActive.replace('₹', '').replace(',', ''))}>
              <i className="ti ti-heart"></i> Donate Now
            </button>
          </div>
          <div className="help-card volunteer">
            <div className="help-icon"><i className="ti ti-users"></i></div>
            <div className="help-title">Volunteer</div>
            <div className="help-desc">Spend a Sunday with us. Teach, cook, play, or just sit and talk. Your time is the most precious gift for our family.</div>
            <div className="help-amounts">
              {['Weekends', 'Teach', 'Medical', 'Events'].map(v => (
                <div key={v} className={`amt-chip ${volTypeActive === v ? 'active' : ''}`} onClick={() => setVolTypeActive(v)}>{v}</div>
              ))}
            </div>
            <button className="btn-help v" onClick={() => scrollTo('contact')}>
              <i className="ti ti-calendar-plus"></i> Register to Volunteer
            </button>
          </div>
          <div className="help-card goods">
            <div className="help-icon"><i className="ti ti-gift"></i></div>
            <div className="help-title">Donate Goods</div>
            <div className="help-desc">Clothes, books, groceries, medicines, toys, and household items are always needed. Drop off or we arrange pickup.</div>
            <div className="help-amounts">
              {['Clothes', 'Books', 'Medicines', 'Food'].map(g => (
                <div key={g} className={`amt-chip ${goodsTypeActive === g ? 'active' : ''}`} onClick={() => setGoodsTypeActive(g)}>{g}</div>
              ))}
            </div>
            <button className="btn-help g" onClick={() => scrollTo('contact')}>
              <i className="ti ti-truck-delivery"></i> Arrange a Donation
            </button>
          </div>
        </div>
      </section>

      {/* ── IMPACT CALCULATOR ────────────────────────────────────────────── */}
      <div className="calc-section">
        <div className="calc-inner">
          <div className="sec-eyebrow ey-teal" style={{ justifyContent: 'center', color: 'rgba(255,255,255,.5)' }}>See Your Impact</div>
          <h2 className="sec-h2" style={{ color: '#fff', textAlign: 'center', fontSize: 28 }}>What does your donation do?</h2>
          <div className="calc-slider-wrap">
            <div className="calc-amount-display">
              <span className="calc-rupee">₹</span>{calcAmount.toLocaleString('en-IN')}
            </div>
            <div className="calc-presets">
              {[500, 1000, 2500, 5000, 10000].map(v => (
                <div key={v} className={`calc-preset ${calcAmount === v ? 'active' : ''}`} onClick={() => setCalcAmount(v)}>
                  ₹{v.toLocaleString('en-IN')}
                </div>
              ))}
            </div>
            <input
              type="range" className="range-input" min={100} max={50000} step={100}
              value={calcAmount} onChange={e => setCalcAmount(Number(e.target.value))}
              style={{ background: `linear-gradient(90deg, var(--saffron) ${(calcAmount / 50000) * 100}%, rgba(255,255,255,.2) ${(calcAmount / 50000) * 100}%)` }}
            />
          </div>
          <div className="calc-impact-card">
            <div className="calc-impact-text">= {impact.text}</div>
            <div className="calc-impact-sub">{impact.sub}</div>
          </div>
          <button className="btn-calc-donate" onClick={() => openModal(String(calcAmount))}>
            <i className="ti ti-heart-filled"></i> Donate ₹{calcAmount.toLocaleString('en-IN')} Now
          </button>
        </div>
      </div>

      {/* ── GALLERY ──────────────────────────────────────────────────────── */}
      <section className="section section-white" id="gallery">
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="sec-eyebrow ey-teal">Life at Aasha Bhavan</div>
            <h2 className="sec-h2">Moments from our home</h2>
          </div>
          <button className="btn-outline" style={{ padding: '8px 20px', borderRadius: 10 }}>View Full Gallery →</button>
        </div>
        <div className="gallery-grid">
          {(galleryPhotos ?? [
            { id: 'g1', url: null, caption: 'Children playing in the courtyard', category: 'children', is_featured: true },
            { id: 'g2', url: null, caption: "Elders' morning yoga session", category: 'elderly', is_featured: true },
            { id: 'g3', url: null, caption: 'After-school tuition class', category: 'activity', is_featured: false },
            { id: 'g4', url: null, caption: 'Music & dance practice', category: 'children', is_featured: false },
            { id: 'g5', url: null, caption: "Elders' wellness program", category: 'elderly', is_featured: false },
            { id: 'g6', url: null, caption: 'Kitchen team preparing festival meal', category: 'activity', is_featured: false },
            { id: 'g7', url: null, caption: 'Birthday celebration', category: 'children', is_featured: false },
          ] as Array<{ id: string; url: string | null; caption: string; category: string; is_featured: boolean }>)
            .slice(0, 7)
            .map((g, i) => {
              const catCls: Record<string, string> = { children: 'kids', elderly: 'elder', activity: 'activity', event: 'kids' };
              const catIcon: Record<string, string> = { children: 'ti-friends', elderly: 'ti-yoga', activity: 'ti-school', event: 'ti-gift' };
              const cls = catCls[g.category] || 'kids';
              const icon = catIcon[g.category] || 'ti-photo';
              const isSpan = i === 0;
              return (
                <div key={g.id} className={`gal-item ${cls} ${isSpan ? 'gal-span' : ''}`}
                  style={isSpan ? { gridColumn: 'span 2', gridRow: 'span 2', borderRadius: 16 } : {}}
                  onClick={() => setLightbox({ icon, caption: g.caption })}>
                  {g.url
                    ? <img src={g.url} alt={g.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                    : <i className={`ti ${icon} gal-icon`}></i>}
                  <div className="gal-overlay"><i className="ti ti-zoom-in" style={{ color: '#fff', fontSize: 24 }}></i></div>
                  <div className="gal-caption">{g.caption}</div>
                </div>
              );
            })}
        </div>
      </section>

      {/* ── UPCOMING EVENTS ──────────────────────────────────────────────── */}
      <section className="section section-alt" id="events">
        <div className="text-center mb-8">
          <div className="sec-eyebrow ey-purple" style={{ justifyContent: 'center' }}>Join Us</div>
          <h2 className="sec-h2">Upcoming Events</h2>
          <p className="sec-desc" style={{ margin: '0 auto' }}>Visit, volunteer, donate goods, or celebrate with us. Our doors are always open.</p>
        </div>
        <div className="events-grid">
          {EVENTS.map(ev => (
            <div key={ev.id} className="event-card">
              <div className={`event-header ${ev.type}`}></div>
              <div className="event-body">
                <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                  <div className="event-date-badge">
                    <div className="event-date-day">{ev.day}</div>
                    <div className="event-date-month">{ev.month}</div>
                  </div>
                  <div>
                    <div className="event-title">{ev.title}</div>
                    <div className="event-time"><i className="ti ti-clock" style={{ fontSize: 12 }}></i>{ev.time}</div>
                  </div>
                </div>
                <div className="event-desc">{ev.desc}</div>
                <div className="event-footer">
                  <div className="event-spots">
                    {ev.spots > 0 ? `${ev.spots} spots left` : <span style={{ color: 'var(--teal)', fontWeight: 500 }}>Open to all</span>}
                  </div>
                  {registeredEvents.has(ev.id) ? (
                    <span style={{ fontSize: 12, color: 'var(--teal)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <i className="ti ti-circle-check"></i> Registered
                    </span>
                  ) : (
                    <button className={`btn-register ${ev.type}`} onClick={() => setRegisteredEvents(s => { const n = new Set(Array.from(s)); n.add(ev.id); return n; })}>
                      Register Free
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────────────── */}
      <section className="section section-white" id="stories">
        <div className="text-center mb-8">
          <div className="sec-eyebrow ey-purple" style={{ justifyContent: 'center' }}>Stories of Hope</div>
          <h2 className="sec-h2">Words from our family</h2>
        </div>
        <div className="stories-grid">
          {[
            { quote: 'Aasha Bhavan gave me a mother when I had none. Today I am in engineering college, and I visit every month to teach the younger children. This place is my heart.', name: 'Suresh Kumar', role: 'Former resident, now Engineer · Admitted 2009', type: 'k' },
            { quote: 'After my children moved abroad, I felt completely alone. Here I found warmth, purpose, and 47 new grandchildren who call me Nanna every single day.', name: 'Raghunath Garu', role: 'Elderly resident since 2017 · Age 76', type: 'e' },
            { quote: 'I\'ve been volunteering here for 3 years. The way the elderly and children interact — it\'s the most beautiful thing I\'ve ever seen. I come every Sunday now.', name: 'Anitha Reddy', role: 'Volunteer & Monthly Donor', type: 'd' },
          ].map((s, i) => (
            <div key={i} className="story-card">
              <div className="story-quote-mark">"</div>
              <div className="story-text">{s.quote}</div>
              <div className="story-author">
                <div className={`story-avatar ${s.type}`}><i className="ti ti-user"></i></div>
                <div>
                  <div className="story-name">{s.name}</div>
                  <div className="story-role">{s.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────────────────── */}
      <div className="newsletter-section">
        <div className="newsletter-inner">
          <div className="sec-eyebrow ey-teal" style={{ justifyContent: 'center', color: 'rgba(255,255,255,.5)' }}>Stay Connected</div>
          <h2 className="sec-h2" style={{ color: '#fff', textAlign: 'center', fontSize: 26 }}>Get monthly updates from our family</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,.5)', textAlign: 'center', fontWeight: 300, marginTop: 8 }}>
            Stories, impact reports, upcoming events, and urgent appeals — delivered to your inbox once a month.
          </p>
          {nlSent ? (
            <div style={{ textAlign: 'center', marginTop: 24, color: '#A3EDCC', fontSize: 15 }}>
              <i className="ti ti-circle-check" style={{ fontSize: 32, display: 'block', marginBottom: 8 }}></i>
              Thank you! You'll hear from us soon.
            </div>
          ) : (
            <form className="nl-form" onSubmit={handleNl}>
              <input type="email" className="nl-input" placeholder="your@email.com" value={nlEmail} onChange={e => setNlEmail(e.target.value)} required />
              <button type="submit" className="btn-nl"><i className="ti ti-send"></i> Subscribe</button>
            </form>
          )}
          <div className="nl-note">No spam. Unsubscribe anytime. We send at most one email per month.</div>
        </div>
      </div>

      {/* ── CONTACT ──────────────────────────────────────────────────────── */}
      <section className="section section-white" id="contact">
        <div className="contact-grid">
          <div>
            <div className="sec-eyebrow ey-saffron">Reach Us</div>
            <h2 className="sec-h2">Come meet our family</h2>
            <p className="sec-desc">We welcome visitors, volunteers, and donors. Come see for yourself how your love changes lives — call ahead and we'll make chai.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 24 }}>
              {[
                { icon: 'ti-map-pin', bg: 'var(--saffron-l)', color: 'var(--saffron-d)', label: 'Address', val: 'Plot 47, Banjara Hills Road No.12', sub: 'Hyderabad, Telangana 500034' },
                { icon: 'ti-phone', bg: 'var(--purple-l)', color: 'var(--purple-d)', label: 'Phone', val: '+91 98480 XXXXX', sub: 'Mon–Sat, 9 AM – 6 PM' },
                { icon: 'ti-mail', bg: 'var(--teal-l)', color: 'var(--teal)', label: 'Email', val: 'care@aashabhavanhyderabad.org', sub: 'We respond within 24 hours' },
                { icon: 'ti-clock', bg: 'var(--teal-l)', color: 'var(--teal)', label: 'Visiting Hours', val: 'Saturday & Sunday · 10 AM – 4 PM', sub: 'Weekday visits by appointment only' },
              ].map(c => (
                <div key={c.label} className="ci-item">
                  <div className="ci-icon" style={{ background: c.bg, color: c.color }}><i className={`ti ${c.icon}`}></i></div>
                  <div>
                    <div className="ci-label">{c.label}</div>
                    <div className="ci-val">{c.val}</div>
                    <div className="ci-sub">{c.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            {contactSent ? (
              <div className="contact-form form-success">
                <div className="form-success-icon">💚</div>
                <h3>Message Received!</h3>
                <p>Thank you for reaching out. Our team will get back to you within 24 hours. We look forward to welcoming you to our family.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleContact}>
                <div className="form-title">Send us a message</div>
                <div className="form-sub">Volunteer inquiries, donation coordination, or just to say hello.</div>
                <div className="form-row">
                  <div>
                    <label className="form-label">Your Name</label>
                    <input className="form-input" placeholder="Full name" type="text" value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))} required />
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+91 XXXXX XXXXX" type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" placeholder="you@email.com" type="email" value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">I want to</label>
                  <select className="form-select" value={contactForm.intent} onChange={e => setContactForm(f => ({ ...f, intent: e.target.value }))}>
                    <option>Donate money</option>
                    <option>Volunteer my time</option>
                    <option>Donate goods / items</option>
                    <option>Sponsor a child / elder</option>
                    <option>Corporate CSR partnership</option>
                    <option>Just say hello</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea className="form-textarea" placeholder="Tell us a little about yourself or your interest..." value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))} />
                </div>
                <button type="submit" className="btn-submit" disabled={contactSending}>
                  {contactSending ? <div className="spinner"></div> : <><i className="ti ti-send"></i> Send Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="logo" style={{ marginBottom: 14 }}>
              <div className="logo-mark"><i className="ti ti-home-heart"></i></div>
              <div>
                <div className="logo-name" style={{ color: '#fff' }}>Aasha Bhavan</div>
                <div className="logo-sub">Home of Hope</div>
              </div>
            </div>
            <p className="footer-about">
              A home where children find love and elders find dignity. Every day since 2008, we have been one family — 115 souls strong — in the heart of Hyderabad.
            </p>
            <div className="footer-socials">
              {[
                { icon: 'ti-brand-facebook', href: '#' },
                { icon: 'ti-brand-instagram', href: '#' },
                { icon: 'ti-brand-youtube', href: '#' },
                { icon: 'ti-brand-whatsapp', href: 'https://wa.me/919848000000' },
              ].map(s => (
                <a key={s.icon} className="fsocial" href={s.href} target="_blank" rel="noopener noreferrer">
                  <i className={`ti ${s.icon}`}></i>
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="footer-col">About Us</h4>
            <div className="footer-links">
              {['Our Story', 'Our Team', 'Annual Reports', 'Legal Documents', 'Media Coverage'].map(l => <a key={l}>{l}</a>)}
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.4)', marginBottom: 16, fontWeight: 500 }}>Get Involved</h4>
            <div className="footer-links">
              <a onClick={() => openModal()} style={{ cursor: 'pointer' }}>Donate Now</a>
              <a onClick={() => scrollTo('help')} style={{ cursor: 'pointer' }}>Volunteer</a>
              <a onClick={() => { setResidentTab('kids'); scrollTo('residents'); }} style={{ cursor: 'pointer' }}>Sponsor a Child</a>
              <a onClick={() => { setResidentTab('elder'); scrollTo('residents'); }} style={{ cursor: 'pointer' }}>Sponsor an Elder</a>
              <a onClick={() => scrollTo('contact')} style={{ cursor: 'pointer' }}>Corporate CSR</a>
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '.08em', color: 'rgba(255,255,255,.4)', marginBottom: 16, fontWeight: 500 }}>Programs</h4>
            <div className="footer-links">
              {['Education', 'Healthcare', 'Vocational Training', 'Wellness & Yoga', 'Arts & Culture'].map(l => <a key={l}>{l}</a>)}
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© 2025 Aasha Bhavan. All rights reserved. Made with ♥ in Hyderabad.</p>
          <div className="footer-reg">
            <div className="freg"><i className="ti ti-shield-check" style={{ color: 'var(--teal)', fontSize: 13 }}></i> Reg. No: AP/2008/0XXXXX</div>
            <div className="freg"><i className="ti ti-receipt-tax" style={{ color: 'var(--teal)', fontSize: 13 }}></i> 80G: AAATA0000A/2021-22</div>
            <div className="freg"><i className="ti ti-world" style={{ color: 'var(--teal)', fontSize: 13 }}></i> FCRA: 010XXXXXX</div>
          </div>
        </div>
      </footer>

      {/* ── DONATION MODAL ───────────────────────────────────────────────── */}
      <div className={`modal-overlay ${modalOpen ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) { setModalOpen(false); setDonationSuccess(false); } }}>
        <div className="modal">
          <button className="modal-close" onClick={() => { setModalOpen(false); setDonationSuccess(false); }}>
            <i className="ti ti-x"></i>
          </button>
          {donationSuccess ? (
            <div className="modal-success">
              <div className="modal-success-icon">🎉</div>
              <h3>Thank You, {donorName || 'Donor'}!</h3>
              <p>Your generous donation of ₹{displayAmt.toLocaleString('en-IN')} has been received. Your 80G tax receipt will be emailed to {donorEmail || 'you'} within 24 hours.</p>
              <p style={{ fontSize: 13, color: 'var(--teal)', marginTop: 12, fontWeight: 500 }}>
                <i className="ti ti-heart-filled"></i> You are now part of our family.
              </p>
              <button className="btn-donate-now" style={{ marginTop: 20 }} onClick={() => { setModalOpen(false); setDonationSuccess(false); }}>
                Close
              </button>
            </div>
          ) : (
            <>
              <div className="modal-title">Support Aasha Bhavan</div>
              <div className="modal-sub">Your donation provides meals, medicines &amp; education to 115 residents.</div>
              <div className="modal-toggle">
                <button className={`mtog ${donFreq === 'once' ? 'active' : ''}`} onClick={() => setDonFreq('once')}>One-time Donation</button>
                <button className={`mtog ${donFreq === 'monthly' ? 'active' : ''}`} onClick={() => setDonFreq('monthly')}>Monthly Donation</button>
              </div>
              <div className="modal-amounts">
                {AMOUNTS.map(a => (
                  <div key={a.value} className={`m-amt ${selectedAmt === a.value ? 'active' : ''}`} onClick={() => setSelectedAmt(a.value)}>
                    <div className="m-amt-val">{a.label}</div>
                    <div className="m-amt-impact">{a.impact}</div>
                  </div>
                ))}
              </div>
              {selectedAmt === 'custom' && (
                <input type="number" className="modal-custom" placeholder="Enter custom amount (₹)" value={customAmt} onChange={e => setCustomAmt(e.target.value)} autoFocus />
              )}
              <div className="modal-cause">
                <label>Donate towards</label>
                <div className="cause-chips">
                  {['Where needed most', "Children's Education", 'Elderly Medical Care', 'Food & Nutrition', 'Infrastructure'].map(c => (
                    <div key={c} className={`cause-chip ${cause === c ? 'active' : ''}`} onClick={() => setCause(c)}>{c}</div>
                  ))}
                </div>
              </div>
              <div className="donor-fields">
                <input type="text" className="modal-input" placeholder="Your name" value={donorName} onChange={e => setDonorName(e.target.value)} />
                <input type="tel" className="modal-input" placeholder="Phone (optional)" value={donorPhone} onChange={e => setDonorPhone(e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <input type="email" className="modal-input" placeholder="Email (for 80G receipt)" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} style={{ width: '100%' }} />
              </div>
              <button className="btn-donate-now" onClick={handleDonate} disabled={donating}>
                {donating ? <div className="spinner"></div> : <><i className="ti ti-heart-filled"></i> Proceed to Pay — ₹{displayAmt.toLocaleString('en-IN')}</>}
              </button>
              <div className="modal-note">
                🔒 Secure payment via Razorpay &nbsp;·&nbsp; 80G receipt issued automatically<br />No platform fees — 100% goes directly to residents
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      {lightbox && (
        <div className="lightbox open" onClick={() => setLightbox(null)}>
          <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close" onClick={() => setLightbox(null)}><i className="ti ti-x"></i></button>
            <i className={`ti ${lightbox.icon} lightbox-icon`} style={{ color: 'var(--saffron-l)' }}></i>
            <div style={{ position: 'absolute', bottom: 16, left: 0, right: 0, textAlign: 'center', color: 'rgba(255,255,255,.6)', fontSize: 13 }}>
              {lightbox.caption}
            </div>
          </div>
        </div>
      )}

      {/* ── WHATSAPP FAB ─────────────────────────────────────────────────── */}
      <a className="whatsapp-fab" href="https://wa.me/919848000000?text=Hello%20Aasha%20Bhavan%2C%20I%20would%20like%20to%20know%20more" target="_blank" rel="noopener noreferrer">
        <div className="whatsapp-tooltip">Chat with us on WhatsApp</div>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </>
  );
}
