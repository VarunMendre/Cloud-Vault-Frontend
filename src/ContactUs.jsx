import { Mail, MessageSquare, MapPin, Clock, ShieldCheck, Zap } from 'lucide-react';
import './PublicInfoPages.css';

const ContactUs = () => {
    return (
        <div className="public-info-page public-info-contact">
            <div className="public-info-container public-info-contact-container">
                
                {/* Communication Header */}
                <div className="public-info-header public-info-contact-header flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-5">
                        <div className="public-info-header-icon w-16 h-16 bg-white rounded-[1.5rem] border border-gray-200 shadow-sm flex items-center justify-center">
                             <MessageSquare className="w-8 h-8 text-[#66B2D6]" />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.4em] mb-1">Contact CloudVault</h2>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Contact support</h1>
                            <p className="public-info-contact-summary">Get in touch with our support team.</p>
                        </div>
                    </div>
                </div>

                <div className="public-info-card public-info-contact-card bg-white rounded-[3rem] border border-gray-200 shadow-strong overflow-hidden relative">
                    <div className="public-info-decoration absolute top-0 right-0 w-64 h-64 bg-[#66B2D6]/5 rounded-bl-[10rem] -z-10" />
                    
                    <div className="public-info-card-body p-10 md:p-16">
                        <div className="public-info-contact-grid grid grid-cols-1 md:grid-cols-2 gap-16">
                            
                            {/* Left Column: Email and hours */}
                            <div className="space-y-12">
                                <section className="group" id="email-registry-section">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-all group-hover:shadow-lg group-hover:shadow-gray-100">
                                            <Mail className="w-6 h-6 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Email support</h2>
                                    </div>
                                    <div className="pl-16 space-y-4">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Email address</p>
                                        <a 
                                            href="mailto:varunmm0404@gmail.com" 
                                            id="support-email-link"
                                            className="text-lg font-black text-gray-900 hover:text-[#66B2D6] transition-colors underline decoration-gray-200 underline-offset-[12px] block"
                                        >
                                            varunmm0404@gmail.com
                                        </a>
                                        <div className="pt-4 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-[#66B2D6]" />
                                            <span className="text-[10px] font-black text-gray-400 underline uppercase tracking-widest decoration-[#66B2D6]/20 underline-offset-4">Usually replies within 24 hours</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="group" id="active-hours-section">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-all group-hover:shadow-lg group-hover:shadow-gray-100">
                                            <Clock className="w-6 h-6 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Support hours</h2>
                                    </div>
                                    <div className="pl-16 space-y-6">
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Weekdays</p>
                                            <p className="text-base font-bold text-gray-800">Monday — Friday</p>
                                        </div>
                                        <div className="public-info-hours inline-flex items-center gap-3 px-4 py-2 bg-gray-950 rounded-xl">
                                             <Zap className="w-3.5 h-3.5 text-[#66B2D6]" />
                                             <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">09:00 — 18:00 IST</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: Location and privacy */}
                            <div className="space-y-12">
                                <section className="group" id="headquarters-section">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-all group-hover:shadow-lg group-hover:shadow-gray-100">
                                            <MapPin className="w-6 h-6 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Our location</h2>
                                    </div>
                                    <div className="pl-16 space-y-4">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Based in</p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">CloudVault Digital Ops Hub</p>
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">Maharashtra, India</p>
                                        </div>
                                    </div>
                                </section>

                                <div className="public-info-contact-note">
                                    <ShieldCheck size={20} aria-hidden="true" />
                                    <p>For your security, never include your password or other sensitive account details in an email.</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
