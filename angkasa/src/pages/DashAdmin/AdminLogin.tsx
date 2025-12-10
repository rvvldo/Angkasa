import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, rtdb } from '../../firebase';
import { InputField } from './AdminCommon';
import { User, Mail, Lock, UserPlus } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Check if user is admin in Realtime Database
        const adminRef = ref(rtdb, `admins/${user.uid}`);
        const snapshot = await get(adminRef);

        if (!snapshot.exists()) {
          throw new Error('Akun ini bukan admin');
        }

        onLoginSuccess();
      } else {
        // Register
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update display name
        if (name) {
          await updateProfile(user, { displayName: name });
        }

        // Save admin data to Realtime Database
        const adminData = {
          uid: user.uid,
          email: user.email,
          name: name || user.email?.split('@')[0] || 'Admin',
          role: 'admin',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        await set(ref(rtdb, `admins/${user.uid}`), adminData);

        onLoginSuccess();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      let errorMessage = 'Terjadi kesalahan';

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak ditemukan';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Password salah';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah terdaftar';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password terlalu lemah';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Login Admin' : 'Daftar Admin'}
          </h1>
          <p className="text-gray-400">
            {isLogin ? 'Masuk ke dashboard admin' : 'Buat akun admin baru'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <InputField
              id="name"
              label="Nama Lengkap"
              type="text"
              value={name}
              onChange={setName}
              Icon={User}
            />
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-white flex items-center">
              <Mail size={16} className="mr-2 text-blue-400" />
              Email <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Masukkan email"
              className="w-full px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-white flex items-center">
              <Lock size={16} className="mr-2 text-blue-400" />
              Password <span className="text-red-400 ml-1">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
              className="w-full px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
            />
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-600 text-red-200 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password || (!isLogin && !name)}
            className={`w-full py-3 px-4 rounded-lg font-bold text-white transition duration-200 flex items-center justify-center ${
              loading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-900/50'
            }`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                {isLogin ? (
                  <>
                    <User className="mr-2" size={20} />
                    Masuk
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2" size={20} />
                    Daftar
                  </>
                )}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setEmail('');
              setPassword('');
              setName('');
            }}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;