import React from 'react';
import { RefreshCw, CreditCard, Truck, AlertCircle } from 'lucide-react';

const RefundPolicy = () => {
    return (
        <div className="min-h-screen bg-[#fafdff] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="bg-[#66B2D6] px-8 py-10 text-white text-center">
                    <RefreshCw className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl font-extrabold tracking-tight">Refund & Cancellation</h1>
                    <p className="mt-2 text-[#E6FAF5] font-medium">Last updated: January 16, 2026</p>
                </div>

                <div className="px-8 py-10 space-y-8 text-[#2C3E50]">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <CreditCard className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Refund Policy</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            At CloudVault, we provide a <strong>Free Tier</strong> for all users to explore and evaluate our premium storage services before making a purchase.
                        </p>
                        <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-100 flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                Because we offer users the ability to test the service for free, <strong>we do not offer refunds</strong> once a paid subscription has been activated. All sales are final.
                            </p>
                        </div>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <RefreshCw className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Cancellation Policy</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            You may cancel your subscription at any time through your User Settings. Upon cancellation, you will continue to have access to your premium storage benefits until the end of your current billing cycle. After the cycle ends, your account will revert to the Free Tier limits.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Truck className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Delivery Policy</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            CloudVault is a digital service providers. Upon successful completion of your payment, your storage quota and premium features will be <strong>activated immediately</strong>. There is no physical shipping involved in our services.
                        </p>
                    </section>

                    <section className="bg-[#f8fafc] p-6 rounded-xl border border-gray-100">
                        <h2 className="text-lg font-bold mb-2">Support</h2>
                        <p className="text-gray-600">
                            If you encounter any issues with your subscription activation, please contact us immediately:
                            <br />
                            <a href="mailto:varunmm0404@gmail.com" className="text-[#66B2D6] font-semibold hover:underline">varunmm0404@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default RefundPolicy;
