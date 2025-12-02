import { useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { AlertCircle, CheckCircle, Clock, Filter, Search, X, Mail, Calendar, Tag, FileText } from 'lucide-react';

interface Report {
    id: number;
    email: string;
    issue: string;
    category: string;
    date: string;
    status: 'Baru' | 'Proses' | 'Selesai';
    description: string;
}

export default function CentralReports() {
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const reports: Report[] = [
        {
            id: 1,
            email: 'user1@example.com',
            issue: 'Gagal login saat menggunakan Google',
            category: 'Login',
            date: '2024-03-20',
            status: 'Baru',
            description: 'Saya mencoba login menggunakan akun Google saya tetapi selalu kembali ke halaman login tanpa pesan error. Saya sudah mencoba clear cache tapi masih sama.'
        },
        {
            id: 2,
            email: 'student@school.id',
            issue: 'Sertifikat tidak muncul di profil',
            category: 'Profil',
            date: '2024-03-19',
            status: 'Proses',
            description: 'Saya sudah menyelesaikan lomba desain grafis dan dinyatakan menang, tapi sertifikat belum muncul di halaman profil saya.'
        },
        {
            id: 3,
            email: 'provider@lomba.com',
            issue: 'Error saat upload banner lomba',
            category: 'Upload',
            date: '2024-03-18',
            status: 'Selesai',
            description: 'Saat mencoba mengupload banner untuk lomba baru, muncul error "File too large" padahal ukuran file sudah di bawah 2MB.'
        },
        {
            id: 4,
            email: 'new@user.com',
            issue: 'Verifikasi email tidak masuk',
            category: 'Register',
            date: '2024-03-17',
            status: 'Baru',
            description: 'Saya sudah mendaftar tapi email verifikasi tidak masuk ke inbox maupun spam folder saya.'
        },
    ];

    const filteredReports = reports.filter(report =>
        report.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AdminLayout role="central">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Laporan Masalah</h1>
                    <p className="text-slate-400">Daftar laporan kendala dari pengguna website</p>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-red-400/10 text-red-400">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Laporan Baru</p>
                            <p className="text-2xl font-bold text-white">5</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-yellow-400/10 text-yellow-400">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Sedang Proses</p>
                            <p className="text-2xl font-bold text-white">3</p>
                        </div>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-green-400/10 text-green-400">
                            <CheckCircle size={24} />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm font-medium">Selesai</p>
                            <p className="text-2xl font-bold text-white">128</p>
                        </div>
                    </div>
                </div>

                {/* Reports Table */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h2 className="text-lg font-bold text-white">Semua Laporan</h2>
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Cari laporan..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors">
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-700/50 text-slate-400 text-sm">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Email Pelapor</th>
                                    <th className="px-6 py-4 font-medium">Kategori</th>
                                    <th className="px-6 py-4 font-medium">Masalah</th>
                                    <th className="px-6 py-4 font-medium">Tanggal</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                                            Tidak ada laporan yang ditemukan
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr
                                            key={report.id}
                                            onClick={() => setSelectedReport(report)}
                                            className="hover:bg-slate-700/30 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-slate-300">{report.email}</td>
                                            <td className="px-6 py-4 text-slate-400">{report.category}</td>
                                            <td className="px-6 py-4 text-slate-300 max-w-xs truncate">{report.issue}</td>
                                            <td className="px-6 py-4 text-slate-400">{report.date}</td>
                                            <td className="px-6 py-4">
                                                <span className={`
                            px-2.5 py-1 rounded-full text-xs font-medium
                            ${report.status === 'Baru' ? 'bg-red-400/10 text-red-400' :
                                                        report.status === 'Proses' ? 'bg-yellow-400/10 text-yellow-400' :
                                                            'bg-green-400/10 text-green-400'}
                          `}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedReport(report);
                                                    }}
                                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                                                >
                                                    Tindak Lanjut
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-900/50">
                            <h3 className="text-xl font-bold text-white">Detail Laporan</h3>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-lg ${selectedReport.status === 'Baru' ? 'bg-red-400/10 text-red-400' :
                                    selectedReport.status === 'Proses' ? 'bg-yellow-400/10 text-yellow-400' :
                                        'bg-green-400/10 text-green-400'
                                    }`}>
                                    <AlertCircle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-lg font-semibold text-white mb-1">{selectedReport.issue}</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedReport.status === 'Baru' ? 'bg-red-400/10 text-red-400' :
                                            selectedReport.status === 'Proses' ? 'bg-yellow-400/10 text-yellow-400' :
                                                'bg-green-400/10 text-green-400'
                                            }`}>
                                            {selectedReport.status}
                                        </span>
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300 flex items-center gap-1">
                                            <Tag size={12} /> {selectedReport.category}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Mail size={16} />
                                        <span className="text-sm">Email Pelapor</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedReport.email}</p>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                    <div className="flex items-center gap-2 text-slate-400 mb-1">
                                        <Calendar size={16} />
                                        <span className="text-sm">Tanggal Laporan</span>
                                    </div>
                                    <p className="text-white font-medium">{selectedReport.date}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50">
                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                    <FileText size={16} />
                                    <span className="text-sm">Deskripsi Masalah</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">
                                    {selectedReport.description}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
                                <button
                                    onClick={() => setSelectedReport(null)}
                                    className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                >
                                    Tutup
                                </button>
                                <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-medium">
                                    Balas via Email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
