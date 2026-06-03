/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';

// Parse arguments
let inputFile = '';
let outputFile = '';

process.argv.forEach(val => {
  if (val.startsWith('--input=')) {
    inputFile = val.split('=')[1];
  } else if (val.startsWith('--output=')) {
    outputFile = val.split('=')[1];
  }
});

// Fallbacks
if (!inputFile) {
  inputFile = 'data_sekolah.csv';
}
if (!outputFile) {
  outputFile = 'import.json';
}

console.log(`🤖 Spreadsheet to JSON Converter starting...`);
console.log(`📂 Input File:  ${inputFile}`);
console.log(`💾 Output File: ${outputFile}`);

// Verify input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`❌ File input "${inputFile}" tidak ditemukan!`);
  console.log(`👉 Silakan buat file CSV baru dengan kolom: nama, nik, nuptk, jabatan, mapel, wali_kelas, foto, kontak, email, aktif`);
  process.exit(1);
}

// Custom quote-aware CSV cell parser
function parseCSV(text: string): string[][] {
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
        i++; // skip next quote
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
}

try {
  const rawCSV = fs.readFileSync(inputFile, 'utf8');
  const rows = parseCSV(rawCSV);

  if (rows.length < 2) {
    console.error(`❌ File CSV kosong atau hanya berisi baris header!`);
    process.exit(1);
  }

  const headers = rows[0].map(h => h.toLowerCase().replace(/[\s_/]/g, ''));
  const dataRows = rows.slice(1);

  console.log(`📊 Berhasil membaca ${dataRows.length} baris data awal.`);

  const listPendidik: any[] = [];

  for (const row of dataRows) {
    const item: any = {
      nama: "", nik: "", nuptk: "", jabatan: "Guru Mata Pelajaran", 
      mapel: "", wali_kelas: "", foto: "", kontak: "", email: "", aktif: true
    };

    // Auto map values based on headers
    headers.forEach((header, index) => {
      const val = row[index] || '';
      if (header.includes('nama')) item.nama = val;
      else if (header.includes('nik')) item.nik = val;
      else if (header.includes('nuptk')) item.nuptk = val;
      else if (header.includes('jabatan')) item.jabatan = val;
      else if (header.includes('mapel') || header.includes('matapelajaran')) item.mapel = val;
      else if (header.includes('walikelas')) item.wali_kelas = val;
      else if (header.includes('foto') || header.includes('gambar')) item.foto = val;
      else if (header.includes('kontak') || header.includes('telepon') || header.includes('whatsapp')) item.kontak = val;
      else if (header.includes('email')) item.email = val;
      else if (header.includes('aktif') || header.includes('status')) item.aktif = val.toLowerCase() !== 'false' && val !== '0';
    });

    if (item.nama) {
      listPendidik.push(item);
    }
  }

  // Generate template output format matching Section B
  const outputJson = {
    metadata: {
      export_date: new Date().toISOString(),
      version: "1.0",
      source: "SMP BINA BANGSA INDONESIA (CONVERTED FROM SPREADSHEET)"
    },
    sekolah: {
      nama: "SMP BINA BANGSA INDONESIA",
      npsn: "20227711",
      akreditasi: "B",
      status: "SWASTA"
    },
    jabatan: [
      { id: 1, nama: "Kepala Yayasan", tingkat: 1, parent_id: null, urutan: 1 },
      { id: 2, nama: "Kepala Sekolah", tingkat: 2, parent_id: 1, urutan: 2 },
      { id: 3, nama: "Wakil Kepala Sekolah", tingkat: 2, parent_id: 2, urutan: 3 },
      { id: 4, nama: "Guru Mata Pelajaran", tingkat: 3, parent_id: 2, urutan: 4 }
    ],
    tenaga_pendidik: listPendidik,
    fasilitas: [],
    ekskul: [],
    prestasi: [],
    galeri: {
      foto: [],
      video: []
    },
    sosial_media: {
      instagram: "",
      facebook: "",
      youtube: "",
      whatsapp_admin: "",
      maps_embed: ""
    },
    ppdb: {
      tahun_ajaran: "2025/2026",
      gelombang: "1",
      kuota: 120
    },
    artikel: []
  };

  fs.writeFileSync(outputFile, JSON.stringify(outputJson, null, 2), 'utf8');
  console.log(`✅ Sukses! Template JSON berisikan data awal berhasil ditulis ke: "${outputFile}"`);
  console.log(`👉 Silakan unggah file ini melalui menu 'Sistem & Keamanan -> Import/Export Data' di Panel Admin.`);

} catch (error: any) {
  console.error(`❌ Terjadi kegagalan selama konversi:`, error.message);
  process.exit(1);
}
