import React, { useState, useEffect } from 'react';
import { 
  Laptop, BookOpen, Compass, Trophy, Image as ImageIcon, MapPin, Phone, Mail, 
  Clock, Plus, Trash2, Edit2, LogOut, Check, X, ArrowLeft, Download, Upload, 
  Layout, Settings, Users, FileText, RefreshCw, Calendar, Youtube, Link, Sparkles,
  Search, ShieldAlert, CheckCircle, Info, Database, School, Menu as MenuIcon
} from 'lucide-react';
import { 
  User, Sekolah, SosialMedia, Kontak, Menu, Banner, 
  Fasilitas, Ekskul, Guru, Prestasi, Galeri, Artikel, 
  LogAktivitas, Jabatan, PPDB, PendaftaranPPDB 
} from '../types';

interface AdminPanelProps {
  currentUser: User;
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
  logs: LogAktivitas[];
  users: User[];
  pengaturan: any;
  pendaftaranPPDB: PendaftaranPPDB[];
  onLogout: () => void;
  onNavigateToLanding: () => void;
  onUpdateSekolah: (data: Partial<Sekolah>) => Promise<boolean>;
  onUpdatePengaturan: (data: any) => Promise<boolean>;
  onUpdateKontak: (data: Kontak[]) => Promise<boolean>;
  onCrud: (endpoint: string, method: 'POST' | 'PUT' | 'DELETE', payload: any, entityId?: number) => Promise<boolean>;
  onBackup: () => void;
  onRestore: (backupDataString: string) => Promise<boolean>;
}

