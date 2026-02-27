import { useState, useRef } from 'react';
import { ShieldCheck, ShieldAlert, FileSearch, Upload } from 'lucide-react';
import { verifyService } from '../../services/verifyService';
import { useToast } from '../../context/ToastContext';
import Spinner from '../../components/ui/Spinner';

export default function Verification() {
    const [file, setFile] = useState(null);
    const [verifying, setVerifying] = useState(false);
    const [result, setResult] = useState(null);
    const fileInputRef = useRef(null);
    const toast = useToast();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setResult(null); // Clear previous results
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error("Please select a file to verify.");
            return;
        }

        setVerifying(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await verifyService.verifyModel(formData);

            const onChain = response?.on_chain_verification;
            setResult({
                status: onChain?.is_registered ? 'verified' : 'tampered',
                message: onChain?.is_registered ? 'Cryptographic proof matches registered payload.' : 'Model not found or altered.',
                publisher: onChain?.publisher ?? 'Unknown',
                timestamp: onChain?.timestamp ? (onChain.timestamp * 1000) : null
            });
            toast.success('Verification process completed.');
        } catch (error) {
            toast.error(error.message || 'Verification failed. Please try again.');
            setResult({ status: 'error', message: 'Network or validation error occurred.', publisher: 'N/A', timestamp: null });
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-10 text-center">
                <h1 className="text-4xl font-extrabold tracking-tight mb-4">Integrity Verification</h1>
                <p className="text-gray-400">Verify a model's cryptographic proof securely against the on-chain registry.</p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-3xl p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 right-[-10%] w-[50%] h-full bg-aegis-accent/5 blur-[100px] pointer-events-none" />

                <form onSubmit={handleVerify} className="relative z-10 flex flex-col md:flex-row gap-4 items-center">
                    <div className="flex-1 relative w-full flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-300 truncate">
                            {file ? file.name : 'Select a Model File to Verify...'}
                        </span>
                        <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pt,.pth,.h5,.onnx,.pb"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={verifying || !file}
                        className="px-8 py-4 bg-aegis-accent text-black font-bold rounded-2xl hover:shadow-[0_0_20px_rgba(0,255,204,0.4)] transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px] w-full md:w-auto"
                    >
                        {verifying ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Verify Model"}
                    </button>
                </form>
            </div>

            {result && (
                <div className={`p-8 rounded-3xl border flex flex-col items-center text-center transition-all ${result.status === 'verified' ? 'bg-aegis-accent/5 border-aegis-accent/30' : 'bg-red-500/5 border-red-500/30'}`}>
                    {result.status === 'verified' ? (
                        <ShieldCheck className="w-20 h-20 text-aegis-accent mb-6" />
                    ) : (
                        <ShieldAlert className="w-20 h-20 text-red-500 mb-6" />
                    )}

                    <h3 className={`text-2xl font-bold mb-2 ${result.status === 'verified' ? 'text-aegis-accent' : 'text-red-500'}`}>
                        {result.status === 'verified' ? 'Authentic Model' : 'Tampered / Unregistered'}
                    </h3>
                    <p className="text-gray-300 mb-6 max-w-lg">{result.message}</p>

                    {result.status === 'verified' && (
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-xl">
                            <div className="flex w-full items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Publisher</span>
                                <code className="text-white font-mono text-sm">{result.publisher}</code>
                            </div>
                            <div className="flex w-full items-center justify-between p-4 bg-black/50 border border-white/10 rounded-xl">
                                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Timestamp</span>
                                <span className="text-white text-sm font-medium">
                                    {result.timestamp ? new Date(result.timestamp).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {!result && !verifying && (
                <div className="opacity-50 flex flex-col items-center justify-center p-12">
                    <FileSearch className="w-16 h-16 text-gray-600 mb-4" />
                    <p className="text-gray-500 font-medium">Input a hash above to run verification</p>
                </div>
            )}
        </div>
    );
}
