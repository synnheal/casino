import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <nav className="flex justify-between items-center mb-20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#00D9C0] rounded-full flex items-center justify-center shadow-lg shadow-[#00D9C0]/50">
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="text-3xl font-bold text-white">
              Volt <span className="text-[#00D9C0]">Casino</span>
            </h1>
          </div>
          
          <Link 
            href="/api/auth/discord"
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Se connecter avec Discord
          </Link>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8 flex justify-center">
            <div className="w-32 h-32 bg-[#00D9C0] rounded-full flex items-center justify-center shadow-2xl shadow-[#00D9C0]/50 animate-pulse">
              <span className="text-6xl">⚡</span>
            </div>
          </div>

          <h2 className="text-6xl font-extrabold text-white mb-4">
            <span className="text-[#00D9C0]">Volt</span> Casino
          </h2>
          <p className="text-2xl font-bold text-gray-400 mb-8">
            FR #1
          </p>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            De la communauté au concret : des jeux excitants, des gains réels, une expérience unique
          </p>
          
          <div className="flex gap-4 justify-center">
            <Link
              href="/api/auth/discord"
              className="bg-[#00D9C0] hover:bg-[#00c4ad] text-black px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-[#00D9C0]/30"
            >
              Rejoins-Nous ! 🎲
            </Link>
            
            <Link
              href="#games"
              className="border-2 border-[#00D9C0] hover:bg-[#00D9C0]/10 text-[#00D9C0] px-8 py-4 rounded-lg font-bold text-lg transition-all"
            >
              Voir les jeux
            </Link>
          </div>
        </div>

        {/* Features */}
        <div id="games" className="grid md:grid-cols-3 gap-6 mb-20">
          <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 hover:border-[#00D9C0] transition-all group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎰</div>
            <h3 className="text-2xl font-bold text-white mb-3">Machines à sous</h3>
            <p className="text-gray-400">
              Tentez votre chance sur nos machines à sous avec des jackpots progressifs !
            </p>
          </div>

          <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 hover:border-[#00D9C0] transition-all group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-3">Roulette</h3>
            <p className="text-gray-400">
              Rouge ou noir ? Misez sur vos numéros chanceux et multipliez vos gains !
            </p>
          </div>

          <div className="bg-[#1a1a1a] p-8 rounded-xl border border-gray-800 hover:border-[#00D9C0] transition-all group">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="text-2xl font-bold text-white mb-3">Blackjack</h3>
            <p className="text-gray-400">
              Affrontez le croupier et essayez d'atteindre 21 sans dépasser !
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-[#1a1a1a] border border-[#00D9C0]/30 rounded-xl p-8">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">
            Pourquoi jouer sur <span className="text-[#00D9C0]">Volt Casino</span> ?
          </h3>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-[#00D9C0] mb-2">1000+</div>
              <div className="text-gray-400">Joueurs actifs</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#00D9C0] mb-2">500K+</div>
              <div className="text-gray-400">Crédits distribués</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#00D9C0] mb-2">24/7</div>
              <div className="text-gray-400">Disponible</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-[#00D9C0] mb-2">15K+</div>
              <div className="text-gray-400 flex items-center justify-center gap-2">
                <span>subscribers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}