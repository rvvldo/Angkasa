// src/components/NotificationSidebar.tsx
import { X, Bell, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ref, onValue, update } from "firebase/database";
import { auth } from "../firebase";
import { rtdb } from "../firebase";

// Tipe data dari Firebase
interface FirebaseNotification {
  id: string;
  title: string;
  message: string;
  type: "lomba" | "beasiswa";
  badge: string | null;
  timestamp: string;
  sentBy: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  };
}

// Tipe untuk UI
interface Notification extends FirebaseNotification {
  isRead: boolean;
  formattedTime: string;
}

// Ambil inisial dari nama/email
const getInitials = (name: string | null | undefined, email?: string | null) => {
  const source = name || email?.split("@")[0] || "Admin";
  return source
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

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

// Modal Detail Notifikasi
const NotificationDetailModal: React.FC<{
  notification: Notification;
  onClose: () => void;
  onDelete: () => void;
}> = ({ notification, onClose, onDelete }) => {
  const { sentBy } = notification;
  const initials = getInitials(sentBy.displayName, sentBy.email);
  const adminName = sentBy.displayName || sentBy.email?.split("@")[0] || "Admin";

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Bottom Sheet Content */}
      <div className="relative w-full sm:max-w-md bg-slate-900 border-t sm:border border-slate-700/50 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in slide-in-from-bottom duration-300 flex flex-col max-h-[90vh]">

        {/* Mobile Handle */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1 flex-shrink-0" onClick={onClose}>
          <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
        </div>

        <div className="flex justify-between items-center p-4 border-b border-slate-700/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white">Detail Notifikasi</h2>
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border ${notification.type === "lomba"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}
            >
              {notification.type === "lomba" ? "Lomba" : "Beasiswa"}
            </span>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5 overflow-y-auto">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-900/20">
              {initials}
            </div>
            <div>
              <p className="text-base font-semibold text-white">{adminName}</p>
              <p className="text-sm text-slate-400">Mengirim notifikasi</p>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-blue-400 mb-2">{notification.title}</h3>
            <p className="text-slate-300 whitespace-pre-line leading-relaxed text-sm sm:text-base">
              {notification.message}
            </p>
          </div>

          {notification.badge && (
            <div>
              <span className="inline-flex px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 text-sm font-medium rounded-full">
                {notification.badge}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-xs sm:text-sm text-slate-500 pt-2 border-t border-slate-800">
            <span>{notification.formattedTime}</span>
          </div>

          <div className="p-4 border-t border-slate-700/50 bg-slate-800/20 flex gap-3 flex-shrink-0 pb-8 sm:pb-4">
            <button
              onClick={onDelete}
              className="flex-1 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2 font-medium active:scale-[0.98]"
            >
              <Trash2 size={18} />
              Hapus
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-all font-medium active:scale-[0.98]"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationSidebar({ isOpen, onClose }: NotificationSidebarProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const currentUser = auth.currentUser;
  const currentUserUid = currentUser?.uid || null;

  useEffect(() => {
    if (!isOpen || !currentUserUid) {
      setLoading(false);
      return;
    }

    const globalNotifsRef = ref(rtdb, "notifications");
    const userNotifsRef = ref(rtdb, `user_notifications/${currentUserUid}`);

    const unsubscribeGlobal = onValue(globalNotifsRef, (snapshot) => {
      const globalNotifs = snapshot.val() || {};

      const unsubscribeUser = onValue(userNotifsRef, (userSnapshot) => {
        const userNotifs = userSnapshot.val() || {};

        const mergedNotifs: Notification[] = Object.keys(globalNotifs)
          .filter((id) => {
            const userNotif = userNotifs[id];
            // Filter jika status isDeleted user adalah true
            return !userNotif?.isDeleted;
          })
          .map((id) => {
            const global = globalNotifs[id];
            const user = userNotifs[id] || { isRead: false };
            return {
              ...global,
              id,
              isRead: user.isRead,
              formattedTime: formatRelativeTime(global.timestamp),
            };
          });

        mergedNotifs.sort((a, b) => (a.isRead !== b.isRead ? (a.isRead ? 1 : -1) : 0));
        setNotifications(mergedNotifs);
        setLoading(false);
      });

      return () => unsubscribeUser();
    });

    return () => unsubscribeGlobal();
  }, [isOpen, currentUserUid]);

  const markAsRead = (id: string) => {
    if (!currentUserUid) return;
    const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${id}`);
    update(userNotifRef, { isRead: true });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllAsRead = () => {
    if (!currentUserUid) return;
    notifications.forEach((n) => {
      const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${n.id}`);
      update(userNotifRef, { isRead: true });
    });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    if (!currentUserUid) return;
    const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${id}`);
    // Soft delete: set isDeleted true, bukan remove node
    update(userNotifRef, { isDeleted: true });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAllNotifications = () => {
    if (!currentUserUid) return;
    if (!window.confirm("Hapus semua notifikasi? Tindakan ini tidak bisa dikembalikan.")) return;
    notifications.forEach((n) => {
      const userNotifRef = ref(rtdb, `user_notifications/${currentUserUid}/${n.id}`);
      // Soft delete semua
      update(userNotifRef, { isDeleted: true });
    });
    setNotifications([]);
  };

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    setSelectedNotification(notif);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Jangan tutup sidebar jika modal sedang terbuka
      if (selectedNotification) return;

      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose, selectedNotification]);

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]" />}

      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-slate-900/95 border-l border-slate-700/50 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <Bell className="w-5 h-5 text-slate-200" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">Notifikasi</h2>
                {!loading && (
                  <p className="text-xs text-slate-500">
                    {notifications.filter((n) => !n.isRead).length} belum dibaca
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-700/50 rounded-full text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <div className="text-center py-8 text-slate-400">Memuat notifikasi...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">Tidak ada notifikasi.</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`group relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${!notification.isRead
                    ? "bg-slate-800/80 border-slate-600/50 hover:bg-slate-800"
                    : "bg-slate-800/20 border-transparent hover:bg-slate-800/40"
                    }`}
                >
                  {!notification.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"></span>
                  )}

                  <div className="flex gap-4">
                    <div className="mt-1 flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm">
                        {getInitials(notification.sentBy.displayName, notification.sentBy.email)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${notification.type === "lomba"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                        >
                          {notification.type === "lomba" ? "Lomba" : "Beasiswa"}
                        </span>
                        {notification.badge && (
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-700/20 text-blue-300">
                            {notification.badge}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 ml-auto">
                          {notification.formattedTime}
                        </span>
                      </div>

                      <h3
                        className={`text-sm font-semibold leading-snug ${!notification.isRead ? "text-slate-100" : "text-slate-300"
                          }`}
                      >
                        {notification.title}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer: Tandai Semua & Hapus Semua */}
          <div className="p-4 border-t border-slate-700/50 bg-slate-800/30 flex gap-2">
            <button
              onClick={markAllAsRead}
              className="flex-1 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Tandai Sudah Dibaca
            </button>
            <button
              onClick={deleteAllNotifications}
              className="flex-1 py-2 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center justify-center gap-1"
            >
              <Trash2 size={14} />
              Hapus Semua
            </button>
          </div>
        </div>
      </div>

      {/* Modal Detail */}
      {selectedNotification && (
        <NotificationDetailModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
          onDelete={() => {
            deleteNotification(selectedNotification.id);
            setSelectedNotification(null);
          }}
        />
      )}
    </>
  );
}