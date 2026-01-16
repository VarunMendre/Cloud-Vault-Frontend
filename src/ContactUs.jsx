import React from 'react';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';

const ContactUs = () => {
    return (
        <div className="min-h-screen bg-[#fafdff] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-[#2C3E50] mb-4">Contact Us</h1>
                    <p className="text-lg text-[#A3C5D9] max-w-2xl mx-auto">
                        Have questions or need assistance? Our team is here to help you get the most out of CloudVault.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Contact Information */}
                    <div className="space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
                            <h2 className="text-2xl font-bold text-[#2C3E50] mb-8">Get in Touch</h2>
                            
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#E6FAF5] flex items-center justify-center shrink-0">
                                        <Mail className="w-6 h-6 text-[#66B2D6]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#A3C5D9] uppercase tracking-wider">Email Us</p>
                                        <a href="mailto:varunmm0404@gmail.com" className="text-lg font-medium text-[#2C3E50] hover:text-[#66B2D6] transition-colors">
                                            varunmm0404@gmail.com
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#E6FAF5] flex items-center justify-center shrink-0">
                                        <Phone className="w-6 h-6 text-[#66B2D6]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#A3C5D9] uppercase tracking-wider">Call Us</p>
                                        <p className="text-lg font-medium text-[#2C3E50]">+91 7387172424</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[#E6FAF5] flex items-center justify-center shrink-0">
                                        <MapPin className="w-6 h-6 text-[#66B2D6]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-[#A3C5D9] uppercase tracking-wider">Our Office</p>
                                        <p className="text-lg font-medium text-[#2C3E50]">
                                            Sandvik Colony, Dighi Road,<br />
                                            Bhosari, Pune, India
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Simple Message Box (Visual only for now) */}
                    <div className="bg-[#66B2D6] p-8 rounded-2xl shadow-soft text-white flex flex-col justify-center items-center text-center">
                        <MessageSquare className="w-16 h-16 mb-6 opacity-80" />
                        <h2 className="text-2xl font-bold mb-4">Prompt Support</h2>
                        <p className="text-[#E6FAF5] mb-8 leading-relaxed">
                            We typically respond to all support inquiries within 24 hours. Your satisfaction is our top priority.
                        </p>
                        <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-white animate-pulse"></div>
                        </div>
                        <p className="mt-4 text-sm font-medium opacity-80">Online and ready to help</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactUs;
