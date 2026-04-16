import React from 'react';
import { RefreshCw, CreditCard, Truck, AlertCircle, Mail, ChevronRight, Clock, ShieldCheck } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn">
                
                {/* Financial Header */}
                <div className="flex items-center gap-4 px-4">
                    <div className="w-12 h-12 bg-white rounded-2xl border border-gray-200 shadow-sm flex items-center justify-center rotate-6">
                        <CreditCard className="w-6 h-6 text-[#66B2D6]" />
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-[#66B2D6] uppercase tracking-[0.3em] mb-1">Financial Protocols</h2>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                            <Clock className="w-3 h-3" />
                            VERSION 2.0 // JAN 16, 2026
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-12 md:px-12">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-4">Refund & Cancellation</h1>
                        <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-12">Governing storage dividends and credit allocations</p>

                        <div className="space-y-12">
                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <ShieldCheck className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Refund Policy</h2>
                                </div>
                                <div className="pl-14">
                                    <p className="text-sm font-medium text-gray-500 leading-relaxed mb-6">
                                        CloudVault provides a <strong className="text-gray-900 font-bold">Standard Tier</strong> for all nodes to explore and evaluate our infrastructure integrity before committing to premium egress.
                                    </p>
                                    <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-xs font-bold text-amber-800 uppercase tracking-wide leading-relaxed">
                                            Due to our capability for comprehensive pre-purchase testing, <strong className="text-amber-900 font-black">we do not authorize refunds</strong> once a premium payload has been activated. All financial transactions are final.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <RefreshCw className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Cancellation Policy</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    You may terminate your premium payload at any time through your Console Settings. Upon termination, you will retain access to premium infrastructure benefits until the end of the current billing cycle. Subsequently, the node will revert to Standard Tier constraints.
                                </p>
                            </section>

                            <section className="group">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 group-hover:border-[#66B2D6]/30 transition-colors">
                                        <Truck className="w-5 h-5 text-gray-400 group-hover:text-[#66B2D6] transition-colors" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Delivery Policy</h2>
                                </div>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed pl-14">
                                    CloudVault is a digital infrastructure provider. Upon verified transaction success, your storage quota and premium features will be <strong className="text-gray-900 font-bold">provisioned immediately</strong>. No physical logistics are involved in our service delivery.
                                </p>
                            </section>
                        </div>

                        <div className="mt-20 pt-12 border-t border-gray-100">
                            <div className="bg-[#66B2D6]/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 border border-[#66B2D6]/10">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-1">Financial Support</h3>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Billing and ledger inquiries</p>
                                </div>
                                <a 
                                    href="mailto:varunmm0404@gmail.com" 
                                    className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-200 rounded-2xl hover:border-[#66B2D6]/40 hover:shadow-lg hover:shadow-[#66B2D6]/5 transition-all group"
                                >
                                    <Mail className="w-5 h-5 text-[#66B2D6]" />
                                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Connect with Billing</span>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" />
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

export default RefundPolicy;
