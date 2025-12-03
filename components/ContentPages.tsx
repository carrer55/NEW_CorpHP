import React, { useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { createPortal } from 'react-dom';
import { ViewState } from '../types';

const FORM_ENDPOINT = "https://formspree.io/f/xeobddbo";

// Updated container variants for a more "cinematic" and subtle entry
// Now uses a very gentle fade-up that feels like "settling" after the curtain rises
const containerVariants: Variants = {
    hidden: { 
        opacity: 0, 
        y: 30, // Slight upward movement
        filter: "blur(5px)" 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        filter: "blur(0px)",
        transition: { 
            duration: 1.0, // Long duration for smoothness
            ease: [0.25, 1, 0.5, 1] as [number, number, number, number], // Soft easing (Quart-like)
            staggerChildren: 0.05, 
            delayChildren: 0.2 // Wait for curtain to clear a bit
        }
    },
    exit: { 
        opacity: 0,
        y: -30, // Moves up while fading out
        filter: "blur(5px)",
        transition: { duration: 0.5, ease: "easeInOut" }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1, 
        transition: { 
            duration: 0.8,
            ease: "easeOut"
        } 
    }
};

const PRODUCTS = [
    {
        label: "PRODUCT 01",
        category: "法人向けSaaSアプリケーション",
        title: "「賢者の精算」",
        status: "(For Sale)",
        statusColor: "text-blue-400",
        image: "https://i.imgur.com/6ahrJdW.png",
        link: "https://www.kenja.space/"
    },
    {
        label: "PRODUCT 02",
        category: "業務自動化AIプラットフォーム",
        title: "「AI派遣社員」",
        status: "(Coming Soon...)",
        statusColor: "text-yellow-400",
        image: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        label: "PRODUCT 03",
        category: "ブロックチェーン型キャリアサービス",
        title: "「JOBchain」",
        status: "(Developing...)",
        statusColor: "text-cyan-400",
        image: "https://images.unsplash.com/photo-1557683316-973673baf926?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    },
    {
        label: "PRODUCT 04",
        category: "HP制作、WEBアプリケーションの開発",
        title: "「受託開発・制作」",
        status: "（お気軽にご相談ください）",
        statusColor: "text-green-400",
        image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    }
];

export const ProjectsPage = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => (
    <motion.div 
        className="w-full max-w-7xl mx-auto px-4 md:px-12 pt-32 pb-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-8xl font-display font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 leading-none tracking-tighter">
            OUR<br />PRODUCTS
        </motion.h1>
        
        <motion.div variants={itemVariants} className="text-gray-300 mb-16 leading-relaxed max-w-3xl text-sm md:text-base">
            <p>
                株式会社ドットファウンドは、小さなアイデアを大きな価値へと育てるプロダクトを創り続けています。<br />
                SaaS・AI・ブロックチェーン・WEB開発を軸に、多様なソリューションをお届けします。
            </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-20">
            {PRODUCTS.map((product, i) => (
                <motion.div 
                    key={i}
                    variants={itemVariants}
                    className="group relative aspect-video bg-gray-900 border border-gray-800 overflow-hidden cursor-pointer"
                    data-hover
                    onClick={() => product.link && window.open(product.link, '_blank')}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10" />
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute bottom-0 left-0 p-5 md:p-8 z-20 w-full">
                        <div className="text-xs font-mono text-cyan-400 mb-2 tracking-widest">{product.label}</div>
                        <div className="text-sm md:text-base font-bold text-gray-300 mb-1">{product.category}</div>
                        <h3 className="text-xl md:text-3xl font-display font-bold leading-tight text-white break-words">
                            {product.title}
                        </h3>
                        <span className={`block text-xs md:text-sm font-mono animate-pulse tracking-wider mt-2 ${product.statusColor}`}>
                            {product.status}
                        </span>
                    </div>
                </motion.div>
            ))}
        </div>

        {/* Back to Top Button */}
        <motion.div variants={itemVariants} className="flex justify-end pb-10">
            <button 
                onClick={() => onNavigate('HOME')}
                className="relative group text-sm md:text-base font-mono text-gray-400 hover:text-white transition-colors duration-300 tracking-widest"
                data-hover
            >
                TOPページに戻る ＞
                <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
        </motion.div>
    </motion.div>
);

export const AboutPage = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => (
    <motion.div 
        className="w-full max-w-5xl mx-auto px-5 md:px-12 pt-32 pb-20 min-h-screen"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
        <motion.h1 
            variants={itemVariants} 
            className="text-4xl sm:text-5xl md:text-8xl font-display font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 leading-none tracking-tighter"
        >
            COMPANY<br />PROFILE
        </motion.h1>

        <motion.div variants={itemVariants} className="border-t border-gray-800">
            {/* Company Name */}
            <div className="py-8 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-start group hover:bg-white/5 transition-colors duration-300 px-2">
                <span className="font-mono text-xs text-gray-500 tracking-widest mb-2 md:mb-0 pt-1 w-32">COMPANY</span>
                <div className="md:w-3/4">
                    <div className="text-base md:text-lg font-light tracking-wide text-gray-200">株式会社ドットファウンド</div>
                    <div className="text-sm text-gray-500 font-mono mt-1 tracking-wider">.Found inc.</div>
                </div>
            </div>

            {/* Location */}
            <div className="py-8 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-start group hover:bg-white/5 transition-colors duration-300 px-2">
                <span className="font-mono text-xs text-gray-500 tracking-widest mb-2 md:mb-0 pt-1 w-32">LOCATION</span>
                <div className="md:w-3/4 text-base md:text-lg font-light leading-relaxed text-gray-200">
                    〒418-0066<br />
                    静岡県富士宮市大宮町31 澤田ビル 2F
                </div>
            </div>

            {/* Establishment */}
            <div className="py-8 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-start group hover:bg-white/5 transition-colors duration-300 px-2">
                <span className="font-mono text-xs text-gray-500 tracking-widest mb-2 md:mb-0 pt-1 w-32">ESTABLISHED</span>
                <div className="md:w-3/4 text-base md:text-lg font-light tracking-wide text-gray-200">
                    2025年10月
                </div>
            </div>

            {/* Representative */}
            <div className="py-8 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-start group hover:bg-white/5 transition-colors duration-300 px-2">
                <span className="font-mono text-xs text-gray-500 tracking-widest mb-2 md:mb-0 pt-1 w-32">REPRESENTATIVE</span>
                <div className="md:w-3/4 text-base md:text-lg font-light tracking-wide text-gray-200">
                    代表取締役　田中 心也
                </div>
            </div>

            {/* Business */}
            <div className="py-8 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-start group hover:bg-white/5 transition-colors duration-300 px-2">
                <span className="font-mono text-xs text-gray-500 tracking-widest mb-2 md:mb-0 pt-1 w-32">BUSINESS</span>
                <div className="md:w-3/4">
                    <ul className="space-y-2">
                        {[
                            "法人向けクラウドサービスの開発/販売",
                            "生成AIソリューションの開発/提供",
                            "HP制作、WEBアプリケーションの受託開発"
                        ].map((item, i) => (
                            <li key={i} className="text-base md:text-lg font-light tracking-wide text-gray-200">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Contact */}
            <div className="py-8 border-b border-gray-800 flex flex-col md:flex-row md:justify-between md:items-start group hover:bg-white/5 transition-colors duration-300 px-2">
                <span className="font-mono text-xs text-gray-500 tracking-widest mb-2 md:mb-0 pt-1 w-32">CONTACT</span>
                <div className="md:w-3/4">
                    <a href="mailto:support@dotfound.co.jp" className="text-base md:text-lg font-light tracking-wide text-gray-200 hover:text-white transition-colors inline-block break-all" data-hover>
                        support@dotfound.co.jp
                    </a>
                </div>
            </div>
        </motion.div>

        {/* Back to Top Button */}
        <motion.div variants={itemVariants} className="mt-20 flex justify-end pb-10">
            <button 
                onClick={() => onNavigate('HOME')}
                className="relative group text-sm md:text-base font-mono text-gray-400 hover:text-white transition-colors duration-300 tracking-widest"
                data-hover
            >
                TOPページに戻る ＞
                <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </button>
        </motion.div>
    </motion.div>
);

export const PrivacyPolicyPage = ({ onNavigate, isModal }: { onNavigate: (view: ViewState) => void, isModal?: boolean }) => (
    <motion.div 
        className={`w-full max-w-5xl mx-auto px-5 md:px-12 ${isModal ? 'pt-10' : 'pt-32'} pb-20 ${isModal ? '' : 'min-h-screen'}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-8xl font-display font-bold mb-16 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 leading-none tracking-tighter">
            PRIVACY<br />POLICY
        </motion.h1>

        {/* Removed content-visibility:auto to prevent layout flashes on entry */}
        <motion.div variants={itemVariants} className="space-y-16 text-gray-300 leading-relaxed text-sm md:text-base">
            {/* Overview */}
            <section>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">プライバシーポリシー概要</h2>
                <p>
                    株式会社ドットファウンド（以下「当社」）は、お客様の個人情報の保護を重要な責務と考え、 個人情報保護法その他の関連法令を遵守し、適切な取り扱いを行います。
                </p>
            </section>

            {/* Basic Policy */}
            <section>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">基本方針</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li>お客様の個人情報は、明確な目的のもとでのみ収集・利用いたします。</li>
                    <li>収集した個人情報は適切に管理し、不正アクセス・漏洩を防止します。</li>
                    <li>法令に基づく場合を除き、同意なく第三者に提供することはありません。</li>
                    <li>お客様からの開示・訂正・削除等の要求に適切に対応いたします。</li>
                </ul>
            </section>

            {/* Collection */}
            <section>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">個人情報の収集</h2>
                <p className="mb-6">当社では、サービス提供に必要な範囲で以下の個人情報を収集いたします。</p>
                
                <h3 className="font-bold text-white mb-2">収集する情報</h3>
                <ul className="list-disc pl-5 mb-6 space-y-1">
                    <li>氏名</li>
                    <li>メールアドレス</li>
                    <li>電話番号</li>
                    <li>会社名・部署名</li>
                    <li>役職</li>
                </ul>

                <h3 className="font-bold text-white mb-2">収集方法</h3>
                <div className="mb-4">
                    <strong className="block text-gray-400 font-mono text-xs mb-1">直接収集</strong>
                    <p>問い合わせなど、お客様が直接入力された情報を収集します。</p>
                </div>
                <div>
                    <strong className="block text-gray-400 font-mono text-xs mb-1">自動収集</strong>
                    <p>サービス利用時のアクセスログ、操作履歴、技術的情報を自動的に収集します。</p>
                </div>
            </section>

            {/* Usage Purpose */}
            <section>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">利用目的</h2>
                <p className="mb-4">収集した個人情報は、以下の目的でのみ利用いたします。</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5">
                    <li>カスタマーサポート</li>
                    <li>お問い合わせ対応</li>
                    <li>技術サポート</li>
                    <li>利用方法のご案内</li>
                    <li>トラブルシューティング</li>
                    <li>サービス改善</li>
                    <li>機能改善・新機能開発</li>
                    <li>ユーザビリティ向上</li>
                    <li>システム最適化</li>
                    <li>品質向上</li>
                    <li>セキュリティ・コンプライアンス</li>
                </ul>
            </section>

            {/* Rights */}
            <section>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">お客様の権利</h2>
                <p className="mb-6">お客様は、ご自身の個人情報について以下の権利を有しています。</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h3 className="font-bold text-white mb-1">開示請求権</h3>
                        <p className="text-sm text-gray-400">ご自身の個人情報の利用状況について開示を求める権利</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">訂正・削除権</h3>
                        <p className="text-sm text-gray-400">個人情報の訂正・削除を求める権利</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">利用停止権</h3>
                        <p className="text-sm text-gray-400">個人情報の利用停止を求める権利</p>
                    </div>
                    <div>
                        <h3 className="font-bold text-white mb-1">データポータビリティ権</h3>
                        <p className="text-sm text-gray-400">個人情報の移転を求める権利</p>
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section>
                <h2 className="text-lg md:text-2xl font-bold text-white mb-6 border-b border-gray-800 pb-2">権利行使の方法</h2>
                <p className="mb-8">上記の権利を行使される場合は、以下の連絡先までお問い合わせください：</p>
                
                <div className="bg-gray-900 border border-gray-800 p-6 md:p-8 rounded-sm">
                    <h3 className="font-bold text-white mb-4">個人情報に関するお問い合わせ窓口（個人情報保護管理者）</h3>
                    <div className="space-y-2 font-mono text-xs md:text-sm">
                        <p>株式会社ドットファウンド</p>
                        <p>住所: 静岡県富士宮市大宮町３１ 澤田ビル2F</p>
                        <p>電話番号: 090-1286-0467</p>
                        <p>メールアドレス: support@dotfound.co.jp</p>
                    </div>
                </div>
                <p className="mt-4 text-xs text-gray-500">※ご本人確認のため、身分証明書の提示をお願いする場合があります。</p>
            </section>

            {/* Back to Top Button */}
            <motion.div variants={itemVariants} className="mt-20 flex justify-end pb-10">
                <button 
                    onClick={() => onNavigate('HOME')}
                    className="relative group text-sm md:text-base font-mono text-gray-400 hover:text-white transition-colors duration-300 tracking-widest"
                    data-hover
                >
                    {isModal ? '閉じる ×' : 'TOPページに戻る ＞'}
                    <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
            </motion.div>
        </motion.div>
    </motion.div>
);

export const ContactPage = ({ onNavigate }: { onNavigate: (view: ViewState) => void }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [privacyChecked, setPrivacyChecked] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!privacyChecked) {
            return;
        }

        setIsSending(true);

        try {
            const response = await fetch(FORM_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                throw new Error("Form submission failed");
            }
        } catch (error) {
            // Fallback to mailto if API fails
            const subject = `【お問い合わせ】${formData.company} ${formData.name}様より`;
            const body = `--------------------------------------------------
お名前: ${formData.name}
メールアドレス: ${formData.email}
会社名: ${formData.company}
電話番号: ${formData.phone}
--------------------------------------------------

お問い合わせ内容:
${formData.message}`;

            const mailtoLink = `mailto:support@dotfound.co.jp?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            // Launch mailer
            window.location.href = mailtoLink;
            
            // Go to thanks page slightly after
            setTimeout(() => {
                setIsSubmitted(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 800);
        } finally {
            setIsSending(false);
        }
    };

    if (isSubmitted) {
        return (
            <motion.div 
                className="w-full max-w-4xl mx-auto px-5 md:px-12 pt-32 pb-12 min-h-screen flex flex-col justify-center text-center items-center"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-display font-bold mb-8 text-white">
                    お問い合わせ<br />ありがとうございました。
                </motion.h1>
                <motion.div variants={itemVariants} className="text-gray-300 leading-relaxed space-y-4 mb-16">
                    <p>確認後、3営業日以内にご連絡させていただきます。</p>
                    <p>3営業日を過ぎても返信がない場合は、<br className="md:hidden" />お手数ですが再度お問い合わせをお願いいたします。</p>
                </motion.div>
                
                <motion.div variants={itemVariants}>
                    <button 
                        onClick={() => onNavigate('HOME')}
                        className="relative group text-sm md:text-base font-mono text-gray-400 hover:text-white transition-colors duration-300 tracking-widest"
                        data-hover
                    >
                        TOPページに戻る ＞
                        <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                    </button>
                </motion.div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            className="w-full max-w-4xl mx-auto px-5 md:px-12 pt-32 pb-12 min-h-screen flex flex-col justify-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-8xl font-display font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-600 leading-none tracking-tighter">
                CONTACT
            </motion.h1>

            <motion.div variants={itemVariants} className="mb-12 text-gray-300 text-sm md:text-base leading-relaxed">
                <p>弊社へのお問い合わせはこちらのフォームより承っております</p>
                <p>ご返信に3営業日ほどお時間をいただいております。</p>
                <p>3営業日を過ぎても返信がない場合は、お手数ですが再度お問い合わせをお願いいたします。（* は入力必須）</p>
            </motion.div>

            <motion.form variants={itemVariants} onSubmit={handleSubmit} className="space-y-10 border-t border-gray-800 pt-12">
                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs text-gray-500">お名前 *</label>
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        required
                        className="bg-transparent border-b border-gray-700 py-3 md:py-4 text-base md:text-lg focus:border-white outline-none transition-colors" 
                        placeholder="例：山田 太郎" 
                        data-hover 
                    />
                </div>
                
                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs text-gray-500">メールアドレス *</label>
                    <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-transparent border-b border-gray-700 py-3 md:py-4 text-base md:text-lg focus:border-white outline-none transition-colors" 
                        placeholder="例：taro.yamada@example.com" 
                        data-hover 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs text-gray-500">会社名 *</label>
                    <input 
                        type="text" 
                        name="company"
                        value={formData.company}
                        onChange={handleChange}
                        required
                        className="bg-transparent border-b border-gray-700 py-3 md:py-4 text-base md:text-lg focus:border-white outline-none transition-colors" 
                        placeholder="例：株式会社ドットファウンド" 
                        data-hover 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs text-gray-500">電話番号 *</label>
                    <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="bg-transparent border-b border-gray-700 py-3 md:py-4 text-base md:text-lg focus:border-white outline-none transition-colors" 
                        placeholder="例：03-1234-5678" 
                        data-hover 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-xs text-gray-500">お問い合わせ内容 *</label>
                    <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6} 
                        className="bg-transparent border-b border-gray-700 py-3 md:py-4 text-base md:text-lg focus:border-white outline-none transition-colors resize-none" 
                        placeholder="詳しい内容を記入してください" 
                        data-hover
                    ></textarea>
                </div>

                <div className="pt-4" data-hover>
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                        <input 
                            type="checkbox"
                            className="hidden"
                            checked={privacyChecked}
                            onChange={(e) => setPrivacyChecked(e.target.checked)}
                        />
                        <div className={`w-5 h-5 border border-gray-500 flex items-center justify-center transition-colors flex-shrink-0 ${privacyChecked ? 'bg-white border-white' : 'group-hover:border-white'}`}>
                            {privacyChecked && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            )}
                        </div>
                        <span className="text-sm text-gray-400 select-none">
                            <span 
                                className="text-white underline mx-1 hover:text-cyan-400 transition-colors z-10 relative"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation(); // Stop checking the box when clicking link
                                    setShowPrivacyModal(true);
                                }}
                            >
                                プライバシーポリシー
                            </span>
                            に同意して送信する
                        </span>
                    </label>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-8">
                    <motion.button 
                        type="submit"
                        disabled={isSending || !privacyChecked}
                        className={`w-full md:w-auto px-12 py-4 bg-white text-black font-display font-bold tracking-wider hover:bg-cyan-400 transition-colors ${(isSending || !privacyChecked) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        whileHover={(!isSending && privacyChecked) ? { scale: 1.05 } : {}}
                        whileTap={(!isSending && privacyChecked) ? { scale: 0.95 } : {}}
                        data-hover={!isSending && privacyChecked}
                    >
                        {isSending ? '送信中...' : 'この内容で送信する'}
                    </motion.button>
                </div>
            </motion.form>

            <motion.div variants={itemVariants} className="flex justify-end pt-20 pb-10">
                <button 
                    onClick={() => onNavigate('HOME')}
                    className="relative group text-sm md:text-base font-mono text-gray-400 hover:text-white transition-colors duration-300 tracking-widest"
                    data-hover
                >
                    TOPページに戻る ＞
                    <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-white transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                </button>
            </motion.div>

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
        </motion.div>
    );
}

export const ContentPages: React.FC<{ view: ViewState; onNavigate: (view: ViewState) => void }> = ({ view, onNavigate }) => {
    return (
        // Changed pointer-events-none to pointer-events-auto to ensure scroll events are captured on mobile
        <div className="absolute inset-0 z-20 pointer-events-auto overflow-y-auto overscroll-contain">
            <div className="min-h-full">
                {view === 'PRODUCT' && <ProjectsPage onNavigate={onNavigate} />}
                {view === 'ABOUT_US' && <AboutPage onNavigate={onNavigate} />}
                {view === 'CONTACT' && <ContactPage onNavigate={onNavigate} />}
                {view === 'PRIVACY_POLICY' && <PrivacyPolicyPage onNavigate={onNavigate} />}
            </div>
        </div>
    );
}