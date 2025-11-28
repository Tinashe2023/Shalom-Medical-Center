import { Heart, LogIn, UserPlus } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
    onLogin?: () => void;
    onRegister?: () => void;
    currentUser?: any;
    onLogout?: () => void;
    showAuthButtons?: boolean;
    showBanner?: boolean;
}

export function Header({
    onLogin,
    onRegister,
    currentUser,
    onLogout,
    showAuthButtons = false,
    showBanner = false
}: HeaderProps) {
    return (
        <header className="bg-white shadow-md">
            {/* Banner Section - Only for dashboards */}
            {showBanner && (
                <div
                    className="h-48 bg-cover bg-center relative"
                    style={{ backgroundImage: 'url(/media/Shalom.png)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <Heart className="h-10 w-10 fill-pink-400 text-pink-400" />
                                <h1 className="text-4xl font-bold">Shalom Medical Center</h1>
                            </div>
                            <p className="text-xl text-purple-100">Bringing Healing through Peace and Compassion</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation Bar */}
            <nav className="bg-gradient-to-r from-purple-700 to-indigo-700 text-white">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <Heart className="h-8 w-8 fill-pink-400 text-pink-400" />
                            <div>
                                <h2 className="text-xl font-bold">Shalom Medical Center</h2>
                                <p className="text-xs text-purple-200">Peace & Compassion in Healthcare</p>
                            </div>
                        </div>

                        {/* Auth Buttons or User Info */}
                        <div className="flex items-center gap-3">
                            {showAuthButtons && !currentUser && (
                                <>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={onLogin}
                                        className="bg-white/10 border-white/30 hover:bg-white/20 text-white"
                                    >
                                        <LogIn className="h-4 w-4 mr-2" />
                                        Login
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={onRegister}
                                        className="bg-pink-500 hover:bg-pink-600 text-white border-none"
                                    >
                                        <UserPlus className="h-4 w-4 mr-2" />
                                        Register
                                    </Button>
                                </>
                            )}

                            {currentUser && (
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <p className="text-sm font-semibold">{currentUser.name}</p>
                                        <p className="text-xs text-purple-200 capitalize">{currentUser.role}</p>
                                    </div>
                                    {onLogout && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onLogout}
                                            className="bg-white/10 border-white/30 hover:bg-white/20 text-white"
                                        >
                                            Logout
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}
