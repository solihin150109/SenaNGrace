import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Award, Percent, Truck, PhoneCall } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Kemitraan() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col selection:bg-[#B39274] selection:text-white">
      {/* HEADER NAVBAR */}
      <header className="border-b border-[#EAE6DF] bg-[#FAF9F6]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate(currentUser ? "/catalog" : "/")}>
            <div className="p-2 bg-[#1E1916] text-[#FAF9F6] rounded-lg">
              <ArrowLeft size={16} />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl tracking-[0.15em] uppercase text-[#1E1916] font-semibold">
                senna &amp; grace
              </span>
              <span className="text-[9px] tracking-[0.3em] uppercase text-[#B39274] -mt-1 pl-0.5">
                partnership program
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-xs uppercase tracking-widest text-[#7C634F]">
            <span className="font-semibold text-[#1E1916]">Sistem Komisi Mewah</span>
          </div>

          {currentUser ? (
            <button
              onClick={() => navigate("/catalog")}
              className="bg-[#1E1916] hover:bg-[#B39274] text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase px-4 sm:px-6 py-2.5 rounded-none font-medium transition-all"
            >
              Katalog Reseller
            </button>
          ) : (
            <button
              onClick={() => navigate("/register")}
              className="bg-[#1E1916] hover:bg-[#B39274] text-white text-[10px] sm:text-xs tracking-[0.15em] uppercase px-4 sm:px-6 py-2.5 rounded-none font-medium transition-all"
            >
              Daftar Sekarang
            </button>
          )}
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO BANNER */}
        <section className="bg-gradient-to-b from-white to-[#FAF9F6] border-b border-[#EAE6DF] py-16 sm:py-24 text-center px-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#B39274] font-bold bg-[#FAF9F6] px-3 py-1 rounded-full border border-[#B39274]/30">
              GROW YOUR LUXURY BOUTIQUE
            </span>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl text-[#1E1916] font-bold leading-tight">
              Kemitraan Reseller Eksklusif <br />
              <span className="italic font-normal text-[#B39274]">Senna &amp; Grace</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#7C634F] max-w-2xl mx-auto font-normal leading-relaxed">
              Bergabunglah dengan ekosistem dropship tas branded mewah terbesar di Indonesia. Dapatkan margin keuntungan fantastis, sinkronisasi stok otomatis, dan jaminan 100% original.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              {currentUser ? (
                <button
                  onClick={() => navigate("/catalog")}
                  className="bg-[#1E1916] text-white text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-[#B39274] transition-all"
                >
                  Masuk Ke Katalog Produk
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/register")}
                    className="bg-[#1E1916] text-white text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-[#B39274] transition-all"
                  >
                    Gabung Kemitraan
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="border border-[#1E1916] text-[#1E1916] text-xs tracking-widest uppercase px-8 py-3.5 hover:bg-[#1E1916] hover:text-white transition-all"
                  >
                    Login Reseller
                  </button>
                </>
              )}
            </div>
          </div>
        </section>

        {/* CORE PILLARS OF PARTNERSHIP */}
        <section className="max-w-7xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <span className="text-xs tracking-[0.3em] uppercase text-[#B39274] font-semibold block">Exclusive Ecosystem</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1E1916]">
              Infrastruktur Terbaik untuk Dropshipper
            </h2>
            <div className="w-12 h-0.5 bg-[#B39274] mx-auto my-3"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-[#EAE6DF] flex flex-col space-y-4">
              <div className="bg-[#B39274]/10 text-[#B39274] w-12 h-12 rounded-xl flex items-center justify-center">
                <Percent size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-[#1E1916]">Harga Reseller Terbaik</h3>
              <p className="text-xs text-[#7C634F] leading-relaxed font-normal">
                Dapatkan diskon eksklusif langsung hingga puluhan juta rupiah dari harga retail pasar, memungkinkan margin keuntungan maksimal untuk toko online Anda.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EAE6DF] flex flex-col space-y-4">
              <div className="bg-[#B39274]/10 text-[#B39274] w-12 h-12 rounded-xl flex items-center justify-center">
                <Truck size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-[#1E1916]">Sistem Dropship Tanpa Logo</h3>
              <p className="text-xs text-[#7C634F] leading-relaxed font-normal">
                Kami mengirimkan produk langsung ke alamat pembeli Anda menggunakan nama toko Anda sebagai pengirim, tanpa melampirkan harga beli asal atau logo kami.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-[#EAE6DF] flex flex-col space-y-4">
              <div className="bg-[#B39274]/10 text-[#B39274] w-12 h-12 rounded-xl flex items-center justify-center">
                <Award size={20} className="stroke-[2.5]" />
              </div>
              <h3 className="text-lg font-bold text-[#1E1916]">Sertifikat Keaslian Ganda</h3>
              <p className="text-xs text-[#7C634F] leading-relaxed font-normal">
                Setiap tas dibungkus rapi dengan premium dust bag, box eksklusif, serta kartu garansi verifikasi keaslian fisik demi menjaga reputasi bisnis Anda.
              </p>
            </div>
          </div>
        </section>

        {/* CALL TO ACTION ACCELERATOR */}
        <section className="bg-[#1E1916] text-white py-16 px-6 text-center border-t border-[#342D29]">
          <div className="max-w-2xl mx-auto space-y-6">
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#B39274] font-bold">EXCELLENCE IN DESIGN & WORKFLOW</span>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">Siap Memulai Bisnis Butik Mewah Anda?</h2>
            <p className="text-xs sm:text-sm text-[#B3A69C] leading-relaxed font-light">
              Pendaftaran hanya memakan waktu 2 menit. Daftarkan akun reseller Anda sekarang, kurasi brand favorit pelanggan Anda, dan mulai hasilkan omset puluhan juta setiap bulan bersama Senna & Grace.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={() => navigate(currentUser ? "/catalog" : "/register")}
                className="bg-[#B39274] hover:bg-white hover:text-[#1E1916] text-[#1E1916] font-bold text-xs tracking-widest uppercase px-8 py-4 transition-all w-full sm:w-auto"
              >
                {currentUser ? "Kembali Ke Katalog Produk" : "Gabung Reseller Sekarang"}
              </button>
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="border border-[#B3A69C] hover:border-white text-white text-xs tracking-widest uppercase px-8 py-4 transition-all w-full sm:w-auto inline-flex items-center justify-center gap-2"
              >
                <PhoneCall size={14} /> Hubungi Konselor Kami
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#1E1916] text-[#EFECE6] py-12 px-6 border-t border-[#342D29]">
        <div className="max-w-7xl mx-auto text-center text-xs text-[#8A7C72] font-light space-y-2">
          <p>&copy; {new Date().getFullYear()} Senna &amp; Grace. Hak Cipta Dilindungi.</p>
          <p className="text-[10px] text-[#5C5046]">Exclusive Luxury Handbag Logistics Ecosystem</p>
        </div>
      </footer>
    </div>
  );
}
