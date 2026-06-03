import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { db, initDB } from './src/backend/db';

initDB();

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const port = 3000;

// Body Parsers (increased limits in case of base64 images uploads)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Express session simulation or cookie verification simple check
// For simple, reliable single-session simulation in sandboxed containers,
// we will look for a bearer token or custom header 'x-admin-role' / 'x-user-id'
// or support standard authorization state to adapt easily to simple state headers.
// Since we want standard behavior, we have custom API session endpoints that save
// user authorization tokens in memory/localStorage at client-side.
// We validate requests to secure /api paths with custom logic.

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0]).trim();
  }
  return req.socket.remoteAddress || '127.0.0.1';
}

// Custom request with user
interface AuthRequest extends Request {
  userRole?: 'admin' | 'operator';
  userId?: number;
  username?: string;
}

function checkAuth(roleReq?: 'admin' | 'operator') {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    let authHeader = req.headers.authorization;
    if (!authHeader && req.query.authorization) {
      authHeader = `Bearer ${req.query.authorization}`;
    }
    if (!authHeader) {
      res.status(401).json({ error: 'Sesi kedaluwarsa atau Anda belum masuk.' });
      return;
    }
    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      req.userId = decoded.id;
      req.username = decoded.username;
      req.userRole = decoded.role;

      if (roleReq === 'admin' && decoded.role !== 'admin') {
        res.status(403).json({ error: 'Akses ditolak. Fitur ini hanya untuk Administrator.' });
        return;
      }
      next();
    } catch (e) {
      res.status(401).json({ error: 'Session tidak valid.' });
    }
  };
}

// --- API ENDPOINTS ---

// Auth endpoints
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  const ip = getClientIp(req);
  
  if (!username || !password) {
    res.status(400).json({ error: 'Username dan password wajib diisi.' });
    return;
  }

  const result = db.verifyLogin(username, password, ip);
  if (result.success && result.user) {
    // Generate simple token (base64 of user properties)
    const token = Buffer.from(JSON.stringify(result.user)).toString('base64');
    res.json({ token, user: result.user });
  } else {
    res.status(400).json({ error: result.error });
  }
});

app.post('/api/logout', (req: Request, res: Response) => {
  const ip = getClientIp(req);
  const authHeader = req.headers.authorization;
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
      db.logAction(decoded.id, decoded.username, 'Logout', `User ${decoded.username} berhasil keluar sistem.`, ip);
    } catch {}
  }
  res.json({ success: true, message: 'Berhasil keluar.' });
});

// Sekolah endpoint
app.get('/api/sekolah', (req: Request, res: Response) => {
  res.json(db.getSekolah());
});

app.put('/api/sekolah', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const updated = db.updateSekolah(req.body);
  db.logAction(req.userId!, req.username!, 'Ubah Profil', 'Mengubah informasi profil dasar sekolah.', getClientIp(req));
  res.json(updated);
});

// Sosial Media
app.get('/api/sosial-media', (req: Request, res: Response) => {
  res.json(db.getSosialMedia());
});

app.put('/api/sosial-media', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  db.updateSosialMedia(req.body);
  db.logAction(req.userId!, req.username!, 'Ubah Sosmed', 'Mengubah tautan sosial media sekolah.', getClientIp(req));
  res.json({ success: true, list: db.getSosialMedia() });
});

// Kontak
app.get('/api/kontak', (req: Request, res: Response) => {
  res.json(db.getKontak());
});

app.put('/api/kontak', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  db.updateKontak(req.body);
  db.logAction(req.userId!, req.username!, 'Ubah Kontak', 'Mengubah rincian kontak & alamat email / telepon.', getClientIp(req));
  res.json({ success: true, list: db.getKontak() });
});

// Menus
app.get('/api/menus', (req: Request, res: Response) => {
  res.json(db.getMenus());
});

app.post('/api/menus', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const menu = db.addMenu(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Menu', `Menambahkan menu baru: "${menu.label}"`, getClientIp(req));
  res.status(201).json(menu);
});

