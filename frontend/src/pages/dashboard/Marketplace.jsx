import { useState, useEffect } from 'react';
import { ShieldCheck, Download, Search } from 'lucide-react';
import { marketplaceService } from '../../services/marketplaceService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import RetryBlock from '../../components/ui/RetryBlock';

export default function Marketplace() {
    const [models, setModels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchModels = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await marketplaceService.getModels();
            // Defensive check ensuring models is an array
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
        (model?.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">Verified Marketplace</h1>
                    <p className="text-gray-400">Discover and use pre-verified foundational models.</p>
                </div>

                <div className="relative w-full md:w-auto">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search models..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full md:w-64 pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-full focus:ring-2 focus:ring-aegis-accent/50 focus:border-aegis-accent transition-all outline-none text-sm"
                    />
                </div>
            </div>

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Spinner size="lg" text="Loading trusted models..." />
                </div>
            )}

            {!loading && error && (
                <RetryBlock onRetry={fetchModels} message={error} />
            )}

            {!loading && !error && filteredModels.length === 0 && (
                <EmptyState
                    title={searchQuery ? 'No models match your search' : 'Marketplace is empty'}
                    message="Check back later for new verified foundation models."
                />
            )}

            {!loading && !error && filteredModels.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredModels.map(model => (
                        <div key={model?.id || Math.random()} className="bg-black/40 border border-white/10 hover:border-aegis-accent/30 rounded-2xl p-6 transition-all group hover:bg-white/5 relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="min-w-0 pr-4">
                                    <h3 className="text-xl font-bold mb-1 truncate">{model?.name || 'Unnamed Model'}</h3>
                                    <p className="text-sm text-gray-500 truncate">{model?.vendor || 'Unknown Publisher'}</p>
                                </div>
                                {model?.verified && (
                                    <div className="flex-shrink-0 flex items-center gap-1 text-aegis-accent bg-aegis-accent/10 px-2 py-1 rounded-full text-xs font-bold border border-aegis-accent/20">
                                        <ShieldCheck className="w-3 h-3" /> <span className="hidden sm:inline">Verified</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {(model?.tags || []).map(tag => (
                                    <span key={tag} className="text-xs font-medium text-gray-300 bg-white/10 px-2 py-1 rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                <div className="flex flex-col min-w-0 pr-4">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-bold">Hash</span>
                                    <code className="text-xs text-gray-400 font-mono truncate max-w-[120px]">{model?.hash || 'N/A'}</code>
                                </div>

                                <button className="p-2 bg-white/5 hover:bg-aegis-accent border border-white/10 hover:border-aegis-accent rounded-xl text-white hover:text-black transition-all flex-shrink-0">
                                    <Download className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
