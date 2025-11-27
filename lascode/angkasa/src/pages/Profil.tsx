// src/pages/Profile.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import DashboardHeader from "../components/DashboardHeader";
import {
  Camera,
  Trophy,
  Award,
  Star,
  Medal,
  HelpCircle,
  Settings,
  FileText,
  Lock,
  CheckCircle,
  Sparkles,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";


// Mock data (sesuai dengan struktur di kode Anda)
interface Certificate {
  id: string;
  title: string;
  competition_name: string;
  verified: boolean;
  image_url?: string; // Added image_url
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

const mockCertificates: Certificate[] = [
  {
    id: "1",
    title: "Sertifikat Juara 1 - Lomba Robotik ITB 2024",
    competition_name: "Lomba Robotik ITB 2024",
    verified: true,
    image_url: "https://via.placeholder.com/600x400?text=Sertifikat+Juara+1",
  },
  {
    id: "2",
    title: "Sertifikat Peserta - Webinar AI Nasional",
    competition_name: "Webinar AI Nasional",
    verified: true,
    image_url: "https://via.placeholder.com/600x400?text=Sertifikat+Peserta",
  },
  {
    id: "3",
    title: "Sertifikat Finalis - Hackathon 2023",
    competition_name: "Hackathon 2023",
    verified: true,
    image_url: "https://via.placeholder.com/600x400?text=Sertifikat+Finalis",
  },
  {
    id: "4",
    title: "Sertifikat Kompetensi - Web Development",
    competition_name: "BNSP",
    verified: true,
    image_url: "https://via.placeholder.com/600x400?text=Sertifikat+Kompetensi",
  },
  {
    id: "5",
    title: "Sertifikat Workshop - UI/UX Design",
    competition_name: "Design Summit",
    verified: true,
    image_url: "https://via.placeholder.com/600x400?text=Sertifikat+Workshop",
  },
];

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
    name: "Pemenang Pertama",
    description: "Menangkan 1 lomba tingkat nasional",
    icon: "Trophy",
    requirement_count: 1,
    requirement_type: "lomba",
    is_unlocked: true,
  },
  {
    id: "ach-003",
    name: "Pencari Beasiswa",
    description: "Terima 3 beasiswa",
    icon: "Award",
    requirement_count: 3,
    requirement_type: "beasiswa",
    is_unlocked: false,
  },
  {
    id: "ach-004",
    name: "Kontributor Aktif",
    description: "Buat 5 posting di forum",
    icon: "Medal",
    requirement_count: 5,
    requirement_type: "forum",
    is_unlocked: false,
  },
  {
    id: "ach-005",
    name: "Master Coding",
    description: "Selesaikan 10 tantangan koding",
    icon: "FileText",
    requirement_count: 10,
    requirement_type: "challenge",
    is_unlocked: false,
  },
];

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [certificates] = useState<Certificate[]>(mockCertificates);
  const [achievements] = useState<Achievement[]>(mockAchievements);

  // State for Modals
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setName(user.name || "");
    setEmail(user.email || "");
    setBio(user.bio || "");
  }, [user, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ name, email, bio });
      alert("✅ Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert("❌ Gagal memperbarui profil: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Trophy": return <Trophy className="w-6 h-6" />;
      case "Award": return <Award className="w-6 h-6" />;
      case "Star": return <Star className="w-6 h-6" />;
      case "Medal": return <Medal className="w-6 h-6" />;
      case "FileText": return <FileText className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      <DashboardHeader />

      <main className="container mx-auto px-4 sm:px-6 pt-24 max-w-4xl">
        <div className="flex flex-col items-center justify-center mb-10">
          <div className="rounded-xl border-2 border-slate-600/30 px-6 py-4 shadow-lg">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-300" />
              <h1 className="text-2xl font-bold text-slate-200">Profil</h1>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="bg-slate-800/30 backdrop-blur-md rounded-xl border border-slate-600/30 overflow-hidden">
          
          {/* Profile Section */}
          <div className="p-6 border-b border-slate-600/30">
            <div className="flex flex-col items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-slate-700/40 flex items-center justify-center border-4 border-slate-600/50">
                  <span className="text-4xl font-bold text-slate-200">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <button className="absolute bottom-2 right-2 p-2 bg-slate-600 hover:bg-slate-500 rounded-full text-white">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <div className="w-full max-w-md space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Bio</label>
                  <input
                    type="text"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Ceritakan tentang dirimu..."
                    className="w-full px-4 py-2.5 bg-slate-900/40 border border-slate-700/50 rounded-lg text-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-500"
                  />
                </div>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`w-full py-3 font-medium rounded-lg transition-colors ${
                    isSaving
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-slate-600 hover:bg-slate-500 text-white"
                  }`}
                >
                  {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <div className="p-6 border-b border-slate-600/30">
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer hover:text-white transition-colors group"
              onClick={() => setShowAllCertificates(true)}
            >
              <FileText className="w-5 h-5 text-slate-300 group-hover:text-white" />
              <h2 className="text-lg font-semibold text-slate-200 group-hover:text-white">Portofolio</h2>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            {certificates.length === 0 ? (
              <p className="text-slate-400 text-center py-4">Belum ada sertifikat terverifikasi</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {certificates.slice(0, 4).map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedCertificate(cert)}
                    className="aspect-square rounded-lg bg-slate-700/30 border border-slate-600/40 p-3 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-700/50 transition-colors"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                    <p className="text-xs text-slate-200 font-medium line-clamp-2">{cert.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="p-6 border-b border-slate-600/30">
            <div 
              className="flex items-center gap-2 mb-4 cursor-pointer hover:text-white transition-colors group"
              onClick={() => setShowAllAchievements(true)}
            >
              <Sparkles className="w-5 h-5 text-slate-300 group-hover:text-white" />
              <h2 className="text-lg font-semibold text-slate-200 group-hover:text-white">Pencapaian</h2>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {achievements.slice(0, 4).map((ach) => {
                const Icon = getIcon(ach.icon);
                return (
                  <div
                    key={ach.id}
                    onClick={() => {
                      if (!ach.is_unlocked) {
                        setSelectedAchievement(ach);
                      }
                    }}
                    className={`p-4 rounded-lg border flex flex-col items-center gap-2 transition-all ${
                      ach.is_unlocked
                        ? "bg-green-500/10 border-green-500/30"
                        : "bg-slate-700/20 border-slate-600/40 opacity-70 cursor-pointer hover:opacity-100 hover:bg-slate-700/30"
                    }`}
                  >
                    <div className="relative">
                      {!ach.is_unlocked && (
                        <Lock className="absolute inset-0 m-auto w-5 h-5 text-slate-500 z-10" />
                      )}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        ach.is_unlocked ? "bg-green-500/20" : "bg-slate-600/30"
                      }`}>
                        {Icon}
                      </div>
                    </div>
                    <span className={`text-xs font-medium text-center ${
                      ach.is_unlocked ? "text-slate-200" : "text-slate-500"
                    }`}>
                      {ach.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Menu */}
          <div className="p-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">FAQs</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors">
              <FileText className="w-5 h-5" />
              <span className="font-medium">Bantuan</span>
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-700/40 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Pengaturan</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}

      {/* Certificate Image Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedCertificate(null)}>
          <div className="relative bg-slate-800 rounded-xl max-w-3xl w-full p-2" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 p-2 bg-slate-700/50 hover:bg-slate-600 rounded-full text-white z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedCertificate.image_url} 
              alt={selectedCertificate.title} 
              className="w-full h-auto rounded-lg"
            />
            <div className="p-4 text-center">
              <h3 className="text-xl font-bold text-white">{selectedCertificate.title}</h3>
              <p className="text-slate-400">{selectedCertificate.competition_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* All Certificates Modal */}
      {showAllCertificates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowAllCertificates(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Semua Portofolio</h2>
              <button onClick={() => setShowAllCertificates(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id}
                    onClick={() => setSelectedCertificate(cert)}
                    className="aspect-square rounded-lg bg-slate-800 border border-slate-700 p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-700 transition-colors"
                  >
                    <CheckCircle className="w-8 h-8 text-green-400 mb-3" />
                    <p className="text-sm text-slate-200 font-medium line-clamp-3">{cert.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Requirement Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedAchievement(null)}>
          <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center">
                <Lock className="w-8 h-8 text-slate-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedAchievement.name}</h3>
                <p className="text-slate-300 mb-4">{selectedAchievement.description}</p>
                <div className="bg-slate-700/50 rounded-lg p-4 w-full">
                  <p className="text-sm text-slate-400 mb-1">Syarat Membuka:</p>
                  <p className="text-white font-medium">
                    {selectedAchievement.requirement_type === 'join' && `Bergabung dengan Angkasa`}
                    {selectedAchievement.requirement_type === 'lomba' && `Menangkan ${selectedAchievement.requirement_count} lomba tingkat nasional`}
                    {selectedAchievement.requirement_type === 'beasiswa' && `Terima ${selectedAchievement.requirement_count} beasiswa`}
                    {selectedAchievement.requirement_type === 'forum' && `Buat ${selectedAchievement.requirement_count} posting di forum`}
                    {selectedAchievement.requirement_type === 'challenge' && `Selesaikan ${selectedAchievement.requirement_count} tantangan koding`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAchievement(null)}
                className="mt-2 px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* All Achievements Modal */}
      {showAllAchievements && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setShowAllAchievements(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Semua Pencapaian</h2>
              <button onClick={() => setShowAllAchievements(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {achievements.map((ach) => {
                  const Icon = getIcon(ach.icon);
                  return (
                    <div
                      key={ach.id}
                      onClick={() => {
                        if (!ach.is_unlocked) {
                          setSelectedAchievement(ach);
                        }
                      }}
                      className={`p-4 rounded-lg border flex flex-col items-center gap-2 ${
                        ach.is_unlocked
                          ? "bg-green-500/10 border-green-500/30"
                          : "bg-slate-700/20 border-slate-600/40 opacity-70 cursor-pointer hover:opacity-100 hover:bg-slate-700/30"
                      }`}
                    >
                      <div className="relative">
                        {!ach.is_unlocked && (
                          <Lock className="absolute inset-0 m-auto w-5 h-5 text-slate-500 z-10" />
                        )}
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          ach.is_unlocked ? "bg-green-500/20" : "bg-slate-600/30"
                        }`}>
                          {Icon}
                        </div>
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        ach.is_unlocked ? "text-slate-200" : "text-slate-500"
                      }`}>
                        {ach.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}