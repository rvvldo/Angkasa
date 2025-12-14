import React from 'react';
import RubiksCube from '../components/RubiksCube';
import Particles from '../components/Particles';
import AIAgent from '../components/AIAgent';

const MaintenancePage: React.FC = () => {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-900 text-white flex flex-col items-center justify-center p-4">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse"></div>
                <Particles
                    particleCount={100}
                    particleSpread={10}
                    speed={0.05}
                    particleColors={['#ffffff', '#60a5fa']}
                    moveParticlesOnHover={false}
                    alphaParticles={true}
                    particleBaseSize={100}
                    disableRotation={false}
                    className="w-full h-full opacity-50"
                />
            </div>

            <div className="relative z-10 max-w-2xl w-full text-center space-y-8 backdrop-blur-sm bg-slate-800/30 p-12 rounded-2xl border border-slate-700/50 shadow-2xl">

                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient-x">
                        Maintenance
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-300 font-light">
                        Sistem Sedang Dalam Pemeliharaan
                    </p>
                </div>

                <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
                    <p className="text-slate-400 text-lg leading-relaxed">
                        Kami sedang melakukan peningkatan pada sistem Angkasa untuk memberikan pengalaman terbaik bagi Anda.
                    </p>
                </div>

                <div className="flex justify-center pt-4 pb-2">
                    <RubiksCube className="w-16 h-16" />
                </div>

                <div className="pt-2">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                        Estimated time: Segera kembali
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
      <AIAgent />
        </div>
    );
};

export default MaintenancePage;
