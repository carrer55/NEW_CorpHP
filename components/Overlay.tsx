import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { TextDecoder } from './TextDecoder';
import { ViewState } from '../types';
import { PrivacyPolicyPage } from './ContentPages';

const Section = ({ children, className = "" }: { children?: React.ReactNode, className?: string }) => {
    return (
        <section className={`h-screen w-screen p-6 md:p-20 flex flex-col justify-center snap-start snap-always mb-[50vh] last:mb-0 ${className}`}>
            {children}
        </section>
    );
}

interface OverlayProps {
    onNavigate?: (view: ViewState) => void;
}

export const Overlay: React.FC<OverlayProps> = ({ onNavigate }) => {
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            {/* Section 1: Hero */}
            <Section className="items-center z-10 text-center relative">
                {/* Vertically centered content */}
                <div className="w-full flex flex-col items-center justify-center">
                    {/* Title is now 3D in the scene */}
                    {/* Placeholder for spacing relative to 3D text. Increased height to push text down. */}
                    <div className="h-72 md:h-64" /> 
                    <motion.p 
                        id="hero-slogan-anchor"
                        className="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-lg mx-auto font-medium tracking-wide"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        ひとつの点から世界を変える。
                    </motion.p>
                </div>
                
                <motion.div 
                    className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                >
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        {/* Mobile: SWIPE, Desktop: SCROLL */}
                        <span className="text-[10px] font-mono tracking-widest md:hidden">SWIPE</span>
                        <span className="text-[10px] font-mono tracking-widest hidden md:block">SCROLL</span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="white" className="w-6 h-6 md:w-3 md:h-3">
                            <path d="M12 21l-12-18h24z"/>
                        </svg>
                    </div>
                </motion.div>
            </Section>

            {/* Section 2: Products (formerly Distortion) */}
            <Section className="items-center justify-center md:items-end text-center md:text-right mb-[130vh]">
                <div className="max-w-5xl relative pointer-events-auto" data-hover>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="text-xs font-mono text-orange-500 mb-2 tracking-widest">INNOVATIVE SOLUTION</div>
                        <h2 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-80 leading-none tracking-tighter">
                            OUR
                            <br />
                            PRODUCTS
                        </h2>
                        <div className="h-px w-20 bg-orange-600 mb-6 mx-auto md:ml-auto md:mr-0"></div>
                        <p className="text-gray-300 mb-8 leading-relaxed text-sm md:text-base">
                            見過ごされた価値を発見し、一人ひとりが持つ可能性を<br />
                            最大限に引き出すソリューション。<br />
                            テクノロジーと人の「心」で、働くよろこびに満ちた未来を創ります。
                        </p>
                        <button 
                            onClick={() => onNavigate?.('PRODUCT')}
                            className="px-8 py-3 border border-white text-white hover:bg-white hover:text-black transition-all duration-300 font-mono text-xs tracking-widest uppercase"
                        >
                            VIEW OUR PRODUCTS
                        </button>
                    </motion.div>
                </div>
            </Section>

            {/* Section 3: Prismatic (Now Philosophy) */}
            <Section className="items-center justify-center">
                <div className="max-w-5xl relative pointer-events-auto md:ml-20" data-hover>
                    <motion.div
                        initial={{ opacity: 0, filter: "blur(10px)" }}
                        whileInView={{ opacity: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1 }}
                    >
                        <div className="text-xs font-mono text-cyan-300 mb-2 tracking-widest">CORE OF THINKING</div>
                        <h2 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-80 leading-none tracking-tighter">
                            OUR
                            <br />
                            PHILOSOPHY
                        </h2>
                        <div className="h-px w-20 bg-cyan-500 mb-6 mx-auto md:mx-0"></div>
                        <div className="text-gray-300 mb-8 leading-relaxed max-w-3xl text-sm md:text-base text-left">
                            <strong className="block mb-4 text-white text-base md:text-lg text-center md:text-left">【MISSION】人の「心」を起点としたテクノロジーで新たな仕組みを創造する</strong>
                            <p>私たちの使命は、現代社会に潜む様々な課題や隠れた価値を「404 Not Found（存在しない）」から「. found（必ず見つける）」に変えることです。人の温もりを大切にしながら、AI・テクノロジーの力で革新的なソリューションを提供し続けます。</p>
                        </div>
                    </motion.div>
                </div>
            </Section>

            {/* Section 4: Kinetic Grid (Now Vision) */}
            <Section className="items-center justify-center md:items-start text-center md:text-left mb-[10vh]">
                 <div className="max-w-5xl relative pointer-events-auto" data-hover>
                    <motion.div
                         initial={{ opacity: 0, scale: 0.95 }}
                         whileInView={{ opacity: 1, scale: 1 }}
                         transition={{ duration: 0.8 }}
                    >
                        <div className="text-xs font-mono text-fuchsia-300 mb-2 tracking-widest">POSITIVE CHANGE IN THE WORLD</div>
                        <h2 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-80 leading-none tracking-tighter">
                            OUR
                            <br />
                            VISION
                        </h2>
                        <div className="flex flex-col md:flex-row gap-8 border-l-2 border-[#ff00ff] pl-6 mt-8 md:mt-16 text-left">
                            <div className="text-gray-300 leading-relaxed max-w-3xl text-sm md:text-base">
                                <strong className="block mb-4 text-white text-base md:text-lg">【VISION】自分らしく働く喜びに満ちた未来を創る</strong>
                                <p>私たちは、働くという営みのあらゆる場面で一人ひとりが持つ無限の可能性を見つけ出し、それぞれが自分のいる場所で精一杯輝けるよう支援します。一つの小さな「点」から始まる物語が、隣の人へ、そして社会全体へと広がり、やがて世界中の人々の働く喜びを照らし出す——そんな未来を実現します。</p>
                            </div>
                        </div>
                    </motion.div>
                 </div>
            </Section>

            {/* Section 5: Singularity (Now .Found Story) */}
            <Section className="items-center justify-center">
                <div className="max-w-5xl text-center relative z-10 pointer-events-auto" data-hover>
                     <motion.div
                        initial={{ opacity: 0, scale: 1.1 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                     >
                        <div className="text-xs font-mono text-red-500 mb-6 tracking-widest uppercase">A Small Yet Profound Beginning</div>
                        <h2 className="text-5xl sm:text-6xl md:text-8xl font-display font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-80 leading-none tracking-tighter">
                            ［.The DOT］
                        </h2>
                        <div className="text-lg md:text-2xl font-bold text-white mb-8 tracking-widest opacity-90 flex items-center justify-center gap-4">
                             {/* Replaced dashed line with solid line as requested */}
                            <span className="w-12 h-[2px] bg-white inline-block shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
                            <span>その小さくて大きな挑戦</span>
                        </div>
                        <p className="text-gray-200 opacity-90 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
                            私たちの社名に刻まれた「 . 」は、「人を中心とした、<br />つながりと可能性の起点」を表しています。
                        </p>
                     </motion.div>
                </div>
            </Section>

            {/* Section 6: Footer */}
            <Section className="items-center justify-center relative !mb-0">
                <motion.div 
                    className="text-center w-full"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="w-full text-[12vw] font-display font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-b from-white to-transparent opacity-80 leading-none tracking-tighter">
                        A DOT EXPANDS
                    </h2>
                    <p className="text-gray-300 leading-relaxed text-sm md:text-base mb-12 max-w-2xl mx-auto">
                        一つの小さな点から、大きな波が生まれている。<br />
                        一人の小さな輝きが、<br />
                        今この瞬間も誰かの人生を変えている。
                    </p>
                </motion.div>

                {/* Footer Bottom Bar */}
                <div className="absolute bottom-8 left-0 w-full px-6 md:px-20 flex flex-col md:flex-row md:justify-between items-center md:items-end pointer-events-auto gap-4 md:gap-0">
                    <button 
                        className="text-[10px] font-mono text-gray-600 tracking-widest hover:text-white transition-colors uppercase" 
                        data-hover
                        onClick={() => setShowPrivacyModal(true)}
                    >
                        PrivacyPolicy
                    </button>
                    <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase text-center md:text-right">
                        © 2025 .Found inc. All rights reserved.
                    </p>
                </div>
            </Section>

            {/* Privacy Policy Modal */}
            {createPortal(
                <AnimatePresence>
                    {showPrivacyModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8"
                            onClick={() => setShowPrivacyModal(false)}
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 20 }}
                                className="bg-[#050505] border border-gray-800 w-full max-w-5xl h-[90vh] flex flex-col relative rounded-sm shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="absolute top-4 right-4 z-50">
                                    <button 
                                        onClick={() => setShowPrivacyModal(false)}
                                        className="p-2 text-white hover:text-cyan-400 transition-colors bg-black/50 rounded-full"
                                        data-hover
                                    >
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto p-4 md:p-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                    <PrivacyPolicyPage onNavigate={() => setShowPrivacyModal(false)} isModal={true} />
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
};