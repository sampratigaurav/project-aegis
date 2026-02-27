import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 glass-nav">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">

                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-aegis-accent" />
                        <span className="text-2xl font-bold tracking-tight">Aegis</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8">
                        <a href="#docs" className="text-gray-300 hover:text-white transition-colors">Docs</a>
                        <a href="#how" className="text-gray-300 hover:text-white transition-colors">How It Works</a>
                        <a href="#security" className="text-gray-300 hover:text-white transition-colors">Security</a>
                        <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
                        <Link to="/signup" className="bg-aegis-accent text-black font-semibold px-6 py-2 rounded-full hover:shadow-[0_0_15px_rgba(0,255,204,0.6)] transition-all">
                            Sign Up
                        </Link>
                    </div>

                </div>
            </div>
        </nav>
    );
}
