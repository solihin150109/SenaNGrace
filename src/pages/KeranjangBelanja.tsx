import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import ResellerLayout from "../components/ResellerLayout";
import { 
  Trash2, 
  ShoppingBag, 
  Plus, 
  Minus, 
  CreditCard, 
  ChevronRight, 
  AlertCircle, 
  Sparkles, 
  MapPin, 
  Truck, 
  Info,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { AlamatPengiriman } from "../types";
import { 
  INDONESIA_SHIPPING_DATABASE, 
  calculateRealShippingRates, 
  RealCourierRate, 
  POPULAR_DESTINATIONS,
  lookupDestination 
} from "../data/indonesiaShipping";

export default function KeranjangBelanja() {
  const navigate = useNavigate();
  const { currentUser, cart, updateCartQuantity, removeFromCart, createOrder } = useApp();

  // Redirect unauthenticated user straight to register
  useEffect(() => {
    if (!currentUser) {
      navigate("/register");
    }
  }, [currentUser, navigate]);

  // Form states
  const [alamat, setAlamat] = useState("");
  const [kelurahan, setKelurahan] = useState("");
  const [kecamatan, setKecamatan] = useState("");
  const [kotaKabupaten, setKotaKabupaten] = useState("");
  const [provinsi, setProvinsi] = useState("");
  const [kodePos, setKodePos] = useState("");
  
  const [formError, setFormError] = useState("");
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Real Logistics Integration states
  const [courierRates, setCourierRates] = useState<RealCourierRate[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [selectedRate, setSelectedRate] = useState<RealCourierRate | null>(null);
  const [verifiedDestination, setVerifiedDestination] = useState<string | null>(null);

  // Bag parcel weight calculation
  const totalWeightGrams = cart.reduce((acc, item) => acc + ((item.produk.berat || 1000) * item.jumlah), 0);
  const totalWeightKg = Math.max(1, Math.ceil(totalWeightGrams / 1000));

  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  const totalCartItems = cart.reduce((acc, item) => acc + item.jumlah, 0);
  const totalItemPrice = cart.reduce((acc, item) => acc + (item.produk.hargaSatuan * item.jumlah), 0);
  const biayaLayanan = 25000; // Flat luxury boutique service charge Rp 25.000
  const shippingFee = selectedRate ? selectedRate.price : 0;
  const totalInvoice = totalItemPrice + biayaLayanan + shippingFee;

  // Real-time Indonesian Logistics Rate Calculation & Address Validation
  useEffect(() => {
    if (!provinsi.trim() && !kotaKabupaten.trim()) {
      setCourierRates([]);
      setSelectedRate(null);
      setShippingError(null);
      setVerifiedDestination(null);
      return;
    }

    if (!provinsi.trim() || !kotaKabupaten.trim()) {
      setCourierRates([]);
      setSelectedRate(null);
      setShippingError(null);
      return;
    }

    setLoadingShipping(true);
    const timer = setTimeout(() => {
      const calcResult = calculateRealShippingRates(provinsi, kotaKabupaten, totalWeightGrams);
      if (calcResult.error) {
        setShippingError(calcResult.error);
        setCourierRates([]);
        setSelectedRate(null);
        setVerifiedDestination(null);
      } else {
        setShippingError(null);
        setCourierRates(calcResult.rates);
        setVerifiedDestination(calcResult.destinationName || `${kotaKabupaten}, ${provinsi}`);
        // Maintain selection if already chosen, or pick default
        setSelectedRate(prev => {
          if (prev && calcResult.rates.some(r => r.id === prev.id)) {
            return calcResult.rates.find(r => r.id === prev.id) || calcResult.rates[0];
          }
          return calcResult.rates[0];
        });
      }
      setLoadingShipping(false);
    }, 350);

    return () => clearTimeout(timer);
  }, [provinsi, kotaKabupaten, totalWeightGrams]);

  if (!currentUser) return null;

  // Preset destination filler for rapid evaluation
  const handleApplyPreset = (preset: typeof POPULAR_DESTINATIONS[0]) => {
    setProvinsi(preset.provinsi);
    setKotaKabupaten(preset.kota);
    setKecamatan(preset.kecamatan);
    setKelurahan(preset.kelurahan);
    setKodePos(preset.kodePos);
    setAlamat(preset.alamat);
    setFormError("");
    setShippingError(null);
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (cart.length === 0) {
      setFormError("Keranjang belanja Anda masih kosong.");
      return;
    }

    const hasUnderMin = cart.some((item) => item.jumlah < 1);
    if (hasUnderMin) {
      setFormError("Kuantitas produk tidak boleh kurang dari 1 unit.");
      return;
    }

    if (!alamat || !kelurahan || !kecamatan || !kotaKabupaten || !provinsi || !kodePos) {
      setFormError("Silakan lengkapi seluruh kolom alamat pengiriman.");
      return;
    }

    if (shippingError) {
      setFormError(shippingError);
      return;
    }

    if (!selectedRate) {
      setFormError("Silakan pilih kurir ekspedisi pengiriman yang tersedia.");
      return;
    }

    setSubmitting(true);
    
    setTimeout(async () => {
      const alamatObj: AlamatPengiriman = {
        alamat,
        kelurahan,
        kecamatan,
        kotaKabupaten,
        provinsi,
        kodePos
      };

      const courierStr = `${selectedRate.courier_name} - ${selectedRate.service_name}`;
      const newOrder = await createOrder(alamatObj, courierStr, selectedRate.price);
      setSubmitting(false);

      if (newOrder) {
        // Direct to orders page and trigger instant Duitku payment modal
        navigate("/orders", { state: { justOrderedId: newOrder.id } });
      } else {
        setFormError("Gagal memproses pesanan. Periksa kembali ketersediaan stok produk.");
      }
    }, 600);
  };

  return (
    <ResellerLayout pageTitle="Keranjang Belanja">
      {/* HEADER SECTION */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <span className="text-[10px] tracking-[0.25em] uppercase text-[#B39274] font-bold">Shopping Cart</span>
          <h1 className="text-3xl font-bold tracking-tight text-[#1E1916]">Keranjang Belanja</h1>
          <p className="text-xs text-[#7C634F] font-normal">
            Periksa pesanan tas mewah Anda (minimal 1 unit), tentukan alamat tujuan dengan tarif logistik akurat, dan bayar otomatis via Duitku Gateway.
          </p>
        </div>
      </section>

      {/* CORE WORKSPACE */}
      <section className="flex-grow p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {cart.length === 0 ? (
            <div className="text-center py-24 bg-white border border-[#EAE6DF] rounded-2xl space-y-6">
              <div className="bg-[#FAF9F6] w-16 h-16 rounded-full flex items-center justify-center mx-auto text-[#B39274]">
                <ShoppingBag size={28} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-[#1E1916]">Keranjang Kosong</h3>
                <p className="text-xs text-[#7C634F] max-w-sm mx-auto font-normal leading-relaxed">
                  Anda belum menambahkan tas apa pun ke keranjang reseller Anda. Silakan jelajahi katalog koleksi kami.
                </p>
              </div>
              <button
                onClick={() => navigate("/catalog")}
                className="bg-[#1E1916] text-white text-xs tracking-wider uppercase px-8 py-3.5 hover:bg-[#B39274] hover:text-[#1E1916] transition-colors rounded-lg font-bold"
              >
                Jelajahi Katalog
              </button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT AREA: ITEMS LIST & ADDRESS FORM (col 8) */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* ITEMS LIST */}
                <div className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-[#FAF9F6] border-b border-[#EAE6DF] px-6 py-4 flex justify-between items-center">
                    <h3 className="text-xs tracking-wider uppercase text-[#1E1916] font-bold">
                      Daftar Tas Branded ({cart.length} Produk, Total {totalCartItems} Unit &bull; Estimasi Bobot: {(totalWeightGrams / 1000).toFixed(1)} kg)
                    </h3>
                    <button
                      onClick={() => navigate("/catalog")}
                      className="text-xs text-[#B39274] hover:text-[#1E1916] font-medium"
                    >
                      Tambah Lebih Banyak
                    </button>
                  </div>

                  <div className="divide-y divide-[#EAE6DF]">
                    {cart.map((item) => (
                      <div key={item.produk.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        {/* Image & Title */}
                        <div className="flex gap-4 items-center">
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-[#EAE6DF] bg-[#FAF9F6] shrink-0">
                            <img src={item.produk.gambar} alt={item.produk.namaProduk} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div>
                            <span className="text-[9px] font-mono tracking-wider text-[#B39274] uppercase">{item.produk.SKU}</span>
                            <h4 className="text-xs font-bold text-[#1E1916] line-clamp-1">{item.produk.namaProduk}</h4>
                            <p className="text-xs text-[#7C634F] font-semibold mt-0.5">
                              {formatIDR(item.produk.hargaSatuan)} / unit &bull; <span className="text-[#B39274] font-normal">{item.produk.berat || 1000} gr</span>
                            </p>
                          </div>
                        </div>

                        {/* Controls & Total */}
                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-4 sm:pt-0">
                          {/* Counter */}
                          <div className="flex items-center border border-[#EAE6DF] rounded-lg bg-[#FAF9F6] overflow-hidden h-9">
                            <button
                              onClick={() => updateCartQuantity(item.produk.id, item.jumlah - 1)}
                              disabled={item.jumlah <= 1}
                              className="px-2.5 py-1 text-[#1E1916] hover:bg-[#EAE6DF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              id={`cart-dec-${item.produk.id}`}
                              title={item.jumlah <= 1 ? "Minimal pembelian 1 unit" : "Kurangi kuantitas"}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-9 text-center text-xs font-bold text-[#1E1916]">{item.jumlah}</span>
                            <button
                              onClick={() => updateCartQuantity(item.produk.id, item.jumlah + 1)}
                              disabled={item.jumlah >= item.produk.stok}
                              className="px-2.5 py-1 text-[#1E1916] hover:bg-[#EAE6DF] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                              id={`cart-inc-${item.produk.id}`}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          {/* Item Subtotal */}
                          <div className="text-right min-w-[100px]">
                            <p className="text-xs font-mono text-[#7C634F]">Subtotal</p>
                            <p className="text-xs font-extrabold text-[#1E1916] mt-0.5">{formatIDR(item.produk.hargaSatuan * item.jumlah)}</p>
                          </div>

                          {/* Delete Item */}
                          <button
                            onClick={() => removeFromCart(item.produk.id)}
                            className="p-2 text-[#7C634F] hover:text-[#1E1916] rounded-lg transition-colors cursor-pointer"
                            title="Hapus"
                            id={`cart-del-${item.produk.id}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SHIPPING ADDRESS FORM & REAL LOGISTICS */}
                <div className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs">
                  <div className="bg-[#FAF9F6] border-b border-[#EAE6DF] px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="space-y-0.5">
                      <h3 className="text-xs tracking-wider uppercase text-[#1E1916] font-bold flex items-center gap-2">
                        <span>Alamat Pengiriman (Dropship Logistik)</span>
                        <span className="bg-[#B39274]/15 text-[#B39274] text-[9px] px-2 py-0.5 rounded-full font-bold">Resmi &amp; Akurat</span>
                      </h3>
                      <p className="text-[10px] text-[#7C634F] font-light">
                        Tarif ongkos kirim dihitung langsung sesuai data resmi ekspedisi berdasarkan total berat tas ({totalWeightKg} Kg).
                      </p>
                    </div>

                    {/* Quick presets for evaluation */}
                    <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                      <span className="text-[9px] text-[#7C634F] uppercase font-bold flex items-center gap-1 mr-1">
                        <Sparkles size={11} className="text-[#B39274]" />
                        <span>Isi Cepat:</span>
                      </span>
                      {POPULAR_DESTINATIONS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="text-[9px] font-bold px-2.5 py-1 bg-white hover:bg-[#B39274] hover:text-white text-[#1E1916] border border-[#EAE6DF] rounded-lg transition-colors cursor-pointer"
                        >
                          {preset.kota}
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleCheckout} className="p-6 space-y-5">
                    {/* Top error message */}
                    {formError && (
                      <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-xs flex items-center gap-3 animate-in fade-in">
                        <AlertCircle size={16} className="shrink-0 text-red-600" />
                        <span className="font-medium">{formError}</span>
                      </div>
                    )}

                    {/* Street address */}
                    <div className="space-y-1">
                      <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-bold flex items-center justify-between">
                        <span>Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Apartemen)</span>
                        <span className="text-neutral-400 font-normal">Wajib diisi</span>
                      </label>
                      <textarea
                        value={alamat}
                        onChange={(e) => setAlamat(e.target.value)}
                        placeholder="Cth: Jl. Kemang Raya No. 42B, Gedung Mansion Lt. 3"
                        rows={2}
                        className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#1E1916] rounded-xl transition-all"
                        required
                        id="input-alamat-jalan"
                      />
                    </div>

                    {/* Province & City Selection with Datasets */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Provinsi */}
                      <div className="space-y-1">
                        <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-bold">
                          Provinsi Tujuan
                        </label>
                        <input
                          type="text"
                          list="list-provinces"
                          value={provinsi}
                          onChange={(e) => setProvinsi(e.target.value)}
                          placeholder="Pilih / ketik Provinsi (Cth: DKI Jakarta, Jawa Barat)"
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#1E1916] rounded-xl transition-all font-medium"
                          required
                          id="input-provinsi"
                        />
                        <datalist id="list-provinces">
                          {INDONESIA_SHIPPING_DATABASE.map(p => (
                            <option key={p.province} value={p.province} />
                          ))}
                        </datalist>
                      </div>

                      {/* Kota/Kabupaten */}
                      <div className="space-y-1">
                        <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-bold">
                          Kota / Kabupaten
                        </label>
                        <input
                          type="text"
                          list="list-cities"
                          value={kotaKabupaten}
                          onChange={(e) => setKotaKabupaten(e.target.value)}
                          placeholder="Pilih / ketik Kota (Cth: Jakarta Selatan, Surabaya)"
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#1E1916] rounded-xl transition-all font-medium"
                          required
                          id="input-kotakabupaten"
                        />
                        <datalist id="list-cities">
                          {INDONESIA_SHIPPING_DATABASE.flatMap(p => p.cities).map(c => (
                            <option key={c.name} value={c.name} />
                          ))}
                        </datalist>
                      </div>
                    </div>

                    {/* Specific Address Alert if Destination NOT FOUND */}
                    {shippingError && (
                      <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs space-y-2 text-amber-900 animate-in fade-in">
                        <div className="flex items-start gap-2.5">
                          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-950">Alamat Pengiriman Belum Ditemukan</p>
                            <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">
                              {shippingError}
                            </p>
                          </div>
                        </div>
                        <div className="pt-1 flex flex-wrap gap-2 items-center text-[10px]">
                          <span className="font-semibold text-amber-900">Rekomendasi Kota Terdekat:</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProvinsi("DKI Jakarta");
                              setKotaKabupaten("Jakarta Selatan");
                              setKecamatan("Mampang Prapatan");
                            }}
                            className="bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            DKI Jakarta - Jakarta Selatan
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProvinsi("Jawa Barat");
                              setKotaKabupaten("Bandung");
                              setKecamatan("Coblong");
                            }}
                            className="bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            Jawa Barat - Bandung
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setProvinsi("Jawa Timur");
                              setKotaKabupaten("Surabaya");
                              setKecamatan("Tegalsari");
                            }}
                            className="bg-white border border-amber-300 text-amber-900 px-2 py-0.5 rounded font-bold hover:bg-amber-100 cursor-pointer"
                          >
                            Jawa Timur - Surabaya
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Validated Destination confirmation badge */}
                    {verifiedDestination && !shippingError && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-bold">Wilayah Terverifikasi: </span>
                            <span>{verifiedDestination}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-200/80 text-emerald-950 font-bold px-2 py-0.5 rounded-full font-mono">
                          Ongkir Tersedia
                        </span>
                      </div>
                    )}

                    {/* Kecamatan, Kelurahan & Postal Code */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-bold">Kecamatan</label>
                        <input
                          type="text"
                          value={kecamatan}
                          onChange={(e) => setKecamatan(e.target.value)}
                          placeholder="Cth: Mampang Prapatan"
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#1E1916] rounded-xl transition-all"
                          required
                          id="input-kecamatan"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-bold">Kelurahan / Desa</label>
                        <input
                          type="text"
                          value={kelurahan}
                          onChange={(e) => setKelurahan(e.target.value)}
                          placeholder="Cth: Bangka"
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#1E1916] rounded-xl transition-all"
                          required
                          id="input-kelurahan"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] tracking-wider uppercase text-[#7C634F] font-bold">Kode Pos</label>
                        <input
                          type="text"
                          value={kodePos}
                          onChange={(e) => setKodePos(e.target.value)}
                          placeholder="Cth: 12730"
                          className="w-full px-4 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:ring-1 focus:ring-[#1E1916] rounded-xl transition-all font-mono"
                          required
                          id="input-kodepos"
                        />
                      </div>
                    </div>

                    {/* REAL-TIME COURIER RATES CALCULATED ACCURATELY */}
                    <div className="space-y-3 pt-4 border-t border-[#EAE6DF]">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <span className="text-[10px] tracking-wider uppercase text-[#7C634F] font-bold flex items-center gap-1.5">
                          <Truck size={15} className="text-[#B39274]" />
                          <span>Pilihan Ekspedisi Logistik Resmi ({totalWeightKg} Kg)</span>
                        </span>
                        <span className="text-[9px] text-[#7C634F] font-mono bg-[#FAF9F6] border border-[#EAE6DF] px-2.5 py-1 rounded-full">
                          Asal: Hub Logistik Jakarta Barat
                        </span>
                      </div>

                      {loadingShipping ? (
                        <div className="py-8 border border-dashed border-[#EAE6DF] rounded-2xl flex flex-col items-center justify-center gap-2 bg-[#FAF9F6]">
                          <span className="w-6 h-6 border-2 border-[#1E1916] border-t-transparent rounded-full animate-spin"></span>
                          <span className="text-xs text-[#7C634F] font-semibold">Menghitung tarif resmi berdasarkan bobot tas &amp; rute tujuan...</span>
                        </div>
                      ) : !provinsi || !kotaKabupaten ? (
                        <div className="py-6 px-5 border border-dashed border-[#EAE6DF] rounded-2xl text-center bg-[#FAF9F6] flex flex-col items-center justify-center gap-1.5">
                          <MapPin size={22} className="text-[#B3A69C]" />
                          <p className="text-xs text-[#1E1916] font-bold">Menunggu Input Alamat Tujuan</p>
                          <p className="text-[10px] text-[#7C634F] max-w-sm leading-relaxed">
                            Masukkan Provinsi dan Kota/Kabupaten di atas untuk memuat tarif ongkos kirim resmi (JNE, SiCepat, J&amp;T) sesuai rute sebenarnya.
                          </p>
                        </div>
                      ) : courierRates.length === 0 ? (
                        <div className="py-5 px-5 border border-red-200 bg-red-50/50 rounded-2xl text-center space-y-1">
                          <p className="text-xs text-red-800 font-bold">Tidak ada opsi pengiriman untuk alamat ini</p>
                          <p className="text-[10px] text-red-600">Mohon perbaiki nama Kota/Kabupaten dan Provinsi di atas.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {courierRates.map((rate) => {
                            const isSelected = selectedRate?.id === rate.id;
                            return (
                              <button
                                key={rate.id}
                                type="button"
                                onClick={() => setSelectedRate(rate)}
                                className={`p-4 border rounded-2xl text-left flex justify-between items-start transition-all cursor-pointer ${
                                  isSelected
                                    ? "border-[#1E1916] bg-[#1E1916] text-white shadow-md ring-2 ring-[#B39274]"
                                    : "border-[#EAE6DF] hover:border-gray-400 bg-[#FAF9F6] text-[#1E1916]"
                                }`}
                                id={`courier-opt-${rate.id}`}
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base">{rate.icon}</span>
                                    <span className={`text-xs font-bold ${isSelected ? "text-white" : "text-[#1E1916]"}`}>
                                      {rate.courier_name}
                                    </span>
                                  </div>
                                  <p className={`text-[10px] font-semibold ${isSelected ? "text-white/80" : "text-[#7C634F]"}`}>
                                    {rate.service_name}
                                  </p>
                                  <p className={`text-[9px] ${isSelected ? "text-[#B39274]" : "text-[#B39274]"}`}>
                                    Estimasi: {rate.duration}
                                  </p>
                                  <p className={`text-[9px] font-mono ${isSelected ? "text-white/60" : "text-neutral-400"}`}>
                                    {rate.breakdown}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className={`text-xs font-mono font-extrabold ${isSelected ? "text-[#FAF9F6]" : "text-[#1E1916]"}`}>
                                    {formatIDR(rate.price)}
                                  </p>
                                  {isSelected && (
                                    <span className="inline-block mt-2 text-[9px] bg-[#B39274] text-[#1E1916] px-2 py-0.5 rounded-full font-bold">
                                      Terpilih
                                    </span>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Hidden submit trigger so hitting enter submits the entire flow */}
                    <button type="submit" className="hidden" />
                  </form>
                </div>
              </div>

              {/* RIGHT AREA: BILLING SUMMARY (col 4) */}
              <div className="lg:col-span-4 bg-white border border-[#EAE6DF] rounded-2xl p-6 space-y-6 shadow-sm sticky top-24">
                <div className="border-b border-[#EAE6DF] pb-4">
                  <span className="text-[9px] uppercase tracking-widest text-[#B39274] font-bold block mb-0.5">Order Breakdown</span>
                  <h3 className="text-base font-bold text-[#1E1916]">Ringkasan Pembayaran</h3>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between text-[#7C634F]">
                    <span>Total Harga ({totalCartItems} Tas Branded)</span>
                    <span className="font-bold text-[#1E1916] font-mono">{formatIDR(totalItemPrice)}</span>
                  </div>
                  <div className="flex justify-between text-[#7C634F]">
                    <span>Biaya Layanan &amp; Asuransi QC</span>
                    <span className="font-bold text-[#1E1916] font-mono">{formatIDR(biayaLayanan)}</span>
                  </div>
                  <div className="flex justify-between text-[#7C634F]">
                    <span>Ongkos Kirim Logistik</span>
                    <span className="font-bold text-[#1E1916] font-mono">
                      {selectedRate ? formatIDR(selectedRate.price) : "Menunggu Alamat..."}
                    </span>
                  </div>
                  
                  <div className="border-t border-[#EAE6DF] pt-4 flex justify-between items-center text-[#1E1916]">
                    <div>
                      <span className="font-extrabold text-sm block">Total Tagihan</span>
                      <span className="text-[10px] text-[#7C634F]">Termasuk PPN &amp; Garansi 2 Thn</span>
                    </div>
                    <span className="text-lg font-black text-[#1E1916] font-mono">{formatIDR(totalInvoice)}</span>
                  </div>
                </div>

                {/* Gateway Integration Guarantee Banner */}
                <div className="bg-emerald-50/80 border border-emerald-200 p-3.5 rounded-xl space-y-1.5 text-emerald-950">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-900">
                    <CheckCircle2 size={14} className="text-emerald-700" />
                    <span>Integrasi Duitku Gateway</span>
                  </div>
                  <p className="text-[10px] text-emerald-800 leading-relaxed font-normal">
                    Setelah checkout, Anda dapat langsung membayar via <strong>QRIS</strong> atau <strong>Virtual Account</strong>. Sistem akan <strong>otomatis memverifikasi status pembayaran</strong> sehingga admin langsung memproses packing tanpa perlu validasi manual.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={submitting || Boolean(shippingError) || !selectedRate}
                  className="w-full h-12 bg-[#1E1916] text-white text-xs tracking-wider uppercase font-bold flex items-center justify-center gap-2 rounded-xl hover:bg-[#B39274] hover:text-[#1E1916] disabled:bg-neutral-300 disabled:cursor-not-allowed transition-all shadow-md cursor-pointer"
                  id="btn-pay-cart"
                >
                  <CreditCard size={15} />
                  <span>{submitting ? "Memproses Order..." : "Checkout & Bayar Sekarang"}</span>
                </button>

                <div className="text-center">
                  <span className="text-[9px] text-[#B3A69C] uppercase tracking-widest font-mono">
                    senna &amp; grace automated dropship ledger
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </section>
    </ResellerLayout>
  );
}

