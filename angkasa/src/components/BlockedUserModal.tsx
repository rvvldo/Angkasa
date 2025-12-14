import React from 'react';
import { useAuth } from '../components/AuthProvider';
import { Lock, LogOut } from 'lucide-react';

export default function BlockedUserModal() {
    const { user, logout } = useAuth();

    if (!user || !user.isBlocked) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl p-8 text-center relative overflow-hidden">
                {/* Background blobs */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

                <div className="relative z-10">
                    <div className="mx-auto w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/30">
                        <Lock size={40} className="text-red-500" />
                    </div>

                    <h2 className="text-2xl font-bold text-white mb-2">Akun Diblokir</h2>
                    <p className="text-slate-400 mb-6">
                        Maaf, akun Anda telah dinonaktifkan oleh administrator.
                    </p>

                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mb-8">
                        <p className="text-xs text-red-300 font-semibold uppercase tracking-wider mb-1">Alasan Pemblokiran</p>
                        <p className="text-slate-200">"{user.blockedReason || 'Pelanggaran ketentuan layanan'}"</p>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 font-medium group"
                    >
                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                        Keluar dari Aplikasi
                    </button>
                </div>
            </div>
        </div>
    );
}
