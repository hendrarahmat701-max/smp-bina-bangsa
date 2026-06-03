import React, { useState } from 'react';
import { ChevronDown, Menu, X, Mail, Phone, MapPin, Facebook, Instagram, Twitter, ArrowRight, BookOpen } from 'lucide-react';
import { User, Sekolah, SosialMedia, Kontak, Menu as MenuType, Banner, Fasilitas, Ekskul, Guru, Prestasi, Galeri, Artikel, Jabatan, PPDB } from '../types';

interface LandingPageProps {
  sekolah: Sekolah;
  sosialMedia: SosialMedia[];
  kontak: Kontak[];
  menus: MenuType[];
  banners: Banner[];
  fasilitas: Fasilitas[];
  ekskul: Ekskul[];
  guru: Guru[];
  jabatan: Jabatan[];
  ppdb: PPDB[];
  prestasi: Prestasi[];
  galeri: Galeri[];
  artikel: Artikel[];
  pengaturan: any;
  currentUser: User | null;
  onNavigateToLogin: () => void;
  onNavigateToAdmin: () => void;
}

export default function LandingPage({
  sekolah,
  sosialMedia,
  kontak,
  menus,
  banners,
  fasilitas,
  ekskul,
  guru,
  jabatan,
  ppdb,
  prestasi,
  galeri,
  artikel,
  pengaturan,
  currentUser,
  onNavigateToLogin,
  onNavigateToAdmin,
}: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop Header */}
          <div className="hidden md:flex items-center justify-between h-24">
            {/* Logo & School Name */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <BookOpen size={28} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white leading-tight">SMP BINA BANGSA INDONESIA</h1>
                <p className="text-xs text-slate-400">NPSN: {sekolah.npsn} • TERAKREDITASI {sekolah.akreditasi}</p>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="flex items-center gap-8">
              <a href="#beranda" className="text-slate-300 hover:text-white transition font-medium text-sm">Beranda</a>
              <div className="group relative">
                <button className="text-slate-300 hover:text-white transition font-medium text-sm flex items-center gap-1">
                  Profil <ChevronDown size={16} className="group-hover:rotate-180 transition" />
                </button>
                <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-white/10 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <a href="#profil-sekolah" className="block px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white text-sm">Profil Sekolah</a>
                  <a href="#visi-misi" className="block px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white text-sm">Visi & Misi</a>
                  <a href="#guru-staff" className="block px-4 py-2 hover:bg-white/5 text-slate-300 hover:text-white text-sm">Guru & Staff</a>
                </div>
              </div>
              <a href="#fasilitas" className="text-slate-300 hover:text-white transition font-medium text-sm">Fasilitas</a>
              <a href="#ekstrakurikuler" className="text-slate-300 hover:text-white transition font-medium text-sm">Ekstrakurikuler</a>
              <a href="#galeri" className="text-slate-300 hover:text-white transition font-medium text-sm">Galeri</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              {currentUser ? (
                <button
                  onClick={onNavigateToAdmin}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
                >
                  Panel Admin
                </button>
              ) : (
                <button
                  onClick={onNavigateToLogin}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
                >
                  Login
                </button>
              )}
            </div>
          </div>

          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <BookOpen size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xs font-bold text-white">SMP BINA BANGSA</h1>
                <p className="text-[10px] text-slate-400">Indonesia</p>
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 hover:bg-white/5 rounded-lg border border-white/10 text-slate-300">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-slate-900/50 border-t border-white/10">
              <div className="px-4 py-4 space-y-3">
                <a href="#beranda" className="block text-slate-300 hover:text-white transition py-2 font-medium text-sm">Beranda</a>
                <button
                  onClick={() => setExpandedMenu(expandedMenu === 'profil' ? null : 'profil')}
                  className="w-full flex items-center justify-between text-slate-300 hover:text-white transition py-2 font-medium text-sm"
                >
                  Profil <ChevronDown size={16} className={`transform ${expandedMenu === 'profil' ? 'rotate-180' : ''}`} />
                </button>
                {expandedMenu === 'profil' && (
                  <div className="ml-4 space-y-2">
                    <a href="#profil-sekolah" className="block text-slate-400 hover:text-slate-200 transition py-1 text-xs">Profil Sekolah</a>
                    <a href="#visi-misi" className="block text-slate-400 hover:text-slate-200 transition py-1 text-xs">Visi & Misi</a>
                    <a href="#guru-staff" className="block text-slate-400 hover:text-slate-200 transition py-1 text-xs">Guru & Staff</a>
                  </div>
                )}
                <a href="#fasilitas" className="block text-slate-300 hover:text-white transition py-2 font-medium text-sm">Fasilitas</a>
                <a href="#ekstrakurikuler" className="block text-slate-300 hover:text-white transition py-2 font-medium text-sm">Ekstrakurikuler</a>
                <a href="#galeri" className="block text-slate-300 hover:text-white transition py-2 font-medium text-sm">Galeri</a>
                <hr className="border-white/10 my-3" />
                {currentUser ? (
                  <button
                    onClick={onNavigateToAdmin}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
                  >
                    Panel Admin
                  </button>
                ) : (
                  <button
                    onClick={onNavigateToLogin}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm"
                  >
                    Login
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Selamat Datang di {sekolah.nama}</h2>
          <p className="text-lg text-slate-300 mb-8">Membangun Generasi Cerdas, Mandiri, dan Berkarakter Mulia</p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:border-blue-500/30 transition">
            <BookOpen className="text-blue-400 mb-3" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Inovasi Pembelajaran</h3>
            <p className="text-sm text-slate-400">Metode pembelajaran modern dan interaktif</p>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:border-cyan-500/30 transition">
            <Mail className="text-cyan-400 mb-3" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Fasilitas Lengkap</h3>
            <p className="text-sm text-slate-400">Sarana belajar yang memadai dan modern</p>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:border-green-500/30 transition">
            <Phone className="text-green-400 mb-3" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Komunitas Belajar</h3>
            <p className="text-sm text-slate-400">Lingkungan yang mendukung pertumbuhan siswa</p>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-lg p-6 hover:border-purple-500/30 transition">
            <MapPin className="text-purple-400 mb-3" size={32} />
            <h3 className="text-lg font-bold text-white mb-2">Akreditasi A</h3>
            <p className="text-sm text-slate-400">Terakreditasi penuh oleh pemerintah</p>
          </div>
        </div>

        {/* School Info */}
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/20 rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-white mb-4">Tentang Sekolah</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-slate-300 mb-4">{sekolah.nama} adalah sekolah menengah pertama yang berkomitmen memberikan pendidikan berkualitas tinggi dengan pembentukan karakter yang kuat.</p>
              <ul className="space-y-2 text-slate-400">
                <li><strong className="text-white">Kepala Sekolah:</strong> {sekolah.kepala_sekolah}</li>
                <li><strong className="text-white">Alamat:</strong> {sekolah.alamat}</li>
                <li><strong className="text-white">Tahun Berdiri:</strong> {sekolah.tahun_berdiri}</li>
                <li><strong className="text-white">Status:</strong> {sekolah.status}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-3">Visi</h4>
              <p className="text-slate-300 mb-6 italic">{sekolah.visi}</p>
              <h4 className="text-lg font-bold text-white mb-3">Misi</h4>
              <ul className="space-y-2 text-slate-400">
                {sekolah.misi?.map((m, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-white/10 mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">SMP Bina Bangsa Indonesia</h3>
              <p className="text-sm text-slate-400">Membangun generasi penerus bangsa yang berkualitas dan berkarakter.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Navigasi</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="#beranda" className="hover:text-white transition">Beranda</a></li>
                <li><a href="#fasilitas" className="hover:text-white transition">Fasilitas</a></li>
                <li><a href="#ekstrakurikuler" className="hover:text-white transition">Ekstrakurikuler</a></li>
                <li><a href="#galeri" className="hover:text-white transition">Galeri</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Informasi</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>NPSN: {sekolah.npsn}</li>
                <li>Status: {sekolah.status}</li>
                <li>Akreditasi: {sekolah.akreditasi}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Hubungi Kami</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex gap-2"><Phone size={16} /> {sekolah.telepon}</li>
                <li className="flex gap-2"><Mail size={16} /> {sekolah.email}</li>
                <li className="flex gap-2"><MapPin size={16} /> {sekolah.alamat}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            <p>{pengaturan?.footer_text || '© 2026 SMP Bina Bangsa Indonesia. All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
