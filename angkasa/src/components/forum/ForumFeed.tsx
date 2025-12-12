// src/components/ForumFeed.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../AuthProvider';
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Search,
  Trophy,
  GraduationCap,
  Copy,
  MessageSquareIcon,
  LinkIcon,
  ChevronDown,
  Filter,
  Clock,
} from 'lucide-react';
import { ref, onValue, update, get, push, set, serverTimestamp } from 'firebase/database';
import { rtdb } from '../../firebase';

interface Comment {
  id: string;
  author: string;
  authorId: string;
  text: string;
  timestamp: string | number;
  parentId?: string; // 🔥 baris baru
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  likes: number;
  comments: Record<string, Comment>;
  timestamp: string;
  category: 'lomba' | 'beasiswa';
  title?: string;
  type: 'lomba' | 'beasiswa';
  tags: string[];
  registrationLink: string;
  eventDate: string;
  closingDate: string;
  likedBy?: Record<string, boolean>;
}

const availableTypes = ['lomba', 'beasiswa'] as const;
const availableCategories = [
  'IT', 'luar negeri', 'S2', 'nasional', 'mahasiswa', 'pemerintah',
  'desain', 'programming', 'Jepang', 'LPDP', 'MEXT', 'debat',
  'bahasa Inggris', 'menulis', 'esai', 'SMA', 'Singapura', 'robotik', 'Australia'
];

