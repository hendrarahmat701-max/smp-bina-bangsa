import React, { useState, useEffect } from 'react';
import { 
  Laptop, BookOpen, Compass, Trophy, Image as ImageIcon, MapPin, Phone, Mail, 
  Clock, X, ArrowRight, ArrowLeft, ChevronDown, Menu as MenuIcon, Calendar, 
  Youtube, Facebook, Instagram, Twitter, School
} from 'lucide-react';
import { 
  Sekolah, SosialMedia, Kontak, Menu, Banner, 
  Fasilitas, Ekskul, Guru, Prestasi, Galeri, Artikel,
  Jabatan, PPDB
} from '../types';

interface LandingPageProps {
  sekolah: Sekolah;
  sosialMedia: SosialMedia[];
  kontak: Kontak[];
  menus: Menu[];
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
  currentUser: any;
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
  onNavigateToAdmin
}: LandingPageProps) {
  const [heroIndex, setHeroIndex] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [selectedVideo, setSelectedVideo] = useState<Galeri | null>(null);
  const [selectedArtikel, setSelectedArtikel] = useState<Artikel | null>(null);

  // PPDB Form states
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [ppdbForm, setPpdbForm] = useState({
    nama: '',
    nik: '',
    nisn: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    gender: 'Laki-laki',
    nama_wali: '',
    kontak_wali: '',
    alamat: '',
    sekolah_asal: ''
  });
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [regId, setRegId] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmitPendaftaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ppdbForm.nama || !ppdbForm.nik || !ppdbForm.tempat_lahir || !ppdbForm.tanggal_lahir || !ppdbForm.nama_wali || !ppdbForm.kontak_wali) {
      setFormError('Harap penuhi semua Isian Wajib (*)');
      return;
    }
    setFormError('');
    setIsSubmitting(true);
    const id = `PPDB-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/pendaftaran-ppdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ppdbForm,
          id
        })
      });
      if (res.ok) {
        setRegId(id);
        setRegistrationSuccess(true);
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || 'Terjadi kesalahan saat mengirim pendaftaran berkas.');
      }
    } catch {
      setFormError('Sistem server offline atau bermasalah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Auto-slide for hero banners
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners]);

  // Synchronize browser tab favicon
  useEffect(() => {
    if (sekolah.favicon) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'shortcut icon';
      link.href = sekolah.favicon;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  }, [sekolah.favicon]);

  const activeMenus = menus.filter(m => m.is_active === 1 && m.parent_id === null);

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Decorative Aurora Glow Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600 rounded-full blur-[180px] opacity-25 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[200px] opacity-15 pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-emerald-500 rounded-full blur-[160px] opacity-15 pointer-events-none"></div>

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 w-full px-4 lg:px-8 py-3.5 bg-slate-950/75 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            {sekolah.logo ? (
              <img src={sekolah.logo} alt="School Logo" referrerPolicy="no-referrer" className="w-10 h-10 object-contain rounded-xl border border-white/10 p-0.5 bg-slate-900 shadow-lg" />
            ) : (
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
                <School className="text-white w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-sm lg:text-base font-extrabold tracking-tight text-white uppercase">{sekolah.nama || 'SMP Bina Bangsa'}</h1>
              <p className="text-[10px] text-indigo-400 font-bold tracking-[0.15em] uppercase">NPSN: {sekolah.npsn} • TERAKREDITASI {sekolah.akreditasi}</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {activeMenus.map(menu => {
              const subItems = menus.filter(sub => sub.parent_id === menu.id && sub.is_active === 1);
              if (subItems.length > 0) {
                return (
                  <div key={menu.id} className="relative group">
                    <button className="flex items-center gap-1 text-sm font-semibold text-slate-300 hover:text-white transition-colors py-2">
                      {menu.label} <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-300" />
                    </button>
                    <div className="absolute left-0 mt-1 w-48 bg-slate-900 border border-white/10 rounded-xl p-2 hidden group-hover:block backdrop-blur-xl shadow-xl">
                      {subItems.map(sub => (
                        <a key={sub.id} href={sub.url} className="block px-4 py-2 hover:bg-white/10 text-xs rounded-lg text-slate-300 hover:text-white transition-colors">
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  </div>
                );
              }
              return (
                <a key={menu.id} href={menu.url} className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                  {menu.label}
                </a>
              );
            })}
          </nav>

          {/* Header Action Button (Navigation between worlds) */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <button 
                onClick={onNavigateToAdmin}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <School size={14} /> Ke Panel Backend
              </button>
            ) : (
              <button 
                onClick={onNavigateToLogin}
                className="px-4 py-2 bg-white/5 hover:bg-white/15 border border-white/10 rounded-xl text-xs font-bold text-slate-100 transition-all cursor-pointer"
              >
                Masuk Operator
              </button>
            )}

            {/* Mobile Navigation Toggle */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 md:hidden hover:bg-white/5 rounded-lg border border-white/10 text-slate-300">
              <MenuIcon size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="fixed top-[65px] left-0 right-0 z-30 bg-slate-900 border-b border-white/15 p-4 flex flex-col gap-3 md:hidden backdrop-blur-2xl">
          {activeMenus.map(menu => (
            <div key={menu.id} className="flex flex-col">
              <a href={menu.url} onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-100 py-2 border-b border-white/5">
                {menu.label}
              </a>
              {menus.filter(sub => sub.parent_id === menu.id && sub.is_active === 1).map(sub => (
                <a key={sub.id} href={sub.url} onClick={() => setMobileMenuOpen(false)} className="text-xs text-indigo-300 pl-4 py-1.5">
                  → {sub.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* MAIN BODY LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        
        {/* HERO CAROUSEL */}
        <section id="home" className="mb-12 relative h-[380px] lg:h-[480px] rounded-3xl overflow-hidden border border-white/10 bg-slate-900">
          {banners.length > 0 ? (
            banners.map((item, idx) => (
              <div 
                key={item.id} 
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col justify-end p-8 lg:p-14 ${idx === heroIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                {/* Background image overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center" 
                  style={{ backgroundImage: `linear-gradient(to top, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.2)), url(${item.gambar})` }}
                ></div>

                <div className="relative z-20 max-w-2xl">
                  <span className="px-3.5 py-1 bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest rounded-full border border-indigo-500/30">
                    PROGRAM UNGGULAN
                  </span>
                  <h2 className="text-2xl lg:text-5xl font-extrabold tracking-tight mt-3 text-white leading-tight">
                    {item.judul}
                  </h2>
                  <p className="text-slate-300 text-xs lg:text-sm mt-3 leading-relaxed font-medium">
                    {item.subjudul}
                  </p>
                  <div className="mt-6">
                    <a 
                      href={item.tombol_link} 
                      className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      {item.tombol_teks || 'Jelajahi'} <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-950/40 to-slate-900">
              <School className="text-indigo-400 w-12 h-12 mb-3 animate-pulse" />
              <h2 className="text-xl font-bold">Selamat Datang di {sekolah.nama || 'SMP Bina Bangsa Indonesia'}</h2>
              <p className="text-slate-400 text-xs text-center max-w-md mt-2">Daftarkan & kelola Banner Slider melalui panel admin untuk merancang beranda website sekolah Anda.</p>
            </div>
          )}

          {/* Slide Navigation Controls */}
          {banners.length > 1 && (
            <div className="absolute bottom-6 right-6 z-20 flex gap-2">
              <button 
                onClick={() => setHeroIndex(prev => (prev - 1 + banners.length) % banners.length)}
                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all"
              >
                <ArrowLeft size={14} />
              </button>
              <button 
                onClick={() => setHeroIndex(prev => (prev + 1) % banners.length)}
                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all"
              >
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </section>

        {/* PROFILE & VISI MISI */}
        <section id="profil" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          
          {/* Main Profile Display Card */}
          <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <School size={160} />
            </div>
            
            <div>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-3 py-1 rounded-full border border-emerald-500/35 uppercase">
                Sekolah Unggulan
              </span>
              <h3 className="text-xl font-extrabold text-white mt-4">{sekolah.nama}</h3>
              <p className="text-slate-400 text-xs mt-2 italic leading-relaxed">
                "Kami berkomitmen membina calon generasi emas masa depan dengan kurikulum berbasis IPTEK inovatif dan bimbingan kepemimpinan berakhlak mulia."
              </p>

              {/* Attributes Meta */}
              <div className="mt-6 space-y-3">
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-medium">Kepala Sekolah</span>
                  <span className="text-white font-bold">{sekolah.kepala_sekolah}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-medium">NPSN</span>
                  <span className="text-white font-mono font-bold">{sekolah.npsn}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-white/5 pb-2">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className="text-indigo-300 font-bold">{sekolah.status}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Tahun Berdiri</span>
                  <span className="text-white font-bold">{sekolah.tahun_berdiri}</span>
                </div>
              </div>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 gap-3 mt-6">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Staf Akademik</p>
                <p className="text-lg font-bold text-indigo-300 mt-1">{guru.length || 4} Guru</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Prestasi</p>
                <p className="text-lg font-bold text-emerald-300 mt-1">{prestasi.length || 3} Medali</p>
              </div>
            </div>
          </div>

          {/* Visi Misi Card */}
          <div id="visi-misi" className="lg:col-span-2 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl border border-white/10 rounded-3xl p-6 lg:p-8">
            <h3 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-300">
              Visi & Operasional Sekolah
            </h3>
            
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visi Kami</p>
              <div className="mt-2 p-4 bg-white/5 border border-white/10 rounded-2xl">
                <p className="text-sm font-semibold text-white leading-relaxed">
                  "{sekolah.visi}"
                </p>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Misi Unggulan</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sekolah.misi && sekolah.misi.length > 0 ? (
                  sekolah.misi.map((m, idx) => (
                    <div key={idx} className="flex gap-3 bg-slate-900/40 p-3 rounded-xl border border-white/5">
                      <div className="w-6 h-6 bg-indigo-500/20 rounded-lg flex items-center justify-center text-xs font-extrabold text-indigo-400 shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">{m}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400">Belum diatur.</p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FACILITIES */}
        <section id="fasilitas" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white">Fasilitas Belajar Modern</h3>
            <p className="text-xs text-slate-400 mt-1">Prasarana penunjang kenyamanan belajar siswa.</p>
          </div>

          {fasilitas.filter(f => f.is_active === 1).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fasilitas.filter(f => f.is_active === 1).map(item => (
                <div key={item.id} className="bg-slate-900/40 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all group">
                  <div className="h-44 bg-slate-800 relative overflow-hidden">
                    {item.gambar ? (
                      <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-950/20 text-indigo-300">
                        <Laptop size={32} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 p-2 bg-slate-950/85 border border-white/10 rounded-xl backdrop-blur-md">
                      <BookOpen size={16} className="text-indigo-400" />
                    </div>
                  </div>
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.judul}</h4>
                    <p className="text-slate-400 text-xs mt-2 leading-relaxed">{item.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Belum ada fasilitas yang dimasukkan.</p>
          )}
        </section>

        {/* EXTRACURRICULARS */}
        <section id="ekskul" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white">Ekstrakurikuler Pilihan</h3>
            <p className="text-xs text-slate-400 mt-1">Mengasah bakat minat dan potensi non-akademik murid.</p>
          </div>

          {ekskul.filter(e => e.is_active === 1).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {ekskul.filter(e => e.is_active === 1).map(item => (
                <div key={item.id} className="bg-slate-900/30 border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all flex gap-4">
                  <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center shrink-0">
                    <Compass size={20} className="text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-tight">{item.judul}</h4>
                    <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">{item.deskripsi}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Belum ada ekstrakurikuler yang dimasukkan.</p>
          )}
        </section>

        {/* TEACHERS */}
        <section id="guru" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white">Tenaga Pendidik Terbaik</h3>
            <p className="text-xs text-slate-400 mt-1">Mengabdi untuk mewujudkan putra-putri berilmu tinggi.</p>
          </div>

          {guru.filter(g => g.is_active === 1).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {guru.filter(g => g.is_active === 1).map(item => (
                <div key={item.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border bg-slate-900 flex items-center justify-center mb-3 text-white text-lg font-bold overflow-hidden">
                    {item.foto ? <img src={item.foto} alt={item.nama} className="w-full h-full object-cover" /> : item.nama.slice(0, 2).toUpperCase()}
                  </div>
                  <h4 className="text-xs font-bold text-white leading-snug">{item.nama}</h4>
                  <p className="text-[10px] text-indigo-400 font-bold mt-1 uppercase tracking-wider">{item.jabatan}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">{item.mapel}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Belum ada data guru dimasukkan.</p>
          )}
        </section>

        {/* STRUKTUR ORGANISASI */}
        <section id="struktur" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white">Struktur Organisasi Sekolah</h3>
            <p className="text-xs text-slate-400 mt-1">Silsilah kepengurusan pimpinan, lembaga, tata usaha, serta tenaga pengajar.</p>
          </div>

          <div className="bg-slate-900/40 border border-white/10 p-6 lg:p-8 rounded-3xl space-y-10 relative overflow-hidden backdrop-blur-md">
            {/* Decorative Aurora glow behind hierarchy */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            {/* LEVEL 1: Yayasan */}
            <div className="space-y-4 relative z-10">
              <div className="text-center">
                <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-extrabold tracking-widest uppercase rounded-full shadow-sm">
                  Lembaga / Yayasan
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {jabatan.filter(j => j.tingkat === 1 && j.is_active === 1).map(jab => {
                  const members = guru.filter(g => g.is_active === 1 && g.jabatan_id === jab.id);
                  if (members.length === 0) return null;
                  return members.map(m => (
                    <div key={m.id} className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 text-center w-56 hover:border-indigo-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center shadow-xl">
                      <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden mb-3 border-2 border-indigo-500/30 shadow-md">
                        {m.foto ? (
                          <img src={m.foto} alt={m.nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-indigo-600/20 text-indigo-300 font-bold text-lg">
                            {m.nama.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{m.nama}</h4>
                      <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-1">{jab.nama}</p>
                      {m.kontak && (
                        <a href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-2.5 text-[10px] text-indigo-300 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                          <Phone size={10} /> Hubungi
                        </a>
                      )}
                    </div>
                  ));
                })}
              </div>
            </div>

            {/* LEVEL 2: Pimpinan Sekolah */}
            <div className="space-y-4 border-t border-white/5 pt-8 relative z-10">
              <div className="text-center">
                <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/25 text-blue-300 text-[10px] font-extrabold tracking-widest uppercase rounded-full shadow-sm">
                  Pimpinan Sekolah & Administrasi
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {jabatan.filter(j => j.tingkat === 2 && j.is_active === 1).map(jab => {
                  const isKepSek = jab.id === 2 || jab.nama.toLowerCase().includes('kepala sekolah');
                  const members = guru.filter(g => g.is_active === 1 && g.jabatan_id === jab.id);
                  
                  if (members.length === 0) {
                    if (isKepSek) {
                      // Fallback: render Kepala Sekolah directly from sekolah.kepala_sekolah to avoid empty / dummy mismatch
                      return (
                        <div key="kepsek_fallback" className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 text-center w-56 hover:border-blue-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center shadow-xl">
                          <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden mb-3 border-2 border-blue-500/30 shadow-md flex items-center justify-center">
                            <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-300 font-bold text-lg">
                              {(sekolah.kepala_sekolah || 'K').charAt(0)}
                            </div>
                          </div>
                          <h4 className="text-xs font-bold text-white line-clamp-1">{sekolah.kepala_sekolah || 'Belum diisi'}</h4>
                          <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1">{jab.nama}</p>
                        </div>
                      );
                    }
                    return null;
                  }
                  
                  return members.map(m => {
                    const displayName = isKepSek ? (sekolah.kepala_sekolah || m.nama) : m.nama;
                    return (
                      <div key={m.id} className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 text-center w-56 hover:border-blue-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center shadow-xl">
                        <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden mb-3 border-2 border-blue-500/30 shadow-md">
                          {m.foto ? (
                            <img src={m.foto} alt={displayName} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-blue-600/20 text-blue-300 font-bold text-lg">
                              {displayName.charAt(0)}
                            </div>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-white line-clamp-1">{displayName}</h4>
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mt-1">{jab.nama}</p>
                        {m.kontak && (
                          <a href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-2.5 text-[10px] text-blue-300 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            <Phone size={10} /> Hubungi
                          </a>
                        )}
                      </div>
                    );
                  });
                })}
              </div>
            </div>

            {/* LEVEL 3: Pelaksana Pendidik / Wali Kelas / TU */}
            <div className="space-y-4 border-t border-white/5 pt-8 relative z-10">
              <div className="text-center">
                <span className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[10px] font-extrabold tracking-widest uppercase rounded-full shadow-sm">
                  Komite Guru & Pelaksana Kerja
                </span>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {jabatan.filter(j => j.tingkat === 3 && j.is_active === 1).map(jab => {
                  const members = guru.filter(g => g.is_active === 1 && g.jabatan_id === jab.id);
                  if (members.length === 0) return null;
                  return members.map(m => (
                    <div key={m.id} className="bg-slate-950/60 p-5 rounded-2xl border border-white/10 text-center w-56 hover:border-emerald-500/40 hover:scale-[1.02] transition-all duration-300 flex flex-col items-center shadow-xl">
                      <div className="w-16 h-16 rounded-full bg-slate-800 overflow-hidden mb-3 border-2 border-emerald-500/30 shadow-md">
                        {m.foto ? (
                          <img src={m.foto} alt={m.nama} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-600/20 text-emerald-300 font-bold text-lg">
                            {m.nama.charAt(0)}
                          </div>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">{m.nama}</h4>
                      <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider mt-1">{jab.nama}</p>
                      {m.mapel && <p className="text-[9px] text-slate-400 mt-1.5">Mapel: <span className="text-slate-300">{m.mapel}</span></p>}
                      {m.wali_kelas && <p className="text-[9px] text-indigo-300 font-medium">Wali Kelas: {m.wali_kelas}</p>}
                      {m.kontak && (
                        <a href={`https://wa.me/${m.kontak.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="mt-2.5 text-[10px] text-emerald-300 hover:text-white flex items-center gap-1 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                          <Phone size={10} /> Hubungi
                        </a>
                      )}
                    </div>
                  ));
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ACHIEVEMENTS */}
        <section id="prestasi" className="mb-12 scroll-mt-20">
          <div className="bg-slate-900/40 p-6 lg:p-8 border border-white/10 rounded-3xl">
            <div className="mb-6">
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Trophy className="text-amber-400" size={20} /> Kebanggaan Prestasi Kami
              </h3>
              <p className="text-slate-400 text-xs mt-1">Sertifikasi kemandirian & prestasi perlombaan.</p>
            </div>

            {prestasi.filter(p => p.is_active === 1).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {prestasi.filter(p => p.is_active === 1).map(item => (
                  <div key={item.id} className="bg-slate-950/60 p-5 rounded-2xl border border-white/15 flex flex-col md:flex-row gap-4">
                    {item.gambar && (
                      <div className="w-full md:w-32 h-32 rounded-xl bg-slate-800 overflow-hidden shrink-0">
                        <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <span className="px-2.5 py-0.5 bg-yellow-500/20 text-yellow-300 text-[9px] font-bold rounded-full border border-yellow-500/35">
                        Tahun {item.tahun}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-2 leading-snug">{item.judul}</h4>
                      <p className="text-slate-400 text-xs mt-2 leading-relaxed">{item.deskripsi}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">Belum ada prestasi dimasukkan.</p>
            )}
          </div>
        </section>

        {/* RECRUITMENT PPDB SECTION */}
        <section id="ppdb" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white">Penerimaan Peserta Didik Baru (PPDB)</h3>
            <p className="text-xs text-slate-400 mt-1">Pendaftaran online calon siswa baru untuk jaminan pendidikan berkualitas tinggi.</p>
          </div>

          {(() => {
            const activePPDB = ppdb.find(p => p.is_active === 1);
            if (activePPDB) {
              return (
                <div className="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 lg:p-10 rounded-3xl relative overflow-hidden backdrop-blur-md shadow-lg shadow-indigo-500/5">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                    <div className="lg:col-span-7 space-y-4">
                      <div className="flex flex-wrap gap-2.5">
                        <span className="px-3 py-1 bg-emerald-500/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wide rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Pendaftaran Online Dibuka
                        </span>
                        <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/35 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wide rounded-full">
                          Tahun Ajaran {activePPDB.tahun_ajaran}
                        </span>
                      </div>

                      <h4 className="text-xl lg:text-3xl font-extrabold text-white leading-tight">
                        Penerimaan Gelombang {activePPDB.gelombang}
                      </h4>

                      <p className="text-slate-300 text-xs lg:text-sm leading-relaxed max-w-xl">
                        {activePPDB.keterangan || `SMP Bina Bangsa kembali merancang pembukaan portal penerimaan siswa baru Gelombang ke-${activePPDB.gelombang}. Dapatkan kesempatan bergabung dengan ekosistem belajar digital.`}
                      </p>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">Mulai Tanggal</p>
                          <p className="text-xs font-bold text-white mt-0.5">{activePPDB.mulai}</p>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">Penutupan</p>
                          <p className="text-xs font-bold text-white mt-0.5">{activePPDB.selesai}</p>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">Kuota Tersisa</p>
                          <p className="text-xs font-bold text-indigo-300 mt-0.5">{activePPDB.kuota} Kursi</p>
                        </div>
                        <div className="bg-slate-950/50 p-3 rounded-xl border border-white/5">
                          <p className="text-[10px] text-slate-400 font-medium font-mono uppercase">Biaya Registrasi</p>
                          <p className="text-xs font-bold text-emerald-400 mt-0.5">GRATIS</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-5 space-y-4 lg:pl-4">
                      <div className="bg-slate-950/40 p-5 rounded-2xl border border-white/10 space-y-3.5 backdrop-blur-sm">
                        <h5 className="text-[10px] font-extrabold text-white uppercase tracking-wider font-mono">Tautan Registrasi</h5>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Penuhi syarat administratif dan isi formulir pendaftaran digital di bawah, atau ajukan pertanyaan panitia humas via WhatsApp.
                        </p>
                        <div className="flex flex-col gap-2 pt-1.5">
                          <button
                            onClick={() => {
                              setRegistrationSuccess(false);
                              setFormError('');
                              setPpdbForm({
                                nama: '', nik: '', nisn: '', tempat_lahir: '', tanggal_lahir: '',
                                gender: 'Laki-laki', nama_wali: '', kontak_wali: '', Alamat: '', asalSekolah: ''
                              } as any);
                              setIsRegistering(true);
                            }}
                            className="w-full text-center py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold tracking-wide transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
                          >
                            Unggah Data (Formulir Online)
                          </button>
                          
                          {activePPDB.link_pendaftaran && (
                            <a
                              href={activePPDB.link_pendaftaran}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-center py-3 bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 rounded-xl text-xs font-bold transition-all block"
                            >
                              Situs Eksternal / Google Form
                            </a>
                          )}

                          {activePPDB.kontak_wa && (
                            <a
                              href={`https://wa.me/${activePPDB.kontak_wa.replace(/[^0-9]/g, '')}?text=Halo%20Panitia%20PPDB%20SMP%20Bina%20Bangsa%2C%20saya%20ingin%20bertanya%20mengenai%20Penerimaan%20Siswa%20Baru.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full text-center py-3 bg-emerald-600/20 hover:bg-emerald-600/35 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                            >
                              <Phone size={13} className="text-emerald-400" /> WhatsApp Panitia PPDB
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="bg-slate-900/10 border border-white/10 p-8 rounded-3xl text-center flex flex-col items-center justify-center">
                  <span className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 mb-3 block">
                    <Calendar size={22} />
                  </span>
                  <h4 className="text-sm font-bold text-white">Akses Pendaftaran PPDB Ditutup</h4>
                  <p className="text-slate-400 text-xs max-w-md mt-1.5 leading-relaxed">
                    Sesi PPDB untuk ajaran pendaftaran tahun ini telah rampung atau belum dibuka secara resmi. Silakan hubungi unit humas sekolah untuk prosedur manual.
                  </p>
                </div>
              );
            }
          })()}
        </section>

        {/* GALLERY */}
        <section id="galeri" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white">Galeri Kegiatan Sekolah</h3>
            <p className="text-xs text-slate-400 mt-1">Momentum terindah dalam perjalanan mendidik anak bangsa.</p>
          </div>

          {galeri.filter(g => g.is_active === 1).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {galeri.filter(g => g.is_active === 1).map(item => (
                <div 
                  key={item.id} 
                  onClick={() => { if (item.tipe !== 'image') setSelectedVideo(item); }}
                  className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden group relative cursor-pointer"
                >
                  <div className="h-40 bg-slate-800 relative">
                    <img src={item.gambar} alt={item.judul} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {item.tipe !== 'image' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                        <span className="p-3 bg-red-600 rounded-full animate-pulse shadow-lg"><Youtube size={18} /></span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-900/90 text-xs font-semibold text-slate-200">
                    {item.judul}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Belum ada item galeri dimasukkan.</p>
          )}
        </section>

        {/* NEWS / ARTICLES */}
        <section id="artikel" className="mb-12 scroll-mt-20">
          <div className="mb-6">
            <h3 className="text-xl font-extrabold text-white">Kabar & Informasi Terkini</h3>
            <p className="text-xs text-slate-400 mt-1">Pemberitahuan terkini, agenda penting, dan laporan kegiatan pasca sekolah.</p>
          </div>

          {artikel.filter(a => a.status === 'publish').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artikel.filter(a => a.status === 'publish').map(art => (
                <div key={art.id} className="bg-slate-900/50 rounded-3xl p-6 border border-white/10 flex flex-col md:flex-row gap-5">
                  {art.gambar && (
                    <div className="w-full md:w-44 h-40 rounded-2xl bg-slate-800 overflow-hidden shrink-0">
                      <img src={art.gambar} alt={art.judul} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Calendar size={12} /> {art.tanggal}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-2 leading-snug">{art.judul}</h4>
                      <p className="text-slate-400 text-xs mt-2 line-clamp-3 leading-relaxed">{art.ringkasan}</p>
                    </div>
                    <div className="mt-4">
                      <button 
                        onClick={() => setSelectedArtikel(art)}
                        className="text-xs text-indigo-300 hover:text-white font-bold inline-flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        Baca Selengkapnya →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 italic">Belum ada artikel dipublish.</p>
          )}
        </section>

        {/* MAP & CONTACT */}
        <section id="kontak" className="mb-12 bg-slate-900/40 p-6 lg:p-8 border border-white/10 rounded-3xl grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-20">
          
          <div className="lg:col-span-1">
            <h3 className="text-lg font-extrabold text-white">Hubungi Kami</h3>
            <p className="text-xs text-slate-400 mt-1">Konsultasi pendaftaran online atau pendaftaran tatap muka.</p>

            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="text-indigo-400 shrink-0 mt-0.5" size={16} />
                <span className="text-xs text-slate-300 leading-relaxed">{sekolah.alamat}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-indigo-400" size={16} />
                <span className="text-xs text-slate-300">{sekolah.telepon}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-indigo-400" size={16} />
                <span className="text-xs text-slate-300">{sekolah.email}</span>
              </div>
              {kontak.map(c => (
                <div key={c.id} className="text-xs flex gap-2 border-t border-white/5 pt-2">
                  <span className="text-slate-400">{c.label}:</span>
                  <span className="text-white font-semibold">{c.value}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-8">
              {sosialMedia.map(s => {
                const iconMap: any = { facebook: Facebook, instagram: Instagram, youtube: Youtube, twitter: Twitter };
                const IconComponent = iconMap[s.platform] || Facebook;
                return (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white/5 border border-white/10 rounded-xl transition-all text-slate-350 hover:text-indigo-400 hover:bg-white/10">
                    <IconComponent size={14} />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl overflow-hidden h-72 border border-white/10">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56347862214!2d107.57311635!3d-6.9034443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a16b4c3e8e124!2sBandung%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid" 
              className="w-full h-full border-0 grayscale opacity-80"
              allowFullScreen={false} 
              loading="lazy"
            ></iframe>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950 py-8 px-4 mt-16 text-center md:text-left">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-slate-400 text-xs tracking-wider">{pengaturan.footer_text}</p>
            <p className="text-[10px] text-slate-500 mt-1 italic">{pengaturan.meta_description}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Terakreditasi</span>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-lg">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-slate-300 uppercase">{sekolah.status} BB</span>
            </div>
          </div>
        </div>
      </footer>

      {/* LIGHTBOX FOR VIDEOS */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
            <button 
              onClick={() => setSelectedVideo(null)} 
              className="absolute top-4 right-4 z-10 p-2 bg-slate-950/80 hover:bg-white/15 border border-white/10 rounded-full text-slate-100 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>
            <div className="aspect-video">
              <iframe 
                src={`https://www.youtube.com/embed/${selectedVideo.embed_id}?autoplay=1`}
                title={selectedVideo.judul}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-5">
              <h4 className="text-sm font-bold text-white uppercase">{selectedVideo.judul || 'Dokumentasi Video'}</h4>
            </div>
          </div>
        </div>
      )}

      {/* POPUP VIEW ARTICLE */}
      {selectedArtikel && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 max-h-[85vh] overflow-y-auto scrollbar-thin relative shadow-2xl">
            <button 
              onClick={() => setSelectedArtikel(null)}
              className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-white/15 border border-white/10 rounded-full text-slate-100 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {selectedArtikel.gambar && (
              <div className="h-56 bg-slate-800 rounded-2xl overflow-hidden mb-5">
                <img src={selectedArtikel.gambar} alt={selectedArtikel.judul} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="pr-10">
              <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">{selectedArtikel.tanggal}</span>
              <h4 className="text-lg lg:text-xl font-extrabold text-white mt-1 leading-snug">{selectedArtikel.judul}</h4>
            </div>

            <div 
              className="mt-6 text-slate-300 text-xs lg:text-sm leading-relaxed space-y-4 border-t border-white/5 pt-5 text-justify"
              dangerouslySetInnerHTML={{ __html: selectedArtikel.isi }}
            />
          </div>
        </div>
      )}

      {/* FLOATING WHATSAPP BUTTON */}
      {(() => {
        const activePPDB = ppdb.find(p => p.is_active === 1);
        const rawWA = activePPDB?.kontak_wa || kontak.find(c => c.tipe === 'whatsapp')?.value || sekolah.telepon;
        const cleanWA = rawWA ? rawWA.replace(/[^0-9]/g, '') : '';
        if (!cleanWA) return null;
        return (
          <a 
            href={`https://wa.me/${cleanWA}?text=Halo%20Admin%20${encodeURIComponent(sekolah.nama || 'Sekolah')}%2C%20saya%20ingin%20bertanya%20informasi%20mengenai%20Penerimaan%20Siswa%20Baru%20(PPDB).`}
            target="_blank" 
            rel="noopener noreferrer"
            className="fixed bottom-6 left-6 z-40 bg-emerald-500 hover:bg-emerald-400 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center group border border-emerald-400/20 shadow-emerald-500/25 cursor-pointer"
            aria-label="Hubungi WhatsApp Sekolah"
          >
            <Phone className="w-5 h-5 animate-pulse" />
            <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-300 text-xs font-bold uppercase tracking-wider block whitespace-nowrap">
              Chat Admin WA
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border border-slate-900 rounded-full flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            </span>
          </a>
        );
      })()}

      {/* ONLINE REGISTRATION FORM DIALOG */}
      {isRegistering && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin">
            
            <button 
              onClick={() => setIsRegistering(false)} 
              className="absolute top-4 right-4 p-2 bg-slate-950/80 hover:bg-white/15 border border-white/10 rounded-full text-slate-100 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            {!registrationSuccess ? (
              <form onSubmit={handleSubmitPendaftaran} className="space-y-4">
                <div>
                  <h4 className="text-base font-extrabold text-white">Formulir Pendaftaran Siswa Baru</h4>
                  <p className="text-[11px] text-slate-400">Silakan isi berkas calon peserta didik yang sah di bawah ini.</p>
                </div>

                {formError && (
                  <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-300 text-xs rounded-xl">
                    ⚠️ {formError}
                  </div>
                )}

                {/* Form Fields Grid */}
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Nama Lengkap Calon Siswa *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Zackaria Ahmad" 
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none"
                        value={ppdbForm.nama}
                        onChange={e => setPpdbForm({...ppdbForm, nama: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">NIK Calon Siswa (16 Digit) *</label>
                      <input 
                        type="text" 
                        required
                        maxLength={16}
                        placeholder="3273120000000000" 
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none"
                        value={ppdbForm.nik}
                        onChange={e => setPpdbForm({...ppdbForm, nik: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">NISN (Siswa Nasional - Opsional)</label>
                      <input 
                        type="text" 
                        placeholder="0098765432" 
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none"
                        value={ppdbForm.nisn}
                        onChange={e => setPpdbForm({...ppdbForm, nisn: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Jenis Kelamin *</label>
                      <select 
                        required
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none cursor-pointer"
                        value={ppdbForm.gender}
                        onChange={e => setPpdbForm({...ppdbForm, gender: e.target.value})}
                      >
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tempat Lahir *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Bandung" 
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none"
                        value={ppdbForm.tempat_lahir}
                        onChange={e => setPpdbForm({...ppdbForm, tempat_lahir: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Tanggal Lahir *</label>
                      <input 
                        type="date" 
                        required
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none cursor-pointer"
                        value={ppdbForm.tanggal_lahir}
                        onChange={e => setPpdbForm({...ppdbForm, tanggal_lahir: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Nama Orang Tua / Wali *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Rudi Hermawan" 
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none"
                        value={ppdbForm.nama_wali}
                        onChange={e => setPpdbForm({...ppdbForm, nama_wali: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">No. WhatsApp Orang Tua *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="08123456789" 
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none"
                        value={ppdbForm.kontak_wali}
                        onChange={e => setPpdbForm({...ppdbForm, kontak_wali: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Sekolah Asal (SD/MI) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="SD Negeri 1 Bandung" 
                      className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none"
                      value={ppdbForm.sekolah_asal}
                      onChange={e => setPpdbForm({...ppdbForm, sekolah_asal: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-1">Alamat Lengkap Domisili *</label>
                    <textarea 
                      required
                      rows={2}
                      placeholder="Jl. Merdeka No. 45 Kelas 6 RT 02/05, Kel. Babakan, Kec. Sumur Bandung, Kota Bandung" 
                      className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-white focus:border-indigo-500/80 outline-none resize-none"
                      value={ppdbForm.alamat}
                      onChange={e => setPpdbForm({...ppdbForm, alamat: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex gap-3 justify-end">
                  <button 
                    type="button"
                    onClick={() => setIsRegistering(false)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></span>
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Pendaftaran Berkas'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
                  <span className="text-2xl font-bold font-mono">✓</span>
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-white">PENDAFTARAN SELESAI !</h4>
                  <p className="text-xs text-slate-400 mt-1">Registrasi online calon siswa baru berhasil diinput di sistem sekolah.</p>
                </div>

                <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 space-y-2 text-left max-w-sm mx-auto">
                  <div className="flex justify-between border-b border-white/5 pb-1.5 text-xs">
                    <span className="text-slate-400">ID Registrasi:</span>
                    <span className="text-white font-mono font-bold text-indigo-400">{regId}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Nama Siswa:</span>
                    <span className="text-white font-semibold">{ppdbForm.nama}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">NIK:</span>
                    <span className="text-white">{ppdbForm.nik}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Sekolah Asal:</span>
                    <span className="text-white font-medium">{ppdbForm.sekolah_asal}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Orang Tua/Wali:</span>
                    <span className="text-white">{ppdbForm.nama_wali}</span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal max-w-sm mx-auto">
                  Silakan simpan ID Registrasi Anda di atas dan hubungi WhatsApp Panitia Penerimaan Siswa Baru untuk petunjuk verifikasi berkas luring berikutnya.
                </p>

                <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-2 justify-center">
                  <button 
                    type="button" 
                    onClick={() => window.print()}
                    className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-bold"
                  >
                    Cetak Bukti Pendaftaran
                  </button>
                  {(() => {
                    const activePPDB = ppdb.find(p => p.is_active === 1);
                    const rawWA = activePPDB?.kontak_wa || kontak.find(c => c.tipe === 'whatsapp')?.value || sekolah.telepon;
                    const cleanWA = rawWA ? rawWA.replace(/[^0-9]/g, '') : '';
                    return (
                      <a 
                        href={`https://wa.me/${cleanWA}?text=Halo%20Panitia%20PPDB%20SMP%20Bina%20Bangsa%2C%20saya%20telah%20mendaftar%20online%20dengan%20No%20Registrasi%20${regId}%20atas%20nama%20${encodeURIComponent(ppdbForm.nama)}.%20Berikut%20bukti%20berkas%20saya.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <Phone size={13} /> Hubungi Panitia WA
                      </a>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
