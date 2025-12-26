import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Star, Shield, Trophy } from 'lucide-react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

const Home = () => {
    const heroRef = useRef(null);
    const statsRef = useRef(null);
    const featuresRef = useRef(null);

    useGSAP(() => {
        // Hero animation - staggered reveal
        gsap.from(heroRef.current.querySelectorAll('.hero-item'), {
            y: 40,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "expo.out"
        });

        // Stats animation
        gsap.from(statsRef.current.querySelectorAll('.stat-item'), {
            y: 20,
            opacity: 0,
            duration: 0.5,
            stagger: 0.08,
            delay: 0.3,
            ease: "expo.out"
        });

        // Features animation
        gsap.from(featuresRef.current.querySelectorAll('.feature-item'), {
            y: 30,
            opacity: 0,
            duration: 0.5,
            stagger: 0.1,
            delay: 0.5,
            ease: "expo.out"
        });
    }, { scope: heroRef });

    const features = [
        {
            icon: Users,
            title: 'Coachs Certifiés',
            description: 'Accès direct aux experts vérifiés.',
            className: "md:col-span-2"
        },
        {
            icon: Calendar,
            title: 'Planning Instantané',
            description: 'Réservez en un clic.',
            className: ""
        },
        {
            icon: Star,
            title: 'Qualité Garantie',
            description: 'Avis vérifiés.',
            className: ""
        },
        {
            icon: Shield,
            title: 'Paiement Sécurisé',
            description: 'Transactions chiffrées.',
            className: "md:col-span-2"
        },
    ];

    return (
        <div className="bg-black min-h-screen text-white pt-24 pb-12">
            {/* Hero */}
            <section ref={heroRef} className="container mx-auto px-6 lg:px-8 mb-32 border-b border-zinc-900 pb-20">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
                    <div className="flex-1 max-w-2xl">
                        <div className="hero-item inline-block px-3 py-1 mb-8 border border-zinc-800 bg-zinc-900/50 text-xs font-mono tracking-widest uppercase text-zinc-400">
                            SportsConnect v2.0
                        </div>

                        <h1 className="hero-item text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-none">
                            PURE <br /> PERFORMANCE.
                        </h1>

                        <p className="hero-item text-xl text-zinc-500 mb-10 max-w-lg font-light leading-relaxed">
                            L'excellence ne souffre aucun compromis. Rejoignez l'élite du coaching sportif sur une plateforme construite pour la performance.
                        </p>

                        <div className="hero-item flex flex-col sm:flex-row gap-4">
                            <Link to="/coaches" className="px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-wider hover:bg-zinc-200 transition-colors text-center border border-white">
                                Trouver un expert
                            </Link>
                            <Link to="/register" className="px-8 py-4 bg-black text-zinc-300 border border-zinc-800 font-bold text-sm uppercase tracking-wider hover:bg-zinc-900 hover:text-white transition-colors text-center">
                                Devenir Coach
                            </Link>
                        </div>
                    </div>

                    {/* Minimalist Hero Visual */}
                    <div className="hero-item flex-1 w-full max-w-[500px] lg:max-w-none aspect-square bg-zinc-900 border border-zinc-800 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black opacity-50" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Trophy size={120} strokeWidth={0.5} className="text-zinc-800" />
                        </div>
                        {/* Overlay Text */}
                        <div className="absolute bottom-8 left-8">
                            <p className="text-6xl font-bold tracking-tighter text-white">100%</p>
                            <p className="text-xs font-mono uppercase text-zinc-500 tracking-widest mt-2">Focus Résultat</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats - Grid Lines */}
            <section ref={statsRef} className="container mx-auto px-6 lg:px-8 mb-32">
                <div className="grid grid-cols-2 md:grid-cols-4 border-t border-l border-zinc-800">
                    {[
                        { label: "Coachs Actifs", value: "500+" },
                        { label: "Sessions", value: "10k+" },
                        { label: "Note Moyenne", value: "4.95" },
                        { label: "Disciplines", value: "50+" },
                    ].map((stat, i) => (
                        <div key={i} className="stat-item p-8 border-r border-b border-zinc-800 hover:bg-zinc-900/30 transition-colors">
                            <p className="text-3xl font-bold text-white mb-2 tracking-tight">{stat.value}</p>
                            <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features - Clean Grid */}
            <section ref={featuresRef} className="container mx-auto px-6 lg:px-8 mb-32">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                    <h2 className="text-4xl font-bold tracking-tighter text-white max-w-md">
                        INFRASTRUCTURE <span className="text-zinc-600">PREMIUM.</span>
                    </h2>
                    <Link to="/about" className="text-sm font-mono uppercase text-zinc-500 hover:text-white transition-colors mt-4 md:mt-0">
                        En savoir plus →
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`feature-item bg-black p-10 hover:bg-zinc-950 transition-colors ${feature.className}`}
                        >
                            <feature.icon className="text-white mb-6" size={24} strokeWidth={1} />
                            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-zinc-500 font-light leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Home;
