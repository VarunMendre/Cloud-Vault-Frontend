import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Cloud, Folder, HardDrive, Link2, Share2 } from "lucide-react";
import "./LandingPage.css";

import dashboardImage from "./assets/screenshots/cloudvault-drive-dashboard.png";
import settingsImage from "./assets/screenshots/settings.png";
import subscriptionImage from "./assets/screenshots/subscription.png";

const plans = [
  {
    id: "free",
    name: "Free",
    description: "A simple place to get started.",
    storage: "500 MB",
    monthlyPrice: 0,
    yearlyPrice: 0,
    uploadLimit: "100 MB",
    devices: "1 device",
    details: ["Standard download speed", "Basic email support"],
    popular: false,
  },
  {
    id: "standard",
    name: "Standard",
    description: "More room for your work and projects.",
    storage: "100 GB",
    yearlyStorage: "200 GB",
    monthlyPrice: 99,
    yearlyPrice: 999,
    uploadLimit: "1 GB",
    devices: "Up to 2 devices",
    details: ["Up to 2 Cloud Teams", "Priority upload/download speed", "Email and chat support"],
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Extra space for larger files and busy workflows.",
    storage: "200 GB",
    yearlyStorage: "300 GB",
    monthlyPrice: 199,
    yearlyPrice: 1999,
    uploadLimit: "2 GB",
    devices: "Up to 3 devices",
    details: ["Up to 4 Cloud Teams", "Priority upload/download speed", "Priority customer support"],
    popular: false,
  },
];

