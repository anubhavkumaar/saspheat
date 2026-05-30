import { useState, useEffect, useRef } from 'react'
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import './App.css'
import akLogo from './assets/blue.png'

/* ── Asset resolution via Vite glob ─────────────────────────── */
const _imgs = import.meta.glob('./assets/*.{jpg,jpeg,png,gif,webp}', { eager: true })
const _get  = (...names) => names.reduce((a, n) => a || (_imgs[`./assets/${n}`]?.default ?? null), null)
// Logo: always use /heat_new.png from public (served at root by Vite)
const HEAT_LOGO_SRC = '/heat_new.png'
const heroBg = _get('hero-bg.jpg',   'hero-bg.jpeg',  'hero-bg.png')
const pitImg = _get('pit-scene.jpg', 'pit-scene.jpeg', 'pit-scene.png')
const carGif = _get('car-chase.gif')

/* ── ICONS ────────────────────────────────────────────────────── */
const Icon = {
  arrow:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>,
  car:      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9l3-4h12l3 4v6a2 2 0 0 1-2 2h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>,
  heli:     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="10" width="20" height="8" rx="2"/><path d="M12 10V6"/><path d="M2 10l4-6h12l4 6"/><path d="M12 18v3"/><path d="M8 21h8"/></svg>,
  target:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  shield:   <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  doc:      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  flag:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
  stop:     <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
  chevrons: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>,
  warn:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:1}}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  upload:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
}

/* ── SHIELD LOGO — uses /heat.png from public folder ─────────── */
function ShieldLogo({ size = 40 }) {
  return (
    <img
      src={HEAT_LOGO_SRC}
      alt="HEAT"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block', imageRendering: 'high-quality' }}
    />
  )
}

