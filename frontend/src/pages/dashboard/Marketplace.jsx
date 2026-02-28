import { useState, useEffect } from 'react';
import { ShieldCheck, Search, ExternalLink, Copy, Check, Clock, User, Hash, FileText, X } from 'lucide-react';
import { marketplaceService } from '../../services/marketplaceService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import RetryBlock from '../../components/ui/RetryBlock';
import { useToast } from '../../context/ToastContext';

// ─── Model Detail Modal ────────────────────────────────────────────────
function ModelDetailModal({ model, onClose }) {
    const [copiedField, setCopiedField] = useState(null);
    const toast = useToast();

    if (!model) return null;

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const polygonscanUrl = model.tx_hash && model.tx_hash !== 'N/A'
        ? `https://amoy.polygonscan.com/tx/${model.tx_hash}`
        : null;

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Unknown';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal Content */}
            <div
                className="relative bg-[#0a0f1a] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl animate-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 text-gray-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-start gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-aegis-accent/10 border border-aegis-accent/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-aegis-accent" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="text-xl font-bold truncate">{model.name}</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                            <User className="w-3 h-3" /> {model.publisher}
                        </p>
                    </div>
                    {model.verified && (
                        <div className="flex-shrink-0 flex items-center gap-1 text-aegis-accent bg-aegis-accent/10 px-2 py-1 rounded-full text-xs font-bold border border-aegis-accent/20 ml-auto">
                            <ShieldCheck className="w-3 h-3" /> Verified
                        </div>
                    )}
                </div>

                {/* Description */}
                {model.description && (
                    <div className="mb-6">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</span>
                        <p className="text-sm text-gray-300 mt-1">{model.description}</p>
                    </div>
                )}

                {/* Details Grid */}
                <div className="space-y-3 mb-6">
                    {/* File Hash */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                                <Hash className="w-3 h-3" /> Fingerprint Hash
                            </span>
                            <button
                                onClick={() => copyToClipboard(model.file_hash, 'hash')}
                                className="p-1 text-gray-500 hover:text-aegis-accent transition-colors"
                                title="Copy hash"
                            >
                                {copiedField === 'hash' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                        <code className="text-xs text-aegis-accent font-mono break-all">{model.file_hash}</code>
                    </div>

                    {/* Blockchain TX */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Blockchain TX</span>
                            {model.tx_hash && model.tx_hash !== 'N/A' && (
                                <button
                                    onClick={() => copyToClipboard(model.tx_hash, 'tx')}
                                    className="p-1 text-gray-500 hover:text-aegis-accent transition-colors"
                                    title="Copy TX"
                                >
                                    {copiedField === 'tx' ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                            )}
                        </div>
                        {model.tx_hash && model.tx_hash !== 'N/A' ? (
                            <code className="text-xs text-white font-mono break-all">{model.tx_hash}</code>
                        ) : (
                            <span className="text-xs text-yellow-400">Pending</span>
                        )}
                    </div>

                    {/* Registered At */}
                    <div className="bg-black/40 border border-white/5 rounded-xl p-3">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Registered
                        </span>
                        <p className="text-sm text-white mt-1">{formatDate(model.created_at)}</p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    {polygonscanUrl && (
                        <a
                            href={polygonscanUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-aegis-accent/10 border border-aegis-accent/30 text-aegis-accent rounded-xl hover:bg-aegis-accent/20 transition-all text-sm font-medium"
                        >
                            <ExternalLink className="w-4 h-4" /> View on PolygonScan
                        </a>
                    )}
                    <button
                        onClick={() => copyToClipboard(model.file_hash, 'hash2')}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-all text-sm font-medium"
                    >
                        {copiedField === 'hash2' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                        Copy Hash
                    </button>
                </div>
            </div>
        </div>
    );
}


// ─── Main Marketplace Component ────────────────────────────────────────
export default function Marketplace() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedModel, setSelectedModel] = useState(null);
    const toast = useToast();

    const fetchModels = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await marketplaceService.getModels();
            setModels(Array.isArray(data) ? data : (data?.models || []));
        } catch (err) {
            setError(err.message || 'Failed to load marketplace data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModels();
    }, []);

    const filteredModels = models.filter(model =>
        (model?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model?.publisher || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model?.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (model?.file_hash || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const copyHash = (e, hash) => {
        e.stopPropagation();
        navigator.clipboard.writeText(hash);
        toast.success('Hash copied!');
    };

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Verified Marketplace</h1>
                    <p className="text-gray-400">Discover and use pre-verified foundational models.</p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Model count */}
                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''}
                    </span>

                    <div className="relative w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-500" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name, publisher, hash..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-72 pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-full focus:ring-2 focus:ring-aegis-accent/50 focus:border-aegis-accent transition-all outline-none text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" text="Loading trusted models..." />
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <RetryBlock onRetry={fetchModels} message={error} />
            )}

            {/* Empty */}
            {!loading && !error && filteredModels.length === 0 && (
                <EmptyState
                    title={searchQuery ? 'No models match your search' : 'Marketplace is empty'}
                    message="Check back later for new verified foundation models."
                />
            )}

            {/* Model Grid */}
            {!loading && !error && filteredModels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredModels.map((model, idx) => (
                        <div
                            key={model?.file_hash || idx}
                            onClick={() => setSelectedModel(model)}
                            className="bg-black/40 border border-white/10 hover:border-aegis-accent/30 rounded-2xl p-6 transition-all group hover:bg-white/5 cursor-pointer relative overflow-hidden"
                        >
                            {/* Hover glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-aegis-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                            {/* Top Row */}
                            <div className="flex justify-between items-start mb-3 relative">
                                <div className="min-w-0 pr-4">
                                    <h3 className="text-lg font-bold mb-1 truncate group-hover:text-aegis-accent transition-colors">{model?.name || 'Unnamed Model'}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <User className="w-3 h-3" /> {model?.publisher || 'Unknown'}
                                    </p>
                                </div>
                                {model?.verified && (
                                    <div className="flex-shrink-0 flex items-center gap-1 text-aegis-accent bg-aegis-accent/10 px-2 py-1 rounded-full text-xs font-bold border border-aegis-accent/20">
                                        <ShieldCheck className="w-3 h-3" /> Verified
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            {model?.description && (
                                <p className="text-xs text-gray-400 mb-4 line-clamp-2">{model.description}</p>
                            )}

                            {/* Date */}
                            <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
                                <Clock className="w-3 h-3" />
                                {formatDate(model?.created_at)}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between pt-3 border-t border-white/5 relative">
                                <div className="flex flex-col min-w-0 pr-4">
                                    <span className="text-[10px] text-gray-600 uppercase tracking-wider font-bold">Hash</span>
                                    <code className="text-xs text-gray-400 font-mono truncate max-w-[160px]">{model?.file_hash || 'N/A'}</code>
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {/* Copy hash */}
                                    <button
                                        onClick={(e) => copyHash(e, model?.file_hash)}
                                        className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-400 hover:text-white transition-all"
                                        title="Copy hash"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    {/* View on PolygonScan */}
                                    {model?.tx_hash && model.tx_hash !== 'N/A' && (
                                        <a
                                            href={`https://amoy.polygonscan.com/tx/${model.tx_hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="p-2 bg-white/5 hover:bg-aegis-accent border border-white/10 hover:border-aegis-accent rounded-xl text-gray-400 hover:text-black transition-all"
                                            title="View on PolygonScan"
                                        >
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Detail Modal */}
            {selectedModel && (
                <ModelDetailModal
                    model={selectedModel}
                    onClose={() => setSelectedModel(null)}
                />
            )}
        </div>
    );
}

 / /   T r i g g e r   d e p l o y  
 