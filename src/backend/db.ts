/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { 
  User, Sekolah, SosialMedia, Kontak, Menu, Banner, 
  Fasilitas, Ekskul, Guru, Prestasi, Galeri, Artikel, 
  Pengaturan, LogAktivitas, Jabatan, PPDB, PendaftaranPPDB
} from '../types';

const DB_DIR = path.join(process.cwd(), 'database');
const DB_FILE = path.join(DB_DIR, 'sekolah.json');

interface Schema {
  users: User[];
  sekolah: Sekolah;
  sosial_media: SosialMedia[];
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
  pengaturan: Pengaturan[];
  log_aktivitas: LogAktivitas[];
  pendaftaran_ppdb: PendaftaranPPDB[];
  login_attempts: { ip: string; count: number; blocked_until?: string }[];
}

// In-memory cache synced with disk
let dbCache: Schema | null = null;

// Standard hashing helper for demo - simple but consistent with specifications
function demoHash(password: string): string {
  // Simple deterministic password verification
  return password; 
}

const DEFAULT_DB: Schema = {
  users: [
    {
      id: 1,
      username: 'admin',
      role: 'admin',
      nama_lengkap: 'Administrator',
      email: 'admin@binabangsa.sch.id',
      created_at: new Date('2026-01-01').toISOString(),
      password: '4dm1nisTRATOR'
    },
    {
      id: 2,
      username: 'operator',
      role: 'operator',
      nama_lengkap: 'Operator Sekolah',
      email: 'operator@binabangsa.sch.id',
      created_at: new Date('2026-01-01').toISOString(),
      password: 'operator123'
    }
  ],
  sekolah: {
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
      'Membentuk karakter disiplin, sopan santun, dan peduli lingkungan.',
      'Menerapkan tata kelola sekolah yang transparan dan akuntabel berbasis digital.'
    ],
    logo: '', // empty by default, fallback to neat CSS logo
    favicon: ''
  },
  sosial_media: [
    { id: 1, platform: 'facebook', url: 'https://facebook.com/smpbinabangsa', ikon: 'Facebook' },
    { id: 2, platform: 'instagram', url: 'https://instagram.com/smpbinabangsa', ikon: 'Instagram' },
    { id: 3, platform: 'youtube', url: 'https://youtube.com/c/smpbinabangsatv', ikon: 'Youtube' },
    { id: 4, platform: 'twitter', url: 'https://twitter.com/smpbinabangsa', ikon: 'Twitter' }
  ],
  kontak: [
    { id: 1, tipe: 'whatsapp', value: '081234567890', label: 'Hubungi Kami (WhatsApp)' },
    { id: 2, tipe: 'maps_embed', value: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126748.56347862214!2d107.57311635!3d-6.9034443!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e68e6398252477f%3A0x146a16b4c3e8e124!2sBandung%2C%20West%20Java!5e0!3m2!1sen!2sid!4v1700000000000!5m2!1sen!2sid', label: 'Peta Lokasi' },
    { id: 3, tipe: 'jam_operasional', value: 'Senin - Jumat: 07:00 - 15:00 WIB', label: 'Jam Kerja' }
  ],
  menus: [
    { id: 1, label: 'Beranda', url: '#home', parent_id: null, urutan: 1, is_active: 1 },
    { id: 2, label: 'Profil', url: '#profil', parent_id: null, urutan: 2, is_active: 1 },
    { id: 3, label: 'Visi Misi', url: '#visi-misi', parent_id: 2, urutan: 1, is_active: 1 },
    { id: 4, label: 'Guru & Staff', url: '#guru', parent_id: 2, urutan: 2, is_active: 1 },
    { id: 12, label: 'Struktur Organisasi', url: '#struktur', parent_id: 2, urutan: 3, is_active: 1 },
    { id: 5, label: 'Fasilitas', url: '#fasilitas', parent_id: null, urutan: 3, is_active: 1 },
    { id: 6, label: 'Ekstrakurikuler', url: '#ekskul', parent_id: null, urutan: 4, is_active: 1 },
    { id: 7, label: 'Prestasi', url: '#prestasi', parent_id: null, urutan: 5, is_active: 1 },
    { id: 8, label: 'Galeri', url: '#galeri', parent_id: null, urutan: 6, is_active: 1 },
    { id: 9, label: 'Artikel', url: '#artikel', parent_id: null, urutan: 7, is_active: 1 },
    { id: 10, label: 'Kontak', url: '#kontak', parent_id: null, urutan: 8, is_active: 1 },
    { id: 11, label: 'PPDB', url: '#ppdb', parent_id: null, urutan: 99, is_active: 1 }
  ],
  banners: [
    {
      id: 1,
      judul: 'Pendidikan Berkualitas, Karakter Unggul',
      subjudul: 'Selamat datang di SMP Bina Bangsa Indonesia. Kami berkomitmen mencetak generasi cerdas, mandiri, dan berbudi pekerti luhur.',
      gambar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1200&auto=format&fit=crop',
      tombol_teks: 'Temukan Visi Kami',
      tombol_link: '#visi-misi',
      urutan: 1,
      is_active: 1
    },
    {
      id: 2,
      judul: 'Fasilitas Belajar Modern & Ramah Lingkungan',
      subjudul: 'Didukung sarana penunjang yang canggih untuk mengoptimalkan potensi akademis dan kreativitas murid.',
      gambar: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop',
      tombol_teks: 'Lihat Fasilitas',
      tombol_link: '#fasilitas',
      urutan: 2,
      is_active: 1
    }
  ],
  fasilitas: [
    {
      id: 1,
      judul: 'Laboratorium Komputer',
      deskripsi: 'Laboratorium modern dengan 40 unit komputer berspesifikasi tinggi dan koneksi internet cepat untuk mendukung kecakapan teknologi murid.',
      ikon: 'Laptop',
      gambar: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=600&auto=format&fit=crop',
      urutan: 1,
      is_active: 1
    },
    {
      id: 2,
      judul: 'Perpustakaan Literasi',
      deskripsi: 'Berisi ribuan koleksi buku fiksi, non-fiksi, ensiklopedia, serta ruang baca ber-AC yang nyaman untuk merangsang minat baca murid.',
      ikon: 'BookOpen',
      gambar: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=600&auto=format&fit=crop',
      urutan: 2,
      is_active: 1
    },
    {
      id: 3,
      judul: 'Laboratorium IPA Terpadu',
      deskripsi: 'Lengkap dengan alat peraga biologi, peralatan praktikum kimia, dan sarana fisika untuk menguji teori keilmuan secara langsung.',
      ikon: 'FlaskConical',
      gambar: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop',
      urutan: 3,
      is_active: 1
    }
  ],
  ekskul: [
    {
      id: 1,
      judul: 'Pramuka (Wajib)',
      deskripsi: 'Membentuk kemandirian, kedisiplinan, kerjasama kelompok, jiwa kepemimpinan, dan kecintaan pada tanah air dan sesama.',
      ikon: 'Compass',
      gambar: 'https://images.unsplash.com/photo-1564981797816-1043d01bf53d?q=80&w=600&auto=format&fit=crop',
      urutan: 1,
      is_active: 1
    },
    {
      id: 2,
      judul: 'Klub Robotik',
      deskripsi: 'Memperkenalkan ilmu dasar mekatronika dan koding dasar untuk merancang robot cerdas guna mengikuti kompetisi nasional.',
      ikon: 'Cpu',
      gambar: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop',
      urutan: 2,
      is_active: 1
    },
    {
      id: 3,
      judul: 'Paskibra',
      deskripsi: 'Menanamkan rasa patriotisme, kekeluargaan, sikap tegap sigap, serta meningkatkan kesadaran berbangsa lewat baris-berbaris.',
      ikon: 'Shield',
      gambar: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=600&auto=format&fit=crop',
      urutan: 3,
      is_active: 1
    }
  ],
  guru: [
    {
      id: 1,
      nama: 'Drs. Supriyanto, M.M.',
      jabatan_id: 3,
      mapel: 'Matematika',
      foto: '',
      urutan: 1,
      is_active: 1,
      nik: '3204123456780001',
      nuptk: '1234567890123456',
      kontak: '081234567891',
      email: 'supriyanto@binabangsa.sch.id',
      wali_kelas: ''
    },
    {
      id: 2,
      nama: 'Sari Handayani, S.Pd.',
      jabatan_id: 7,
      mapel: 'Bahasa Inggris',
      foto: '',
      urutan: 2,
      is_active: 1,
      nik: '3204123456780002',
      nuptk: '2345678901234567',
      kontak: '081234567892',
      email: 'sari@binabangsa.sch.id',
      wali_kelas: '8A'
    },
    {
      id: 3,
      nama: 'Budi Hartono, S.T.',
      jabatan_id: 7,
      mapel: 'Informatika',
      foto: '',
      urutan: 3,
      is_active: 1,
      nik: '3204123456780003',
      nuptk: '',
      kontak: '081234567893',
      email: 'budi@binabangsa.sch.id',
      wali_kelas: ''
    }
  ],
  jabatan: [
    { id: 1, nama: 'Kepala Yayasan', tingkat: 1, parent_id: null, urutan: 1, is_active: 1 },
    { id: 2, nama: 'Kepala Sekolah', tingkat: 2, parent_id: null, urutan: 2, is_active: 1 },
    { id: 3, nama: 'Wakil Kepala Sekolah', tingkat: 2, parent_id: 2, urutan: 3, is_active: 1 },
    { id: 4, nama: 'Kepala Tata Usaha', tingkat: 2, parent_id: 2, urutan: 4, is_active: 1 },
    { id: 5, nama: 'Koordinator Kurikulum', tingkat: 3, parent_id: 3, urutan: 5, is_active: 1 },
    { id: 6, nama: 'Wali Kelas', tingkat: 3, parent_id: 3, urutan: 6, is_active: 1 },
    { id: 7, nama: 'Guru Mapel', tingkat: 3, parent_id: 3, urutan: 7, is_active: 1 },
    { id: 8, nama: 'Staff Tata Usaha', tingkat: 3, parent_id: 4, urutan: 8, is_active: 1 }
  ],
  ppdb: [
    {
      id: 1,
      tahun_ajaran: '2025/2026',
      gelombang: 'Gelombang 1',
      tanggal_mulai: '2025-01-01',
      tanggal_selesai: '2025-03-31',
      kuota: 120,
      link_pendaftaran: 'https://forms.google.com/your-form',
      kontak_wa: '6288220512135',
      is_active: 1
    }
  ],
  prestasi: [
    {
      id: 1,
      judul: 'Juara 1 Olimpiade Sains Nasional (OSN) Biologi',
      tahun: '2025',
      deskripsi: 'Prestasi gemilang diraih murid kami, Keysha Anandita, yang berhasil menyabet medali emas di tingkat Provinsi Jawa Barat.',
      gambar: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=600&auto=format&fit=crop',
      urutan: 1,
      is_active: 1
    },
    {
      id: 2,
      judul: 'Juara Umum Turnamen Futsal Bupati Cup',
      tahun: '2025',
      deskripsi: 'Tim Futsal kebanggaan sekolahan membawa pulang Piala Bergilir setelah memenangkan babak final dengan skor telak 4-1.',
      gambar: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
      urutan: 2,
      is_active: 1
    }
  ],
  galeri: [
    {
      id: 1,
      judul: 'Upacara Bendera Hari Kemerdekaan',
      gambar: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop',
      tipe: 'image',
      urutan: 1,
      is_active: 1
    },
    {
      id: 2,
      judul: 'Profil Singkat Sekolah',
      gambar: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop',
      tipe: 'youtube',
      embed_id: 'dQw4w9WgXcQ', // standard demo video
      urutan: 2,
      is_active: 1
    }
  ],
  artikel: [
    {
      id: 1,
      judul: 'Penerimaan Peserta Didik Baru (PPDB) Tahun Ajaran 2026/2027 Telah Dibuka',
      ringkasan: 'SMP Bina Bangsa Indonesia Soreang resmi membuka pendaftaran murid baru. Simak persyaratan lengkap jalur zonasi, prestasi, dan afirmasi di sini.',
      isi: '<p>Kabar gembira untuk segenap calon siswa baru. SMP Bina Bangsa Indonesia secara resmi mengumumkan pembukaan pendaftaran murid baru (PPDB) untuk tahun pelajaran 2026/2027.</p><p>Kami menyediakan tiga jalur seleksi utama yang dapat dipilih:</p><ul><li><strong>Jalur Prestasi:</strong> Menggunakan nilai raport rata-rata atau piagam perlombaan minimal tingkat kabupaten.</li><li><strong>Jalur Zonasi:</strong> Memprioritaskan domisili siswa terdekat dari lokasi sekolah.</li><li><strong>Jalur Kemitraan & Afirmasi:</strong> Ditujukan untuk siswa berlatar keluarga prasejahtera dengan dukungan beasiswa penuh hingga lulus.</li></ul><p>Pendaftaran gelombang pertama berlangsung dari <strong>1 Juni 2026 hingga 25 Juli 2026</strong> secara online maupun langsung di kantor sekretariat panitia.</p>',
      gambar: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=800&auto=format&fit=crop',
      tanggal: '2026-06-01',
      status: 'publish',
      created_at: new Date('2026-06-01').toISOString()
    },
    {
      id: 2,
      judul: 'Pelaksanaan Pentas Seni & Kreativitas Akhir Tahun Berlangsung Meriah',
      ringkasan: 'Pentas seni tahunan SMP Bina Bangsa Indonesia diisi oleh kreativitas teater, tarian tradisional d hingga stan bazar kewirausahaan murid.',
      isi: '<p>Tepat pada akhir semester genap kemarin, halaman utama SMP Bina Bangsa Indonesia disulap menjadi panggung megah pagelaran seni dan kewirausahaan murid.</p><p>Kegiatan tahunan ini diselenggarakan sebagai wadah asesmen kreativitas seni budaya sekaligus mengasah jiwa kemandirian finansial murid melalui bazar kuliner sehat nusantara.</p><p>Kombinasi tarian tradisional Jaipong kolosal dan pertunjukan angklung modern memukau para wali murid serta penonton yang hadir.</p>',
      gambar: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
      tanggal: '2026-05-28',
      status: 'publish',
      created_at: new Date('2026-05-28').toISOString()
    }
  ],
  pengaturan: [
    { key: 'site_title', value: 'SMP BINA BANGSA INDONESIA', deskripsi: 'Judul website' },
    { key: 'footer_text', value: '© 2026 SMP Bina Bangsa Indonesia. All rights reserved.', deskripsi: 'Teks footer' },
    { key: 'meta_description', value: 'Sekolah unggul berprestasi dan berkarakter mulia di Soreang, Kabupaten Bandung', deskripsi: 'Meta deskripsi SEO' }
  ],
  log_aktivitas: [
    {
      id: 1,
      user_id: 1,
      username: 'admin',
      aksi: 'Inisialisasi Database',
      detail: 'Sistem berhasil menginisialisasi database sekolah default.',
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString()
    }
  ],
  pendaftaran_ppdb: [
    {
      id: 'PPDB-482012',
      nama: 'Budi Santoso',
      nik: '3204120309130005',
      nisn: '0139854721',
      gender: 'Laki-laki',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '2013-09-03',
      nama_wali: 'Joko Santoso',
      kontak_wali: '08122334455',
      sekolah_asal: 'SD Negeri Soreang 01',
      alamat: 'Jl. Ahmad Yani No. 12, Soreang, Bandung',
      tanggal_daftar: '2026-06-01T08:30:00.000Z',
      status: 'disetujui'
    },
    {
      id: 'PPDB-915034',
      nama: 'Siti Rahmawati',
      nik: '3204124905130002',
      nisn: '0134928153',
      gender: 'Perempuan',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '2013-05-19',
      nama_wali: 'Imam Rahmawan',
      kontak_wali: '08139472648',
      sekolah_asal: 'MIN 2 Bandung',
      alamat: 'Komplek Gading Tutuka blok B2 No 14, Soreang',
      tanggal_daftar: '2026-06-02T10:15:00.000Z',
      status: 'proses'
    },
    {
      id: 'PPDB-128456',
      nama: 'Andi Wijaya',
      nik: '3204121212130001',
      gender: 'Laki-laki',
      tempat_lahir: 'Bandung',
      tanggal_lahir: '2013-12-12',
      nama_wali: 'Hery Wijaya',
      kontak_wali: '08529482716',
      sekolah_asal: 'SD Swasta Pelopor Bangsa',
      alamat: 'Kp. Citeureup RT 03 RW 01, Soreang',
      tanggal_daftar: '2026-06-02T14:45:00.000Z',
      status: 'ditolak'
    }
  ],
  login_attempts: []
};

