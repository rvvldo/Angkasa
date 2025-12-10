// src/components/admin/AdminPanel.tsx
import React from 'react';
import { List, Bell } from 'lucide-react';

interface AdminPanelProps {
  userId: string;
  user?: {
    displayName?: string | null;
    email?: string | null;
  };
  onNavigate?: (route: 'posts' | 'notifications') => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ userId, user, onNavigate }) => {
  const getDisplayName = () => {
    if (user?.displayName) return user.displayName;
    if (user?.email) return user.email.split('@')[0];
    return 'Admin';
  };

  const displayName = getDisplayName();

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="bg-slate-800 border border-slate-700 p-6 md:p-8 rounded-xl shadow-2xl text-center">
        <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-1 md:mb-2">
          Selamat Datang, <span className="text-blue-300">{displayName}</span>!
        </h1>
        <p className="text-base md:text-xl text-gray-200">Dashboard Admin LasCode</p>
      </div>

      <div className="bg-gray-900 border border-slate-700 p-5 md:p-6 rounded-xl shadow-xl">
        <h2 className="text-lg md:text-2xl font-bold text-white border-b border-gray-700 pb-2 mb-3">
          Informasi Akun
        </h2>
        {user?.email && (
          <p className="text-gray-400 text-sm md:text-base">
            Masuk sebagai: <span className="text-blue-200 font-medium">{user.email}</span>
          </p>
        )}
        <div className="bg-gray-700 p-3 rounded-lg text-xs md:text-sm font-mono break-all mt-3">
          <span className="text-blue-200">User ID:</span>{' '}
          <span className="text-yellow-300">{userId || '–'}</span>
        </div>
        <p className="text-xs md:text-sm text-gray-500 italic mt-2">
          ID ini penting untuk identifikasi data publik dan private.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
        <button
          type="button"
          onClick={() => onNavigate?.('posts')}
          className="bg-slate-800 border border-slate-700 p-5 md:p-6 rounded-xl shadow-lg hover:shadow-blue-700/50 transition-all duration-200 text-left flex flex-col"
          aria-label="Kelola Postingan"
        >
          <List size={25} className="text-blue-400 mb-2 md:mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">Kelola Postingan</h3>
          <p className="text-gray-400 text-sm md:text-base flex-grow">
            Tambahkan, edit, atau hapus Postingan Lomba untuk peserta.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigate?.('notifications')}
          className="bg-slate-800 border border-slate-700 p-5 md:p-6 rounded-xl shadow-lg hover:shadow-blue-700/50 transition-all duration-200 text-left flex flex-col"
          aria-label="Kirim Notifikasi"
        >
          <Bell size={25} className="text-blue-400 mb-2 md:mb-3" />
          <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2">Kirim Notifikasi</h3>
          <p className="text-gray-400 text-sm md:text-base flex-grow">
            Kirim pesan penting kepada semua peserta lomba.
          </p>
        </button>
      </div>
    </div>
  );
};

export default AdminPanel;