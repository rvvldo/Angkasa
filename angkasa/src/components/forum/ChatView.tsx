// src/components/ChatView.tsx
import { useState, useEffect, useRef } from 'react';
import {
  Search,
  MoreVertical,
  Send,
  Paperclip,
  Smile,
  Phone,
  Video,
  ArrowLeft,
} from 'lucide-react';
import { useAuth } from '../AuthProvider'; // pastikan path benar
import { useAlert } from '../ui/AlertSystem';
import { db } from '../../firebase';
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';

interface Contact {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  status: 'online' | 'offline';
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: any; // Firestore timestamp
}

export default function ChatView() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  // 🔁 Scroll otomatis ke bawah saat pesan baru masuk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🔁 Muat daftar kontak (semua user kecuali diri sendiri)
    useEffect(() => {
    if (!user) return;

    const loadContacts = async () => {
        try {
        // 1. Ambil daftar ID teman
        const friendDoc = await getDoc(doc(db, "friends", user.id));
        let friendIds: string[] = [];
        if (friendDoc.exists()) {
            const data = friendDoc.data();
            friendIds = Array.isArray(data.friends) ? data.friends : [];
        }

        if (friendIds.length === 0) {
            setContacts([]);
            return;
        }

        // 2. Ambil data user hanya untuk teman
        const q = query(
            collection(db, "users"),
            where("id", "in", friendIds) // ✅ HANYA TEMAN
        );
        const snapshot = await getDocs(q);
        const contactList: Contact[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
            id: doc.id,
            name: data.name || 'User',
            lastMessage: 'Belum ada pesan',
            time: '',
            unread: 0,
            status: 'offline',
            };
        });

        setContacts(contactList);
        } catch (err) {
        console.error('Gagal muat kontak:', err);
        }
    };

    loadContacts();
    }, [user]);

  // 🔁 Muat riwayat chat saat memilih kontak
  useEffect(() => {
    if (!user || !selectedContact) {
      setMessages([]);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('sender_id', 'in', [user.id, selectedContact.id]),
      where('receiver_id', 'in', [user.id, selectedContact.id]),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [user, selectedContact]);

  // ✉️ Kirim pesan
  const handleSend = async () => {
    if (!user || !selectedContact || !message.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        sender_id: user.id,
        receiver_id: selectedContact.id,
        content: message.trim(),
        timestamp: serverTimestamp(),
      });
      setMessage('');
    } catch (err) {
      console.error('Gagal kirim pesan:', err);
      showAlert('Gagal mengirim pesan.', 'error');
    }
  };

  // 🔄 Format waktu (sederhana)
  const formatTime = (ts: any) => {
    if (!ts?.toDate) return 'Baru saja';
    const date = ts.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-140px)] sm:h-[calc(100vh-120px)] max-md:h-[calc(100vh-200px)] bg-slate-800/30 border border-slate-600/30 rounded-lg sm:rounded-xl overflow-hidden">
      {/* Sidebar List */}
      <div className={`${selectedContact ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-600/30`}>
        <div className="p-3 sm:p-4 border-b border-slate-600/30">
          <div className="relative">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
            <input
              type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari teman..."
                className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1.5 sm:py-2 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
  {contacts.length === 0 ? (
    <div className="p-3 sm:p-4 text-center text-slate-500 text-xs sm:text-sm">
      Belum ada teman. Tambahkan dari profil!
    </div>
  ) : (
    contacts
      .filter(contact =>
        contact.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
      .map((contact) => (
        <div
          key={contact.id}
          onClick={() => setSelectedContact(contact)}
          className={`p-3 sm:p-4 flex items-center gap-2.5 sm:gap-3 cursor-pointer hover:bg-slate-700/30 transition-colors ${
            selectedContact?.id === contact.id ? 'bg-slate-700/40' : ''
          }`}
        >
          <div className="relative">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-slate-300 text-sm sm:text-base">{contact.name.charAt(0)}</span>
            </div>
            {contact.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-slate-800 rounded-full"></span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-0.5 sm:mb-1">
              <h3 className="font-medium text-slate-200 truncate text-sm sm:text-base">{contact.name}</h3>
              <span className="text-[10px] sm:text-xs text-slate-500">{contact.time}</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 truncate">{contact.lastMessage}</p>
          </div>
          {contact.unread > 0 && (
            <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[10px] sm:text-xs font-bold text-white">{contact.unread}</span>
            </div>
          )}
        </div>
      ))
    )}
    </div>
      </div>

      {/* Chat Area */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col bg-slate-900/20">
          {/* Chat Header */}
          <div className="p-3 sm:p-4 border-b border-slate-600/30 flex items-center justify-between bg-slate-800/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="md:hidden p-1.5 sm:p-2 -ml-1 sm:-ml-2 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-600 flex items-center justify-center">
                <span className="font-bold text-slate-300 text-sm sm:text-base">{selectedContact.name.charAt(0)}</span>
              </div>
              <div>
                <h3 className="font-medium text-slate-200 text-sm sm:text-base">{selectedContact.name}</h3>
                <p className="text-[10px] sm:text-xs text-slate-400">
                  {selectedContact.status === 'online' ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Video className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            <div className="flex justify-center">
              <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 bg-slate-800/50 rounded-full text-[10px] sm:text-xs text-slate-500">Hari ini</span>
            </div>

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 sm:gap-3 ${msg.sender_id === user.id ? 'flex-row-reverse' : ''}`}
              >
                {msg.sender_id !== user.id && (
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-700 flex-shrink-0"></div>
                )}
                <div
                  className={`p-2.5 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%] ${
                    msg.sender_id === user.id
                      ? 'bg-blue-600 rounded-tr-none'
                      : 'bg-slate-800 rounded-tl-none'
                  }`}
                >
                  <p
                    className={
                      msg.sender_id === user.id ? 'text-white text-xs sm:text-sm' : 'text-slate-300 text-xs sm:text-sm'
                    }
                  >
                    {msg.content}
                  </p>
                  <span
                    className={`text-[10px] sm:text-xs mt-0.5 sm:mt-1 block ${
                      msg.sender_id === user.id ? 'text-blue-200' : 'text-slate-500'
                    }`}
                  >
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-slate-600/30 bg-slate-800/50">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ketik pesan..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-900/50 border border-slate-700/50 rounded-full text-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button className="hidden sm:block p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-700/50">
                <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-2 sm:p-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-500 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-500">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-3 sm:mb-4">
            <Search className="w-6 h-6 sm:w-8 sm:h-8 opacity-50" />
          </div>
          <p className="text-sm sm:text-base">Pilih kontak untuk mulai chatting</p>
        </div>
      )}
    </div>
  );
}