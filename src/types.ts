/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: number;
  username: string;
  role: 'admin' | 'operator';
  nama_lengkap: string;
  email?: string;
  password?: string;
  last_login?: string;
  created_at: string;
}

export interface Sekolah {
  id: number;
  nama: string;
  npsn: string;
  akreditasi: string;
  status: string;
  telepon: string;
  email: string;
  alamat: string;
  kepala_sekolah: string;
  tahun_berdiri: string;
  visi: string;
  misi: string[]; // parsed from JSON array
  logo?: string;
  favicon?: string;
}

export interface SosialMedia {
  id: number;
  platform: 'facebook' | 'instagram' | 'youtube' | 'twitter';
  url: string;
  ikon: string;
}

export interface Kontak {
  id: number;
  tipe: 'whatsapp' | 'maps_embed' | 'jam_operasional';
  value: string;
  label: string;
}

export interface Menu {
  id: number;
  label: string;
  url: string;
  parent_id: number | null;
  urutan: number;
  is_active: number; // 1 or 0
  target_section?: string;
}

export interface Banner {
  id: number;
  judul: string;
  subjudul: string;
  gambar: string; // Base64 or local path
  tombol_teks: string;
  tombol_link: string;
  urutan: number;
  is_active: number;
}

export interface Fasilitas {
  id: number;
  judul: string;
  deskripsi: string;
  ikon: string;
  gambar?: string;
  urutan: number;
  is_active: number;
}

export interface Ekskul {
  id: number;
  judul: string;
  deskripsi: string;
  ikon: string;
  gambar?: string;
  urutan: number;
  is_active: number;
}

export interface Jabatan {
  id: number;
  nama: string;
  tingkat: number; // 1=Yayasan, 2=Pimpinan Sekolah, 3=Guru/TU
  parent_id: number | null;
  urutan: number;
  is_active: number;
}

export interface PPDB {
  id: number;
  tahun_ajaran: string;
  gelombang?: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  mulai?: string;
  selesai?: string;
  keterangan?: string;
  kuota?: number;
  link_pendaftaran?: string;
  kontak_wa?: string;
  is_active: number;
}

export interface Guru {
  id: number;
  nama: string;
  nik?: string;
  nuptk?: string;
  jabatan_id: number; // LINKED TO JABATAN
  jabatan?: string;   // Deprecating but keeping for backward compatibility
  mapel?: string;
  wali_kelas?: string;
  foto?: string;
  kontak?: string;
  email?: string;
  urutan: number;
  is_active: number;
}

export interface Prestasi {
  id: number;
  judul: string;
  tahun: string;
  gambar?: string;
  deskripsi: string;
  urutan: number;
  is_active: number;
}

export interface Galeri {
  id: number;
  judul: string;
  gambar: string; // URL or base64
  tipe: 'image' | 'youtube' | 'instagram';
  embed_id?: string;
  embed_url?: string;
  urutan: number;
  is_active: number;
}

export interface Artikel {
  id: number;
  judul: string;
  ringkasan: string;
  isi: string; // HTML content or rich text
  gambar?: string;
  embed_youtube?: string;
  embed_instagram?: string;
  tanggal: string;
  status: 'draft' | 'publish';
  created_at: string;
  updated_at?: string;
}

export interface Pengaturan {
  key: string;
  value: string;
  deskripsi: string;
}

export interface LogAktivitas {
  id: number;
  user_id: number | null;
  username: string; // resolved username for simplicity
  aksi: string;
  detail: string;
  ip_address: string;
  created_at: string;
}

export interface PendaftaranPPDB {
  id: string; // e.g. "PPDB-123456"
  nama: string;
  nik: string;
  nisn?: string;
  gender: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  nama_wali: string;
  kontak_wali: string;
  sekolah_asal: string;
  alamat: string;
  tanggal_daftar: string;
  status: 'proses' | 'disetujui' | 'ditolak';
}

