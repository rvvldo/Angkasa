import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAlert } from '../../components/ui/AlertSystem';
import {
    Trash2,
    Calendar,
    Clock,
    LinkIcon,
    AlertCircle,
    Search,
    BookOpen,
    X
} from 'lucide-react';
import { ref, onValue, remove } from 'firebase/database';
import { rtdb } from '../../firebase';

interface Post {
    id: string;
    title: string;
    content: string;
    image?: string;
    author: string;
    avatar?: string;
    timestamp: string;
    category: string;
    type: 'lomba' | 'beasiswa' | 'seminar' | 'acara';
    tags?: string[];
    registrationLink?: string;
    eventDate?: string;
    closingDate?: string;
    authorId?: string;
    details?: { title: string; description: string }[];
}

const DetailModal = ({ post, onClose }: { post: Post; onClose: () => void }) => {
    if (!post || !post.details) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/80 transition-opacity" onClick={onClose}></div>
            <div className="relative bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl mx-auto transform transition-all animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-md rounded-t-2xl">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BookOpen size={24} className="text-blue-400" />
                            Detail & Klasifikasi
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">{post.title}</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                    {post.details.map((detail, index) => (
                        <div key={index} className="bg-white/5 border border-white/10 p-5 rounded-xl hover:bg-white/10 transition-colors">
                            <h4 className="font-bold text-white text-lg mb-2 text-blue-300">{detail.title}</h4>
                            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{detail.description}</p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-slate-900/50 backdrop-blur-md rounded-b-2xl flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function CentralPosts() {
    const [posts, setPosts] = useState<Post[]>([]);
    const { showAlert, showConfirm } = useAlert();
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'lomba' | 'beasiswa' | 'seminar' | 'acara'>('all');
    const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);

    useEffect(() => {
        const postsRef = ref(rtdb, 'posts');
        const unsubscribe = onValue(postsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const postsArray: Post[] = Object.keys(data).map((key) => ({
                    id: key,
                    ...data[key],
                }));
                postsArray.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
                setPosts(postsArray);
            } else {
                setPosts([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDeletePost = async (post: Post) => {
        const confirmed = await showConfirm(
            `Apakah Anda yakin ingin menghapus postingan "${post.title}"?`,
            'Konfirmasi Hapus'
        );
        if (!confirmed) return;

        try {
            // Delete from global posts
            await remove(ref(rtdb, `posts/${post.id}`));

            // If authorId exists, also delete from admin's posts
            if (post.authorId) {
                await remove(ref(rtdb, `admins/${post.authorId}/posts/${post.id}`));
            }

            showAlert('Postingan berhasil dihapus', 'success');
        } catch (error) {
            console.error('Error deleting post:', error);
            showAlert('Gagal menghapus postingan. Coba lagi.', 'error');
        }
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            post.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || post.type === filterType;
        return matchesSearch && matchesType;
    });

    if (loading) {
        return (
            <AdminLayout role="central">
                <div className="text-white">Memuat data postingan...</div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout role="central">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Manajemen Postingan</h1>
                    <p className="text-slate-400">Kelola semua postingan yang dibuat oleh DashAdmin</p>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Cari postingan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilterType('all')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filterType === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Semua
                        </button>
                        <button
                            onClick={() => setFilterType('lomba')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filterType === 'lomba'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Lomba
                        </button>
                        <button
                            onClick={() => setFilterType('beasiswa')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filterType === 'beasiswa'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Beasiswa
                        </button>
                        <button
                            onClick={() => setFilterType('seminar')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filterType === 'seminar'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Seminar
                        </button>
                        <button
                            onClick={() => setFilterType('acara')}
                            className={`px-4 py-2 rounded-lg transition ${
                                filterType === 'acara'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            Acara
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Total Postingan</p>
                        <p className="text-2xl font-bold text-white">{posts.length}</p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Lomba</p>
                        <p className="text-2xl font-bold text-white">
                            {posts.filter(p => p.type === 'lomba').length}
                        </p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Beasiswa</p>
                        <p className="text-2xl font-bold text-white">
                            {posts.filter(p => p.type === 'beasiswa').length}
                        </p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Seminar</p>
                        <p className="text-2xl font-bold text-white">
                            {posts.filter(p => p.type === 'seminar').length}
                        </p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <p className="text-slate-400 text-sm">Acara</p>
                        <p className="text-2xl font-bold text-white">
                            {posts.filter(p => p.type === 'acara').length}
                        </p>
                    </div>
                </div>

                {/* Posts Grid */}
                {filteredPosts.length === 0 ? (
                    <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                        <AlertCircle size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 text-lg">
                            {searchTerm || filterType !== 'all' 
                                ? 'Tidak ada postingan yang sesuai dengan pencarian atau filter' 
                                : 'Belum ada postingan'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <div
                                key={post.id}
                                className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition"
                            >
                                {/* Image */}
                                {post.image && (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-48 object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                )}

                                <div className="p-4 space-y-3">
                                    {/* Type Badge */}
                                    <div className="flex items-center justify-between">
                                        <span
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                                post.type === 'lomba'
                                                    ? 'bg-blue-400/10 text-blue-400'
                                                    : post.type === 'beasiswa'
                                                    ? 'bg-yellow-400/10 text-yellow-400'
                                                    : post.type === 'seminar'
                                                    ? 'bg-purple-400/10 text-purple-400'
                                                    : 'bg-green-400/10 text-green-400'
                                            }`}
                                        >
                                            {post.type.charAt(0).toUpperCase() + post.type.slice(1)}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-bold text-white line-clamp-2">
                                        {post.title}
                                    </h3>

                                    {/* Content */}
                                    <p className="text-sm text-slate-400 line-clamp-3">
                                        {post.content}
                                    </p>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {post.tags.slice(0, 3).map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className="px-2 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                            {post.tags.length > 3 && (
                                                <span className="px-2 py-0.5 bg-slate-700/40 text-slate-300 text-xs rounded">
                                                    +{post.tags.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Dates */}
                                    {(post.eventDate || post.closingDate) && (
                                        <div className="text-xs text-slate-500 space-y-1">
                                            {post.eventDate && (
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={12} />
                                                    <span>Acara: {formatDate(post.eventDate)}</span>
                                                </div>
                                            )}
                                            {post.closingDate && (
                                                <div className="flex items-center gap-2">
                                                    <Clock size={12} />
                                                    <span>Tutup: {formatDate(post.closingDate)}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Author */}
                                    <div className="pt-2 border-t border-slate-700">
                                        <p className="text-xs text-slate-500">
                                            Oleh: <span className="text-slate-400">{post.author}</span>
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {formatDate(post.timestamp)}
                                        </p>
                                    </div>

                                    {/* Additional Details Button */}
                                    {post.details && post.details.length > 0 && (post.type === 'lomba' || post.type === 'beasiswa') && (
                                        <button
                                            onClick={() => setSelectedPostForDetail(post)}
                                            className="w-full mt-2 py-2 bg-slate-700/50 hover:bg-slate-700 text-blue-300 text-xs font-semibold rounded-lg transition-colors border border-blue-500/10 flex items-center justify-center gap-2"
                                        >
                                            <BookOpen size={14} />
                                            Lihat Detail & Klasifikasi
                                        </button>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2">
                                        {post.registrationLink && (
                                            <a
                                                href={post.registrationLink}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30 transition text-sm"
                                            >
                                                <LinkIcon size={14} />
                                                Link
                                            </a>
                                        )}
                                        <button
                                            onClick={() => handleDeletePost(post)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition text-sm"
                                        >
                                            <Trash2 size={14} />
                                            Hapus
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {selectedPostForDetail && (
                    <DetailModal 
                        post={selectedPostForDetail} 
                        onClose={() => setSelectedPostForDetail(null)} 
                    />
                )}
            </div>
        </AdminLayout>
    );
}
