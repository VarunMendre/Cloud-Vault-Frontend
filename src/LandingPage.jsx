import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Cloud,
  FolderOpen,
  HardDrive,
  Link2,
  LockKeyhole,
  Search,
  Share2,
  Upload,
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

const coreFeatures = [
  {
    icon: FolderOpen,
    title: 'Find files without the hunt',
    description:
      'Keep files in folders, search by name, and preview documents and media from one workspace.',
  },
  {
    icon: Share2,
    title: 'Share with clear permissions',
    description:
      'Invite people as viewers or editors, then manage or revoke access when it changes.',
  },
  {
    icon: Upload,
    title: 'Bring in files from Drive',
    description:
      'Choose the Google Drive files you want to import. Nothing syncs automatically.',
  },
  {
    icon: LockKeyhole,
    title: 'Sign in the way you prefer',
    description:
      'Use email and password, or sign in with Google or GitHub. New accounts verify by email.',
  },
  {
    icon: HardDrive,
    title: 'See what your plan includes',
    description:
      'Check your storage use, device allowance, upload limits, and subscription details.',
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
              <div className="landing-section-heading landing-reveal" ref={addRevealRef}>
                <h3 id="landing-features-title">Made for everyday file work.</h3>
                <p>Tools to organize, import, share, and keep track of your files.</p>
              </div>
              <div className="landing-feature-grid">
                {coreFeatures.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article className="landing-feature landing-reveal" key={feature.title} ref={addRevealRef}>
                      <span className="landing-feature-icon" aria-hidden="true">
                        <Icon size={22} strokeWidth={1.8} />
                      </span>
                      <div>
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </article>
                  );
                })}
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
