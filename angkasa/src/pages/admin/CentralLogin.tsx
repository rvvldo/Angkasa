import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Particles from '../../components/Particles';

export default function CentralLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username === 'lasadmin321' && password === '12345') {
      sessionStorage.setItem('central_admin_auth', 'true');
      navigate('/admin/central/users'); // Redirect to users or dashboard
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-900 flex items-center justify-center p-4 overflow-hidden">
        {/* Background Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
            <Particles
                particleCount={80}
                particleSpread={10}
                speed={0.05}
                particleColors={['#60a5fa', '#a855f7']}
                moveParticlesOnHover={true}
                alphaParticles={true}
                particleBaseSize={100}
                disableRotation={false}
                className="w-full h-full opacity-30"
            />
        </div>

      <div className="relative z-10 w-full max-w-md bg-slate-800/50 backdrop-blur-md rounded-2xl shadow-xl border border-slate-700/50 p-8">
        <h1 className="text-3xl font-bold text-center text-white mb-8">Admin Central</h1>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
              placeholder="Enter admin username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-blue-600 hover:from-blue-500 hover:to-blue-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-blue-500/25 transition-all duration-200 transform hover:scale-[1.02]"
          >
            Access Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
