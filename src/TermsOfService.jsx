import React from 'react';
import { Scale, AlertCircle, UserX, CheckCircle, Mail, ChevronRight, Gavel, Clock } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                
                {/* Legal Header */}
                <div className="flex items-center gap-4 px-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center -rotate-3">
                        <Gavel className="w-6 h-6 text-[#66B2D6]" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-[#66B2D6] uppercase tracking-[0.3em] mb-1">Service Protocols</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <Clock className="w-3 h-3" />
                            REVISION: 4.2 // JAN 16, 2026
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-12 md:px-12">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Terms of Engagement</h1>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-12">Governing the use of CloudVault infrastructure</p>

                        <div className="space-y-12">
                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <CheckCircle className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Agreement to Terms</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    By accessing or using CloudVault, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services. Your continued use constitutes acceptance of these operational protocols.
                                </p>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <AlertCircle className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">User Obligations</h2>
                                </div>
                                <div className="pl-14 space-y-4">
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                        You are responsible for the content you upload to CloudVault. You agree not to:
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            'Upload any content that is illegal, harmful, or violates copyright laws.',
                                            'Attempt to breach the security of the platform or access other users\' data.',
                                            'Use the service for any unauthorized automated access or scraping.'
                                        ].map((text, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="mt-1.5 w-1.5 h-1.5 bg-[#66B2D6] rounded-full shadow-[0_0_8px_rgba(102,178,214,0.5)]"></div>
                                                <p className="text-sm font-medium text-gray-500">{text}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <UserX className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Account Termination</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    You may delete your account at any time. Upon account deletion, <strong className="text-gray-900 font-bold">all your data will be immediately and permanently vanished</strong>. We do not retain any residual data from deleted accounts. We also reserve the right to terminate accounts that violate these terms.
                                </p>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <Scale className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Limitation of Liability</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    CloudVault provides the service "as is". While we strive for 100% uptime and data security, we are not liable for any indirect, incidental, or consequential damages resulting from the use of our service or infrastructure nodes.
                                </p>
                            </section>
                        </div>

                        <div className="mt-20 pt-12 border-t border-gray-100">
                            <div className="bg-gray-900 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
                                <div>
                                    <h3 className="text-lg font-bold tracking-tight mb-1">Legal Inquiries</h3>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Formal communication channel</p>
                                </div>
                                <a 
                                    href="mailto:varunmm0404@gmail.com" 
                                    className="flex items-center gap-3 px-8 py-4 bg-white/10 border border-white/5 rounded-2xl hover:bg-white/20 transition-all group"
                                >
                                    <Mail className="w-5 h-5 text-[#66B2D6]" />
                                    <span className="text-xs font-black uppercase tracking-widest">Connect with Legal</span>
                                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center pt-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Secured by CloudVault Infrastructure</p>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
