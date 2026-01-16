import React from 'react';
import { Scale, AlertCircle, UserX, CheckCircle } from 'lucide-react';

const TermsOfService = () => {
    return (
        <div className="min-h-screen bg-[#fafdff] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="bg-[#66B2D6] px-8 py-10 text-white text-center">
                    <Scale className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
                    <p className="mt-2 text-[#E6FAF5] font-medium">Last updated: January 16, 2026</p>
                </div>

                <div className="px-8 py-10 space-y-8 text-[#2C3E50]">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Agreement to Terms</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            By accessing or using CloudVault, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <AlertCircle className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">User Responsibilities</h2>
                        </div>
                        <p className="mb-4 leading-relaxed text-gray-600">
                            You are responsible for the content you upload to CloudVault. You agree not to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Upload any content that is illegal, harmful, or violates copyright laws.</li>
                            <li>Attempt to breach the security of the platform or access other users' data.</li>
                            <li>Use the service for any unauthorized automated access or scraping.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <UserX className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Account Termination</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            You may delete your account at any time. Upon account deletion, <strong>all your data will be immediately and permanently vanished</strong>. We do not retain any residual data from deleted accounts. We also reserve the right to terminate accounts that violate these terms.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Scale className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Limitation of Liability</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            CloudVault provides the service "as is". While we strive for 100% uptime and data security, we are not liable for any indirect, incidental, or consequential damages resulting from the use of our service.
                        </p>
                    </section>

                    <section className="bg-[#f8fafc] p-6 rounded-xl border border-gray-100">
                        <h2 className="text-lg font-bold mb-2">Questions?</h2>
                        <p className="text-gray-600">
                            If you have questions about our terms, please reach out to us:
                            <br />
                            <a href="mailto:varunmm0404@gmail.com" className="text-[#66B2D6] font-semibold hover:underline">varunmm0404@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;
