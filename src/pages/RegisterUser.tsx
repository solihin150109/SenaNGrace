import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Lock, Mail, User as UserIcon, ArrowLeft, AlertCircle } from "lucide-react";
import { motion } from "motion/react";

export default function RegisterUser() {
  const navigate = useNavigate();
  const { registerUser } = useApp();

  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!nama || !email || !password || !confirmPassword) {
      setError("Silakan isi semua kolom formulir.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok dengan password.");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus terdiri dari 6 karakter.");
      return;
    }

    setLoading(true);
    try {
      const res = await registerUser(nama.trim(), email.trim(), password);
      setLoading(false);
      if (res.success) {
        navigate("/catalog");
      } else {
        setError(res.error || "Gagal melakukan pendaftaran.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Terjadi kesalahan saat mendaftar.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] grid lg:grid-cols-12 selection:bg-[#B39274] selection:text-white">
      {/* LEFT COLUMN: BRANDING & HERO IMAGE (Hidden on mobile) */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#1E1916] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80"
          alt="Luxury Leather Bag close-up"
          className="absolute inset-0 w-full h-full object-cover opacity-75 mix-blend-overlay"
          referrerPolicy="no-referrer"
        />

        <div className="z-20">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#EFECE6] hover:text-[#B39274] transition-colors duration-200"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        <div className="z-20 space-y-4">
          <span className="text-[10px] tracking-[0.3em] uppercase text-[#B39274] font-semibold block">
            Join the Network
          </span>
          <h2 className="text-3xl xl:text-4xl leading-tight font-bold tracking-tight">
            Bangun Bisnis Butik Anda Secara Efisien.
          </h2>
          <p className="text-xs text-[#E5E2D9] font-normal leading-relaxed max-w-sm">
            Daftarkan diri Anda untuk langsung terhubung dengan distributor tas mewah terpercaya. Nikmati akses katalog, stok terkelola, payment gateway Duitku, dan fitur dropship (Bisa pesan mulai 1 unit).
          </p>
        </div>

        <div className="z-20 border-t border-[#342D29] pt-6 flex justify-between items-center">
          <span className="font-brand text-lg tracking-[0.2em] uppercase text-[#FAF9F6] font-bold">
            senna &amp; grace
          </span>
          <span className="text-[10px] text-[#8A7C72]">Exclusive Partner Portal</span>
        </div>
      </div>

      {/* RIGHT COLUMN: REGISTRATION FORM */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-12 md:px-20">
        {/* Mobile Logo */}
        <div className="lg:hidden mb-8 text-center cursor-pointer" onClick={() => navigate("/")}>
          <h1 className="font-brand text-2xl tracking-[0.2em] uppercase text-[#1E1916] font-bold">
            senna &amp; grace
          </h1>
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#B39274]">
            branded boutique reseller
          </p>
        </div>

        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#EAE6DF] shadow-sm">
          <div className="space-y-2">
            <span className="text-xs tracking-widest uppercase text-[#B39274] font-semibold">Partnership Application</span>
            <h3 className="text-2xl font-bold tracking-tight text-[#1E1916]">Daftar Reseller</h3>
            <p className="text-xs text-[#7C634F] font-normal">
              Lengkapi formulir di bawah untuk membuka akun kemitraan Anda.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 text-xs flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-semibold block">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B39274]">
                  <UserIcon size={16} />
                </div>
                <input
                  type="text"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Grace Olivia"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#B39274] focus:border-[#B39274] transition-all rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-semibold block">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B39274]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="grace@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#B39274] focus:border-[#B39274] transition-all rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-semibold block">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B39274]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 Karakter"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#B39274] focus:border-[#B39274] transition-all rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-semibold block">
                Konfirmasi Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B39274]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Masukkan Kembali Password"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#B39274] focus:border-[#B39274] transition-all rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E1916] text-white text-xs tracking-[0.15em] uppercase py-3 hover:bg-[#B39274] disabled:bg-neutral-400 font-medium transition-all duration-300 rounded-lg flex items-center justify-center gap-2"
                id="btn-register-submit"
              >
                {loading ? "Mendaftarkan Akun..." : "Daftar Sekarang"}
              </button>
            </div>
          </form>

          <div className="text-center pt-2">
            <p className="text-xs text-[#7C634F]">
              Sudah memiliki akun kemitraan?{" "}
              <Link to="/login" className="text-[#B39274] font-semibold hover:underline" id="link-login">
                Masuk Di Sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
