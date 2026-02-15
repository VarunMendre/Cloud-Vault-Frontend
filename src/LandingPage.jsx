import React, { useEffect, useRef } from 'react';
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
      image: dashboardImg,
      imageAlt: 'Google Drive Import',
    },
    {
      icon: <Link className="w-8 h-8 text-[#66B2D6]" />,
      title: 'Seamless File Sharing',
      description: 'Share files and folders via public links or directly with specific users. Assign Viewer or Editor roles for granular control over who sees what.',
      image: settingsImg,
      imageAlt: 'File Sharing',
    },
    {
      icon: <HardDrive className="w-8 h-8 text-[#66B2D6]" />,
      title: 'Expand Your Storage',
      description: 'Upgrade your plan anytime to unlock more storage, connect more devices, and enjoy priority upload speeds. Flexible monthly billing via Razorpay.',
      image: subscriptionImg,
      imageAlt: 'Subscription Plans',
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
                  {/* Image */}
                  <div className="w-full md:w-1/2 flex-shrink-0">
                    <div className="bg-white rounded-2xl shadow-medium p-3 border border-gray-100 overflow-hidden group">
                      <img
                        src={feature.image}
                        alt={feature.imageAlt}
                        className="w-full h-auto rounded-xl object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </div>
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
