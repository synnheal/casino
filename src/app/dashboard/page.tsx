import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;

  if (!token) {
    redirect('/?error=not_authenticated');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      discordId: string;
      username: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        casinoStats: true,
      },
    });

    if (!user) {
      redirect('/?error=user_not_found');
    }

    return user;
  } catch (error) {
    redirect('/?error=invalid_token');
  }
}

export default async function DashboardPage() {
  const user = await getUser();

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 border border-gray-800">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#00D9C0] rounded-full flex items-center justify-center shadow-lg shadow-[#00D9C0]/50">
                <span className="text-3xl">⚡</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Bienvenue, <span className="text-[#00D9C0]">{user.username}</span> ! 👋
                </h1>
                <p className="text-gray-400">Prêt à tenter ta chance au casino ?</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-400 mb-1">Tes crédits</div>
              <div className="text-4xl font-bold text-[#00D9C0] flex items-center gap-2">
                {user.credits.toString()} 
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {user.casinoStats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#00D9C0] transition-all">
              <div className="text-sm text-gray-400 mb-2">Niveau</div>
              <div className="text-4xl font-bold text-[#00D9C0]">
                {user.casinoStats.level}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                XP: {user.casinoStats.xp}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#00D9C0] transition-all">
              <div className="text-sm text-gray-400 mb-2">Parties jouées</div>
              <div className="text-4xl font-bold text-white">
                {user.casinoStats.totalGames}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#00D9C0] transition-all">
              <div className="text-sm text-gray-400 mb-2">Total gagné</div>
              <div className="text-4xl font-bold text-green-400">
                {user.casinoStats.totalWon.toString()}
              </div>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 hover:border-[#00D9C0] transition-all">
              <div className="text-sm text-gray-400 mb-2">Plus gros gain</div>
              <div className="text-4xl font-bold text-yellow-400">
                {user.casinoStats.biggestWin.toString()}
              </div>
            </div>
          </div>
        )}

        {/* Games */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/games/crash" className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800 hover:border-[#00D9C0] transition-all cursor-pointer group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">📈</div>
            <h3 className="text-2xl font-bold text-white mb-3">Crash Game</h3>
            <p className="text-gray-400 mb-6">
              Cashout avant le crash et multiplie tes gains !
            </p>
            <div className="w-full bg-[#00D9C0] hover:bg-[#00c4ad] text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-[#00D9C0]/30 text-center">
              Jouer maintenant
            </div>
          </Link>

          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800 hover:border-[#00D9C0] transition-all cursor-pointer group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🎯</div>
            <h3 className="text-2xl font-bold text-white mb-3">Roulette</h3>
            <p className="text-gray-400 mb-6">
              Misez sur rouge, noir ou vos numéros !
            </p>
            <button className="w-full bg-[#00D9C0] hover:bg-[#00c4ad] text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-[#00D9C0]/30">
              Jouer maintenant
            </button>
          </div>

          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800 hover:border-[#00D9C0] transition-all cursor-pointer group">
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="text-2xl font-bold text-white mb-3">Blackjack</h3>
            <p className="text-gray-400 mb-6">
              Battez le croupier sans dépasser 21 !
            </p>
            <button className="w-full bg-[#00D9C0] hover:bg-[#00c4ad] text-black font-bold py-3 rounded-lg transition-all shadow-lg shadow-[#00D9C0]/30">
              Jouer maintenant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}