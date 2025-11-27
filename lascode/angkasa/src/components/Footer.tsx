import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="relative z-10 bg-slate-900/80 backdrop-blur-md border-t border-slate-700/50 pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-white">Angkasa</h3>
            <p className="text-slate-400 leading-relaxed">
              Platform terpercaya untuk menemukan informasi lomba dan beasiswa terbaik. Wujudkan mimpimu bersama Angkasa.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors text-slate-400">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors text-slate-400">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors text-slate-400">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-full hover:bg-primary hover:text-white transition-colors text-slate-400">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Tautan Cepat</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-slate-400 hover:text-primary transition-colors">Beranda</Link>
              </li>
              <li>
                <a href="#about" className="text-slate-400 hover:text-primary transition-colors">Tentang Kami</a>
              </li>
              <li>
                <Link to="/forum" className="text-slate-400 hover:text-primary transition-colors">Forum Diskusi</Link>
              </li>
              <li>
                <a href="#prinsip" className="text-slate-400 hover:text-primary transition-colors">Prinsip Kami</a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Kategori</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/forum?type=lomba" className="text-slate-400 hover:text-primary transition-colors">Info Lomba</Link>
              </li>
              <li>
                <Link to="/forum?type=beasiswa" className="text-slate-400 hover:text-primary transition-colors">Info Beasiswa</Link>
              </li>
              <li>
                <Link to="/forum?type=webinar" className="text-slate-400 hover:text-primary transition-colors">Webinar & Workshop</Link>
              </li>
              <li>
                <Link to="/forum?type=bootcamp" className="text-slate-400 hover:text-primary transition-colors">Bootcamp</Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Hubungi Kami</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-slate-400">
                <MapPin className="w-5 h-5 mt-0.5 text-primary shrink-0" />
                <span>Jl. Pendidikan No. 123, Jakarta Selatan, Indonesia</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-3 text-slate-400">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>info@angkasa.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center">
          <p className="text-slate-500">
            &copy; {new Date().getFullYear()} Angkasa. Hak Cipta Dilindungi Undang-Undang.
          </p>
        </div>
      </div>
    </footer>
  );
}
