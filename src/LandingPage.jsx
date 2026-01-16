import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cloud, 
  Shield, 
  Zap, 
  Share2, 
  Lock, 
  Globe, 
  ArrowRight,
  HardDrive,
  Layers
} from 'lucide-react';
import Footer from './components/Footer';

const LandingPage = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Redirect to the login page on the main domain
    window.location.href = 'https://cloudvault.cloud/login';
  };

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

          {/* Hero Image Mockup (Visual abstraction) */}
          <div className="mt-20 relative max-w-5xl mx-auto animate-scaleIn">
            <div className="relative z-10 bg-white rounded-3xl shadow-strong p-4 border border-gray-100 overflow-hidden">
               <div className="aspect-[16/9] bg-[#f8fafc] rounded-2xl flex items-center justify-center overflow-hidden border border-dashed border-gray-200">
                  <div className="flex flex-col items-center gap-4 text-[#A3C5D9]">
                    <Layers className="w-20 h-20 opacity-20" />
                    <p className="font-semibold italic">Live Product Preview Coming Soon</p>
                  </div>
               </div>
            </div>
            {/* Decorative Blobs */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#A7DDE9] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#66B2D6] rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
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
