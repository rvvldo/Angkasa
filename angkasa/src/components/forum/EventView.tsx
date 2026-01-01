import { useState, useEffect } from 'react';
import { Search, Calendar, Clock, ExternalLink, ArrowLeft, Loader2 } from 'lucide-react';
import { rtdb } from '../../firebase';
import { ref, onValue } from 'firebase/database';
import { useAlert } from '../ui/AlertSystem';

interface Event {
    id: string;
    title: string;
    type: 'seminar' | 'acara';
    description: string;
    imageUrl: string;
    eventDate: string; // ISO string
    closingDate: string; // ISO string
    registrationLink?: string;
    externalLink?: string;
    organizer?: string;
    author?: string; // Display name of admin/organizer
    tags?: string[];
}

export default function EventView() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const { showAlert } = useAlert();

    const ensureAbsoluteUrl = (url?: string) => {
        if (!url) return '#';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `https://${url}`;
    };

    useEffect(() => {
        const postsRef = ref(rtdb, 'posts');
        const unsubscribePosts = onValue(postsRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const eventList: Event[] = Object.values(data)
                    .filter((post: any) => post.type === 'seminar' || post.type === 'acara')
                    .map((post: any) => ({
                        ...post,
                        imageUrl: post.image || post.imageUrl, // Handle legacy field if any
                        description: post.content || post.description || '',
                        organizer: post.organizer || post.author || 'Pihak Universitas', // Default organizer if missing
                        externalLink: post.externalLink
                    }))
                    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
                setEvents(eventList);
            } else {
                setEvents([]);
            }
            setLoading(false);
        });

        return () => {
            unsubscribePosts();
        };
    }, []);

    const categories = ['Semua', 'Seminar', 'Acara'];

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Map category selection to type
        let matchesCategory = true;
        if (selectedCategory === 'Seminar') matchesCategory = event.type === 'seminar';
        if (selectedCategory === 'Acara') matchesCategory = event.type === 'acara';
        
        return matchesSearch && matchesCategory;
    });

    const handleShare = async () => {
        const shareData = {
            title: selectedEvent?.title,
            text: `Ikuti acara ${selectedEvent?.title} di Angkasa Forum!`,
            url: window.location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                navigator.clipboard.writeText(window.location.href);
                showAlert('Link acara berhasil disalin!', 'success');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };



    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (selectedEvent) {
        return (
            <div className="space-y-4 sm:space-y-6 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">


                <button 
                    onClick={() => setSelectedEvent(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <div className="p-1.5 sm:p-2 rounded-full bg-slate-800/50 group-hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-medium text-sm sm:text-base">Kembali ke Daftar Acara</span>
                </button>

                <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl sm:rounded-2xl overflow-hidden p-1">
                    <div className="relative h-48 sm:h-64 md:h-96 rounded-lg sm:rounded-xl overflow-hidden">
                        <img 
                            src={selectedEvent.imageUrl} 
                            alt={selectedEvent.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-8 w-full">
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wide mb-2 sm:mb-4 inline-block backdrop-blur-sm ${
                                selectedEvent.type === 'seminar' ? 'bg-blue-600/90 text-white' : 'bg-yellow-500/90 text-slate-900'
                            }`}>
                                {selectedEvent.type}
                            </span>
                            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-1 sm:mb-2">{selectedEvent.title}</h1>
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-slate-300 text-xs sm:text-sm md:text-base">
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                    <span>{new Date(selectedEvent.eventDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-1 sm:gap-2">
                                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                                    <span>{new Date(selectedEvent.eventDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-8 grid md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                        {/* LEFT COLUMN: Description */}
                        <div className="md:col-span-2 flex flex-col min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
                            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-200 mb-3 sm:mb-4">Tentang Acara Ini</h3>
                            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm sm:text-base md:text-lg flex-1 whitespace-pre-wrap">
                                {selectedEvent.description}
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Actions & Organizer */}
                        <div className="space-y-4 sm:space-y-6">
                            {/* Actions Card */}
                            <div className="bg-slate-800/50 rounded-xl p-4 sm:p-5 md:p-6 border border-slate-700/30 md:sticky md:top-24">
                                <h3 className="text-base sm:text-lg font-bold text-white mb-4 sm:mb-6">Daftar Sekarang</h3>
                                <div className="space-y-3 sm:space-y-4">
                                    {selectedEvent.registrationLink ? (
                                        <a 
                                            href={ensureAbsoluteUrl(selectedEvent.registrationLink)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm sm:text-base transition-all hover:scale-105 shadow-lg shadow-blue-600/20 flex items-center justify-center"
                                        >
                                            Pendaftaran
                                        </a>
                                    ) : (
                                        <button 
                                            disabled
                                            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700 text-slate-400 rounded-xl font-bold text-sm sm:text-base cursor-not-allowed"
                                        >
                                            Pendaftaran Belum Dibuka
                                        </button>
                                    )}
                                    
                                    {selectedEvent.externalLink && (
                                        <a 
                                           href={ensureAbsoluteUrl(selectedEvent.externalLink)}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm sm:text-base transition-colors flex items-center justify-center gap-2"
                                        >
                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                            Kunjungi website
                                        </a>
                                    )}
                                </div>
                                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/30 text-center">
                                    <button onClick={handleShare} className="w-full group">
                                        <p className="text-xs sm:text-sm text-slate-400 mb-2 group-hover:text-blue-400 transition-colors">Bagikan acara ini</p>
                                        <div className="flex justify-center gap-3 sm:gap-4">
                                            {/* Dummy social icons */}
                                            {['Twitter', 'Facebook', 'LinkedIn', 'WhatsApp'].map(social => (
                                                <div key={social} className="p-1.5 sm:p-2 bg-slate-700/50 group-hover:bg-slate-700 rounded-lg text-slate-400 group-hover:text-white transition-colors">
                                                    <div className="w-3 h-3 sm:w-4 sm:h-4 bg-current rounded-full"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Organizer Info (Moved here) */}
                            <div className="bg-slate-900/30 rounded-xl p-4 sm:p-5 md:p-6 border border-slate-700/30 mb-20 sm:mb-0">
                                <h4 className="text-base sm:text-lg font-semibold text-slate-200 mb-3 sm:mb-4">Penyelenggara</h4>
                                <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-700 flex items-center justify-center text-xl sm:text-2xl">
                                        🏢
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-200 text-sm sm:text-base">{selectedEvent.organizer || 'Admin'}</div>
                                        <div className="text-xs sm:text-sm text-slate-400">Verified Organizer</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 sm:space-y-6 mb-4">
            {/* Header & Search */}
            <div className="bg-slate-800/30 border border-slate-600/30 rounded-xl p-4 sm:p-5 md:p-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-200 mb-4 sm:mb-6 text-center">Acara & Seminar</h2>

                <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari acara..."
                            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 text-sm sm:text-base focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Event List */}
            {filteredEvents.length === 0 ? (
                <div className="text-center py-8 sm:py-10 md:py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-700">
                    <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-3 sm:mb-4" />
                    <p className="text-slate-400 text-sm sm:text-base">Belum ada acara yang ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:gap-6 mb-20 sm:mb-0">
                    {filteredEvents.map((event) => (
                        <div 
                            key={event.id} 
                            onClick={() => setSelectedEvent(event)}
                            className="bg-slate-800/30 border border-slate-600/30 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all group cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-1/3 h-40 sm:h-48 md:h-auto relative overflow-hidden">
                                    <img
                                        src={event.imageUrl}
                                        alt={event.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://placehold.co/800x450/4C4CFF/FFFFFF?text=Gambar+Tidak+Tersedia';
                                        }}
                                    />
                                    <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded-full uppercase tracking-wide backdrop-blur-sm ${
                                            event.type === 'seminar' ? 'bg-blue-600/90 text-white' : 'bg-yellow-500/90 text-slate-900'
                                        }`}>
                                            {event.type}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-5 md:p-6 md:w-2/3 flex flex-col justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-400 text-xs sm:text-sm mb-2">
                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>{new Date(event.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span className="mx-0.5 sm:mx-1">•</span>
                                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span>{new Date(event.eventDate).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB</span>
                                        </div>
                                        <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-200 mb-1 sm:mb-2 group-hover:text-blue-400 transition-colors">{event.title}</h3>
                                        <p className="text-slate-400 mb-3 sm:mb-4 line-clamp-2 text-xs sm:text-sm md:text-base">{event.description}</p>
                                    </div>

                                    <div className="flex items-center gap-2 sm:gap-3">
                                        {event.registrationLink ? (
                                            <a 
                                                href={ensureAbsoluteUrl(event.registrationLink)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-xs sm:text-sm text-center"
                                            >
                                                Daftar Sekarang
                                            </a>
                                        ) : (
                                            <button 
                                                disabled
                                                className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700 text-slate-400 rounded-lg font-medium text-xs sm:text-sm cursor-not-allowed"
                                            >
                                                Daftar
                                            </button>
                                        )}
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedEvent(event);
                                            }}
                                            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors text-xs sm:text-sm flex items-center gap-1 sm:gap-2"
                                        >
                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" /> Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
