import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { 
  User, Sekolah, SosialMedia, Kontak, Menu, Banner, 
  Fasilitas, Ekskul, Guru, Prestasi, Galeri, Artikel, 
  LogAktivitas, Jabatan, PPDB, PendaftaranPPDB 
} from './types';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import AdminPanel from './components/AdminPanel';

// Safe Fallback Identity Profile
const FALLBACK_SEKOLAH: Sekolah = {
  id: 1,
  nama: 'SMP Bina Bangsa Indonesia',
  npsn: '20212345',
  akreditasi: 'A',
  status: 'Swasta',
  telepon: '022-5551234',
  email: 'info@binabangsa.sch.id',
  alamat: 'Jl. Raya Pendidikan No. 45, Soreang, Kabupaten Bandung, Jawa Barat',
  kepala_sekolah: 'Dr. H. Ahmad Fauzi, M.Pd.',
  tahun_berdiri: '2010',
  visi: 'Mewujudkan generasi yang bertaqwa, cerdas, berkarakter, unggul dalam prestasi, dan berwawasan lingkungan.',
  misi: [
    'Menanamkan keimanan dan ketaqwaan melalui pembiasaan keagamaan.',
    'Melaksanakan pembelajaran yang aktif, inovatif, kreatif, dan menyenangkan.',
    'Mengembangkan minat, bakat, dan potensi murid melalui ekstrakurikuler.',
    'Membentuk karakter disiplin, sopan santun, dan peduli lingkungan.'
  ]
};

