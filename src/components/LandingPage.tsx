import { useState, useEffect } from 'react';
import { Heart, ArrowRight, Calendar, Users, Award, Clock, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Header } from './Header';
import { Footer } from './Footer';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
}

export function LandingPage({ onLogin, onRegister }: LandingPageProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { text: 'Bringing Healing through', highlight: 'Peace and Compassion' },
        { text: 'Your Health, Our', highlight: 'Priority' },
        { text: 'Excellence in Medical', highlight: 'Care' },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const features = [
        {
            icon: Calendar,
            title: 'Easy Appointments',
            description: 'Book appointments with top specialists in just a few clicks',
        },
        {
            icon: Users,
            title: '24/7 Care',
            description: 'Round-the-clock medical support and emergency services',
        },
        {
            icon: Award,
            title: 'Expert Doctors',
            description: 'Experienced specialists across all medical departments',
        },
        {
            icon: Clock,
            title: 'Quick Service',
            description: 'Minimal wait times and efficient healthcare delivery',
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header showAuthButtons onLogin={onLogin} onRegister={onRegister} />

            {/* Video Hero Section */}
            <section className="relative min-h-[600px] overflow-hidden">
                {/* Video Background */}
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/media/banner.mp4" type="video/mp4" />
                </video>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/90 via-purple-800/80 to-indigo-900/90" />

                {/* Content */}
                <div className="relative h-full container mx-auto px-4 py-20 flex items-center justify-center">
                    <div className="text-center text-white max-w-4xl">
                        <div className="flex items-center justify-center gap-4 mb-6 animate-fade-in">
                            <Heart className="h-16 w-16 fill-pink-400 text-pink-400 animate-pulse" />
                            <h1 className="text-5xl md:text-6xl font-bold">
                                Shalom Medical Center
                            </h1>
                        </div>

                        {/* Sliding Text */}
                        <div className="h-32 flex items-center justify-center relative">
                            {slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`absolute transition-all duration-1000 ${index === currentSlide
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-10'
                                        }`}
                                >
                                    <p className="text-2xl md:text-4xl font-semibold mb-2">
                                        {slide.text}
                                    </p>
                                    <p className="text-3xl md:text-5xl font-bold text-pink-400">
                                        {slide.highlight}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <p className="text-lg md:text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                            Providing holistic healthcare rooted in peace, compassion, and medical excellence
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Button
                                size="lg"
                                onClick={onRegister}
                                className="bg-pink-500 hover:bg-pink-600 text-white text-lg px-8 py-6 shadow-lg"
                            >
                                <UserPlus className="h-5 w-5 mr-2" />
                                Get Started
                                <ArrowRight className="h-5 w-5 ml-2" />
                            </Button>
                            <Button
                                size="lg"
                                variant="outline"
                                onClick={onLogin}
                                className="bg-white text-purple-900 hover:bg-purple-50 border-2 border-white text-lg px-8 py-6 shadow-lg"
                            >
                                Login to Your Account
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Shalom?</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Experience healthcare that truly cares for your complete well-being
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-purple-100"
                            >
                                <div className="bg-gradient-to-br from-purple-600 to-indigo-600 w-14 h-14 rounded-lg flex items-center justify-center mb-4">
                                    <feature.icon className="h-7 w-7 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-20 bg-gradient-to-r from-purple-900 to-indigo-900 text-white">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                            <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                <span className="text-4xl">📜</span>
                                Our Mission
                            </h3>
                            <p className="text-lg text-purple-100 leading-relaxed">
                                At Shalom Medical Center, we are dedicated to providing holistic healthcare rooted in
                                peace, compassion, and medical excellence. We strive to restore not only physical
                                health but also emotional and spiritual well-being.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
                            <h3 className="text-3xl font-bold mb-4 flex items-center gap-3">
                                <span className="text-4xl">🌍</span>
                                Our Vision
                            </h3>
                            <p className="text-lg text-purple-100 leading-relaxed">
                                To be a leading healthcare provider known for peaceful healing, innovation, and
                                unwavering compassion toward every life we touch.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Experience Better Healthcare?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of patients who trust Shalom Medical Center for their healthcare needs
                    </p>
                    <Button
                        size="lg"
                        onClick={onRegister}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg px-12 py-6 shadow-lg"
                    >
                        <UserPlus className="h-5 w-5 mr-2" />
                        Register Now
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                </div>
            </section>

            <Footer />
        </div>
    );
}
