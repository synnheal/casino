'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface UserData {
  token: string;
  userId: string;
  username: string;
  balance: string;
}

export default function CrashGameClient({ userData }: { userData: UserData }) {
  const [multiplier, setMultiplier] = useState(1.00);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCrashed, setHasCrashed] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [isBetting, setIsBetting] = useState(false);
  const [profit, setProfit] = useState(0);
  const [showWin, setShowWin] = useState(false);
  const [balance, setBalance] = useState(Number(userData.balance));
  const [history, setHistory] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(0);
  const [activeBets, setActiveBets] = useState(0);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const isBettingRef = useRef(false); // Référence persistante

  // WebSocket connection
  useEffect(() => {
    console.log('🔌 Connexion au serveur WebSocket...');
    socketRef.current = io('http://localhost:3001');

    socketRef.current.on('connect', () => {
      console.log('✅ Connecté au serveur WebSocket');
    });

    socketRef.current.on('game:state', (data) => {
      console.log('📊 État du jeu reçu:', data);
      setIsPlaying(data.isPlaying);
      setMultiplier(data.multiplier);
      setHistory(data.history || []);
    });

    socketRef.current.on('game:waiting', (data) => {
      console.log('⏳ En attente:', data.countdown, 'isBetting:', isBettingRef.current);
      setCountdown(data.countdown);
      setIsPlaying(false);
      setHasCrashed(false);
      // Ne pas réinitialiser isBetting ici !
    });

    socketRef.current.on('game:started', () => {
      console.log('🚀 Partie démarrée, isBetting:', isBettingRef.current);
      setIsPlaying(true);
      setHasCrashed(false);
      setCountdown(0);
      setMultiplier(1.00);
    });

    socketRef.current.on('game:tick', (data) => {
      setMultiplier(data.multiplier);
    });

    socketRef.current.on('game:crashed', (data) => {
      console.log('💥 Crash à', data.crashPoint, 'isBetting:', isBettingRef.current);
      setHasCrashed(true);
      setIsPlaying(false);
      setMultiplier(data.crashPoint);
      setHistory(prev => [data.crashPoint, ...prev.slice(0, 19)]);
      
      // Si on avait parié et pas cashout = perdu
      if (isBettingRef.current) {
        console.log('😢 Tu as perdu ton pari');
        setTimeout(() => {
          setIsBetting(false);
          isBettingRef.current = false;
          setHasCrashed(false);
        }, 3000);
      }
    });

    socketRef.current.on('player:bet', (data) => {
      setActiveBets(data.totalBets);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  // Placer un pari
  const placeBet = async () => {
    if (isBetting || isPlaying) return;
    
    console.log('🎲 Placement du pari:', betAmount);
    
    try {
      const response = await axios.post('http://localhost:3001/api/crash/bet', {
        token: userData.token,
        amount: betAmount,
      });
      
      console.log('✅ Pari placé:', response.data);
      setIsBetting(true);
      isBettingRef.current = true;
      setBalance(parseInt(response.data.balance));
    } catch (error: any) {
      console.error('❌ Erreur pari:', error.response?.data);
      alert(error.response?.data?.error || 'Erreur lors du pari');
    }
  };

  // Cashout
  const cashOut = async () => {
    if (!isBetting || hasCrashed || !isPlaying) {
      console.log('❌ Impossible de cashout:', { isBetting, hasCrashed, isPlaying });
      return;
    }
    
    console.log('💰 Cashout à', multiplier);
    
    try {
      const response = await axios.post('http://localhost:3001/api/crash/cashout', {
        token: userData.token,
      });
      
      console.log('✅ Cashout réussi:', response.data);
      const data = response.data;
      setProfit(parseInt(data.profit));
      setBalance(parseInt(data.balance));
      setIsBetting(false);
      isBettingRef.current = false;
      setShowWin(true);
      
      setTimeout(() => setShowWin(false), 3000);
    } catch (error: any) {
      console.error('❌ Erreur cashout:', error.response?.data);
      alert(error.response?.data?.error || 'Erreur lors du cashout');
    }
  };

  // Animation du graphique
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 217, 192, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.moveTo(0, (canvas.height / 10) * i);
        ctx.lineTo(canvas.width, (canvas.height / 10) * i);
        ctx.stroke();
      }

      if (isPlaying || hasCrashed) {
        const progress = Math.min((multiplier - 1) / 9, 1);
        const y = canvas.height - (progress * canvas.height * 0.8);
        
        ctx.strokeStyle = hasCrashed ? '#ef4444' : '#00D9C0';
        ctx.lineWidth = 4;
        ctx.shadowBlur = 20;
        ctx.shadowColor = hasCrashed ? '#ef4444' : '#00D9C0';
        
        ctx.beginPath();
        ctx.moveTo(0, canvas.height);
        ctx.quadraticCurveTo(canvas.width * 0.3, canvas.height * 0.7, canvas.width * 0.8, y);
        ctx.stroke();

        if (!hasCrashed) {
          for (let i = 0; i < 8; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const size = Math.random() * 3;
            
            ctx.fillStyle = 'rgba(0, 217, 192, 0.5)';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      requestAnimationFrame(animate);
    };

    animate();
  }, [multiplier, isPlaying, hasCrashed]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-[#00D9C0]/5 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#00D9C0] rounded-full flex items-center justify-center shadow-lg shadow-[#00D9C0]/50">
              <span className="text-2xl">📈</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Crash Game</h1>
              <p className="text-sm text-gray-400">Bienvenue {userData.username} !</p>
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] px-6 py-3 rounded-xl border border-[#00D9C0]/30">
            <div className="text-xs text-gray-400 mb-1">Balance</div>
            <div className="text-2xl font-bold text-[#00D9C0]">{balance} 💰</div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Graph */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 p-6 relative overflow-hidden">
              
              {/* Countdown */}
              <AnimatePresence>
                {countdown > 0 && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
                  >
                    <div className="text-center">
                      <div className="text-8xl font-black text-[#00D9C0] mb-4">
                        {countdown}
                      </div>
                      <div className="text-2xl text-gray-400">
                        Prochaine partie...
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        {activeBets} joueur(s) prêt(s)
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Multiplicateur */}
              <AnimatePresence>
                {isPlaying && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <div className={`text-8xl font-black ${hasCrashed ? 'text-red-500' : 'text-[#00D9C0]'}`}>
                      {hasCrashed ? 'CRASHED!' : `${multiplier.toFixed(2)}x`}
                    </div>
                    {!hasCrashed && isBetting && (
                      <div className="text-center mt-4">
                        <div className="text-3xl text-yellow-400 font-bold">
                          {Math.floor(betAmount * multiplier)} 💰
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <canvas ref={canvasRef} className="w-full h-96 rounded-xl" />

              {/* Win Animation */}
              <AnimatePresence>
                {showWin && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm rounded-2xl z-40"
                  >
                    <div className="text-center">
                      <div className="text-6xl mb-4">🎉</div>
                      <div className="text-5xl font-black text-[#00D9C0] mb-2">
                        +{profit} 💰
                      </div>
                      <div className="text-2xl text-white">
                        Cashout à {multiplier.toFixed(2)}x !
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* History */}
            <div className="mt-6 bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                <span>📊</span> Historique des crashs
              </h3>
              <div className="flex gap-2 overflow-x-auto">
                {history.map((crash, i) => (
                  <div
                    key={i}
                    className={`px-4 py-2 rounded-lg font-bold whitespace-nowrap ${
                      crash >= 2
                        ? 'bg-[#00D9C0]/20 text-[#00D9C0]'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {crash.toFixed(2)}x
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Betting Panel */}
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-6">
              <label className="text-sm text-gray-400 mb-2 block">Montant du pari</label>
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  disabled={isBetting || isPlaying}
                  className="flex-1 bg-black/50 border border-gray-700 rounded-lg px-4 py-3 text-white text-xl font-bold focus:outline-none focus:border-[#00D9C0]"
                />
                <div className="text-2xl">💰</div>
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 500].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    disabled={isBetting || isPlaying}
                    className="bg-gray-800 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all disabled:opacity-50"
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {/* Bouton PARIER - Visible uniquement si pas de pari actif et countdown OU partie pas commencée */}
              {!isBetting && !isPlaying && (
                <button
                  onClick={placeBet}
                  disabled={countdown > 0 && countdown < 3}
                  className="w-full bg-[#00D9C0] hover:bg-[#00c4ad] text-black font-black text-xl py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-[#00D9C0]/30 disabled:opacity-50"
                >
                  {countdown > 0 ? `⏳ ${countdown}s...` : '🚀 PARIER'} {betAmount} 💰
                </button>
              )}

              {/* Statut d'attente - Pari placé mais partie pas commencée */}
              {isBetting && !isPlaying && countdown > 0 && (
                <div className="w-full bg-yellow-500 text-black font-black text-xl py-4 rounded-xl text-center">
                  ⏳ En attente du démarrage...
                </div>
              )}

              {/* Bouton CASHOUT - Visible si pari actif ET partie en cours */}
              {isBetting && isPlaying && !hasCrashed && (
                <button
                  onClick={cashOut}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-black text-xl py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-yellow-400/30 animate-pulse"
                >
                  💰 CASHOUT {multiplier.toFixed(2)}x
                  <div className="text-sm mt-1">
                    Gain potentiel: {Math.floor(betAmount * multiplier)} 💰
                  </div>
                </button>
              )}

              {/* Partie crashée */}
              {isBetting && hasCrashed && (
                <div className="w-full bg-red-500 text-white font-black text-xl py-4 rounded-xl text-center">
                  ❌ Perdu ! Crash à {multiplier.toFixed(2)}x
                </div>
              )}
            </div>

            <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 p-4">
              <h3 className="text-white font-bold mb-3">👥 Partie en cours</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Joueurs actifs</span>
                  <span className="text-white font-bold">{activeBets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Multiplicateur</span>
                  <span className="text-[#00D9C0] font-bold">{multiplier.toFixed(2)}x</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">DEBUG isBetting</span>
                  <span className="text-yellow-400 font-bold">{isBetting ? 'OUI' : 'NON'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">DEBUG isPlaying</span>
                  <span className="text-yellow-400 font-bold">{isPlaying ? 'OUI' : 'NON'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">DEBUG hasCrashed</span>
                  <span className="text-yellow-400 font-bold">{hasCrashed ? 'OUI' : 'NON'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}