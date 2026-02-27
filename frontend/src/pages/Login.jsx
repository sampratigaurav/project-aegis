import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, KeyRound, Mail, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { loginAuth, isAuthenticated } = useAuth();
    const toast = useToast();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = await authService.login(email, password);
            const token = data?.access_token || data?.token;

            if (token) {
                loginAuth(token);
                toast.success('Successfully authenticated.');
                navigate('/dashboard');
            } else {
                toast.error('Authentication succeeded but token was missing.');
            }
        } catch (err) {
            toast.error(err.message || 'Failed to authenticate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-aegis-bg flex flex-col justify-center items-center relative p-4">

            {/* Background Decor */}
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-aegis-accent/10 rounded-full blur-[150px] pointer-events-none" />

            <Link to="/" className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-aegis-accent transition-colors">
                <Shield className="w-6 h-6" />
                <span className="text-xl font-bold">Aegis</span>
            </Link>

            <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative z-10">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Welcome Back</h2>
                    <p className="text-gray-400 text-sm">Secure access to Project Aegis</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-aegis-accent/50 focus:border-aegis-accent transition-all text-white placeholder-gray-500 outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <KeyRound className="h-5 w-5 text-gray-500" />
                            </div>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-aegis-accent/50 focus:border-aegis-accent transition-all text-white placeholder-gray-500 outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-aegis-accent text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-400 mt-8">
                    Don't have an account? <Link to="/signup" className="text-aegis-accent hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
}
