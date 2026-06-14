import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, ChevronRight, Calendar, FileText, CheckSquare, AlertCircle, CalendarDays, SearchCheck, Megaphone } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function Home() {
  const { settings } = useSettings();
  const isClosed = settings?.statusPendaftaran === 'Tutup';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white pt-16 pb-32">
        <div 
          className={`absolute inset-0 bg-cover bg-center ${settings?.gambarHeaderBeranda ? 'opacity-30' : 'opacity-5'}`}
          style={{ backgroundImage: `url('${settings?.gambarHeaderBeranda || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop'}')` }}
        ></div>
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-50/90 via-white/80 to-green-50/90 ${settings?.gambarHeaderBeranda ? '' : 'backdrop-blur-sm'}`}></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm mb-8 shadow-sm border ${isClosed ? 'bg-red-100 text-red-700 border-red-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}
            >
              <span className="relative flex h-3 w-3">
                {!isClosed && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isClosed ? 'bg-red-500' : 'bg-blue-500'}`}></span>
              </span>
              {isClosed ? `Pendaftaran SPMB ${new Date().getFullYear()} Telah Ditutup` : `Pendaftaran SPMB ${new Date().getFullYear()} Telah Dibuka`}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6"
            >
              Membangun Generasi <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-500">
                Cerdas & Berkarakter
              </span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed"
            >
              Bergabunglah bersama {settings?.namaSekolah || 'SDN 008 PKL KERINCI'}. Kami berkomitmen memberikan pendidikan dasar terbaik dengan fasilitas modern dan tenaga pendidik profesional.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {isClosed ? (
                <button
                  disabled
                  className="inline-flex justify-center items-center gap-2 bg-slate-400 text-white px-8 py-4 rounded-full text-lg font-semibold cursor-not-allowed shadow-sm"
                >
                  <AlertCircle size={20} /> Pendaftaran Ditutup
                </button>
              ) : (
                <Link
                  to="/daftar"
                  className="inline-flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                >
                  Daftar Sekarang <ChevronRight size={20} />
                </Link>
              )}
              <a
                href="#alur"
                className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm hover:shadow-md"
              >
                Lihat Alur SPMB
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Informasi Waktu Pendaftaran SPMB */}
      <section className="py-24 bg-slate-50 relative -mt-16 z-20 border-t border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Jadwal Pendaftaran SPMB 2026
            </h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Catat tanggal penting berikut dan persiapkan diri Anda untuk bergabung dengan {settings?.namaSekolah || 'SDN 008 Pkl Kerinci'}.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: <CalendarDays className="text-blue-500" size={32} />, 
                title: "Pendaftaran Online",
                prompt: "Periode Pendaftaran:", 
                dateRange: "15 - 18 Juni",
                year: "2026",
                color: "text-blue-600", 
                desc: "Pengisian formulir secara online dan unggah berkas pendaftaran calon peserta didik."
              },
              {
                icon: <SearchCheck className="text-green-500" size={32} />, 
                title: "Verifikasi & Validasi", 
                prompt: "Periode Verifikasi:",
                dateRange: "15 - 18 Juni",
                year: "2026",
                color: "text-green-600",
                desc: "Pemeriksaan dan validasi keabsahan dokumen pendaftar oleh tim panitia sekolah."
              },
              {
                icon: <Megaphone className="text-amber-500" size={32} />, 
                title: "Pengumuman & Daftar Ulang",
                prompt: "Pengumuman Hasil:",
                dateRange: "19 Juni",
                year: "2026",
                color: "text-amber-600",
                desc: "Pengumuman hasil seleksi pada tanggal 19 Juni. Dilanjutkan daftar ulang pada 19 - 20 Juni 2026." 
              }
            ].map((schedule, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200/60 hover:shadow-md hover:border-blue-100 transition-all duration-300 flex flex-col h-full group"
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {schedule.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-500 bg-slate-100 rounded-full px-3 py-1 border border-slate-200">
                    Tahap {idx + 1}
                  </span>
                </div>

                <div className="flex-grow space-y-2 mb-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    {schedule.prompt}
                  </p>
                  <div className={`text-3xl lg:text-4xl font-black ${schedule.color} tracking-tight`}>
                    {schedule.dateRange}
                  </div>
                  <div className="text-xl font-semibold text-slate-400 pt-1">{schedule.year}</div>
                </div>

                <div className="border-t border-slate-100 pt-6 mt-auto">
                  <h3 className="text-lg font-bold text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {schedule.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {schedule.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Alur PPDB */}
      <section id="alur" className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Alur Pendaftaran SPMB</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Ikuti langkah-langkah mudah berikut untuk mendaftarkan putra/putri Anda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -translate-y-1/2 z-0"></div>
            
            {[
              {
                step: "01",
                icon: <FileText size={28} />,
                title: "Isi Formulir",
                desc: "Lengkapi data diri calon siswa dan orang tua secara online."
              },
              {
                step: "02",
                icon: <BookOpen size={28} />,
                title: "Upload Berkas",
                desc: "Unggah dokumen persyaratan (Foto, KK, Akta Kelahiran)."
              },
              {
                step: "03",
                icon: <CheckSquare size={28} />,
                title: "Verifikasi",
                desc: "Panitia akan memverifikasi data dan dokumen yang diunggah."
              },
              {
                step: "04",
                icon: <Calendar size={28} />,
                title: "Pengumuman",
                desc: "Cek status kelulusan dan cetak bukti pendaftaran."
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="relative z-10 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 shadow-xl relative group hover:bg-blue-600 transition-colors duration-300">
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm border-4 border-slate-900">
                    {item.step}
                  </div>
                  <div className="text-slate-300 group-hover:text-white transition-colors">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            {isClosed ? (
              <button
                disabled
                className="inline-flex justify-center items-center gap-2 bg-slate-700 text-slate-400 px-8 py-4 rounded-full text-lg font-bold cursor-not-allowed shadow-lg"
              >
                <AlertCircle size={20} /> Pendaftaran Ditutup
              </button>
            ) : (
              <Link
                to="/daftar"
                className="inline-flex justify-center items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Mulai Pendaftaran <ChevronRight size={20} />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}