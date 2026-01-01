
// src/pages/PublicProfile.tsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { useAuth } from "../components/AuthProvider";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import {
  FileText,
  CheckCircle,
  Sparkles as SparklesIcon,
  Crown,
  Share2,
  Lock,
  X,
  Instagram,
  Youtube,
  Twitch,
  ArrowLeft,
  Award,
  Trophy,
  Star
} from "lucide-react";
import Particles from '../components/Particles';
import { useAlert } from '../components/ui/AlertSystem';
import { motion, AnimatePresence } from 'framer-motion';

interface Certificate {
  id: string;
  title: string;
  competition_name: string;
  verified: boolean;
  image_url?: string;
  timing?: string;
  listens?: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement_count: number;
  requirement_type: string;
  is_unlocked?: boolean;
}

const mockAchievements: Achievement[] = [
  {
    id: "ach-001",
    name: "Pendatang Baru",
    description: "Bergabung dengan Angkasa",
    icon: "Star",
    requirement_count: 1,
    requirement_type: "join",
    is_unlocked: true,
  },
  {
    id: "ach-002",
    name: "Juara 1",
    description: "Menangkan 1 Lomba",
    icon: "Trophy",
    requirement_count: 1,
    requirement_type: "win",
    is_unlocked: false,
  },
  {
    id: "ach-003",
    name: "Aktif",
    description: "Login 7 hari berturut-turut",
    icon: "Award",
    requirement_count: 7,
    requirement_type: "login",
    is_unlocked: false,
  },
  {
    id: "ach-004",
    name: "Sosialita",
    description: "Bagikan profilmu ke sosial media",
    icon: "Share2",
    requirement_count: 1,
    requirement_type: "share",
    is_unlocked: false,
  },
  {
    id: "ach-005",
    name: "Kontributor",
    description: "Posting 5 konten di forum",
    icon: "FileText",
    requirement_count: 5,
    requirement_type: "post",
    is_unlocked: false,
  },
  {
    id: "ach-006",
    name: "Sultan",
    description: "Memiliki 10.000 XP",
    icon: "Crown",
    requirement_count: 10000,
    requirement_type: "xp",
    is_unlocked: false,
  },
  {
    id: "ach-007",
    name: "Ambisius",
    description: "Ikuti 5 kompetisi",
    icon: "Trophy",
    requirement_count: 5,
    requirement_type: "competition",
    is_unlocked: false,
  }
];

interface User {
  id: string;
  name: string;
  email?: string;
  bio?: string;
  role?: string;
  experience_level?: string;
  favorite_artists?: string[];
  favorite_genre?: string;
  software_used?: string;
  city_region?: string;
  institution?: string; // Added to match Profil.tsx
  availability?: string;
  badges?: string[];
  tags?: string[];
  banner_photo?: string;
  profile_photo?: string;
  social_media?: {
    instagram?: string;
    youtube?: string;
    tiktok?: string;
  };
}

