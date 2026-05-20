/**
 * Google Apps Script Backend for PPDB SD
 * Deploy as a Web App:
 * 1. Click "Deploy" -> "New deployment"
 * 2. Select type: "Web app"
 * 3. Execute as: "Me"
 * 4. Who has access: "Anyone"
 * 5. Click "Deploy" and copy the Web App URL.
 */

const SHEET_NAME = "Data Pendaftar";
const ADMIN_SHEET_NAME = "Admin";
const SETTINGS_SHEET_NAME = "Pengaturan";
const FOLDER_NAME = "PPDB SD";

const DEFAULT_FORM_FIELDS = [
  { id: "Nama Lengkap", label: "Nama Lengkap", type: "text", required: true },
  { id: "NIK", label: "NIK", type: "text", required: true },
  { id: "Tempat Lahir", label: "Tempat Lahir", type: "text", required: true },
  { id: "Tanggal Lahir", label: "Tanggal Lahir", type: "date", required: true },
  { id: "Jenis Kelamin", label: "Jenis Kelamin", type: "select", options: ["Laki-laki", "Perempuan"], required: true },
  { id: "Alamat", label: "Alamat Lengkap", type: "textarea", required: true },
  { id: "Nama Orang Tua", label: "Nama Orang Tua/Wali", type: "text", required: true },
  { id: "No HP", label: "No. WhatsApp Aktif", type: "text", required: true },
  { id: "Foto Siswa", label: "Pas Foto 3x4", type: "file", required: true },
  { id: "Kartu Keluarga", label: "Kartu Keluarga", type: "file", required: true },
  { id: "Akta Kelahiran", label: "Akta Kelahiran", type: "file", required: true }
];

const DEFAULT_SETTINGS = {
  namaSekolah: "SDN Harapan Bangsa",
  alamat: "Jl. Pendidikan No. 123, Kota Pelajar, Indonesia 12345",
  telepon: "(021) 1234-5678",
  email: "info@sdnharapanbangsa.sch.id",
  deskripsi: "Mencetak generasi penerus bangsa yang cerdas, berakhlak mulia, dan siap menghadapi tantangan masa depan dengan pendidikan berkualitas.",
  statusPendaftaran: "Buka",
  formFields: JSON.stringify(DEFAULT_FORM_FIELDS)
};

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Setup Data Pendaftar Sheet
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = ["Timestamp", "No Pendaftaran", "Status"];
    DEFAULT_FORM_FIELDS.forEach(f => headers.push(f.id));
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#e0e0e0");
    sheet.setFrozenRows(1);
  }

  // Setup Admin Sheet
  let adminSheet = ss.getSheetByName(ADMIN_SHEET_NAME);
  if (!adminSheet) {
    adminSheet = ss.insertSheet(ADMIN_SHEET_NAME);
    adminSheet.appendRow(["Username", "Password"]);
    adminSheet.appendRow(["admin", "admin123"]); // Default credentials
    adminSheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#e0e0e0");
  }

  // Setup Settings Sheet
  let settingsSheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!settingsSheet) {
    settingsSheet = ss.insertSheet(SETTINGS_SHEET_NAME);
    settingsSheet.appendRow(["Key", "Value"]);
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
      settingsSheet.appendRow([key, DEFAULT_SETTINGS[key]]);
    });
    settingsSheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#e0e0e0");
  }

  // Setup Drive Folder
  const folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (!folders.hasNext()) {
    DriveApp.createFolder(FOLDER_NAME);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Antrekan proses selama maksimal 30 detik agar nomor pendaftaran tidak bentrok ganda
    lock.waitLock(30000); 

    const data = JSON.parse(e.postData.contents);
    
    if (data.action === "login") return handleLogin(data.username, data.password);
    if (data.action === "checkStatus") return handleCheckStatus(data.noPendaftaran);
    if (data.action === "updateStatus") return updateStatus(data.noPendaftaran, data.newStatus, data.alasan);
    if (data.action === "updateSettings") return handleUpdateSettings(data.settings);
    
    // Jalur Aman Admin
    if (data.action === "getRegistrations") {
      return handleGetRegistrationsSecure(data.username, data.password);
    }
    
    // Menjalankan fungsi pendaftaran bawaan secara aman
    return handleRegistration(data);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    // Kunci wajib dilepas dalam kondisi apa pun
    lock.releaseLock();
  }
}

