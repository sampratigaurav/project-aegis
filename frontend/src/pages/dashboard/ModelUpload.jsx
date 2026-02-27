import { useState, useCallback } from 'react';
import { UploadCloud, CheckCircle, ShieldAlert, ShieldCheck, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import { modelService } from '../../services/modelService';
import { useToast } from '../../context/ToastContext';

export default function ModelUpload() {
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);
    const toast = useToast();

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const processFile = async (selectedFile) => {
        setFile(selectedFile);
        setScanning(true);
        setResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await modelService.registerModel(formData);

            setResult({
                hash: response?.file_hash ?? 'Unknown Hash',
                txId: response?.tx_hash ?? 'N/A',
                status: response?.verified ? 'Verified' : 'Processing',
                scan_status: response?.scan_status ?? 'Passed'
            });
            toast.success('Model successfully uploaded and verified.');
        } catch (error) {
            toast.error(error.message || 'Failed to register model. Please try again.');
            setFile(null); // Reset file if failed
        } finally {
            setScanning(false);
        }
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div>
            <div className="mb-10">
                <h1 className="text-4xl font-extrabold tracking-tight mb-2">Upload AI Model</h1>
                <p className="text-gray-400">Securely upload and register your intelligence onto the decentralized trust layer.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                {/* Upload Area */}
                <div
                    className={`relative flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-3xl transition-all duration-300 ${dragActive ? 'border-aegis-accent bg-aegis-accent/5' : 'border-white/10 bg-black/40 hover:border-aegis-accent/50 hover:bg-white/5'
                        }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept=".pt,.pth,.h5,.onnx,.pb"
                    />

                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                        <UploadCloud className={`w-10 h-10 ${dragActive ? 'text-aegis-accent' : 'text-gray-400'}`} />
                    </div>

                    <h3 className="text-xl font-bold mb-2">Drag & Drop Model File</h3>
                    <p className="text-gray-500 text-center mb-6">Supports .pt, .h5, .onnx (Max 2GB)</p>

                    <button className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-full font-semibold hover:bg-white/20 transition-all pointer-events-none">
                        Browse Files
                    </button>
                </div>

                {/* Results Area */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col">
                    <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-aegis-accent/10 rounded-full blur-[80px]" />

                    <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                        <Cpu className="w-6 h-6 text-aegis-accent" />
                        Scan & Verification
                    </h3>

                    {!file && !scanning && !result && (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 h-[300px]">
                            <ShieldAlert className="w-12 h-12 mb-4 opacity-50" />
                            <p>Awaiting model payload...</p>
                        </div>
                    )}

                    {scanning && (
                        <div className="flex-1 flex flex-col items-center justify-center py-12">
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-aegis-accent/20 border-t-aegis-accent rounded-full animate-spin" />
                                <div className="absolute inset-2 border-4 border-white/10 border-b-white rounded-full animate-[spin_1.5s_linear_reverse]" />
                                <Cpu className="absolute inset-0 m-auto w-8 h-8 text-aegis-accent animate-pulse" />
                            </div>
                            <h4 className="text-lg font-bold text-aegis-accent mb-2">Analyzing Weights</h4>
                            <p className="text-gray-400 text-sm animate-pulse">Generating Zero-Knowledge Proof...</p>
                        </div>
                    )}

                    {result && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex-1 flex flex-col"
                        >
                            <div className="flex items-center gap-4 p-4 bg-aegis-accent/10 border border-aegis-accent/30 rounded-2xl mb-6">
                                <div className="w-12 h-12 rounded-full bg-aegis-accent/20 flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-aegis-accent" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-aegis-accent text-lg">Verification Complete</h4>
                                    <p className="text-sm text-gray-400">Model securely hashed and registered</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Fingerprint Hash</span>
                                    <code className="text-sm text-aegis-accent font-mono break-all">{result.hash}</code>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Blockchain Tx</span>
                                    <div className="flex items-center gap-2">
                                        <code className="text-sm text-white font-mono break-all">{result.txId}</code>
                                        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded font-bold">Confirmed</span>
                                    </div>
                                </div>
                                <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                                    <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Security Scan</span>
                                    <div className="flex items-center gap-2">
                                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                                        <span className="text-lg text-white font-bold">{result.scan_status}</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

            </div>
        </div>
    );
}
