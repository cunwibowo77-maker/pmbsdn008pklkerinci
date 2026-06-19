/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Guide from './pages/Guide';
import RegistrationForm from './pages/RegistrationForm';
import AdminDashboard from './pages/AdminDashboard';
import CheckStatus from './pages/CheckStatus';
import AdminLogin from './pages/AdminLogin';

function RouteHandler() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Jika pengguna membuka halaman utama '/', langsung alihkan ke '/cek-kelulusan'
    if (location.pathname === '/') {
      navigate('/cek-kelulusan', { replace: true });
    }
    // 2. Mempertahankan logika asli Anda: Jika reload/akses awal bukan di halaman cek-kelulusan atau admin,
    //    maka arahkan ke halaman utama yang baru (/cek-kelulusan)
    else if (location.pathname !== '/cek-kelulusan' && !location.pathname.startsWith('/admin')) {
      navigate('/cek-kelulusan', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Hanya berjalan 1 kali saat aplikasi pertama kali dimuat

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <RouteHandler />
      <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/panduan" element={<Guide />} />
            <Route path="/daftar" element={<RegistrationForm />} />
            <Route path="/cek-kelulusan" element={<CheckStatus />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