const faqs = [
  {
    question: "Can I start without paying?",
    answer: "Yes. The Free plan includes 500 MB of storage and supports files up to 100 MB each.",
  },
  {
    question: "What storage comes with each plan?",
    answer: "Free includes 500 MB. Standard includes 100 GB monthly or 200 GB yearly. Premium includes 200 GB monthly or 300 GB yearly.",
  },
  {
    question: "Does CloudVault sync my Google Drive automatically?",
    answer: "No. Choose the files you want to import from Google Drive. CloudVault does not automatically sync your Drive.",
  },
  {
    question: "Can I decide who can access a shared file?",
    answer: "Yes. Share files with viewer or editor permissions, then manage or revoke access from your sharing pages.",
  },
  {
    question: "How can I sign in?",
    answer: "Create an account with email and password, or use Google or GitHub sign-in. New email accounts verify with a one-time code.",
  },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const handleGetStarted = () => {
    const isLandingDomain =
      window.location.hostname === "cloudvault.cloud" ||
      window.location.hostname === "www.cloudvault.cloud";

    if (isLandingDomain) {
      window.location.href = "https://app.cloudvault.cloud/login";
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="landing-page" id="top">
      <a className="landing-skip-link" href="#main-content">Skip to content</a>

      <header className="landing-header">
        <nav className="landing-nav landing-container" aria-label="Main navigation">
          <a className="landing-brand" href="#top" aria-label="CloudVault home">
            <span className="landing-brand-mark"><Cloud size={21} aria-hidden="true" /></span>
            <span>CloudVault</span>
          </a>

          <div className="landing-nav-links">
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
            <a href="#plans">Plans</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="landing-nav-actions">
            <Link className="landing-sign-in" to="/login">Sign in</Link>
            <button className="landing-button landing-button-compact" type="button" onClick={handleGetStarted}>
              Get started
            </button>
          </div>
        </nav>
      </header>

      <main id="main-content">
        <section className="landing-hero landing-container" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-eyebrow">A home for your files</p>
            <h1 id="landing-title">Your files, together. <span>Shared your way.</span></h1>
            <p className="landing-hero-description">
              Store and find your files in one workspace. Share with the people you choose, and give them viewer or editor access.
            </p>
            <div className="landing-hero-actions">
              <button className="landing-button" type="button" onClick={handleGetStarted}>
                Create a free account <ArrowRight size={18} aria-hidden="true" />
              </button>
              <a className="landing-secondary-link" href="#plans">Explore plans</a>
            </div>
            <p className="landing-hero-note">Start with 500 MB free · Files up to 100 MB</p>
          </div>

          <figure className="landing-hero-visual">
            <div className="landing-image-frame">
              <img
                src={dashboardImage}
                alt="CloudVault drive with file upload, folder creation, search, and file list"
                width="1406"
                height="768"
              />
            </div>
            <figcaption>Files and sharing, in one clear view.</figcaption>
          </figure>
        </section>

        <section className="landing-features landing-section" id="features" aria-labelledby="features-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">Made for everyday file work</p>
              <h2 id="features-title">Everything you need to keep work moving.</h2>
              <p>Manage your files, storage, and sharing without jumping between separate tools.</p>
            </div>

            <div className="landing-feature-grid">
              <article className="landing-feature-card">
                <span className="landing-feature-icon"><Folder size={21} aria-hidden="true" /></span>
                <h3>Find files faster</h3>
                <p>Organize files in folders, search by name, and preview supported files from your workspace.</p>
              </article>
              <article className="landing-feature-card">
                <span className="landing-feature-icon"><Share2 size={21} aria-hidden="true" /></span>
                <h3>Share with control</h3>
                <p>Choose viewer or editor access, then manage or revoke permissions when they change.</p>
              </article>
              <article className="landing-feature-card">
                <span className="landing-feature-icon"><HardDrive size={21} aria-hidden="true" /></span>
                <h3>Make room as you grow</h3>
                <p>Start with a free plan and compare more storage when your files need more space.</p>
              </article>
              <article className="landing-feature-card">
                <span className="landing-feature-icon"><Link2 size={21} aria-hidden="true" /></span>
                <h3>Import when you choose</h3>
                <p>Pick files from Google Drive to import. Your Drive does not sync automatically.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="landing-product-section landing-section" aria-labelledby="product-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">A closer look</p>
              <h2 id="product-title">A workspace that stays easy to understand.</h2>
              <p>See your shared files, account settings, and subscription details in the product.</p>
            </div>
            <div className="landing-product-grid">
              <figure className="landing-product-shot">
                <div className="landing-image-frame">
                  <img src={settingsImage} alt="CloudVault account settings and storage usage" width="1024" height="412" loading="lazy" />
                </div>
                <figcaption>Account and storage settings</figcaption>
              </figure>
              <figure className="landing-product-shot">
                <div className="landing-image-frame">
                  <img src={subscriptionImage} alt="CloudVault subscription and storage overview" width="1024" height="633" loading="lazy" />
                </div>
                <figcaption>Plan and usage overview</figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="landing-steps landing-section" id="how-it-works" aria-labelledby="steps-title">
          <div className="landing-container">
            <div className="landing-section-heading">
              <p className="landing-eyebrow">A simple place to start</p>
              <h2 id="steps-title">Three steps to a more organized workspace.</h2>
            </div>
            <ol className="landing-step-list">
              <li><span className="landing-step-number">01</span><div><h3>Create your account</h3><p>Sign up with email, Google, or GitHub.</p></div></li>
              <li><span className="landing-step-number">02</span><div><h3>Add your files</h3><p>Upload from your device or choose files from Google Drive.</p></div></li>
              <li><span className="landing-step-number">03</span><div><h3>Organize and share</h3><p>Find what you need and choose viewer or editor access when sharing.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="landing-plans landing-section" id="plans" aria-labelledby="plans-title">
          <div className="landing-container">
            <div className="landing-pricing-heading">
              <div className="landing-section-heading landing-section-heading-left">
                <p className="landing-eyebrow">Plans for your files</p>
                <h2 id="plans-title">Choose the space you need.</h2>
                <p>Start free. Move to a paid plan when you need more storage.</p>
              </div>
              <div className="landing-billing-toggle" role="group" aria-label="Billing period">
                <button type="button" aria-pressed={billingPeriod === "monthly"} className={billingPeriod === "monthly" ? "is-selected" : ""} onClick={() => setBillingPeriod("monthly")}>Monthly</button>
                <button type="button" aria-pressed={billingPeriod === "yearly"} className={billingPeriod === "yearly" ? "is-selected" : ""} onClick={() => setBillingPeriod("yearly")}>Yearly</button>
              </div>
            </div>

            <div className="landing-plan-grid">
              {plans.map((plan) => {
                const yearly = billingPeriod === "yearly" && plan.yearlyPrice > 0;
                const monthlyEquivalent = yearly ? Math.floor(plan.yearlyPrice / 12) : plan.monthlyPrice;
                const storage = yearly ? plan.yearlyStorage : plan.storage;

                return (
                  <article className={`landing-plan${plan.popular ? " landing-plan-featured" : ""}`} key={plan.id} aria-labelledby={`${plan.id}-plan-title`}>
                    {plan.popular && <span className="landing-plan-badge">Most popular</span>}
                    <h3 id={`${plan.id}-plan-title`}>{plan.name}</h3>
                    <p className="landing-plan-description">{plan.description}</p>
                    <p className="landing-plan-storage">{storage} <span>storage</span></p>
                    <p className="landing-plan-price">
                      {plan.monthlyPrice === 0 ? <strong>Free</strong> : <><strong>₹{monthlyEquivalent}</strong><span>/ month</span></>}
                    </p>
                    {yearly && <p className="landing-plan-billing">Billed yearly at ₹{plan.yearlyPrice}.</p>}
                    {!yearly && <p className="landing-plan-billing">{plan.monthlyPrice === 0 ? "No payment required" : "Billed monthly"}</p>}
                    <button className={`landing-button landing-plan-button${plan.popular ? "" : " landing-button-outline"}`} type="button" onClick={handleGetStarted}>
                      {plan.monthlyPrice === 0 ? "Get started free" : "Choose this plan"}
                    </button>
                    <ul className="landing-plan-features">
                      <li><Check size={17} aria-hidden="true" />Up to {plan.uploadLimit} per file</li>
                      <li><Check size={17} aria-hidden="true" />{plan.devices}</li>
                      {plan.details.map((detail) => <li key={detail}><Check size={17} aria-hidden="true" />{detail}</li>)}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="landing-faq landing-section" id="faq" aria-labelledby="faq-title">
          <div className="landing-container landing-faq-layout">
            <div className="landing-section-heading landing-section-heading-left">
              <p className="landing-eyebrow">Good to know</p>
              <h2 id="faq-title">Questions, answered.</h2>
              <p>Details about plans, sharing, and getting started.</p>
            </div>
            <div className="landing-faq-list">
              {faqs.map((faq) => (
                <details className="landing-faq-item" key={faq.question}>
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="landing-final-cta" aria-labelledby="final-cta-title">
          <div className="landing-container landing-final-cta-inner">
            <div>
              <p className="landing-eyebrow">Get started with CloudVault</p>
              <h2 id="final-cta-title">Make space for what matters.</h2>
              <p>Create a free account and bring your files into one workspace.</p>
            </div>
            <button className="landing-button landing-button-light" type="button" onClick={handleGetStarted}>
              Create a free account <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <a className="landing-brand" href="#top" aria-label="CloudVault home">
            <span className="landing-brand-mark"><Cloud size={19} aria-hidden="true" /></span>
            <span>CloudVault</span>
          </a>
          <p>One place for your files and the people you share them with.</p>
          <nav aria-label="Legal and support">
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/terms-of-service">Terms</Link>
            <Link to="/refund-policy">Refund policy</Link>
            <Link to="/contact-us">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
