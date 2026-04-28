import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, CheckCircle, UserCheck, Gavel, Shield, XCircle } from 'lucide-react';

export default function TermsPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('acceptance');

    const navItems = [
        { id: 'acceptance', icon: <CheckCircle className="w-5 h-5" />, label: 'Acceptance' },
        { id: 'conduct', icon: <UserCheck className="w-5 h-5" />, label: 'User Conduct' },
        { id: 'intellectual', icon: <Gavel className="w-5 h-5" />, label: 'Intellectual Property' },
        { id: 'liability', icon: <Shield className="w-5 h-5" />, label: 'Liability' },
        { id: 'termination', icon: <XCircle className="w-5 h-5" />, label: 'Termination' },
    ];

    return (
        <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b]" style={{ fontFamily: 'Arial, sans-serif' }}>
            <header className="bg-[#fcf9f8] flex justify-between items-center px-8 py-4 border-b border-[#e0c0af]">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 text-[#584235] hover:text-[#D54B00] transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-semibold">Back to Login</span>
                </button>
                <div className="flex items-center gap-3">
                    <img src="/japfa-logo.png" alt="Logo" className="h-8 w-auto object-contain" />
                    <span className="text-xl font-bold text-[#D54B00]" style={{ fontFamily: 'Arial, sans-serif' }}>TMS</span>
                </div>
                <div className="flex items-center gap-6">
                    <Link to="/privacy-policy" className="text-[#584235] font-medium hover:text-[#FF7A00] transition-colors text-sm">Privacy Policy</Link>
                    <Link to="/terms-of-service" className="text-[#FF7A00] font-bold text-sm">Terms of Service</Link>
                </div>
            </header>

            <section className="py-20 px-8 text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #121212 0%, #1c1b1b 100%)' }}>
                <div className="max-w-7xl mx-auto relative z-10">
                    <span className="text-[#ff7a00] font-bold tracking-widest text-sm uppercase">Legal Framework</span>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mt-4 mb-6">Terms of Service</h1>
                    <p className="text-[#ebe7e7] max-w-2xl text-lg leading-relaxed">
                        Effective Date: January 01, 2024. These terms govern your professional engagement with the TMS industrial ecosystem.
                    </p>
                </div>
                <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 pointer-events-none">
                    <svg fill="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg"><path d="M400 0L0 400H400V0Z" fill="#FF7A00" /></svg>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-8 py-12 flex flex-col md:flex-row gap-12">
                <aside className="w-full md:w-64 shrink-0">
                    <div className="sticky top-8 space-y-1">
                        <h3 className="font-bold text-xs uppercase tracking-widest text-[#584235] mb-4 px-4">Navigation</h3>
                        <nav className="flex flex-col">
                            {navItems.map((item) => (
                                <a
                                    key={item.id}
                                    href={`#${item.id}`}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`px-4 py-3 flex items-center gap-3 transition-all ${activeSection === item.id ? 'border-l-4 border-[#D54B00] text-[#D54B00] font-bold' : 'text-[#584235] hover:text-[#994700] hover:bg-[#ffdbc8] rounded-lg'}`}
                                    style={activeSection === item.id ? { background: 'linear-gradient(90deg, rgba(213,75,0,0.1) 0%, rgba(213,75,0,0) 100%)' } : {}}
                                >
                                    {item.icon} {item.label}
                                </a>
                            ))}
                        </nav>
                    </div>
                </aside>

                <div className="flex-1 bg-white p-8 md:p-16 rounded-xl shadow-sm">
                    <article className="space-y-12">
                        <section id="acceptance">
                            <h2 className="text-3xl font-bold text-[#1c1b1b] tracking-tight mb-6">1. Acceptance of Terms</h2>
                            <div className="space-y-4 text-[#584235] leading-relaxed text-lg">
                                <p>By accessing or using TMS services, platforms, or applications (the "Service"), you agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and TMS.</p>
                                <p>If you are using the Service on behalf of an organization, you are agreeing to these terms for that organization and promising that you have the authority to bind that organization to these terms. In such a case, "you" and "your" will refer to that organization.</p>
                            </div>
                        </section>

                        <section id="conduct">
                            <h2 className="text-3xl font-bold text-[#1c1b1b] tracking-tight mb-6">2. User Conduct &amp; Responsibilities</h2>
                            <div className="space-y-6 text-[#584235] leading-relaxed">
                                <p>Professional conduct is paramount in our logistics network. You agree not to:</p>
                                <ul className="list-none space-y-4">
                                    <li className="flex gap-4 p-4 bg-[#f6f3f2] rounded-lg"><span className="font-extrabold text-[#994700]">2.1</span><span>Use the platform for any fraudulent shipment tracking or unauthorized data extraction from our industrial APIs.</span></li>
                                    <li className="flex gap-4 p-4 bg-[#f6f3f2] rounded-lg"><span className="font-extrabold text-[#994700]">2.2</span><span>Interfere with or disrupt the integrity or performance of the Service or the data contained therein.</span></li>
                                    <li className="flex gap-4 p-4 bg-[#f6f3f2] rounded-lg"><span className="font-extrabold text-[#994700]">2.3</span><span>Attempt to gain unauthorized access to the Service or its related systems or networks.</span></li>
                                </ul>
                            </div>
                        </section>

                        <section className="pt-8" id="intellectual">
                            <h2 className="text-3xl font-bold text-[#1c1b1b] tracking-tight mb-6">3. Intellectual Property Rights</h2>
                            <div className="bg-[#f0edec] p-8 rounded-2xl relative overflow-hidden">
                                <p className="text-[#1c1b1b] leading-relaxed text-lg relative z-10">All intellectual property rights in the Service, including software, hardware designs, logos, and industrial algorithms, are owned by or licensed to TMS. You are granted a limited, non-exclusive, non-transferable license to access the platform solely for its intended business logistical purposes.</p>
                            </div>
                        </section>

                        <section id="liability">
                            <h2 className="text-3xl font-bold text-[#1c1b1b] tracking-tight mb-6">4. Limitation of Liability</h2>
                            <div className="space-y-4 text-[#584235] leading-relaxed">
                                <p>To the maximum extent permitted by applicable law, TMS shall not be liable for any indirect, incidental, special, consequential, or punitive damages...</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    <div className="border border-[#e0c0af] p-5 rounded-xl"><h4 className="font-bold text-[#1c1b1b] mb-2">Service Availability</h4><p className="text-sm">Your access to or use of or inability to access or use the services during scheduled maintenance.</p></div>
                                    <div className="border border-[#e0c0af] p-5 rounded-xl"><h4 className="font-bold text-[#1c1b1b] mb-2">Third Party Conduct</h4><p className="text-sm">Any conduct or content of any third party on the services, including without limitation, any fleet operator.</p></div>
                                </div>
                            </div>
                        </section>

                        <section className="border-t border-[#ebe7e7] pt-12" id="termination">
                            <div className="bg-red-50 p-8 rounded-2xl border border-red-200">
                                <h2 className="text-3xl font-bold text-red-700 tracking-tight mb-6">5. Termination</h2>
                                <p className="text-[#584235] leading-relaxed">We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.</p>
                            </div>
                        </section>
                    </article>
                </div>
            </div>

            <footer className="bg-[#121212] flex flex-col md:flex-row justify-between items-center px-12 py-12 w-full text-sm tracking-wide">
                <div className="flex flex-col gap-4 mb-8 md:mb-0">
                    <div className="flex items-center gap-2"><img src="/japfa-logo.png" alt="Logo" className="h-8 w-auto object-contain" /><span className="text-lg font-bold text-[#D54B00]">TMS</span></div>
                    <p className="text-gray-500 max-w-xs">© 2026 TMS. All rights reserved. Precise Industrial Logistics.</p>
                </div>
                <div className="flex flex-wrap justify-center gap-8">
                    <Link className="text-gray-500 hover:text-white transition-colors" to="/privacy-policy">Privacy Policy</Link>
                    <Link className="text-[#FF7A00] font-bold" to="/terms-of-service">Terms of Service</Link>
                </div>
            </footer>
        </div>
    );
}