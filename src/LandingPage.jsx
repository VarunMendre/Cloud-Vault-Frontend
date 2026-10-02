import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Cloud,
  HardDrive,
  Link2,
  Search,
} from 'lucide-react';
import Footer from './components/Footer';
import LandingStepsSection from './LandingStepsSection';
import './LandingPage.css';

import dashboardImg from './assets/screenshots/dashboard.png';
import settingsImg from './assets/screenshots/settings.png';
import subscriptionImg from './assets/screenshots/subscription.png';

const productScreenshots = [
  {
    src: dashboardImg,
    alt: 'CloudVault sharing dashboard with shared files and collaboration tools',
    caption: 'Sharing dashboard',
    width: 1024,
    height: 533,
  },
  {
    src: settingsImg,
    alt: 'CloudVault settings showing storage usage and account preferences',
    caption: 'Storage settings',
    width: 1024,
    height: 412,
  },
  {
    src: subscriptionImg,
    alt: 'CloudVault subscription page showing a plan and storage usage',
    caption: 'Plan overview',
    width: 1024,
    height: 633,
  },
];

const faqItems = [
  {
    question: 'Can I start without paying?',
    answer:
      'Yes. The Free plan includes 500 MB of storage and supports files up to 100 MB each.',
  },
  {
    question: 'What storage comes with each plan?',
    answer:
      'Free includes 500 MB. Standard includes 100 GB monthly or 200 GB yearly. Premium includes 200 GB monthly or 300 GB yearly.',
  },
  {
    question: 'Does CloudVault sync my Google Drive automatically?',
    answer:
      'No. Choose the files you want to import from Google Drive. CloudVault does not automatically sync your Drive.',
  },
  {
    question: 'Can I decide who can access a shared file?',
    answer:
      'Yes. Share files with viewer or editor permissions, then manage or revoke access from your sharing pages.',
  },
  {
    question: 'How can I sign in?',
    answer:
      'Create an account with email and password, or use Google or GitHub sign-in. New email accounts verify with a one-time code.',
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);
  const [featureToast, setFeatureToast] = useState('');
  const [defaultShareRole, setDefaultShareRole] = useState('Viewer');
  const [quotaPreviewActive, setQuotaPreviewActive] = useState(false);
  const featureToastTimer = useRef(null);

  useEffect(() => () => window.clearTimeout(featureToastTimer.current), []);

  const showFeatureToast = (message) => {
    setFeatureToast(message);
    window.clearTimeout(featureToastTimer.current);
    featureToastTimer.current = window.setTimeout(() => setFeatureToast(''), 2600);
  };

  const handleFeatureCardClick = (event) => {
    const action = event.target.closest('[data-feature-open]');
    if (action) {
      event.stopPropagation();
      setActiveFeature(action.dataset.featureOpen);
      return;
    }

    if (event.target.closest('button, input, select, a')) return;
    const card = event.target.closest('[data-feature-card]');
    if (card) setActiveFeature(card.dataset.featureCard);
  };

  const handleFeatureCardKeyDown = (event) => {
    if (event.target.closest('button, input, select, a')) return;
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('[data-feature-card]');
    if (!card) return;
    event.preventDefault();
    setActiveFeature(card.dataset.featureCard);
  };

  const handleGetStarted = () => {
    const isLandingDomain =
      window.location.hostname === 'cloudvault.cloud' ||
      window.location.hostname === 'www.cloudvault.cloud';

    if (isLandingDomain) {
      window.location.href = 'https://app.cloudvault.cloud/login';
    } else {
      navigate('/login');
    }
  };

  const revealRefs = useRef([]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
    );

    revealRefs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, []);

  const addRevealRef = (element) => {
    if (element && !revealRefs.current.includes(element)) {
      revealRefs.current.push(element);
    }
  };

  return (
    <div className="landing-page" id="top">
      <a className="landing-skip-link" href="#main-content">
        Skip to content
      </a>

      <nav className="landing-nav" aria-label="Main navigation">
        <div className="landing-container landing-nav-inner">
          <a className="landing-brand" href="#top" aria-label="CloudVault home">
            <span className="landing-brand-mark" aria-hidden="true">
              <Cloud size={22} strokeWidth={2} />
            </span>
            <span>CloudVault</span>
          </a>

          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Plans</a>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
          </div>

          <button className="landing-button landing-button-small" type="button" onClick={handleGetStarted}>
            Sign in
          </button>
        </div>
      </nav>

      <main id="main-content">
        <section className="landing-hero" aria-labelledby="landing-hero-title">
          <div className="landing-container landing-hero-grid">
            <div className="landing-hero-copy">
              <p className="landing-kicker">Cloud storage that stays in your hands</p>
              <h1 id="landing-hero-title">
                Files, together.
                <span>Shared your way.</span>
              </h1>
              <p className="landing-hero-description">
                Store, find, and share files from one clear workspace. Choose who can view or edit
                what you share.
              </p>
              <div className="landing-hero-actions">
                <button className="landing-button" type="button" onClick={handleGetStarted}>
                  Create a free account
                  <ArrowRight size={18} aria-hidden="true" />
                </button>
                <a className="landing-text-link" href="#pricing">
                  Explore plans
                </a>
              </div>
            </div>

          </div>
        </section>

        <section className="landing-proof landing-section" aria-labelledby="landing-proof-title">
          <div className="landing-container">
            <div className="landing-section-heading landing-reveal" ref={addRevealRef}>
              <h2 id="landing-proof-title">A look inside CloudVault</h2>
              <p>Real product screens for sharing, storage settings, and your plan.</p>
            </div>
            <div className="landing-proof-grid">
              {productScreenshots.map((screenshot, index) => (
                <figure
                  className={`landing-proof-item landing-proof-item-${index + 1}`}
                  key={screenshot.caption}
                >
                  <div className="landing-image-frame">
                    <img
                      src={screenshot.src}
                      alt={screenshot.alt}
                      width={screenshot.width}
                      height={screenshot.height}
                      loading="lazy"
                    />
                  </div>
                  <figcaption>{screenshot.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-problem landing-section" aria-labelledby="landing-problem-title">
          <div className="landing-container landing-problem-grid">
            <div className="landing-reveal" ref={addRevealRef}>
              <p className="landing-problem-kicker">When work gets spread out</p>
              <h2 id="landing-problem-title">Too many places. Too much time spent searching.</h2>
            </div>
            <div className="landing-problem-copy landing-reveal" ref={addRevealRef}>
              <p>
                A file in one account, a shared link in another, and a storage limit at the wrong
                moment can turn a quick task into a string of interruptions.
              </p>
              <p>
                Bring your files, sharing controls, and storage into one workspace.
              </p>
            </div>
          </div>
          <div className="landing-container landing-friction-grid">
            <article className="landing-friction-item landing-reveal" ref={addRevealRef}>
              <Search size={20} aria-hidden="true" />
              <div>
                <h3>Searching through folders</h3>
                <p>Remembering where you saved a file takes time away from the task.</p>
              </div>
            </article>
            <article className="landing-friction-item landing-reveal" ref={addRevealRef}>
              <Link2 size={20} aria-hidden="true" />
              <div>
                <h3>Keeping track of shared links</h3>
                <p>It is harder to manage access when files and permissions are scattered.</p>
              </div>
            </article>
            <article className="landing-friction-item landing-reveal" ref={addRevealRef}>
              <HardDrive size={20} aria-hidden="true" />
              <div>
                <h3>Running short on storage</h3>
                <p>A limit can interrupt an upload when you are trying to get work done.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="landing-value landing-section" aria-labelledby="landing-value-title">
          <div className="landing-container">
            <div className="landing-section-heading landing-reveal" ref={addRevealRef}>
              <h2 id="landing-value-title">Space for the files you keep.</h2>
              <p>Start with a free plan, then choose more storage when you need it.</p>
            </div>

            <LandingPlansSection onGetStarted={handleGetStarted} addRevealRef={addRevealRef} />

            <section className="landing-features" id="features" aria-labelledby="landing-features-title">
              <div className="everyday-showcase" onClick={handleFeatureCardClick} onKeyDown={handleFeatureCardKeyDown}>
                <div className="everyday-atmosphere" aria-hidden="true">
                  <span className="everyday-glow everyday-glow-primary" />
                  <span className="everyday-glow everyday-glow-secondary" />
                </div>
                <div className="everyday-grid" aria-hidden="true" />
                <div className="everyday-inner">
                  <header className="everyday-header landing-reveal" ref={addRevealRef}>
                    <div className="everyday-spec-badge">
                      <span className="everyday-status-dot"><span /></span>
                      <span>Built for Production</span>
                      <i />
                      <span className="everyday-spec-version">v2.4 Core Spec</span>
                    </div>
                    <h3 id="landing-features-title">Made for everyday file work.</h3>
                    <p>Tools to organize, import, share, and keep track of your files. Engineered for speed, clarity, and rock-solid privacy.</p>
                  </header>

                  <div className="everyday-bento-grid">
                    <article className="bento-card bento-card-large bento-card-1 landing-reveal" data-feature-card="find-files" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Explore Find files feature preview" ref={addRevealRef}>
                      <span className="bento-card-glow" aria-hidden="true" />
                      <div className="bento-card-content">
                        <div className="bento-card-top">
                          <FeatureIcon className="bento-feature-icon" kind="folder" />
                          <div className="bento-top-labels">
                            <span className="bento-tag">Unified Index</span>
                            <span className="bento-tag bento-tag-brand">Sub-10ms</span>
                          <button className="bento-inspect" type="button" data-feature-open="find-files">Inspect <ArrowRight size={14} /></button>
                          </div>
                        </div>
                        <div className="bento-card-copy">
                          <h4>Find files without the hunt</h4>
                          <p>Keep files in folders, search by name, and preview documents and media from one workspace.</p>
                        </div>
                      </div>
                      <div className="bento-preview bento-search-preview">
                        <div className="bento-search-query"><Search size={16} /><span>annual-report_2025.pdf</span><i /></div>
                        <div className="bento-preview-tags"><span><i />Instant Filter</span><span>Multi-format Preview</span></div>
                      </div>
                    </article>

                    <article className="bento-card bento-card-2 landing-reveal" data-feature-card="share-permissions" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Explore Share permissions feature preview" ref={addRevealRef}>
                      <span className="bento-card-glow" aria-hidden="true" />
                      <div className="bento-card-content">
                        <div className="bento-card-top">
                          <FeatureIcon className="bento-feature-icon" kind="share" />
                          <span className="bento-card-actions"><span className="bento-live-label"><i />ACL Enforced</span><button className="bento-small-label" type="button" data-feature-open="share-permissions">Matrix <ArrowRight size={14} /></button></span>
                        </div>
                        <div className="bento-card-copy">
                          <h4>Share with clear permissions</h4>
                          <p>Invite people as viewers or editors, then manage or revoke access when it changes.</p>
                        </div>
                      </div>
                      <div className="bento-preview bento-role-preview">
                        <span>Default access: <strong>Active: {defaultShareRole}</strong></span>
                        <div className="bento-role-control" onClick={(event) => event.stopPropagation()}><button className={defaultShareRole === 'Viewer' ? 'is-selected' : ''} type="button" onClick={() => { setDefaultShareRole('Viewer'); showFeatureToast('Default share role changed to Viewer'); }}>Viewer</button><button className={defaultShareRole === 'Editor' ? 'is-selected' : ''} type="button" onClick={() => { setDefaultShareRole('Editor'); showFeatureToast('Default share role changed to Editor'); }}>Editor</button><i className={defaultShareRole === 'Editor' ? 'is-editor' : ''} /></div>
                      </div>
                    </article>

                    <article className="bento-card bento-card-small bento-card-3 landing-reveal" data-feature-card="drive-import" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Explore Google Drive import pipeline" ref={addRevealRef}>
                      <span className="bento-card-glow" aria-hidden="true" />
                      <div className="bento-card-content">
                        <div className="bento-card-top">
                          <FeatureIcon className="bento-feature-icon" kind="cloud" />
                          <button className="bento-small-label" type="button" data-feature-open="drive-import">Launch <ArrowRight size={14} /></button>
                        </div>
                        <div className="bento-card-copy">
                          <h4>Bring in files from Drive</h4>
                          <p>Choose the Google Drive files you want to import. Nothing syncs automatically.</p>
                        </div>
                      </div>
                      <div className="bento-preview bento-drive-preview">
                        <span><strong>G</strong> Drive Connected</span>
                        <span className="bento-explicit-chip"><i />Explicit Sync</span>
                      </div>
                    </article>

                    <article className="bento-card bento-card-small bento-card-4 landing-reveal" data-feature-card="auth-methods" role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Explore Auth security and sessions" ref={addRevealRef}>
                      <span className="bento-card-glow" aria-hidden="true" />
                      <div className="bento-card-content">
                        <div className="bento-card-top">
                          <FeatureIcon className="bento-feature-icon" kind="lock" />
                          <button className="bento-small-label" type="button" data-feature-open="auth-methods">Sessions <ArrowRight size={14} /></button>
                        </div>
                        <div className="bento-card-copy">
                          <h4>Sign in the way you prefer</h4>
                          <p>Use email and password, or sign in with Google or GitHub. New accounts verify by email.</p>
                        </div>
                      </div>
                      <div className="bento-preview bento-auth-preview">
                        <span>Google</span><span>GitHub</span><span>SSO</span><b><Check size={12} /> Verified</b>
                      </div>
                    </article>

                    <article className="bento-card bento-card-small bento-card-5 landing-reveal" data-feature-card="plan-telemetry" onMouseEnter={() => setQuotaPreviewActive(true)} onMouseLeave={() => setQuotaPreviewActive(false)} role="button" tabIndex={0} aria-haspopup="dialog" aria-label="Explore Plan quota telemetry and breakdown" ref={addRevealRef}>
                      <span className="bento-card-glow" aria-hidden="true" />
                      <div className="bento-card-content">
                        <div className="bento-card-top">
                          <FeatureIcon className="bento-feature-icon bento-server-icon" kind="server" />
                          <button className="bento-small-label" type="button" data-feature-open="plan-telemetry">Analytics <ArrowRight size={14} /></button>
                        </div>
                        <div className="bento-card-copy">
                          <h4>See what your plan includes</h4>
                          <p>Check your storage use, device allowance, upload limits, and subscription details.</p>
                        </div>
                      </div>
                      <div className="bento-preview bento-quota-preview">
                        <div><span>Quota Used</span><strong>{quotaPreviewActive ? '48.0 GB / 100 GB' : '42.8 GB / 100 GB'}</strong></div>
                        <div className="bento-quota-track"><i className={quotaPreviewActive ? 'is-hovered' : ''} /></div>
                      </div>
                    </article>
                  </div>

                  <footer className="everyday-trust-footer">
                    <span><Check size={16} />Zero Data Scraping or AI Ingestion</span>
                    <span><Check size={16} />Enterprise SOC2 Type II Certified</span>
                    <span><Check size={16} />Instant Granular Revocations</span>
                  </footer>
                </div>
                <FeatureSpecDialog feature={activeFeature} onClose={() => setActiveFeature(null)} notify={showFeatureToast} />
                <FeatureToast message={featureToast} />
              </div>
            </section>
          </div>
        </section>

        <LandingStepsSection onGetStarted={handleGetStarted} addRevealRef={addRevealRef} />

        <section className="landing-faq landing-section" id="faq" aria-labelledby="landing-faq-title">
          <div className="landing-container landing-faq-grid">
            <div className="landing-faq-heading landing-reveal" ref={addRevealRef}>
              <h2 id="landing-faq-title">Good to know.</h2>
              <p>Answers about plans, file sharing, and getting started.</p>
            </div>
            <div className="landing-faq-list landing-reveal" ref={addRevealRef}>
              {faqItems.map((item) => (
                <details className="landing-faq-item" key={item.question}>
                  <summary>{item.question}</summary>
                  <p>{item.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-final-cta" aria-labelledby="landing-cta-title">
          <div className="landing-container landing-final-cta-inner landing-reveal" ref={addRevealRef}>
            <div>
              <h2 id="landing-cta-title">Bring your files into one place.</h2>
              <p>Start with 500 MB of storage on the Free plan.</p>
            </div>
            <button className="landing-button landing-button-light" type="button" onClick={handleGetStarted}>
              Create a free account
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

function FeatureIcon({ kind, className }) {
  if (kind === 'folder') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v2H3V7Z" fill="currentColor" fillOpacity=".18" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m3 9 18 0-1.8 9.2a2 2 0 0 1-1.96 1.8H4.76a2 2 0 0 1-1.96-1.8L3 9Z" strokeLinecap="round" strokeLinejoin="round" />
          <g className="anim-doc-float"><rect x="7" y="5" width="6" height="5" rx="1" fill="white" fillOpacity=".9" strokeWidth="1.2" /><path d="M8.5 7h3" strokeWidth=".8" /></g>
          <circle className="anim-radar" cx="15.5" cy="13.5" r="3" />
          <circle className="anim-radar-2" cx="15.5" cy="13.5" r="3" />
          <g className="anim-scan-glass"><circle cx="15.5" cy="13.5" r="3.6" fill="white" fillOpacity=".3" strokeWidth="1.8" /><path d="m18.2 16.2 2.8 2.8" strokeWidth="2.2" strokeLinecap="round" /></g>
        </svg>
      </span>
    );
  }
  if (kind === 'share') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path className="anim-stream-line" d="m6.5 12 11-5.5m-11 5.5 11 5.5" strokeLinecap="round" />
          <circle className="anim-node-pulse" cx="6" cy="12" r="3.2" fill="white" strokeWidth="2" /><circle cx="6" cy="12" r="1.3" fill="currentColor" />
          <g className="anim-node-pulse-delayed"><circle cx="18" cy="6.5" r="3.2" fill="white" strokeWidth="2" /><path d="m16.7 6.5.9.9 1.6-1.6" strokeLinecap="round" strokeLinejoin="round" /></g>
          <g className="anim-node-pulse"><circle cx="18" cy="17.5" r="3.2" fill="white" strokeWidth="2" /><path d="m16.7 17.5.9.9 1.6-1.6" strokeLinecap="round" strokeLinejoin="round" /></g>
        </svg>
      </span>
    );
  }
  if (kind === 'cloud') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 18.5h16" strokeDasharray="2 2" strokeLinecap="round" strokeOpacity=".6" />
          <g className="anim-cloud"><path d="M7 14a4.5 4.5 0 0 1 8.8-1.4A3.5 3.5 0 0 1 18.5 16H6a3 3 0 0 1 1-2Z" fill="currentColor" fillOpacity=".2" strokeLinecap="round" strokeLinejoin="round" /></g>
          <g className="anim-arrow-ascend"><path d="M12 18V8m0 0-3.5 3.5M12 8l3.5 3.5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></g>
          <circle className="anim-particle-1" cx="8" cy="14" r="1.1" fill="currentColor" /><circle className="anim-particle-2" cx="16" cy="13" r="1.1" fill="currentColor" />
        </svg>
      </span>
    );
  }
  if (kind === 'lock') {
    return (
      <span className={className} aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle className="anim-security-ring" cx="12" cy="12" r="10" strokeDasharray="4 4" strokeOpacity=".5" strokeWidth="1.4" />
          <path className="anim-shackle" d="M8 10V6.5a4 4 0 0 1 8 0V10" strokeLinecap="round" strokeWidth="2" />
          <rect x="5.5" y="10" width="13" height="10" rx="2.5" fill="white" fillOpacity=".3" strokeWidth="1.8" />
          <g className="anim-keyhole"><circle cx="12" cy="14" r="1.3" fill="currentColor" /><path d="M12 15.3v2" strokeLinecap="round" strokeWidth="1.6" /></g>
        </svg>
      </span>
    );
  }
  return (
    <span className={className} aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="6.5" rx="2" fill="white" fillOpacity=".25" strokeWidth="1.8" />
        <circle className="anim-led-1" cx="6.5" cy="7.25" r="1.3" fill="currentColor" /><circle className="anim-led-2" cx="9.5" cy="7.25" r="1.3" fill="currentColor" />
        <path d="M14 7.25h4" strokeLinecap="round" strokeWidth="1.5" />
        <rect x="3" y="13.5" width="18" height="6.5" rx="2" fill="white" fillOpacity=".25" strokeWidth="1.8" />
        <circle className="anim-led-2" cx="6.5" cy="16.75" r="1.3" fill="currentColor" /><circle className="anim-led-1" cx="9.5" cy="16.75" r="1.3" fill="currentColor" />
        <g className="anim-platter"><circle cx="16" cy="16.75" r="2.2" strokeDasharray="2 2" strokeWidth="1.3" /><circle cx="16" cy="16.75" r=".8" fill="currentColor" /></g>
      </svg>
    </span>
  );
}

const featureFiles = [
  { name: 'annual-report_2025.pdf', type: 'PDF', tone: 'red', detail: 'Quarterly Financials · 4.2 MB · Updated 2h ago' },
  { name: 'quarterly_report_deck.fig', type: 'FIG', tone: 'purple', detail: 'Design System Workspace · 32.8 MB · Updated yesterday' },
  { name: 'incident-report-postmortem.md', type: 'DOC', tone: 'blue', detail: 'Engineering Docs · 140 KB · Updated 3 days ago' },
];

function FeatureSpecDialog({ feature, onClose, notify }) {
  const [query, setQuery] = useState('report');
  const [collaboratorRoles, setCollaboratorRoles] = useState(['Viewer', 'Editor']);
  const [selectedDriveFiles, setSelectedDriveFiles] = useState([true, true, false]);
  const [transferProgress, setTransferProgress] = useState(0);
  const [transferStatus, setTransferStatus] = useState('Explicit transfer pipeline ready');
  const [isTransferring, setIsTransferring] = useState(false);
  const [revokedSession, setRevokedSession] = useState(false);
  const [quotaUpgraded, setQuotaUpgraded] = useState(false);
  const dialogRef = useRef(null);

  const details = {
    'find-files': ['In-Memory Indexed Search', 'Find files without the hunt', 'folder'],
    'share-permissions': ['Access Control Protocol', 'Share with clear permissions', 'share'],
    'drive-import': ['Explicit Cloud Connector', 'Bring in files from Google Drive', 'cloud'],
    'auth-methods': ['Federated Authentication & Sessions', 'Sign in the way you prefer', 'lock'],
    'plan-telemetry': ['Quota & Capacity Analytics', 'See what your plan includes', 'server'],
  }[feature];

  useEffect(() => {
    if (!feature) return undefined;
    const previousFocus = document.activeElement;
    dialogRef.current?.focus();
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocus?.focus?.();
    };
  }, [feature, onClose]);

  useEffect(() => {
    if (!isTransferring) return undefined;
    const timer = window.setInterval(() => {
      setTransferProgress((current) => {
        const next = Math.min(100, current + Math.floor(Math.random() * 24) + 12);
        if (next >= 100) {
          window.clearInterval(timer);
          setIsTransferring(false);
          setTransferStatus('✓ Transfer complete! Files verified and signed.');
          notify('Drive files successfully imported!');
        } else {
          setTransferStatus(`Streaming chunks (${next}%)...`);
        }
        return next;
      });
    }, 220);
    return () => window.clearInterval(timer);
  }, [isTransferring, notify]);

  if (!feature || !details) return null;

  const filteredFiles = featureFiles.filter((file) => file.name.toLowerCase().includes(query.toLowerCase().trim()));
  const startTransfer = () => {
    setTransferProgress(0);
    setTransferStatus('Initiating chunked stream from Drive...');
    setIsTransferring(true);
  };

  return (
    <div className="feature-modal" role="dialog" aria-modal="true" aria-labelledby="feature-modal-title" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="feature-modal-panel" ref={dialogRef} tabIndex={-1}>
        <header className="feature-modal-header">
          <div className="feature-modal-heading">
            <FeatureIcon kind={details[2]} className="feature-modal-icon" />
            <div><span>{details[0]}</span><h3 id="feature-modal-title">{details[1]}</h3></div>
          </div>
          <button className="feature-modal-close" type="button" aria-label="Close dialog" onClick={onClose}><span aria-hidden="true">×</span></button>
        </header>

        <div className="feature-modal-body">
          {feature === 'find-files' && (
            <div className="feature-demo-stack">
              <div className="feature-demo-search">
                <label htmlFor="demo-search-input">Live Search Simulator</label>
                <div className="feature-search-field"><Search size={16} aria-hidden="true" /><input id="demo-search-input" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Type to filter..." /><span>5.8ms latency</span></div>
              </div>
              <div>
                <div className="feature-demo-list-heading"><strong>Matched files ({filteredFiles.length})</strong><span>Unified local index</span></div>
                <div className="feature-file-list">
                  {filteredFiles.map((file) => <button className="feature-file-item" key={file.name} type="button" onClick={() => notify(`Previewing: ${file.name}`)}>
                    <span className={`feature-file-type ${file.tone}`}>{file.type}</span><span className="feature-file-copy"><strong>{file.name}</strong><small>{file.detail}</small></span><span className="feature-file-preview">Preview</span>
                  </button>)}
                  {filteredFiles.length === 0 && <p className="feature-empty-state">No files match this search.</p>}
                </div>
              </div>
              <div className="feature-demo-note"><span>⚡ P99 search indexing benchmark: <strong>Under 8ms</strong> across 500,000 files</span><code>SQLite FTS5 + WASM</code></div>
            </div>
          )}

          {feature === 'share-permissions' && (
            <div className="feature-demo-stack">
              <div className="feature-share-link"><input aria-label="Share link" readOnly value="https://workspace.app/share/f7d3-92a1-corp" /><button type="button" onClick={() => notify('Share link copied to clipboard!')}>Copy Link</button></div>
              <section className="feature-collaborators"><h4>Active Collaborators &amp; Rights</h4>
                <Collaborator initials="AK" name={<>alex.k@enterprise.io <small className="feature-you-tag">You</small></>} role="Project Architect" access="Owner" tone="slate" />
                <Collaborator initials="SL" name="sara.lee@clientpartners.com" role="External Reviewer" tone="brand"><select aria-label="Sara Lee access" value={collaboratorRoles[0]} onChange={(event) => { const next = [...collaboratorRoles]; next[0] = event.target.value; setCollaboratorRoles(next); if (event.target.value === 'Revoke') notify('Access revoked immediately.'); else notify(`Role updated to ${event.target.value}`); }}><option value="Viewer">Can View</option><option value="Editor">Can Edit</option><option value="Revoke">Revoke Access</option></select></Collaborator>
                <Collaborator initials="DV" name="devon.v@designhub.co" role="Design Lead" tone="emerald"><select aria-label="Devon V access" value={collaboratorRoles[1]} onChange={(event) => { const next = [...collaboratorRoles]; next[1] = event.target.value; setCollaboratorRoles(next); if (event.target.value === 'Revoke') notify('Access revoked immediately.'); else notify(`Role updated to ${event.target.value}`); }}><option value="Viewer">Can View</option><option value="Editor">Can Edit</option><option value="Revoke">Revoke Access</option></select></Collaborator>
              </section>
              <div className="feature-security-note"><Check size={16} />Instant ACL purge: Revoking access kills live presigned URLs within 100ms.</div>
            </div>
          )}

          {feature === 'drive-import' && (
            <div className="feature-demo-stack">
              <div className="feature-drive-account"><span className="feature-drive-mark">G</span><div><strong>Connected: workspace@corp.com</strong><small>Read-only picker permission active</small></div><b>{selectedDriveFiles.filter(Boolean).length} Selected</b></div>
              <section className="feature-drive-files"><h4>Select Drive files for on-demand fetch</h4>
                {['Brand_Assets_2025.zip', 'Strategic_Roadmap_H2.pdf', 'Team_Offsite_Video_Recap.mp4'].map((name, index) => <label className="feature-drive-file" key={name}><input type="checkbox" checked={selectedDriveFiles[index]} onChange={() => setSelectedDriveFiles((items) => items.map((selected, itemIndex) => itemIndex === index ? !selected : selected))} /><span><strong>{name}</strong><small>{['Google Drive / Assets / 142.0 MB', 'Google Drive / Planning / 8.4 MB', 'Google Drive / Media / 410.2 MB'][index]}</small></span><em>{selectedDriveFiles[index] ? 'Ready' : 'Unselected'}</em></label>)}
              </section>
              <div className="feature-transfer-box"><div><span>{transferStatus}</span><strong>{transferProgress}%</strong></div><div className="feature-transfer-track"><i style={{ width: `${transferProgress}%` }} /></div></div>
              <div className="feature-transfer-action"><span>Zero background scraping. Files copy only on explicit demand.</span><button type="button" disabled={isTransferring || selectedDriveFiles.every((selected) => !selected)} onClick={startTransfer}>{transferProgress === 100 ? 'Import Again' : 'Start Explicit Import'}</button></div>
            </div>
          )}

          {feature === 'auth-methods' && (
            <div className="feature-demo-stack">
              <div className="feature-auth-providers"><ProviderBadge mark="G" name="Google OAuth" /><ProviderBadge mark="GH" name="GitHub" /><ProviderBadge mark="SSO" name="SAML / Okta" enterprise /></div>
              <section className="feature-sessions"><h4>Active Authenticated Devices (2)</h4>
                <div className="feature-session-row"><span className="feature-device-icon">▱</span><span><strong>MacBook Pro 16&quot; — San Francisco, US</strong><small className="is-active">This active session · Chrome 124</small></span><em>Now</em></div>
                <div className={`feature-session-row${revokedSession ? ' is-revoked' : ''}`}><span className="feature-device-icon">▯</span><span><strong>iPhone 15 Pro — Mobile Safari</strong><small>Authenticated via Passkey · Last active 42m ago</small></span><button type="button" disabled={revokedSession} onClick={() => { setRevokedSession(true); notify('Remote session terminated immediately.'); }}>{revokedSession ? 'Revoked' : 'Revoke'}</button></div>
              </section>
              <div className="feature-two-factor"><div><strong>Two-Factor Authentication</strong><small>FIDO2 WebAuthn Hardware keys &amp; TOTP</small></div><b>Enforced</b></div>
            </div>
          )}

          {feature === 'plan-telemetry' && (
            <div className="feature-demo-stack">
              <section className="feature-storage-breakdown"><div><strong>Storage Distribution</strong><span>42.8 GB <small>/ 100 GB</small></span></div><div className="feature-storage-bar"><i /><i /><i /></div><div className="feature-storage-legend"><span><i />Videos (20.0 GB)</span><span><i />Documents (18.0 GB)</span><span><i />Design (4.8 GB)</span><span><i />Available (57.2 GB)</span></div></section>
              <div className="feature-plan-matrix"><div><small>Concurrent Devices</small><strong>1 of 2</strong><em>1 Slot Available</em></div><div><small>Max Single Upload</small><strong>5.0 GB</strong><em>Direct S3 Egress</em></div><div><small>Current Tier</small><strong>Pro Team</strong><em>Renews Nov 2025</em></div></div>
              <div className="feature-upgrade-callout"><div><strong>Need infinite archive retention?</strong><small>Enterprise tier includes 10TB pooled storage &amp; custom egress rules.</small></div><button type="button" onClick={() => { setQuotaUpgraded(true); notify('Upgraded simulation quota: 1000 GB enabled for this session.'); }}>{quotaUpgraded ? 'Active (1TB)' : 'Simulate 1TB'}</button></div>
            </div>
          )}
        </div>

        <footer className="feature-modal-footer"><span><i />Live Interactive Spec Drawer</span><span>Press <kbd>ESC</kbd> to exit</span></footer>
      </div>
    </div>
  );
}

function Collaborator({ initials, name, role, access, tone, children }) {
  return <div className="feature-collaborator"><span className={`feature-avatar ${tone}`}>{initials}</span><span className="feature-collaborator-info"><strong>{name}</strong><small>{role}</small></span>{children || <b>{access}</b>}</div>;
}

function ProviderBadge({ mark, name, enterprise = false }) {
  return <div className="feature-provider"><span className={enterprise ? 'enterprise' : ''}>{mark}</span><strong>{name}</strong><small className={enterprise ? 'enterprise' : ''}>{enterprise ? 'Enterprise Ready' : '● Connected'}</small></div>;
}

function FeatureToast({ message }) {
  return <div className={`feature-toast${message ? ' is-visible' : ''}`} role="status" aria-live="polite"><Check size={16} /><span>{message}</span></div>;
}

export default LandingPage;

const LANDING_PLANS = [
  {
    id: 'free',
    name: 'Free',
    tagline: 'Starter Plan',
    description: 'Personal users who want to try the platform',
    storage: '500 MB',
    price: 0,
    cta: 'Get Started Free',
    popular: false,
    isFree: true,
    features: [
      '500 MB secure storage',
      'File upload limit: 100 MB per file',
      'Access from 1 device',
      'Standard download speed',
      'Basic email support',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    tagline: 'For Students & Freelancers',
    description: 'Students, freelancers, or small teams who need more space',
    storage: '100 GB',
    price: 99,
    yearlyPrice: 999,
    yearlyStorage: '200 GB',
    cta: 'Get Started',
    popular: true,
    isFree: false,
    features: [
      '100 GB secure storage',
      'File upload limit: 1 GB per file',
      'Access from up to 2 devices',
      'Cloud Teams (up to 2 teams)',
      'Priority upload/download speed',
      'Email & chat support',
    ],
    yearlyFeatures: [
      '200 GB secure storage',
      'File upload limit: 1 GB per file',
      'Access from up to 2 devices',
      'Cloud Teams (up to 2 teams)',
      'Priority upload/download speed',
      'Email & chat support',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    tagline: 'For Professionals & Creators',
    description: 'Professionals and creators handling large media files',
    storage: '200 GB',
    price: 199,
    yearlyPrice: 1999,
    yearlyStorage: '300 GB',
    cta: 'Get Started',
    popular: false,
    isFree: false,
    features: [
      '200 GB secure storage',
      'File upload limit: 2 GB per file',
      'Access from up to 3 devices',
      'Cloud Teams (up to 4 teams)',
      'Priority upload/download speed',
      'Priority customer support',
    ],
    yearlyFeatures: [
      '300 GB secure storage',
      'File upload limit: 2 GB per file',
      'Access from up to 3 devices',
      'Cloud Teams (up to 4 teams)',
      'Priority upload/download speed',
      'Priority customer support',
    ],
  },
];

function LandingPlanCard({ plan, mode, onGetStarted }) {
  const isYearly = mode === 'yearly';
  const targetPrice = isYearly && !plan.isFree ? Math.floor(plan.yearlyPrice / 12) : plan.price;
  const displayFeatures = isYearly && !plan.isFree && plan.yearlyFeatures ? plan.yearlyFeatures : plan.features;
  const [animatedPrice, setAnimatedPrice] = useState(targetPrice);

  useEffect(() => {
    if (plan.isFree) {
      setAnimatedPrice(0);
      return;
    }

    const start = animatedPrice;
    const end = targetPrice;
    if (start === end) return;

    const duration = 250;
    const frameRate = 1000 / 60;
    const totalFrames = Math.max(1, Math.round(duration / frameRate));
    let frame = 0;

    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);

    const timer = setInterval(() => {
      frame++;
      const progress = easeOutCubic(frame / totalFrames);
      const current = Math.round(start + (end - start) * progress);
      setAnimatedPrice(current);

      if (frame >= totalFrames) {
        clearInterval(timer);
        setAnimatedPrice(end);
      }
    }, frameRate);

    return () => clearInterval(timer);
  }, [targetPrice]);

  return (
    <article className={`landing-plan${plan.popular ? ' landing-plan-popular' : ''}`} aria-label={`${plan.name} plan`}>
      {plan.popular && <span className="landing-plan-badge">Most popular</span>}
      <div className="landing-plan-heading">
        <h3>{plan.name}</h3>
        <p className="landing-plan-tagline">{plan.tagline}</p>
        <p className="landing-plan-description">{plan.description}</p>
      </div>

      <div className="landing-plan-price">
        {plan.isFree ? (
          <span className="landing-plan-amount">Free</span>
        ) : (
          <>
            <span className="landing-plan-currency">₹</span>
            <span className="landing-plan-amount">{animatedPrice}</span>
            <span className="landing-plan-period">/month</span>
          </>
        )}
        {isYearly && !plan.isFree && plan.yearlyPrice && (
          <p className="landing-plan-billing">
            Billed annually at ₹{plan.yearlyPrice}. Save ₹{plan.price * 12 - plan.yearlyPrice} per year.
          </p>
        )}
      </div>

      <button className="landing-button landing-plan-button" type="button" onClick={onGetStarted}>
        {plan.cta}
      </button>

      <div className="landing-plan-includes">What’s included</div>
      <ul className="landing-plan-features">
        {displayFeatures.map((feature) => (
          <li key={feature}>
            <Check size={16} aria-hidden="true" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function LandingPlansSection({ onGetStarted, addRevealRef }) {
  const [mode, setMode] = useState('monthly');

  return (
    <div className="landing-pricing" id="pricing">
      <div className="landing-pricing-controls landing-reveal" ref={addRevealRef}>
        <div className="landing-section-heading">
          <h3>Choose your storage plan.</h3>
          <p>Switch between monthly and yearly billing to compare.</p>
        </div>
        <div className="landing-billing-toggle" role="group" aria-label="Billing frequency">
          <button
            type="button"
            aria-pressed={mode === 'monthly'}
            className={mode === 'monthly' ? 'is-selected' : ''}
            onClick={() => setMode('monthly')}
          >
            Monthly
          </button>
          <button
            type="button"
            aria-pressed={mode === 'yearly'}
            className={mode === 'yearly' ? 'is-selected' : ''}
            onClick={() => setMode('yearly')}
          >
            Yearly
          </button>
        </div>
      </div>

      <div className="landing-plan-grid landing-reveal" ref={addRevealRef}>
        {LANDING_PLANS.map((plan) => (
          <LandingPlanCard
            key={plan.id}
            plan={plan}
            mode={mode}
            onGetStarted={onGetStarted}
          />
        ))}
      </div>
    </div>
  );
}
