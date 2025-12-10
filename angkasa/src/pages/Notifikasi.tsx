// src/pages/Notifikasi.tsx
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../components/AuthProvider";
import DashboardHeader from "../components/DashboardHeader";
import {
  Bell,
  Inbox,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Trophy,
  Medal,
  Star,
} from "lucide-react";
import { ref, onValue } from "firebase/database";
import { rtdb } from "../firebase";

// Tipe data dari Firebase
interface FirebaseNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  sentBy: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  };
}

interface Notification {
  id: string;
  type: "lomba" | "beasiswa";
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  badge: string | null;
  iconType: "trophy" | "medal" | "star" | "bell";
}

// Format waktu relatif
const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit yang lalu`;
  if (diffHours < 24) return `${diffHours} jam yang lalu`;
  if (diffDays < 7) return `${diffDays} hari yang lalu`;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const Notifications = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"all" | "unread" | "lomba" | "beasiswa">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [firebaseNotifs, setFirebaseNotifs] = useState<FirebaseNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Ambil data dari Firebase
  useEffect(() => {
    const notifsRef = ref(rtdb, "notifications");
    const unsubscribe = onValue(notifsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notifList: FirebaseNotification[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        // Urutkan dari yang terbaru
        notifList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setFirebaseNotifs(notifList);
      } else {
        setFirebaseNotifs([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Generate key unik per user untuk localStorage
  const readStatusKey = user ? `notif_read_status_${user.uid}` : null;

  // Baca status baca dari localStorage
  const getReadStatus = (): Set<string> => {
    if (!readStatusKey) return new Set();
    const saved = localStorage.getItem(readStatusKey);
    return saved ? new Set(JSON.parse(saved)) : new Set();
  };

  // Simpan status baca ke localStorage
  const markAsRead = (id: string) => {
    if (!readStatusKey) return;
    const readSet = getReadStatus();
    readSet.add(id);
    localStorage.setItem(readStatusKey, JSON.stringify(Array.from(readSet)));
  };

  // Transformasi data Firebase 
  const notifications = useMemo(() => {
    const readSet = getReadStatus();
    return firebaseNotifs.map((notif) => {
      const type: "lomba" | "beasiswa" = 
        notif.title.toLowerCase().includes("beasiswa") ? "beasiswa" : "lomba";

      return {
        id: notif.id,
        type,
        title: notif.title,
        description: notif.message,
        timestamp: formatRelativeTime(notif.timestamp),
        isRead: readSet.has(notif.id),
        badge: null,
        iconType: type === "lomba" ? "trophy" : "medal",
      } satisfies Notification;
    });
  }, [firebaseNotifs, user?.uid]);

  // Filter & Cari
  const filteredNotifications = notifications.filter((notif) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notif.isRead) ||
      (activeTab === "lomba" && notif.type === "lomba") ||
      (activeTab === "beasiswa" && notif.type === "beasiswa");

    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notif.badge && notif.badge.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesTab && matchesSearch;
  });

  useEffect(() => {
    setSearchQuery("");
  }, [activeTab]);

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 pt-24">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-8">
            <div className="rounded-xl border border-4 border-slate-600/30 px-8 py-5 shadow-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bell className="w-6 h-6 text-slate-300" />
                  <h1 className="text-2xl font-bold text-slate-200">Notifikasi</h1>
                </div>
                <p className="text-slate-400">Jangan lewatkan kesempatan emasmu!</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
                <div className="p-4 border-b border-slate-600/30">
                  <h2 className="font-semibold text-slate-200">Filter</h2>
                </div>
                <nav className="p-2">
                  {[
                    { id: "all", label: "Semua", icon: Inbox, count: notifications.length },
                    { 
                      id: "unread", 
                      label: "Belum Dibaca", 
                      icon: Bell, 
                      count: notifications.filter(n => !n.isRead).length 
                    },
                    { 
                      id: "lomba", 
                      label: "Lomba", 
                      icon: Trophy, 
                      count: notifications.filter(n => n.type === "lomba").length 
                    },
                    { 
                      id: "beasiswa", 
                      label: "Beasiswa", 
                      icon: Medal, 
                      count: notifications.filter(n => n.type === "beasiswa").length 
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                          activeTab === item.id
                            ? "bg-slate-700/50 text-white"
                            : "text-slate-300 hover:bg-slate-700/30"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                        {item.count > 0 && (
                          <span className="ml-auto bg-slate-600 text-slate-200 text-xs px-1.5 py-0.5 rounded-full">
                            {item.count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Konten */}
            <div className="lg:col-span-3">
              {/* Search Bar */}
              <div className="mb-4 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari notifikasi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800/40 border border-slate-700/50 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>

              {/* Loading */}
              {loading ? (
                <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 p-12 text-center">
                  <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4 animate-pulse" />
                  <p className="text-slate-400">Memuat notifikasi...</p>
                </div>
              ) : (
                /* Daftar Notifikasi */
                <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
                  {filteredNotifications.length === 0 ? (
                    <div className="p-12 text-center">
                      <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <p className="text-slate-400">Tidak ada notifikasi yang sesuai.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-700/50">
                      {filteredNotifications.map((notif) => {
                        let IconComponent = Bell;
                        if (notif.iconType === "trophy") IconComponent = Trophy;
                        else if (notif.iconType === "medal") IconComponent = Medal;
                        else if (notif.iconType === "star") IconComponent = Star;

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.isRead) {
                                markAsRead(notif.id);
                              }
                            }}
                            className={`p-4 hover:bg-slate-700/30 transition-colors cursor-pointer ${
                              !notif.isRead ? "bg-slate-800/50 border-l-4 border-green-500" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-3 rounded-lg bg-slate-700/20">
                                <IconComponent className="w-5 h-5 text-slate-300" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  {notif.badge && (
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                                      notif.isRead 
                                        ? "bg-slate-700/50 text-slate-300" 
                                        : "bg-green-500/20 text-green-300"
                                    } flex items-center gap-1`}>
                                      {notif.isRead ? (
                                        <CheckCircleIcon className="w-3 h-3" />
                                      ) : (
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                                      )}
                                      {notif.badge}
                                    </span>
                                  )}
                                  <span className="text-xs text-slate-500">
                                    {notif.type === "lomba" ? "🏆 Lomba" : "🎓 Beasiswa"}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-slate-100">{notif.title}</h3>
                                <p className="text-slate-400 text-sm line-clamp-2 mt-1">{notif.description}</p>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <span className={`text-xs whitespace-nowrap ${
                                  notif.isRead ? "text-slate-500" : "text-green-400 font-medium"
                                }`}>
                                  {notif.timestamp}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Notifications;