import React, { useState, useEffect } from 'react';
import {
  Bell,
  BookOpen,
  Clock,
  Send,
  User,
  Edit2,
  Trash2,
  X,
  Trophy,
  Medal,
  Tag,
} from 'lucide-react';
import { InputField } from './AdminCommon';
import {
  ref,
  push,
  set,
  onValue,
  update,
  remove,
} from 'firebase/database';
import { auth, rtdb } from '../../firebase';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'lomba' | 'beasiswa';
  badge: string | null;
  timestamp: string;
  sentBy: {
    uid: string;
    email?: string | null;
    displayName?: string | null;
  };
}

const NotificationForm: React.FC<{
  onClose: () => void;
  notificationToEdit?: Notification | null;
  onSubmit: ( data: Pick<Notification, 'title' | 'message' | 'type' | 'badge'>) => void;
  isSubmitting: boolean;
}> = ({ onClose, notificationToEdit, onSubmit, isSubmitting }) => {
  const [title, setTitle] = useState(notificationToEdit?.title || '');
  const [message, setMessage] = useState(notificationToEdit?.message || '');
  const [type, setType] = useState<Notification['type']>(notificationToEdit?.type || 'lomba');
  const [badge, setBadge] = useState(notificationToEdit?.badge || '');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedTitle = title.trim();
    const trimmedMessage = message.trim();

    if (!trimmedTitle || !trimmedMessage) {
      setError('Judul dan pesan tidak boleh kosong.');
      return;
    }

    onSubmit({
      title: trimmedTitle,
      message: trimmedMessage,
      type,
      badge: badge.trim() || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField
        id="notifTitle"
        label="Judul Pesan"
        type="text"
        value={title}
        onChange={setTitle}
        Icon={Bell}
      />
      <InputField
        id="notifMessage"
        label="Isi Pesan"
        type="textarea"
        value={message}
        onChange={setMessage}
        Icon={BookOpen}
      />

      <div className="space-y-1">
        <label htmlFor="notifType" className="text-sm font-medium text-white flex items-center">
          <Trophy size={16} className="mr-2 text-blue-400" />
          Tipe Notifikasi <span className="text-red-400 ml-1">*</span>
        </label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setType('lomba')}
            className={`flex-1 py-2 px-3 rounded-lg border transition ${
              type === 'lomba'
                ? 'bg-blue-700/50 border-blue-500 text-blue-300'
                : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Trophy size={16} className="inline mr-1" /> Lomba
          </button>
          <button
            type="button"
            onClick={() => setType('beasiswa')}
            className={`flex-1 py-2 px-3 rounded-lg border transition ${
              type === 'beasiswa'
                ? 'bg-purple-700/50 border-purple-500 text-purple-300'
                : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Medal size={16} className="inline mr-1" /> Beasiswa
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="notifBadge" className="text-sm font-medium text-white flex items-center">
          <Tag size={16} className="mr-2 text-blue-400" />
          Badge (Opsional)
        </label>
        <input
          id="notifBadge"
          type="text"
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          placeholder="Contoh: Juara 1, Finalis, Peserta"
          className="w-full px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
        />
      </div>

      {error && <p className="text-red-400 text-sm italic">{error}</p>}
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-3 py-1.5 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-3 py-1.5 text-sm bg-blue-600 text-white font-medium rounded hover:bg-blue-500 transition disabled:opacity-50"
        >
          {isSubmitting ? 'Menyimpan...' : notificationToEdit ? 'Simpan Perubahan' : 'Kirim'}
        </button>
      </div>
    </form>
  );
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-slate-700 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const NotificationCard: React.FC<{
  notification: Notification;
  onEdit: (notif: Notification) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onEdit, onDelete }) => {
  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    if (
      confirm(
        `Hapus notifikasi "${notification.title}"?\nAksi ini tidak bisa dikembalikan.`
      )
    ) {
      onDelete(notification.id);
    }
  };

  return (
    <div className="bg-gray-900 border border-slate-700 rounded-lg p-4 hover:bg-gray-850 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {notification.type === 'lomba' ? (
              <Trophy className="w-4 h-4 text-yellow-400" />
            ) : (
              <Medal className="w-4 h-4 text-purple-400" />
            )}
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">
              {notification.type === 'lomba' ? 'Lomba' : 'Beasiswa'}
            </span>
            {notification.badge && (
              <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-700/30 text-blue-300">
                {notification.badge}
              </span>
            )}
          </div>
          <h3 className="font-bold text-blue-400 text-sm md:text-base line-clamp-1">
            {notification.title}
          </h3>
          <p className="text-gray-300 text-xs md:text-sm mt-1 line-clamp-2">
            {notification.message}
          </p>
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <User size={12} className="mr-1" />
            {notification.sentBy.displayName || notification.sentBy.email}
          </div>
          <div className="text-xs text-gray-500 mt-1">{formatDate(notification.timestamp)}</div>
        </div>
        <div className="flex space-x-1 ml-2 flex-shrink-0">
          <button
            onClick={() => onEdit(notification)}
            className="p-1.5 bg-blue-700/80 rounded text-white hover:bg-blue-600 transition"
            aria-label="Edit"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-red-700/80 rounded text-white hover:bg-red-600 transition"
            aria-label="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminNotif: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'lomba' | 'beasiswa'>('lomba');
  const [badge, setBadge] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{ message: string; success: boolean } | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifToEdit, setNotifToEdit] = useState<Notification | null>(null);
  const [isModalSubmitting, setIsModalSubmitting] = useState(false);

  // 🔥 Ambil notifikasi hanya milik admin yang sedang login
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const notifsRef = ref(rtdb, `admins/${currentUser.uid}/notifications`);
    const unsubscribe = onValue(notifsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const notifList: Notification[] = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          badge: data[key].badge || null,
        }));
        notifList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setNotifications(notifList);
      } else {
        setNotifications([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🔥 Kirim Notifikasi ke folder admin
const handleSendNotification = async (e: React.FormEvent) => {
  e.preventDefault();
  const trimmedTitle = title.trim();
  const trimmedMessage = message.trim();

  if (!trimmedTitle || !trimmedMessage) {
    setSubmitStatus({ message: 'Judul dan pesan wajib diisi.', success: false });
    return;
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    setSubmitStatus({ message: 'Anda harus login sebagai admin.', success: false });
    return;
  }

  setIsSending(true);
  setSubmitStatus(null);

  // Data notifikasi
  const notifData = {
    title: trimmedTitle,
    message: trimmedMessage,
    type,
    badge: badge.trim() || null,
    timestamp: new Date().toISOString(),
    sentBy: {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
    },
  };

  try {
    // 1️⃣ Simpan ke folder admin (untuk manajemen CRUD)
    const adminNotifRef = ref(rtdb, `admins/${currentUser.uid}/notifications`);
    const newAdminNotifRef = push(adminNotifRef);
    await set(newAdminNotifRef, notifData);

    // 2️⃣ Simpan ke path global (untuk peserta)
    const globalNotifRef = ref(rtdb, 'notifications');
    const newGlobalNotifRef = push(globalNotifRef);
    await set(newGlobalNotifRef, {
      ...notifData,
      adminId: currentUser.uid, // Opsional: untuk tracking
    });

    setSubmitStatus({ message: 'Notifikasi berhasil dikirim!', success: true });
    setTitle('');
    setMessage('');
    setType('lomba');
    setBadge('');
  } catch (error) {
    console.error('Gagal mengirim notifikasi:', error);
    setSubmitStatus({ message: 'Gagal mengirim notifikasi. Coba lagi.', success: false });
  } finally {
    setIsSending(false);
  }
};

  const handleEditNotification = async ( data: Pick<Notification, 'title' | 'message' | 'type' | 'badge'>) => {
    if (!notifToEdit || !auth.currentUser) return;
    setIsModalSubmitting(true);
    try {
      const notifRef = ref(rtdb, `admins/${auth.currentUser.uid}/notifications/${notifToEdit.id}`);
      await update(notifRef, {
        title: data.title,
        message: data.message,
        type: data.type,
        badge: data.badge,
      });
      setIsModalOpen(false);
      setNotifToEdit(null);
    } catch (error) {
      alert('Gagal memperbarui notifikasi. Coba lagi.');
      console.error('Edit error:', error);
    } finally {
      setIsModalSubmitting(false);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      const notifRef = ref(rtdb, `admins/${auth.currentUser.uid}/notifications/${id}`);
      await remove(notifRef);
    } catch (error) {
      alert('Gagal menghapus notifikasi. Coba lagi.');
      console.error('Delete error:', error);
    }
  };

  const openEditModal = (notif: Notification) => {
    setNotifToEdit(notif);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="md:text-3xl font-extrabold text-white border-b border-slate-700 pb-3">
          Kirim Notifikasi ke Peserta
        </h1>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl mt-4">
          <form onSubmit={handleSendNotification} className="space-y-4">
            <InputField
              id="notifTitle"
              label="Judul Pesan"
              type="text"
              value={title}
              onChange={setTitle}
              Icon={Bell}
            />
            <InputField
              id="notifMessage"
              label="Isi Pesan"
              type="textarea"
              value={message}
              onChange={setMessage}
              Icon={BookOpen}
            />

            <div className="space-y-1">
              <label className="text-sm font-medium text-white flex items-center">
                <Trophy size={16} className="mr-2 text-blue-400" />
                Tipe Notifikasi <span className="text-red-400 ml-1">*</span>
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setType('lomba')}
                  className={`flex-1 py-2 px-3 rounded-lg border transition ${
                    type === 'lomba'
                      ? 'bg-blue-700/50 border-blue-500 text-blue-300'
                      : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Trophy size={16} className="inline mr-1" /> Lomba
                </button>
                <button
                  type="button"
                  onClick={() => setType('beasiswa')}
                  className={`flex-1 py-2 px-3 rounded-lg border transition ${
                    type === 'beasiswa'
                      ? 'bg-purple-700/50 border-purple-500 text-purple-300'
                      : 'bg-gray-800 border-slate-600 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Medal size={16} className="inline mr-1" /> Beasiswa
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-white flex items-center">
                <Tag size={16} className="mr-2 text-blue-400" />
                Badge (Opsional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Contoh: Juara 1, Finalis, Peserta"
                className="w-full px-4 py-2 border border-slate-600 bg-gray-800 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-slate-500 transition duration-150"
              />
            </div>

            {submitStatus && (
              <div
                className={`p-3 rounded text-sm ${
                  submitStatus.success
                    ? 'bg-green-800/50 text-green-200 border border-green-600'
                    : 'bg-red-800/50 text-red-200 border border-red-600'
                }`}
              >
                {submitStatus.message}
              </div>
            )}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSending || !title.trim() || !message.trim()}
                className={`px-4 py-2 flex items-center justify-center font-bold rounded-lg transition ${
                  isSending
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-700 text-white hover:bg-blue-500 shadow-md shadow-blue-800/50'
                }`}
              >
                {isSending ? (
                  <>
                    <Clock size={18} className="animate-spin" />
                    <span className="ml-2">Mengirim...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span className="ml-2">Kirim Notifikasi</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-3">
          Notifikasi Terkirim ({notifications.length})
        </h2>
        {loading ? (
          <p className="text-gray-400">Memuat notifikasi...</p>
        ) : notifications.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada notifikasi yang dikirim.</p>
        ) : (
          <div className="space-y-3 mt-4">
            {notifications.map((notif) => (
              <NotificationCard
                key={notif.id}
                notification={notif}
                onEdit={openEditModal}
                onDelete={handleDeleteNotification}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setNotifToEdit(null);
        }}
        title="Edit Notifikasi"
      >
        <NotificationForm
          notificationToEdit={notifToEdit}
          onSubmit={handleEditNotification}
          onClose={() => {
            setIsModalOpen(false);
            setNotifToEdit(null);
          }}
          isSubmitting={isModalSubmitting}
        />
      </Modal>
    </div>
  );
};

export default AdminNotif;