export default function AdminPanel({
  currentUser,
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
  logs,
  users,
  pengaturan,
  pendaftaranPPDB,
  onLogout,
  onNavigateToLanding,
  onUpdateSekolah,
  onUpdatePengaturan,
  onUpdateKontak,
  onCrud,
  onBackup,
  onRestore
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  // Local Temp States
  const [tempProfile, setTempProfile] = useState<Partial<Sekolah>>({ ...sekolah });
  const [tempSettings, setTempSettings] = useState<any>({ ...pengaturan });
  const [tempKontak, setTempKontak] = useState<Kontak[]>(kontak || []);

  useEffect(() => {
    if (kontak) {
      setTempKontak(kontak);
    }
  }, [kontak]);

  // States for Laporan Pencarian & Filter
  const [filterReportSearch, setFilterReportSearch] = useState('');
  const [filterReportStatus, setFilterReportStatus] = useState<'semua' | 'proses' | 'disetujui' | 'ditolak'>('semua');
  
  // CRUD Form States
  const [newMenu, setNewMenu] = useState<Partial<Menu>>({ label: '', url: '', parent_id: null, urutan: 0, is_active: 1 });
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({ judul: '', subjudul: '', gambar: '', tombol_teks: '', tombol_link: '', urutan: 1, is_active: 1 });
  const [newFasilitas, setNewFasilitas] = useState<Partial<Fasilitas>>({ judul: '', deskripsi: '', ikon: 'BookOpen', gambar: '', urutan: 1, is_active: 1 });
  const [newEkskul, setNewEkskul] = useState<Partial<Ekskul>>({ judul: '', deskripsi: '', ikon: 'Compass', gambar: '', urutan: 1, is_active: 1 });
  const [newGuru, setNewGuru] = useState<Partial<Guru>>({ nama: '', jabatan: 'Guru Pengajar', mapel: '', foto: '', urutan: 1, is_active: 1, nik: '', nuptk: '', jabatan_id: undefined, wali_kelas: '', kontak: '', email: '' });
  const [newJabatan, setNewJabatan] = useState<Partial<Jabatan>>({ nama: '', tingkat: 3, is_active: 1 });
  const [newPPDB, setNewPPDB] = useState<Partial<PPDB>>({ tahun_ajaran: '2026/2027', gelombang: 'Gelombang I', keterangan: '', mulai: '', selesai: '', kuota: 150, link_pendaftaran: '', kontak_wa: '', is_active: 1 });
  const [newPrestasi, setNewPrestasi] = useState<Partial<Prestasi>>({ judul: '', tahun: '2026', deskripsi: '', gambar: '', urutan: 1, is_active: 1 });
  const [newGaleri, setNewGaleri] = useState<Partial<Galeri>>({ judul: '', gambar: '', tipe: 'image', embed_id: '', embed_url: '', urutan: 1, is_active: 1 });
  const [newArtikel, setNewArtikel] = useState<Partial<Artikel>>({ judul: '', ringkasan: '', isi: '', gambar: '', status: 'draft', tanggal: new Date().toISOString().split('T')[0] });
  const [newOperator, setNewOperator] = useState({ username: '', passwordPlain: '', role: 'operator' as 'admin' | 'operator', nama_lengkap: '', email: '' });
  
  const [restoreJson, setRestoreJson] = useState<string>('');
  const [actionPending, setActionPending] = useState(false);
  const [helpSubTab, setHelpSubTab] = useState<string>('pengantar');

  // States for advanced Import/Export Data Awal
  const [exportWithImages, setExportWithImages] = useState<boolean>(true);
  const [exportOnlyStructure, setExportOnlyStructure] = useState<boolean>(false);
  const [importWithBackup, setImportWithBackup] = useState<boolean>(true);
  const [importOnlyEmpty, setImportOnlyEmpty] = useState<boolean>(false);
  const [importFileContent, setImportFileContent] = useState<string>('');
  const [importFileName, setImportFileName] = useState<string>('');
  const [backupHistoryList, setBackupHistoryList] = useState<any[]>([]);
  const [isFetchingHistory, setIsFetchingHistory] = useState<boolean>(false);

  // CSV Converter States
  const [showSpreadsheetTool, setShowSpreadsheetTool] = useState<boolean>(false);
  const [spreadsheetCSVRows, setSpreadsheetCSVRows] = useState<string[][]>([]);
  const [spreadsheetMappedColumns, setSpreadsheetMappedColumns] = useState<Record<string, number>>({});
  const [spreadsheetPreviewTarget, setSpreadsheetPreviewTarget] = useState<'tenaga_pendidik'>('tenaga_pendidik');

  const spreadsheetMapKeys = [
    { key: 'nama', label: 'Nama Lengkap', required: true },
    { key: 'nik', label: 'NIK No.', required: false },
    { key: 'nuptk', label: 'NUPTK No.', required: false },
    { key: 'jabatan', label: 'Nama Jabatan', required: true },
    { key: 'mapel', label: 'Mata Pelajaran', required: false },
    { key: 'wali_kelas', label: 'Kewalian Kelas', required: false },
    { key: 'foto', label: 'Tautan Foto', required: false },
    { key: 'kontak', label: 'No. WA/Telepon', required: false },
    { key: 'email', label: 'Email Resmi', required: false },
    { key: 'aktif', label: 'Status Aktif (true/false)', required: false }
  ];

  const fetchBackupHistoryList = async () => {
    setIsFetchingHistory(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/backups/history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBackupHistoryList(data);
      }
    } catch (e) {
      console.error('Error fetching backup history:', e);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'import_export') {
      fetchBackupHistoryList();
    }
  }, [activeTab]);

  const handleDownloadExport = () => {
    const token = localStorage.getItem('token');
    window.location.href = `/api/export_custom?includeImages=${exportWithImages}&onlyStructure=${exportOnlyStructure}&authorization=${token}`;
  };

  const handleDownloadTemplate = () => {
    const token = localStorage.getItem('token');
    window.location.href = `/api/export/template?authorization=${token}`;
  };

  const handleDownloadCSVTemplate = () => {
    const csvContent = "nama,nik,nuptk,jabatan,mapel,wali_kelas,foto,kontak,email,aktif\n" +
      "LENDI ESA NUGRAHA,3204xxxxxxxxxx,123456789,Kepala Sekolah,Matematika,,,62812345678,lendi@gmail.com,true\n" +
      "Supriyanto,3204xxxxxxxxxx,987654321,Guru Mata Pelajaran,Fisika,Kelas VIII B,,62812345679,supri@gmail.com,true";
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_sekolah_pendidik.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImportFileName(file.name);
      const reader = new FileReader();
      
      if (file.name.endsWith('.csv')) {
        // If CSV, let's open mapping tool!
        reader.onload = (event) => {
          const text = event.target?.result as string;
          const rows = parseCSVStringList(text);
          setSpreadsheetCSVRows(rows);
          
          // Auto detect and map common columns
          if (rows.length > 0) {
            const headers = rows[0].map(h => h.toLowerCase().replace(/[\s_]/g, ''));
            const initialMapping: Record<string, number> = {};
            spreadsheetMapKeys.forEach(m => {
              const detectedIdx = headers.findIndex(h => h.includes(m.key.replace(/_/g, '')));
              if (detectedIdx !== -1) {
                initialMapping[m.key] = detectedIdx;
              }
            });
            setSpreadsheetMappedColumns(initialMapping);
          }
          setShowSpreadsheetTool(true);
        };
        reader.readAsText(file);
      } else {
        // Standard JSON
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setImportFileContent(text);
          setShowSpreadsheetTool(false);
        };
        reader.readAsText(file);
      }
    }
  };

  // Helper method to parse CSV String List safely
  const parseCSVStringList = (text: string): string[][] => {
    const result: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentVal = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        row.push(currentVal.trim());
        result.push(row);
        row = [];
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    if (currentVal || row.length > 0) {
      row.push(currentVal.trim());
      result.push(row);
    }
    return result.filter(r => r.some(cell => cell.length > 0));
  };

  const handleProcessImport = async () => {
    if (!importFileContent) {
      alert('Silakan pilih file JSON atau selesaikan konversi CSV terlebih dahulu!');
      return;
    }

    setActionPending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/import_custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileContent: importFileContent,
          backup: importWithBackup,
          onlyEmpty: importOnlyEmpty
        })
      });

      const resData = await response.json();
      if (response.ok) {
        alert(resData.message || 'Import data awal berhasil dilangsungkan!');
        setImportFileName('');
        setImportFileContent('');
        fetchBackupHistoryList();
        // Redirect to dashboard or reload data
        window.location.reload();
      } else {
        alert(`Gagal Mengimpor: ${resData.error || 'Uraian tidak diketahui'}`);
      }
    } catch (e: any) {
      alert(`Terjadi error pada jaringan: ${e.message}`);
    } finally {
      setActionPending(false);
    }
  };

  const handleApplySpreadsheetConversion = () => {
    if (spreadsheetCSVRows.length < 2) {
      alert('Spreedsheet tidak memiliki baris data.');
      return;
    }

    // Convert CSV rows into data-awal tenaga_pendidik format
    const rows = spreadsheetCSVRows.slice(1);
    const compiledList: any[] = [];

    rows.forEach(row => {
      const item: any = {};
      spreadsheetMapKeys.forEach(m => {
        const colIdx = spreadsheetMappedColumns[m.key];
        if (colIdx !== undefined && colIdx !== -1) {
          let val = row[colIdx] || '';
          if (m.key === 'aktif') {
            item[m.key] = val.toLowerCase() !== 'false' && val !== '0';
          } else {
            item[m.key] = val;
          }
        } else {
          // Defaults
          if (m.key === 'aktif') item[m.key] = true;
          else item[m.key] = '';
        }
      });
      if (item.nama) {
        compiledList.push(item);
      }
    });

    if (compiledList.length === 0) {
      alert('Kolom "Nama" wajib dipetakan dan baris data tidak boleh kosong!');
      return;
    }

    // Wrap in standard Section B template format
    const wrappedResult = {
      metadata: {
        export_date: new Date().toISOString(),
        version: "1.0",
        source: "Sistem Converter Mandiri Siswa (CSV)"
      },
      tenaga_pendidik: compiledList
    };

    setImportFileContent(JSON.stringify(wrappedResult, null, 2));
    setShowSpreadsheetTool(false);
    alert(`Sukses mengonversi ${compiledList.length} Baris Tenaga Pendidik / Guru! Silakan tekan 'PROSES IMPORT' untuk memasukkannya.`);
  };

  // Helper Base64 Upload
  const handleImageUploadHelper = (e: React.ChangeEvent<HTMLInputElement>, setter: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size exceeds the 2MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionPending(true);
    await onUpdateSekolah(tempProfile);
    setActionPending(false);
  };

  const handleApplySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionPending(true);
    await onUpdatePengaturan(tempSettings);
    setActionPending(false);
  };

  const [isSavingKontak, setIsSavingKontak] = useState<boolean>(false);

  const handleSaveKontakList = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingKontak(true);
    const success = await onUpdateKontak(tempKontak);
    if (success) {
      alert('Informasi kontak & nomor WA Admin berhasil disimpan.');
    } else {
      alert('Gagal menyimpan informasi kontak.');
    }
    setIsSavingKontak(false);
  };

  const [localPendaftar, setLocalPendaftar] = useState<PendaftaranPPDB[]>(pendaftaranPPDB || []);

  useEffect(() => {
    if (pendaftaranPPDB) {
      setLocalPendaftar(pendaftaranPPDB);
    }
  }, [pendaftaranPPDB]);

  const handleUpdatePendaftarStatus = async (id: string, newStatus: 'proses' | 'disetujui' | 'ditolak') => {
    try {
      const res = await fetch(`/api/pendaftaran-ppdb/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('school_panel_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setLocalPendaftar(prev => prev.map(p => p.id === id ? updated : p));
        alert(`Status pendaftaran ${updated.nama} berhasil diubah menjadi ${newStatus}.`);
      } else {
        alert('Gagal memperbarui status. Operator hanya diizinkan merubah status.');
      }
    } catch {
      alert('Terjadi kendala jaringan.');
    }
  };

  const handleDeletePendaftar = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus pendaftaran ${nama} secara permanen?`)) return;
    try {
      const res = await fetch(`/api/pendaftaran-ppdb/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('school_panel_token')}`
        }
      });
      if (res.ok) {
        setLocalPendaftar(prev => prev.filter(p => p.id !== id));
        alert('Berkas pendaftaran berhasil dihapus dari database.');
      } else {
        alert('Gagal menghapus berkas.');
      }
    } catch {
      alert('Jaringan terputus.');
    }
  };

  const handleAddEntity = async (endpoint: string, payload: any, resetForm: () => void) => {
    setActionPending(true);
    const success = await onCrud(endpoint, 'POST', payload);
    if (success) {
      resetForm();
    }
    setActionPending(false);
  };

  const handleDeleteEntity = async (endpoint: string, id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data ini?')) return;
    setActionPending(true);
    await onCrud(endpoint, 'DELETE', null, id);
    setActionPending(false);
  };

  const handleTriggerRestore = async () => {
    if (!restoreJson.trim()) {
      alert('Silakan tempel string JSON cadangan terlebih dahulu.');
      return;
    }
    setActionPending(true);
    const success = await onRestore(restoreJson);
    if (success) {
      setRestoreJson('');
    }
    setActionPending(false);
  };

  // Nav groups matching permissions and categories
  const navGroups = [
    {
      title: 'Dashboard & Analitik',
      items: [
        { id: 'dashboard', label: 'Ringkasan Portal', icon: Layout, role: 'operator' },
        { id: 'laporan', label: 'Laporan & Statistik', icon: FileText, role: 'operator' }
      ]
    },
    {
      title: 'Profil & Staff',
      items: [
        { id: 'sekolah', label: 'Profil Dasar & Kontak', icon: School, role: 'operator' },
        { id: 'jabatan', label: 'Hirarki Jabatan', icon: Users, role: 'operator' },
        { id: 'guru', label: 'Staf Guru', icon: Users, role: 'operator' }
      ]
    },
    {
      title: 'Media & Publikasi',
      items: [
        { id: 'menus', label: 'Tautan Navigasi', icon: Link, role: 'operator' },
        { id: 'banners', label: 'Banner Pilihan', icon: ImageIcon, role: 'operator' },
        { id: 'artikel', label: 'Kabar Berita/Artikel', icon: FileText, role: 'operator' },
        { id: 'galeri', label: 'Momen Galeri', icon: Youtube, role: 'operator' }
      ]
    },
    {
      title: 'Kurikulum & Sarana',
      items: [
        { id: 'ekskul', label: 'Karakter & Ekskul', icon: Compass, role: 'operator' },
        { id: 'fasilitas', label: 'Infrastruktur', icon: Laptop, role: 'operator' },
        { id: 'prestasi', label: 'Prestasi Juara', icon: Trophy, role: 'operator' }
      ]
    },
    {
      title: 'Pendaftaran Siswa',
      items: [
        { id: 'ppdb', label: 'Kepanitiaan PPDB', icon: Calendar, role: 'operator' }
      ]
    },
    {
      title: 'Sistem & Keamanan',
      items: [
        { id: 'users', label: 'Akun Akses', icon: Users, role: 'admin' },
        { id: 'logs', label: 'Log Aktivitas', icon: ShieldAlert, role: 'admin' },
        { id: 'pengaturan', label: 'Pengaturan Global', icon: Settings, role: 'admin' },
        { id: 'import_export', label: 'Import/Export Data', icon: Database, role: 'admin' }
      ]
    },
    {
      title: 'Dokumentasi & Bantuan',
      items: [
        { id: 'about', label: 'Panduan & ReadMe Operator', icon: BookOpen, role: 'operator' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 flex flex-col md:flex-row relative overflow-hidden">
      
      {/* MOBILE BACKDROP OVERLAY */}
      {isSidebarOpen && (
        <button 
          type="button" 
          aria-label="Tutup Menu"
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-45 md:hidden block w-full text-left cursor-pointer" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-white/10 flex flex-col shrink-0 z-50 transform transition-transform duration-300 md:relative md:transform-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        
        {/* Brand/Identity */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between gap-3 bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-650 rounded-xl flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-600/10">
              BB
            </div>
            <div>
              <h2 className="text-xs font-black text-white leading-snug tracking-wider uppercase">Panel Kendali</h2>
              <p className="text-[9px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">{currentUser.role === 'admin' ? 'SYSTEM ROOT' : 'SCHOOL OPERATOR'}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Current Operator Profile Panel */}
        <div className="p-4 bg-indigo-950/20 m-3 rounded-2xl border border-indigo-500/10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs text-white font-extrabold uppercase">
            {currentUser.nama_lengkap.slice(0, 2)}
          </div>
          <div className="truncate">
            <p className="text-xs font-extrabold text-white leading-tight truncate">{currentUser.nama_lengkap}</p>
            <p className="text-[10px] text-indigo-400 font-semibold leading-tight capitalize mt-0.5">{currentUser.role} Sekolah</p>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
          {navGroups.map((group, groupIdx) => {
            const allowedItems = group.items.filter(item => item.role === 'operator' || currentUser.role === 'admin');
            if (allowedItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                <div className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-400 px-3.5 py-0.5 opacity-80">
                  {group.title}
                </div>
                {allowedItems.map(item => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                        isActive 
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <IconComp size={14} /> {item.label}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions section */}
        <div className="p-4 border-t border-white/10 flex flex-col gap-2">
          <button 
            onClick={onNavigateToLanding}
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-slate-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ArrowLeft size={13} /> Lihat Beranda
          </button>
          <button 
            onClick={onLogout}
            className="w-full py-2.5 bg-rose-600/10 hover:bg-rose-600 border border-rose-500/20 text-rose-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut size={13} /> Keluar Sistem
          </button>
        </div>
      </aside>

      {/* MAIN VIEW CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-y-auto max-h-screen">
        
        {/* TOP BAR / METADATA HEADER */}
        <header className="p-6 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/10 sticky top-0 backdrop-blur-xl z-20">
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-900 border border-white/10 rounded-xl transition-all cursor-pointer"
            >
              <MenuIcon size={16} />
            </button>
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {navGroups.flatMap(g => g.items).find(x => x.id === activeTab)?.label}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Portal pengelolaan {tempProfile.nama || sekolah.nama} secara komprehensif.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {actionPending && (
              <span className="text-[10px] bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 animate-pulse">
                <RefreshCw size={11} className="animate-spin" /> Menulis Perubahan...
              </span>
            )}
            <span className="text-[10px] bg-slate-900 border border-white/10 px-3 py-1.5 rounded-xl font-mono text-slate-400">
              Sesi Masuk: {new Date().toLocaleDateString('id-ID')}
            </span>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="p-6 lg:p-8 flex-1">
          
          {/* TAB: DASHBOARD RINGKASAN */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-900/30 to-blue-900/20 border border-indigo-500/10 p-6 rounded-3xl relative overflow-hidden">
                <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-5 pointer-events-none">
                  <Sparkles size={160} />
                </div>
                <h4 className="text-base font-extrabold text-white uppercase tracking-snug">Selamat datang kembali, {currentUser.nama_lengkap}!</h4>
                <p className="text-xs text-indigo-200 mt-1.5 max-w-2xl leading-relaxed">
                  Semua perubahan konten, prasarana, artikel, dan pengaturan yang Anda lakukan di sini akan langsung terupdate di halaman utama. Gunakan bar navigasi samping untuk mulai menyunting.
                </p>
              </div>

              {/* Grid Statistics Counters */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Konten Banner</p>
                  <p className="text-2xl font-extrabold text-indigo-300 mt-2">{banners.length} Slider</p>
                  <p className="text-[10px] text-slate-400 mt-1">Aktif beroperasi di hero.</p>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Artikel Berita</p>
                  <p className="text-2xl font-extrabold text-blue-305 mt-2">{artikel.length} Artikel</p>
                  <p className="text-[10px] text-slate-400 mt-1">Laporan pendaftaran & kegiatan.</p>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Tenaga Pendidik</p>
                  <p className="text-2xl font-extrabold text-emerald-305 mt-2">{guru.length} Guru</p>
                  <p className="text-[10px] text-slate-400 mt-1">Staf akademik terdaftar.</p>
                </div>
                <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                  <p className="text-[10px] font-black uppercase text-slate-450 tracking-wider">Infrastruktur</p>
                  <p className="text-2xl font-extrabold text-amber-305 mt-2">{fasilitas.length} Ruang</p>
                  <p className="text-[10px] text-slate-400 mt-1">Ekskul & Penunjang belajar.</p>
                </div>
              </div>

              {/* Split layout: Recent audit log and school brief */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Profil Singkat Sekolah</h5>
                    <div className="space-y-3.5 text-xs text-slate-350">
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Nama Resmi</span>
                        <span className="font-extrabold text-white">{sekolah.nama}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>NPSN</span>
                        <span className="font-mono font-bold text-white">{sekolah.npsn}</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Status & Akreditasi</span>
                        <span className="font-bold text-indigo-300">{sekolah.status} (Akreditasi {sekolah.akreditasi})</span>
                      </div>
                      <div className="flex justify-between border-b border-white/5 pb-2">
                        <span>Kepala Sekolah</span>
                        <span className="font-bold text-white">{sekolah.kepala_sekolah}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kontak Sekolah</span>
                        <span className="text-white">{sekolah.telepon} • {sekolah.email}</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('sekolah')} className="mt-6 w-full py-2.5 bg-white/5 hover:bg-white/10 text-xs font-bold rounded-xl transition-all">
                    Sunting Profil Lengkap
                  </button>
                </div>

                <div className="bg-slate-900 border border-white/10 rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest">Audit Masuk Terakhir</h5>
                    {currentUser.role === 'admin' && (
                      <button onClick={() => setActiveTab('logs')} className="text-[10px] text-indigo-400 font-bold hover:underline">
                        Lihat Semua Log
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-3 max-h-[220px] overflow-y-auto">
                    {logs.slice(0, 3).map(lg => (
                      <div key={lg.id} className="p-3 bg-slate-950 border border-white/5 rounded-xl text-xs">
                        <div className="flex justify-between text-[9px] text-slate-400 font-bold">
                          <span>User: {lg.username}</span>
                          <span>{new Date(lg.created_at).toLocaleTimeString('id-ID')}</span>
                        </div>
                        <p className="text-white font-extrabold mt-1">{lg.aksi}</p>
                        <p className="text-slate-400 mt-0.5 text-[11px] leading-relaxed">{lg.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LAPORAN PPDB */}
          {activeTab === 'laporan' && (() => {
            const tempFiltered = localPendaftar.filter(p => {
              const matchesSearch = p.nama.toLowerCase().includes(filterReportSearch.toLowerCase()) || 
                                    p.nik.includes(filterReportSearch) || 
                                    (p.nisn && p.nisn.includes(filterReportSearch)) ||
                                    (p.sekolah_asal && p.sekolah_asal.toLowerCase().includes(filterReportSearch.toLowerCase()));
              const matchesStatus = filterReportStatus === 'semua' || p.status === filterReportStatus;
              return matchesSearch && matchesStatus;
            });

            const statTotal = localPendaftar.length;
            const statDisetujui = localPendaftar.filter(p => p.status === 'disetujui').length;
            const statProses = localPendaftar.filter(p => p.status === 'proses').length;
            const statDitolak = localPendaftar.filter(p => p.status === 'ditolak').length;

            const triggerPrint = () => {
              const printWindow = window.open('', '_blank');
              if (!printWindow) {
                alert('Pop-up terblokir! Izinkan pop-up untuk mencetak laporan.');
                return;
              }
              const rowsHtml = tempFiltered.map((p, idx) => `
                <tr style="border-bottom: 1px dotted #ccc; font-size: 11px;">
                  <td style="padding: 10px; text-align: center;">${idx + 1}</td>
                  <td style="padding: 10px; font-weight: bold; font-family: monospace;">${p.id}</td>
                  <td style="padding: 10px;">
                    <strong>${p.nama}</strong><br/>
                    <small style="color: #666;">NIK: ${p.nik} | NISN: ${p.nisn || '-'}</small>
                  </td>
                  <td style="padding: 10px; text-align: center;">${p.gender}</td>
                  <td style="padding: 10px;">${p.sekolah_asal || '-'}</td>
                  <td style="padding: 10px;">
                    Wali: ${p.nama_wali}<br/>
                    <small style="color: #666;">HP: ${p.kontak_wali}</small>
                  </td>
                  <td style="padding: 10px; text-align: center;">${new Date(p.tanggal_daftar).toLocaleDateString('id-ID')}</td>
                  <td style="padding: 10px; text-align: center; text-transform: uppercase; font-weight: bold; color: ${
                    p.status === 'disetujui' ? '#10b981' : p.status === 'ditolak' ? '#ef4444' : '#f59e0b'
                  }">${p.status}</td>
                </tr>
              `).join('');

              printWindow.document.write(`
                <html>
                  <head>
                    <title>LAPORAN_PPDB_${sekolah.nama.replace(/\s+/g, '_')}</title>
                    <style>
                      body { font-family: Arial, sans-serif; padding: 30px; color: #333; line-height: 1.4; }
                      .kop { text-align: center; border-bottom: 3px double #000; padding-bottom: 12px; margin-bottom: 20px; }
                      .kop h1 { margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 0.5px; }
                      .kop h2 { margin: 3px 0; font-size: 22px; font-weight: 900; }
                      .kop p { margin: 2px 0; font-size: 11px; color: #444; }
                      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                      th { background-color: #f3f4f6; border: 1px solid #c3c3c3; padding: 10px 8px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
                      td { border: 1px dashed #c3c3c3; padding: 8px; font-size: 11px; }
                      .flex-meta { display: flex; justify-content: space-between; margin: 15px 0; font-size: 11px; font-weight: bold; }
                      .stamp-area { margin-top: 40px; display: flex; justify-content: space-between; }
                      .stamp { font-size: 12px; width: 220px; text-align: center; }
                    </style>
                  </head>
                  <body onload="window.print()">
                    <div class="kop">
                      <h1>Pemerintah Kabupaten Bandung</h1>
                      <h1>Dinas Pendidikan</h1>
                      <h2 style="font-size: 23px;">${sekolah.nama.toUpperCase()}</h2>
                      <p>NPSN: ${sekolah.npsn} | Akreditasi: ${sekolah.akreditasi} | Telp: ${sekolah.telepon}</p>
                      <p>Alamat: ${sekolah.alamat} • Surel: ${sekolah.email}</p>
                    </div>

                    <h4 style="text-align: center; text-transform: uppercase; font-size: 14px; margin: 15px 0 5px 0; letter-spacing: 0.5px;">
                      Laporan Pertanggungjawaban Siswa Pendaftar PPDB
                    </h4>
                    <p style="text-align: center; font-size: 10px; color: #555; margin: 0 0 15px 0;">
                      Dicetak pada: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} pukul ${new Date().toLocaleTimeString('id-ID')} WIB
                    </p>

                    <div class="flex-meta">
                      <div>JALUR PENDAFTARAN: ONLINE PORTAL</div>
                      <div>TOTAL DATA DICETAK: ${tempFiltered.length} REKORD</div>
                    </div>

                    <table>
                      <thead>
                        <tr>
                          <th style="width: 4%;">No</th>
                          <th style="width: 12%;">No Reg</th>
                          <th style="width: 23%;">Calon Siswa / Identitas</th>
                          <th style="width: 8%;">Gender</th>
                          <th style="width: 22%;">Asal Sekolah</th>
                          <th style="width: 16%;">Nama Wali & Kontak</th>
                          <th style="width: 10%;">Tgl Daftar</th>
                          <th style="width: 11%;">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${rowsHtml || '<tr><td colspan="8" style="text-align: center; font-style: italic; color: #888;">Tidak ditemukan rekord pendaftar PPDB apapun.</td></tr>'}
                      </tbody>
                    </table>

                    <div class="stamp-area">
                      <div></div>
                      <div class="stamp">
                        <p>Kab. Bandung, ${new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p>Kepala Sekolah,</p>
                        <div style="height: 60px;"></div>
                        <p><strong><u>${sekolah.kepala_sekolah}</u></strong></p>
                        <p>NPSN. ${sekolah.npsn}</p>
                      </div>
                    </div>
                  </body>
                </html>
              `);
              printWindow.document.close();
            };

            return (
              <div className="space-y-6">
                {/* HEADER TITLE */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/60 border border-white/10 p-6 rounded-3xl">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Menu Laporan & Rekapitulasi PPDB</h3>
                    <p className="text-xs text-slate-400 mt-1">Audit, saring, verifikasi, dan ekspor laporan ppdb resmi bersumber dinamis dari basis data sekolah.</p>
                  </div>
                  <button 
                    onClick={triggerPrint}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500/20 rounded-xl text-xs font-bold text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/10"
                  >
                    🖨️ Cetak Laporan Resmi
                  </button>
                </div>

                {/* STATS COUNT */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Total Pendaftar</p>
                    <p className="text-2xl font-extrabold text-slate-100 mt-2">{statTotal} Calon</p>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-indigo-500 h-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Berkas Disetujui</p>
                    <p className="text-2xl font-extrabold text-emerald-400 mt-2">{statDisetujui} Calon</p>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: statTotal ? `${(statDisetujui / statTotal) * 100}%` : '0%' }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Dalam Proses</p>
                    <p className="text-2xl font-extrabold text-amber-400 mt-2">{statProses} Berkas</p>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-amber-500 h-full" style={{ width: statTotal ? `${(statProses / statTotal) * 100}%` : '0%' }}></div>
                    </div>
                  </div>
                  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Ditolak / Gugur</p>
                    <p className="text-2xl font-extrabold text-red-400 mt-2">{statDitolak} Berkas</p>
                    <div className="w-full bg-slate-800 h-1 rounded-full mt-3 overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: statTotal ? `${(statDitolak / statTotal) * 100}%` : '0%' }}></div>
                    </div>
                  </div>
                </div>

                {/* FILTERS TOOLBAR */}
                <div className="bg-slate-900/40 border border-white/10 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <div className="w-full sm:w-1/2 relative">
                    <input 
                      type="text"
                      value={filterReportSearch}
                      onChange={(e) => setFilterReportSearch(e.target.value)}
                      placeholder="Cari nama siswa, NIK, NISN, atau asal sekolah..."
                      className="w-full px-4 py-2.5 pl-9 bg-slate-950 border border-white/10 rounded-xl text-xs placeholder-slate-500 outline-none focus:border-indigo-500 transition-all text-slate-100"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">🔍</span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Verifikasi Saringan:</span>
                    <select 
                      value={filterReportStatus}
                      onChange={(e: any) => setFilterReportStatus(e.target.value)}
                      className="bg-slate-950 text-slate-200 border border-white/10 text-xs px-3 py-2 rounded-xl outline-none cursor-pointer"
                    >
                      <option value="semua">Semua Berkas ({statTotal})</option>
                      <option value="proses">Sedang Diproses ({statProses})</option>
                      <option value="disetujui">Lulus Seleksi ({statDisetujui})</option>
                      <option value="ditolak">Ditolak / Tidak Lulus ({statDitolak})</option>
                    </select>
                  </div>
                </div>

                {/* TABLE LIST REGISTRANTS */}
                <div className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/10 bg-slate-950/40 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <th className="p-4 text-center">No</th>
                          <th className="p-4">No Registrasi</th>
                          <th className="p-4">Identitas Siswa</th>
                          <th className="p-4 text-center">Gender</th>
                          <th className="p-4">Asal Sekolah</th>
                          <th className="p-4">Kontak Wali</th>
                          <th className="p-4 text-center">Status Berkas</th>
                          <th className="p-4 text-center">Aksi Operasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                        {tempFiltered.length > 0 ? (
                          tempFiltered.map((p, idx) => (
                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-4 text-center font-semibold text-slate-500">{idx + 1}</td>
                              <td className="p-4 font-mono font-bold text-indigo-400">{p.id}</td>
                              <td className="p-4">
                                <p className="font-extrabold text-white">{p.nama}</p>
                                <p className="text-[10px] text-slate-500 font-mono mt-0.5">NIK: {p.nik} {p.nisn ? `| NISN: ${p.nisn}` : ''}</p>
                                <p className="text-[9px] text-slate-550 mt-1">Lahir: {p.tempat_lahir}, {new Date(p.tanggal_lahir).toLocaleDateString('id-ID')}</p>
                              </td>
                              <td className="p-4 text-center">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-bold">
                                  {p.gender}
                                </span>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-slate-200">{p.sekolah_asal || '-'}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[150px]">{p.alamat}</p>
                              </td>
                              <td className="p-4">
                                <p className="font-bold text-slate-200">{p.nama_wali}</p>
                                <p className="text-[10px] text-indigo-400 font-mono mt-0.5">{p.kontak_wali}</p>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase inline-block border ${
                                  p.status === 'disetujui' 
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                                    : p.status === 'ditolak' 
                                      ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                                      : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                }`}>
                                  {p.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    onClick={() => handleUpdatePendaftarStatus(p.id, 'disetujui')}
                                    title="Setujui Berkas"
                                    className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/30 border border-emerald-500/20 text-emerald-450 rounded text-[9px] font-extrabold cursor-pointer transition-all"
                                  >
                                    Lulus
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePendaftarStatus(p.id, 'ditolak')}
                                    title="Tolak Berkas"
                                    className="px-2 py-1 bg-red-500/10 hover:bg-red-500/30 border border-red-500/20 text-red-455 rounded text-[9px] font-extrabold cursor-pointer transition-all"
                                  >
                                    Tolak
                                  </button>
                                  <button
                                    onClick={() => handleUpdatePendaftarStatus(p.id, 'proses')}
                                    title="Tunda / Proses"
                                    className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/30 border border-amber-500/20 text-amber-450 rounded text-[9px] font-extrabold cursor-pointer transition-all"
                                  >
                                    Tunda
                                  </button>
                                  <button
                                    onClick={() => handleDeletePendaftar(p.id, p.nama)}
                                    title="Hapus Rekord"
                                    className="p-1 text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/40 rounded transition-all cursor-pointer"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-500">
                              Tidak ditemukan data pendaftar PPDB yang sesuai dengan kriteria filter pendaftar.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* TAB: SEKOLAH PROFIL */}
          {activeTab === 'sekolah' && (
            <div className="space-y-6 max-w-3xl">
              <form onSubmit={handleApplyProfile} className="space-y-6 bg-slate-905/40 border border-white/10 p-6 lg:p-8 rounded-3xl">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-white/5 pb-3">Identitas Sekolah Dasar</h4>
              
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Lambang / Logo Sekolah Resmi *</label>
                <div className="flex items-center gap-4 bg-slate-950/40 p-4 border border-white/5 rounded-2xl">
                  <div className="w-16 h-16 bg-slate-950 border border-white/10 rounded-2xl flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-inner">
                    {tempProfile.logo ? (
                      <img src={tempProfile.logo} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[10px] text-slate-550 font-bold uppercase">No Logo</span>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input 
                      type="text" 
                      value={tempProfile.logo || ''}
                      onChange={(e) => setTempProfile({ ...tempProfile, logo: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white font-mono"
                      placeholder="Base64 URL atau link langsung gambar (.png/.jpg)"
                    />
                    <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold select-none cursor-pointer inline-flex items-center justify-center text-white">
                      Unggah File Logo Baru
                      <input type="file" onChange={(e) => handleImageUploadHelper(e, (url) => setTempProfile({ ...tempProfile, logo: url }))} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Sekolah</label>
                  <input 
                    type="text" 
                    value={tempProfile.nama || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, nama: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">NPSN</label>
                  <input 
                    type="text" 
                    value={tempProfile.npsn || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, npsn: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono focus:border-indigo-500 outline-none text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Peringkat Akreditasi</label>
                  <input 
                    type="text" 
                    value={tempProfile.akreditasi || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, akreditasi: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status Sekolah</label>
                  <input 
                    type="text" 
                    value={tempProfile.status || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, status: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Tahun Berdiri</label>
                  <input 
                    type="text" 
                    value={tempProfile.tahun_berdiri || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, tahun_berdiri: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Kepala Sekolah (Gelaran Penuh)</label>
                <input 
                  type="text" 
                  value={tempProfile.kepala_sekolah || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, kepala_sekolah: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Telepon Sekolah</label>
                  <input 
                    type="text" 
                    value={tempProfile.telepon || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, telepon: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Surel / Email Sekolah</label>
                  <input 
                    type="email" 
                    value={tempProfile.email || ''}
                    onChange={(e) => setTempProfile({ ...tempProfile, email: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Alamat Fizikal Lengkap</label>
                <textarea 
                  value={tempProfile.alamat || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, alamat: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pernyataan Visi Sekolah</label>
                <textarea 
                  value={tempProfile.visi || ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, visi: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Rencana Kerja / Misi Sekolah (Satu baris satu Misi)</label>
                <textarea 
                  value={tempProfile.misi ? tempProfile.misi.join('\n') : ''}
                  onChange={(e) => setTempProfile({ ...tempProfile, misi: e.target.value.split('\n').filter(Boolean) })}
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-xs focus:border-indigo-500 outline-none font-sans text-white text-justify"
                  placeholder="Masukkan pilar misi sekolah Anda..."
                />
              </div>

              <div className="pt-4 border-t border-white/5">
                <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-550 rounded-xl text-xs font-bold cursor-pointer text-white">
                  Terapkan Perubahan Profil
                </button>
              </div>
            </form>

            {/* BARU: KONTAK & WHATSAPP SETTINGS */}
            <form onSubmit={handleSaveKontakList} className="space-y-6 bg-slate-905/40 border border-white/10 p-6 lg:p-8 rounded-3xl">
              <div>
                <h4 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-1">Pengaturan Kontak & Admin WhatsApp</h4>
                <p className="text-xs text-slate-400">Atur nomor WhatsApp admin dan informasi kontak operasional sekolah. Semua perubahan akan disimpan langsung ke database dan di-render di website utama.</p>
              </div>
              
              <div className="space-y-4 border-t border-white/5 pt-4">
                {tempKontak.map((k, idx) => {
                  return (
                    <div key={k.id} className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black text-slate-300 uppercase tracking-wider">
                          {k.tipe === 'whatsapp' ? '🟢 NOMOR WHATSAPP CHAT WIDGET' : k.tipe === 'maps_embed' ? '🗺️ EMBED GOOGLE MAPS IFRAME URL' : '🕒 JAM OPERASIONAL'} ({k.label})
                        </label>
                        <span className="text-[9px] font-mono text-slate-500">ID: {k.id}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 mb-1">Label Kontak</span>
                          <input 
                            type="text" 
                            value={k.label}
                            onChange={(e) => {
                              const list = [...tempKontak];
                              list[idx].label = e.target.value;
                              setTempKontak(list);
                            }}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-slate-100 text-xs"
                            placeholder="Contoh: Admin PPDB"
                          />
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-slate-400 mb-1">Nilai Data (Value)</span>
                          <input 
                            type="text" 
                            value={k.value}
                            onChange={(e) => {
                              const list = [...tempKontak];
                              list[idx].value = e.target.value;
                              setTempKontak(list);
                            }}
                            className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-slate-100 text-xs font-mono"
                            placeholder={k.tipe === 'whatsapp' ? 'Contoh: 628123456789' : 'Isi link embed atau teks'}
                          />
                        </div>
                      </div>
                      {k.tipe === 'whatsapp' && (
                        <p className="text-[10px] text-indigo-400">💡 Gunakan format kode negara asli tanpa tanda hubung atau + (misal: <strong>628123456789</strong>). Ini mendasari link tombol WhatsApp melayang di portal siswa.</p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-white/5">
                <button 
                  type="submit" 
                  disabled={isSavingKontak}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-550 disabled:bg-indigo-800 text-white rounded-xl text-xs font-bold transition-all shadow-lg select-none cursor-pointer"
                >
                  {isSavingKontak ? 'Menyimpan...' : 'Simpan Kontak & WA Admin'}
                </button>
              </div>
            </form>
          </div>
        )}

          {/* TAB: BANNERS HERO SLIDER */}
          {activeTab === 'banners' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-3xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Tambah Banner Slider Baru</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Judul Utama Banner</label>
                      <input 
                        type="text" 
                        value={newBanner.judul || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, judul: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Urutan Tampil (Index)</label>
                      <input 
                        type="number" 
                        value={newBanner.urutan || 1}
                        onChange={(e) => setNewBanner({ ...newBanner, urutan: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Deskripsi / Subjudul</label>
                    <textarea 
                      value={newBanner.subjudul || ''}
                      onChange={(e) => setNewBanner({ ...newBanner, subjudul: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Teks Tombol Aksi</label>
                      <input 
                        type="text" 
                        value={newBanner.tombol_teks || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, tombol_teks: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tautan Tombol (Link)</label>
                      <input 
                        type="text" 
                        value={newBanner.tombol_link || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, tombol_link: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-semibold">Tautan URL Gambar / Foto Cover</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newBanner.gambar || ''}
                        onChange={(e) => setNewBanner({ ...newBanner, gambar: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold select-none cursor-pointer flex items-center justify-center">
                        Unggah Foto
                        <input type="file" onChange={(e) => handleImageUploadHelper(e, (url) => setNewBanner({ ...newBanner, gambar: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newBanner.judul || !newBanner.gambar) {
                        alert('Silakan lengkapi judul dan gambar banner.');
                        return;
                      }
                      handleAddEntity('banners', newBanner, () => setNewBanner({ judul: '', subjudul: '', gambar: '', tombol_teks: '', tombol_link: '', urutan: 1, is_active: 1 }));
                    }}
                    className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                  >
                    Simpan Banner Baru
                  </button>
                </div>
              </div>

              {/* Banner database list */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Banner Berjalan</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map(b => (
                    <div key={b.id} className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex flex-col justify-between">
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl bg-slate-850 overflow-hidden shrink-0 border border-white/10">
                          <img src={b.gambar} alt="Thumbnail banner" className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-extrabold text-white truncate">{b.judul}</p>
                          <p className="text-[10px] text-slate-400 truncate mt-1">{b.subjudul}</p>
                          <span className="inline-block mt-2 text-[9px] bg-indigo-500/15 text-indigo-300 font-bold px-2 py-0.5 rounded-md">Urutan: {b.urutan}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteEntity('banners', b.id)}
                        className="mt-4 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 rounded-xl text-[10px] font-bold text-rose-300 hover:text-white transition-all flex items-center justify-center gap-1.5 w-fit"
                      >
                        <Trash2 size={11} /> Buang Banner
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: FASILITAS INFRASTRUKTUR */}
          {activeTab === 'fasilitas' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-2xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Tambahkan Fasilitas Sekolah</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Nama Prasarana / Fasilitas</label>
                      <input 
                        type="text" 
                        value={newFasilitas.judul || ''}
                        onChange={(e) => setNewFasilitas({ ...newFasilitas, judul: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Urutan Tampil</label>
                      <input 
                        type="number" 
                        value={newFasilitas.urutan || 1}
                        onChange={(e) => setNewFasilitas({ ...newFasilitas, urutan: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Uraian / Deskripsi Fasilitas</label>
                    <textarea 
                      value={newFasilitas.deskripsi || ''}
                      onChange={(e) => setNewFasilitas({ ...newFasilitas, deskripsi: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tautan Gambar Prasarana</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newFasilitas.gambar || ''}
                        onChange={(e) => setNewFasilitas({ ...newFasilitas, gambar: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold select-none cursor-pointer flex items-center justify-center">
                        Unggah Foto
                        <input type="file" onChange={(e) => handleImageUploadHelper(e, (url) => setNewFasilitas({ ...newFasilitas, gambar: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newFasilitas.judul || !newFasilitas.deskripsi) {
                        alert('Silakan lengkapi form prasarana.');
                        return;
                      }
                      handleAddEntity('fasilitas', newFasilitas, () => setNewFasilitas({ judul: '', deskripsi: '', ikon: 'BookOpen', gambar: '', urutan: 1, is_active: 1 }));
                    }}
                    className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                  >
                    Simpan Fasilitas
                  </button>
                </div>
              </div>

              {/* Facilities list table layout */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Prasarana Terdaftar</h5>
                <div className="space-y-2">
                  {fasilitas.map(f => (
                    <div key={f.id} className="p-3.5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-950 border border-white/10 rounded-xl overflow-hidden shrink-0">
                          {f.gambar && <img src={f.gambar} alt="Thumbnail" className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-xs font-black text-white">{f.judul}</p>
                          <p className="text-[10px] text-slate-400 leading-relaxed max-w-xl truncate mt-0.5">{f.deskripsi}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEntity('fasilitas', f.id)} className="p-2 text-rose-400 hover:bg-white/10 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: EKSKUL */}
          {activeTab === 'ekskul' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-2xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Tambahkan Karakter/Ekskul Baru</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Nama Ekskul</label>
                      <input 
                        type="text" 
                        value={newEkskul.judul || ''}
                        onChange={(e) => setNewEkskul({ ...newEkskul, judul: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Urutan Tampil</label>
                      <input 
                        type="number" 
                        value={newEkskul.urutan || 1}
                        onChange={(e) => setNewEkskul({ ...newEkskul, urutan: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Uraian Kegiatan Ekskul</label>
                    <textarea 
                      value={newEkskul.deskripsi || ''}
                      onChange={(e) => setNewEkskul({ ...newEkskul, deskripsi: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      rows={2}
                    />
                  </div>

                  <button 
                    onClick={() => {
                      if (!newEkskul.judul || !newEkskul.deskripsi) {
                        alert('Silakan lengkapi form ekskul.');
                        return;
                      }
                      handleAddEntity('ekskul', newEkskul, () => setNewEkskul({ judul: '', deskripsi: '', ikon: 'Compass', gambar: '', urutan: 1, is_active: 1 }));
                    }}
                    className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                  >
                    Simpan Ekskul
                  </button>
                </div>
              </div>

              {/* Ekskul list */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Ekstrakurikuler Pilihan</h5>
                <div className="space-y-2">
                  {ekskul.map(e => (
                    <div key={e.id} className="p-3.5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-white">{e.judul}</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed truncate max-w-xl mt-0.5">{e.deskripsi}</p>
                      </div>
                      <button onClick={() => handleDeleteEntity('ekskul', e.id)} className="p-2 text-rose-400 hover:bg-white/10 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}          {/* TAB: GURU */}
          {activeTab === 'guru' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-3xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Daftarkan Staf Akademik / Guru</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Nama Lengkap (Dan Gelaran) *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Drs. Zackaria Hermawan, M.Pd."
                        value={newGuru.nama || ''}
                        onChange={(e) => setNewGuru({ ...newGuru, nama: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Mata Pelajaran Diampu</label>
                      <input 
                        type="text" 
                        placeholder="Matematika / Ilmu Kealaman"
                        value={newGuru.mapel || ''}
                        onChange={(e) => setNewGuru({ ...newGuru, mapel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Struktur Jabatan (Hirarki) *</label>
                      <select 
                        value={newGuru.jabatan_id || ''}
                        onChange={(e) => {
                          const valStr = e.target.value;
                          const selectedJab = jabatan.find(j => j.id === parseInt(valStr));
                          setNewGuru({ 
                            ...newGuru, 
                            jabatan_id: valStr ? parseInt(valStr) : undefined,
                            jabatan: selectedJab ? selectedJab.nama : 'Guru Pengajar'
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white cursor-pointer outline-none"
                      >
                        <option value="">-- Pilih Tingkatan Jabatan / Hirarki --</option>
                        {jabatan.map(j => (
                          <option key={j.id} value={j.id}>{j.nama} (Level {j.tingkat})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Indeks Urutan Tampil</label>
                      <input 
                        type="number" 
                        value={newGuru.urutan || 1}
                        onChange={(e) => setNewGuru({ ...newGuru, urutan: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">NIK (16 Digit) *</label>
                      <input 
                        type="text" 
                        maxLength={16}
                        placeholder="3273120000000000"
                        value={newGuru.nik || ''}
                        onChange={(e) => setNewGuru({ ...newGuru, nik: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">NUPTK (Opsional)</label>
                      <input 
                        type="text" 
                        placeholder="890123456789"
                        value={newGuru.nuptk || ''}
                        onChange={(e) => setNewGuru({ ...newGuru, nuptk: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Wali Kelas Yang Diajar (Bila Ada)</label>
                      <input 
                        type="text" 
                        placeholder="Kelas VII-A"
                        value={newGuru.wali_kelas || ''}
                        onChange={(e) => setNewGuru({ ...newGuru, wali_kelas: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Kontak Telepon / WhatsApp *</label>
                      <input 
                        type="text" 
                        placeholder="0812345678"
                        value={newGuru.kontak || ''}
                        onChange={(e) => setNewGuru({ ...newGuru, kontak: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Surel / Email Aktif</label>
                    <input 
                      type="email" 
                      placeholder="zackaria@sekolah.sch.id"
                      value={newGuru.email || ''}
                      onChange={(e) => setNewGuru({ ...newGuru, email: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tautan / Unggah Foto Profil Guru</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newGuru.foto || ''}
                        onChange={(e) => setNewGuru({ ...newGuru, foto: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                        placeholder="Format Base64 atau Tautan eksternal langsung"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold select-none cursor-pointer flex items-center justify-center text-white">
                        Unggah Foto
                        <input type="file" onChange={(e) => handleImageUploadHelper(e, (url) => setNewGuru({ ...newGuru, foto: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newGuru.nama || !newGuru.nik || !newGuru.kontak) {
                        alert('Silakan isi Nama, NIK, dan Kontak guru.');
                        return;
                      }
                      handleAddEntity('guru', newGuru, () => setNewGuru({ nama: '', jabatan: 'Guru Pengajar', mapel: '', foto: '', urutan: 1, is_active: 1, nik: '', nuptk: '', jabatan_id: undefined, wali_kelas: '', kontak: '', email: '' }));
                    }}
                    className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                  >
                    Daftarkan Pendidik
                  </button>
                </div>
              </div>

              {/* Teachers grid lists */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Pendidik Sekolah</h5>
                <div className="grid grid-cols-1 gap-4">
                  {guru.map(g => (
                    <div key={g.id} className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-slate-950 rounded-xl border border-white/15 overflow-hidden shrink-0 flex items-center justify-center text-xs font-bold uppercase text-white shadow-md">
                          {g.foto ? <img src={g.foto} alt="profil" referrerPolicy="no-referrer" className="w-full h-full object-cover" /> : g.nama.slice(0, 2)}
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-extrabold text-white">{g.nama}</p>
                          <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                            {g.jabatan} {g.mapel ? `— ${g.mapel}` : ''}
                          </p>
                          <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                            <span>NIK: <strong className="text-slate-300 font-mono">{g.nik || '-'}</strong></span>
                            {g.nuptk && <span>NUPTK: <strong className="text-slate-300 font-mono">{g.nuptk}</strong></span>}
                            {g.wali_kelas && <span>Wali Kelas: <strong className="text-indigo-300">{g.wali_kelas}</strong></span>}
                            <span>Hub: <strong className="text-slate-300">{g.kontak}</strong></span>
                            {g.email && <span>Email: <strong className="text-slate-300">{g.email}</strong></span>}
                          </div>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEntity('guru', g.id)} className="p-2 text-rose-450 hover:bg-rose-500/10 rounded-xl transition-all shrink-0">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PRESTASI */}
          {activeTab === 'prestasi' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-3xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Tambahkan Penghargaan & Prestasi</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Nama Prestasi / Juara Diraih</label>
                      <input 
                        type="text" 
                        value={newPrestasi.judul || ''}
                        onChange={(e) => setNewPrestasi({ ...newPrestasi, judul: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tahun Kejohanan</label>
                      <input 
                        type="text" 
                        value={newPrestasi.tahun || '2026'}
                        onChange={(e) => setNewPrestasi({ ...newPrestasi, tahun: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Rincian / Keterangan Prestasi</label>
                    <textarea 
                      value={newPrestasi.deskripsi || ''}
                      onChange={(e) => setNewPrestasi({ ...newPrestasi, deskripsi: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tautan Gambar Piagam / Dokumentasi</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newPrestasi.gambar || ''}
                        onChange={(e) => setNewPrestasi({ ...newPrestasi, gambar: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold select-none cursor-pointer flex items-center justify-center">
                        Unggah Foto
                        <input type="file" onChange={(e) => handleImageUploadHelper(e, (url) => setNewPrestasi({ ...newPrestasi, gambar: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newPrestasi.judul || !newPrestasi.deskripsi) {
                        alert('Silakan isi form prestasi secara lengkap.');
                        return;
                      }
                      handleAddEntity('prestasi', newPrestasi, () => setNewPrestasi({ judul: '', tahun: '2026', deskripsi: '', gambar: '', urutan: 1, is_active: 1 }));
                    }}
                    className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                  >
                    Simpan Prestasi
                  </button>
                </div>
              </div>

              {/* Achievements table display list */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Penghargaan Tersimpan</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {prestasi.map(p => (
                    <div key={p.id} className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex flex-col justify-between">
                      <div className="flex gap-3">
                        <div className="w-14 h-14 bg-slate-950 border border-white/15 rounded-xl overflow-hidden shrink-0">
                          {p.gambar && <img src={p.gambar} alt="Juara" className="w-full h-full object-cover" />}
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-extrabold text-white truncate">{p.judul}</p>
                          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed max-w-md truncate">{p.deskripsi}</p>
                          <span className="inline-block mt-2 px-2.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 rounded-full text-[9px] font-bold">Tahun {p.tahun}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteEntity('prestasi', p.id)}
                        className="mt-4 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 text-rose-300 hover:text-white rounded-xl text-[10px] font-black w-fit flex items-center gap-1.5"
                      >
                        <Trash2 size={11} /> Buang Penghargaan
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: GALERI */}
          {activeTab === 'galeri' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-3xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Tambahkan Konten Galeri Baru</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Judul Momen Dokumentasi</label>
                      <input 
                        type="text" 
                        value={newGaleri.judul || ''}
                        onChange={(e) => setNewGaleri({ ...newGaleri, judul: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tipe File / Media</label>
                      <select 
                        value={newGaleri.tipe}
                        onChange={(e: any) => setNewGaleri({ ...newGaleri, tipe: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-300"
                      >
                        <option value="image">Gambar / Foto</option>
                        <option value="youtube">Video YouTube</option>
                      </select>
                    </div>
                  </div>

                  {newGaleri.tipe === 'youtube' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">YouTube ID Video</label>
                        <input 
                          type="text" 
                          value={newGaleri.embed_id || ''}
                          onChange={(e) => setNewGaleri({ ...newGaleri, embed_id: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                          placeholder="cth: dQw4w9WgXcQ"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tautan Penonton (Video URL)</label>
                        <input 
                          type="text" 
                          value={newGaleri.embed_url || ''}
                          onChange={(e) => setNewGaleri({ ...newGaleri, embed_url: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                          placeholder="https://youtube.com/watch?v=..."
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tautan Gambar Utama / Poster Cover Video</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newGaleri.gambar || ''}
                        onChange={(e) => setNewGaleri({ ...newGaleri, gambar: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold select-none cursor-pointer flex items-center justify-center">
                        Unggah Gambar
                        <input type="file" onChange={(e) => handleImageUploadHelper(e, (url) => setNewGaleri({ ...newGaleri, gambar: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newGaleri.judul || !newGaleri.gambar) {
                        alert('Silakan isi judul dan tautan cover galeri.');
                        return;
                      }
                      handleAddEntity('galeri', newGaleri, () => setNewGaleri({ judul: '', gambar: '', tipe: 'image', embed_id: '', embed_url: '', urutan: 1, is_active: 1 }));
                    }}
                    className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                  >
                    Simpan Galeri Momen
                  </button>
                </div>
              </div>

              {/* Gallery elements display list */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Galeri Tersimpan</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {galeri.map(g => (
                    <div key={g.id} className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden group">
                      <div className="h-28 bg-slate-950 relative">
                        <img src={g.gambar} alt="Gal" className="w-full h-full object-cover" />
                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-slate-950/80 border border-white/10 text-[8px] rounded-md font-bold uppercase tracking-wider text-indigo-400">
                          {g.tipe}
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-[10px] font-extrabold text-white truncate">{g.judul}</p>
                        <button 
                          onClick={() => handleDeleteEntity('galeri', g.id)}
                          className="mt-2 text-[10px] text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 hover:underline progress-colors"
                        >
                          <Trash2 size={10} /> Hapus Item
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ARTIKEL */}
          {activeTab === 'artikel' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-3xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Buat Artikel / Laporan Berita Baru</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Judul Pengumuman/Artikel</label>
                      <input 
                        type="text" 
                        value={newArtikel.judul || ''}
                        onChange={(e) => setNewArtikel({ ...newArtikel, judul: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tanggal Rilis Laporan</label>
                      <input 
                        type="date" 
                        value={newArtikel.tanggal || ''}
                        onChange={(e) => setNewArtikel({ ...newArtikel, tanggal: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-350"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Ringkasan Pendek (Untuk Feed Web Depan)</label>
                    <textarea 
                      value={newArtikel.ringkasan || ''}
                      onChange={(e) => setNewArtikel({ ...newArtikel, ringkasan: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      rows={2}
                      placeholder="Masukkan ringkasan singkat artikel..."
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Cover Banner Artikel / Thumbnail</label>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        value={newArtikel.gambar || ''}
                        onChange={(e) => setNewArtikel({ ...newArtikel, gambar: e.target.value })}
                        className="flex-1 px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                      <label className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold select-none cursor-pointer flex items-center justify-center">
                        Unggah Foto
                        <input type="file" onChange={(e) => handleImageUploadHelper(e, (url) => setNewArtikel({ ...newArtikel, gambar: url }))} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase font-medium">Isi Utama Kandungan Artikel (Format Teks HTML)</label>
                    <textarea 
                      value={newArtikel.isi || ''}
                      onChange={(e) => setNewArtikel({ ...newArtikel, isi: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono"
                      rows={6}
                      placeholder="Masukkan format HTML lengkap, cth: <p>Pelaksanaan berlangsung meriah...</p>"
                    />
                  </div>

                  <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[10px] uppercase font-bold text-slate-450">Satus Publikasi:</span>
                      <div className="flex gap-2">
                        <button 
                          type="button"
                          onClick={() => setNewArtikel({ ...newArtikel, status: 'draft' })}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                            newArtikel.status === 'draft' 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' 
                              : 'border-white/10 text-slate-400'
                          }`}
                        >
                          Draft (Kotak Masuk)
                        </button>
                        <button 
                          type="button"
                          onClick={() => setNewArtikel({ ...newArtikel, status: 'publish' })}
                          className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                            newArtikel.status === 'publish' 
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                              : 'border-white/10 text-slate-400'
                          }`}
                        >
                          Publish (Publikasikan)
                        </button>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        if (!newArtikel.judul || !newArtikel.isi) {
                          alert('Silakan tulis judul dan isi terlebih dahulu.');
                          return;
                        }
                        handleAddEntity('artikel', newArtikel, () => setNewArtikel({ judul: '', ringkasan: '', isi: '', gambar: '', status: 'draft', tanggal: new Date().toISOString().split('T')[0] }));
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                    >
                      Unggah Artikel Baru
                    </button>
                  </div>
                </div>
              </div>

              {/* Articles lists database */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Artikel Tersedia</h5>
                <div className="space-y-2">
                  {artikel.map(art => (
                    <div key={art.id} className="p-3.5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-bold ${
                          art.status === 'publish' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-amber-550/10 border border-amber-500/20 text-amber-300'
                        }`}>
                          {art.status}
                        </span>
                        <div>
                          <p className="text-xs font-black text-slate-100">{art.judul}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{art.tanggal}</p>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteEntity('artikel', art.id)} className="p-2 text-rose-450 hover:bg-white/10 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: NAVBAR CUSTOM MENUS */}
          {activeTab === 'menus' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-2xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">Buat Tautan/Menu Utama Baru</h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Label Navigasi Menu</label>
                      <input 
                        type="text" 
                        value={newMenu.label || ''}
                        onChange={(e) => setNewMenu({ ...newMenu, label: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Target Tautan URL (Anchor Link)</label>
                      <input 
                        type="text" 
                        value={newMenu.url || ''}
                        onChange={(e) => setNewMenu({ ...newMenu, url: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Induk Menu (Parent)</label>
                      <select 
                        value={newMenu.parent_id || ''}
                        onChange={(e) => setNewMenu({ ...newMenu, parent_id: e.target.value ? parseInt(e.target.value) : null })}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-350"
                      >
                        <option value="">-- Menu Tingkatan Utama --</option>
                        {menus.filter(m => m.parent_id === null).map(pm => (
                          <option key={pm.id} value={pm.id}>{pm.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Penomoran Indeks Urut</label>
                      <input 
                        type="number" 
                        value={newMenu.urutan || 0}
                        onChange={(e) => setNewMenu({ ...newMenu, urutan: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newMenu.label || !newMenu.url) {
                        alert('Silakan diisi label menu beserta url pautannya.');
                        return;
                      }
                      handleAddEntity('menus', newMenu, () => setNewMenu({ label: '', url: '', parent_id: null, urutan: 0, is_active: 1 }));
                    }}
                    className="mt-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                  >
                    Simpan Desain Menu
                  </button>
                </div>
              </div>

              {/* Menu listings */}
              <div className="space-y-3 max-w-3xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Struktur Menu Dinamis Website</h5>
                <div className="space-y-2">
                  {menus.map(m => (
                    <div key={m.id} className="p-3 bg-slate-900 border border-white/5 rounded-xl flex items-center justify-between">
                      <div className="text-xs font-semibold text-slate-200">
                        {m.parent_id ? '　↳ SUB: ' : '■ UTAMA: '}
                        <span className="font-extrabold text-white text-sm">{m.label}</span>
                        <code className="text-[10px] text-indigo-400 font-mono ml-3">({m.url})</code>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded ml-3">Urutan Tampil: {m.urutan}</span>
                      </div>
                      <button onClick={() => handleDeleteEntity('menus', m.id)} className="p-1.5 text-rose-450 hover:bg-white/10 rounded-lg">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: JABATAN (HIRARKI) */}
          {activeTab === 'jabatan' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-2xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">
                  Tambahkan Jabatan Struktural Baru
                </h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Nama Jabatan *</label>
                      <input 
                        type="text" 
                        placeholder="Kepala Sekolah / Wali Kelas VII"
                        value={newJabatan.nama || ''}
                        onChange={(e) => setNewJabatan({ ...newJabatan, nama: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tingkatan Urutan Hirarki (1 Tergolong Tertinggi) *</label>
                      <input 
                        type="number" 
                        min={1}
                        max={10}
                        placeholder="1"
                        value={newJabatan.tingkat || 3}
                        onChange={(e) => setNewJabatan({ ...newJabatan, tingkat: parseInt(e.target.value) || 3 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-indigo-500"
                      />
                      <p className="text-[9px] text-slate-450 mt-1">Contoh: 1 = Yayasan, 2 = Kepala Sekolah, 3 = Wakil, 4 = Guru</p>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newJabatan.nama) {
                        alert('Silakan isi nama jabatan.');
                        return;
                      }
                      handleAddEntity('jabatan', newJabatan, () => setNewJabatan({ nama: '', tingkat: 3, is_active: 1 }));
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Simpan Jabatan
                  </button>
                </div>
              </div>

              {/* Jabatan inventory lists */}
              <div className="space-y-3 max-w-2xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Hirarki Jabatan Terdaftar</h5>
                <div className="space-y-2">
                  {[...jabatan].sort((a,b) => a.tingkat - b.tingkat).map(jab => (
                    <div key={jab.id} className="p-3.5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-white">{jab.nama}</p>
                        <p className="text-[10px] text-indigo-400 font-bold uppercase mt-0.5">Tingkatan Level: {jab.tingkat}</p>
                      </div>
                      <button onClick={() => handleDeleteEntity('jabatan', jab.id)} className="p-2 text-rose-450 hover:bg-white/10 rounded-xl transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: PPDB REKRUTMEN */}
          {activeTab === 'ppdb' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-2xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">
                  Buat Gelombang PPDB Baru
                </h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tahun Ajaran *</label>
                      <input 
                        type="text" 
                        placeholder="2026/2027"
                        value={newPPDB.tahun_ajaran || ''}
                        onChange={(e) => setNewPPDB({ ...newPPDB, tahun_ajaran: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Gelombang Penerimaan *</label>
                      <input 
                        type="text" 
                        placeholder="Gelombang I (Utama)"
                        value={newPPDB.gelombang || ''}
                        onChange={(e) => setNewPPDB({ ...newPPDB, gelombang: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Kuota Penerimaan *</label>
                      <input 
                        type="number" 
                        placeholder="160"
                        value={newPPDB.kuota || 100}
                        onChange={(e) => setNewPPDB({ ...newPPDB, kuota: parseInt(e.target.value) || 100 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">WhatsApp Humas Panitia *</label>
                      <input 
                        type="text" 
                        placeholder="0812345678"
                        value={newPPDB.kontak_wa || ''}
                        onChange={(e) => setNewPPDB({ ...newPPDB, kontak_wa: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Mulai Tanggal</label>
                      <input 
                        type="date" 
                        value={newPPDB.mulai || ''}
                        onChange={(e) => setNewPPDB({ ...newPPDB, mulai: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Selesai Tanggal</label>
                      <input 
                        type="date" 
                        value={newPPDB.selesai || ''}
                        onChange={(e) => setNewPPDB({ ...newPPDB, selesai: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Keterangan / Persyaratan Syarat Daftar</label>
                    <textarea 
                      placeholder="Membawa salinan kartu keluarga, pas foto ukuran 3x4..."
                      value={newPPDB.keterangan || ''}
                      onChange={(e) => setNewPPDB({ ...newPPDB, keterangan: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Status Gelombang PPDB ini</label>
                      <select 
                        value={newPPDB.is_active}
                        onChange={(e) => setNewPPDB({ ...newPPDB, is_active: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      >
                        <option value={1}>Buka / Aktif Online</option>
                        <option value={0}>Tutup / Non-aktif</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Tautan PPDB Eksternal (Bila Ada)</label>
                      <input 
                        type="text" 
                        placeholder="https://ppdb.sekolah.go.id"
                        value={newPPDB.link_pendaftaran || ''}
                        onChange={(e) => setNewPPDB({ ...newPPDB, link_pendaftaran: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (!newPPDB.tahun_ajaran || !newPPDB.gelombang || !newPPDB.kontak_wa) {
                        alert('Silakan isi Tahun Ajaran, Gelombang, dan WhatsApp Panitia.');
                        return;
                      }
                      handleAddEntity('ppdb', newPPDB, () => setNewPPDB({ tahun_ajaran: '2026/2027', gelombang: 'Gelombang I', keterangan: '', mulai: '', selesai: '', kuota: 150, link_pendaftaran: '', kontak_wa: '', is_active: 1 }));
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Simpan Gelombang PPDB
                  </button>
                </div>
              </div>

              {/* PPDB lists */}
              <div className="space-y-3 max-w-2xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Gelombang PPDB Berjalan</h5>
                <div className="space-y-2">
                  {ppdb.map(p => (
                    <div key={p.id} className="p-4 bg-slate-900 border border-white/10 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] uppercase px-2 py-0.5 rounded-md font-bold ${
                            p.is_active === 1 ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300' : 'bg-slate-950 text-slate-500 border border-white/5'
                          }`}>
                            {p.is_active === 1 ? 'Buka / Aktif' : 'Tutup'}
                          </span>
                          <p className="text-xs font-black text-white">Tahun {p.tahun_ajaran} — {p.gelombang}</p>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">Kuota Terdaftar: <strong className="text-sans text-indigo-400">{p.kuota} Siswa</strong> | Panitia WA: <strong className="font-mono text-slate-300">{p.kontak_wa}</strong></p>
                      </div>
                      <button onClick={() => handleDeleteEntity('ppdb', p.id)} className="p-2 text-rose-450 hover:bg-white/10 rounded-xl transition-all">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: USERS ACCOUNT ACCESS (ADMIN ONLY) */}
          {activeTab === 'users' && currentUser.role === 'admin' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl max-w-2xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4">
                  {editingUserId ? `Sunting Akun Pengguna: ${newOperator.username}` : 'Tambahkan Akun Akses Operator Baru'}
                </h5>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">User Login Name</label>
                      <input 
                        type="text" 
                        value={newOperator.username}
                        onChange={(e) => setNewOperator({ ...newOperator, username: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs" 
                        disabled={editingUserId !== null}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
                        {editingUserId ? 'Kata Laluan Baru (Kosongkan bila tetap)' : 'Kata Laluan (Plain Password)'}
                      </label>
                      <input 
                        type="password" 
                        value={newOperator.passwordPlain}
                        onChange={(e) => setNewOperator({ ...newOperator, passwordPlain: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs" 
                        placeholder={editingUserId ? 'Ketikan password baru...' : ''}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Nama Operator Lengkap</label>
                      <input 
                        type="text" 
                        value={newOperator.nama_lengkap}
                        onChange={(e) => setNewOperator({ ...newOperator, nama_lengkap: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs" 
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Hak Akses Peran</label>
                      <select 
                        value={newOperator.role}
                        onChange={(e: any) => setNewOperator({ ...newOperator, role: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs text-slate-300"
                        disabled={editingUserId === currentUser.id}
                      >
                        <option value="operator">Operator Pengurus Sekolah</option>
                        <option value="admin">Administrator Global</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {editingUserId ? (
                      <>
                        <button 
                          onClick={async () => {
                            if (!newOperator.username || !newOperator.nama_lengkap) {
                              alert('Silakan diisi nama login dan nama lengkapnya.');
                              return;
                            }
                            setActionPending(true);
                            const payload: any = {
                              username: newOperator.username,
                              role: newOperator.role,
                              nama_lengkap: newOperator.nama_lengkap,
                              email: newOperator.email,
                            };
                            if (newOperator.passwordPlain.trim()) {
                              payload.passwordPlain = newOperator.passwordPlain.trim();
                            }
                            const success = await onCrud('users', 'PUT', payload, editingUserId);
                            if (success) {
                              setEditingUserId(null);
                              setNewOperator({ username: '', passwordPlain: '', role: 'operator', nama_lengkap: '', email: '' });
                            }
                            setActionPending(false);
                          }}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-505 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                        >
                          Simpan Perubahan
                        </button>
                        <button 
                          onClick={() => {
                            setEditingUserId(null);
                            setNewOperator({ username: '', passwordPlain: '', role: 'operator', nama_lengkap: '', email: '' });
                          }}
                          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                        >
                          Batal
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => {
                          if (!newOperator.username || !newOperator.passwordPlain) {
                            alert('Silakan diisi nama login dan passwordnya.');
                            return;
                          }
                          handleAddEntity('users', newOperator, () => setNewOperator({ username: '', passwordPlain: '', role: 'operator', nama_lengkap: '', email: '' }));
                        }}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-bold leading-none cursor-pointer text-white"
                      >
                        Daftarkan Operator
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Users list */}
              <div className="space-y-3 max-w-2xl">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest">Daftar Akun Pengguna Terdaftar</h5>
                <div className="space-y-2">
                  {users.map(u => (
                    <div key={u.id} className="p-3.5 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="text-xs font-black text-white">{u.nama_lengkap} <span className="font-semibold text-[11px] text-slate-450">({u.username})</span></p>
                        <p className="text-[10px] text-indigo-400 font-extrabold uppercase mt-0.5">{u.role} Sistem</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setEditingUserId(u.id);
                            setNewOperator({
                              username: u.username,
                              passwordPlain: '',
                              role: u.role,
                              nama_lengkap: u.nama_lengkap,
                              email: u.email || ''
                            });
                          }} 
                          className="p-2 text-indigo-400 hover:bg-white/5 rounded-lg border border-white/5 transition-all text-[11px] flex items-center gap-1.5 cursor-pointer"
                          title="Sunting Pengguna"
                        >
                          <Edit2 size={12} className="shrink-0" /> Edit
                        </button>
                        {u.id !== currentUser.id && (
                          <button onClick={() => handleDeleteEntity('users', u.id)} className="p-2 text-rose-450 hover:bg-white/10 rounded-lg cursor-pointer">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SECURE AUDIT LOG EVENTS (ADMIN ONLY) */}
          {activeTab === 'logs' && currentUser.role === 'admin' && (
            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-xs font-black text-slate-450 uppercase tracking-widest">Histori Operasi Detektor Audit Aktivitas</h5>
                <span className="text-[10px] bg-slate-900 border border-white/10 px-2 py-0.5 rounded-md text-slate-400">Pencatatan Berjalan</span>
              </div>

              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-2">
                {logs.map(lg => (
                  <div key={lg.id} className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-xs flex flex-col md:flex-row justify-between md:items-center gap-2">
                    <div>
                      <div className="flex items-center gap-2.5 text-[10px] text-slate-400 font-bold mb-1">
                        <span className="text-indigo-450">IP: {lg.ip_address}</span>
                        <span>•</span>
                        <span>User: <strong className="text-slate-205">{lg.username}</strong></span>
                        <span>•</span>
                        <span>{new Date(lg.created_at).toLocaleString('id-ID')}</span>
                      </div>
                      <p className="text-white font-extrabold tracking-tight text-sm">{lg.aksi}</p>
                      <p className="text-slate-400 text-xs mt-1 leading-relaxed text-justify">{lg.detail}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-slate-950 text-indigo-400 text-[9px] font-bold rounded-lg border border-white/5 h-fit shrink-0 truncate uppercase">
                      Audited Event
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: GLOBAL SEO SETTINGS & BACKUPS (ADMIN ONLY) */}
          {activeTab === 'pengaturan' && currentUser.role === 'admin' && (
            <div className="space-y-6 max-w-3xl">
              <form onSubmit={handleApplySettings} className="space-y-5 bg-slate-900 border border-white/10 p-6 lg:p-8 rounded-3xl">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Metatag SEO & Copywrite</h5>
                
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Judul Penuh Website (SEO Site Title)</label>
                  <input 
                    type="text" 
                    value={tempSettings.site_title || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, site_title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs" 
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Google/Bing Search Meta Deskripsi</label>
                  <textarea 
                    value={tempSettings.meta_description || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, meta_description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs" 
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase">Teks Copyright Kaki Halaman (Footer Text)</label>
                  <input 
                    type="text" 
                    value={tempSettings.footer_text || ''}
                    onChange={(e) => setTempSettings({ ...tempSettings, footer_text: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-xs" 
                  />
                </div>

                <div className="pt-2">
                  <button type="submit" className="px-5 py-2.5 bg-indigo-650 hover:bg-indigo-600 rounded-xl text-xs font-bold leading-none cursor-pointer text-white">
                    Simpan Konfigurasi Web
                  </button>
                </div>
              </form>

              {/* Backups section */}
              <div className="bg-slate-900 border border-white/10 p-6 lg:p-8 rounded-3xl space-y-4">
                <h5 className="text-xs font-black text-indigo-300 uppercase tracking-widest">Interoperabilitas & Database Cadangan (JSON)</h5>
                <p className="text-xs text-slate-400 leading-relaxed max-w-2xl text-justify">
                  Backup seluruh database sekolah (termasuk pengguna, prasarana, artikel, galeri) ke berkas JSON murni untuk memindahkan atau mendownload file data. Anda juga dapat dengan mudah memulihkannya menggunakan bidang restorasi manual di bawah.
                </p>

                <div className="pt-2 flex flex-col md:flex-row gap-4 items-start md:items-center">
                  <button 
                    onClick={onBackup}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
                  >
                    <Download size={14} /> Download File JSON Cadangan
                  </button>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-3">
                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Tempelkan Konten Teks JSON Cadangan untuk Dipulihkan:</label>
                  <textarea 
                    value={restoreJson}
                    onChange={(e) => setRestoreJson(e.target.value)}
                    rows={4}
                    placeholder='{"users": [...], "sekolah": {...}, "banners": [...] }'
                    className="w-full p-3 bg-slate-950 border border-white/10 rounded-xl text-xs font-mono"
                  />
                  <button 
                    onClick={handleTriggerRestore}
                    className="px-4 py-2.5 bg-rose-650 hover:bg-rose-600 rounded-xl text-rose-100 font-bold text-xs flex items-center gap-2 cursor-pointer"
                  >
                    <Database size={13} /> Terapkan Pemulihan Basis Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADVANCED IMPORT / EXPORT DATA (ADMIN ONLY) */}
          {activeTab === 'import_export' && currentUser.role === 'admin' && (
            <div className="space-y-6 max-w-5xl">
              
              {/* Main Info Banner */}
              <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-indigo-500/10 p-5 rounded-2xl relative overflow-hidden">
                <div className="absolute -right-20 -bottom-20 w-72 h-72 bg-indigo-505/10 rounded-full blur-3xl pointer-events-none"></div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Database size={16} className="text-indigo-400" />
                  SISTEM INTEGRASI IMPORT & EXPORT DATA SEKOLAH
                </h4>
                <p className="text-[11px] text-slate-300 mt-2 leading-relaxed max-w-4xl">
                  Fitur ini dipergunakan untuk melakukan pengelolaan data awal sekolah secara massal. Anda dapat mengunduh seluruh isi instansi basis data sekolah ke file terenkripsi lokal, mempublikasikan template spreadsheet ke CSV, serta memproses import instan baik dari berkas ekspor cadangan maupun dari spreadsheet kelolaan luar.
                </p>
              </div>

              {/* TWO COLUMN GRID FOR IMPORT & EXPORT */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT COLUMN: EXPORT DATA */}
                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                      <Download size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wide">📤 EXPORT DATA SEKOLAH</h5>
                      <p className="text-[9px] text-slate-400 mt-0.5">Simpan data sekolah lokal ke format file JSON</p>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Sistem akan mengekspor seluruh tabel di basis data (sekolah, guru, ekskul, fasilitas, berita, sejarah, dll.) menjadi sebuah file JSON portabel yang bisa disimpan aman sebagai salinan.
                  </p>

                  {/* OPTIONS PANEL */}
                  <div className="bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3">
                    <h6 className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-wider">Opsi Ekspor:</h6>
                    
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={exportWithImages} 
                        onChange={(e) => setExportWithImages(e.target.checked)}
                        className="mt-1 rounded bg-slate-950 border-white/10 text-indigo-650 focus:ring-0" 
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-200">Sertakan Gambar (Base64)</span>
                        <p className="text-[9px] text-slate-450">Memasukkan dokumen logo, foto guru dan infrastruktur secara penuh.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={exportOnlyStructure} 
                        onChange={(e) => setExportOnlyStructure(e.target.checked)}
                        className="mt-1 rounded bg-slate-950 border-white/10 text-indigo-650 focus:ring-0" 
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-200">Hanya Struktur (Tanpa Data Transaksional)</span>
                        <p className="text-[9px] text-slate-450">Hanya mengekspor instansi dan mengosongkan baris pendaftar PPDB / log sistem.</p>
                      </div>
                    </label>
                  </div>

                  <button 
                    onClick={handleDownloadExport}
                    className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer shadow-lg shadow-indigo-900/10"
                  >
                    <Download size={14} /> DOWNLOAD EXPORT FILE (JSON)
                  </button>
                </div>

                {/* RIGHT COLUMN: IMPORT DATA AWAL */}
                <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                      <Upload size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wide">📥 IMPORT DATA AWAL</h5>
                      <p className="text-[9px] text-slate-400 mt-0.5">Upload file JSON ekspor atau spreadsheet CSV</p>
                    </div>
                  </div>

                  {/* Warning message */}
                  <div className="bg-amber-500/5 border border-amber-500/10 p-3 rounded-xl flex items-start gap-2.5">
                    <ShieldAlert size={14} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wide">⚠️ Peringatan Penting :</span>
                      <p className="text-[9.5px] text-amber-200/80 leading-relaxed mt-0.5">
                        Proses import data dari file luar akan menimpa baris rekaman saat ini di basis data. Sangat direkomendasikan menyalakan opsi backup otomatis sebelum eksekusi.
                      </p>
                    </div>
                  </div>

                  {/* CONFIG CHEKBOXES */}
                  <div className="bg-slate-950/40 p-3.5 border border-white/5 rounded-xl space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={importWithBackup} 
                        onChange={(e) => setImportWithBackup(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-950 border-white/10 text-emerald-650 focus:ring-0" 
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-200">Backup database otomatis sebelum menimpa</span>
                        <p className="text-[9px] text-slate-450">Sistem akan secara instan menyimpan database lama agar bisa di-restore bila terjadi kesalahan.</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={importOnlyEmpty} 
                        onChange={(e) => setImportOnlyEmpty(e.target.checked)}
                        className="mt-0.5 rounded bg-slate-950 border-white/10 text-emerald-650 focus:ring-0" 
                      />
                      <div>
                        <span className="text-[11px] font-bold text-slate-200">Hanya update data kosong / gabung data baru</span>
                        <p className="text-[9px] text-slate-450">Mencegah data yang sudah terisi di sistem saat ini hancur berantakan ditimpa ulang.</p>
                      </div>
                    </label>
                  </div>

                  {/* FILE SELECTOR / DROPZONE */}
                  <div className="border border-dashed border-white/10 hover:border-emerald-500/30 rounded-xl p-5 bg-slate-950/40 text-center relative transition duration-250">
                    <input 
                      type="file" 
                      accept=".json,.csv"
                      onChange={handleImportFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                    <Upload size={22} className="mx-auto text-slate-500 mb-2" />
                    <p className="text-xs font-bold text-slate-300">
                      {importFileName ? `Selected: ${importFileName}` : 'Klik untuk Telusuri File atau Seret Kesini'}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1">Hanya mendukung format file JSON (.json) atau Spreadsheet (.csv)</p>
                  </div>

                  {/* TRIGGER SUBMIT */}
                  {importFileContent && (
                    <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/15 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check size={14} className="text-emerald-400" />
                        <span className="text-[10px] font-bold text-emerald-300">File Terbaca & Siap Dipasang ({ (importFileContent.length / 1024).toFixed(1) } KB)</span>
                      </div>
                      <button 
                        onClick={() => { setImportFileContent(''); setImportFileName(''); }}
                        className="text-[9px] text-slate-400 hover:text-white underline"
                      >
                        Batalkan
                      </button>
                    </div>
                  )}

                  <button 
                    disabled={!importFileContent || actionPending}
                    onClick={handleProcessImport}
                    className={`w-full py-2.5 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition duration-200 cursor-pointer ${
                      importFileContent && !actionPending 
                        ? 'bg-emerald-650 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-950/20' 
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {actionPending ? (
                      <>
                        <RefreshCw size={13} className="animate-spin" /> MEMPROSES IMPORT...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={13} /> PROSES IMPORT DATA MASUK
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* INTERACTIVE COLUMN MAPPING SPREADSHEET BUILDER (CSV CONVERTER) */}
              {showSpreadsheetTool && spreadsheetCSVRows.length > 0 && (
                <div className="bg-slate-900 border border-teal-500/20 rounded-2xl p-5 space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1 px-2.5 bg-teal-500/10 text-teal-400 rounded-lg text-xs font-black">CSV SPREADSHEET</div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wide">📂 Alat Converter & Pemetaan Kolom Spreadsheet</h5>
                    </div>
                    <button 
                      onClick={() => setShowSpreadsheetTool(false)}
                      className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <p className="text-[10.5px] text-slate-300 leading-relaxed">
                    Kami mendeteksi Anda menggunggah file berekstensi <span className="text-teal-400 font-mono font-bold">.csv</span>. Silakan pilih target tabel dan petakan nama baris judul spreadsheet Anda ke kolom database yang sesuai di bawah ini:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                    
                    {/* INPUT CONTROLS Column mappings selection */}
                    <div className="md:col-span-5 bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-3.5">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">1. Target Import Model:</label>
                        <select 
                          value={spreadsheetPreviewTarget}
                          onChange={(e) => setSpreadsheetPreviewTarget(e.target.value as any)}
                          className="w-full bg-slate-900 border border-white/10 rounded-lg p-1.5 text-xs text-white"
                        >
                          <option value="tenaga_pendidik">Tenaga Pendidik / Staf Guru</option>
                        </select>
                      </div>

                      <div className="space-y-2.5 mt-2">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">2. Petakan Kolom CSV:</label>
                        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                          {spreadsheetMapKeys.map(key => (
                            <div key={key.key} className="flex flex-col gap-1 p-2 bg-slate-900 border border-white/5 rounded-lg">
                              <span className="text-[10px] font-bold text-slate-200 flex justify-between">
                                {key.label}
                                {key.required && <span className="text-[8px] text-red-400 uppercase font-black tracking-widest">Kolom Wajib *</span>}
                              </span>
                              <select 
                                value={spreadsheetMappedColumns[key.key] ?? -1}
                                onChange={(e) => setSpreadsheetMappedColumns({ ...spreadsheetMappedColumns, [key.key]: parseInt(e.target.value) })}
                                className="w-full bg-slate-950 border border-white/10 rounded p-1 text-[10px] text-slate-300 font-semibold"
                              >
                                <option value={-1}>-- Kosong / Biarkan Default --</option>
                                {spreadsheetCSVRows[0]?.map((col, idx) => (
                                  <option key={idx} value={idx}>Kolom Masukan {idx + 1}: "{col}"</option>
                                ))}
                              </select>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* BUTTON ACTIONS FOR MAPPER */}
                      <div className="flex gap-2.5 pt-2">
                        <button 
                          onClick={() => setShowSpreadsheetTool(false)}
                          className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          Batal
                        </button>
                        <button 
                          onClick={handleApplySpreadsheetConversion}
                          className="flex-1 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-[10px] rounded-lg cursor-pointer"
                        >
                          Terapkan Konversi
                        </button>
                      </div>
                    </div>

                    {/* RIGHT PREVIEW SCREEN FOR CSV FIRST ROWS */}
                    <div className="md:col-span-7 bg-slate-950/40 p-4 border border-white/5 rounded-xl space-y-3.5">
                      <h6 className="text-[10px] font-extrabold text-teal-300 uppercase tracking-widest">Pratinjau Isi File CSV Mentah (5 Baris Teratas):</h6>
                      
                      <div className="overflow-x-auto border border-white/5 rounded-lg max-h-72">
                        <table className="w-full text-left text-[9px] text-slate-400 border-collapse">
                          <thead className="bg-slate-900 text-slate-200">
                            <tr>
                              {spreadsheetCSVRows[0]?.map((h, i) => (
                                <th key={i} className="p-2 border border-white/5 font-extrabold whitespace-nowrap">
                                  {h} <span className="text-[7.5px] font-normal text-slate-500 block">Kolom {i+1}</span>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {spreadsheetCSVRows.slice(1, 6).map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-white/5">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 border border-white/5 whitespace-nowrap text-slate-300">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SECTION: TEMPLATE DOWNLOAD PORTAL */}
              <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 space-y-4">
                <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                  <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
                    <FileText size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white uppercase tracking-wide">📄 DOWNLOAD TEMPLATE KOSONG</h5>
                    <p className="text-[9px] text-slate-400 mt-0.5">Mulai pengisian data awal dari template siap guna</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
                  
                  {/* JSON Template button */}
                  <div className="bg-slate-950/50 p-4 border border-white/5 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold text-white">TEMPLATE FORMAT JSON</span>
                      <p className="text-[9px] text-slate-450 mt-1">Format referensi utama universal, mendukung data sekolah, guru, prestasi, galeri dalam satu file terpadu.</p>
                    </div>
                    <button 
                      onClick={handleDownloadTemplate}
                      className="mt-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-lg border border-white/5 text-center cursor-pointer"
                    >
                      Unduh Template JSON
                    </button>
                  </div>

                  {/* CSV Template button */}
                  <div className="bg-slate-950/50 p-4 border border-white/5 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold text-white">TEMPLATE EXCEL / SPREADSHEET (CSV)</span>
                      <p className="text-[9px] text-slate-450 mt-1">Sangat ideal untuk memasukkan secara massal data staf guru besar-besaran. Dapat diedit di Google Sheets/Excel.</p>
                    </div>
                    <button 
                      onClick={handleDownloadCSVTemplate}
                      className="mt-3 py-1.5 bg-teal-800 hover:bg-teal-700 text-teal-200 text-[10px] font-bold rounded-lg border border-teal-500/10 text-center cursor-pointer"
                    >
                      Unduh Template Excel (CSV)
                    </button>
                  </div>

                  {/* Quick instructions text */}
                  <div className="bg-slate-950/20 p-4 border border-white/5 rounded-xl flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-extrabold text-indigo-300">📖 CARA MENGGUNAKAN:</span>
                      <ol className="text-[9px] text-slate-400 pl-4 list-decimal mt-1.5 space-y-1">
                        <li>Unduh salah satu berkas template diatas</li>
                        <li>Sunting isi konten menggunakan Excel, Sheets atau teks editor</li>
                        <li>Simpan dalam format JSON atau CSV</li>
                        <li>Pilih dan proses unggah kembali ke sistem melalui panel Import data di atas</li>
                      </ol>
                    </div>
                  </div>

                </div>
              </div>

              {/* AUDIT RESTORE & FILE BACKUP HISTORY LOG TABLE */}
              <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/5 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-pink-500/10 rounded-xl text-pink-400">
                      <Clock size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white uppercase tracking-wide">📜 RIWAYAT BACKUP & IMPORT SITEM</h5>
                      <p className="text-[9px] text-slate-400 mt-0.5">Catatan aktivitas pemulihan data dan backup otomatis sebelum menimpa</p>
                    </div>
                  </div>
                  <button 
                    onClick={fetchBackupHistoryList}
                    className="p-1 px-2.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/5 text-[9px] tracking-wider text-slate-300 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={9} className={isFetchingHistory ? "animate-spin" : ""} /> REFRESH
                  </button>
                </div>

                {isFetchingHistory ? (
                  <div className="py-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">Menyelaraskan riwayat backup...</div>
                ) : backupHistoryList.length === 0 ? (
                  <div className="py-8 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">Belum ada riwayat aktivitas backup atau import tercatat.</div>
                ) : (
                  <div className="overflow-x-auto border border-white/5 rounded-xl">
                    <table className="w-full text-left text-[11px] text-slate-400 border-collapse">
                      <thead className="bg-slate-950/40 text-slate-200">
                        <tr>
                          <th className="p-3 border-b border-white/5 font-extrabold uppercase text-[9px] tracking-widest text-slate-400">Waktu</th>
                          <th className="p-3 border-b border-white/5 font-extrabold uppercase text-[9px] tracking-widest text-slate-400">Nama File</th>
                          <th className="p-3 border-b border-white/5 font-extrabold uppercase text-[9px] tracking-widest text-slate-400">Ukuran</th>
                          <th className="p-3 border-b border-white/5 font-extrabold uppercase text-[9px] tracking-widest text-slate-400">Operator</th>
                          <th className="p-3 border-b border-white/5 font-extrabold uppercase text-[9px] tracking-widest text-slate-400">Tipe Pelaksana</th>
                          <th className="p-3 border-b border-white/5 font-extrabold uppercase text-[9px] tracking-widest text-slate-400">Keterangan Catatan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {backupHistoryList.map((bh, idx) => (
                          <tr key={bh.id || idx} className="hover:bg-white/5">
                            <td className="p-3 font-medium text-slate-300 whitespace-nowrap">
                              {new Date(bh.timestamp).toLocaleString('id-ID', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="p-3 font-mono text-[10px] text-white select-all">{bh.filename}</td>
                            <td className="p-3 font-bold text-slate-300">{bh.size}</td>
                            <td className="p-3 font-bold text-slate-300">@{bh.user}</td>
                            <td className="p-2 shrink-0">
                              <span className={`p-1 px-2 text-[9px] border font-black uppercase rounded-lg ${
                                bh.type === 'backup' 
                                  ? 'bg-blue-500/10 border-blue-500/10 text-blue-400' 
                                  : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400'
                              }`}>
                                {bh.type}
                              </span>
                            </td>
                            <td className="p-3 text-slate-450 text-[10px] italic">{bh.details}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: HELP, ABOUT & TECH STACK INTERFACE (OPERATOR & ADMIN) */}
          {activeTab === 'about' && (
            <div className="space-y-6 max-w-5xl">
              
              {/* Header Title with Icon */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Buku Panduan & ReadMe Operator Utama</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Panduan komprehensif, langkah demi langkah mengoperasikan portal administrasi sekolah.</p>
                  </div>
                </div>
                
                {/* Active Sub-Tabs Switchers */}
                <span className="text-[10px] font-bold text-slate-500 italic bg-white/5 px-2.5 py-1 rounded-lg">
                  Peran Anda saat ini: <strong className="text-white uppercase font-sans">@{currentUser.role}</strong>
                </span>
              </div>

              {/* Sub-Tabs Selector Box */}
              <div className="flex flex-wrap gap-2 border-b border-white/5 pb-1">
                {[
                  { id: 'pengantar', label: '👋 Panduan Awal', color: 'from-blue-500 to-indigo-500' },
                  { id: 'profil_kontak', label: '🏫 Profil & Kontak', color: 'from-purple-500 to-pink-500' },
                  { id: 'guru_staff', label: '👥 Staf & Jabatan', color: 'from-amber-500 to-orange-500' },
                  { id: 'publikasi_media', label: '📰 Media & Berita', color: 'from-emerald-500 to-teal-500' },
                  { id: 'kurikulum_fasilitas', label: '🏆 Fasilitas & Prestasi', color: 'from-pink-500 to-rose-500' },
                  { id: 'ppdb_panitia', label: '📝 Kepanitiaan PPDB', color: 'from-cyan-500 to-blue-500' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setHelpSubTab(tab.id)}
                    className={`px-3 py-2 text-[11px] font-black uppercase tracking-wider rounded-xl transition duration-200 cursor-pointer ${
                      helpSubTab === tab.id
                        ? 'bg-slate-900 border-b-2 border-indigo-500 text-white shadow shadow-indigo-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUB TAB: PENGANTAR & PERAN */}
              {helpSubTab === 'pengantar' && (
                <div className="space-y-6 animate-fadeIn">
                  
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-indigo-500/10 p-6 rounded-2xl relative overflow-hidden">
                    <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-1 rounded-md">PANDUAN UTAMA</span>
                    <h4 className="text-base font-black text-white uppercase tracking-wider mt-3">Selamat Datang di Portal Portal Sekolah</h4>
                    <p className="text-xs text-slate-300 mt-2 leading-relaxed text-justify max-w-4xl">
                      Portal administrasi ini dirancang agar Anda dapat mengelola seluruh konten website utama SMP Bina Bangsa Indonesia dengan sangat mudah. Data disimpan secara langsung dan aman untuk segera dipublikasikan di halaman depan situs web tanpa perlu pengetahuan pemrograman.
                    </p>
                  </div>

                  {/* Operational Boundaries */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Operator Access Details */}
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">1. Hak Akses Akun: Operator (Operasional)</h5>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Akun operator diperuntukkan bagi tim sekretariat, staf tata usaha, maupun humas yang mengurusi pemeliharaan materi harian sekolah. Fitur yang dapat Anda kelola meliputi:
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        <li className="flex items-center gap-1.5 text-slate-300">✓ Mengubah Nama, Visi, Misi, Logo dan Alamat Sekolah</li>
                        <li className="flex items-center gap-1.5 text-slate-300">✓ Mengatur Tautan Sosial Media & Nomor WhatsApp Admin</li>
                        <li className="flex items-center gap-1.5 text-slate-300">✓ Menambah, Berhentikan dan Mengurutkan Jabatan & Staf Guru</li>
                        <li className="flex items-center gap-1.5 text-slate-300">✓ Membuat Draf atau Mempublikasikan Kabar Berita Baru</li>
                        <li className="flex items-center gap-1.5 text-slate-300">✓ Memasukkan Foto Kegiatan & Menyisipkan Video YouTube Sekolah</li>
                        <li className="flex items-center gap-1.5 text-slate-300">✓ Mengubah Data Sarana Prasarana / Fasilitas & Ekskul</li>
                        <li className="flex items-center gap-1.5 text-slate-300">✓ Menindak Pendaftaran PPDB Masuk (Verifikasi status pendaftar)</li>
                      </ul>
                    </div>

                    {/* Admin Access Details */}
                    <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                        <h5 className="text-xs font-bold text-white uppercase tracking-wider">2. Hak Akses Akun: Administrator (Penuh)</h5>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Akun administrator memegang kendali penuh menyeluruh terhadap jalannya infrastruktur sistem dan integritas database:
                      </p>
                      <ul className="space-y-1.5 text-[11px] text-slate-300">
                        <li className="flex items-center gap-1.5 text-slate-300">⚡ <strong>Semua Akses Operator di Atas</strong> (Hak akses otomatis mengalir ke admin)</li>
                        <li className="flex items-center gap-1.5 text-slate-300">⚡ <strong>Kelola Akun Akses:</strong> Mendaftarkan atau menyunting akun login baru operasional sekolah</li>
                        <li className="flex items-center gap-1.5 text-slate-300">⚡ <strong>Audit Trails:</strong> Mengawasi log rekam aktivitas operator untuk keamanan sistem</li>
                        <li className="flex items-center gap-1.5 text-slate-300">⚡ <strong>Global Settings:</strong> Mengubah nama subdomain, status kunci PPDB, SEO meta pencarian</li>
                        <li className="flex items-center gap-1.5 text-slate-300">⚡ <strong>Backup & Restore:</strong> Melakukan kloning seluruh basis data sekolah sekali klik</li>
                      </ul>
                    </div>

                  </div>

                </div>
              )}

              {/* SUB TAB: PROFIL & KONTAK */}
              {helpSubTab === 'profil_kontak' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <School size={15} className="text-purple-400" />
                      PROSEDUR UPDATE IDENTITAS & HUBUNGI KAMI
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Langkah-langkah memperbarui jati diri lembaga pendidikan dan informasi penghubung publik:
                    </p>

                    <div className="space-y-4 pt-2">
                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-[11px] shrink-0">1</span>
                        <div>
                          <strong className="text-xs text-white">Buka Menu "Profil Dasar & Kontak"</strong>
                          <p className="text-[11.5px] text-slate-400 mt-1">Gunakan tab ini untuk melihat formulir data pokok sekolah. Anda dapat mengganti Nama Resmi, NPSN, Status Akreditasi, Visi, Misi, maupun Motto Sekolah.</p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-[11px] shrink-0">2</span>
                        <div>
                          <strong className="text-xs text-white">Memperbarui Logo Sekolah</strong>
                          <p className="text-[11.5px] text-slate-400 mt-1">
                            Sistem menerima berkas gambar berjenis JPG/PNG dengan konverter berkas otomatis. Ukuran gambar logo yang direkomendasikan adalah berbentuk bujur sangkar (rasio 1:1) berlatar belakang transparan agar seragam dengan navigasi utama.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-[11px] shrink-0">3</span>
                        <div>
                          <strong className="text-xs text-white">Menyematkan Google Maps Lokasi</strong>
                          <p className="text-[11.5px] text-slate-400 mt-1">
                            Untuk memperbarui peta interaktif halaman depan, salin tautan embed peta dari Google Maps dengan mengeklik <strong>"Bagikan/Share" &rarr; "Sematkan Peta/Embed a map"</strong> di situs Google Maps, lalu salin isian teks di dalam kutip <code className="bg-slate-950 text-purple-400 text-[10px] px-1 py-0.5 rounded">src="..."</code> dan tempelkan isian tersebut ke dalam kolom "Google Maps URL".
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 font-bold text-[11px] shrink-0">4</span>
                        <div>
                          <strong className="text-xs text-white">Menyimpan & Validasi Perubahan</strong>
                          <p className="text-[11.5px] text-slate-400 mt-1">
                            Tekan tombol <strong>"SIMPAN PERUBAHAN PROFILE"</strong> di bagian bawah. Perubahan akan segera diaplikasikan ke halaman publik secara instan.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* SUB TAB: STAFF & JABATAN */}
              {helpSubTab === 'guru_staff' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <Users size={15} className="text-amber-400" />
                      STRUKTUR ORGANISASI SEKOLAH & HIRARKI
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sistem ini memisahkan data <strong>Hirarki Jabatan</strong> (sebagai kerangka pohon struktur organisasi) dengan <strong>Staf Guru</strong> (orang yang mendudukinya). Ini mempermudah Anda mengurutkan susunan bagan kepengurusan sekolah.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-wider block">LANGKAH 1: KELOLA JABATAN</span>
                        <p className="text-[11px] text-slate-355 leading-relaxed">
                          Sebelum memasukkan data guru baru, pastikan ranah jabatan telah terdefinisi di menu <strong>"Hirarki Jabatan"</strong> (seperti Kepala Sekolah, Wakil Kepala Kurikulum, Bendahara, Wali Kelas, Guru Pengajar). Tentukan <strong>"Urutan Tingkat"</strong> agar bagan organisasi dari tingkat tertinggi ke terendah terbeber teratur.
                        </p>
                      </div>

                      <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2">
                        <span className="text-[9.5px] font-black text-amber-400 uppercase tracking-wider block">LANGKAH 2: INPUT BIODATA STAF</span>
                        <p className="text-[11px] text-slate-355 leading-relaxed">
                          Pindah ke tab <strong>"Staf Guru"</strong>, lalu tekan tombol tambah staf. Masukkan Nama Lengkap (disarankan berhuruf kapital agar rapi), NIK, NUPTK, nomor telepon (untuk link WhatsApp pribadi), dan tentukan tautan foto profil (dapat diunggah secara lokal menggunakan tombol dropzone).
                        </p>
                      </div>
                    </div>

                    <div className="bg-amber-500/5 p-4 rounded-xl border border-amber-500/15 space-y-2">
                      <h5 className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                        <Sparkles size={11} /> TIPS URUTAN LAYOUT :
                      </h5>
                      <p className="text-[10.5px] text-slate-300 leading-relaxed">
                        Anda dapat memakai nomor urut pada masing-masing data guru (Misal: 1 untuk Kepala Sekolah, 2 untuk jajaran Wakasek, 10-15 untuk Guru Pengajar). Guru dengan nomor urut terkecil akan senantiasa ditampilkan paling awal dan paling atas di halaman utama.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* SUB TAB: MEDIA & BERITA */}
              {helpSubTab === 'publikasi_media' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <FileText size={15} className="text-emerald-400" />
                      ALUR PUBLIKASI BARANG BUKTI MEDIA & WARTA BERITA
                    </h4>

                    <div className="space-y-4">
                      
                      {/* Sub-item: Slide banner */}
                      <div className="border border-white/5 bg-slate-950/20 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">1. Banner Pilihan (Slide Utama Depan)</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Slider gambar di halaman utama publik adalah representasi pertama sekolah. Selalu gunakan gambar panorama beresolusi tinggi (min. 1200x600 piksel) yang tidak buram. Tambahkan Teks Tombol Aksi dan tautan link kemana pengunjung akan diarahkan ketika mengeklik tombol slide tersebut (misal diarahkan ke halaman pendaftaran PPDB berkelanjutan).
                        </p>
                      </div>

                      {/* Sub-item: Artikel Berita */}
                      <div className="border border-white/5 bg-slate-950/20 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">2. Kabar Berita / Artikel Akademik</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Formulir pembuatan artikel mendukung pengisian rich text. Pilih status <strong>"Draft"</strong> apabila penulisan berita belum rampung dan status <strong>"Published"</strong> untuk merilis berita tersebut saat itu juga lengkap dengan gambar berukuran proporsional. Seluruh artikel akan diurutkan berdasarkan tanggal publikasi terbaru.
                        </p>
                      </div>

                      {/* Sub-item: Video Youtube Semat */}
                      <div className="border border-white/5 bg-slate-950/20 p-4 rounded-xl space-y-2">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">3. Semat Video YouTube ke Galeri</span>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          Ketika Anda memilih kategori Galeri berbentuk "YouTube", sistem mengharuskan Anda memasukkan <strong>YouTube Video ID</strong>, bukan URL utuh. ID Video tersebut biasanya berupa 11 karakter acak di akhir link URL video YouTube Anda.<br />
                          Jika tautan bernilai <code className="text-[10px] text-emerald-300 font-mono">https://www.youtube.com/watch?v=XyZ999zZBAw</code>, maka ID Video yang wajib dilekatkan hanyalah <strong className="text-white font-mono bg-slate-950 px-1 py-0.5 rounded">XyZ999zZBAw</strong>.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: KURIKULUM & FASILITAS */}
              {helpSubTab === 'kurikulum_fasilitas' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <Trophy size={15} className="text-rose-400" />
                      MANAJEMEN SARCOP & PRESTASI SISWA
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Bagian ini menjelaskan secara rinci bagaimana cara operator mencatatkan keunggulan sekolah agar dapat mengundang ketertarikan calon pendaftar didik baru.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      
                      <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                        <span className="text-[9.5px] font-black text-rose-300 uppercase block">🏀 Kegiatan Ekskul</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Tuliskan kegiatan ekstrakurikuler sekolah seperti Pramuka, Paskibra, OSIS, olahraga basket / futsal, sains club, dsb. Masukkan Ikon (Emoji representatif) dan keterangannya.
                        </p>
                      </div>

                      <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                        <span className="text-[9.5px] font-black text-rose-300 uppercase block">🧪 Sarana Prasarana</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Tambahkan fasilitas penunjang KBM seperti Laboratorium Komputer, Lab IPA, Perpustakaan Digital, Masjid Sekolah, Lapangan Olahraga Premium. Unggah foto orisinal agar kredibel.
                        </p>
                      </div>

                      <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-1.5">
                        <span className="text-[9.5px] font-black text-rose-300 uppercase block">🏆 Prestasi Juara</span>
                        <p className="text-[10.5px] text-slate-400 leading-relaxed">
                          Sebutkan raihan juara siswa (OSN, FLS2N, turnamen olahraga). Masukkan tahun pencapaian, kualifikasi tingkat (Kecamatan, Kabupaten, Provinsi, Nasional) untuk mendongkrak reputasi.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: PPDB ONLINE */}
              {helpSubTab === 'ppdb_panitia' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="bg-slate-900/50 p-5 rounded-2xl border border-white/5 space-y-4">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-2">
                      <Calendar size={15} className="text-cyan-400" />
                      ALUR VERIFIKASI PPDB (PENDAFTARAN PESERTA DIDIK BARU)
                    </h4>
                    
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sistem ini dilengkapi pendaftaran PPDB mandiri bawaan di mana calon wali siswa dapat mengisi formulir pendaftaran daring secara terpusat. Operator bertugas melakukan validasi berkas pendaftar.
                    </p>

                    <div className="bg-slate-950/60 p-4 border border-white/5 rounded-xl space-y-4">
                      <h5 className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-wider">Tahapan Pengelolaan Harian PPDB:</h5>
                      
                      <div className="space-y-3.5 divide-y divide-white/5">
                        <div className="pt-0 space-y-1">
                          <span className="text-[10px] font-black text-white block">1. Menghidupkan Sesi Gelombang</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Pastikan pengaturan PPDB pada tahun ajaran aktif dan tanggal mulai - selesai telah diatur dengan benar di menu <strong>"Kepanitiaan PPDB"</strong>. Jika kuota telah terpenuhi, Anda bisa menutup isian gelombang tersebut atau mengubah kuota bertambah banyak sesuai kapasitas daya tampung.
                          </p>
                        </div>

                        <div className="pt-3 space-y-1">
                          <span className="text-[10px] font-black text-white block">3. Memilah Pendaftaran Masuk</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Buka sub-tab <strong>"Laporan & Statistik"</strong>. Filter pencarian siswa pendaftar berdasarkan statusnya (Menunggu Proses, Disetujui, Ditolak). Tekan tombol <strong>Edit</strong> untuk memeriksa detail isi biodata siswa beserta wali asuh, kemudian berikan kepastian kelulusan dengan mengeklik status verifikasi.
                          </p>
                        </div>

                        <div className="pt-3 space-y-1">
                          <span className="text-[10px] font-black text-white block">3. Menghubungi Calon Pendaftar via WhatsApp</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Untuk mempercepat proses administrasi daftar ulang (pembayaran seragam, tes psikologi), Anda bisa langsung mengeklik tombol shortcut nomor telepon genggam pendaftar di daftar entri tabel. Ini akan langsung mengarahkan Anda ke jendela chat WhatsApp siswa tersebut beserta pesan pengantar bawaan.
                          </p>
                        </div>

                        <div className="pt-3 space-y-1">
                          <span className="text-[10px] font-black text-white block">4. Mengekspor Excel Siswa Lolos</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            Staf operator dapat mengunduh seluruh ringkasan data siswa pendaftar berjenis CSV/Spreadsheet dengan menekan tombol <strong>"EKSPOR DATA PENDAFTAR (CSV)"</strong> di panel laporan untuk keperluan arsip Dapodik Sekolah ataupun cetak fisik berkas map. Berikan filter status "Disetujui" sebelumnya agar yang terunduh hanyalah siswa yang dinilai lolos seleksi saja.
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </main>

    </div>
  );
}
