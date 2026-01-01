import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import DashboardHeader from "../components/DashboardHeader";
import {
  ArrowLeft,
  Upload,
  CheckCircle,
  FileText,
  Trophy,
  Medal,
  Star,
  MoreVertical,
  Reply,
  Share2,
  Trash2
} from "lucide-react";
import Particles from "../components/Particles";
import { motion } from "framer-motion";
import { addDoc, collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAlert } from '../components/ui/AlertSystem';
import AIAgent from "../components/AIAgent";

interface EmailData {
  id: string;
  recipientId: string;
  subject: string;
  senderName: string;
  preview?: string;
  content: string;
  time: any;
  type?: 'certificate' | 'message';
  read: boolean;
  starred: boolean;
  certificate?: {
    title: string;
    issuer: string;
    date: string;
    badge: string;
    icon: 'trophy' | 'medal' | 'star';
    imageUrl: string;
  };
  attachments?: number;
}

export default function EmailDetail() {
  const { user } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [email, setEmail] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchEmail = async () => {
      try {
        const docRef = doc(db, 'emails', id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setEmail({ id: snap.id, ...data } as EmailData);
          
          // Mark as read if not already read
          if (!data.read) {
            await updateDoc(docRef, { read: true });
          }
        }
      } catch (err) {
        console.error("Error fetching email:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmail();
  }, [id]);

  // Helper render icons
  const renderIcon = (iconType: string) => {
    if (iconType === "trophy") return <Trophy className="w-3 h-3" />;
    if (iconType === "medal") return <Medal className="w-3 h-3" />;
    return <Star className="w-3 h-3" />;
  };

  const renderContent = () => {
     if (loading) {
       return (
         <div className="flex items-center justify-center py-20">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
         </div>
       );
     }

     if (!email) {
        return (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16 md:py-20 px-4">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 p-6 sm:p-8 md:p-12 max-w-md text-center shadow-2xl">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                        <FileText className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-slate-400" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Data Tidak Ditemukan</h2>
                    <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">Maaf, kami tidak dapat menemukan email atau sertifikat dengan ID tersebut.</p>
                    <button
                        onClick={() => navigate("/email")}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors border border-slate-600 text-sm sm:text-base"
                    >
                        Kembali ke Email
                    </button>
                </div>
            </div>
        );
     }

     if (email.type === 'certificate' && email.certificate) {
        // ACCEPTED ITEM VIEW (Certificate)
        const item = email.certificate;
        return (
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 sm:p-6 md:p-8 border-b border-slate-700/50 bg-slate-900/30">
                   <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="space-y-3 sm:space-y-4">
                         <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-green-500/20 border border-green-500/30 text-green-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 sm:gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                                <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Sertifikat Aktif
                            </span>
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 ${item.icon === 'trophy' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'} border text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1 sm:gap-1.5`}>
                                {renderIcon(item.icon)} {item.badge}
                            </span>
                         </div>
                         <div>
                            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">{item.title}</h1>
                            <p className="text-slate-400 text-xs sm:text-sm md:text-base">Diterbitkan oleh <span className="text-slate-200 font-medium">{item.issuer}</span> • {item.date}</p>
                         </div>
                      </div>
                      <div className="hidden md:block">
                         <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center ${item.icon === 'trophy' ? 'bg-amber-500/10' : 'bg-blue-500/10'}`}>
                             {item.icon === 'trophy' ? <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" /> : <Medal className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />}
                         </div>
                      </div>
                   </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8">
                   <div className="flex gap-3 sm:gap-4 p-3 sm:p-4 bg-blue-500/5 border border-blue-500/10 rounded-lg sm:rounded-xl">
                      <div className="flex-shrink-0">
                         <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                         </div>
                      </div>
                      <div>
                         <h3 className="font-semibold text-blue-100 mb-0.5 sm:mb-1 text-sm sm:text-base">Siap untuk Portofolio</h3>
                         <p className="text-xs sm:text-sm text-blue-200/70 leading-relaxed">
                            Sertifikat ini telah diverifikasi secara digital dan valid. Anda dapat menampilkannya di profil publik Anda untuk meningkatkan kredibilitas di mata perekrut.
                         </p>
                      </div>
                   </div>

                   {item.imageUrl && (
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group hover:border-slate-700 transition-colors cursor-pointer">
                        <div className="p-2 sm:p-3 bg-red-500/10 rounded-lg">
                           <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-slate-200 truncate group-hover:text-white transition-colors text-sm sm:text-base">{item.imageUrl}</h4>
                           <p className="text-xs sm:text-sm text-slate-500">Document File</p>
                        </div>
                        <button className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs sm:text-sm font-medium transition-colors">
                           Preview
                        </button>
                    </div>
                   )}

                   <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3 md:gap-4">
                       <button 
                         onClick={async () => {
                            if (!user) {
                              showAlert("⚠️ Anda harus login terlebih dahulu", 'error');
                              return;
                            }
                            
                            try {
                              // Check if already added (prevent duplicates)
                              const existingQuery = query(
                                collection(db, 'certificates'),
                                where('user_id', '==', (user as any).uid || user.id),
                                where('title', '==', item.title)
                              );
                              const existingDocs = await getDocs(existingQuery);
                              
                              if (!existingDocs.empty) {
                                showAlert("⚠️ Sertifikat ini sudah ada dalam portofolio Anda", 'warning');
                                return;
                              }
                              
                              // Add to Firestore
                              await addDoc(collection(db, 'certificates'), {
                                user_id: (user as any).uid || user.id,
                                username: user.name || "User",
                                title: item.title,
                                competition_name: item.issuer,
                                verified: true, // Always true from verified email
                                image_url: item.imageUrl,
                                public: true,
                                created_at: new Date().toISOString(),
                                email_id: id,
                                badge: item.badge,
                                icon: item.icon
                              });
                              
                              showAlert(`✅ "${item.title}" berhasil ditambahkan ke portofolio!`, 'success');
                              navigate("/profile");
                            } catch (error) {
                              console.error("Error adding to portfolio:", error);
                              showAlert("❌ Gagal menambahkan ke portofolio. Silakan coba lagi.", 'error');
                            }
                          }}
                         className="flex-1 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg sm:rounded-xl shadow-lg shadow-blue-900/20 font-medium text-sm sm:text-base transition-all transform active:scale-[0.98] flex items-center justify-center gap-1.5 sm:gap-2"
                       >
                           <Upload className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Unggah ke Portofolio
                       </button>
                       <button className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg sm:rounded-xl border border-slate-700 transition-all font-medium text-sm sm:text-base flex items-center justify-center gap-1.5 sm:gap-2">
                           <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Bagikan
                       </button>
                   </div>
                </div>
            </motion.div>
        );
     }

     // EMAIL ITEM VIEW
     return (
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl"
        >
            <div className="p-4 sm:p-6 md:p-8">
               {/* Email Header */}
               <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 md:mb-8 pb-4 sm:pb-6 md:pb-8 border-b border-slate-700/50 gap-4">
                   <div className="flex-1 min-w-0 pr-0 sm:pr-4">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-4">
                         <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500/10 text-blue-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-full border border-blue-500/20 flex items-center gap-1 sm:gap-1.5">
                             <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Pesan Masuk
                         </span>
                         {/* Display time if available, handle Timestamp */}
                         <span className="text-slate-500 text-xs sm:text-sm">• {new Date().toLocaleDateString()}</span>
                      </div>
                      <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1 sm:mb-2 leading-tight">{email.subject}</h1>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-slate-400 text-xs sm:text-sm">
                         <span>Dari:</span>
                         <span className="text-slate-200 font-medium px-1.5 sm:px-2 py-0.5 bg-slate-800 rounded text-xs sm:text-sm">{email.senderName}</span>
                      </div>
                   </div>
                   <div className="flex gap-1.5 sm:gap-2">
                       <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors" title="Balas">
                           <Reply className="w-4 h-4 sm:w-5 sm:h-5" />
                       </button>
                       <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors" title="Hapus">
                           <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                       </button>
                       <button className="p-1.5 sm:p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                           <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                       </button>
                   </div>
               </div>

               {/* Email Body */}
               <div className="prose prose-invert max-w-none text-slate-300 mb-4 sm:mb-6 md:mb-8 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                   {email.content}
               </div>

               {/* Attachments (Generic) */}
               {email.attachments && email.attachments > 0 && (
                <div className="mb-4 sm:mb-6 md:mb-8">
                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 sm:mb-3">Lampiran</h4>
                    <div className="bg-slate-950/50 border border-slate-800 rounded-lg sm:rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 group hover:border-blue-500/30 transition-all cursor-pointer">
                        <div className="p-2 sm:p-3 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
                           <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                           <h4 className="font-semibold text-slate-200 truncate group-hover:text-blue-400 transition-colors text-sm sm:text-base">Attachment</h4>
                           <p className="text-xs sm:text-sm text-slate-500">File</p>
                        </div>
                        <button className="w-full sm:w-auto px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-300 rounded-lg text-xs sm:text-sm font-medium transition-all">
                           Unduh
                        </button>
                    </div>
                </div>
               )}
            </div>
        </motion.div>
     );
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 overflow-x-hidden">
       {/* Background Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
         <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
         <Particles 
            particleCount={50} 
            particleSpread={10} 
            speed={0.1} 
            particleColors={['#60a5fa', '#a78bfa']}
            moveParticlesOnHover={true}
            particleHoverFactor={2}
            alphaParticles={true}
            particleBaseSize={100}
            sizeRandomness={1}
            cameraDistance={20}
            disableRotation={false}
         />
      </div>

      <DashboardHeader />

      <main className="relative z-10 container mx-auto px-3 sm:px-6 lg:px-8 max-w-5xl pt-20 sm:pt-24 md:pt-28 pb-12 mb-20 sm:mb-0">
         {/* Back Button */}
         <button 
           onClick={() => navigate("/email")}
           className="group flex items-center gap-1.5 sm:gap-2 text-slate-400 hover:text-white mb-4 sm:mb-6 transition-colors px-1 sm:px-2"
         >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/50 group-hover:bg-slate-700 flex items-center justify-center transition-colors">
               <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="font-medium text-xs sm:text-sm">Kembali ke Kotak Masuk</span>
         </button>

         {renderContent()}
      </main>
      <AIAgent />
    </div>
  );
}