function doGet(e) {
  try {
    if (e.parameter.action === "getSettings") {
      return handleGetSettings();
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Akses ditolak. Silakan gunakan dashboard admin resmi."
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function handleGetRegistrationsSecure(username, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const adminSheet = ss.getSheetByName(ADMIN_SHEET_NAME);
  if (!adminSheet) throw new Error("Sheet Admin tidak ditemukan");
  
  const adminData = adminSheet.getDataRange().getValues();
  let isAdminValid = false;
  
  for (let i = 1; i < adminData.length; i++) {
    if (adminData[i][0] === username && adminData[i][1] === password) {
      isAdminValid = true;
      break;
    }
  }
  
  if (!isAdminValid) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: "Kredensial admin salah. Akses data ditolak!" 
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Sheet Pendaftar tidak ditemukan");
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      if (row[index] instanceof Date) {
         obj[header] = row[index].toISOString();
      } else {
         obj[header] = row[index];
      }
    });
    return obj;
  });
  
  result.sort((a, b) => new Date(b.Timestamp) - new Date(a.Timestamp));
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: result
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleGetSettings() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      data: DEFAULT_SETTINGS
    })).setMimeType(ContentService.MimeType.JSON);
  }

  const data = sheet.getDataRange().getValues();
  const settings = {};
  for (let i = 1; i < data.length; i++) {
    settings[data[i][0]] = data[i][1];
  }

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    data: settings
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleUpdateSettings(newSettings) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  if (!sheet) throw new Error("Settings sheet not found");

  const data = sheet.getDataRange().getValues();
  
  Object.keys(newSettings).forEach(key => {
    let found = false;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        sheet.getRange(i + 1, 2).setValue(
          typeof newSettings[key] === 'object' ? JSON.stringify(newSettings[key]) : newSettings[key]
        );
        found = true;
        break;
      }
    }
    if (!found) {
      sheet.appendRow([key, typeof newSettings[key] === 'object' ? JSON.stringify(newSettings[key]) : newSettings[key]]);
    }
  });

  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Pengaturan berhasil disimpan"
  })).setMimeType(ContentService.MimeType.JSON);
}

// PERBAIKAN TOTAL FUNGSI PENDAFTARAN: Pengecekan NIK Duplikat Aktif Semestinya
function handleRegistration(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  
  // 1. Cek Apakah Status Pendaftaran Buka/Tutup
  const settingsSheet = ss.getSheetByName(SETTINGS_SHEET_NAME);
  let isOpen = true;
  if (settingsSheet) {
    const settingsData = settingsSheet.getDataRange().getValues();
    for (let i = 1; i < settingsData.length; i++) {
      if (settingsData[i][0] === "statusPendaftaran" && settingsData[i][1] === "Tutup") {
        isOpen = false;
        break;
      }
    }
  }

  if (!isOpen) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: "Pendaftaran sedang ditutup."
    })).setMimeType(ContentService.MimeType.JSON);
  }

  let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const existingRows = sheet.getDataRange().getValues();

  // 2. PROTEKSI UTAMA: Cek jika NIK sudah ada di Google Sheets sebelum mengunggah file
  const nikIdx = headers.indexOf("NIK");
  const inputNik = data["NIK"] || data["NIK *"]; // Menangani variasi pengiriman label NIK
  
  if (nikIdx !== -1 && inputNik) {
    for (let i = 1; i < existingRows.length; i++) {
      if (String(existingRows[i][nikIdx]).trim() === String(inputNik).trim()) {
        return ContentService.createTextOutput(JSON.stringify({
          status: "error",
          message: "Gagal! Calon siswa dengan NIK tersebut sudah terdaftar sebelumnya."
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  // 3. Logika Membuat Nomor Pendaftaran Otomatis
  const year = new Date().getFullYear();
  const lastRow = sheet.getLastRow();
  let nextId = 1;
  if (lastRow > 1) {
    const noRegIdx = headers.indexOf("No Pendaftaran");
    if (noRegIdx !== -1) {
      const lastNo = sheet.getRange(lastRow, noRegIdx + 1).getValue();
      const parts = String(lastNo).split("-");
      if (parts.length === 3) {
        nextId = parseInt(parts[2], 10) + 1;
      }
    }
  }
  const noPendaftaran = `SPMB-${year}-${String(nextId).padStart(3, '0')}`;
  
  const folder = getOrCreateFolder(FOLDER_NAME);
  const rowData = new Array(headers.length).fill("");
  
  // 4. Memproses Header Isian & Unggah File ke Drive Pribadi
  headers.forEach((header, index) => {
    if (header === "Timestamp") rowData[index] = new Date();
    else if (header === "No Pendaftaran") rowData[index] = noPendaftaran;
    else if (header === "Status") rowData[index] = "Proses";
    else if (data[header] !== undefined) {
      let value = data[header];
      if (typeof value === 'string' && value.startsWith('data:')) {
        value = uploadFile(value, `${noPendaftaran}_${header}`, folder);
      }
      rowData[index] = value;
    }
  });

  // Menangani penambahan kolom dinamis baru jika terdeteksi di form luar
  Object.keys(data).forEach(key => {
    if (key !== "action" && !headers.includes(key)) {
      headers.push(key);
      sheet.getRange(1, headers.length).setValue(key);
      
      let value = data[key];
      if (typeof value === 'string' && value.startsWith('data:')) {
        value = uploadFile(value, `${noPendaftaran}_${key}`, folder);
      }
      rowData.push(value);
    }
  });
  
  // 5. Tulis Baris Baru ke Lembar Excel (Data aman, tidak akan duplikat)
  sheet.appendRow(rowData);
  
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: "Pendaftaran berhasil",
    noPendaftaran: noPendaftaran
  })).setMimeType(ContentService.MimeType.JSON);
}

function handleLogin(username, password) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(ADMIN_SHEET_NAME);
  if (!sheet) throw new Error("Sheet Admin tidak ditemukan");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === username && data[i][1] === password) {
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Login berhasil" })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Username atau password salah" })).setMimeType(ContentService.MimeType.JSON);
}