export default function App() {
  // Global Shared States 
  const [sekolah, setSekolah] = useState<Sekolah>(FALLBACK_SEKOLAH);
  const [sosialMedia, setSosialMedia] = useState<SosialMedia[]>([]);
  const [kontak, setKontak] = useState<Kontak[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [fasilitas, setFasilitas] = useState<Fasilitas[]>([]);
  const [ekskul, setEkskul] = useState<Ekskul[]>([]);
  const [guru, setGuru] = useState<Guru[]>([]);
  const [jabatan, setJabatan] = useState<Jabatan[]>([]);
  const [ppdb, setPpdb] = useState<PPDB[]>([]);
  const [prestasi, setPrestasi] = useState<Prestasi[]>([]);
  const [galeri, setGaleri] = useState<Galeri[]>([]);
  const [artikel, setArtikel] = useState<Artikel[]>([]);
  const [pengaturan, setPengaturan] = useState<any>({
    site_title: 'SMP BINA BANGSA INDONESIA',
    footer_text: '© 2026 SMP Bina Bangsa Indonesia. All rights reserved.',
    meta_description: 'Sekolah Unggul Berprestasi Terakreditasi A'
  });
  const [logs, setLogs] = useState<LogAktivitas[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pendaftaranPPDB, setPendaftaranPPDB] = useState<PendaftaranPPDB[]>([]);

  // Authentication Sesi States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('school_panel_token'));

  // World routers: 'landing' | 'login' | 'admin'
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'admin'>('landing');

  // Interactive Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto trigger toast alert helper
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const getHeaders = () => {
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  // Re-fetch Core school information
  const fetchData = async () => {
    try {
      const resSekolah = await fetch('/api/sekolah');
      if (resSekolah.ok) setSekolah(await resSekolah.json());

      const resSos = await fetch('/api/sosial-media');
      if (resSos.ok) setSosialMedia(await resSos.json());

      const resKontak = await fetch('/api/kontak');
      if (resKontak.ok) setKontak(await resKontak.json());

      const resMenus = await fetch('/api/menus');
      if (resMenus.ok) setMenus(await resMenus.json());

      const resBanners = await fetch('/api/banners');
      if (resBanners.ok) setBanners(await resBanners.json());

      const resFas = await fetch('/api/fasilitas');
      if (resFas.ok) setFasilitas(await resFas.json());

      const resEks = await fetch('/api/ekskul');
      if (resEks.ok) setEkskul(await resEks.json());

      const resGuru = await fetch('/api/guru');
      if (resGuru.ok) setGuru(await resGuru.json());

      const resJabatan = await fetch('/api/jabatan');
      if (resJabatan.ok) setJabatan(await resJabatan.json());

      const resPPDB = await fetch('/api/ppdb');
      if (resPPDB.ok) setPpdb(await resPPDB.json());

      const resPres = await fetch('/api/prestasi');
      if (resPres.ok) setPrestasi(await resPres.json());

      const resGale = await fetch('/api/galeri');
      if (resGale.ok) setGaleri(await resGale.json());

      const resArt = await fetch('/api/artikel');
      if (resArt.ok) setArtikel(await resArt.json());

      const resSettings = await fetch('/api/pengaturan');
      if (resSettings.ok) setPengaturan(await resSettings.json());

      const resPendaftaran = await fetch('/api/pendaftaran-ppdb');
      if (resPendaftaran.ok) setPendaftaranPPDB(await resPendaftaran.json());

      // Fetch authentication secure panels
      if (token) {
        // Fetch logs
        const resLogs = await fetch('/api/logs', { headers: getHeaders() });
        if (resLogs.ok) setLogs(await resLogs.json());

        // Fetch user operator lists
        const resUsers = await fetch('/api/users', { headers: getHeaders() });
        if (resUsers.ok) setUsers(await resUsers.json());
      }
    } catch (e) {
      console.warn("Backend link currently offline.", e);
    }
  };

  // Trigger verify on startup or session restore
  useEffect(() => {
    fetchData();
    if (token) {
      try {
        const decoded = JSON.parse(atob(token));
        setCurrentUser(decoded);
      } catch (err) {
        setToken(null);
        localStorage.removeItem('school_panel_token');
      }
    }
  }, [token]);

  // Auth Operations
  const handleLogin = async (username: string, passwordPlain: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: passwordPlain })
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('school_panel_token', data.token);
        setCurrentUser(data.user);
        showToast(`Selamat datang kembali, ${data.user.nama_lengkap}!`);
        setCurrentView('admin');
        return true;
      } else {
        return false;
      }
    } catch (err) {
      showToast('Koneksi server gagal.', 'error');
      return false;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        headers: getHeaders()
      });
    } catch {}
    setToken(null);
    localStorage.removeItem('school_panel_token');
    setCurrentUser(null);
    showToast('Berhasil keluar dari panel administrator.');
    setCurrentView('landing');
  };

  // Profile update callbacks
  const handleUpdateSekolah = async (payload: Partial<Sekolah>): Promise<boolean> => {
    try {
      const res = await fetch('/api/sekolah', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setSekolah(await res.json());
        showToast('Profil sekolah dasar berhasil diperbarui.');
        return true;
      }
    } catch {}
    showToast('Gagal memperbarui profil sekolah.', 'error');
    return false;
  };

  // Pengaturan SEO update callbacks
  const handleUpdatePengaturan = async (payload: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/pengaturan', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPengaturan(await res.json());
        showToast('Pengaturan SEO berhasil diterapkan.');
        return true;
      }
    } catch {}
    showToast('Gagal merubah pengaturan.', 'error');
    return false;
  };

  const handleUpdateKontak = async (payload: Kontak[]): Promise<boolean> => {
    try {
      const res = await fetch('/api/kontak', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const updated = await res.json();
        setKontak(updated.list);
        showToast('Rincian kontak & WhatsApp admin berhasil disimpan.');
        return true;
      }
    } catch {}
    showToast('Gagal memperbarui kontak.', 'error');
    return false;
  };

  // Generic CRUD handling for various school entities
  const handleCrud = async (endpoint: string, method: 'POST' | 'PUT' | 'DELETE', payload: any, entityId?: number): Promise<boolean> => {
    const url = entityId ? `/api/${endpoint}/${entityId}` : `/api/${endpoint}`;
    try {
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: method !== 'DELETE' ? JSON.stringify(payload) : undefined
      });
      if (res.ok) {
        showToast('Data berhasil diperbarui.');
        fetchData();
        return true;
      } else {
        const errorData = await res.json();
        showToast(errorData.error || 'Operasi gagal.', 'error');
        return false;
      }
    } catch (err) {
      showToast('Kesalahan koneksi API.', 'error');
      return false;
    }
  };

  // Backup files
  const handleBackup = () => {
    window.location.href = '/api/backup?authorization=' + token;
    showToast('Basis data berhasil diekspor ke format JSON.');
  };

  // Restore database
  const handleRestore = async (backupDataString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(backupDataString);
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ backupData: parsed })
      });
      if (res.ok) {
        showToast('Seluruh konfigurasi web sukses dipulihkan!');
        fetchData();
        return true;
      } else {
        const d = await res.json();
        showToast(d.error || 'Sesi pemulihan gagal.', 'error');
      }
    } catch (e) {
      showToast('Format JSON data tidak sah.', 'error');
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Dynamic Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce bg-slate-900 border border-white/10 backdrop-blur-xl px-5 py-4 rounded-xl shadow-2xl flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`}></div>
          <span className="text-xs font-bold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition-colors ml-2 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* CORE ROUTING ENGINE */}
      {currentView === 'landing' && (
        <LandingPage 
          sekolah={sekolah}
          sosialMedia={sosialMedia}
          kontak={kontak}
          menus={menus}
          banners={banners}
          fasilitas={fasilitas}
          ekskul={ekskul}
          guru={guru}
          jabatan={jabatan}
          ppdb={ppdb}
          prestasi={prestasi}
          galeri={galeri}
          artikel={artikel}
          pengaturan={pengaturan}
          currentUser={currentUser}
          onNavigateToLogin={() => setCurrentView('login')}
          onNavigateToAdmin={() => setCurrentView('admin')}
        />
      )}

      {currentView === 'login' && (
        <LoginPage 
          onLogin={handleLogin}
          onBackToLanding={() => setCurrentView('landing')}
        />
      )}

      {currentView === 'admin' && currentUser ? (
        <AdminPanel 
          currentUser={currentUser}
          sekolah={sekolah}
          sosialMedia={sosialMedia}
          kontak={kontak}
          menus={menus}
          banners={banners}
          fasilitas={fasilitas}
          ekskul={ekskul}
          guru={guru}
          jabatan={jabatan}
          ppdb={ppdb}
          prestasi={prestasi}
          galeri={galeri}
          artikel={artikel}
          logs={logs}
          users={users}
          pengaturan={pengaturan}
          pendaftaranPPDB={pendaftaranPPDB}
          onLogout={handleLogout}
          onNavigateToLanding={() => setCurrentView('landing')}
          onUpdateSekolah={handleUpdateSekolah}
          onUpdatePengaturan={handleUpdatePengaturan}
          onUpdateKontak={handleUpdateKontak}
          onCrud={handleCrud}
          onBackup={handleBackup}
          onRestore={handleRestore}
        />
      ) : currentView === 'admin' ? (
        // Redirect if trying to load admin panel without authenticating first
        <LoginPage 
          onLogin={handleLogin}
          onBackToLanding={() => setCurrentView('landing')}
        />
      ) : null}

    </div>
  );
}
