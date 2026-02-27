import { RefreshCcw, WifiOff } from 'lucide-react';

export default function RetryBlock({ onRetry, message = 'Failed to load data from the trust layer.' }) {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-red-500/5 border border-red-500/10 rounded-3xl">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                <WifiOff className="w-8 h-8 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Connection Error</h3>
            <p className="text-red-200/70 max-w-sm mb-6">{message}</p>

            <button
                onClick={onRetry}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
            >
                <RefreshCcw className="w-4 h-4" />
                Try Again
            </button>
        </div>
    );
}
