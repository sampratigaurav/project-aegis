import { Link, useLocation } from 'react-router-dom';
import { UploadCloud, ShieldCheck, ShoppingCart, LogOut, Shield } from 'lucide-react';

export default function DashboardSidebar() {
    const location = useLocation();

    const navItems = [
        { name: 'Model Upload', path: '/dashboard', icon: UploadCloud },
        { name: 'Verification', path: '/dashboard/verify', icon: ShieldCheck },
        { name: 'Marketplace', path: '/dashboard/marketplace', icon: ShoppingCart },
    ];

    const handleLogout = () => {
        localStorage.removeItem('aegis_token');
        window.location.href = '/login';
    };

    return (
        <aside className="w-64 bg-black/40 border-r border-white/5 h-screen sticky top-0 flex flex-col pt-8 pb-6 px-4">
            <Link to="/" className="flex items-center gap-2 px-2 mb-12 text-white hover:text-aegis-accent transition-colors">
                <Shield className="w-8 h-8 text-aegis-accent" />
                <span className="text-2xl font-bold tracking-tight">Aegis</span>
            </Link>

            <div className="flex-1 flex flex-col gap-2 relative">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 mb-2">Main Menu</div>
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                    ? 'bg-aegis-accent/10 border border-aegis-accent/20 text-aegis-accent shadow-[inset_0_0_10px_rgba(0,255,204,0.1)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-semibold">{item.name}</span>
                        </Link>
                    );
                })}
            </div>

            <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors mt-auto w-full text-left"
            >
                <LogOut className="w-5 h-5" />
                <span className="font-semibold">Sign Out</span>
            </button>
        </aside>
    );
}