export default function PublicProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showAlert } = useAlert();

  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [achievements] = useState<Achievement[]>(mockAchievements);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);
  const [showCertificatesModal, setShowCertificatesModal] = useState(false);

  const [isFriend, setIsFriend] = useState(false);
  const [loadingFriend, setLoadingFriend] = useState(true);
  const [completionScore, setCompletionScore] = useState(0);

  // Helper function to render icons dynamically
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy": return <Trophy className="w-5 h-5" />;
      case "Award": return <Award className="w-5 h-5" />;
      case "Star": return <Star className="w-5 h-5" />;
      case "Crown": return <Crown className="w-5 h-5" />;
      case "Share2": return <Share2 className="w-5 h-5" />;
      case "FileText": return <FileText className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    if (!id) {
      navigate("/forum");
      return;
    }

    const loadProfile = async () => {
      try {
        // 1. Muat data user
        const userDoc = await getDoc(doc(db, "users", id));
        if (!userDoc.exists()) {
          navigate("/forum");
          return;
        }

        const userData = { id: userDoc.id, ...userDoc.data() } as User;
        setUser(userData);

        // Calculate Completion Score (Simulated based on Profil.tsx logic)
        // Note: For public profile we just calculate based on existing data
        const fields = [
          userData.name,
          userData.bio,
          userData.institution,
          userData.city_region,
          userData.role,
          userData.experience_level,
          userData.tags?.join(" "),
          userData.social_media?.instagram,
          userData.social_media?.youtube,
          userData.social_media?.tiktok
        ];
        // Note: certificates length is not yet known here, will update later if needed or ignore for public view score
        const filled = fields.filter(f => f && String(f).trim().length > 0).length;
        const score = Math.round(((filled) / (fields.length + 1)) * 100); // simplified
        setCompletionScore(score);

        // 2. Muat sertifikat (Public only)
        const certQuery = query(
          collection(db, "certificates"),
          where("user_id", "==", id),
          where("public", "==", true)
        );
        const certSnapshot = await getDocs(certQuery);
        const certs = certSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Certificate[];

        setCertificates(certs);
      } catch (err) {
        console.error("Gagal memuat profil:", err);
        navigate("/forum");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [id, navigate]);

  useEffect(() => {
    if (!currentUser || !user) {
      setIsFriend(false);
      setLoadingFriend(false);
      return;
    }

    const checkFriendship = async () => {
      try {
        const friendDoc = await getDoc(doc(db, "friends", currentUser.id));
        if (friendDoc.exists()) {
          const data = friendDoc.data();
          setIsFriend(Array.isArray(data.friends) && data.friends.includes(user.id));
        } else {
          setIsFriend(false);
        }
      } catch (err) {
        console.error("Gagal cek pertemanan:", err);
        setIsFriend(false);
      } finally {
        setLoadingFriend(false);
      }
    };

    checkFriendship();
  }, [currentUser, user]);

  const addFriend = async () => {
    if (!currentUser || !user) return;
    try {
      await setDoc(
        doc(db, "friends", currentUser.id),
        {
          friends: arrayUnion(user.id),
        },
        { merge: true }
      );
      setIsFriend(true);
      showAlert("Berhasil menambahkan teman!", "success");
    } catch (err) {
      console.error("Gagal menambah teman:", err);
      showAlert("Gagal menambah teman. Coba lagi.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  const {
    name,
    bio = "",
    role = "Siswa",
    experience_level = "Intermediate",
    city_region = "Jakarta, Indonesia",
    institution = "",
    tags = [],
    social_media = {},
  } = user;

  const display = (value: string | null | undefined) => value || "–";

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-200 pb-20 overflow-x-hidden">
      {/* Background Particles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950" />
        <Particles
          particleCount={60}
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

      <div className="relative z-10 w-full mb-20 sm:mb-0">
        {/* Banner/Header */}
        <div className="relative h-32 sm:h-40 md:h-48 lg:h-64 bg-gradient-to-r from-blue-900 via-purple-900 to-slate-900 overflow-hidden">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 z-20 p-1 sm:p-1.5 md:p-2 bg-slate-900/50 backdrop-blur-md rounded-full text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </button>
          {user.banner_photo ? (
            <img
              src={user.banner_photo}
              alt="Banner"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
          )}
        </div>

        {/* Profile Info Overlay in Grid - Improved Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 -mt-16 sm:-mt-20 md:-mt-24 px-2 sm:px-3 md:px-4 items-start max-w-7xl mx-auto">

          {/* 1. Left Column (Profile & Achievements Desktop) */}
          <div className="lg:col-span-4 space-y-3 sm:space-y-4 md:space-y-6">
            {/* Profile Card */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-700/50 p-3 sm:p-4 md:p-6 shadow-2xl relative overflow-hidden">
              <div className="relative flex flex-col items-center mb-3 sm:mb-4 p-3 sm:p-4 md:p-6">
                <div className="relative">
                  {/* Completion Ring */}
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 136 136">
                    <circle
                      cx="68"
                      cy="68"
                      r="66"
                      fill="none"
                      stroke="rgba(71, 85, 105, 0.3)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="68"
                      cy="68"
                      r="66"
                      fill="none"
                      stroke="url(#gradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 66}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 66 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 66 * (1 - completionScore / 100) }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-slate-800 p-1 border-4 border-slate-800 shadow-xl overflow-hidden">
                    {user.profile_photo ? (
                      <img
                        src={user.profile_photo}
                        alt={name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white mt-3 sm:mt-4 text-center">{name}</h2>
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-slate-400 mt-1">
                  <span className="px-1.5 sm:px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-blue-500/20">{role}</span>
                  <span className="text-[10px] sm:text-xs md:text-sm">• {city_region}</span>
                </div>
              </div>

              <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 space-y-3 sm:space-y-4 pt-0 border-t border-slate-700/50">
                <div className="flex justify-between items-center py-1.5 sm:py-2 mt-3 sm:mt-4">
                  <span className="text-slate-400 text-xs sm:text-sm">Experience</span>
                  <span className="text-white font-medium text-xs sm:text-sm">{experience_level}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 sm:py-2">
                  {/* Assuming join date is not available in user object yet, static for now or fetch metadata in future */}
                  <span className="text-slate-400 text-xs sm:text-sm">Bergabung</span>
                  <span className="text-white font-medium text-xs sm:text-sm">Member</span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                  {(tags || []).map((tag, i) => (
                    <span key={i} className="px-2 sm:px-3 py-0.5 sm:py-1 bg-slate-700/50 rounded-full text-[10px] sm:text-xs text-slate-300">{tag}</span>
                  ))}
                </div>
              </div>

              {/* Add Friend Button Section */}
              {currentUser && currentUser.id !== user.id && (
                <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6 mt-1 sm:mt-2">
                  {loadingFriend ? (
                    <button disabled className="w-full py-1.5 sm:py-2 bg-slate-700/50 text-white rounded-lg sm:rounded-xl cursor-not-allowed text-xs sm:text-sm font-medium">
                      Loading...
                    </button>
                  ) : isFriend ? (
                    <button disabled className="w-full py-1.5 sm:py-2 bg-green-600/20 text-green-400 border border-green-500/30 rounded-lg sm:rounded-xl cursor-default text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 sm:gap-2">
                      <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Berteman
                    </button>
                  ) : (
                    <button
                      onClick={addFriend}
                      className="w-full py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg sm:rounded-xl transition-all shadow-lg shadow-blue-900/20 text-xs sm:text-sm font-medium"
                    >
                      + Tambah Teman
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Achievements Widget (Desktop) */}
            <div className="hidden lg:block bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-700/50 p-3 sm:p-4 md:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-bold text-white flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> Pencapaian
                </h3>
                <button
                  onClick={() => setShowAchievementsModal(true)}
                  className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {achievements.slice(0, 6).map((ach) => {
                  const Icon = getIcon(ach.icon);
                  return (
                    <div key={ach.id} className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-slate-900/40 rounded-lg sm:rounded-xl border border-slate-700/30 group hover:border-blue-500/30 transition-colors">
                      <div className={`p-1.5 sm:p-2 rounded-full ${ach.is_unlocked ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-700/50 text-slate-500'}`}>
                        {Icon}
                      </div>
                      <span className="text-[8px] sm:text-[10px] text-slate-400 text-center line-clamp-1 group-hover:text-amber-200">{ach.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Right Column (About, Social, Mobile Ach, Portfolio) */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            {/* About Me Section */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-700/50 p-4 sm:p-6 md:p-8 shadow-xl">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                <SparklesIcon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <h3 className="text-lg sm:text-xl font-bold text-white">Tentang Saya</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 block">Nama Lengkap</label>
                    <div className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-300">
                      {name}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 block">Bio Singkat</label>
                    <div className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-300 min-h-[60px] sm:min-h-[80px]">
                      {bio || "Tidak ada bio."}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 block">Institusi / Sekolah</label>
                    <div className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-300">
                      {institution || "–"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 block">Kota</label>
                      <div className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-300">
                        {city_region}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 sm:mb-1.5 block">Level</label>
                      <div className="w-full bg-slate-900/50 border border-slate-700 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-300">
                        {experience_level}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Showcase */}
            {(social_media.instagram || social_media.youtube || social_media.tiktok) && (
              <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-700/50 p-4 sm:p-6 md:p-8 shadow-xl">
                <div className="flex items-center gap-1.5 sm:gap-2 mb-4 sm:mb-6">
                  <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                  <h3 className="text-lg sm:text-xl font-bold text-white">Social Media</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {social_media.instagram && (
                    <motion.a
                      href={`https://instagram.com/${social_media.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-lg sm:rounded-xl border border-pink-500/20 hover:border-pink-500/40 transition-colors"
                    >
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg">
                        <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-400">Instagram</p>
                        <p className="text-xs sm:text-sm font-medium text-white truncate">{social_media.instagram}</p>
                      </div>
                    </motion.a>
                  )}
                  {social_media.youtube && (
                    <motion.a
                      href={`https://youtube.com/@${social_media.youtube.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg sm:rounded-xl border border-red-500/20 hover:border-red-500/40 transition-colors"
                    >
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg">
                        <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-400">YouTube</p>
                        <p className="text-xs sm:text-sm font-medium text-white truncate">{social_media.youtube}</p>
                      </div>
                    </motion.a>
                  )}
                  {social_media.tiktok && (
                    <motion.a
                      href={`https://tiktok.com/@${social_media.tiktok.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-lg sm:rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg">
                        <Twitch className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] sm:text-xs text-slate-400">TikTok</p>
                        <p className="text-xs sm:text-sm font-medium text-white truncate">{social_media.tiktok}</p>
                      </div>
                    </motion.a>
                  )}
                </div>
              </div>
            )}

            {/* Achievements Widget (Mobile) - Order: Profile->About->Social->Ach->Port */}
            <div className="block lg:hidden bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-700/50 p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-bold text-white flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base">
                  <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" /> Pencapaian
                </h3>
                <button
                  onClick={() => setShowAchievementsModal(true)}
                  className="text-[10px] sm:text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Lihat Semua
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {achievements.slice(0, 6).map((ach) => {
                  const Icon = getIcon(ach.icon);
                  return (
                    <div key={ach.id} className="flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 bg-slate-900/40 rounded-lg sm:rounded-xl border border-slate-700/30 group hover:border-blue-500/30 transition-colors">
                      <div className={`p-1.5 sm:p-2 rounded-full ${ach.is_unlocked ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-700/50 text-slate-500'}`}>
                        {Icon}
                      </div>
                      <span className="text-[8px] sm:text-[10px] text-slate-400 text-center line-clamp-1 group-hover:text-amber-200">{ach.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Portfolio Section */}
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-slate-700/50 p-4 sm:p-6 md:p-8 shadow-xl">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                    <h3 className="text-lg sm:text-xl font-bold text-white">Portofolio & Sertifikat</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">Sertifikat ditambahkan dari email terverifikasi</p>
                </div>
                <button
                  onClick={() => setShowCertificatesModal(true)}
                  className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
                >
                  Lihat Semua
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                {certificates.length === 0 ? (
                  <div className="col-span-full py-8 sm:py-10 md:py-12 text-center border-2 border-dashed border-slate-700/50 rounded-xl sm:rounded-2xl">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-600 mx-auto mb-2 sm:mb-3" />
                    <p className="text-slate-400 font-medium text-sm sm:text-base">Belum ada sertifikat</p>
                    <p className="text-slate-600 text-xs sm:text-sm">User belum memiliki sertifikat publik</p>
                  </div>
                ) : (
                  certificates.slice(0, 6).map((cert) => (
                    <div key={cert.id} onClick={() => setSelectedCertificate(cert)} className="group relative aspect-[4/3] bg-slate-900 rounded-lg sm:rounded-xl border border-slate-700/50 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                      <img src={cert.image_url || `https://via.placeholder.com/400x300?text=${cert.title}`} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-80" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                        <p className="text-white font-bold text-xs sm:text-sm line-clamp-1">{cert.title}</p>
                        <p className="text-slate-400 text-[10px] sm:text-xs line-clamp-1">{cert.competition_name}</p>
                      </div>
                      {cert.verified && (
                        <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2 bg-green-500 text-white text-[8px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-0.5 sm:gap-1 shadow-lg">
                          <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> Verified
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}
        <AnimatePresence>
          {/* Certificate Detail Modal */}
          {selectedCertificate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setSelectedCertificate(null)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
              >
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h3 className="font-bold text-white">Detail Sertifikat</h3>
                  <button onClick={() => setSelectedCertificate(null)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 overflow-y-auto">
                  <img src={selectedCertificate.image_url || `https://via.placeholder.com/600x400?text=${selectedCertificate.title}`} alt={selectedCertificate.title} className="w-full rounded-lg shadow-lg mb-6" />
                  <h2 className="text-2xl font-bold text-white mb-2">{selectedCertificate.title}</h2>
                  <p className="text-blue-400 font-medium mb-4">{selectedCertificate.competition_name}</p>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Status Verifikasi</p>
                      <div className="flex items-center gap-2">
                        {selectedCertificate.verified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-green-500 font-bold text-sm">Terverifikasi</span>
                          </>
                        ) : (
                          <span className="text-slate-400 text-sm">Belum terverifikasi</span>
                        )}
                      </div>
                    </div>
                    <div className="bg-slate-800/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">Diterbitkan</p>
                      <span className="text-white text-sm">{selectedCertificate.timing || "–"}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievements Modal */}
        <AnimatePresence>
          {showAchievementsModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowAchievementsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl max-h-[80vh] flex flex-col"
              >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-lg">
                      <Crown className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Semua Pencapaian</h3>
                      <p className="text-slate-400 text-xs">Koleksi lencana dan prestasi</p>
                    </div>
                  </div>
                  <button onClick={() => setShowAchievementsModal(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {achievements.map((ach) => {
                      const Icon = getIcon(ach.icon);
                      return (
                        <div key={ach.id} className={`flex flex-col items-center gap-3 p-4 rounded-xl border transition-all ${ach.is_unlocked ? 'bg-slate-800/50 border-amber-500/20' : 'bg-slate-900 border-slate-800 opacity-60 grayscale'}`}>
                          <div className={`p-4 rounded-full ${ach.is_unlocked ? 'bg-amber-500/10 text-amber-500 shadow-lg shadow-amber-500/10' : 'bg-slate-800 text-slate-600'}`}>
                            {ach.is_unlocked ? Icon : <Lock className="w-6 h-6" />}
                          </div>
                          <div className="text-center">
                            <h4 className={`font-bold text-sm mb-1 ${ach.is_unlocked ? 'text-white' : 'text-slate-500'}`}>{ach.name}</h4>
                            <p className="text-[10px] text-slate-400 line-clamp-2">{ach.description}</p>
                          </div>
                          {ach.is_unlocked && (
                            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 text-[10px] uppercase font-bold tracking-wider rounded-full">Unlocked</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Certificates Modal (View All) */}
        <AnimatePresence>
          {showCertificatesModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setShowCertificatesModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl max-h-[85vh] flex flex-col"
              >
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900 sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Award className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Semua Portofolio & Sertifikat</h3>
                      <p className="text-slate-400 text-xs">Total {certificates.length} sertifikat tersimpan</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCertificatesModal(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {certificates.map((cert) => (
                      <div key={cert.id} onClick={() => { setShowCertificatesModal(false); setSelectedCertificate(cert); }} className="group relative aspect-[4/3] bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden cursor-pointer hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/10">
                        <img src={cert.image_url || `https://via.placeholder.com/400x300?text=${cert.title}`} alt={cert.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent opacity-80" />
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <p className="text-white font-bold text-sm line-clamp-1">{cert.title}</p>
                          <p className="text-slate-400 text-xs line-clamp-1">{cert.competition_name}</p>
                        </div>
                        {cert.verified && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}