// Ensure database file and directories exist
export function initDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
    dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
    console.log('Database initialized successfully.');
  } else {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      dbCache = JSON.parse(content);
      // Migrate missing keys if any
      let modified = false;
      const keys = Object.keys(DEFAULT_DB) as (keyof Schema)[];
      for (const key of keys) {
        if (!dbCache![key]) {
          (dbCache as any)[key] = DEFAULT_DB[key];
          modified = true;
        }
      }

      // Ensure existing users have passwords set
      if (dbCache && dbCache.users) {
        for (const u of dbCache.users) {
          if (!u.password) {
            if (u.username === 'admin') {
              u.password = '4dm1nisTRATOR';
              modified = true;
            } else if (u.username === 'operator') {
              u.password = 'operator123';
              modified = true;
            }
          }
        }
      }

      // Legacy guru migration to tenaga_pendidik standard
      if (dbCache && dbCache.guru) {
        for (const g of dbCache.guru) {
          if (g.jabatan_id === undefined || g.jabatan_id === null) {
            const jabName = (g as any).jabatan || '';
            let parsedId = 7; // default Guru Mapel
            if (jabName.toLowerCase().includes('yayasan')) parsedId = 1;
            else if (jabName.toLowerCase().includes('wakil')) parsedId = 3;
            else if (jabName.toLowerCase().includes('kepala sekolah')) parsedId = 2;
            else if (jabName.toLowerCase().includes('tata usaha') && jabName.toLowerCase().includes('kepala')) parsedId = 4;
            else if (jabName.toLowerCase().includes('kurikulum')) parsedId = 5;
            else if (jabName.toLowerCase().includes('wali')) parsedId = 6;
            else if (jabName.toLowerCase().includes('guru')) parsedId = 7;
            else if (jabName.toLowerCase().includes('staff') || jabName.toLowerCase().includes('tata usaha') || jabName.toLowerCase().includes('tu')) parsedId = 8;
            
            g.jabatan_id = parsedId;
            g.nik = g.nik || '';
            g.nuptk = g.nuptk || '';
            g.kontak = g.kontak || '';
            g.email = g.email || '';
            g.wali_kelas = g.wali_kelas || '';
            modified = true;
          }
        }
      }

      if (modified) {
        fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
      }
    } catch (e) {
      console.error('Error reading DB, resetting to defaults:', e);
      fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf8');
      dbCache = JSON.parse(JSON.stringify(DEFAULT_DB));
    }
  }
}

