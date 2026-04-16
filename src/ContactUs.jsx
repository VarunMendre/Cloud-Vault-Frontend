import React from 'react';
import { Mail, MessageSquare, MapPin, Clock, Globe, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

const ContactUs = () => {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-24 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl w-full space-y-12 animate-fadeIn">
                
                {/* Communication Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-white rounded-[1.5rem] border border-gray-200 shadow-sm flex items-center justify-center rotate-3 transform hover:rotate-0 transition-transform duration-500">
                             <MessageSquare className="w-8 h-8 text-[#66B2D6]" />
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black text-[#66B2D6] uppercase tracking-[0.4em] mb-1">Comm Relay</h2>
                            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Support Ingress</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-5 py-2.5 bg-emerald-50 border border-emerald-100/50 rounded-2xl shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Global Ops Node Active</span>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] border border-gray-200 shadow-strong overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#66B2D6]/5 rounded-bl-[10rem] -z-10" />
                    
                    <div className="p-10 md:p-16">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                            
                            {/* Left Column: Direct Relays */}
                            <div className="space-y-12">
                                <section className="group" id="email-registry-section">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-all group-hover:shadow-lg group-hover:shadow-gray-100">
                                            <Mail className="w-6 h-6 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Direct Ingress</h2>
                                    </div>
                                    <div className="pl-16 space-y-4">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Protocol Address</p>
                                        <a 
                                            href="mailto:varunmm0404@gmail.com" 
                                            id="support-email-link"
                                            className="text-lg font-black text-gray-900 hover:text-[#66B2D6] transition-colors underline decoration-gray-200 underline-offset-[12px] block"
                                        >
                                            varunmm0404@gmail.com
                                        </a>
                                        <div className="pt-4 flex items-center gap-2">
                                            <Clock className="w-3.5 h-3.5 text-[#66B2D6]" />
                                            <span className="text-[10px] font-black text-gray-400 underline uppercase tracking-widest decoration-[#66B2D6]/20 underline-offset-4">&lt; 24h Response logic</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="group" id="active-hours-section">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-all group-hover:shadow-lg group-hover:shadow-gray-100">
                                            <Clock className="w-6 h-6 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Operational Cycle</h2>
                                    </div>
                                    <div className="pl-16 space-y-6">
                                        <div>
                                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-2">Standard Phase</p>
                                            <p className="text-base font-bold text-gray-800">Monday — Friday</p>
                                        </div>
                                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-gray-950 rounded-xl">
                                             <Zap className="w-3.5 h-3.5 text-[#66B2D6]" />
                                             <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">09:00 — 18:00 IST</p>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: Physical & Brand */}
                            <div className="space-y-12">
                                <section className="group" id="headquarters-section">
                                    <div className="flex items-center gap-5 mb-6">
                                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-all group-hover:shadow-lg group-hover:shadow-gray-100">
                                            <MapPin className="w-6 h-6 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Main Cluster</h2>
                                    </div>
                                    <div className="pl-16 space-y-4">
                                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Geospatial Origin</p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">CloudVault Digital Ops Hub</p>
                                            <p className="text-sm font-bold text-gray-700 leading-relaxed">Maharashtra, Republic of India</p>
                                        </div>
                                        <div className="flex items-center gap-2 text-[#66B2D6]">
                                            <Globe className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Global Distribution active</span>
                                        </div>
                                    </div>
                                </section>

                                <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100 shadow-inner group">
                                     <div className="flex items-center gap-3 mb-4">
                                         <ShieldCheck className="w-5 h-5 text-emerald-500" />
                                         <p className="text-xs font-black text-gray-900 uppercase tracking-widest">Protocol Guard</p>
                                     </div>
                                     <p className="text-xs font-medium text-gray-400 leading-relaxed mb-6">
                                         All support transmissions are encrypted and routed through our secure internal relay for data integrity and user privacy.
                                     </p>
                                     <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
                                          <div className="w-1/3 h-full bg-[#66B2D6] group-hover:w-full transition-all duration-1000 ease-in-out" />
                                     </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Bridge */}
                        <div className="mt-20 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                             <div className="flex items-center gap-4">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operational Ready for help</span>
                             </div>
                             <button 
                                id="initiate-chat-btn"
                                className="px-8 py-4 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center gap-3 group/btn"
                             >
                                Initiate Secure Relay
                                <ChevronRight className="w-4 h-4 text-[#66B2D6] group-hover/btn:translate-x-1 transition-transform" />
                             </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
