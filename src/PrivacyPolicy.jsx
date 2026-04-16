import React from 'react';
import { Shield, Lock, Eye, FileText, Mail, ChevronRight, ShieldCheck, Clock } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                
                {/* Protocol Header */}
                <div className="flex items-center gap-4 px-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center rotate-3">
                        <Shield className="w-6 h-6 text-[#66B2D6]" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-[#66B2D6] uppercase tracking-[0.3em] mb-1">Compliance System</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <Clock className="w-3 h-3" />
                            UPDATED: JAN 16, 2026
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-12 md:px-12">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Privacy Framework</h1>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-12">Establishing data sovereignty protocols</p>

                        <div className="space-y-12">
                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <Eye className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Introduction</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    Welcome to CloudVault. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our secure storage services.
                                </p>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <FileText className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Information We Collect</h2>
                                </div>
                                <div className="pl-14 space-y-4">
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed">
                                        To provide our services, we collect the following types of information:
                                    </p>
                                    <ul className="space-y-3">
                                        {[
                                            { label: 'Personal Identification', desc: 'Name, Email address, and Google Profile information.' },
                                            { label: 'Storage Data', desc: 'The files, folders, and metadata you upload to our service.' },
                                            { label: 'Usage Data', desc: 'Technical information such as IP addresses and browser interaction.' }
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="mt-1.5 w-1.5 h-1.5 bg-[#66B2D6] rounded-full shadow-[0_0_8px_rgba(102,178,214,0.5)]"></div>
                                                <p className="text-sm font-medium text-gray-500"><strong className="text-gray-900">{item.label}:</strong> {item.desc}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <Lock className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Data Storage & Security</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    Your files are securely stored in <strong className="text-gray-900 font-bold">Amazon S3 (ap-south-1 Mumbai region)</strong> with industry-standard encryption. We use SSL/TLS encryption for all data transfers between your device and our servers.
                                </p>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">User Rights</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    You have the right to access, rectify, or delete your data at any time. When you choose to delete your account, <strong className="text-gray-900 font-bold">all your stored data is permanently and safely removed from our servers</strong>. We do not retain copies of your deleted files.
                                </p>
                            </section>
                        </div>

                        <div className="mt-20 pt-12 border-t border-gray-100">
                            <div className="bg-gray-50 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-gray-100">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">Privacy Support</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Connect with our compliance officer</p>
                                </div>
                                <a 
                                    href="mailto:varunmm0404@gmail.com" 
                                    className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 rounded-2xl hover:border-[#66B2D6]/40 hover:shadow-lg hover:shadow-[#66B2D6]/5 transition-all group"
                                >
                                    <Mail className="w-5 h-5 text-[#66B2D6]" />
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Contact Support</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Brand Footer */}
                <div className="text-center pt-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Secured by CloudVault Infrastucture</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
