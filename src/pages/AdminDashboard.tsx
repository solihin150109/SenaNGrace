import React, { useMemo, useState } from "react";
import { useApp } from "../context/AppContext";
import AdminLayout from "../components/AdminLayout";
import { useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Users,
  Package,
  CheckCircle,
  AlertTriangle,
  Award,
  Clock,
  UserCheck,
  ShoppingBag,
  DollarSign,
  X,
  Store,
  Phone,
  Search,
  Check
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";
import { User } from "../types";

export default function AdminDashboard() {
  const { orders, products, users, brands, updateUserByAdmin } = useApp();
  const navigate = useNavigate();

  // Local state for reseller search and level override modal
  const [resellerSearch, setResellerSearch] = useState("");
  const [selectedReseller, setSelectedReseller] = useState<User | null>(null);
  const [customLevel, setCustomLevel] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // 1. KPI Calculations
  const resellers = useMemo(() => {
    return users.filter((u) => u.role === "user");
  }, [users]);

  // Total sales: sum of totalTagihan of paid or processed/sent orders
  const totalOmzet = useMemo(() => {
    return orders
      .filter((o) => o.status !== "Menunggu Pembayaran")
      .reduce((sum, o) => sum + o.totalTagihan, 0);
  }, [orders]);

  const activeOrdersCount = useMemo(() => {
    return orders.filter((o) => o.status === "Dibayar" || o.status === "Diproses" || o.status === "Dikirim").length;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stok <= 10);
  }, [products]);

  // Format IDR Currency
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  // 2. Reseller Statistics & Level Audit calculations
  const resellerListWithStats = useMemo(() => {
    return resellers.map((r) => {
      // Find orders completed/processed for this reseller
      const resellerOrders = orders.filter((o) => o.userId === r.id && o.status !== "Menunggu Pembayaran");
      
      const totalOrders = resellerOrders.length;

      // Calculate bags sold
      const totalBagsSold = resellerOrders.reduce((sum, o) => {
        return sum + o.details.reduce((sub, det) => sub + det.jumlah, 0);
      }, 0);

      // Calculate total revenue generated
      const totalRevenue = resellerOrders.reduce((sum, o) => sum + o.totalTagihan, 0);

      // Level kemitraan: 50 pemesanan "Silver", 100 pemesanan "Gold", 200 pemesanan "Premium"
      let autoLevel = "Bronze";
      if (totalOrders >= 200) {
        autoLevel = "Premium";
      } else if (totalOrders >= 100) {
        autoLevel = "Gold";
      } else if (totalOrders >= 50) {
        autoLevel = "Silver";
      }

      const currentLevel = (r as any).customTier || autoLevel;

      return {
        ...r,
        totalOrders,
        totalBagsSold,
        totalRevenue,
        autoLevel,
        currentLevel
      };
    });
  }, [resellers, orders]);

  // Filtered Reseller List
  const filteredResellerList = useMemo(() => {
    if (!resellerSearch.trim()) return resellerListWithStats;
    const q = resellerSearch.toLowerCase().trim();
    return resellerListWithStats.filter(
      (r) =>
        r.nama.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        (r.namaTokoReseller && r.namaTokoReseller.toLowerCase().includes(q))
    );
  }, [resellerListWithStats, resellerSearch]);

  // 3. Recharts sales timeline data (grouped by date)
  const chartSalesData = useMemo(() => {
    const dailyMap: { [key: string]: number } = {};
    
    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
      dailyMap[dateStr] = 0;
    }

    orders
      .filter((o) => o.status !== "Menunggu Pembayaran")
      .forEach((o) => {
        const dStr = new Date(o.tanggal).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        if (dailyMap[dStr] !== undefined) {
          dailyMap[dStr] += o.totalTagihan;
        } else {
          dailyMap[dStr] = o.totalTagihan;
        }
      });

    return Object.keys(dailyMap).map((key) => ({
      name: key,
      "Total Penjualan": dailyMap[key]
    }));
  }, [orders]);

  // 4. Recharts Brand distribution data
  const chartBrandData = useMemo(() => {
    return brands.map((b) => {
      const brandProducts = products.filter((p) => p.brandId === b.id);
      const stockSum = brandProducts.reduce((sum, p) => sum + p.stok, 0);
      return {
        name: b.namaBrand,
        "Jumlah Produk": brandProducts.length,
        "Total Stok": stockSum
      };
    });
  }, [brands, products]);

  // Handle open override tier modal
  const handleOpenOverride = (reseller: User) => {
    setSelectedReseller(reseller);
    setCustomLevel((reseller as any).customTier || "");
    setIsModalOpen(true);
  };

  // Submit override tier
  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReseller) return;

    updateUserByAdmin(selectedReseller.id, {
      customTier: customLevel || undefined
    } as any);

    triggerToast(`Level kemitraan untuk ${selectedReseller.nama} berhasil diperbarui.`);
    setIsModalOpen(false);
    setSelectedReseller(null);
  };

  return (
    <AdminLayout pageTitle="Admin Dashboard">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12100E] text-[#FAF9F6] border border-[#B39274]/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#B39274] p-1.5 rounded-full text-[#1E1916]">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER COCKPIT */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B39274] font-bold">Executive Cockpit</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1916]">Ringkasan Ekosistem Dropship</h1>
            <p className="text-xs text-[#7C634F] font-normal">
              Memonitor perputaran kas, performa mitra reseller, ketersediaan stok produk, dan verifikasi order.
            </p>
          </div>
          
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 bg-green-50 border border-green-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>Portal Aktif</span>
            </span>
            <span className="inline-flex items-center gap-1.5 bg-[#FAF9F6] border border-[#EAE6DF] px-3 py-1.5 rounded-full text-[10px] font-medium text-[#7C634F]">
              <Clock size={12} className="text-[#B39274]" />
              <span>{new Date().toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span>
            </span>
          </div>
        </div>
      </section>

      {/* 2. KPI GRID METRICS */}
      <section className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* STAT 1: TOTAL REVENUE */}
          <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:border-[#1E1916] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold">Total Omzet Penjualan</span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1916]">{formatIDR(totalOmzet)}</p>
              <div className="flex items-center gap-1 text-[10px] text-green-600 font-bold">
                <TrendingUp size={11} />
                <span>Transaksi Terverifikasi</span>
              </div>
            </div>
            <div className="w-11 h-11 bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl flex items-center justify-center text-[#B39274] shrink-0">
              <DollarSign size={20} />
            </div>
          </div>

          {/* STAT 2: ACTIVE RESELLERS */}
          <div className="bg-white border border-[#EAE6DF] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:border-[#1E1916] transition-colors">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold">Mitra Reseller</span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1916]">{resellers.length} Toko</p>
              <div className="flex items-center gap-1 text-[10px] text-blue-600 font-bold">
                <Users size={11} />
                <span>Terdaftar &amp; Terverifikasi</span>
              </div>
            </div>
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
              <Users size={20} />
            </div>
          </div>

          {/* STAT 3: ACTIVE PENDING ORDERS */}
          <div 
            onClick={() => navigate("/admin-orders")}
            className="bg-white border border-[#EAE6DF] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:border-[#B39274] cursor-pointer transition-colors"
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold">Pesanan Aktif</span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1916]">{activeOrdersCount} Order</p>
              <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                <CheckCircle size={11} className="text-amber-500" />
                <span>Diproses / Menunggu Resi</span>
              </div>
            </div>
            <div className="w-11 h-11 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
              <ShoppingBag size={20} />
            </div>
          </div>

          {/* STAT 4: LOW STOCK ALERT */}
          <div 
            onClick={() => navigate("/admin-products")}
            className="bg-white border border-[#EAE6DF] rounded-2xl p-5 flex items-center justify-between shadow-xs hover:border-[#1E1916] cursor-pointer transition-colors"
          >
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-widest text-[#7C634F] font-bold">Limit Stok Kritis</span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-[#1E1916]">{lowStockProducts.length} Tas</p>
              <div className={`flex items-center gap-1 text-[10px] font-bold ${lowStockProducts.length > 0 ? "text-amber-700" : "text-green-600"}`}>
                <AlertTriangle size={11} />
                <span>{lowStockProducts.length > 0 ? "Stok \u2264 10 unit" : "Stok Aman (> 10)"}</span>
              </div>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${lowStockProducts.length > 0 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-600"}`}>
              <Package size={20} />
            </div>
          </div>

        </div>
      </section>

      {/* 3. CHARTS DATA VISUALIZATION */}
      <section className="px-4 sm:px-6 lg:px-8 pb-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* CHART A: SALES TREND OVERTIME */}
          <div className="lg:col-span-7 bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-[#1E1916]">Grafik Penjualan Harian</h3>
                <p className="text-[11px] text-[#7C634F]">Omzet transaksi dropship reseller 7 hari terakhir</p>
              </div>
              <span className="text-[10px] bg-[#FAF9F6] border border-[#EAE6DF] px-2 py-0.5 rounded font-bold text-[#B39274] uppercase">Live</span>
            </div>
            
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartSalesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B39274" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#B39274" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE6DF" />
                  <XAxis dataKey="name" stroke="#7C634F" fontSize={10} tickLine={false} />
                  <YAxis stroke="#7C634F" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `Rp${v / 1000000}M`} />
                  <Tooltip formatter={(value: any) => [formatIDR(value), "Penjualan"]} />
                  <Area type="monotone" dataKey="Total Penjualan" stroke="#B39274" strokeWidth={2.5} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART B: BRAND INVENTORY DENSITY */}
          <div className="lg:col-span-5 bg-white border border-[#EAE6DF] rounded-2xl p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-[#1E1916]">Distribusi Stok Per Brand</h3>
              <p className="text-[11px] text-[#7C634F]">Kapasitas katalog dan unit stok di gudang</p>
            </div>

            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartBrandData.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DF" vertical={false} />
                  <XAxis dataKey="name" stroke="#7C634F" fontSize={9} tickLine={false} />
                  <YAxis stroke="#7C634F" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Jumlah Produk" fill="#B39274" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Total Stok" fill="#12100E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </section>

      {/* 4. RESELLER PARTNERSHIP TIERS & AUDIT TABLE */}
      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 sm:p-6 border-b border-[#EAE6DF] bg-[#FAF9F6] flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-[#1E1916] flex items-center gap-2">
                  <Award className="text-[#B39274]" size={18} />
                  <span>Audit Kemitraan &amp; Penilaian Level Reseller</span>
                </h3>
                <p className="text-xs text-[#7C634F]">
                  Melihat performa penjualan reseller, jumlah transaksi sukses, dan menetapkan tier kemitraan khusus.
                </p>
              </div>

              {/* Search input */}
              <div className="relative w-full md:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7C634F]" />
                <input
                  type="text"
                  value={resellerSearch}
                  onChange={(e) => setResellerSearch(e.target.value)}
                  placeholder="Cari reseller atau toko..."
                  className="w-full pl-8.5 pr-4 py-2 bg-white border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-medium"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF9F6] text-[10px] tracking-widest uppercase text-[#7C634F] border-b border-[#EAE6DF] font-bold">
                    <th className="py-3.5 px-5">Mitra Reseller &amp; Toko</th>
                    <th className="py-3.5 px-4 text-center">Total Pemesanan</th>
                    <th className="py-3.5 px-4 text-center">Tas Terjual</th>
                    <th className="py-3.5 px-4 text-right">Omzet Transaksi</th>
                    <th className="py-3.5 px-4 text-center">Level Sistem</th>
                    <th className="py-3.5 px-4 text-center">Level Aktif</th>
                    <th className="py-3.5 px-5 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE6DF]">
                  {filteredResellerList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-[#7C634F]">
                        Tidak ada data mitra reseller yang sesuai.
                      </td>
                    </tr>
                  ) : (
                    filteredResellerList.map((res) => {
                      const getTierStyle = (tier: string) => {
                        const t = tier.toLowerCase();
                        if (t.includes("premium")) {
                          return "bg-[#12100E] text-[#B39274] border-[#B39274]";
                        } else if (t.includes("gold")) {
                          return "bg-amber-50 text-amber-800 border-amber-300";
                        } else if (t.includes("silver")) {
                          return "bg-slate-100 text-slate-800 border-slate-300";
                        }
                        return "bg-[#FAF9F6] text-[#7C634F] border-[#EAE6DF]";
                      };

                      return (
                        <tr key={res.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                          <td className="py-3.5 px-5">
                            <p className="font-bold text-[#1E1916] text-xs">{res.nama}</p>
                            <p className="text-[10px] text-[#7C634F] font-mono">{res.email}</p>
                            {res.namaTokoReseller && (
                              <p className="text-[10px] text-[#B39274] font-semibold flex items-center gap-1 mt-0.5">
                                <Store size={10} /> {res.namaTokoReseller}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-bold text-gray-900 font-mono">
                            {res.totalOrders} order
                          </td>
                          <td className="py-3.5 px-4 text-center font-medium text-gray-700">
                            {res.totalBagsSold} pcs
                          </td>
                          <td className="py-3.5 px-4 text-right font-bold text-[#1E1916] font-mono">
                            {formatIDR(res.totalRevenue)}
                          </td>
                          <td className="py-3.5 px-4 text-center text-[10px] text-gray-500 font-semibold">
                            {res.autoLevel}
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getTierStyle(res.currentLevel)}`}>
                              {res.currentLevel}
                            </span>
                          </td>
                          <td className="py-3.5 px-5 text-center">
                            <button
                              onClick={() => handleOpenOverride(res)}
                              className="inline-flex items-center gap-1.5 bg-[#12100E] text-white hover:bg-[#B39274] hover:text-[#1E1916] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer shadow-xs"
                            >
                              <UserCheck size={11} />
                              <span>Ubah Tier</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 5. TIER OVERRIDE MODAL */}
      {isModalOpen && selectedReseller && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsModalOpen(false);
              setSelectedReseller(null);
            }
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
        >
          <div 
            className="bg-white rounded-3xl overflow-hidden max-w-sm w-full border border-[#EAE6DF] shadow-2xl animate-in scale-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#12100E] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#B39274] font-bold block mb-0.5">
                  Partnership Audit
                </span>
                <h3 className="text-base font-bold text-white">Beri Penilaian Kemitraan</h3>
              </div>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedReseller(null);
                }}
                className="p-1.5 text-[#B3A69C] hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveOverride} className="p-5 space-y-3.5">
              <div className="bg-[#FAF9F6] border border-[#EAE6DF] p-3 rounded-xl text-xs space-y-1">
                <p className="text-[#7C634F]">Reseller: <strong className="text-gray-900">{selectedReseller.nama}</strong></p>
                <p className="text-[#7C634F]">Email: <span className="font-mono text-gray-900">{selectedReseller.email}</span></p>
                <p className="text-[#7C634F]">Total Pemesanan: <strong className="text-gray-900">{(selectedReseller as any).totalOrders || 0} Order</strong> ({(selectedReseller as any).totalBagsSold || 0} Tas)</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold block">
                  Tetapkan Level Kemitraan (Tier Override)
                </label>
                <select
                  value={customLevel}
                  onChange={(e) => setCustomLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all cursor-pointer font-semibold"
                >
                  <option value="">Gunakan Kalkulasi Otomatis Sistem</option>
                  <option value="Bronze">Bronze (&lt; 50 Pemesanan)</option>
                  <option value="Silver">Silver (50 Pemesanan)</option>
                  <option value="Gold">Gold (100 Pemesanan)</option>
                  <option value="Premium">Premium (200 Pemesanan)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedReseller(null);
                  }}
                  className="flex-1 py-2.5 border border-[#EAE6DF] text-xs font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#12100E] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#B39274] hover:text-[#1E1916] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check size={14} />
                  <span>Simpan Tier</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