app.put('/api/menus/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const menu = db.updateMenu(id, req.body);
  if (!menu) {
    res.status(404).json({ error: 'Menu tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Menu', `Mengubah properti menu ID: ${id} ("${menu.label}")`, getClientIp(req));
  res.json(menu);
});

app.delete('/api/menus/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteMenu(id);
  if (!success) {
    res.status(404).json({ error: 'Menu gagal dihapus atau tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Menu', `Menghapus menu ID: ${id} beserta submenu terkait.`, getClientIp(req));
  res.json({ success: true });
});

// Banners
app.get('/api/banners', (req: Request, res: Response) => {
  res.json(db.getBanners());
});

app.post('/api/banners', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const banner = db.addBanner(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Banner', `Menambahkan slide utama baru: "${banner.judul}"`, getClientIp(req));
  res.status(201).json(banner);
});

app.put('/api/banners/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const banner = db.updateBanner(id, req.body);
  if (!banner) {
    res.status(404).json({ error: 'Banner tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Banner', `Mengubah banner utama: "${banner.judul}"`, getClientIp(req));
  res.json(banner);
});

app.delete('/api/banners/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteBanner(id);
  if (!success) {
    res.status(404).json({ error: 'Banner gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Banner', `Menghapus banner slide ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Fasilitas
app.get('/api/fasilitas', (req: Request, res: Response) => {
  res.json(db.getFasilitas());
});

app.post('/api/fasilitas', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const f = db.addFasilitas(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Fasilitas', `Menambahkan fasilitas baru: "${f.judul}"`, getClientIp(req));
  res.status(201).json(f);
});

app.put('/api/fasilitas/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const f = db.updateFasilitas(id, req.body);
  if (!f) {
    res.status(404).json({ error: 'Fasilitas tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Fasilitas', `Mengubah fasilitas sekolah: "${f.judul}"`, getClientIp(req));
  res.json(f);
});

app.delete('/api/fasilitas/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteFasilitas(id);
  if (!success) {
    res.status(404).json({ error: 'Fasilitas gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Fasilitas', `Menghapus fasilitas ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Ekskul
app.get('/api/ekskul', (req: Request, res: Response) => {
  res.json(db.getEkskul());
});

app.post('/api/ekskul', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const item = db.addEkskul(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Ekskul', `Menambahkan ekskul baru: "${item.judul}"`, getClientIp(req));
  res.status(201).json(item);
});

app.put('/api/ekskul/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.updateEkskul(id, req.body);
  if (!item) {
    res.status(404).json({ error: 'Ekskul tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Ekskul', `Mengubah ekstrakurikuler: "${item.judul}"`, getClientIp(req));
  res.json(item);
});

app.delete('/api/ekskul/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteEkskul(id);
  if (!success) {
    res.status(404).json({ error: 'Ekskul gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Ekskul', `Menghapus ekstrakurikuler ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Guru
app.get('/api/guru', (req: Request, res: Response) => {
  res.json(db.getGuru());
});

app.post('/api/guru', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const item = db.addGuru(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Guru', `Menambahkan data pendidik: "${item.nama}"`, getClientIp(req));
  res.status(201).json(item);
});

app.put('/api/guru/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.updateGuru(id, req.body);
  if (!item) {
    res.status(404).json({ error: 'Guru tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Pendidik', `Mengubah profil guru: "${item.nama}"`, getClientIp(req));
  res.json(item);
});

app.delete('/api/guru/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteGuru(id);
  if (!success) {
    res.status(404).json({ error: 'Guru gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Guru', `Menghapus pendidik ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Jabatan
app.get('/api/jabatan', (req: Request, res: Response) => {
  res.json(db.getJabatan());
});

app.post('/api/jabatan', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const item = db.addJabatan(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Jabatan', `Menambahkan jabatan baru: "${item.nama}"`, getClientIp(req));
  res.status(201).json(item);
});

app.put('/api/jabatan/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.updateJabatan(id, req.body);
  if (!item) {
    res.status(404).json({ error: 'Jabatan tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Jabatan', `Mengubah jabatan: "${item.nama}"`, getClientIp(req));
  res.json(item);
});

app.delete('/api/jabatan/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteJabatan(id);
  if (!success) {
    res.status(404).json({ error: 'Jabatan gagal dihapus atau tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Jabatan', `Menghapus jabatan ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// PPDB
app.get('/api/ppdb', (req: Request, res: Response) => {
  res.json(db.getPPDB());
});

app.post('/api/ppdb', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const item = db.addPPDB(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah PPDB', `Menambahkan pendaftaran PPDB baru: "${item.tahun_ajaran}"`, getClientIp(req));
  res.status(201).json(item);
});

app.put('/api/ppdb/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.updatePPDB(id, req.body);
  if (!item) {
    res.status(404).json({ error: 'Pendaftaran PPDB tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah PPDB', `Mengubah pendaftaran PPDB: "${item.tahun_ajaran}"`, getClientIp(req));
  res.json(item);
});

app.delete('/api/ppdb/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deletePPDB(id);
  if (!success) {
    res.status(404).json({ error: 'PPDB gagal dihapus atau tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus PPDB', `Menghapus pendaftaran PPDB ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Prestasi
app.get('/api/prestasi', (req: Request, res: Response) => {
  res.json(db.getPrestasi());
});

app.post('/api/prestasi', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const item = db.addPrestasi(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Prestasi', `Menambahkan prestasi baru: "${item.judul}"`, getClientIp(req));
  res.status(201).json(item);
});

app.put('/api/prestasi/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.updatePrestasi(id, req.body);
  if (!item) {
    res.status(404).json({ error: 'Prestasi tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Prestasi', `Mengubah prestasi: "${item.judul}"`, getClientIp(req));
  res.json(item);
});

app.delete('/api/prestasi/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deletePrestasi(id);
  if (!success) {
    res.status(404).json({ error: 'Prestasi gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Prestasi', `Menghapus prestasi ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Galeri
app.get('/api/galeri', (req: Request, res: Response) => {
  res.json(db.getGaleri());
});

app.post('/api/galeri', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const item = db.addGaleri(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Galeri', `Menambahkan media ke galeri: "${item.judul || 'Media Baru'}"`, getClientIp(req));
  res.status(201).json(item);
});

app.put('/api/galeri/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.updateGaleri(id, req.body);
  if (!item) {
    res.status(404).json({ error: 'Galeri tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Galeri', `Mengubah media galeri: "${item.judul || 'Media'}"`, getClientIp(req));
  res.json(item);
});

app.delete('/api/galeri/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteGaleri(id);
  if (!success) {
    res.status(404).json({ error: 'Galeri gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Galeri', `Menghapus media galeri ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Artikel
app.get('/api/artikel', (req: Request, res: Response) => {
  res.json(db.getArtikel());
});

app.get('/api/artikel/:id', (req: Request, res: Response) => {
  const art = db.getArtikelById(parseInt(req.params.id));
  if (!art) {
    res.status(404).json({ error: 'Artikel tidak ditemukan.' });
    return;
  }
  res.json(art);
});

app.post('/api/artikel', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const item = db.addArtikel(req.body);
  db.logAction(req.userId!, req.username!, 'Tambah Artikel', `Membuat draf/artikel baru: "${item.judul}"`, getClientIp(req));
  res.status(201).json(item);
});

app.put('/api/artikel/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const item = db.updateArtikel(id, req.body);
  if (!item) {
    res.status(404).json({ error: 'Artikel tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah Artikel', `Mengubah tulisan artikel: "${item.judul}"`, getClientIp(req));
  res.json(item);
});

app.delete('/api/artikel/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const success = db.deleteArtikel(id);
  if (!success) {
    res.status(404).json({ error: 'Artikel gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus Artikel', `Menghapus artikel ID: ${id}`, getClientIp(req));
  res.json({ success: true });
});

// Pendaftaran PPDB
app.get('/api/pendaftaran-ppdb', (req: Request, res: Response) => {
  res.json(db.getPendaftaranPPDB());
});

app.post('/api/pendaftaran-ppdb', (req: Request, res: Response) => {
  const pendaftar = db.addPendaftaranPPDB(req.body);
  res.status(201).json(pendaftar);
});

app.put('/api/pendaftaran-ppdb/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const pendaftar = db.updatePendaftaranPPDB(req.params.id, req.body);
  if (!pendaftar) {
    res.status(404).json({ error: 'Pendaftar tidak ditemukan.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Ubah PPDB Pendaftar', `Memperbarui status pendaftaran ${pendaftar.nama} menjadi ${req.body.status || pendaftar.status}`, getClientIp(req));
  res.json(pendaftar);
});

app.delete('/api/pendaftaran-ppdb/:id', checkAuth('operator'), (req: AuthRequest, res: Response) => {
  const success = db.deletePendaftaranPPDB(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Pendaftar gagal dihapus.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus PPDB Pendaftar', `Menghapus data pendaftaran ID: ${req.params.id}`, getClientIp(req));
  res.json({ success: true });
});

// Pengaturan
app.get('/api/pengaturan', (req: Request, res: Response) => {
  res.json({
    site_title: db.getSetting('site_title'),
    footer_text: db.getSetting('footer_text'),
    meta_description: db.getSetting('meta_description')
  });
});

app.put('/api/pengaturan', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const keys = Object.keys(req.body);
  for (const k of keys) {
    db.updateSetting(k, req.body[k]);
  }
  db.logAction(req.userId!, req.username!, 'Update Pengaturan', 'Memperbarui konfigurasi SEO & Teks Utama Web.', getClientIp(req));
  res.json({ success: true });
});

// System logs
app.get('/api/logs', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  res.json(db.getLogs());
});

// Users Management
app.get('/api/users', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  res.json(db.getUsers());
});

app.post('/api/users', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const { username, passwordPlain, role, nama_lengkap, email } = req.body;
  if (!username || !passwordPlain || !role || !nama_lengkap) {
    res.status(400).json({ error: 'Data usser baru tidak lengkap.' });
    return;
  }

  // Check unique username
  const exists = db.getUserByUsername(username);
  if (exists) {
    res.status(400).json({ error: 'Username tersebut sudah terdaftar.' });
    return;
  }

  const u = db.createUser({ username, role, nama_lengkap, email, passwordPlain });
  db.logAction(req.userId!, req.username!, 'Buat User', `Mendaftarkan pengguna baru: "${u.username}" (${u.role})`, getClientIp(req));
  res.status(201).json(u);
});

app.put('/api/users/:id', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const current = db.getUserById(id);
  if (!current) {
    res.status(404).json({ error: 'User tidak ditemukan.' });
    return;
  }
  const u = db.updateUser(id, req.body);
  db.logAction(req.userId!, req.username!, 'Update User', `Memperbarui akun pengguna: "${current.username}"`, getClientIp(req));
  res.json(u);
});

app.delete('/api/users/:id', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const current = db.getUserById(id);
  if (!current) {
    res.status(404).json({ error: 'User tidak ditemukan.' });
    return;
  }
  const success = db.deleteUser(id);
  if (!success) {
    res.status(400).json({ error: 'Gagal menghapus user. Silakan pastikan bukan admin terakhir.' });
    return;
  }
  db.logAction(req.userId!, req.username!, 'Hapus User', `Menghapus akun pengguna: "${current.username}"`, getClientIp(req));
  res.json({ success: true });
});

// Backup Database
app.get('/api/backup', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const DB_FILE = path.join(process.cwd(), 'database', 'sekolah.json');
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    res.setHeader('Content-disposition', 'attachment; filename=sekolah_backup.json');
    res.setHeader('Content-type', 'application/json');
    res.write(data);
    res.end();
    db.logAction(req.userId!, req.username!, 'Backup DB', 'Mengunduh file salinan basis data sekolah.', getClientIp(req));
  } catch (e) {
    res.status(500).json({ error: 'Gagal membackup database.' });
  }
});

// Restore Database
app.post('/api/restore', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const { backupData } = req.body;
  if (!backupData) {
    res.status(400).json({ error: 'Salinan dokumen tidak valid.' });
    return;
  }
  try {
    // Validate schema keys simply
    const parsed = typeof backupData === 'string' ? JSON.parse(backupData) : backupData;
    if (!parsed.sekolah || !parsed.users || !parsed.pengaturan) {
      res.status(400).json({ error: 'Format berkas salah atau tidak lengkap.' });
      return;
    }
    const DB_FILE = path.join(process.cwd(), 'database', 'sekolah.json');
    fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
    
    // Invalidate local in-memory cache
    initDB();

    db.logAction(req.userId!, req.username!, 'Restore DB', 'Memulihkan basis data sekolah dari berkas cadangan.', getClientIp(req));
    res.json({ success: true, message: 'Database berhasil dipulihkan!' });
  } catch (e) {
    res.status(400).json({ error: 'Kandungan file tidak valid atau berstruktur rusak.' });
  }
});

// Advanced Export Custom
app.get('/api/export_custom', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const includeImages = req.query.includeImages !== 'false';
  const onlyStructure = req.query.onlyStructure === 'true';

  try {
    const DB_FILE = path.join(process.cwd(), 'database', 'sekolah.json');
    if (!fs.existsSync(DB_FILE)) {
      res.status(404).json({ error: 'Basis data belum tersedia.' });
      return;
    }

    const dataRaw = fs.readFileSync(DB_FILE, 'utf8');
    const dbData = JSON.parse(dataRaw);

    // Structure filtering (hanya struktur / kosongkan baris transaksi & logs)
    if (onlyStructure) {
      dbData.pendaftaran_ppdb = [];
      dbData.log_aktivitas = [];
      dbData.guru = [];
      dbData.fasilitas = [];
      dbData.ekskul = [];
      dbData.prestasi = [];
      dbData.galeri = [];
      dbData.artikel = [];
      dbData.banners = [];
    }

    // Base64 images striping if unchecked
    if (!includeImages) {
      const stripImages = (obj: any) => {
        if (!obj || typeof obj !== 'object') return;
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            const val = obj[key];
            if (val.startsWith('data:image/') || val.length > 1500) {
              obj[key] = ''; // clear base64/long images
            }
          } else if (typeof obj[key] === 'object') {
            stripImages(obj[key]);
          }
        }
      };
      stripImages(dbData);
    }

    db.logAction(req.userId!, req.username!, 'Export DB', `Berhasil mengunduh salinan data (Struktur: ${onlyStructure ? 'Y' : 'T'}, Gambar: ${includeImages ? 'Y' : 'T'}).`, getClientIp(req));

    res.setHeader('Content-disposition', `attachment; filename=sekolah_export_${Date.now()}.json`);
    res.setHeader('Content-type', 'application/json');
    res.send(JSON.stringify(dbData, null, 2));
  } catch (e) {
    res.status(500).json({ error: 'Gagal melakukan ekspor data.' });
  }
});

// Download Template
app.get('/api/export/template', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const template = {
    metadata: {
      export_date: new Date().toISOString(),
      version: "1.0",
      source: "SMP BINA BANGSA INDONESIA"
    },
    sekolah: {
      nama: "SMP BINA BANGSA INDONESIA",
      npsn: "20227711",
      akreditasi: "B",
      tahun_akreditasi: "2024",
      status: "SWASTA",
      alamat: "Jl. Raya Soreang KM 17, Kec. Soreang, Kab. Bandung",
      kode_pos: "40911",
      telepon: "02285933663",
      email: "bbismp308@gmail.com",
      website: "https://binabangsa.sch.id",
      tahun_berdiri: "2005",
      motto: "Iman, Ilmu, Amal",
      visi: "Mewujudkan generasi beriman dan bertaqwa, mandiri, unggul dalam potensi.",
      misi: [
        "Melaksanakan pembelajaran aktif dan kreatif.",
        "Membentuk karakter siswa yang disiplin.",
        "Mengembangkan potensi siswa melalui kegiatan bakat minat."
      ],
      logo: ""
    },
    jabatan: [
      { id: 1, nama: "Kepala Yayasan", tingkat: 1, parent_id: null, urutan: 1 },
      { id: 2, nama: "Kepala Sekolah", tingkat: 2, parent_id: null, urutan: 2 },
      { id: 3, nama: "Wakil Kepala Sekolah", tingkat: 2, parent_id: 2, urutan: 3 },
      { id: 4, nama: "Guru Mata Pelajaran", tingkat: 3, parent_id: 2, urutan: 4 }
    ],
    tenaga_pendidik: [
      { nama: "LENDI ESA NUGRAHA", nik: "3204xxxxxxxxxx", nuptk: "123456789", jabatan: "Kepala Sekolah", mapel: "Matematika", wali_kelas: "", foto: "", kontak: "62812345678", email: "lendi@gmail.com", aktif: true }
    ],
    fasilitas: [
      { judul: "Ruang Kelas", ikon: "🏫", deskripsi: "12 ruang kelas AC & proyektor", urutan: 1 }
    ],
    ekskul: [
      { judul: "Pramuka", ikon: "⛺", deskripsi: "Wajib kelas 7", jadwal: "Sabtu", urutan: 1 }
    ],
    prestasi: [
      { judul: "Juara 1 OSN Matematika", tahun: "2024", tingkat: "Kabupaten", deskripsi: "Meraih Medali Emas", urutan: 1 }
    ],
    galeri: {
      foto: [
        { judul: "Kegiatan Belajar", kategori: "Kegiatan", file: "" }
      ],
      video: [
        { judul: "Profil Sekolah", embed_id: "xyzABC123", kategori: "Profil" }
      ]
    },
    sosial_media: {
      instagram: "https://instagram.com/smpbinabangsa",
      facebook: "https://facebook.com/smpbinabangsa",
      youtube: "https://youtube.com/@smpbinabangsatv",
      whatsapp_admin: "6281234567890",
      maps_embed: ""
    },
    ppdb: {
      tahun_ajaran: "2025/2026",
      gelombang: "1",
      tanggal_mulai: "2025-01-01",
      tanggal_selesai: "2025-03-31",
      kuota: 120,
      link_pendaftaran: "",
      biaya: 200000,
      kontak_wa: "6281234567890"
    },
    artikel: [
      {
        judul: "Penerimaan Siswa Baru 2025/2026",
        ringkasan: "Pendaftaran dibuka mulai Januari 2025.",
        tanggal: "2025-01-01",
        status: "publish"
      }
    ]
  };

  db.logAction(req.userId!, req.username!, 'Template Download', 'Mengunduh berkas template import awal.', getClientIp(req));

  res.setHeader('Content-disposition', 'attachment; filename=template_import_sekolah.json');
  res.setHeader('Content-type', 'application/json');
  res.send(JSON.stringify(template, null, 2));
});

// Import Advanced Custom
app.post('/api/import_custom', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const { fileContent, backup, onlyEmpty } = req.body;
  if (!fileContent) {
    res.status(400).json({ error: 'Konten file kosong.' });
    return;
  }

  try {
    const parsed = JSON.parse(fileContent);
    const DB_FILE = path.join(process.cwd(), 'database', 'sekolah.json');
    if (!fs.existsSync(DB_FILE)) {
      res.status(404).json({ error: 'Database belum diinisialisasi.' });
      return;
    }

    const currentDBRaw = fs.readFileSync(DB_FILE, 'utf8');
    const currentDB = JSON.parse(currentDBRaw);

    // Auto backup database before overwrite
    if (backup !== false) {
      const backupDir = path.join(process.cwd(), 'database', 'backups');
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFilename = `sekolah_backup_${timestamp}.json`;
      const backupPath = path.join(backupDir, backupFilename);
      fs.writeFileSync(backupPath, JSON.stringify(currentDB, null, 2), 'utf8');

      // Append logs to file
      const historyFile = path.join(backupDir, 'history.json');
      let historyList = [];
      if (fs.existsSync(historyFile)) {
        try {
          historyList = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        } catch {
          historyList = [];
        }
      }

      const stats = fs.statSync(backupPath);
      const sizeKB = `${(stats.size / 1024).toFixed(1)} KB`;

      historyList.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        filename: backupFilename,
        size: sizeKB,
        user: req.username || 'admin',
        type: 'backup',
        details: 'Backup otomatis berkas database sekolah sebelum import masuk.'
      });

      fs.writeFileSync(historyFile, JSON.stringify(historyList, null, 2), 'utf8');
    }

    const isFullBackup = parsed.sekolah && parsed.users && parsed.pengaturan;
    const isSpreadsheetTemplate = parsed.metadata || parsed.tenaga_pendidik || parsed.fasilitas;

    if (!isFullBackup && !isSpreadsheetTemplate) {
      res.status(400).json({ error: 'Struktur data JSON tidak cocok atau format tidak didukung.' });
      return;
    }

    if (isFullBackup) {
      // FULL DATABASE RESTORE
      if (onlyEmpty) {
        // Only fill empty fields
        for (const key in parsed.sekolah) {
          if (!currentDB.sekolah[key] || currentDB.sekolah[key] === '') {
            currentDB.sekolah[key] = parsed.sekolah[key];
          }
        }
        const tables = [
          'users', 'sosial_media', 'kontak', 'menus', 'banners', 'fasilitas', 
          'ekskul', 'guru', 'jabatan', 'ppdb', 'prestasi', 'galeri', 
          'artikel', 'pengaturan', 'pendaftaran_ppdb', 'log_aktivitas'
        ];
        for (const table of tables) {
          if (Array.isArray(parsed[table])) {
            if (!currentDB[table] || currentDB[table].length === 0) {
              currentDB[table] = parsed[table];
            } else {
              for (const row of parsed[table]) {
                const idKey = row.id !== undefined ? 'id' : (row.key !== undefined ? 'key' : undefined);
                if (idKey) {
                  const exists = currentDB[table].some((r: any) => r[idKey] === row[idKey]);
                  if (!exists) {
                    currentDB[table].push(row);
                  }
                }
              }
            }
          }
        }
      } else {
        // Complete overwrite
        const preservedUsers = currentDB.users;
        const preservedAttempts = currentDB.login_attempts || [];

        Object.assign(currentDB, parsed);

        if (!currentDB.users || currentDB.users.length === 0) {
          currentDB.users = preservedUsers;
        }
        currentDB.login_attempts = preservedAttempts;
      }
    } else {
      // SPREADSHEET TEMPLATE FORMAT (SECTION B)
      // A. Sekolah Identity
      if (parsed.sekolah) {
        for (const key in parsed.sekolah) {
          if (!onlyEmpty || !currentDB.sekolah[key] || currentDB.sekolah[key] === '') {
            if (key === 'misi' && Array.isArray(parsed.sekolah.misi)) {
              currentDB.sekolah.misi = parsed.sekolah.misi;
            } else {
              currentDB.sekolah[key] = parsed.sekolah[key];
            }
          }
        }
      }

      // B. Jabatan mapping
      if (Array.isArray(parsed.jabatan)) {
        if (!onlyEmpty || !currentDB.jabatan || currentDB.jabatan.length === 0) {
          currentDB.jabatan = parsed.jabatan.map((j: any) => ({
            id: j.id,
            nama: j.nama,
            tingkat: j.tingkat || 3,
            parent_id: j.parent_id !== undefined ? j.parent_id : null,
            urutan: j.urutan || 99,
            is_active: 1
          }));
        } else {
          for (const j of parsed.jabatan) {
            const exists = currentDB.jabatan.some((x: any) => x.id === j.id || x.nama.toLowerCase() === j.nama.toLowerCase());
            if (!exists) {
              currentDB.jabatan.push({
                id: j.id || (currentDB.jabatan.reduce((max: number, x: any) => x.id > max ? x.id : max, 0) + 1),
                nama: j.nama,
                tingkat: j.tingkat || 3,
                parent_id: j.parent_id !== undefined ? j.parent_id : null,
                urutan: j.urutan || 99,
                is_active: 1
              });
            }
          }
        }
      }

      // C. Tenaga Pendidik / Guru
      if (Array.isArray(parsed.tenaga_pendidik)) {
        const mappedList = parsed.tenaga_pendidik.map((tp: any, index: number) => {
          let matchedJabatanId = 4; // default Guru Mapel
          if (tp.jabatan) {
            const jItem = currentDB.jabatan.find((x: any) => x.nama.toLowerCase() === tp.jabatan.toLowerCase());
            if (jItem) {
              matchedJabatanId = jItem.id;
            }
          }
          return {
            id: index + 1,
            nama: tp.nama,
            nik: tp.nik || '',
            nuptk: tp.nuptk || '',
            jabatan_id: matchedJabatanId,
            mapel: tp.mapel || '',
            wali_kelas: tp.wali_kelas || '',
            foto: tp.foto || '',
            kontak: tp.kontak || '',
            email: tp.email || '',
            urutan: index + 1,
            is_active: tp.aktif !== false ? 1 : 0
          };
        });

        if (!onlyEmpty || !currentDB.guru || currentDB.guru.length === 0) {
          currentDB.guru = mappedList.map((g: any, index: number) => ({ ...g, id: index + 1 }));
        } else {
          for (const g of mappedList) {
            const exists = currentDB.guru.some((x: any) => x.nama.toLowerCase() === g.nama.toLowerCase());
            if (!exists) {
              const nextId = currentDB.guru.reduce((max: number, x: any) => x.id > max ? x.id : max, 0) + 1;
              currentDB.guru.push({ ...g, id: nextId, urutan: nextId });
            }
          }
        }
      }

      // D. Fasilitas
      if (Array.isArray(parsed.fasilitas)) {
        if (!onlyEmpty || !currentDB.fasilitas || currentDB.fasilitas.length === 0) {
          currentDB.fasilitas = parsed.fasilitas.map((f: any, idx: number) => ({
            id: idx + 1,
            judul: f.judul,
            deskripsi: f.deskripsi || '',
            ikon: f.ikon || 'Home',
            gambar: f.gambar || '',
            urutan: f.urutan || (idx + 1),
            is_active: 1
          }));
        } else {
          for (const f of parsed.fasilitas) {
            const exists = currentDB.fasilitas.some((x: any) => x.judul.toLowerCase() === f.judul.toLowerCase());
            if (!exists) {
              const nextId = currentDB.fasilitas.reduce((max: number, x: any) => x.id > max ? x.id : max, 0) + 1;
              currentDB.fasilitas.push({
                id: nextId,
                judul: f.judul,
                deskripsi: f.deskripsi || '',
                ikon: f.ikon || 'Home',
                gambar: f.gambar || '',
                urutan: f.urutan || nextId,
                is_active: 1
              });
            }
          }
        }
      }

      // E. Ekskul
      if (Array.isArray(parsed.ekskul)) {
        if (!onlyEmpty || !currentDB.ekskul || currentDB.ekskul.length === 0) {
          currentDB.ekskul = parsed.ekskul.map((e: any, idx: number) => ({
            id: idx + 1,
            judul: e.judul,
            deskripsi: e.deskripsi || '',
            ikon: e.ikon || 'Compass',
            gambar: e.gambar || '',
            urutan: e.urutan || (idx + 1),
            is_active: 1
          }));
        } else {
          for (const e of parsed.ekskul) {
            const exists = currentDB.ekskul.some((x: any) => x.judul.toLowerCase() === e.judul.toLowerCase());
            if (!exists) {
              const nextId = currentDB.ekskul.reduce((max: number, x: any) => x.id > max ? x.id : max, 0) + 1;
              currentDB.ekskul.push({
                id: nextId,
                judul: e.judul,
                deskripsi: e.deskripsi || '',
                ikon: e.ikon || 'Compass',
                gambar: e.gambar || '',
                urutan: e.urutan || nextId,
                is_active: 1
              });
            }
          }
        }
      }

      // F. Prestasi
      if (Array.isArray(parsed.prestasi)) {
        if (!onlyEmpty || !currentDB.prestasi || currentDB.prestasi.length === 0) {
          currentDB.prestasi = parsed.prestasi.map((p: any, idx: number) => ({
            id: idx + 1,
            judul: p.judul,
            tahun: p.tahun || "2026",
            deskripsi: p.deskripsi || '',
            gambar: p.gambar || '',
            urutan: p.urutan || (idx + 1),
            is_active: 1
          }));
        } else {
          for (const p of parsed.prestasi) {
            const exists = currentDB.prestasi.some((x: any) => x.judul.toLowerCase() === p.judul.toLowerCase());
            if (!exists) {
              const nextId = currentDB.prestasi.reduce((max: number, x: any) => x.id > max ? x.id : max, 0) + 1;
              currentDB.prestasi.push({
                id: nextId,
                judul: p.judul,
                tahun: p.tahun || "2026",
                deskripsi: p.deskripsi || '',
                gambar: p.gambar || '',
                urutan: p.urutan || nextId,
                is_active: 1
              });
            }
          }
        }
      }

      // G. Galeri
      if (parsed.galeri) {
        const buffer: any[] = [];
        if (Array.isArray(parsed.galeri.foto)) {
          parsed.galeri.foto.forEach((f: any, idx: number) => {
            buffer.push({
              id: idx + 100,
              judul: f.judul,
              gambar: f.file || '',
              tipe: 'image',
              urutan: idx + 1,
              is_active: 1
            });
          });
        }
        if (Array.isArray(parsed.galeri.video)) {
          parsed.galeri.video.forEach((v: any, idx: number) => {
            buffer.push({
              id: idx + 200,
              judul: v.judul,
              gambar: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=400&fit=crop',
              tipe: 'youtube',
              embed_id: v.embed_id,
              urutan: idx + 1,
              is_active: 1
            });
          });
        }

        if (!onlyEmpty || !currentDB.galeri || currentDB.galeri.length === 0) {
          currentDB.galeri = buffer.map((item, idx) => ({ ...item, id: idx + 1 }));
        } else {
          for (const g of buffer) {
            const exists = currentDB.galeri.some((x: any) => x.judul.toLowerCase() === g.judul.toLowerCase() && x.tipe === g.tipe);
            if (!exists) {
              const nextId = currentDB.galeri.reduce((max: number, x: any) => x.id > max ? x.id : max, 0) + 1;
              currentDB.galeri.push({ ...g, id: nextId, urutan: nextId });
            }
          }
        }
      }

      // H. Sosial Media & Contacts
      if (parsed.sosial_media) {
        const s = parsed.sosial_media;
        const mapUrl = (platform: 'facebook' | 'instagram' | 'youtube' | 'twitter', url: string) => {
          if (!url) return;
          const existItem = currentDB.sosial_media.find((x: any) => x.platform === platform);
          if (existItem && (!onlyEmpty || existItem.url === '')) {
            existItem.url = url;
          }
        };
        mapUrl('facebook', s.facebook);
        mapUrl('instagram', s.instagram);
        mapUrl('youtube', s.youtube);
        mapUrl('twitter', s.twitter);

        if (s.whatsapp_admin) {
          const wa = currentDB.kontak.find((x: any) => x.tipe === 'whatsapp');
          if (wa && (!onlyEmpty || wa.value === '')) {
            wa.value = s.whatsapp_admin;
          }
        }
        if (s.maps_embed) {
          const m = currentDB.kontak.find((x: any) => x.tipe === 'maps_embed');
          if (m && (!onlyEmpty || m.value === '')) {
            m.value = s.maps_embed;
          }
        }
      }

      // I. PPDB Setting
      if (parsed.ppdb) {
        if (!currentDB.ppdb) currentDB.ppdb = [];
        const activeItem = currentDB.ppdb.find((x: any) => x.is_active === 1) || currentDB.ppdb[0];

        const templatePPDB = {
          tahun_ajaran: parsed.ppdb.tahun_ajaran || "2025/2026",
          gelombang: parsed.ppdb.gelombang || "1",
          mulai: parsed.ppdb.tanggal_mulai || "",
          selesai: parsed.ppdb.tanggal_selesai || "",
          kuota: parsed.ppdb.kuota || 120,
          link_pendaftaran: parsed.ppdb.link_pendaftaran || "",
          kontak_wa: parsed.ppdb.kontak_wa || "",
          is_active: 1
        };

        if (!activeItem) {
          currentDB.ppdb.push({ id: 1, ...templatePPDB });
        } else {
          for (const key in templatePPDB) {
            if (!onlyEmpty || !activeItem[key] || activeItem[key] === '') {
              activeItem[key] = (templatePPDB as any)[key];
            }
          }
        }
      }

      // J. Artikel
      if (Array.isArray(parsed.artikel)) {
        if (!onlyEmpty || !currentDB.artikel || currentDB.artikel.length === 0) {
          currentDB.artikel = parsed.artikel.map((art: any, idx: number) => ({
            id: idx + 1,
            judul: art.judul,
            ringkasan: art.ringkasan || '',
            isi: art.isi || art.ringkasan || '',
            gambar: art.gambar || 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=400&fit=crop',
            tanggal: art.tanggal || new Date().toISOString().split('T')[0],
            status: art.status || 'publish',
            created_at: new Date().toISOString()
          }));
        } else {
          for (const art of parsed.artikel) {
            const exists = currentDB.artikel.some((x: any) => x.judul.toLowerCase() === art.judul.toLowerCase());
            if (!exists) {
              const nextId = currentDB.artikel.reduce((max: number, x: any) => x.id > max ? x.id : max, 0) + 1;
              currentDB.artikel.push({
                id: nextId,
                judul: art.judul,
                ringkasan: art.ringkasan || '',
                isi: art.isi || art.ringkasan || '',
                gambar: art.gambar || 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=400&fit=crop',
                tanggal: art.tanggal || new Date().toISOString().split('T')[0],
                status: art.status || 'publish',
                created_at: new Date().toISOString()
              });
            }
          }
        }
      }
    }

    fs.writeFileSync(DB_FILE, JSON.stringify(currentDB, null, 2), 'utf8');

    // revalidate cache 
    initDB();

    // write history log record
    const backupDir = path.join(process.cwd(), 'database', 'backups');
    const historyFile = path.join(backupDir, 'history.json');
    let historyList = [];
    if (fs.existsSync(historyFile)) {
      try {
        historyList = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
      } catch {
        historyList = [];
      }
    }

    historyList.unshift({
      id: Date.now() + 1,
      timestamp: new Date().toISOString(),
      filename: isFullBackup ? 'sekolah_export_full.json' : 'template_import_sekolah.json',
      size: `${(fileContent.length / 1024).toFixed(1)} KB`,
      user: req.username || 'admin',
      type: 'import',
      details: `Sukses import data awal (${isFullBackup ? 'Ekspor Full' : 'Spreadsheet/Template'}). Mode timpa kosong: ${onlyEmpty ? 'Aktif' : 'Nonaktif'}.`
    });

    fs.writeFileSync(historyFile, JSON.stringify(historyList, null, 2), 'utf8');

    db.logAction(req.userId!, req.username!, 'Import DB', `Sukses melangsungkan import data sekolah. Mode isi kosong: ${onlyEmpty ? 'Y' : 'T'}.`, getClientIp(req));

    res.json({ success: true, message: 'Selamat! Data sekolah berhasil di-proses dan di-import.' });
  } catch (e: any) {
    res.status(400).json({ error: 'Uraian file salah atau format berkas berkerusakan.', details: e.message });
  }
});

// GET Import/Backup history list
app.get('/api/backups/history', checkAuth('admin'), (req: AuthRequest, res: Response) => {
  const historyFile = path.join(process.cwd(), 'database', 'backups', 'history.json');
  if (!fs.existsSync(historyFile)) {
    res.json([]);
    return;
  }
  try {
    const list = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    res.json(list);
  } catch {
    res.json([]);
  }
});


// --- INTEGRATE VITE PROGRAMMATICALLY IN DEV / SERVE STATIC FILES IN PROD ---

async function startServer() {
  if (!isProd) {
    // Dynamically load Vite to avoid bundling it inside production package or crashing in runtime
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom'
    });

    app.use(vite.middlewares);

    // Dynamic SPA Fallback
    app.use('*', async (req, res) => {
      const url = req.originalUrl;
      try {
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.stack);
      }
    });
  } else {
    // Server static bundle files
    app.use(express.static(path.join(process.cwd(), 'dist')));
    
    // Serve index.html as fallback for Router history support
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`Fullstack server running successfully at http://localhost:${port} in ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'} mode.`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
