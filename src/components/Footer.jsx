import React from 'react';
import { Link } from 'react-router-dom';
import { Cloud, Heart } from 'lucide-react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-100 mt-auto">
            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-[#66B2D6] flex items-center justify-center">
                                <Cloud className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-[#2C3E50]">CloudVault</span>
                        </div>
                        <p className="text-[#A3C5D9] max-w-sm leading-relaxed">
                            Your secure, reliable, and lightning-fast cloud storage solution. Built with security and privacy as our top priority.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-6">Legal</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/privacy-policy" className="text-[#A3C5D9] hover:text-[#66B2D6] transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link to="/terms-of-service" className="text-[#A3C5D9] hover:text-[#66B2D6] transition-colors">Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/refund-policy" className="text-[#A3C5D9] hover:text-[#66B2D6] transition-colors">Refund & Cancellation</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h3 className="text-sm font-bold text-[#2C3E50] uppercase tracking-wider mb-6">Support</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link to="/contact-us" className="text-[#A3C5D9] hover:text-[#66B2D6] transition-colors">Contact Us</Link>
                            </li>
                            <li>
                                <a href="mailto:varunmm0404@gmail.com" className="text-[#A3C5D9] hover:text-[#66B2D6] transition-colors">Help Center</a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#A3C5D9]">
                    <p>© {currentYear} CloudVault. All rights reserved.</p>
                    <div className="flex items-center gap-1">
                        Made with <Heart className="w-4 h-4 text-red-400 fill-current" /> by Varun Mendre
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
