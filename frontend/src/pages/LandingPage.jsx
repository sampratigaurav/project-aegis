import { motion } from 'framer-motion';
import { ArrowRight, BookOpen } from 'lucide-react';
import Navbar from '../components/Navbar';
import ThreeGlobe from '../components/ThreeGlobe';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div className="relative min-h-screen bg-aegis-bg overflow-hidden flex flex-col">
            <Navbar />

            {/* Background Decor */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-aegis-accent/10 rounded-full blur-[150px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-aegis-accent/10 rounded-full blur-[150px] pointer-events-none" />

            <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative z-10 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row items-center justify-between w-full h-full gap-12 lg:gap-24">

                    {/* Left Text Content */}
                    <div className="flex-1 flex flex-col items-start text-left">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-aegis-accent/30 bg-aegis-accent/10 mb-8">
                                <span className="w-2 h-2 rounded-full bg-aegis-accent animate-pulse" />
                                <span className="text-aegis-accent text-sm font-medium tracking-wide">Web3 Infrastructure V2.0</span>
                            </div>

                            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight mb-6">
                                The Trust Layer <br />
                                for <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-aegis-accent to-[#00b386]">
                                    Web3 AI Security
                                </span>
                            </h1>

                            <p className="text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
                                Verify AI model integrity and safeguard decentralized inference using sovereign cryptographic proofs. Built for the future of autonomous intelligence.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <Link to="/signup" className="group flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-aegis-accent text-aegis-accent rounded-full font-bold hover:bg-aegis-accent hover:text-black hover:shadow-[0_0_20px_rgba(0,255,204,0.5)] transition-all duration-300">
                                    <span>Start Building Free</span>
                                </Link>
                                <a href="#docs" className="group flex items-center justify-center gap-3 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-full font-bold hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                                    <span>Read Documentation</span>
                                </a>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Globe */}
                    <div className="flex-1 w-full max-w-lg lg:max-w-none relative mt-12 lg:mt-0">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.2, delay: 0.2 }}
                            className="lg:h-[700px] flex items-center"
                        >
                            <ThreeGlobe />
                        </motion.div>
                    </div>

                </div>
            </main>

            <div className="pb-10 pt-4 px-4 sm:px-6 lg:px-8 border-t border-white/5 mx-auto max-w-7xl w-full flex items-center gap-6 justify-center sm:justify-start">
                <span className="text-sm text-gray-500 font-bold tracking-widest uppercase">Securing Protocols on</span>
                <div className="flex items-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                    <span className="font-bold tracking-wider text-xl">Ethereum</span>
                    <span className="font-bold tracking-wider text-xl">Polygon</span>
                    <span className="font-bold tracking-wider text-xl">Solana</span>
                </div>
            </div>
        </div>
    );
}
