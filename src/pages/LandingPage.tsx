import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { ArrowRight, ShoppingBag, Award, ShieldCheck, Heart, Menu, X, Check, Users } from "lucide-react";
import { motion } from "motion/react";

export default function LandingPage() {
  const navigate = useNavigate();
  const { currentUser, brands } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Curated imagery placeholders for luxury brand display cards
  const BRAND_COVER_IMAGES: { [key: string]: string } = {
    "Louis Vuitton": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    "Charles & Keith": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80",
    "Gucci": "/assets/aistudio/images_e9ad665f.jpeg",
    "Chanel": "https://images.unsplash.com/photo-1511405946472-a37e3b5ccd47?auto=format&fit=crop&w=800&q=80",
    "Hermes": "https://images.unsplash.com/photo-1524498250077-390f9e378db0?auto=format&fit=crop&w=800&q=80",
    "Prada": "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=800&q=80",
    "Dior": "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=800&q=80",
    "Coach": "https://images.unsplash.com/photo-1566150905458-1bf1fc15a4a5?auto=format&fit=crop&w=800&q=80",
    "Saint Laurent": "https://images.unsplash.com/photo-1598532187856-3c2243d5f0cc?auto=format&fit=crop&w=800&q=80",
    "Bottega Veneta": "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=800&q=80"
  };

  const DEFAULT_BRAND_IMAGE = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80";

  // Auto redirect if already logged in so they don't need to join or login again
  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate("/catalog", { replace: true });
      }
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col selection:bg-[#B39274] selection:text-white">
      {/* HEADER */}
      <header className="border-b border-[#EAE6DF] bg-[#FAF9F6]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex flex-col cursor-pointer" onClick={() => navigate("/")}>
            <span className="font-brand text-xl sm:text-2xl tracking-[0.2em] uppercase text-[#1E1916] font-semibold">
              senna &amp; grace
            </span>
            <span className="text-[9px] tracking-[0.35em] uppercase text-[#B39274] -mt-1 pl-0.5">
              branded boutique reseller
            </span>
          </div>

          {/* Navigation Menu (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-10 text-xs tracking-[0.2em] uppercase text-[#7C634F]">
            <a href="#about" className="hover:text-[#1E1916] transition-colors duration-200">Tentang Kami</a>
            <a href="#brands" className="hover:text-[#1E1916] transition-colors duration-200">Koleksi Brand</a>
            <span onClick={() => navigate("/kemitraan")} className="hover:text-[#1E1916] transition-colors duration-200 cursor-pointer font-semibold text-[#B39274]">Kemitraan</span>
          </nav>

          {/* Auth Actions (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <button
                onClick={() => navigate("/catalog")}
                className="bg-[#1E1916] text-white text-xs tracking-[0.15em] uppercase px-6 py-2.5 hover:bg-[#B39274] transition-all duration-300 font-bold"
                id="btn-dashboard-header"
              >
                Kembali Ke Katalog
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/login")}
                  className="text-xs tracking-[0.15em] uppercase text-[#1E1916] hover:text-[#B39274] transition-colors duration-200 font-medium px-4 py-2"
                  id="btn-login-header"
                >
                  Masuk
                </button>
                <button
                  onClick={() => navigate("/register")}
                  className="bg-[#1E1916] text-white text-xs tracking-[0.15em] uppercase px-5 py-2.5 rounded-none hover:bg-[#B39274] transition-all duration-300 font-medium"
                  id="btn-register-header"
                >
                  Daftar Reseller
                </button>
              </>
            )}
          </div>

          {/* Mobile hamburger menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-[#1E1916] hover:text-[#B39274] transition-colors"
            id="mobile-landing-menu-trigger"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Slidedown panel */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#EAE6DF] bg-white px-6 py-6 space-y-4 animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col space-y-3.5 text-xs tracking-widest uppercase text-[#7C634F] font-medium">
              <a
                href="#about"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#1E1916] py-2 border-b border-gray-50"
              >
                Tentang Kami
              </a>
              <a
                href="#brands"
                onClick={() => setMobileMenuOpen(false)}
                className="hover:text-[#1E1916] py-2 border-b border-gray-50"
              >
                Koleksi Brand
              </a>
              <span
                onClick={() => {
                  navigate("/kemitraan");
                  setMobileMenuOpen(false);
                }}
                className="hover:text-[#1E1916] py-2 border-b border-gray-50 cursor-pointer font-bold text-[#B39274]"
              >
                Program Kemitraan ✨
              </span>
            </nav>
            <div className="pt-4 flex flex-col gap-3">
              {currentUser ? (
                <button
                  onClick={() => {
                    navigate("/catalog");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 text-xs tracking-widest uppercase font-bold bg-[#1E1916] text-white hover:bg-[#B39274]"
                >
                  Kembali Ke Katalog
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 text-xs tracking-widest uppercase font-bold border border-[#1E1916] text-[#1E1916] hover:bg-gray-50"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center py-3 text-xs tracking-widest uppercase font-bold bg-[#1E1916] text-white hover:bg-[#B39274]"
                  >
                    Daftar Reseller
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <main className="flex-grow">
        <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 lg:py-24 grid md:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="md:col-span-6 space-y-8">
            <div className="space-y-4">
              <span className="text-xs tracking-[0.3em] uppercase text-[#B39274] font-semibold block">
                Exclusive Curator For Premium Resellers
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl text-[#1E1916] leading-[1.1] font-bold tracking-tight">
                Satu Portal untuk Seluruh Bisnis <span className="italic font-normal text-[#B39274]">Tas Branded</span> Anda.
              </h1>
              <p className="text-sm text-[#7C634F] leading-relaxed max-w-xl font-normal">
                Selamat tinggal proses manual WhatsApp yang melelahkan. Senna &amp; Grace mendigitalkan katalog, pemesanan fleksibel (Bisa pesan mulai 1 unit), integrasi gateway pembayaran Duitku real-time, hingga pengiriman resi otomatis untuk reseller eksklusif kami.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                onClick={() => navigate(currentUser ? "/catalog" : "/login")}
                className="bg-[#1E1916] text-white text-xs tracking-[0.15em] uppercase px-8 py-4 flex items-center justify-center gap-3 hover:bg-[#B39274] transition-all duration-300 group"
                id="btn-hero-shop"
              >
                <span>{currentUser ? "Lihat Dashboard" : "Belanja Sekarang"}</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate(currentUser ? "/catalog" : "/login")}
                className="border border-[#1E1916] text-[#1E1916] text-xs tracking-[0.15em] uppercase px-8 py-4 flex items-center justify-center gap-3 hover:bg-[#1E1916] hover:text-white transition-all duration-300"
                id="btn-hero-catalog"
              >
                <span>{currentUser ? "Lihat Katalog" : "Katalog Produk"}</span>
              </button>
            </div>

            {/* Quick trust highlights */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[#EAE6DF]">
              <div>
                <span className="block text-2xl text-[#1E1916] font-bold font-mono">100%</span>
                <span className="text-[10px] tracking-wider uppercase text-[#7C634F] font-medium">Original Authentic</span>
              </div>
              <div>
                <span className="block text-2xl text-[#1E1916] font-bold font-mono">24h</span>
                <span className="text-[10px] tracking-wider uppercase text-[#7C634F] font-medium">Stock Updates</span>
              </div>
              <div>
                <span className="block text-2xl text-[#1E1916] font-bold">Premium</span>
                <span className="text-[10px] tracking-wider uppercase text-[#7C634F] font-medium">Packaging &amp; Box</span>
              </div>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="md:col-span-6 relative">
            {/* Background decorative sand box */}
            <div className="absolute inset-4 -right-2 -bottom-2 bg-[#EFECE6] -z-10 rounded-2xl"></div>
            
            <div className="overflow-hidden rounded-2xl border border-[#EAE6DF] aspect-[4/5] shadow-sm">
              <img
                src="/assets/aistudio/images_e9ad665f.jpeg"
                alt="Senna & Grace Luxury Handbag Collection"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Floating micro-badge */}
            <div className="absolute -bottom-6 -left-6 bg-white p-5 shadow-xl border border-[#FAF9F6] flex items-center gap-4 rounded-xl hidden sm:flex">
              <div className="bg-[#FAF9F6] p-3 rounded-lg text-[#B39274]">
                <ShieldCheck size={24} />
              </div>
              <div>
                <p className="text-[10px] tracking-[0.2em] uppercase text-[#7C634F] font-bold">Jaminan Keaslian</p>
                <p className="text-xs text-[#1E1916] font-semibold">Tersertifikasi &amp; Garansi Fisik</p>
              </div>
            </div>
          </div>
        </section>

        {/* BRANDS BANNER SECTION */}
        <section id="brands" className="bg-[#FAF9F6] border-t border-[#EAE6DF] py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-12">
              <span className="text-xs tracking-[0.3em] uppercase text-[#B39274] font-semibold block mb-2">
                Curated Luxury Brands
              </span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-[#1E1916]">Koleksi Brand Eksklusif</h2>
                  <div className="w-12 h-0.5 bg-[#B39274] my-3"></div>
                  <p className="text-xs text-[#7C634F] font-normal max-w-xl">
                    Klik pada brand favorit pelanggan Anda untuk menjelajahi katalog terintegrasi real-time kami.
                  </p>
                </div>
                <div className="hidden md:flex items-center gap-3 text-[10px] tracking-widest uppercase text-[#7C634F] font-semibold pb-1">
                  <span>100% Autentik</span>
                  <span>•</span>
                  <span>Garansi Fisik</span>
                  <span>•</span>
                  <span>Stok Real-Time</span>
                </div>
              </div>
            </div>

            {brands.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-[#EAE6DF] max-w-md mx-auto">
                <p className="text-xs text-gray-500 font-medium">Belum ada brand yang ditambahkan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {brands.map((b, idx) => {
                  const coverImage = b.gambar || BRAND_COVER_IMAGES[b.namaBrand] || Object.values(BRAND_COVER_IMAGES)[idx % Object.values(BRAND_COVER_IMAGES).length] || DEFAULT_BRAND_IMAGE;
                  return (
                    <div
                      key={b.id}
                      onClick={() => {
                        if (currentUser) {
                          navigate(`/catalog?brand=${b.id}`);
                        } else {
                          navigate("/login");
                        }
                      }}
                      className="group relative h-80 rounded-2xl overflow-hidden border border-[#EAE6DF] bg-white cursor-pointer hover:shadow-2xl hover:border-[#B39274] transition-all duration-500"
                    >
                      {/* Image Background */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent z-10 transition-opacity duration-300"></div>
                      <img
                        src={coverImage}
                        alt={b.namaBrand}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />

                      {/* Brand Badge in Corner */}
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full shadow-xs z-20">
                        <span className="text-[8px] font-bold tracking-[0.2em] uppercase text-[#B39274]">LUXURY</span>
                      </div>

                      {/* Text Overlay */}
                      <div className="absolute inset-0 p-6 flex flex-col justify-end z-20">
                        <span className="text-[9px] tracking-[0.25em] uppercase text-[#B39274] font-extrabold">
                          ORIGINAL COLLECTION
                        </span>
                        <h3 className="text-lg sm:text-xl text-white font-bold tracking-wide mt-1">
                          {b.namaBrand}
                        </h3>
                        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.2em] text-[#FAF9F6]/80 font-bold mt-2 pt-2 border-t border-white/10 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                          <span>Jelajahi Koleksi</span>
                          <ArrowRight size={10} className="text-[#B39274]" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* WHY SENNA & GRACE SECTION */}
        <section id="about" className="py-20 bg-[#FAF9F6] border-t border-[#EAE6DF]">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
              <span className="text-xs tracking-[0.3em] uppercase text-[#B39274] font-semibold block">Modern Ecosystem</span>
              <h2 className="text-3xl md:text-4xl font-bold text-[#1E1916]">
                Mengapa Memilih Senna &amp; Grace?
              </h2>
              <div className="w-12 h-0.5 bg-[#B39274] mx-auto my-4"></div>
              <p className="text-sm text-[#7C634F] font-normal leading-relaxed">
                Platform digital eksklusif yang menyederhanakan alur penjualan, memangkas waktu pengerjaan admin, serta mempercepat pengiriman pesanan Anda ke end-customer.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-2xl border border-[#EAE6DF] hover:border-[#B39274] transition-all duration-300 flex flex-col space-y-4">
                <div className="bg-[#FAF9F6] text-[#B39274] w-12 h-12 rounded-xl flex items-center justify-center">
                  <ShoppingBag size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#1E1916]">Katalog Real-Time</h3>
                <p className="text-xs text-[#7C634F] leading-relaxed font-normal">
                  Ketersediaan stok tas sankron secara real-time. Tidak ada lagi tumpang tindih pesanan yang dibatalkan.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-[#EAE6DF] hover:border-[#B39274] transition-all duration-300 flex flex-col space-y-4">
                <div className="bg-[#FAF9F6] text-[#B39274] w-12 h-12 rounded-xl flex items-center justify-center">
                  <Award size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#1E1916]">Integrasi Pembayaran</h3>
                <p className="text-xs text-[#7C634F] leading-relaxed font-normal">
                  Simulasi gateway transfer dan verifikasi struk real-time. Begitu Anda melakukan bayar, sistem admin kami langsung menerima notifikasi bukti pembayaran.
                </p>
              </div>

              <div className="bg-white p-8 rounded-2xl border border-[#EAE6DF] hover:border-[#B39274] transition-all duration-300 flex flex-col space-y-4">
                <div className="bg-[#FAF9F6] text-[#B39274] w-12 h-12 rounded-xl flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-[#1E1916]">Otomasi Resi &amp; Logistik</h3>
                <p className="text-xs text-[#7C634F] leading-relaxed font-normal">
                  Admin dapat mengupdate status pengerjaan, menginput nomor resi langsung di dasbor, dan reseller dapat memantau estimasi barang sampai.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - DYNAMIC BRAND LINKS */}
      <footer className="bg-[#1E1916] text-[#EFECE6] py-16 px-6 border-t border-[#342D29]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-sm">
          <div className="md:col-span-2 space-y-4">
            <span className="font-brand text-2xl tracking-[0.2em] uppercase text-white font-bold block">
              senna &amp; grace
            </span>
            <p className="text-xs text-[#B3A69C] leading-relaxed max-w-sm font-light">
              Penyedia layanan pasokan tas branded premium terpercaya untuk reseller di seluruh Indonesia. Keaslian terjamin, kualitas paripurna.
            </p>
            <div className="flex gap-4 pt-2">
              <span className="text-xs text-[#B39274] cursor-pointer hover:underline" onClick={() => navigate("/login-admin")}>
                Portal Secure Admin
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs tracking-[0.15em] uppercase text-white font-bold">Koleksi Brand</h4>
            {brands.length === 0 ? (
              <p className="text-xs text-[#B3A69C] font-light italic">Belum ada brand terdaftar</p>
            ) : (
              <ul className="space-y-2 text-xs text-[#B3A69C] font-light">
                {brands.map((b) => (
                  <li
                    key={b.id}
                    className="hover:text-[#B39274] cursor-pointer transition-colors flex items-center gap-1.5"
                    onClick={() => {
                      if (currentUser) navigate(`/catalog?brand=${b.id}`);
                      else navigate("/login");
                    }}
                  >
                    <span>{b.namaBrand}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="text-xs tracking-[0.15em] uppercase text-white font-bold">Hubungi Kami</h4>
            <p className="text-xs text-[#B3A69C] leading-relaxed font-light">
              Kuningan District, Jakarta Selatan, Indonesia<br />
              Email: partners@sennagrace.com<br />
              Telepon: +62 21 8908 1234
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#342D29] mt-12 pt-8 text-center text-xs text-[#8A7C72] font-light flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Senna &amp; Grace. Hak Cipta Dilindungi.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Syarat &amp; Ketentuan</a>
            <a href="#" className="hover:text-white">Kebijakan Privasi</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
