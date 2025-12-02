import AdminLayout from '../../components/admin/AdminLayout';
import {
    TrendingUp,
    Server,
    Activity,
    Globe,
    Cpu,
    HardDrive
} from 'lucide-react';

export default function CentralDashboard() {
    // Mock data - in real app this would come from API
    const performanceStats = [
        { label: 'Total Pengunjung', value: '12,345', change: '+12%', icon: TrendingUp, color: 'text-blue-400' },
        { label: 'Pengunjung Aktif', value: '142', change: 'Live', icon: Globe, color: 'text-green-400' },
        { label: 'Response Time', value: '45ms', change: '-5ms', icon: Activity, color: 'text-purple-400' },
    ];

    const serverStats = [
        { label: 'CPU Usage', value: '24%', status: 'Normal', icon: Cpu, color: 'text-orange-400' },
        { label: 'Memory Usage', value: '4.2GB', status: '32%', icon: HardDrive, color: 'text-pink-400' },
        { label: 'Storage', value: '45%', status: '240GB Free', icon: Server, color: 'text-cyan-400' },
    ];

    return (
        <AdminLayout role="central">
            <div className="space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Performa & Pengaturan</h1>
                    <p className="text-slate-400">Statistik performa website dan status server</p>
                </div>

                {/* Website Performance */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Statistik Website</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {performanceStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg bg-slate-700/50 ${stat.color}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-sm font-medium text-green-400 bg-green-400/10 px-2.5 py-1 rounded-full">
                                            {stat.change}
                                        </span>
                                    </div>
                                    <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Server Status */}
                <div>
                    <h2 className="text-lg font-bold text-white mb-4">Status Server</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {serverStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <div key={index} className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`p-3 rounded-lg bg-slate-700/50 ${stat.color}`}>
                                            <Icon size={24} />
                                        </div>
                                        <span className="text-sm font-medium text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">
                                            {stat.status}
                                        </span>
                                    </div>
                                    <h3 className="text-slate-400 text-sm font-medium mb-1">{stat.label}</h3>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>

                                    {/* Progress Bar */}
                                    <div className="mt-4 w-full bg-slate-700 rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full ${stat.color.replace('text-', 'bg-')}`}
                                            style={{ width: stat.value.includes('%') ? stat.value : '32%' }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Settings Section Placeholder */}
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4">Pengaturan Umum</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                <div>
                                    <h3 className="text-white font-medium">Maintenance Mode</h3>
                                    <p className="text-sm text-slate-400">Aktifkan mode maintenance untuk pengunjung</p>
                                </div>
                                <div className="w-11 h-6 bg-slate-600 rounded-full relative cursor-pointer">
                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                                <div>
                                    <h3 className="text-white font-medium">Registrasi Pengguna</h3>
                                    <p className="text-sm text-slate-400">Izinkan pengguna baru mendaftar</p>
                                </div>
                                <div className="w-11 h-6 bg-green-500 rounded-full relative cursor-pointer">
                                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full transition-transform"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