export default function ForumFeed({
  searchQuery,
  setSearchQuery,
  openSearchDropdown
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  openSearchDropdown?: boolean;
}) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedType, setSelectedType] = useState<(typeof availableTypes)[number] | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'rekomendasi' | 'following'>('rekomendasi');
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
  const [openShares, setOpenShares] = useState<Set<string>>(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const postsRef = ref(rtdb, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const postsArray: Post[] = Object.keys(data).map((key) => ({
          id: key,
          author: data[key].author || 'Admin',
          avatar: data[key].avatar || '',
          content: data[key].content || '',
          image: data[key].image || '',
          likes: data[key].likes || 0,
          comments: data[key].comments || {},
          timestamp: data[key].timestamp || new Date().toISOString(),
          category: data[key].category || 'lomba',
          title: data[key].title || '',
          type: data[key].type || 'lomba',
          tags: Array.isArray(data[key].tags) ? data[key].tags : [],
          registrationLink: data[key].registrationLink || '#',
          eventDate: data[key].eventDate || new Date().toISOString(),
          closingDate: data[key].closingDate || new Date().toISOString(),
          likedBy: data[key].likedBy || {},
        }));

        postsArray.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setPosts(postsArray);
      } else {
        setPosts([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (openSearchDropdown) {
      setIsSearchOpen(true);
    }
  }, [openSearchDropdown]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLike = async (postId: string) => {
    if (!user?.id) return;

    const postRef = ref(rtdb, `posts/${postId}`);
    const snapshot = await get(postRef);
    if (!snapshot.exists()) return;

    const postData = snapshot.val();
    const likedBy = postData.likedBy || {};
    const isLiked = likedBy[user.id] === true;

    let newLikes = postData.likes || 0;
    const updates: Record<string, any> = {};

    if (isLiked) {
      newLikes = Math.max(0, newLikes - 1);
      updates[`likedBy/${user.id}`] = null;
    } else {
      newLikes += 1;
      updates[`likedBy/${user.id}`] = true;
    }

    updates.likes = newLikes;
    await update(postRef, updates);

    const heartEl = document.getElementById(`heart-${postId}`);
    if (heartEl) {
      heartEl.classList.remove('animate-ping');
      void heartEl.offsetWidth;
      heartEl.classList.add('animate-ping');
      setTimeout(() => heartEl.classList.remove('animate-ping'), 1000);
    }
  };

  const toggleComments = (postId: string) => {
    setOpenComments(prev => {
      const newSet = new Set(prev);
      newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });
  };

  const toggleShare = (postId: string) => {
    setOpenShares(prev => {
      const newSet = new Set(prev);
      newSet.has(postId) ? newSet.delete(postId) : newSet.add(postId);
      return newSet;
    });
  };

  // ✅ Kirim komentar utama
  const handleCommentSubmit = async (postId: string, commentText: string) => {
    if (!commentText.trim() || !user?.id) return;

    const commentsRef = ref(rtdb, `posts/${postId}/comments`);
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, {
      id: newCommentRef.key!,
      author: user.name || 'Anonymous',
      authorId: user.id,
      text: commentText.trim(),
      timestamp: serverTimestamp() as unknown as string,
      // Tidak ada parentId → komentar utama
    });

    const input = document.getElementById(`comment-input-${postId}`) as HTMLInputElement | null;
    if (input) input.value = '';
  };

  // ✅ Kirim balasan ke komentar tertentu
  const handleReplySubmit = async (postId: string, replyText: string, parentId: string) => {
    if (!replyText.trim() || !user?.id) return;

    const commentsRef = ref(rtdb, `posts/${postId}/comments`);
    const newCommentRef = push(commentsRef);
    await set(newCommentRef, {
      id: newCommentRef.key!,
      author: user.name || 'Anonymous',
      authorId: user.id,
      text: replyText.trim(),
      timestamp: serverTimestamp() as unknown as string,
      parentId, // 🔥
    });

    const input = document.getElementById(`reply-input-${postId}-${parentId}`) as HTMLInputElement | null;
    if (input) input.value = '';
  };

  const shareToWhatsApp = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const url = `${window.location.origin}/forum#${postId}`;
    const text = `Lihat di Angkasa: ${post.title || 'Postingan menarik'}\n"${post.content.substring(0, 80)}..."`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n\n' + url)}`, '_blank');
  };

  const copyLink = (postId: string) => {
    const url = `${window.location.origin}/forum#${postId}`;
    navigator.clipboard.writeText(url).catch(console.error);
  };

  const getRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const past = new Date(timestamp);
    const diffMs = now.getTime() - past.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} hari yang lalu`;
    if (diffHours > 0) return `${diffHours} jam yang lalu`;
    if (diffMins > 0) return `${diffMins} menit yang lalu`;
    return 'Baru saja';
  };

  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (activeTab === 'following') {
      result = posts.filter((_, i) => i % 2 === 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post =>
        post.title?.toLowerCase().includes(q) ||
        post.content.toLowerCase().includes(q) ||
        post.author.toLowerCase().includes(q) ||
        post.tags.some(tag => tag.toLowerCase().includes(q))
      );
    }

    if (selectedType) {
      result = result.filter(post => post.type === selectedType);
    }

    if (selectedCategory) {
      result = result.filter(post =>
        post.tags.map(t => t.toLowerCase()).includes(selectedCategory.toLowerCase())
      );
    }

    return result;
  }, [posts, searchQuery, selectedType, selectedCategory, activeTab]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto mb-4 text-center py-12">
        <p className="text-slate-400">Memuat postingan...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mb-4">
      {/* Search Toggle */}
      <section className="mb-6" ref={searchRef}>
        <div className="relative">
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-600/40 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500/30 backdrop-blur-sm transition-colors"
          >
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <span>{isSearchOpen ? 'Cari lomba, beasiswa...' : '🔍 Cari di Forum'}</span>
            </div>
            <Filter className="w-4 h-4 text-slate-500" />
          </button>

          {isSearchOpen && (
            <div className="absolute z-10 mt-2 w-full bg-slate-800/70 backdrop-blur-md border border-slate-600/40 rounded-xl shadow-xl overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kata kunci..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Tipe</label>
                  <div className="relative">
                    <select
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value as any)}
                      className="w-full py-2.5 pl-3 pr-8 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-slate-500"
                    >
                      <option value="" className="bg-slate-800 text-slate-400">Semua</option>
                      <option value="lomba" className="bg-slate-800 text-slate-200">🏆 Lomba</option>
                      <option value="beasiswa" className="bg-slate-800 text-slate-200">🎓 Beasiswa</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Jenis</label>
                  <div className="relative">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full py-2.5 pl-3 pr-8 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-slate-500"
                    >
                      <option value="" className="bg-slate-800 text-slate-400">Semua Jenis</option>
                      {availableCategories.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-800 text-slate-200">{cat}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedType('');
                      setSelectedCategory('');
                    }}
                    className="flex-1 px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="flex-1 px-3 py-2 text-sm bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-600/30"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 py-1 bg-slate-900/50 backdrop-blur-sm rounded-full border border-slate-600/30 text-slate-400 text-xs">
            🔮 Temukan Peluangmu
          </span>
        </div>
      </div>

      <section className="mb-8">
        <div className="flex flex-wrap gap-3 justify-center">
          {[
            { key: 'rekomendasi', label: 'Rekomendasi', icon: '' },
            { key: 'following', label: 'Diikuti', icon: '' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-5 py-2.5 text-sm font-medium rounded-full transition-all flex items-center gap-1.5 ${activeTab === tab.key
                ? 'bg-slate-600 text-white shadow-md'
                : 'bg-slate-800/40 text-slate-300 hover:bg-slate-700/50 border border-slate-600/30'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section>
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-600/30">
            <p className="text-slate-400">Tidak ada postingan yang sesuai.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredPosts.map((post) => {
              // 🔥 Kelompokkan komentar
              const allComments = Object.values(post.comments || {});
              const topLevel = allComments.filter(c => !c.parentId);
              const replies: Record<string, Comment[]> = {};
              allComments.forEach(c => {
                if (c.parentId) {
                  if (!replies[c.parentId]) replies[c.parentId] = [];
                  replies[c.parentId].push(c);
                }
              });

              return (
                <article
                  key={post.id}
                  className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="p-5 border-b border-slate-600/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                        <span className="font-medium text-slate-300">
                          {post.author.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-slate-200">{post.author}</p>
                          {post.type === 'lomba' ? (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 text-xs rounded-full flex items-center gap-1">
                              <Trophy className="w-3 h-3" /> Lomba
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full flex items-center gap-1">
                              <GraduationCap className="w-3 h-3" /> Beasiswa
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500">{getRelativeTime(post.timestamp)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 relative">
                    {post.title && <h3 className="text-xl font-bold text-slate-200 mb-2">{post.title}</h3>}
                    <p className="text-slate-300 mb-4">{post.content}</p>

                    {post.image && (
                      <img
                        src={post.image}
                        alt={post.title || 'Post'}
                        className="w-full rounded-lg object-cover max-h-72 mb-4"
                      />
                    )}

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {post.tags.map((tag, i) => (
                          <span key={i} className="px-2.5 py-1 bg-slate-700/40 text-slate-300 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="absolute top-5 right-5 z-10">
                      <span className="px-2 py-1 bg-transparent text-slate-300 text-xs font-bold rounded-full border border-slate-700 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(post.closingDate).toLocaleDateString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 pt-3 border-t border-slate-600/30 mb-5">
                      <button
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors group relative"
                        aria-label="Suka"
                      >
                        <Heart
                          className={`w-5 h-5 ${post.likedBy?.[user.id] ? 'fill-red-400 text-red-400' : ''}`}
                          id={`heart-${post.id}`}
                        />
                        <span className="text-sm">{post.likes}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors"
                        aria-label="Komentar"
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm">{allComments.length}</span>
                      </button>

                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleShare(post.id);
                          }}
                          className="flex items-center gap-1.5 text-slate-400 hover:text-blue-400 transition-colors text-sm"
                          aria-label="Bagikan"
                        >
                          <Share2 size={16} />
                          Bagikan
                        </button>

                        {openShares.has(post.id) && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
                            <div className="bg-slate-800/90 backdrop-blur-md rounded-lg shadow-xl border border-slate-600/40 p-3 w-60">
                              <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                                <LinkIcon className="w-3 h-3 text-slate-500" /> Salin Tautan
                              </p>
                              <button
                                onClick={() => copyLink(post.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-md text-left text-xs mb-2"
                              >
                                <Copy className="w-3 h-3 text-slate-400" />
                                Salin URL
                              </button>
                              <p className="text-slate-400 text-xs font-medium mb-2 flex items-center gap-1">
                                <MessageSquareIcon className="w-3 h-3 text-slate-500" /> Bagikan ke
                              </p>
                              <button
                                onClick={() => shareToWhatsApp(post.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 bg-green-700/80 hover:bg-green-600 text-white rounded-md text-left text-xs"
                              >
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.967-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                                WhatsApp
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Komentar Section */}
                    {openComments.has(post.id) && (
                      <div className="pt-4 border-t border-slate-600/30 mt-4">
                        <div className="flex gap-2 mb-4">
                          <div className="w-8 h-8 rounded-full bg-slate-700/40 flex items-center justify-center flex-shrink-0">
                            <span className="font-medium text-slate-300 text-sm">
                              {user.name?.charAt(0).toUpperCase() || 'A'}
                            </span>
                          </div>
                          <input
                            id={`comment-input-${post.id}`}
                            type="text"
                            placeholder="Tulis komentar..."
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const input = e.target as HTMLInputElement;
                                handleCommentSubmit(post.id, input.value);
                              }
                            }}
                            className="flex-1 px-3 py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(`comment-input-${post.id}`) as HTMLInputElement | null;
                              if (input) handleCommentSubmit(post.id, input.value);
                            }}
                            className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-colors"
                            title="Kirim"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                          {topLevel.length === 0 ? (
                            <p className="text-slate-500 text-sm italic">Belum ada komentar.</p>
                          ) : (
                            topLevel.map((comment) => (
                              <div key={comment.id} className="flex gap-3">
                                <div className="w-7 h-7 rounded-full bg-slate-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                                  <span className="font-medium text-slate-300 text-xs">
                                    {comment.author.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 bg-slate-800/20 rounded-lg p-3">
                                  <p className="font-medium text-slate-200 text-sm">{comment.author}</p>
                                  <p className="text-slate-300 text-sm mt-1">{comment.text}</p>
                                  <p className="text-slate-500 text-xs mt-1">
                                    {typeof comment.timestamp === 'string'
                                      ? new Date(comment.timestamp).toLocaleString('id-ID')
                                      : 'Waktu tidak valid'}
                                  </p>

                                  {/* Tombol Balas */}
                                  <button
                                    onClick={() => {
                                      const input = document.getElementById(`reply-input-${post.id}-${comment.id}`) as HTMLInputElement | null;
                                      if (input) input.focus();
                                    }}
                                    className="text-xs text-blue-400 hover:text-blue-300 mt-2"
                                  >
                                    Balas
                                  </button>

                                  {/* Input Balas */}
                                  <div className="mt-2">
                                    <input
                                      id={`reply-input-${post.id}-${comment.id}`}
                                      type="text"
                                      placeholder="Balas komentar..."
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                          const input = e.target as HTMLInputElement;
                                          handleReplySubmit(post.id, input.value, comment.id);
                                          input.value = '';
                                        }
                                      }}
                                      className="w-full px-3 py-1.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 text-sm"
                                    />
                                  </div>

                                  {/* Balasan */}
                                  {replies[comment.id]?.map((reply) => (
                                    <div key={reply.id} className="mt-2 pl-4 border-l-2 border-slate-600/30">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-200 text-sm">{reply.author}</span>
                                        <span className="text-slate-500 text-xs">
                                          {typeof reply.timestamp === 'string'
                                            ? new Date(reply.timestamp).toLocaleString('id-ID')
                                            : '--'}
                                        </span>
                                      </div>
                                      <p className="text-slate-300 text-sm mt-1">{reply.text}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}