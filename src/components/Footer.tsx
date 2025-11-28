import { Heart, Mail, MapPin, Phone, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export function Footer() {
    const quickLinks = [
        { name: 'About Us', href: '#' },
        { name: 'Departments', href: '#' },
        { name: 'Find a Doctor', href: '#' },
        { name: 'Careers', href: '#' },
        { name: 'Emergency Services', href: '#' },
        { name: 'Contact | Feedback', href: '#' },
        { name: 'Privacy Policy', href: '#' },
    ];

    const contactInfo = [
        {
            title: 'Main Hospital',
            details: [
                'Plot No. 114, Ferozepur Road',
                'Opp. Westend Mall',
                'Ludhiana, Punjab – 141001, India',
            ],
        },
        {
            title: 'Emergency Helpline (24×7)',
            details: ['☎️ +91 800 123 4567'],
        },
        {
            title: 'Corporate Office',
            details: ['DLF Building, Rajiv Gandhi IT Park', 'Chandigarh - 160101'],
        },
    ];

    const socialLinks = [
        { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-gradient-to-r from-purple-900 via-purple-800 to-indigo-900 text-white">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand & Mission */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-4">
                            <Heart className="h-8 w-8 fill-pink-400 text-pink-400" />
                            <div>
                                <h3 className="text-xl font-bold">Shalom Medical Center</h3>
                                <p className="text-sm text-purple-200">Bringing Healing through Peace and Compassion</p>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm text-purple-100">
                            <div>
                                <h4 className="font-semibold text-white mb-2">📜 Our Mission</h4>
                                <p className="leading-relaxed">
                                    Providing holistic healthcare rooted in peace, compassion, and medical excellence. Restoring physical, emotional, and spiritual well-being.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white mb-2">🌍 Our Vision</h4>
                                <p className="leading-relaxed">
                                    To be a leading healthcare provider known for peaceful healing, innovation, and unwavering compassion.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 border-b border-purple-600 pb-2">Contact Us</h4>
                        <div className="space-y-4 text-sm">
                            {contactInfo.map((info, idx) => (
                                <div key={idx}>
                                    <p className="font-medium text-purple-200">{info.title}</p>
                                    {info.details.map((detail, i) => (
                                        <p key={i} className="text-purple-100">{detail}</p>
                                    ))}
                                </div>
                            ))}
                            <div className="space-y-1 mt-4">
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4" />
                                    <span>+91 161 789 4520</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4" />
                                    <span>contact@shalommedicare.com</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 border-b border-purple-600 pb-2">Quick Links</h4>
                        <ul className="space-y-2 text-sm">
                            {quickLinks.map((link) => (
                                <li key={link.name}>
                                    <a
                                        href={link.href}
                                        className="text-purple-100 hover:text-white transition-colors hover:underline"
                                    >
                                        📌 {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Additional Contacts */}
                    <div>
                        <h4 className="font-semibold text-lg mb-4 border-b border-purple-600 pb-2">Get in Touch</h4>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="font-medium text-purple-200">Patient Support</p>
                                <a href="mailto:support@shalommedicare.com" className="text-purple-100 hover:underline">
                                    support@shalommedicare.com
                                </a>
                            </div>
                            <div>
                                <p className="font-medium text-purple-200">Appointments</p>
                                <a href="mailto:appointments@shalommedicare.com" className="text-purple-100 hover:underline">
                                    appointments@shalommedicare.com
                                </a>
                            </div>
                            <div>
                                <p className="font-medium text-purple-200">Careers</p>
                                <a href="mailto:careers@shalommedicare.com" className="text-purple-100 hover:underline">
                                    careers@shalommedicare.com
                                </a>
                            </div>

                            {/* Social Media */}
                            <div className="pt-4">
                                <p className="font-medium text-purple-200 mb-2">Follow Us</p>
                                <div className="flex gap-3">
                                    {socialLinks.map((social) => (
                                        <a
                                            key={social.label}
                                            href={social.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-purple-700 hover:bg-purple-600 p-2 rounded-full transition-colors"
                                            aria-label={social.label}
                                        >
                                            <social.icon className="h-5 w-5" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-purple-600 mt-8 pt-6 text-center text-sm text-purple-200">
                    <p>© {new Date().getFullYear()} Shalom Medical Center. All rights reserved.</p>
                    <p className="mt-1">Designed with <span className="text-pink-400">♥</span> for better healthcare</p>
                </div>
            </div>
        </footer>
    );
}