// Retrieve DB cache or load
function getDB(): Schema {
  if (!dbCache) {
    initDB();
  }
  return dbCache!;
}

// Save to disk
function saveDB() {
  if (dbCache) {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2), 'utf8');
  }
}

// Global generic functions
export const db = {
  // Config / App parameters
  getSetting(key: string): string {
    const list = getDB().pengaturan;
    const match = list.find(p => p.key === key);
    return match ? match.value : '';
  },

  updateSetting(key: string, value: string): boolean {
    const item = getDB().pengaturan.find(p => p.key === key);
    if (item) {
      item.value = value;
      saveDB();
      return true;
    }
    return false;
  },

  getSekolah(): Sekolah {
    return getDB().sekolah;
  },

  updateSekolah(data: Partial<Sekolah>): Sekolah {
    const s = getDB().sekolah;
    Object.assign(s, data);
    saveDB();
    return s;
  },

  // Users Management
  getUsers(): User[] {
    return getDB().users.map(({ id, username, role, nama_lengkap, email, last_login, created_at }) => ({
      id, username, role, nama_lengkap, email, last_login, created_at
    }));
  },

  getUserById(id: number): User | null {
    const u = getDB().users.find(item => item.id === id);
    if (!u) return null;
    const { password, ...safeUser } = u as any;
    return safeUser;
  },

  getUserByUsername(username: string) {
    return getDB().users.find(item => item.username.toLowerCase() === username.toLowerCase()) || null;
  },

  createUser(u: Omit<User, 'id' | 'created_at'> & { passwordPlain: string }): User {
    const data = getDB();
    const nextId = data.users.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const newUser: any = {
      id: nextId,
      username: u.username,
      role: u.role,
      nama_lengkap: u.nama_lengkap,
      email: u.email || '',
      password: demoHash(u.passwordPlain),
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    saveDB();
    return this.getUserById(nextId)!;
  },

  updateUser(id: number, u: Partial<User> & { passwordPlain?: string }): User | null {
    const data = getDB();
    const index = data.users.findIndex(x => x.id === id);
    if (index === -1) return null;

    const existing = data.users[index];
    if (u.username) existing.username = u.username;
    if (u.nama_lengkap) existing.nama_lengkap = u.nama_lengkap;
    if (u.email) existing.email = u.email;
    if (u.role && (u.role === 'admin' || u.role === 'operator')) existing.role = u.role;
    if (u.passwordPlain) {
      (existing as any).password = demoHash(u.passwordPlain);
    }
    if (u.last_login) existing.last_login = u.last_login;

    saveDB();
    return this.getUserById(id);
  },

  deleteUser(id: number): boolean {
    const data = getDB();
    const index = data.users.findIndex(x => x.id === id);
    if (index === -1) return false;
    // Don't delete the last admin
    const userToDelete = data.users[index];
    if (userToDelete.role === 'admin') {
      const adminCount = data.users.filter(x => x.role === 'admin').length;
      if (adminCount <= 1) return false; // Prevent logic locks
    }
    data.users.splice(index, 1);
    saveDB();
    return true;
  },

  // Social Media Management
  getSosialMedia(): SosialMedia[] {
    return getDB().sosial_media;
  },

  updateSosialMedia(list: SosialMedia[]): void {
    getDB().sosial_media = list;
    saveDB();
  },

  // Contacts Management
  getKontak(): Kontak[] {
    return getDB().kontak;
  },

  updateKontak(list: Kontak[]): void {
    getDB().kontak = list;
    saveDB();
  },

  // Menu Management
  getMenus(): Menu[] {
    return getDB().menus.sort((a,b) => a.urutan - b.urutan);
  },

  addMenu(m: Omit<Menu, 'id'>): Menu {
    const data = getDB();
    const nextId = data.menus.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const newMenu = { ...m, id: nextId };
    data.menus.push(newMenu);
    saveDB();
    return newMenu;
  },

  updateMenu(id: number, m: Partial<Menu>): Menu | null {
    const data = getDB();
    const item = data.menus.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, m);
    saveDB();
    return item;
  },

  deleteMenu(id: number): boolean {
    const data = getDB();
    const initialLen = data.menus.length;
    data.menus = data.menus.filter(x => x.id !== id && x.parent_id !== id); // delete menu and submenus
    saveDB();
    return data.menus.length < initialLen;
  },

  // Banners Management
  getBanners(): Banner[] {
    return getDB().banners.sort((a,b) => a.urutan - b.urutan);
  },

  addBanner(b: Omit<Banner, 'id'>): Banner {
    const data = getDB();
    const nextId = data.banners.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const newBanner = { ...b, id: nextId };
    data.banners.push(newBanner);
    saveDB();
    return newBanner;
  },

  updateBanner(id: number, b: Partial<Banner>): Banner | null {
    const data = getDB();
    const item = data.banners.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, b);
    saveDB();
    return item;
  },

  deleteBanner(id: number): boolean {
    const data = getDB();
    const index = data.banners.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.banners.splice(index, 1);
    saveDB();
    return true;
  },

  // Facilities
  getFasilitas(): Fasilitas[] {
    return getDB().fasilitas.sort((a,b) => a.urutan - b.urutan);
  },

  addFasilitas(f: Omit<Fasilitas, 'id'>): Fasilitas {
    const data = getDB();
    const nextId = data.fasilitas.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item = { ...f, id: nextId };
    data.fasilitas.push(item);
    saveDB();
    return item;
  },

  updateFasilitas(id: number, f: Partial<Fasilitas>): Fasilitas | null {
    const data = getDB();
    const item = data.fasilitas.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, f);
    saveDB();
    return item;
  },

  deleteFasilitas(id: number): boolean {
    const data = getDB();
    const index = data.fasilitas.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.fasilitas.splice(index, 1);
    saveDB();
    return true;
  },

  // Extracurriculars
  getEkskul(): Ekskul[] {
    return getDB().ekskul.sort((a,b) => a.urutan - b.urutan);
  },

  addEkskul(e: Omit<Ekskul, 'id'>): Ekskul {
    const data = getDB();
    const nextId = data.ekskul.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item = { ...e, id: nextId };
    data.ekskul.push(item);
    saveDB();
    return item;
  },

  updateEkskul(id: number, e: Partial<Ekskul>): Ekskul | null {
    const data = getDB();
    const item = data.ekskul.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, e);
    saveDB();
    return item;
  },

  deleteEkskul(id: number): boolean {
    const data = getDB();
    const index = data.ekskul.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.ekskul.splice(index, 1);
    saveDB();
    return true;
  },

  // Teachers
  getGuru(): Guru[] {
    return getDB().guru.sort((a,b) => a.urutan - b.urutan);
  },

  addGuru(g: Omit<Guru, 'id'>): Guru {
    const data = getDB();
    const nextId = data.guru.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item = { ...g, id: nextId };
    data.guru.push(item);
    saveDB();
    return item;
  },

  updateGuru(id: number, g: Partial<Guru>): Guru | null {
    const data = getDB();
    const item = data.guru.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, g);
    saveDB();
    return item;
  },

  deleteGuru(id: number): boolean {
    const data = getDB();
    const index = data.guru.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.guru.splice(index, 1);
    saveDB();
    return true;
  },

  // Achievements
  getPrestasi(): Prestasi[] {
    return getDB().prestasi.sort((a,b) => a.urutan - b.urutan);
  },

  addPrestasi(p: Omit<Prestasi, 'id'>): Prestasi {
    const data = getDB();
    const nextId = data.prestasi.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item = { ...p, id: nextId };
    data.prestasi.push(item);
    saveDB();
    return item;
  },

  updatePrestasi(id: number, p: Partial<Prestasi>): Prestasi | null {
    const data = getDB();
    const item = data.prestasi.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, p);
    saveDB();
    return item;
  },

  deletePrestasi(id: number): boolean {
    const data = getDB();
    const index = data.prestasi.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.prestasi.splice(index, 1);
    saveDB();
    return true;
  },

  // Gallery
  getGaleri(): Galeri[] {
    return getDB().galeri.sort((a,b) => a.urutan - b.urutan);
  },

  addGaleri(g: Omit<Galeri, 'id'>): Galeri {
    const data = getDB();
    const nextId = data.galeri.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item = { ...g, id: nextId };
    data.galeri.push(item);
    saveDB();
    return item;
  },

  updateGaleri(id: number, g: Partial<Galeri>): Galeri | null {
    const data = getDB();
    const item = data.galeri.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, g);
    saveDB();
    return item;
  },

  deleteGaleri(id: number): boolean {
    const data = getDB();
    const index = data.galeri.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.galeri.splice(index, 1);
    saveDB();
    return true;
  },

  // Articles
  getArtikel(): Artikel[] {
    return getDB().artikel.sort((a,b) => new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime());
  },

  getArtikelById(id: number): Artikel | null {
    return getDB().artikel.find(x => x.id === id) || null;
  },

  addArtikel(a: Omit<Artikel, 'id' | 'created_at'>): Artikel {
    const data = getDB();
    const nextId = data.artikel.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item: Artikel = { 
      ...a, 
      id: nextId, 
      created_at: new Date().toISOString() 
    };
    data.artikel.push(item);
    saveDB();
    return item;
  },

  updateArtikel(id: number, a: Partial<Artikel>): Artikel | null {
    const data = getDB();
    const item = data.artikel.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, a);
    item.updated_at = new Date().toISOString();
    saveDB();
    return item;
  },

  deleteArtikel(id: number): boolean {
    const data = getDB();
    const index = data.artikel.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.artikel.splice(index, 1);
    saveDB();
    return true;
  },

  // Log Aktivitas
  getLogs(): LogAktivitas[] {
    return getDB().log_aktivitas.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  logAction(userId: number | null, username: string, aksi: string, detail: string, ip: string): void {
    const data = getDB();
    const nextId = data.log_aktivitas.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    data.log_aktivitas.push({
      id: nextId,
      user_id: userId,
      username,
      aksi,
      detail,
      ip_address: ip || '127.0.0.1',
      created_at: new Date().toISOString()
    });
    saveDB();
  },

  // Login Brute Force Counter & Validation
  verifyLogin(username: string, passwordPlain: string, ip: string): { success: boolean; user?: User; error?: string } {
    const data = getDB();
    // Brute force checks
    const attemptIndex = data.login_attempts.findIndex(x => x.ip === ip);
    let attempt = attemptIndex !== -1 ? data.login_attempts[attemptIndex] : null;

    if (attempt && attempt.blocked_until && new Date(attempt.blocked_until).getTime() > Date.now()) {
      return { 
        success: false, 
        error: `Terlalu banyak percobaan gagal. Silakan coba lagi setelah ${new Date(attempt.blocked_until).toLocaleTimeString('id-ID')}` 
      };
    }

    const u = data.users.find(x => x.username.toLowerCase() === username.toLowerCase());
    if (u && (u as any).password === demoHash(passwordPlain)) {
      // Success! Reset attempts
      if (attemptIndex !== -1) {
        data.login_attempts.splice(attemptIndex, 1);
      }
      u.last_login = new Date().toISOString();
      saveDB();
      this.logAction(u.id, u.username, 'Login Berhasil', `User ${u.username} (${u.role}) berhasil masuk ke admin panel.`, ip);
      
      const { password, ...safeUser } = u as any;
      return { success: true, user: safeUser };
    }

    // Failed
    if (!attempt) {
      attempt = { ip, count: 1 };
      data.login_attempts.push(attempt);
    } else {
      attempt.count += 1;
      if (attempt.count >= 5) {
        attempt.blocked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // block 15 min
      }
    }
    saveDB();

    this.logAction(null, 'Guest', 'Login Gagal', `Kombinasi login salah untuk username: ${username}. Percobaan: ${attempt.count}/5.`, ip);

    return { 
      success: false, 
      error: `Username atau password salah. Sisa percobaan sebelum diblokir: ${5 - (attempt.count % 5)}` 
    };
  },

  // Jabatan Management
  getJabatan(): Jabatan[] {
    return getDB().jabatan.sort((a,b) => a.urutan - b.urutan);
  },

  addJabatan(j: Omit<Jabatan, 'id'>): Jabatan {
    const data = getDB();
    const nextId = data.jabatan.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item = { ...j, id: nextId };
    data.jabatan.push(item);
    saveDB();
    return item;
  },

  updateJabatan(id: number, j: Partial<Jabatan>): Jabatan | null {
    const data = getDB();
    const item = data.jabatan.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, j);
    saveDB();
    return item;
  },

  deleteJabatan(id: number): boolean {
    const data = getDB();
    const index = data.jabatan.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.jabatan.splice(index, 1);
    for (const j of data.jabatan) {
      if (j.parent_id === id) {
        j.parent_id = null;
      }
    }
    saveDB();
    return true;
  },

  // PPDB Management
  getPPDB(): PPDB[] {
    return getDB().ppdb;
  },

  addPPDB(p: Omit<PPDB, 'id'>): PPDB {
    const data = getDB();
    const nextId = data.ppdb.reduce((max, x) => x.id > max ? x.id : max, 0) + 1;
    const item = { ...p, id: nextId };
    if (item.is_active === 1) {
      for (const old of data.ppdb) {
        old.is_active = 0;
      }
    }
    data.ppdb.push(item);
    saveDB();
    return item;
  },

  updatePPDB(id: number, p: Partial<PPDB>): PPDB | null {
    const data = getDB();
    const item = data.ppdb.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, p);
    if (p.is_active === 1) {
      for (const old of data.ppdb) {
        if (old.id !== id) old.is_active = 0;
      }
    }
    saveDB();
    return item;
  },

  deletePPDB(id: number): boolean {
    const data = getDB();
    const index = data.ppdb.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.ppdb.splice(index, 1);
    saveDB();
    return true;
  },

  // PPDB Registrants (Pendaftaran)
  getPendaftaranPPDB(): PendaftaranPPDB[] {
    const data = getDB();
    if (!data.pendaftaran_ppdb) {
      data.pendaftaran_ppdb = [];
    }
    return data.pendaftaran_ppdb;
  },

  addPendaftaranPPDB(p: Omit<PendaftaranPPDB, 'tanggal_daftar' | 'status'>): PendaftaranPPDB {
    const data = getDB();
    if (!data.pendaftaran_ppdb) {
      data.pendaftaran_ppdb = [];
    }
    const record: PendaftaranPPDB = {
      ...p,
      tanggal_daftar: new Date().toISOString(),
      status: 'proses'
    };
    data.pendaftaran_ppdb.push(record);
    saveDB();
    return record;
  },

  updatePendaftaranPPDB(id: string, updates: Partial<PendaftaranPPDB>): PendaftaranPPDB | null {
    const data = getDB();
    if (!data.pendaftaran_ppdb) {
      data.pendaftaran_ppdb = [];
    }
    const item = data.pendaftaran_ppdb.find(x => x.id === id);
    if (!item) return null;
    Object.assign(item, updates);
    saveDB();
    return item;
  },

  deletePendaftaranPPDB(id: string): boolean {
    const data = getDB();
    if (!data.pendaftaran_ppdb) return false;
    const index = data.pendaftaran_ppdb.findIndex(x => x.id === id);
    if (index === -1) return false;
    data.pendaftaran_ppdb.splice(index, 1);
    saveDB();
    return true;
  }
};
