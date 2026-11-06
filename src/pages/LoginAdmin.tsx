import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { Lock, Mail, ShieldAlert, ArrowLeft, BarChart2, Package2, ClipboardList } from "lucide-react";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const { loginAdmin } = useApp();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAutofill = () => {
    setEmail("admin@senna.com");
    setPassword("admin");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Silakan masukkan email dan sandi administrasi.");
      return;
    }

    setLoading(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      setLoading(false);
      if (res.success) {
        navigate("/admin-dashboard");
      } else {
        setError(res.error || "Akses ditolak. Email atau sandi salah.");
      }
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || "Terjadi kesalahan saat otentikasi admin.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] grid lg:grid-cols-12 selection:bg-[#B39274] selection:text-white">
      {/* LEFT COLUMN: MANAGEMENT INTRODUCTION CARD */}
      <div className="hidden lg:flex lg:col-span-5 bg-[#12100E] text-white p-12 flex-col justify-between relative">
        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#B3A69C] hover:text-[#B39274] transition-colors duration-200"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </button>
        </div>

        {/* Dashboard visual indicators list */}
        <div className="space-y-10 z-10 my-auto">
          <div className="space-y-2">
            <span className="text-xs tracking-[0.25em] uppercase text-[#B39274] font-bold block">
              Back-office operations
            </span>
            <h2 className="text-3xl xl:text-4xl leading-tight font-bold tracking-tight">
              Management Portal
            </h2>
            <p className="text-xs text-[#B3A69C] font-normal leading-relaxed max-w-sm">
              Satu portal pusat untuk menyelaraskan pasokan barang, menyetujui kemitraan, mengonfirmasi pembayaran reseller, dan mencetak nomor resi.
            </p>
          </div>

          {/* Core admin features list */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-[#231E1A] text-[#B39274] p-3 rounded-xl border border-[#3E342D]">
                <Package2 size={18} />
              </div>
              <div>
                <h4 className="text-xs tracking-wider uppercase font-bold text-white">Manajemen Stok &amp; Produk</h4>
                <p className="text-[11px] text-[#B3A69C] font-light mt-0.5">Tambah koleksi tas baru, edit harga reseller, dan monitor sisa stok gudang (Min. 10 unit).</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#231E1A] text-[#B39274] p-3 rounded-xl border border-[#3E342D]">
                <ClipboardList size={18} />
              </div>
              <div>
                <h4 className="text-xs tracking-wider uppercase font-bold text-white">Alur Pembayaran &amp; Resi</h4>
                <p className="text-[11px] text-[#B3A69C] font-light mt-0.5">Verifikasi pembayaran pesanan reseller dan berikan update status pengantaran dropship.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-[#231E1A] text-[#B39274] p-3 rounded-xl border border-[#3E342D]">
                <BarChart2 size={18} />
              </div>
              <div>
                <h4 className="text-xs tracking-wider uppercase font-bold text-white">Analitik Koleksi Brand</h4>
                <p className="text-[11px] text-[#B3A69C] font-light mt-0.5">Kategorikan tas berdasarkan brand premium: Louis Vuitton, Charles &amp; Keith, dan Gucci.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#2C2520] pt-6 flex justify-between items-center text-[10px] text-[#8A7C72]">
          <span>&copy; Senna &amp; Grace Backoffice v1.4</span>
          <span>Secured Server Ingress</span>
        </div>
      </div>

      {/* RIGHT COLUMN: SECURE ADMIN FORM */}
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center items-center px-6 py-12 sm:px-12 md:px-20">
        
        {/* Mobile Head */}
        <div className="lg:hidden mb-8 text-center cursor-pointer" onClick={() => navigate("/")}>
          <h1 className="font-brand text-2xl tracking-[0.2em] uppercase text-[#1E1916] font-bold">
            senna &amp; grace
          </h1>
          <p className="text-[9px] tracking-[0.35em] uppercase text-[#B39274]">
            back-office administrator
          </p>
        </div>

        <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-[#EAE6DF] shadow-sm">
          {/* Badge Access */}
          <div className="space-y-3.5">
            <div className="inline-flex items-center gap-1.5 bg-[#FAF9F6] text-[#B39274] border border-[#B39274]/30 text-[10px] tracking-widest uppercase px-3 py-1 font-bold rounded-full">
              <ShieldAlert size={12} />
              <span>Secure Admin Access</span>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-[#1E1916]">Selamat Datang Kembali</h3>
              <p className="text-xs text-[#7C634F] font-normal">
                Autentikasi akun administrator Anda untuk masuk ke dashboard utama.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-[#FAF9F6] text-[#1E1916] p-4 rounded-xl border border-[#B39274]/40 text-xs flex items-center gap-3">
              <ShieldAlert size={16} className="shrink-0 text-[#B39274]" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] tracking-wider uppercase text-[#7C634F] font-semibold block">
                Email Administrator
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B39274]">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sennagrace.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#B39274] focus:border-[#B39274] transition-all rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] tracking-wider uppercase text-[#7C634F] font-semibold block">
                Security Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B39274]">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#B39274] focus:border-[#B39274] transition-all rounded-lg"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1E1916] text-white text-xs tracking-[0.15em] uppercase hover:bg-[#B39274] disabled:bg-neutral-400 font-bold transition-all duration-300 rounded-lg flex items-center justify-center gap-2"
              id="btn-login-admin-submit"
            >
              {loading ? "Menautkan Kunci Ingress..." : "Masuk ke Dashboard"}
            </button>
          </form>

          {/* Quick Demo Autofill helper */}
          <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-4 rounded-xl text-center space-y-1.5">
            <p className="text-[10px] text-[#7C634F]">Gunakan Akun Kredensial Admin Demo</p>
            <button
              type="button"
              onClick={handleAutofill}
              className="text-[10px] tracking-wider uppercase text-[#B39274] hover:text-[#1E1916] font-bold underline transition-colors"
            >
              Autofill Akun Admin Demo
            </button>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate("/")}
              className="text-xs text-[#7C634F] font-semibold hover:text-[#B39274] hover:underline"
            >
              Kembali ke Halaman Publik
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
