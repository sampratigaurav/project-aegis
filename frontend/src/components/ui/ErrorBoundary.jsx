import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-aegis-bg flex flex-col items-center justify-center p-4">
                    <div className="bg-black/50 border border-white/10 rounded-3xl p-8 max-w-md text-center">
                        <ShieldAlert className="w-16 h-16 text-aegis-accent mx-auto mb-6 opacity-80" />
                        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
                        <p className="text-gray-400 mb-6 text-sm">
                            We encountered an unexpected error. The trust layer is analyzing the anomaly.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-3 bg-aegis-accent text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all"
                        >
                            Restart Session
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
