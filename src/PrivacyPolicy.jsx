import React from 'react';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen bg-[#fafdff] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="bg-[#66B2D6] px-8 py-10 text-white text-center">
                    <Shield className="w-16 h-16 mx-auto mb-4 opacity-90" />
                    <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
                    <p className="mt-2 text-[#E6FAF5] font-medium">Last updated: January 16, 2026</p>
                </div>

                <div className="px-8 py-10 space-y-8 text-[#2C3E50]">
                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Eye className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Introduction</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            Welcome to CloudVault. We value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our secure storage services.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Information We Collect</h2>
                        </div>
                        <p className="mb-4 leading-relaxed text-gray-600">
                            To provide our services, we collect the following types of information:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li><strong>Personal Identification:</strong> Name, Email address, and Google Profile information (when using Google Login).</li>
                            <li><strong>Storage Data:</strong> The files, folders, and metadata you upload to our service.</li>
                            <li><strong>Usage Data:</strong> Technical information such as IP addresses, browser type, and interaction with our platform for security and performance monitoring.</li>
                        </ul>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Lock className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">Data Storage & Security</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            Your files are securely stored in <strong>Amazon S3 (ap-south-1 Mumbai region)</strong> with industry-standard encryption. We use SSL/TLS encryption for all data transfers between your device and our servers.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-[#66B2D6]" />
                            <h2 className="text-xl font-bold">User Rights</h2>
                        </div>
                        <p className="leading-relaxed text-gray-600">
                            You have the right to access, rectify, or delete your data at any time. When you choose to delete your account, <strong>all your stored data is permanently and safely removed from our servers</strong>. We do not retain copies of your deleted files.
                        </p>
                    </section>

                    <section className="bg-[#f8fafc] p-6 rounded-xl border border-gray-100">
                        <h2 className="text-lg font-bold mb-2">Contact Us</h2>
                        <p className="text-gray-600">
                            If you have any questions about this Privacy Policy, please contact us at:
                            <br />
                            <a href="mailto:varunmm0404@gmail.com" className="text-[#66B2D6] font-semibold hover:underline">varunmm0404@gmail.com</a>
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;