/* ── SPEED LINES ──────────────────────────────────────────── */
function SpeedLines({ count = 14, gold = false }) {
  const lines = Array.from({ length: count }, (_, i) => ({
    x: (i / count) * 100,
    op: gold ? (0.025 + (i % 4) * 0.015) : (0.04 + (i % 3) * 0.02),
    delay: (i * 0.19) % 2.2,
    dur: 0.8 + (i % 3) * 0.25,
  }))
  return (
    <div className="speed-lines" aria-hidden="true">
      {lines.map((l, i) => (
        <motion.div key={i} className="speed-line"
          style={{ left: `${l.x}%`, opacity: 0 }}
          animate={{ opacity: [0, l.op, 0] }}
          transition={{ duration: l.dur, delay: l.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}

/* ── REVEAL ──────────────────────────────────────────────── */
function Reveal({ children, delay = 0, dir = 'up' }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const initial = { up: { y: 32, x: 0 }, left: { y: 0, x: -32 }, right: { y: 0, x: 32 } }[dir]
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, ...initial }}
      animate={inView ? { opacity: 1, y: 0, x: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] }}>
      {children}
    </motion.div>
  )
}

/* ── NAVBAR ──────────────────────────────────────────────── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h)
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => setOpen(false), [loc.pathname])

  const links = [
    { label: 'Home',       path: '/'           },
    { label: 'Racing SOP', path: '/racing-sop' },
    { label: 'SOI',        path: '/soi'        },
  ]

  return (
    <motion.nav className={`nav ${scrolled ? 'scrolled' : ''}`}
      initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}>

      {/* Brand — left */}
      <button className="nav-brand" onClick={() => navigate('/')} aria-label="HEAT home">
        <div className="nav-logo-wrap">
          <img src={HEAT_LOGO_SRC} alt="HEAT" width={54} height={54}
            style={{ objectFit: 'contain', display: 'block' }}/>
        </div>
        <div className="nav-wordmark">
          <span className="nav-title">HEAT</span>
          <span className="nav-sub">Highway Enforcement of Aggressive Traffic</span>
          <span className="nav-dept">High-Speed Pursuit Interceptors</span>
        </div>
      </button>

      {/* Links + burger — right column */}
      <div className="nav-right">
        <ul className="nav-links">
          {links.map((l, i) => (
            <li key={l.path} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <span className="nav-link-sep"/>}
              <Link className={`nav-link${loc.pathname === l.path ? ' nav-link--active' : ''}`} to={l.path}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        {/* Mobile burger — inside nav-right so it sits at the right edge */}
        <button className="nav-burger" onClick={() => setOpen(v => !v)} aria-label="Menu">
          {[0, 1, 2].map(i => <span key={i} className="burger-line"/>)}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="nav-mobile-drawer"
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            {links.map(l => (
              <Link key={l.path} className={`nav-link${loc.pathname === l.path ? ' nav-link--active' : ''}`}
                to={l.path} style={{ display: 'block' }}>
                {l.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

/* ── HERO BACKGROUND ─────────────────────────────────────── */
const VIDEO_SRC   = '/just_at_last_use_this_logo_tha.mp4'
// Trim: set TRIM_START / TRIM_END (seconds) to loop a specific clip window.
// Set TRIM_END to null to play to the natural end of the file.
const TRIM_START  = 0
const TRIM_END    = null

function HeroBg() {
  const videoRef = useRef(null)

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = TRIM_START

    const onTime = () => {
      if (TRIM_END !== null && v.currentTime >= TRIM_END) {
        v.currentTime = TRIM_START
      }
    }
    const onEnded = () => { v.currentTime = TRIM_START; v.play() }

    v.addEventListener('timeupdate', onTime)
    v.addEventListener('ended', onEnded)
    return () => {
      v.removeEventListener('timeupdate', onTime)
      v.removeEventListener('ended', onEnded)
    }
  }, [])

  return (
    <div className="hero-bg">
      <video
        ref={videoRef}
        className="hero-bg-video"
        src={VIDEO_SRC}
        autoPlay
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />
      <div className="hero-bg-overlay"/>
    </div>
  )
}

/* ── HOME ────────────────────────────────────────────────── */
function HomePage() {
  return (
    <>
      <section className="hero" id="hero">
        <HeroBg/>
        <div className="hero-watermark-cover"/>
        <SpeedLines count={16}/>

        <div className="hero-content">
          {/* Hero badge — large logo */}
          <motion.div className="hero-logo-large"
            initial={{ opacity: 0, scale: 0.8, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            <img src={HEAT_LOGO_SRC} alt="HEAT" draggable={false}/>
          </motion.div>

          <motion.div className="hero-eyebrow"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <span className="eyebrow-line"/>
            Highway Enforcement of Aggressive Traffic
            <span className="eyebrow-line"/>
          </motion.div>

          <motion.h1 className="hero-h1"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
            HEAT
          </motion.h1>

          <motion.p className="hero-subtitle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}>
            High-Speed Pursuit Interceptor Unit
          </motion.p>

          {/* Status row */}
          <motion.div className="hero-status-bar"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>
            <div className="status-cell active">
              <span className="status-dot pulse"/>
              Unit Active
            </div>
            <div className="status-cell active">
              <span className="status-dot pulse"/>
              ASD Online
            </div>
            <div className="status-cell active">
              <span className="status-dot"/>
              PIT Authorized
            </div>
            <div className="status-cell">
              HWY-1 · NB
            </div>
          </motion.div>

          <motion.div className="hero-actions"
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}>
            <Link to="/racing-sop" className="btn-primary">
              {Icon.arrow} Racing SOP
            </Link>
            <Link to="/soi" className="btn-ghost">
              View SOI
            </Link>
          </motion.div>
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span>Scroll</span>
          <div className="scroll-caret"/>
        </div>
      </section>

      {/* Overview band */}
      <section className="sec sec--dark sec--overview">
        <div className="sec-overview-bg" style={{ backgroundImage: 'url(/gta-pd-1.jpg)' }}/>
        <div className="sec-inner" style={{ position: 'relative', zIndex: 2 }}>
          <Reveal>
            <div className="sec-head">
              <div className="sec-kicker">Unit Overview</div>
              <h2 className="sec-title">Who We Are</h2>
              <p className="sec-sub">HEAT deploys purpose-built interceptor vehicles on highways to identify, track, and neutralize street racers and aggressive drivers.</p>
              <div className="sec-rule"/>
            </div>
          </Reveal>

          <div className="overview-band">
            {[
              { icon: Icon.chevrons, title: 'Post-Race Pursuit', sub: 'Controlled Intercept', body: 'Once the race concludes, HEAT initiates a standard pursuit on the identified suspect. Officers hold position during the active race.',    img: '/gta-pd-1.jpg' },
              { icon: Icon.target, title: 'PIT Maneuver',    sub: 'Tactical Intervention',   body: 'Authorized post-race only. Officers are trained for precision PIT execution against fleeing vehicles in confirmed pursuit scenarios.',    img: '/gta-pd-4.jpg' },
              { icon: Icon.shield, title: 'Tire Disable',    sub: 'Escalation Protocol',     body: '4th vehicle in a switch: authorized by default. 3rd vehicle: requires command sign-off. Not to be used during active race.',             img: '/gta-pd-6.jpg' },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="overview-cell">
                  <div className="ov-img-wrap">
                    <img src={c.img} alt="" className="ov-img" loading="lazy"/>
                    <div className="ov-img-fade"/>
                  </div>
                  <div className="ov-content">
                    <div className="ov-icon icon">{c.icon}</div>
                    <div className="ov-title">{c.title}</div>
                    <div className="ov-sub">{c.sub}</div>
                    <p className="ov-body">{c.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

/* ── RACING SOP ──────────────────────────────────────────── */
const SOP_STEPS = [
  {
    num: '01', title: 'Intelligence Collection', icon: Icon.doc,
    text: 'Whenever you observe multiple speeding vehicles or a location where racers are gathering, officers must first collect all possible evidence — vehicle number plates, models, colors, and any other identifying details.',
  },
  {
    num: '02', title: 'Allow the Race to Begin', icon: Icon.flag,
    text: 'Once the race begins, or when the vehicles pass your position, allow the racers to pass first and begin following the last vehicle in the group. Officers must not interfere with the race while it is active.',
    alert: 'Do not engage or activate emergency lights while the race is in progress.',
  },
  {
    num: '03', title: 'No PIT During Active Race', icon: Icon.stop,
    text: 'Do not perform PIT maneuvers or activate emergency lights and sirens if multiple racing vehicles are still grouped together. This creates unnecessary danger and confusion for both officers and civilians.',
    alert: 'PIT maneuvers are prohibited while racers remain grouped.',
  },
  {
    num: '04', title: 'Post-Race Pursuit', icon: Icon.chevrons,
    text: 'After the race has concluded, officers may initiate a standard pursuit on the identified vehicle. At the finish line, officers must avoid ramming or performing PIT maneuvers on any vehicle.',
  },
  {
    num: '05', title: 'Vehicle Switch Protocol', icon: Icon.target,
    text: "If vehicle switches occur during the pursuit, officers are authorized to disable the tires of the fourth vehicle involved. The third vehicle's tires may be disabled if necessary, subject to command authorization.",
    alert: 'Tire disable on the 3rd vehicle requires command authorization.',
  },
]

function RacingSopPage() {
  return (
    <main style={{ paddingTop: 80 }}>
      <PageHero kicker="Standard Operating Procedure" title="Racing SOP" sub="HEAT Unit — Highway Enforcement Protocol" num="SOP" bgImg="/gta-pd-4.jpg"/>

      <section className="sec sec--dark sec--sop">
        <div className="sec-sop-bg" style={{ backgroundImage: 'url(/gta-pd-7.jpg)' }}/>
        <div className="sec-inner" style={{ position: 'relative', zIndex: 2 }}>
          <div className="sop-layout">
            {/* Steps */}
            <div>
              <Reveal>
                <div className="sec-head" style={{ marginBottom: '0' }}>
                  <div className="sec-kicker">Protocol Steps</div>
                  <h2 className="sec-title">Pursuit Protocol</h2>
                  <p className="sec-sub">Follow these steps in sequence during any street racing enforcement operation.</p>
                  <div className="sec-rule"/>
                </div>
              </Reveal>

              <div className="sop-steps" style={{ marginTop: '2rem' }}>
                {SOP_STEPS.map((s, i) => (
                  <Reveal key={i} delay={i * 0.07} dir="left">
                    <div className="sop-step">
                      <div className="sop-index">{s.num}</div>
                      <div className="sop-body">
                        <div className="sop-title">{s.title}</div>
                        <p className="sop-text">{s.text}</p>
                        {s.alert && (
                          <div className="sop-alert">
                            {Icon.warn}
                            {s.alert}
                          </div>
                        )}
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <Reveal delay={0.25} dir="right">
              <div className="sop-sidebar">
                <div className="sidebar-card">
                  <div className="sidebar-card-title">Quick Reference</div>
                  <div className="qref-row">
                    {[
                      { label: 'During race',       val: 'Follow last car',     cls: 'ok'  },
                      { label: 'PIT during race',   val: 'Prohibited',          cls: 'no'  },
                      { label: 'PIT at finish',     val: 'Prohibited',          cls: 'no'  },
                      { label: 'Tire disable — 4th', val: 'Authorized',         cls: 'ok'  },
                      { label: 'Tire disable — 3rd', val: 'Cmd required',       cls: 'cmd' },
                      { label: 'Lights & sirens',   val: 'Post-race only',      cls: 'ok'  },
                    ].map((r, i) => (
                      <div key={i} className="qref-item">
                        <span className="qref-label">{r.label}</span>
                        <span className={`qref-val ${r.cls}`}>{r.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="sidebar-card">
                  <div className="sidebar-card-title">Key Principles</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
                    {[
                      'Evidence first — always.',
                      'Let the race run its course.',
                      'Pursue after the race ends.',
                      'PIT only where authorized.',
                      'Coordinate with ASD overhead.',
                    ].map((p, i) => (
                      <div key={i} style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                        <span style={{ color: 'var(--gold)', fontFamily: 'var(--mono)', fontSize: '.65rem', marginTop: '.15rem', flexShrink: 0 }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span style={{ fontSize: '.87rem', color: 'var(--t2)', lineHeight: 1.55 }}>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  )
}

/* ── SOI ─────────────────────────────────────────────────── */
function SOIPage() {
  return (
    <main style={{ paddingTop: 80 }}>
      <PageHero kicker="Standard Operating Instructions" title="SOI" sub="HEAT Unit — Roles & Purpose" num="SOI" bgImg="/gta-pd-5.jpg"/>

      <section className="sec sec--dark">
        <div className="sec-inner">

          {/* HEAT — primary, full-width emphasis */}
          <Reveal>
            <div className="sec-head">
              <div className="sec-kicker">Primary Unit</div>
              <h2 className="sec-title">SOI — HEAT</h2>
              <p className="sec-sub">Highway Enforcement of Aggressive Traffic</p>
              <div className="sec-rule"/>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <motion.div className="soi-card soi-card--primary" whileHover={{ y: -3 }} transition={{ type: 'spring', stiffness: 260 }}>
              <div className="soi-card-header">
                <div>
                  <div className="soi-unit">HEAT</div>
                  <div className="soi-unitname">Highway Enforcement of Aggressive Traffic</div>
                </div>
                <span className="soi-badge ground">Ground Unit</span>
              </div>
              <div className="soi-divider"/>
              <p className="soi-text">
                HEAT is a specialized highway enforcement unit built around one purpose — intercepting aggressive drivers and street racers that standard patrol units cannot match. Officers are assigned purpose-built, high-performance interceptor vehicles capable of sustaining pursuit at speeds that exceed most illegal race cars on the highway.
              </p>
              <p className="soi-text">
                During an active street race, HEAT's primary role is observation and positioning. Officers follow the last vehicle in the group, collect evidence, and hold their position until the race concludes. Once the race ends, HEAT initiates a controlled pursuit on the identified suspect.
              </p>
              <p className="soi-text">
                HEAT officers are authorized to perform PIT maneuvers and tire disablements only during post-race pursuit — never while the race is active. The unit's effectiveness depends entirely on patience, positioning, and precise intervention at the right moment.
              </p>
              <div className="soi-divider"/>
              <div className="soi-asd-note">
                <span className="soi-asd-label">ASD Support</span>
                <p className="soi-text" style={{ marginBottom: 0 }}>
                  Air Support Division provides aerial overwatch to assist HEAT ground units. When a lead racer pulls beyond ground pursuit range, ASD tracks from altitude and relays position data — keeping HEAT informed without premature engagement. ASD does not lead enforcement; it exists to make HEAT more effective.
                </p>
              </div>
              <div className="soi-tags" style={{ marginTop: '1.5rem' }}>
                {['High-Speed Interceptor', 'PIT Authorized', 'Post-Race Pursuit', 'Highway Operations', 'ASD Assisted'].map(t => (
                  <span key={t} className="tag tag-gold">{t}</span>
                ))}
              </div>
            </motion.div>
          </Reveal>

        </div>
      </section>
    </main>
  )
}

/* ── PAGE HERO ───────────────────────────────────────────── */
function PageHero({ kicker, title, sub, num, bgImg }) {
  return (
    <div className="page-hero" style={bgImg ? { '--ph-bg': `url(${bgImg})` } : {}}>
      {bgImg && <div className="page-hero-bg" style={{ backgroundImage: `url(${bgImg})` }}/>}
      <SpeedLines count={10}/>
      <div className="page-hero-inner">
        <div className="page-hero-kicker">{kicker}</div>
        <h1 className="page-hero-title">{title}</h1>
        <p className="page-hero-sub">{sub}</p>
        <div className="page-hero-divider"/>
      </div>
      <div className="page-hero-num" aria-hidden="true">{num}</div>
    </div>
  )
}

/* ── FOOTER ──────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-shield">
        <ShieldLogo size={32}/>
      </div>
      <div className="footer-name">HEAT</div>
      <p className="footer-sub">Highway Enforcement of Aggressive Traffic · High-Speed Pursuit Interceptors</p>
      <div className="footer-credit">
        <span className="footer-credit-label">Built &amp; maintained by</span>
        <a href="https://anubhavkumaar.in" target="_blank" rel="noopener noreferrer" className="credit-ak-link" aria-label="Anubhav Kumar">
          <img className="credit-ak" src={akLogo} alt="AK" width={32} height={32}/>
        </a>
      </div>
    </footer>
  )
}

/* ── APP ─────────────────────────────────────────────────── */
export default function App() {
  return (
    <>
      <Navbar/>
      <Routes>
        <Route path="/"           element={<HomePage/>}/>
        <Route path="/racing-sop" element={<RacingSopPage/>}/>
        <Route path="/soi"        element={<SOIPage/>}/>
      </Routes>
      <Footer/>
    </>
  )
}
