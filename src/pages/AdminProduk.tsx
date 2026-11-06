import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import AdminLayout from "../components/AdminLayout";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertTriangle,
  Image as ImageIcon,
  Package,
  Boxes,
  AlertCircle,
  Filter,
  CheckCircle2,
  Tag
} from "lucide-react";
import { Produk } from "../types";

export default function AdminProduk() {
  const { products, brands, addProduct, updateProduct, deleteProduct } = useApp();

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrandFilter, setSelectedBrandFilter] = useState("ALL");
  const [stockFilter, setStockFilter] = useState<"ALL" | "SAFE" | "LOW" | "OUT">("ALL");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produk | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form Fields State
  const [namaProduk, setNamaProduk] = useState("");
  const [SKU, setSKU] = useState("");
  const [hargaSatuan, setHargaSatuan] = useState<number | "">("");
  const [stok, setStok] = useState<number | "">("");
  const [brandId, setBrandId] = useState("");
  const [gambar, setGambar] = useState("");
  const [garansi, setGaransi] = useState("2 Tahun Internasional");
  const [berat, setBerat] = useState<number | "">(1200);
  const [estimasiPengiriman, setEstimasiPengiriman] = useState("2-3 Hari Kerja");
  const [deskripsi, setDeskripsi] = useState("");

  const [validationError, setValidationError] = useState("");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Preset luxury bag photos
  const MOCK_BAG_IMAGES = [
    { name: "Louis Vuitton Red", url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&q=80" },
    { name: "Chanel Quilted Black", url: "https://images.unsplash.com/photo-1598532187856-3c2243d5f0cc?auto=format&fit=crop&w=600&q=80" },
    { name: "Hermes Birkin Orange", url: "https://images.unsplash.com/photo-1566150905458-1bf1fc15a4a5?auto=format&fit=crop&w=600&q=80" },
    { name: "Gucci Marmont Velvet", url: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80" },
    { name: "Charles & Keith Dark Handbag", url: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80" },
    { name: "Prada Nylon Bucket", url: "https://images.unsplash.com/photo-1600857062241-98e5dba7f214?auto=format&fit=crop&w=600&q=80" }
  ];

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setValidationError("");
    setNamaProduk("");
    setSKU("");
    setHargaSatuan("");
    setStok("");
    setBrandId(brands[0]?.id || "");
    setGambar(MOCK_BAG_IMAGES[0].url);
    setGaransi("2 Tahun Internasional");
    setBerat(1200);
    setEstimasiPengiriman("2-3 Hari Kerja");
    setDeskripsi("");
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (p: Produk) => {
    setEditingProduct(p);
    setValidationError("");
    setNamaProduk(p.namaProduk);
    setSKU(p.SKU);
    setHargaSatuan(p.hargaSatuan);
    setStok(p.stok);
    setBrandId(p.brandId);
    setGambar(p.gambar);
    setGaransi(p.garansi || "2 Tahun Internasional");
    setBerat(p.berat || 1200);
    setEstimasiPengiriman(p.estimasiPengiriman || "2-3 Hari Kerja");
    setDeskripsi(p.deskripsi || "");
    setShowModal(true);
  };

  // Handle delete
  const handleRequestDelete = (id: string) => {
    setDeletingProductId(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      triggerToast("Produk tas berhasil dihapus dari sistem.");
      setShowDeleteConfirm(false);
      setDeletingProductId(null);
    }
  };

  // Format IDR Currency
  const formatIDR = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0
    }).format(price);
  };

  // Form submission handler
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!namaProduk.trim() || !SKU.trim() || hargaSatuan === "" || stok === "" || !brandId || !gambar || !deskripsi.trim()) {
      setValidationError("Silakan lengkapi semua isian wajib.");
      return;
    }

    if (Number(hargaSatuan) <= 0) {
      setValidationError("Harga harus bernilai positif.");
      return;
    }

    if (Number(stok) < 1) {
      setValidationError("Stok minimal 1 unit.");
      return;
    }

    const payload = {
      namaProduk: namaProduk.trim(),
      SKU: SKU.trim().toUpperCase(),
      hargaSatuan: Number(hargaSatuan),
      stok: Number(stok),
      brandId,
      gambar,
      garansi,
      berat: Number(berat) || 1000,
      estimasiPengiriman,
      deskripsi: deskripsi.trim()
    };

    if (editingProduct) {
      updateProduct({
        ...payload,
        id: editingProduct.id
      });
      triggerToast(`Produk "${namaProduk}" berhasil diperbarui.`);
    } else {
      addProduct(payload);
      triggerToast(`Produk "${namaProduk}" berhasil ditambahkan ke katalog.`);
    }

    setShowModal(false);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const matchSearch =
        !searchQuery.trim() ||
        p.namaProduk.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.SKU.toLowerCase().includes(searchQuery.toLowerCase().trim());

      // Brand filter
      const matchBrand = selectedBrandFilter === "ALL" || p.brandId === selectedBrandFilter;

      // Stock filter
      let matchStock = true;
      if (stockFilter === "SAFE") matchStock = p.stok > 10;
      if (stockFilter === "LOW") matchStock = p.stok > 0 && p.stok <= 10;
      if (stockFilter === "OUT") matchStock = p.stok === 0;

      return matchSearch && matchBrand && matchStock;
    });
  }, [products, searchQuery, selectedBrandFilter, stockFilter]);

  // Stock summary counts
  const stockSummary = useMemo(() => {
    const total = products.length;
    const low = products.filter((p) => p.stok > 0 && p.stok <= 10).length;
    const out = products.filter((p) => p.stok === 0).length;
    const safe = products.filter((p) => p.stok > 10).length;
    return { total, low, out, safe };
  }, [products]);

  return (
    <AdminLayout pageTitle="Manajemen Produk">
      
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#12100E] text-[#FAF9F6] border border-[#B39274]/50 px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="bg-[#B39274] p-1.5 rounded-full text-[#1E1916]">
            <Check size={14} className="stroke-[3]" />
          </div>
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER ROW */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-6 lg:py-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.25em] uppercase text-[#B39274] font-bold">Inventory Master</span>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1916]">Katalog Produk Tas</h1>
            <p className="text-xs text-[#7C634F] font-normal">
              Kelola stok tas mewah original, atur harga reseller, dan perbarui spesifikasi produk.
            </p>
          </div>

          <button
            onClick={handleOpenCreate}
            className="bg-[#12100E] hover:bg-[#B39274] hover:text-[#1E1916] text-white text-xs tracking-wider uppercase font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition-all self-start sm:self-auto cursor-pointer shadow-sm hover:shadow-md"
            id="btn-add-product"
          >
            <Plus size={16} />
            <span>Tambah Produk</span>
          </button>
        </div>
      </section>

      {/* QUICK METRICS BAR */}
      <section className="bg-[#FAF9F6] border-b border-[#EAE6DF] px-6 py-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setStockFilter("ALL")}
            className={`p-3 rounded-xl border text-left transition-all ${
              stockFilter === "ALL"
                ? "bg-white border-[#1E1916] shadow-xs"
                : "bg-white/60 border-[#EAE6DF] hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#7C634F]">Semua Produk</span>
              <Boxes size={14} className="text-[#7C634F]" />
            </div>
            <p className="text-lg font-bold text-[#1E1916] mt-1">{stockSummary.total} SKU</p>
          </button>

          <button
            onClick={() => setStockFilter("SAFE")}
            className={`p-3 rounded-xl border text-left transition-all ${
              stockFilter === "SAFE"
                ? "bg-white border-[#1E1916] shadow-xs"
                : "bg-white/60 border-[#EAE6DF] hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#1E1916]">Stok Aman (&gt; 10)</span>
              <CheckCircle2 size={14} className="text-[#B39274]" />
            </div>
            <p className="text-lg font-bold text-[#1E1916] mt-1">{stockSummary.safe} Item</p>
          </button>

          <button
            onClick={() => setStockFilter("LOW")}
            className={`p-3 rounded-xl border text-left transition-all ${
              stockFilter === "LOW"
                ? "bg-white border-amber-500 shadow-xs"
                : "bg-white/60 border-[#EAE6DF] hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-amber-700">Menipis (&le; 10)</span>
              <AlertTriangle size={14} className="text-amber-500" />
            </div>
            <p className="text-lg font-bold text-amber-800 mt-1">{stockSummary.low} Item</p>
          </button>

          <button
            onClick={() => setStockFilter("OUT")}
            className={`p-3 rounded-xl border text-left transition-all ${
              stockFilter === "OUT"
                ? "bg-white border-neutral-700 shadow-xs"
                : "bg-white/60 border-[#EAE6DF] hover:bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#7C634F]">Habis (0)</span>
              <AlertCircle size={14} className="text-[#7C634F]" />
            </div>
            <p className="text-lg font-bold text-[#7C634F] mt-1">{stockSummary.out} Item</p>
          </button>
        </div>
      </section>

      {/* FILTER & SEARCH CONTROLS */}
      <section className="bg-white border-b border-[#EAE6DF] px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#B3A69C]">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari SKU atau nama tas branded..."
              className="w-full pl-9.5 pr-4 py-2 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] placeholder-[#B3A69C] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all"
              id="admin-search-input"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#B3A69C] hover:text-[#1E1916]"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-[#7C634F] shrink-0" />
            <select
              value={selectedBrandFilter}
              onChange={(e) => setSelectedBrandFilter(e.target.value)}
              className="bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] font-semibold rounded-xl px-3 py-2 outline-none focus:border-[#1E1916] cursor-pointer"
            >
              <option value="ALL">Semua Brand ({products.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.namaBrand}
                </option>
              ))}
            </select>

            <span className="text-xs text-[#7C634F] font-mono whitespace-nowrap pl-2">
              {filteredProducts.length} data
            </span>
          </div>
        </div>
      </section>

      {/* PRODUCTS DATA TABLE */}
      <section className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto bg-white border border-[#EAE6DF] rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6] text-[10px] tracking-widest uppercase text-[#7C634F] border-b border-[#EAE6DF] font-bold">
                  <th className="py-3.5 px-5">Produk &amp; SKU</th>
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4 text-right">Harga Reseller</th>
                  <th className="py-3.5 px-4 text-center">Stok</th>
                  <th className="py-3.5 px-4">Garansi &amp; Berat</th>
                  <th className="py-3.5 px-5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE6DF] text-xs">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#7C634F]">
                      <Package size={36} className="mx-auto text-[#B3A69C] mb-2 opacity-50" />
                      <p className="font-semibold text-sm text-[#1E1916]">Tidak ada produk ditemukan</p>
                      <p className="text-xs text-[#7C634F] mt-0.5">Coba ubah kata kunci pencarian atau filter status.</p>
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => {
                    const brand = brands.find((b) => b.id === p.brandId);
                    return (
                      <tr key={p.id} className="hover:bg-[#FAF9F6]/70 transition-colors group">
                        {/* Image, Title, SKU */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#EAE6DF] bg-[#FAF9F6] shrink-0">
                              <img 
                                src={p.gambar} 
                                alt={p.namaProduk} 
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                referrerPolicy="no-referrer" 
                              />
                            </div>
                            <div className="min-w-0 max-w-xs">
                              <p className="font-bold text-[#1E1916] truncate text-xs">{p.namaProduk}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-[#7C634F] bg-[#FAF9F6] border border-[#EAE6DF] px-1.5 py-0.2 rounded font-semibold uppercase">
                                  {p.SKU}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Brand Name */}
                        <td className="py-3.5 px-4 text-[#7C634F] font-semibold">
                          <span className="inline-flex items-center gap-1 bg-[#FAF9F6] border border-[#EAE6DF] px-2.5 py-1 rounded-lg text-[11px] text-[#1E1916]">
                            <Tag size={10} className="text-[#B39274]" />
                            <span>{brand ? brand.namaBrand : "Luxury"}</span>
                          </span>
                        </td>

                        {/* IDR Reseller Price */}
                        <td className="py-3.5 px-4 text-right font-bold text-[#1E1916] font-mono">
                          {formatIDR(p.hargaSatuan)}
                        </td>

                        {/* Stock Units Badge */}
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                            p.stok <= 0
                              ? "bg-stone-100 text-stone-700 border border-stone-300"
                              : p.stok <= 10
                              ? "bg-amber-50 text-amber-800 border border-amber-200"
                              : "bg-[#FAF9F6] text-[#1E1916] border border-[#EAE6DF]"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              p.stok <= 0 ? "bg-stone-400" : p.stok <= 10 ? "bg-amber-500" : "bg-[#B39274]"
                            }`}></span>
                            <span>{p.stok} unit</span>
                          </span>
                        </td>

                        {/* Garansi & Berat */}
                        <td className="py-3.5 px-4 text-[#7C634F] text-[11px]">
                          <p className="truncate max-w-[140px] font-medium">{p.garansi || "2 Tahun"}</p>
                          <p className="text-[10px] text-[#B3A69C]">{p.berat || 1000}g &bull; {p.estimasiPengiriman || "2-3 Hari"}</p>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="p-2 text-[#7C634F] hover:text-[#1E1916] hover:bg-white border border-[#EAE6DF] hover:border-[#1E1916] rounded-lg transition-all cursor-pointer"
                              title="Edit Detail Tas"
                              id={`btn-edit-${p.id}`}
                            >
                              <Pencil size={14} />
                            </button>

                            <button
                              onClick={() => handleRequestDelete(p.id)}
                              className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 border border-[#EAE6DF] hover:border-stone-400 rounded-lg transition-all cursor-pointer"
                              title="Hapus Tas dari Katalog"
                              id={`btn-delete-${p.id}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ADD & EDIT MODAL (DYNAMIC SCROLL, NON-CLIPPED) */}
      {showModal && (
        <div 
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
        >
          <div 
            className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden max-w-2xl w-full border border-[#EAE6DF] shadow-2xl flex flex-col max-h-[90vh] my-auto animate-in scale-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header (Sticky) */}
            <div className="bg-[#12100E] text-white px-6 py-4.5 flex justify-between items-center shrink-0">
              <div>
                <span className="text-[9px] uppercase tracking-widest text-[#B39274] font-bold block mb-0.5">
                  Inventory Master
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-white">
                  {editingProduct ? "Edit Informasi Tas Mewah" : "Tambah Tas Mewah Baru"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#B3A69C] hover:text-white rounded-lg hover:bg-neutral-800 cursor-pointer"
                id="btn-close-product-modal"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form Scrollable */}
            <form onSubmit={handleSaveProduct} id="product-form" className="p-5 sm:p-6 space-y-4.5 overflow-y-auto flex-1">
              {validationError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                  <AlertTriangle size={16} className="shrink-0 text-amber-600" />
                  <span className="font-semibold">{validationError}</span>
                </div>
              )}

              {/* Row 1: Title and SKU */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Nama Tas (Model)</label>
                  <input
                    type="text"
                    value={namaProduk}
                    onChange={(e) => setNamaProduk(e.target.value)}
                    placeholder="Contoh: Capucines BB Leather Pink"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-semibold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">SKU Kode Unik</label>
                  <input
                    type="text"
                    value={SKU}
                    onChange={(e) => setSKU(e.target.value)}
                    placeholder="LV-CP-005"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-mono uppercase"
                    required
                  />
                </div>
              </div>

              {/* Row 2: Brand, Price, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Koleksi Brand</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all cursor-pointer font-semibold"
                    required
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.namaBrand}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Harga Reseller (Rp)</label>
                  <input
                    type="number"
                    value={hargaSatuan}
                    onChange={(e) => setHargaSatuan(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="32500000"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Stok Gudang (Unit)</label>
                  <input
                    type="number"
                    min={1}
                    value={stok}
                    onChange={(e) => setStok(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Row 3: Warranty, Weight, Delivery */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Garansi</label>
                  <input
                    type="text"
                    value={garansi}
                    onChange={(e) => setGaransi(e.target.value)}
                    placeholder="2 Tahun Internasional"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Berat (gram)</label>
                  <input
                    type="number"
                    value={berat}
                    onChange={(e) => setBerat(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="1200"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Estimasi Pengantaran</label>
                  <input
                    type="text"
                    value={estimasiPengiriman}
                    onChange={(e) => setEstimasiPengiriman(e.target.value)}
                    placeholder="2-3 Hari Kerja"
                    className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Photo Area */}
              <div className="space-y-2 pt-1 border-t border-[#EAE6DF]">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Foto Produk Tas</label>
                  <span className="text-[9px] text-[#B39274] font-semibold">Upload File atau Pilih Preset</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 bg-[#FAF9F6] border border-[#EAE6DF] p-3 rounded-xl">
                  {/* File Upload Selector */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#7C634F] font-semibold block">Upload File Gambar</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            if (typeof reader.result === "string") {
                              setGambar(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full text-[10px] text-gray-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-[#12100E] file:text-white hover:file:bg-[#B39274] hover:file:text-[#1E1916] file:cursor-pointer cursor-pointer"
                    />
                  </div>

                  {/* URL Input */}
                  <div className="space-y-1">
                    <span className="text-[9px] text-[#7C634F] font-semibold block">Atau Input URL</span>
                    <input
                      type="text"
                      value={gambar.startsWith("data:") ? "" : gambar}
                      onChange={(e) => setGambar(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-2.5 py-1.5 bg-white border border-[#EAE6DF] text-[10px] text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-lg transition-all"
                    />
                  </div>
                </div>

                {/* Preview & Stock presets */}
                <div className="flex items-center gap-3 bg-white border border-[#EAE6DF] p-2.5 rounded-xl">
                  <div className="w-12 h-12 border border-[#EAE6DF] rounded-lg overflow-hidden bg-[#FAF9F6] shrink-0 flex items-center justify-center text-[#B39274]">
                    {gambar ? <img src={gambar} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <ImageIcon size={20} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-[10px] font-semibold text-[#7C634F] mb-1">Preset Tas Mewah Populer:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {MOCK_BAG_IMAGES.map((img) => (
                        <button
                          key={img.name}
                          type="button"
                          onClick={() => setGambar(img.url)}
                          className={`text-[9px] px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                            gambar === img.url ? "bg-[#12100E] text-white border-[#12100E] font-bold" : "bg-[#FAF9F6] text-[#7C634F] border-[#EAE6DF] hover:bg-white"
                          }`}
                        >
                          {img.name.split(" ")[0]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#7C634F] font-bold">Deskripsi Tas Lengkap</label>
                <textarea
                  value={deskripsi}
                  onChange={(e) => setDeskripsi(e.target.value)}
                  placeholder="Deskripsikan material kulit asli, kelengkapan dustbag, box, kartu sertifikat, dsb..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-[#FAF9F6] border border-[#EAE6DF] text-xs text-[#1E1916] focus:outline-none focus:border-[#1E1916] rounded-xl transition-all resize-none"
                  required
                />
              </div>
            </form>

            {/* Modal Footer (Sticky) */}
            <div className="p-4 bg-[#FAF9F6] border-t border-[#EAE6DF] flex justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-[#EAE6DF] hover:bg-white text-[#1E1916] text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                form="product-form"
                className="px-5 py-2.5 bg-[#12100E] text-white text-xs uppercase font-bold tracking-wider rounded-xl hover:bg-[#B39274] hover:text-[#1E1916] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                id="btn-save-product-modal"
              >
                <Check size={14} />
                <span>{editingProduct ? "Simpan Perubahan" : "Masukkan Katalog"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM DIALOG */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl overflow-hidden max-w-sm w-full border border-[#EAE6DF] p-6 space-y-5 shadow-2xl animate-in scale-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="bg-[#FAF9F6] text-[#7C634F] border border-[#EAE6DF] w-12 h-12 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={22} />
              </div>
              <h4 className="text-lg font-bold text-[#1E1916]">Hapus Produk Tas?</h4>
              <p className="text-xs text-[#7C634F] font-normal">
                Produk ini akan dihapus permanen dari etalase katalog reseller.
              </p>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingProductId(null);
                }}
                className="flex-1 py-2.5 border border-[#EAE6DF] hover:bg-gray-50 text-xs font-bold rounded-xl cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-[#12100E] hover:bg-[#B39274] hover:text-[#1E1916] text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
                id="btn-confirm-delete"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