function handleCheckStatus(noPendaftaran) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error("Database belum siap");
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const noRegIdx = headers.indexOf("No Pendaftaran");
  const namaIdx = headers.indexOf("Nama Lengkap");
  const statusIdx = headers.indexOf("Status");
  const alasanIdx = headers.indexOf("Alasan Penolakan") !== -1 ? headers.indexOf("Alasan Penolakan") : headers.indexOf("Alasan");

  for (let i = 1; i < data.length; i++) {
    if (data[i][noRegIdx] === noPendaftaran) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: {
          noPendaftaran: data[i][noRegIdx],
          namaLengkap: namaIdx !== -1 ? data[i][namaIdx] : "Siswa",
          status: statusIdx !== -1 ? data[i][statusIdx] : "Proses",
          alasanPenolakan: alasanIdx !== -1 ? data[i][alasanIdx] : ""
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Nomor pendaftaran tidak ditemukan" })).setMimeType(ContentService.MimeType.JSON);
}

function updateStatus(noPendaftaran, newStatus, alasan) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const noRegIdx = headers.indexOf("No Pendaftaran");
  const statusIdx = headers.indexOf("Status");
  const alasanIdx = headers.indexOf("Alasan Penolakan") !== -1 ? headers.indexOf("Alasan Penolakan") : headers.indexOf("Alasan");
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][noRegIdx] === noPendaftaran) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(newStatus);
      if (alasanIdx !== -1 && alasan !== undefined) {
        sheet.getRange(i + 1, alasanIdx + 1).setValue(alasan);
      }
      return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Status berhasil diupdate" })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Data tidak ditemukan" })).setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateFolder(folderName) {
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function uploadFile(base64Data, filename, folder) {
  if (!base64Data) return "";
  try {
    const splitBase = base64Data.split(',');
    const type = splitBase[0].split(';')[0].replace('data:', '');
    const byteCharacters = Utilities.base64Decode(splitBase[1]);
    const blob = Utilities.newBlob(byteCharacters, type, filename);
    const file = folder.createFile(blob);
    // Dibiarkan tanpa hak akses setSharing publik demi kompatibilitas akun manapun & proteksi data anak
    return file.getUrl();
  } catch (e) {
    return "Error uploading file";
  }
}

function doOptions(e) {
  return ContentService.createTextOutput("").setMimeType(ContentService.MimeType.TEXT).setHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400"
  });
}