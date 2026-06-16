import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Shield, 
  Zap, 
  Share2, 
  Globe, 
  ArrowRight,
  UserPlus,
  Upload,
  FolderSync,
  Link,
  HardDrive,
  ChevronRight,
  FileText,
  Settings
} from 'lucide-react';
import Footer from './components/Footer';

// Application screenshots
import dashboardImg from './assets/screenshots/dashboard.png';
import settingsImg from './assets/screenshots/settings.png';
import subscriptionImg from './assets/screenshots/subscription.png';

const screenshotData = [
  { src: dashboardImg, alt: 'File Sharing Dashboard' },
  { src: settingsImg, alt: 'Storage Settings' },
  { src: subscriptionImg, alt: 'Subscription Management' },
];

const LandingPage = () => {
  const navigate = useNavigate();

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

  // Double the images array for seamless infinite loop
  const scrollImages = [...screenshotData, ...screenshotData];

  // Scroll-triggered reveal animation
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
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    revealRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const coreFeatures = [
    {
      icon: <Shield className="w-6 h-6 text-blue-500" />,
      bgClass: 'bg-blue-50',
      title: 'Enterprise-Grade Security',
      description: 'Secure access with OAuth (Google & GitHub), 2FA, and encrypted storage. Your data is protected by industry-leading security standards.',
    },
    {
      icon: <FileText className="w-6 h-6 text-purple-500" />,
      bgClass: 'bg-purple-50',
      title: 'Intelligent File Management',
      description: 'Upload any file type with drag-and-drop ease. Organize with grid views, powerful search, and instant previews for documents and media.',
    },
    {
      icon: <Cloud className="w-6 h-6 text-green-500" />,
      bgClass: 'bg-green-50',
      title: 'Seamless Cloud Integration',
      description: 'Import directly from Google Drive and enjoy lightning-fast global access via CloudFront CDN and AWS S3 storage.',
    },
    {
      icon: <Share2 className="w-6 h-6 text-orange-500" />,
      bgClass: 'bg-orange-50',
      title: 'Advanced Sharing Controls',
      description: 'Share securely with granular permissions. Control who views or edits your files with role-based access and real-time activity logs.',
    },
    {
      icon: <Settings className="w-6 h-6 text-pink-500" />,
      bgClass: 'bg-pink-50',
      title: 'Comprehensive Admin Tools',
      description: 'Manage users, monitor storage usage, and control system-wide settings from a powerful, centralized dashboard.',
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      bgClass: 'bg-amber-50',
      title: 'Lightning Fast Performance',
      description: 'Experience zero latency with optimized global content delivery, ensuring your files are always available when you need them.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafdff] flex flex-col overflow-x-hidden">
      {/* Navbar (Simplified for Landing) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#66B2D6] flex items-center justify-center">
              <Cloud className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#2C3E50] tracking-tight">CloudVault</span>
          </div>
          <button 
            onClick={handleGetStarted}
            className="px-6 py-2.5 bg-[#66B2D6] text-white font-bold rounded-xl hover:bg-[#5aa0c0] transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-soft"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E6FAF5] text-[#66B2D6] font-bold text-sm mb-8 animate-fadeIn">
            <Zap className="w-4 h-4 fill-current" />
            <span>Faster, Smarter, Secure Storage</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-[#2C3E50] mb-8 leading-[1.1] animate-slideUp">
            Your Digital Life,<br /> 
            <span className="text-[#66B2D6] bg-clip-text text-transparent bg-gradient-to-r from-[#66B2D6] to-[#A7DDE9]">Safely Vaulted.</span>
          </h1>
          <p className="text-xl text-[#A3C5D9] max-w-2xl mx-auto mb-10 animate-slideUp" style={{ animationDelay: '0.1s' }}>
            Experience lightning-fast cloud storage with ironclad security. 
            Upload, share, and manage your files from anywhere in the world.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-10 py-4 bg-[#66B2D6] text-white font-bold rounded-2xl flex items-center justify-center gap-2 text-lg hover:bg-[#5aa0c0] transition-all shadow-medium"
            >
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Infinite Scrolling App Screenshots */}
          <div className="mt-20 relative animate-scaleIn">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 md:w-40 z-20 pointer-events-none" style={{ background: 'linear-gradient(to right, #fafdff 0%, transparent 100%)' }}></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 md:w-40 z-20 pointer-events-none" style={{ background: 'linear-gradient(to left, #fafdff 0%, transparent 100%)' }}></div>
            
            {/* Scrolling track */}
            <div 
              className="overflow-hidden py-4"
              style={{ maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
            >
              <div 
                className="flex gap-8 w-max hover:[animation-play-state:paused]"
                style={{ animation: 'marquee 25s linear infinite' }}
              >
                {scrollImages.map((img, index) => (
                  <div 
                    key={index}
                    className="flex-shrink-0 w-[500px] md:w-[600px] lg:w-[700px] group"
                  >
                    <div className="bg-white rounded-2xl shadow-medium p-3 border border-gray-100 transition-all duration-300 group-hover:shadow-strong group-hover:-translate-y-1">
                      <img 
                        src={img.src} 
                        alt={img.alt}
                        className="w-full h-auto rounded-xl object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-sm text-[#A3C5D9] font-medium mt-3 text-center">{img.alt}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative Blobs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#A7DDE9] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#66B2D6] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        </div>
      </section>

      {/* ════════ How It Works ════════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16" ref={addRevealRef} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E6FAF5] text-[#66B2D6] font-bold text-sm mb-4 tracking-wide">SIMPLE & FAST</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E50]">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 relative">
            {/* Connecting Line (desktop only) */}
            <div className="hidden md:block absolute top-[72px] left-[16.67%] right-[16.67%] h-0.5 border-t-2 border-dashed border-[#66B2D6]/40 z-0"></div>

            {/* Step 1 */}
            <div ref={addRevealRef} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '0.1s' }} className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl hover:bg-[#fafdff] transition-colors group">
              <div className="w-20 h-20 rounded-2xl bg-[#E6FAF5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                <UserPlus className="w-9 h-9 text-[#66B2D6]" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#66B2D6] text-white text-xs font-bold flex items-center justify-center shadow-md">1</span>
              </div>
              <h3 className="text-lg font-bold text-[#2C3E50] mb-2">Create Account</h3>
              <p className="text-[#A3C5D9] text-sm leading-relaxed">Sign up for free in seconds with email, Google, or GitHub.</p>
            </div>

            {/* Step 2 */}
            <div ref={addRevealRef} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '0.25s' }} className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl hover:bg-[#fafdff] transition-colors group">
              <div className="w-20 h-20 rounded-2xl bg-[#E6FAF5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                <Upload className="w-9 h-9 text-[#66B2D6]" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#66B2D6] text-white text-xs font-bold flex items-center justify-center shadow-md">2</span>
              </div>
              <h3 className="text-lg font-bold text-[#2C3E50] mb-2">Upload Your Files</h3>
              <p className="text-[#A3C5D9] text-sm leading-relaxed">Drag & drop or import directly from Google Drive. It's that easy.</p>
            </div>

            {/* Step 3 */}
            <div ref={addRevealRef} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '0.4s' }} className="relative z-10 flex flex-col items-center text-center p-8 rounded-2xl hover:bg-[#fafdff] transition-colors group">
              <div className="w-20 h-20 rounded-2xl bg-[#E6FAF5] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative">
                <Share2 className="w-9 h-9 text-[#66B2D6]" />
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-[#66B2D6] text-white text-xs font-bold flex items-center justify-center shadow-md">3</span>
              </div>
              <h3 className="text-lg font-bold text-[#2C3E50] mb-2">Share & Manage</h3>
              <p className="text-[#A3C5D9] text-sm leading-relaxed">Share with anyone, set permissions, and manage everything from one dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Google Drive Integration (New Section [Img 1]) ════════ */}
      <section className="py-24 px-4 bg-[#fafdff]">
        <div
          ref={addRevealRef}
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
          className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16"
        >
          {/* Text Content */}
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#2C3E50] mb-6 leading-[1.15]">
              Seamless integration with your favorite tool
            </h2>
            <p className="text-lg text-[#A3C5D9] mb-8 leading-relaxed font-medium">
              Connect Storemystuff with your existing workflow. Securely import specific files from Google Drive with complete control. No auto-syncing—<span className="text-[#66B2D6] font-bold">you choose exactly what to transfer</span>.
            </p>
            <ul className="space-y-4">
              {[
                "Selective Google Drive Import",
                "User Consent Required",
                "Download selected file to our servers",
                "Access, Share & Manage"
              ].map((text, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0 shadow-sm border border-blue-100">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" strokeWidth="4" stroke="currentColor">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[#2C3E50] font-semibold text-base">{text}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card Mockup */}
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 md:p-8 max-w-md w-full relative">
              {/* Card Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-extrabold text-xl shadow-md">
                    G
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-800 leading-tight">Google Drive Import</h4>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">Select files • No auto-sync</p>
                  </div>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
              </div>

              {/* File Rows */}
              <div className="space-y-4">
                {/* File 1 (DOC) */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">DOC</span>
                    <span className="text-sm font-semibold text-slate-700">Project_Specs.doc</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Ready</span>
                </div>

                {/* File 2 (XLS) */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white shadow-sm">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" stroke="currentColor">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded uppercase tracking-wider">XLS</span>
                    <span className="text-sm font-semibold text-slate-700">Q4_Budget.xlsx</span>
                  </div>
                  <span className="text-xs font-bold text-slate-400">Ready</span>
                </div>

                {/* File 3 (PDF) */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 opacity-60">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white"></div>
                    <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded uppercase tracking-wider">PDF</span>
                    <span className="text-sm font-semibold text-slate-400">Old_Report.pdf</span>
                  </div>
                  <span className="text-xs font-bold text-slate-300">Skipped</span>
                </div>
              </div>

              {/* Button */}
              <button 
                onClick={handleGetStarted}
                className="w-full mt-6 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98] cursor-pointer"
              >
                Import 2 Selected Files
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ════════ Everything you need to manage your digital assets (New Section [Img 2]) ════════ */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div
            ref={addRevealRef}
            style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-extrabold text-[#2C3E50] mb-4">
              Everything you need to manage your digital assets
            </h2>
            <p className="text-[#A3C5D9] text-lg max-w-2xl mx-auto font-medium">
              Powerful features designed for speed, security, and collaboration.
            </p>
          </div>

          <div
            ref={addRevealRef}
            style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '0.1s' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {coreFeatures.map((feat, idx) => (
              <div 
                key={idx} 
                className="p-8 rounded-2xl bg-[#f8fafc] border border-slate-100 hover:border-[#66B2D6] hover:bg-white hover:shadow-lg transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bgClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-[#2C3E50] mb-3">{feat.title}</h3>
                <p className="text-[#A3C5D9] text-sm leading-relaxed font-medium">{feat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════ Pricing / Plans Section ════════ */}
      <LandingPlansSection onGetStarted={handleGetStarted} addRevealRef={addRevealRef} />

      {/* Trust Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto bg-[#66B2D6] rounded-[2.5rem] p-12 md:p-20 text-center text-white relative overflow-hidden shadow-strong">
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 italic">"The most intuitive storage experience I've ever used."</h2>
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white/50 bg-[#A7DDE9] flex items-center justify-center font-bold">V</div>
                <div className="text-left">
                  <p className="font-bold">Varun Mendre</p>
                  <p className="text-sm opacity-80 uppercase tracking-widest">Founder, CloudVault</p>
                </div>
              </div>
            </div>
            {/* Subtle Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <Globe className="w-full h-full scale-[2]" />
            </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl md:text-5xl font-bold text-[#2C3E50] mb-8">Ready to secure your files?</h2>
        <button 
          onClick={handleGetStarted}
          className="px-12 py-5 bg-[#2C3E50] text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-strong active:scale-95"
        >
          Create Free Account
        </button>
      </section>

      {/* The Mandatory Legal Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;

// ─── Pricing data (mirrors Plans.jsx PLAN_CATALOG, monthly only for landing) ───
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
  const displayPrice = isYearly && !plan.isFree ? Math.floor(plan.yearlyPrice / 12) : plan.price;
  const displayFeatures = isYearly && !plan.isFree && plan.yearlyFeatures ? plan.yearlyFeatures : plan.features;

  return (
    <div
      className={[
        'relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md',
        plan.popular ? 'ring-1' : plan.isFree ? 'border-green-500 ring-1 ring-green-500/20' : 'ring-1',
      ].join(' ')}
      style={
        plan.popular
          ? { borderColor: '#66B2D6' }
          : plan.isFree
            ? undefined
            : { borderColor: '#D4AF37', '--tw-ring-color': 'rgba(212,175,55,0.25)' }
      }
    >
      {/* Popular badge */}
      {plan.popular && (
        <div className="absolute -top-2 right-4 select-none rounded-full px-2 py-0.5 text-xs font-medium text-white shadow" style={{ backgroundColor: '#66B2D6' }}>
          MOST POPULAR
        </div>
      )}
      {/* Free badge */}
      {plan.isFree && (
        <div className="absolute -top-2 right-4 select-none rounded-sm bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
          START HERE
        </div>
      )}

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className={['p-1.5 rounded-lg', plan.isFree ? 'bg-green-50 text-green-600' : plan.popular ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'].join(' ')}>
              {plan.isFree ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l1.912 5.886h6.188l-5.007 3.638 1.913 5.887-5.006-3.639-5.006 3.639 1.913-5.887-5.007-3.638h6.188L12 3z" /></svg>
              ) : plan.popular ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
              )}
            </div>
            <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
          </div>
          <p className="text-xs font-semibold" style={{ color: '#66B2D6' }}>{plan.tagline}</p>
          <p className="text-[11px] text-slate-500 leading-tight">{plan.description}</p>
        </div>
      </div>

      {/* Price */}
      <div className="mb-6 mt-2 flex flex-col gap-0.5">
        <div className="flex items-end gap-1">
          {displayPrice === 0 ? (
            <span className="text-4xl font-bold tracking-tight text-slate-900">Free</span>
          ) : (
            <>
              <span className="text-lg font-semibold text-slate-700">₹</span>
              <span className="text-4xl font-bold tracking-tight text-slate-900">{displayPrice}</span>
              <span className="mb-[6px] text-sm text-slate-500">/month</span>
            </>
          )}
        </div>
        {isYearly && !plan.isFree && plan.yearlyPrice && (
          <div className="flex flex-col">
            <span className="text-[11px] text-slate-500 font-medium">Billed annually at ₹{plan.yearlyPrice}</span>
            <span className="text-[11px] text-green-600 font-bold mt-0.5">
              Save ₹{(plan.price * 12) - plan.yearlyPrice} per year
            </span>
          </div>
        )}
      </div>

      <div className="h-px bg-slate-100 mb-6" />

      {/* CTA Button */}
      <button
        onClick={onGetStarted}
        className={[
          'mb-6 cursor-pointer inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition focus:outline-none',
          plan.isFree
            ? 'bg-green-600 text-white hover:bg-green-700'
            : plan.popular
              ? 'text-white hover:opacity-90'
              : 'bg-slate-900 text-white hover:bg-slate-800',
        ].join(' ')}
        style={plan.popular && !plan.isFree ? { backgroundColor: '#66B2D6' } : undefined}
      >
        {plan.cta}
      </button>

      {/* Features list */}
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">What's Included</div>
      <ul className="space-y-3 text-[13px] text-slate-600">
        {displayFeatures.map((f, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <svg className="mt-0.5 h-3.5 w-3.5 flex-none text-green-500" viewBox="0 0 24 24" fill="none" strokeWidth="3.5" stroke="currentColor">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function LandingPlansSection({ onGetStarted, addRevealRef }) {
  const [mode, setMode] = useState('monthly');

  return (
    <section className="py-24 px-4 bg-[#fafdff]">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div
          className="text-center mb-12"
          ref={addRevealRef}
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-[#E6FAF5] text-[#66B2D6] font-bold text-sm mb-4 tracking-wide">PRICING</span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E50] mb-4">Simple, Transparent Pricing</h2>
          <p className="text-[#A3C5D9] text-lg max-w-2xl mx-auto">Start free and scale as you grow. No hidden fees, cancel anytime.</p>
        </div>

        {/* Monthly / Yearly toggle */}
        <div
          className="mb-10 flex justify-center"
          ref={addRevealRef}
          style={{ opacity: 0, transform: 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '0.1s' }}
        >
          <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 shadow-sm">
            <button
              onClick={() => setMode('monthly')}
              className={[
                'rounded-lg px-8 py-2.5 text-sm font-bold transition-all cursor-pointer',
                mode === 'monthly' ? 'text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
              style={mode === 'monthly' ? { backgroundColor: '#66B2D6' } : undefined}
            >
              Monthly
            </button>
            <button
              onClick={() => setMode('yearly')}
              className={[
                'rounded-lg px-8 py-2.5 text-sm font-bold transition-all cursor-pointer flex items-center gap-2',
                mode === 'yearly' ? 'text-white shadow-sm' : 'text-slate-600 hover:text-slate-900',
              ].join(' ')}
              style={mode === 'yearly' ? { backgroundColor: '#66B2D6' } : undefined}
            >
              Yearly
              {mode !== 'yearly' && (
                <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">SAVE</span>
              )}
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          ref={addRevealRef}
          style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)', transitionDelay: '0.2s' }}
        >
          {LANDING_PLANS.map((plan) => (
            <LandingPlanCard
              key={plan.id}
              plan={plan}
              mode={mode}
              onGetStarted={onGetStarted}
            />
          ))}
        </div>

        {/* Sub-note */}
        <p
          className="mt-8 text-center text-sm text-[#A3C5D9]"
          ref={addRevealRef}
          style={{ opacity: 0, transition: 'all 0.6s ease', transitionDelay: '0.3s' }}
        >
          All plans include a free trial period. No credit card required to sign up.
        </p>
      </div>
    </section>
  );
}
