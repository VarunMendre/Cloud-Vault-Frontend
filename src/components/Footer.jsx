import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Heart, Shield, Zap, Globe } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-card border-t-2 border-border mt-auto relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            
            <div className="max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                <Cloud className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-3xl font-black text-text-main tracking-tighter">Cloud<span className="text-primary tracking-tight">Vault</span></span>
                        </div>
                        <p className="text-lg font-bold text-muted max-w-sm leading-relaxed">
                            Securing the world's digital legacy with high-speed grid storage and quantum-grade encryption.
                        </p>
                        <div className="flex gap-4">
                           <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted hover:text-primary transition-all cursor-pointer border border-border/50 hover:border-primary/20"><Shield size={18} /></div>
                           <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted hover:text-primary transition-all cursor-pointer border border-border/50 hover:border-primary/20"><Zap size={18} /></div>
                           <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-muted hover:text-primary transition-all cursor-pointer border border-border/50 hover:border-primary/20"><Globe size={18} /></div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.3em] mb-10 opacity-40">Legal Core</h3>
                        <ul className="space-y-6">
                            <li>
                                <Link to="/privacy-policy" className="text-sm font-black text-muted hover:text-text-main transition-colors tracking-tight">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/terms-of-service" className="text-sm font-black text-muted hover:text-text-main transition-colors tracking-tight">Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="text-sm font-black text-muted hover:text-text-main transition-colors tracking-tight">Refund & Logistics</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-[10px] font-black text-text-main uppercase tracking-[0.3em] mb-10 opacity-40">Operations</h3>
                        <ul className="space-y-6">
                            <li>
                                <Link to="/contact-us" className="text-sm font-black text-muted hover:text-text-main transition-colors tracking-tight">Contact Node</Link>
                            </li>
                            <li>
                                <a href="mailto:varunmm0404@gmail.com" className="text-sm font-black text-muted hover:text-text-main transition-colors tracking-tight">Cloud Support</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-10 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-bold text-muted">
                    <p className="tracking-tight">© {currentYear} CloudVault Infrastructure. All rights reserved.</p>
                    <div className="flex items-center gap-3 px-5 py-2 bg-secondary rounded-full border border-border/30">
                        <span className="text-[10px] uppercase tracking-widest opacity-60">Engineered with</span> 
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> 
                        <span className="text-text-main tracking-tight">by Varun Mendre</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
