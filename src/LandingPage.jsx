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
  ChevronRight
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
    navigate('/login');
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

  const featureHighlights = [
    {
      icon: <FolderSync className="w-8 h-8 text-[#66B2D6]" />,
      title: 'Import from Google Drive',
      description: 'Seamlessly import your existing files directly from Google Drive with our one-click integration. No manual downloads needed — just pick and import.',
      illustration: (
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#E6FAF5] to-[#f0f9ff] rounded-2xl flex items-center justify-center overflow-hidden group">
          {/* Central icon */}
          <div className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-medium flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <FolderSync className="w-12 h-12 text-[#66B2D6]" />
          </div>
          {/* Floating elements */}
          <div className="absolute top-6 right-8 w-12 h-12 bg-white/80 rounded-xl shadow-soft flex items-center justify-center animate-pulse" style={{ animationDuration: '3s' }}>
            <Upload className="w-6 h-6 text-[#A7DDE9]" />
          </div>
          <div className="absolute bottom-8 left-8 w-10 h-10 bg-white/80 rounded-lg shadow-soft flex items-center justify-center animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <Cloud className="w-5 h-5 text-[#66B2D6]" />
          </div>
          <div className="absolute top-10 left-12 w-8 h-8 bg-[#66B2D6]/10 rounded-full animate-pulse" style={{ animationDuration: '2.5s' }}></div>
          <div className="absolute bottom-12 right-12 w-6 h-6 bg-[#A7DDE9]/20 rounded-full animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>
          {/* Connection lines */}
          <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#66B2D6]/20 to-transparent"></div>
          <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-[#66B2D6]/20 to-transparent"></div>
        </div>
      ),
    },
    {
      icon: <Link className="w-8 h-8 text-[#66B2D6]" />,
      title: 'Seamless File Sharing',
      description: 'Share files and folders via public links or directly with specific users. Assign Viewer or Editor roles for granular control over who sees what.',
      illustration: (
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#f0f9ff] to-[#E6FAF5] rounded-2xl flex items-center justify-center overflow-hidden group">
          {/* Central icon */}
          <div className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-medium flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <Share2 className="w-12 h-12 text-[#66B2D6]" />
          </div>
          {/* User avatars */}
          <div className="absolute top-8 left-10 w-11 h-11 bg-[#66B2D6] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-soft animate-pulse" style={{ animationDuration: '3s' }}>A</div>
          <div className="absolute top-6 right-10 w-11 h-11 bg-[#A7DDE9] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-soft animate-pulse" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>B</div>
          <div className="absolute bottom-8 right-16 w-11 h-11 bg-[#2C3E50] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-soft animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}>C</div>
          {/* Link icon */}
          <div className="absolute bottom-10 left-12 w-10 h-10 bg-white/80 rounded-lg shadow-soft flex items-center justify-center animate-pulse" style={{ animationDuration: '2.5s' }}>
            <Link className="w-5 h-5 text-[#66B2D6]" />
          </div>
          {/* Connecting dots */}
          <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-[#66B2D6]/30 rounded-full"></div>
          <div className="absolute top-2/3 right-1/4 w-2 h-2 bg-[#A7DDE9]/30 rounded-full"></div>
        </div>
      ),
    },
    {
      icon: <HardDrive className="w-8 h-8 text-[#66B2D6]" />,
      title: 'Expand Your Storage',
      description: 'Upgrade your plan anytime to unlock more storage, connect more devices, and enjoy priority upload speeds. Flexible monthly billing via Razorpay.',
      illustration: (
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#E6FAF5] to-[#f0f9ff] rounded-2xl flex items-center justify-center overflow-hidden group">
          {/* Central icon */}
          <div className="relative z-10 w-24 h-24 bg-white rounded-2xl shadow-medium flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
            <HardDrive className="w-12 h-12 text-[#66B2D6]" />
          </div>
          {/* Storage bars */}
          <div className="absolute bottom-8 left-8 right-8 space-y-2">
            <div className="h-2 bg-white/60 rounded-full overflow-hidden"><div className="h-full w-[30%] bg-[#66B2D6] rounded-full"></div></div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden"><div className="h-full w-[60%] bg-[#A7DDE9] rounded-full"></div></div>
            <div className="h-2 bg-white/60 rounded-full overflow-hidden"><div className="h-full w-[85%] bg-gradient-to-r from-[#66B2D6] to-[#A7DDE9] rounded-full"></div></div>
          </div>
          {/* Floating elements */}
          <div className="absolute top-6 right-8 w-12 h-12 bg-white/80 rounded-xl shadow-soft flex items-center justify-center animate-pulse" style={{ animationDuration: '3s' }}>
            <Zap className="w-6 h-6 text-[#66B2D6]" />
          </div>
          <div className="absolute top-8 left-10 w-10 h-10 bg-white/80 rounded-lg shadow-soft flex items-center justify-center animate-pulse" style={{ animationDuration: '4s', animationDelay: '1s' }}>
            <Shield className="w-5 h-5 text-[#A7DDE9]" />
          </div>
        </div>
      ),
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
            {/* Connecting Lines (desktop only) */}
            <div className="hidden md:block absolute top-16 left-[calc(33.33%+0.5rem)] w-[calc(33.33%-2.5rem)] h-[2px] bg-gradient-to-r from-[#66B2D6] to-[#A7DDE9] z-0"></div>
            <div className="hidden md:block absolute top-16 right-[calc(33.33%+0.5rem)] w-[calc(33.33%-2.5rem)] h-[2px] bg-gradient-to-r from-[#A7DDE9] to-[#66B2D6] z-0"></div>

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

      {/* ════════ Feature Highlights — Alternating Rows ════════ */}
      <section className="py-24 px-4 bg-[#fafdff]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20" ref={addRevealRef} style={{ opacity: 0, transform: 'translateY(30px)', transition: 'all 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#E6FAF5] text-[#66B2D6] font-bold text-sm mb-4 tracking-wide">FEATURES</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E50]">Powerful Features, Built for You</h2>
          </div>

          <div className="space-y-24">
            {featureHighlights.map((feature, index) => {
              const isReversed = index % 2 !== 0;
              return (
                <div
                  key={index}
                  ref={addRevealRef}
                  style={{
                    opacity: 0,
                    transform: isReversed ? 'translateX(40px)' : 'translateX(-40px)',
                    transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className={`flex flex-col ${
                    isReversed ? 'md:flex-row-reverse' : 'md:flex-row'
                  } items-center gap-10 md:gap-16`}
                >
                  {/* Illustration */}
                  <div className="w-full md:w-1/2 flex-shrink-0">
                    {feature.illustration}
                  </div>

                  {/* Text */}
                  <div className="w-full md:w-1/2">
                    <div className="w-14 h-14 rounded-xl bg-[#E6FAF5] flex items-center justify-center mb-5">
                      {feature.icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-[#2C3E50] mb-4">{feature.title}</h3>
                    <p className="text-[#A3C5D9] text-lg leading-relaxed mb-6">{feature.description}</p>
                    <button
                      onClick={handleGetStarted}
                      className="inline-flex items-center gap-2 text-[#66B2D6] font-bold hover:gap-3 transition-all"
                    >
                      Learn More <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════ Pricing / Plans Section ════════ */}
      <LandingPlansSection onGetStarted={handleGetStarted} addRevealRef={addRevealRef} />

      {/* Features Grid */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#2C3E50] mb-4">Everything You Need</h2>
            <div className="w-20 h-1.5 bg-[#66B2D6] mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-[#fafdff] border border-gray-50 hover:border-[#66B2D6] transition-all group">
              <div className="w-14 h-14 rounded-xl bg-white shadow-soft flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-[#66B2D6]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Enterprise Security</h3>
              <p className="text-[#A3C5D9] leading-relaxed">
                Your data is encrypted at rest and in transit using S3 industry standards in the ap-south-1 region.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-[#fafdff] border border-gray-50 hover:border-[#66B2D6] transition-all group">
              <div className="w-14 h-14 rounded-xl bg-white shadow-soft flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-[#66B2D6]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Lightning Speed</h3>
              <p className="text-[#A3C5D9] leading-relaxed">
                Powered by AWS CloudFront, experience minimal latency for uploads and downloads anywhere.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-[#fafdff] border border-gray-50 hover:border-[#66B2D6] transition-all group">
              <div className="w-14 h-14 rounded-xl bg-white shadow-soft flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Share2 className="w-7 h-7 text-[#66B2D6]" />
              </div>
              <h3 className="text-xl font-bold text-[#2C3E50] mb-3">Seamless Sharing</h3>
              <p className="text-[#A3C5D9] leading-relaxed">
                Share files and folders with specific users or via public links with customizable permissions.
              </p>
            </div>
          </div>
        </div>
      </section>

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
    price: 349,
    yearlyPrice: 3999,
    yearlyStorage: '200 GB',
    cta: 'Get Started',
    popular: true,
    isFree: false,
    features: [
      '100 GB secure storage',
      'File upload limit: 1 GB per file',
      'Access from up to 2 devices',
      'Priority upload/download speed',
      'Email & chat support',
    ],
    yearlyFeatures: [
      '200 GB secure storage',
      'File upload limit: 1 GB per file',
      'Access from up to 2 devices',
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
    price: 999,
    yearlyPrice: 7999,
    yearlyStorage: '300 GB',
    cta: 'Get Started',
    popular: false,
    isFree: false,
    features: [
      '200 GB secure storage',
      'File upload limit: 2 GB per file',
      'Access from up to 3 devices',
      'Priority upload/download speed',
      'Priority customer support',
    ],
    yearlyFeatures: [
      '300 GB secure storage',
      'File upload limit: 2 GB per file',
      'Access from up to 3 devices',
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
        plan.popular ? 'ring-1' : plan.isFree ? 'border-green-500 ring-1 ring-green-500/20' : 'border-slate-200',
      ].join(' ')}
      style={plan.popular ? { borderColor: '#66B2D6' } : undefined}
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
